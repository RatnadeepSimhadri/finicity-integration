import { NextRequest, NextResponse } from 'next/server';
import finicityClient, { FinicityError } from '@/lib/finicity';

/**
 * POST handler - Creates a new customer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.username) {
      return NextResponse.json(
        { status: 'error', message: 'Username is required' },
        { status: 400 }
      );
    }
    
    const customer = await finicityClient.createCustomer(
      body.username
    );
    
    return NextResponse.json({
      status: 'success',
      customer,
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