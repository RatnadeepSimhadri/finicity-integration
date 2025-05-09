"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";

interface ApiStatus {
  status: string;
  message: string;
  apiUrl?: string;
  credentials?: {
    appKeyConfigured: boolean;
    partnerIdConfigured: boolean;
    partnerSecretConfigured: boolean;
  };
}

interface FinicityCustomer {
  id: string;
  username: string;
  createdDate: string;
  type: string;
}

interface FinicityInstitution {
  id: number;
  name: string;
  logo?: string;
  url?: string;
  oauthEnabled: boolean;
}

export default function Home() {
  // State for each section
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [isCheckingApi, setIsCheckingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [newCustomer, setNewCustomer] = useState({
    username: ""
  });
  const [createdCustomer, setCreatedCustomer] = useState<FinicityCustomer | null>(null);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [customerError, setCustomerError] = useState<string | null>(null);

  const [institutionSearch, setInstitutionSearch] = useState("");
  const [institutions, setInstitutions] = useState<FinicityInstitution[]>([]);
  const [isSearchingInstitutions, setIsSearchingInstitutions] = useState(false);
  const [institutionsError, setInstitutionsError] = useState<string | null>(null);

  const [connectInfo, setConnectInfo] = useState({
    customerId: "",
    redirectUri: typeof window !== "undefined" ? `${window.location.origin}/callback` : "",
  });
  const [connectUrl, setConnectUrl] = useState<string | null>(null);
  const [isGeneratingConnect, setIsGeneratingConnect] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Check API status
  const checkApiStatus = async () => {
    setIsCheckingApi(true);
    setApiError(null);
    setApiStatus(null);

    try {
      const response = await fetch("/api/finicity");
      const data = await response.json();

      if (response.ok) {
        setApiStatus(data);
      } else {
        setApiError(data.message || "Failed to check API status");
      }
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsCheckingApi(false);
    }
  };

  // Create a new customer
  const createCustomer = async (e: FormEvent) => {
    e.preventDefault();
    setIsCreatingCustomer(true);
    setCustomerError(null);
    setCreatedCustomer(null);

    try {
      const response = await fetch("/api/finicity/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCustomer),
      });

      const data = await response.json();

      if (response.ok) {
        setCreatedCustomer(data.customer);
        // Auto-fill the customer ID for connect URL
        setConnectInfo({
          ...connectInfo,
          customerId: data.customer.id,
        });
      } else {
        setCustomerError(data.message || "Failed to create customer");
      }
    } catch (error) {
      setCustomerError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  // Search for institutions
  const searchInstitutions = async (e: FormEvent) => {
    e.preventDefault();
    setIsSearchingInstitutions(true);
    setInstitutionsError(null);
    setInstitutions([]);

    try {
      const response = await fetch(`/api/finicity/institutions?search=${encodeURIComponent(institutionSearch)}`);
      const data = await response.json();

      if (response.ok) {
        setInstitutions(data.institutions || []);
      } else {
        setInstitutionsError(data.message || "Failed to search institutions");
      }
    } catch (error) {
      setInstitutionsError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsSearchingInstitutions(false);
    }
  };

  // Generate Connect URL
  const generateConnectUrl = async (e: FormEvent) => {
    e.preventDefault();
    setIsGeneratingConnect(true);
    setConnectError(null);
    setConnectUrl(null);

    try {
      const response = await fetch("/api/finicity/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(connectInfo),
      });

      const data = await response.json();

      if (response.ok) {
        setConnectUrl(data.link);
      } else {
        setConnectError(data.message || "Failed to generate Connect URL");
      }
    } catch (error) {
      setConnectError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsGeneratingConnect(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-bold mb-2">Mastercard Finicity API Integration</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            This application demonstrates integration with the Mastercard Finicity Open Banking API.
            Use the tools below to test the connection, create customers, search for financial institutions,
            and generate Connect URLs for account linking.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* API Status Section */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">API Connection Status</h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              Test the connection to the Finicity API to ensure your credentials are properly configured.
            </p>

            <button
              onClick={checkApiStatus}
              disabled={isCheckingApi}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isCheckingApi ? "Checking..." : "Check API Status"}
            </button>

            {apiStatus && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded">
                <p className="text-green-800 dark:text-green-200">
                  <span className="font-bold">Status:</span> {apiStatus.message}
                </p>
                <div className="mt-2 text-sm">
                  <p>
                    <span className="font-bold">App Key:</span>{" "}
                    {apiStatus.credentials?.appKeyConfigured ? "✓ Configured" : "✗ Missing"}
                  </p>
                  <p>
                    <span className="font-bold">Partner ID:</span>{" "}
                    {apiStatus.credentials?.partnerIdConfigured ? "✓ Configured" : "✗ Missing"}
                  </p>
                  <p>
                    <span className="font-bold">Partner Secret:</span>{" "}
                    {apiStatus.credentials?.partnerSecretConfigured ? "✓ Configured" : "✗ Missing"}
                  </p>
                </div>
              </div>
            )}

            {apiError && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded text-red-800 dark:text-red-200">
                <p className="font-bold">Error:</p>
                <p>{apiError}</p>
              </div>
            )}
          </section>

          {/* Create Customer Section */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Create a Customer</h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              Create a new customer in the Finicity system. This is required before linking accounts.
            </p>

            <form onSubmit={createCustomer}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  value={newCustomer.username}
                  onChange={(e) => setNewCustomer({ ...newCustomer, username: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isCreatingCustomer}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {isCreatingCustomer ? "Creating..." : "Create Customer"}
              </button>
            </form>

            {createdCustomer && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded">
                <p className="text-green-800 dark:text-green-200 font-bold">Customer Created Successfully!</p>
                <div className="mt-2 text-sm">
                  <p>
                    <span className="font-bold">Customer ID:</span> {createdCustomer.id}
                  </p>
                  <p>
                    <span className="font-bold">Username:</span> {createdCustomer.username}
                  </p>
                  <p>
                    <span className="font-bold">Created Date:</span> {createdCustomer.createdDate}
                  </p>
                </div>
              </div>
            )}

            {customerError && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded text-red-800 dark:text-red-200">
                <p className="font-bold">Error:</p>
                <p>{customerError}</p>
              </div>
            )}
          </section>

          {/* Institution Search Section */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Search Financial Institutions</h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              Search for financial institutions available in the Finicity network.
            </p>

            <form onSubmit={searchInstitutions}>
              <div className="mb-4">
                <label htmlFor="institutionSearch" className="block text-sm font-medium mb-1">
                  Search Term
                </label>
                <input
                  type="text"
                  id="institutionSearch"
                  value={institutionSearch}
                  onChange={(e) => setInstitutionSearch(e.target.value)}
                  placeholder="Bank name (e.g., Chase, Wells Fargo)"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSearchingInstitutions}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {isSearchingInstitutions ? "Searching..." : "Search Institutions"}
              </button>
            </form>

            {institutions.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Search Results ({institutions.length})</h3>
                <div className="max-h-64 overflow-y-auto border rounded dark:border-gray-700">
                  <table className="min-w-full">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="py-2 px-4 text-left text-sm">ID</th>
                        <th className="py-2 px-4 text-left text-sm">Name</th>
                        <th className="py-2 px-4 text-left text-sm">OAuth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {institutions.map((institution) => (
                        <tr key={institution.id} className="border-t dark:border-gray-700">
                          <td className="py-2 px-4 text-sm">{institution.id}</td>
                          <td className="py-2 px-4 text-sm">{institution.name}</td>
                          <td className="py-2 px-4 text-sm">
                            {institution.oauthEnabled ? "✓" : "✗"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {institutionsError && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded text-red-800 dark:text-red-200">
                <p className="font-bold">Error:</p>
                <p>{institutionsError}</p>
              </div>
            )}
          </section>

          {/* Connect URL Generation Section */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Generate Connect URL</h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              Generate a Finicity Connect URL to link a customer's financial accounts.
            </p>

            <form onSubmit={generateConnectUrl}>
              <div className="mb-4">
                <label htmlFor="customerId" className="block text-sm font-medium mb-1">
                  Customer ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="customerId"
                  value={connectInfo.customerId}
                  onChange={(e) => setConnectInfo({ ...connectInfo, customerId: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="redirectUri" className="block text-sm font-medium mb-1">
                  Redirect URI <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="redirectUri"
                  value={connectInfo.redirectUri}
                  onChange={(e) => setConnectInfo({ ...connectInfo, redirectUri: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isGeneratingConnect}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {isGeneratingConnect ? "Generating..." : "Generate Connect URL"}
              </button>
            </form>

            {connectUrl && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded">
                <p className="text-green-800 dark:text-green-200 font-bold">Connect URL Generated!</p>
                <div className="mt-2">
                  <p className="mb-2 text-sm">Use this URL to redirect the user to the Finicity Connect interface:</p>
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm break-all">
                    {connectUrl}
                  </div>
                  <div className="mt-3">
                    <a
                      href={connectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded inline-block"
                    >
                      Open Connect URL
                    </a>
                  </div>
                </div>
              </div>
            )}

            {connectError && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded text-red-800 dark:text-red-200">
                <p className="font-bold">Error:</p>
                <p>{connectError}</p>
              </div>
            )}
          </section>
        </div>

        {/* Documentation Section */}
        <section className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Documentation</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            For more information about the Mastercard Finicity API, refer to the official documentation:
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://developer.mastercard.com/open-banking-us/documentation/quick-start-guide/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded"
            >
              Quick Start Guide
            </a>
            <a
              href="https://developer.mastercard.com/open-banking-us/documentation/connect/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded"
            >
              Connect Guide
            </a>
            <a
              href="https://developer.mastercard.com/open-banking-us/documentation/api-reference/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded"
            >
              API Reference
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>
            This application is for demonstration purposes only. Not for production use without
            proper security and compliance measures.
          </p>
        </footer>
      </div>
    </div>
  );
}
