import { NextRequest, NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Check if Firebase Admin is working
    let auth, db;
    try {
      const services = getAdminServices();
      auth = services.auth;
      db = services.db;
    } catch (error) {
      console.error('Firebase Admin initialization failed:', error);
      return NextResponse.json({ 
        error: 'Database not available',
        message: 'Firebase configuration is missing.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 503 });
    }

    // Get the auth token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('AuthToken')?.value;

    if (!authToken) {
      return NextResponse.json({ 
        error: 'No auth token found',
        message: 'Please log in first',
        cookies: Object.fromEntries(cookieStore.getAll().map(c => [c.name, c.value ? 'SET' : 'NOT SET']))
      }, { status: 401 });
    }

    try {
      // Verify the token and get user claims
      const decodedToken = await auth.verifyIdToken(authToken);
      const userRole = decodedToken.role || 'student';
      const userId = decodedToken.uid;

      return NextResponse.json({ 
        success: true,
        message: 'Authentication successful',
        user: {
          uid: userId,
          role: userRole,
          email: decodedToken.email
        },
        token: {
          valid: true,
          expiresAt: new Date(decodedToken.exp * 1000).toISOString()
        }
      });
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return NextResponse.json({ 
        error: 'Invalid auth token',
        message: 'Token verification failed',
        details: tokenError instanceof Error ? tokenError.message : 'Unknown error'
      }, { status: 401 });
    }

  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
