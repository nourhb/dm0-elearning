import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const testData = {
      message: 'API is working!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      status: 'success',
      features: {
        authentication: 'simplified',
        database: 'bypassed',
        api: 'operational'
      }
    };

    return NextResponse.json(testData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache',
        'X-Test-API': 'Static'
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'API Error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
