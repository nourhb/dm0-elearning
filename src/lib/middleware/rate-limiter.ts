import { NextRequest, NextResponse } from 'next/server';
import { cacheManager } from '../cache/cache-manager';

// Rate limiting configuration for different endpoints
export const RATE_LIMIT_CONFIG = {
  // API endpoints - stricter limits
  'api/auth': { requests: 10, window: 60 }, // 10 requests per minute
  'api/dashboard': { requests: 30, window: 60 }, // 30 requests per minute
  'api/courses': { requests: 20, window: 60 }, // 20 requests per minute
  'api/quizzes': { requests: 15, window: 60 }, // 15 requests per minute
  'api/community': { requests: 25, window: 60 }, // 25 requests per minute
  
  // File uploads - very strict limits
  'api/upload': { requests: 5, window: 300 }, // 5 uploads per 5 minutes
  
  // Search endpoints - moderate limits
  'api/search': { requests: 20, window: 60 }, // 20 searches per minute
  
  // Default for unknown endpoints
  'default': { requests: 15, window: 60 }, // 15 requests per minute
} as const;

// IP-based rate limiting with user ID fallback
export async function rateLimitMiddleware(
  request: NextRequest,
  userId?: string
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const path = request.nextUrl.pathname;
  
  // Create a unique identifier for rate limiting
  const identifier = userId ? `user:${userId}` : `ip:${ip}`;
  
  // Determine rate limit configuration based on path
  let config = RATE_LIMIT_CONFIG.default;
  for (const [pattern, limitConfig] of Object.entries(RATE_LIMIT_CONFIG)) {
    if (pattern !== 'default' && path.includes(pattern)) {
      config = limitConfig;
      break;
    }
  }
  
  // Apply rate limiting
  const result = await cacheManager.rateLimit(
    identifier,
    config.requests,
    config.window
  );
  
  // Log rate limit events for monitoring
  if (!result.allowed) {
    console.warn(`Rate limit exceeded for ${identifier} on ${path}`, {
      ip,
      userAgent,
      userId,
      path,
      limit: config.requests,
      window: config.window
    });
  }
  
  return result;
}

// Enhanced rate limiter with adaptive limits
export class AdaptiveRateLimiter {
  private static instance: AdaptiveRateLimiter;
  private userScores = new Map<string, number>(); // User trust scores
  
  static getInstance(): AdaptiveRateLimiter {
    if (!AdaptiveRateLimiter.instance) {
      AdaptiveRateLimiter.instance = new AdaptiveRateLimiter();
    }
    return AdaptiveRateLimiter.instance;
  }
  
  async checkRateLimit(
    request: NextRequest,
    userId?: string
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number; adaptive?: boolean }> {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const identifier = userId ? `user:${userId}` : `ip:${ip}`;
    
    // Get user trust score
    const trustScore = this.getUserTrustScore(identifier);
    
    // Adjust rate limits based on trust score
    const baseConfig = this.getBaseConfig(request.nextUrl.pathname);
    const adjustedRequests = Math.floor(baseConfig.requests * (1 + trustScore * 0.5));
    
    const result = await cacheManager.rateLimit(
      identifier,
      adjustedRequests,
      baseConfig.window
    );
    
    // Update trust score based on behavior
    if (result.allowed) {
      this.updateTrustScore(identifier, 0.1); // Reward good behavior
    } else {
      this.updateTrustScore(identifier, -0.2); // Penalize abuse
    }
    
    return {
      ...result,
      adaptive: trustScore > 0
    };
  }
  
  private getUserTrustScore(identifier: string): number {
    return this.userScores.get(identifier) || 0;
  }
  
  private updateTrustScore(identifier: string, delta: number): void {
    const currentScore = this.getUserTrustScore(identifier);
    const newScore = Math.max(-1, Math.min(1, currentScore + delta));
    this.userScores.set(identifier, newScore);
  }
  
  private getBaseConfig(path: string) {
    for (const [pattern, config] of Object.entries(RATE_LIMIT_CONFIG)) {
      if (pattern !== 'default' && path.includes(pattern)) {
        return config;
      }
    }
    return RATE_LIMIT_CONFIG.default;
  }
}

// Middleware wrapper for Next.js
export function withRateLimit(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      // Extract user ID from auth token if available
      let userId: string | undefined;
      try {
        const authToken = request.cookies.get('AuthToken')?.value;
        if (authToken) {
          // Decode token to get user ID (simplified)
          const payload = JSON.parse(Buffer.from(authToken.split('.')[1], 'base64').toString());
          userId = payload.uid;
        }
      } catch (error) {
        // Token parsing failed, continue without user ID
      }
      
      // Check rate limit
      const rateLimitResult = await rateLimitMiddleware(request, userId);
      
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.',
            resetTime: new Date(rateLimitResult.resetTime).toISOString()
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': '15',
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
              'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
            }
          }
        );
      }
      
      // Add rate limit headers to response
      const response = await handler(request, ...args);
      
      if (response instanceof NextResponse) {
        response.headers.set('X-RateLimit-Limit', '15');
        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
        response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
      }
      
      return response;
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      // Continue without rate limiting if there's an error
      return handler(request, ...args);
    }
  };
}

// Utility for checking if a request should be rate limited
export function shouldRateLimit(path: string): boolean {
  // Skip rate limiting for static assets and health checks
  const skipPatterns = [
    '/_next/',
    '/favicon.ico',
    '/api/health',
    '/api/status',
    '/static/',
    '/images/',
    '/fonts/'
  ];
  
  return !skipPatterns.some(pattern => path.includes(pattern));
}

// Bulk rate limiting for batch operations
export async function bulkRateLimit(
  identifiers: string[],
  operation: string,
  limit: number,
  window: number
): Promise<{ allowed: boolean; blockedIdentifiers: string[] }> {
  const results = await Promise.all(
    identifiers.map(async (identifier) => {
      const result = await cacheManager.rateLimit(
        `${operation}:${identifier}`,
        limit,
        window
      );
      return { identifier, allowed: result.allowed };
    })
  );
  
  const blockedIdentifiers = results
    .filter(result => !result.allowed)
    .map(result => result.identifier);
  
  return {
    allowed: blockedIdentifiers.length === 0,
    blockedIdentifiers
  };
}
