import { getAdminServices } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

export interface AuthResult {
  success: boolean;
  user?: {
    uid: string;
    role: string;
    email?: string;
    displayName?: string;
  };
  error?: string;
  needsRefresh?: boolean;
}

export class TokenManager {
  private static instance: TokenManager;

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  async verifyToken(authToken: string): Promise<AuthResult> {
    // Handle demo tokens
    if (authToken.startsWith('demo-token-')) {
      const role = authToken.replace('demo-token-', '');
      const demoUsers = {
        admin: {
          uid: 'demo-admin-user',
          role: 'admin',
          email: 'admin@dm0-elearning.com',
          displayName: 'Demo Admin'
        },
        formateur: {
          uid: 'demo-formateur-user',
          role: 'formateur',
          email: 'formateur@dm0-elearning.com',
          displayName: 'Demo Formateur'
        },
        student: {
          uid: 'demo-student-user',
          role: 'student',
          email: 'student@dm0-elearning.com',
          displayName: 'Demo Student'
        }
      };

      const demoUser = demoUsers[role as keyof typeof demoUsers] || demoUsers.admin;
      
      return {
        success: true,
        user: demoUser
      };
    }

    try {
      const { auth } = getAdminServices();
      const decodedToken = await auth.verifyIdToken(authToken);
      
      return {
        success: true,
        user: {
          uid: decodedToken.uid,
          role: decodedToken.role || 'student',
          email: decodedToken.email,
          displayName: decodedToken.name
        }
      };
    } catch (error: any) {
      console.error('Token verification failed:', error.code, error.message);
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/id-token-expired') {
        return {
          success: false,
          error: 'Token expired',
          needsRefresh: true
        };
      }
      
      if (error.code === 'auth/id-token-revoked') {
        return {
          success: false,
          error: 'Token revoked',
          needsRefresh: true
        };
      }
      
      return {
        success: false,
        error: error.message || 'Authentication failed'
      };
    }
  }

  async getAuthFromCookies(): Promise<AuthResult> {
    try {
      const cookieStore = await cookies();
      const authToken = cookieStore.get('AuthToken')?.value;

      if (!authToken) {
        return {
          success: false,
          error: 'No authentication token found'
        };
      }

      return await this.verifyToken(authToken);
    } catch (error: any) {
      console.error('Error getting auth from cookies:', error);
      return {
        success: false,
        error: 'Failed to read authentication token'
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const { auth } = getAdminServices();
      const userRecord = await auth.verifySessionCookie(refreshToken);
      
      return {
        success: true,
        user: {
          uid: userRecord.uid,
          role: userRecord.customClaims?.role || 'student',
          email: userRecord.email,
          displayName: userRecord.displayName
        }
      };
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      return {
        success: false,
        error: 'Failed to refresh token'
      };
    }
  }

  // Fallback authentication for development/testing
  async getFallbackAuth(): Promise<AuthResult> {
    // Check for demo user credentials or environment-based auth
    const demoUserId = process.env.DEMO_USER_ID;
    const demoUserRole = process.env.DEMO_USER_ROLE || 'admin';
    
    if (demoUserId) {
      return {
        success: true,
        user: {
          uid: demoUserId,
          role: demoUserRole,
          email: 'demo@example.com',
          displayName: 'Demo User'
        }
      };
    }

    return {
      success: false,
      error: 'No fallback authentication available'
    };
  }

  // Comprehensive authentication with fallbacks
  async authenticate(): Promise<AuthResult> {
    // Try primary authentication first
    const primaryAuth = await this.getAuthFromCookies();
    
    if (primaryAuth.success) {
      return primaryAuth;
    }

    // If token needs refresh, try to refresh
    if (primaryAuth.needsRefresh) {
      const cookieStore = await cookies();
      const refreshToken = cookieStore.get('RefreshToken')?.value;
      
      if (refreshToken) {
        const refreshResult = await this.refreshToken(refreshToken);
        if (refreshResult.success) {
          return refreshResult;
        }
      }
    }

    // Try fallback authentication
    const fallbackAuth = await this.getFallbackAuth();
    if (fallbackAuth.success) {
      console.log('Using fallback authentication');
      return fallbackAuth;
    }

    // All authentication methods failed
    return {
      success: false,
      error: 'Authentication failed - please log in again'
    };
  }
}

export const tokenManager = TokenManager.getInstance();
