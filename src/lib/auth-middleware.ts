import { NextRequest, NextResponse } from 'next/server';
import { getAdminServices } from './firebase-admin';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    uid: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to handle authentication with token refresh
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedRequest | NextResponse> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    // Check if we have any authentication
    if (!authHeader && !cookieHeader) {
      return NextResponse.json(
        { error: 'No authentication provided', needsAuth: true },
        { status: 401 }
      );
    }

    let token: string | null = null;

    // Extract token from Authorization header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // If no token in header, try to get from cookies
    if (!token && cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      
      token = cookies['auth-token'] || cookies['token'] || null;
    }

    if (!token) {
      return NextResponse.json(
        { error: 'No valid token found', needsAuth: true },
        { status: 401 }
      );
    }

    // Verify the token
    const { auth } = getAdminServices();
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      
      // Add user info to the request
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        role: (decodedToken.role as string) || 'student'
      };
      
      return authenticatedRequest;
    } catch (verifyError: any) {
      console.error('Token verification failed:', verifyError);
      
      // If token is expired, return a specific error
      if (verifyError.code === 'auth/id-token-expired') {
        return NextResponse.json(
          { 
            error: 'Token expired', 
            needsAuth: true,
            tokenExpired: true,
            message: 'Please refresh your authentication'
          },
          { status: 401 }
        );
      }
      
      // For other verification errors
      return NextResponse.json(
        { error: 'Invalid token', needsAuth: true },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return NextResponse.json(
      { error: 'Authentication failed', needsAuth: true },
      { status: 500 }
    );
  }
}

/**
 * Middleware to require specific roles
 */
export function requireRole(allowedRoles: string[]) {
  return async (request: AuthenticatedRequest): Promise<AuthenticatedRequest | NextResponse> => {
    if (!request.user) {
      return NextResponse.json(
        { error: 'Authentication required', needsAuth: true },
        { status: 401 }
      );
    }

    if (!allowedRoles.includes(request.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions', needsAuth: true },
        { status: 403 }
      );
    }

    return request;
  };
}

/**
 * Helper function to handle authentication in API routes
 */
export async function handleApiAuth(request: NextRequest, allowedRoles?: string[]) {
  // First authenticate the request
  const authResult = await authenticateRequest(request);
  
  if (authResult instanceof NextResponse) {
    return authResult; // Return error response
  }
  
  // If roles are specified, check them
  if (allowedRoles && allowedRoles.length > 0) {
    const roleResult = await requireRole(allowedRoles)(authResult);
    if (roleResult instanceof NextResponse) {
      return roleResult; // Return error response
    }
  }
  
  return authResult; // Return authenticated request
}
