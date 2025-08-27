import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      status: 'success',
      message: 'Simple API is working',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      headers: {
        userAgent: request.headers.get('user-agent'),
        host: request.headers.get('host'),
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
