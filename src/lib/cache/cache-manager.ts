import { redisClient } from './redis-client';

// Cache configuration for different data types
export const CACHE_CONFIG = {
  // User data - frequently accessed, moderate TTL
  USER_PROFILE: { ttl: 300, prefix: 'user:profile:' }, // 5 minutes
  USER_SESSION: { ttl: 3600, prefix: 'user:session:' }, // 1 hour
  
  // Course data - less frequent changes, longer TTL
  COURSE_DETAILS: { ttl: 1800, prefix: 'course:details:' }, // 30 minutes
  COURSE_LIST: { ttl: 900, prefix: 'course:list:' }, // 15 minutes
  COURSE_MODULES: { ttl: 3600, prefix: 'course:modules:' }, // 1 hour
  
  // Quiz data - moderate frequency, moderate TTL
  QUIZ_DETAILS: { ttl: 1200, prefix: 'quiz:details:' }, // 20 minutes
  QUIZ_LIST: { ttl: 600, prefix: 'quiz:list:' }, // 10 minutes
  QUIZ_STATS: { ttl: 300, prefix: 'quiz:stats:' }, // 5 minutes
  
  // Dashboard data - frequently accessed, short TTL
  DASHBOARD_STATS: { ttl: 180, prefix: 'dashboard:stats:' }, // 3 minutes
  DASHBOARD_OVERVIEW: { ttl: 300, prefix: 'dashboard:overview:' }, // 5 minutes
  
  // Community data - moderate frequency, moderate TTL
  COMMUNITY_POSTS: { ttl: 600, prefix: 'community:posts:' }, // 10 minutes
  COMMUNITY_STATS: { ttl: 900, prefix: 'community:stats:' }, // 15 minutes
  
  // System data - rarely changes, long TTL
  SYSTEM_CONFIG: { ttl: 7200, prefix: 'system:config:' }, // 2 hours
  NOTIFICATIONS: { ttl: 300, prefix: 'notifications:' }, // 5 minutes
  
  // Rate limiting
  RATE_LIMIT: { ttl: 60, prefix: 'rate:limit:' }, // 1 minute
  
  // Search results - short TTL for freshness
  SEARCH_RESULTS: { ttl: 300, prefix: 'search:' }, // 5 minutes
} as const;

export type CacheType = keyof typeof CACHE_CONFIG;

class CacheManager {
  private static instance: CacheManager;
  private memoryCache = new Map<string, { value: any; expiry: number }>();
  private readonly MEMORY_CACHE_TTL = 60000; // 1 minute for memory cache

