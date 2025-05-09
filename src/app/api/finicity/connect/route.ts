import { NextRequest, NextResponse } from 'next/server';
import finicityClient, { FinicityError } from '@/lib/finicity';

/**
 * POST handler - Generates a Connect URL for account linking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.customerId) {
      return NextResponse.json(
        { status: 'error', message: 'Customer ID is required' },
        { status: 400 }
      );
    }
    
    if (!body.redirectUri) {
      return NextResponse.json(
        { status: 'error', message: 'Redirect URI is required' },
        { status: 400 }
      );
    }
    
    // Generate Connect URL with institutionId if provided
    const result = await finicityClient.generateConnectUrl(
      body.customerId,
      body.redirectUri,
      body.institutionId, // Pass the institutionId to pre-select the institution
      body.webhook,
      body.webhookContentType
    );
    
    return NextResponse.json({
      status: 'success',
      ...result
    });
  } catch (error) {
    console.error('Finicity API Error:', error);
    
    if (error instanceof FinicityError) {
      return NextResponse.json(
        {
          status: 'error',
          message: error.message,
          code: error.code,
        },
        { status: error.status }
      );
    }
    
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

