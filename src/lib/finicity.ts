/**
 * Finicity API Client
 * 
 * This module provides methods for interacting with the Mastercard Finicity API
 * Based on the documentation at: https://developer.mastercard.com/open-banking-us/documentation/
 */

// Types for Finicity API responses
export interface FinicityTokenResponse {
  token: string;
  expires: string;
}

export interface FinicityCustomer {
  id: string;
  username: string;
  createdDate: string;
  type: string;
}

export interface FinicityInstitution {
  id: number;
  name: string;
  logo?: string;
  url?: string;
  oauthEnabled: boolean;
}

export interface FinicityAccount {
  id: string;
  number: string;
  accountNumberDisplay: string;
  name: string;
  type: string;
  status: string;
  balance: number;
  balanceDate: string;
  currency: string;
  institutionId: string;
  createdDate: string;
}

export interface FinicityTransaction {
  id: string;
  amount: number;
  accountId: string;
  customerId: string;
  status: string;
  description: string;
  memo?: string;
  type: string;
  transactionDate: string;
  postedDate: string;
  createdDate: string;
  categorization?: {
    category: string;
    normalizedCategory: string;
  };
}

/**
 * FinicityError class for handling API errors
 */
export class FinicityError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'FinicityError';
    this.status = status;
    this.code = code;
  }
}

/**
 * The main Finicity API client class
 */
export class FinicityClient {
  private apiUrl: string;
  private appKey: string;
  private partnerId: string;
  private partnerSecret: string;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.apiUrl = process.env.FINICITY_API_URL || 'https://api.finicity.com';
    this.appKey = process.env.FINICITY_APP_KEY || '';
    this.partnerId = process.env.FINICITY_PARTNER_ID || '';
    this.partnerSecret = process.env.FINICITY_PARTNER_SECRET || '';

    if (!this.appKey || !this.partnerId || !this.partnerSecret) {
      console.warn('Finicity API credentials not found in environment variables');
    }
  }

  /**
   * Checks if the current token is valid, and gets a new one if needed
   */
  private async ensureValidToken(): Promise<string> {
    const now = new Date();
    
    // If token is null or expired, get a new one
    if (!this.token || !this.tokenExpiry || now >= this.tokenExpiry) {
      await this.generateToken();
    }
    
    return this.token!;
  }

  /**
   * Makes an authenticated request to the Finicity API
   */
  private async makeRequest<T>(
    endpoint: string, 
    method: string = 'GET', 
    body?: any, 
    customHeaders: Record<string, string> = {}
  ): Promise<T> {
    const token = await this.ensureValidToken();
    
    const url = `${this.apiUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Finicity-App-Key': this.appKey,
      'Accept': 'application/json',
      'Finicity-App-Token': token,
      ...customHeaders
    };

    const requestOptions: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };

    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        let errorText = await response.text();
        let errorInfo;
        try {
          errorInfo = JSON.parse(errorText);
        } catch (e) {
          errorInfo = { message: errorText };
        }
        
        throw new FinicityError(
          errorInfo.message || `API error: ${response.status}`,
          response.status,
          errorInfo.code
        );
      }
      
      return await response.json() as T;
    } catch (error) {
      if (error instanceof FinicityError) {
        throw error;
      }
      
      throw new FinicityError(
        `Request failed: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  }

  /**
   * Generates a new access token
   */
  public async generateToken(): Promise<FinicityTokenResponse> {
    const endpoint = '/aggregation/v2/partners/authentication';
    const body = {
      partnerId: this.partnerId,
      partnerSecret: this.partnerSecret
    };
    
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Finicity-App-Key': this.appKey,
          'Accept': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new FinicityError(`Authentication failed: ${response.statusText}`, response.status);
      }
      
      const data = await response.json() as FinicityTokenResponse;
      this.token = data.token;
      
      // Set token expiry to 110 minutes (Finicity tokens last for 2 hours, adding a small buffer)
      this.tokenExpiry = new Date(Date.now() + 110 * 60 * 1000);
      
      return data;
    } catch (error) {
      if (error instanceof FinicityError) {
        throw error;
      }
      
      throw new FinicityError(
        `Authentication failed: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  }

  /**
   * Creates a new customer in the Finicity system
   */
  public async createCustomer(username: string, firstName?: string, lastName?: string): Promise<FinicityCustomer> {
    const endpoint = '/aggregation/v2/customers/testing';
    const body = {
      username
    };
    
    return this.makeRequest<FinicityCustomer>(endpoint, 'POST', body);
  }

  /**
   * Retrieves a customer by ID
   */
  public async getCustomer(customerId: string): Promise<FinicityCustomer> {
    const endpoint = `/aggregation/v2/customers/${customerId}`;
    
    return this.makeRequest<FinicityCustomer>(endpoint);
  }

  /**
   * Retrieves a list of supported financial institutions
   */
  public async getInstitutions(
    search?: string, 
    start: number = 1, 
    limit: number = 25
  ): Promise<{ institutions: FinicityInstitution[], more: boolean }> {
    let endpoint = `/institution/v2/institutions?start=${start}&limit=${limit}`;
    
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`;
    }
    
    return this.makeRequest<{ institutions: FinicityInstitution[], more: boolean }>(endpoint);
  }

  /**
   * Retrieves a specific institution by ID
   */
  public async getInstitution(institutionId: string): Promise<FinicityInstitution> {
    const endpoint = `/institution/v2/institutions/${institutionId}`;
    
    return this.makeRequest<FinicityInstitution>(endpoint);
  }

  /**
   * Retrieves accounts for a customer
   */
  public async getAccounts(customerId: string): Promise<{ accounts: FinicityAccount[] }> {
    const endpoint = `/aggregation/v2/customers/${customerId}/accounts`;
    
    return this.makeRequest<{ accounts: FinicityAccount[] }>(endpoint);
  }

  /**
   * Retrieves transactions for a customer
   */
  public async getTransactions(
    customerId: string, 
    fromDate: string, 
    toDate: string,
    accountId?: string,
    start: number = 1,
    limit: number = 25
  ): Promise<{ transactions: FinicityTransaction[], more: boolean }> {
    let endpoint = `/aggregation/v3/customers/${customerId}/transactions`;
    
    const params = new URLSearchParams({
      fromDate,
      toDate,
      start: start.toString(),
      limit: limit.toString()
    });
    
    if (accountId) {
      params.append('accountId', accountId);
    }
    
    endpoint += `?${params.toString()}`;
    
    return this.makeRequest<{ transactions: FinicityTransaction[], more: boolean }>(endpoint);
  }

  /**
   * Initiates the Connect flow to link customer accounts
   */
  public async generateConnectUrl(
    customerId: string,
    redirectUri: string,
    institutionId?: string,
    webhook?: string,
    webhookContentType: string = 'application/json'
  ): Promise<{ link: string }> {
    const endpoint = '/connect/v2/generate/lite';
    const body = {
      partnerId: this.partnerId,
      customerId,
      redirectUri,
      institutionId,
      webhook,
      webhookContentType
    };
    
    return this.makeRequest<{ link: string }>(endpoint, 'POST', body);
  }
}

// Export a singleton instance of the client for easy import
export const finicityClient = new FinicityClient();

export default finicityClient;