  private constructor() {
    // Clean up expired memory cache entries every minute
    setInterval(() => this.cleanupMemoryCache(), 60000);
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Get cached data with fallback strategy
   */
  async get<T>(
    cacheType: CacheType,
    key: string,
    fallback?: () => Promise<T>,
    options?: { skipMemory?: boolean; skipRedis?: boolean }
  ): Promise<T | null> {
    const config = CACHE_CONFIG[cacheType];
    const fullKey = `${config.prefix}${key}`;

    // Try memory cache first (fastest)
    if (!options?.skipMemory) {
      const memoryResult = this.getFromMemory<T>(fullKey);
      if (memoryResult !== null) {
        return memoryResult;
      }
    }

    // Try Redis cache
    if (!options?.skipRedis) {
      try {
        const redisResult = await redisClient.get(fullKey);
        if (redisResult !== null) {
          // Store in memory cache for faster subsequent access
          this.setInMemory(fullKey, redisResult, this.MEMORY_CACHE_TTL);
          return redisResult;
        }
      } catch (error) {
        console.error('Redis cache get error:', error);
      }
    }

    // Execute fallback if provided
    if (fallback) {
      try {
        const result = await fallback();
        await this.set(cacheType, key, result);
        return result;
      } catch (error) {
        console.error('Fallback execution error:', error);
        return null;
      }
    }

    return null;
  }

  /**
   * Set cached data with TTL
   */
  async set<T>(
    cacheType: CacheType,
    key: string,
    value: T,
    customTtl?: number
  ): Promise<void> {
    const config = CACHE_CONFIG[cacheType];
    const fullKey = `${config.prefix}${key}`;
    const ttl = customTtl || config.ttl;

    // Set in memory cache
    this.setInMemory(fullKey, value, this.MEMORY_CACHE_TTL);

    // Set in Redis cache
    try {
      await redisClient.set(fullKey, value, ttl);
    } catch (error) {
      console.error('Redis cache set error:', error);
    }
  }

  /**
   * Delete cached data
   */
  async delete(cacheType: CacheType, key: string): Promise<void> {
    const config = CACHE_CONFIG[cacheType];
    const fullKey = `${config.prefix}${key}`;

    // Delete from memory cache
    this.memoryCache.delete(fullKey);

    // Delete from Redis cache
    try {
      await redisClient.del(fullKey);
    } catch (error) {
      console.error('Redis cache delete error:', error);
    }
  }

  /**
   * Invalidate all cache entries for a specific type
   */
  async invalidateType(cacheType: CacheType): Promise<void> {
    const config = CACHE_CONFIG[cacheType];
    
    // Clear memory cache entries with this prefix
    for (const [key] of this.memoryCache) {
      if (key.startsWith(config.prefix)) {
        this.memoryCache.delete(key);
      }
    }

    // Note: Redis doesn't support pattern deletion easily
    // In production, you might want to use Redis SCAN command
    console.log(`Invalidated memory cache for type: ${cacheType}`);
  }

  /**
   * Batch get multiple cache entries
   */
  async mget<T>(
    cacheType: CacheType,
    keys: string[]
  ): Promise<(T | null)[]> {
    const config = CACHE_CONFIG[cacheType];
    const fullKeys = keys.map(key => `${config.prefix}${key}`);

    try {
      return await redisClient.mget(fullKeys);
    } catch (error) {
      console.error('Redis cache mget error:', error);
      return new Array(keys.length).fill(null);
    }
  }

  /**
   * Batch set multiple cache entries
   */
  async mset<T>(
    cacheType: CacheType,
    keyValuePairs: Record<string, T>,
    customTtl?: number
  ): Promise<void> {
    const config = CACHE_CONFIG[cacheType];
    const ttl = customTtl || config.ttl;
    const fullKeyValuePairs: Record<string, T> = {};

    // Prepare full keys and set in memory cache
    Object.entries(keyValuePairs).forEach(([key, value]) => {
      const fullKey = `${config.prefix}${key}`;
      fullKeyValuePairs[fullKey] = value;
      this.setInMemory(fullKey, value, this.MEMORY_CACHE_TTL);
    });

    // Set in Redis cache
    try {
      await redisClient.mset(fullKeyValuePairs, ttl);
    } catch (error) {
      console.error('Redis cache mset error:', error);
    }
  }

  /**
   * Rate limiting with sliding window
   */
  async rateLimit(
    identifier: string,
    limit: number,
    window: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = `rate:limit:${identifier}`;
    const now = Date.now();
    const windowStart = now - window * 1000;

    try {
      const current = await redisClient.get(key) || [];
      const validRequests = current.filter((timestamp: number) => timestamp > windowStart);
      
      if (validRequests.length >= limit) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: validRequests[0] + window * 1000
        };
      }

      validRequests.push(now);
      await redisClient.set(key, validRequests, window);

      return {
        allowed: true,
        remaining: limit - validRequests.length,
        resetTime: now + window * 1000
      };
    } catch (error) {
      console.error('Rate limit error:', error);
      return { allowed: true, remaining: limit, resetTime: now + window * 1000 };
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    memoryCacheSize: number;
    redisConnected: boolean;
    memoryCacheKeys: string[];
  }> {
    return {
      memoryCacheSize: this.memoryCache.size,
      redisConnected: await redisClient.exists('test'),
      memoryCacheKeys: Array.from(this.memoryCache.keys())
    };
  }

  /**
   * Clear all caches
   */
  async clearAll(): Promise<void> {
    this.memoryCache.clear();
    try {
      await redisClient.flushdb();
    } catch (error) {
      console.error('Redis flush error:', error);
    }
  }

  // Private methods for memory cache management
  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.value;
  }

  private setInMemory<T>(key: string, value: T, ttl: number): void {
    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }

  private cleanupMemoryCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiry) {
        this.memoryCache.delete(key);
      }
    }
  }
}

export const cacheManager = CacheManager.getInstance();

// Utility functions for common caching patterns
export const cacheUtils = {
  /**
   * Cache with automatic invalidation on data changes
   */
  async withInvalidation<T>(
    cacheType: CacheType,
    key: string,
    fallback: () => Promise<T>,
    invalidationKeys?: string[]
  ): Promise<T> {
    const result = await cacheManager.get(cacheType, key, fallback);
    
    if (invalidationKeys) {
      // Set up invalidation triggers
      invalidationKeys.forEach(invKey => {
        // This could be enhanced with event-driven invalidation
        console.log(`Cache ${key} will be invalidated when ${invKey} changes`);
      });
    }
    
    return result as T;
  },

  /**
   * Cache with background refresh
   */
  async withBackgroundRefresh<T>(
    cacheType: CacheType,
    key: string,
    fallback: () => Promise<T>,
    refreshThreshold: number = 0.8 // Refresh when 80% of TTL has passed
  ): Promise<T> {
    const config = CACHE_CONFIG[cacheType];
    const result = await cacheManager.get(cacheType, key, fallback);
    
    // Schedule background refresh
    setTimeout(async () => {
      try {
        const freshData = await fallback();
        await cacheManager.set(cacheType, key, freshData);
      } catch (error) {
        console.error('Background refresh failed:', error);
      }
    }, config.ttl * 1000 * refreshThreshold);
    
    return result as T;
  }
};
