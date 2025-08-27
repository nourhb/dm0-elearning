import { NextRequest, NextResponse } from 'next/server';
import { cacheManager, CACHE_CONFIG, CacheType } from '../cache/cache-manager';
import { withConnection } from './connection-pool';
import { rateLimitMiddleware, shouldRateLimit } from '../middleware/rate-limiter';

// API response wrapper with performance optimizations
export class OptimizedAPI {
  private cacheType: CacheType;
  private enableCaching: boolean;
  private enableRateLimit: boolean;
  private cacheKey?: string;

  constructor(
    cacheType: CacheType,
    options: {
      enableCaching?: boolean;
      enableRateLimit?: boolean;
      cacheKey?: string;
    } = {}
  ) {
    this.cacheType = cacheType;
    this.enableCaching = options.enableCaching ?? true;
    this.enableRateLimit = options.enableRateLimit ?? true;
    this.cacheKey = options.cacheKey;
  }

  /**
   * Execute API operation with all optimizations
   */
  async execute<T>(
    request: NextRequest,
    operation: (firebaseApp: { auth: any; db: any }) => Promise<T>,
    options: {
      cacheKey?: string;
      skipCache?: boolean;
      customTtl?: number;
      userId?: string;
    } = {}
  ): Promise<NextResponse> {
    const startTime = Date.now();
    
    try {
      // 1. Rate limiting
      if (this.enableRateLimit && shouldRateLimit(request.nextUrl.pathname)) {
        const rateLimitResult = await rateLimitMiddleware(request, options.userId);
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
      }

      // 2. Cache key generation
      const cacheKey = options.cacheKey || this.cacheKey || this.generateCacheKey(request);

      // 3. Try cache first
      if (this.enableCaching && !options.skipCache) {
        const cachedResult = await cacheManager.get(
          this.cacheType,
          cacheKey,
          undefined,
          { skipMemory: false, skipRedis: false }
        );

        if (cachedResult !== null) {
          const response = NextResponse.json(cachedResult);
          this.addPerformanceHeaders(response, Date.now() - startTime, true);
          return response;
        }
      }

      // 4. Execute operation with connection pooling
      const result = await withConnection(async (firebaseApp) => {
        return await operation(firebaseApp);
      });

      // 5. Cache the result
      if (this.enableCaching && !options.skipCache) {
        await cacheManager.set(
          this.cacheType,
          cacheKey,
          result,
          options.customTtl
        );
      }

      // 6. Return response with performance headers
      const response = NextResponse.json(result);
      this.addPerformanceHeaders(response, Date.now() - startTime, false);
      
      return response;

    } catch (error) {
      console.error('Optimized API execution error:', error);
      
      const errorResponse = NextResponse.json(
        {
          error: 'Internal server error',
          message: 'An unexpected error occurred. Please try again.',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
      
      this.addPerformanceHeaders(errorResponse, Date.now() - startTime, false);
      return errorResponse;
    }
  }

  /**
   * Execute batch operations with optimizations
   */
  async executeBatch<T>(
    request: NextRequest,
    operations: Array<(firebaseApp: { auth: any; db: any }) => Promise<T>>,
    options: {
      cacheKeys?: string[];
      skipCache?: boolean;
      customTtl?: number;
      userId?: string;
    } = {}
  ): Promise<NextResponse> {
    const startTime = Date.now();
    
    try {
      // Rate limiting
      if (this.enableRateLimit && shouldRateLimit(request.nextUrl.pathname)) {
        const rateLimitResult = await rateLimitMiddleware(request, options.userId);
        if (!rateLimitResult.allowed) {
          return NextResponse.json(
            {
              error: 'Rate limit exceeded',
              message: 'Too many requests. Please try again later.',
              resetTime: new Date(rateLimitResult.resetTime).toISOString()
            },
            { status: 429 }
          );
        }
      }

      // Try batch cache
      if (this.enableCaching && !options.skipCache && options.cacheKeys) {
        const cachedResults = await cacheManager.mget(this.cacheType, options.cacheKeys);
        const allCached = cachedResults.every(result => result !== null);
        
        if (allCached) {
          const response = NextResponse.json({ results: cachedResults });
          this.addPerformanceHeaders(response, Date.now() - startTime, true);
          return response;
        }
      }

      // Execute batch operations
      const results = await withConnection(async (firebaseApp) => {
        const batchResults: T[] = [];
        
        for (const operation of operations) {
          try {
            const result = await operation(firebaseApp);
            batchResults.push(result);
          } catch (error) {
            console.error('Batch operation failed:', error);
            throw error;
          }
        }
        
        return batchResults;
      });

      // Cache batch results
      if (this.enableCaching && !options.skipCache && options.cacheKeys) {
        const cacheData: Record<string, T> = {};
        options.cacheKeys.forEach((key, index) => {
          cacheData[key] = results[index];
        });
        
        await cacheManager.mset(this.cacheType, cacheData, options.customTtl);
      }

      const response = NextResponse.json({ results });
      this.addPerformanceHeaders(response, Date.now() - startTime, false);
      return response;

    } catch (error) {
      console.error('Optimized API batch execution error:', error);
      
      return NextResponse.json(
        {
          error: 'Internal server error',
          message: 'An unexpected error occurred. Please try again.',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  }

  /**
   * Invalidate cache for specific keys
   */
  async invalidateCache(keys: string[]): Promise<void> {
    if (!this.enableCaching) return;

    await Promise.all(
      keys.map(key => cacheManager.delete(this.cacheType, key))
    );
  }

  /**
   * Generate cache key from request
   */
  private generateCacheKey(request: NextRequest): string {
    const path = request.nextUrl.pathname;
    const searchParams = request.nextUrl.searchParams.toString();
    const userId = this.extractUserId(request);
    
    return `${path}:${searchParams}:${userId || 'anonymous'}`;
  }

  /**
   * Extract user ID from request
   */
  private extractUserId(request: NextRequest): string | null {
    try {
      const authToken = request.cookies.get('AuthToken')?.value;
      if (authToken) {
        const payload = JSON.parse(Buffer.from(authToken.split('.')[1], 'base64').toString());
        return payload.uid || null;
      }
    } catch (error) {
      // Token parsing failed
    }
    return null;
  }

  /**
   * Add performance headers to response
   */
  private addPerformanceHeaders(
    response: NextResponse,
    executionTime: number,
    fromCache: boolean
  ): void {
    response.headers.set('X-Execution-Time', `${executionTime}ms`);
    response.headers.set('X-Cache-Hit', fromCache.toString());
    response.headers.set('X-Cache-Type', this.cacheType);
    
    // Add cache control headers
    if (fromCache) {
      response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    } else {
      const config = CACHE_CONFIG[this.cacheType];
      response.headers.set('Cache-Control', `public, s-maxage=${config.ttl}, stale-while-revalidate=${config.ttl * 2}`);
    }
  }
}

// Factory function for creating optimized API instances
export function createOptimizedAPI(
  cacheType: CacheType,
  options: {
    enableCaching?: boolean;
    enableRateLimit?: boolean;
    cacheKey?: string;
  } = {}
): OptimizedAPI {
  return new OptimizedAPI(cacheType, options);
}

// Pre-configured API instances for common use cases
export const optimizedAPIs = {
  dashboard: createOptimizedAPI('DASHBOARD_OVERVIEW'),
  courses: createOptimizedAPI('COURSE_LIST'),
  quizzes: createOptimizedAPI('QUIZ_LIST'),
  userProfile: createOptimizedAPI('USER_PROFILE'),
  community: createOptimizedAPI('COMMUNITY_POSTS'),
  search: createOptimizedAPI('SEARCH_RESULTS', { enableCaching: true, enableRateLimit: true }),
  upload: createOptimizedAPI('SYSTEM_CONFIG', { enableCaching: false, enableRateLimit: true })
};

// Utility for creating API handlers with optimizations
export function createOptimizedHandler<T>(
  cacheType: CacheType,
  operation: (firebaseApp: { auth: any; db: any }) => Promise<T>,
  options: {
    enableCaching?: boolean;
    enableRateLimit?: boolean;
    cacheKey?: string;
  } = {}
) {
  const api = createOptimizedAPI(cacheType, options);
  
  return async (request: NextRequest): Promise<NextResponse> => {
    return api.execute(request, operation);
  };
}
