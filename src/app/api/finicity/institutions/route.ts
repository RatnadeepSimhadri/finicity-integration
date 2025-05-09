import { NextRequest, NextResponse } from 'next/server';
import finicityClient, { FinicityError } from '@/lib/finicity';

/**
 * GET handler - Returns a list of financial institutions
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const start = parseInt(searchParams.get('start') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    
    // Validate parameters
    if (isNaN(start) || start < 1) {
      return NextResponse.json(
        { status: 'error', message: 'Start parameter must be a positive integer' },
        { status: 400 }
      );
    }
    
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { status: 'error', message: 'Limit parameter must be between 1 and 100' },
        { status: 400 }
      );
    }
    
    // Get institutions from Finicity
    const result = await finicityClient.getInstitutions(search, start, limit);
    
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

