import { NextRequest, NextResponse } from 'next/server';
import finicityClient, { FinicityError } from '@/lib/finicity';

/**
 * GET handler - Returns basic API info and status
 */
export async function GET(request: NextRequest) {
  try {
    // Generate a new token to verify API connectivity
    await finicityClient.generateToken();

    return NextResponse.json({
      status: 'success',
      message: 'Finicity API connection successful',
      apiUrl: process.env.FINICITY_API_URL || 'https://api.finicity.com',
      credentials: {
        appKeyConfigured: !!process.env.FINICITY_APP_KEY,
        partnerIdConfigured: !!process.env.FINICITY_PARTNER_ID,
        partnerSecretConfigured: !!process.env.FINICITY_PARTNER_SECRET,
      },
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

