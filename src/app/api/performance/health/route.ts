import { NextRequest, NextResponse } from 'next/server';
import { cacheManager } from '@/lib/cache/cache-manager';
import { connectionPool } from '@/lib/performance/connection-pool';
import { redisClient } from '@/lib/cache/redis-client';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check all performance systems
    const [cacheStats, connectionPoolHealth, redisHealth] = await Promise.all([
      cacheManager.getStats(),
      connectionPool.getStats(),
      redisClient.exists('health-check')
    ]);

    const healthStatus = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      systems: {
        cache: {
          status: 'healthy',
          memoryCacheSize: cacheStats.memoryCacheSize,
          redisConnected: cacheStats.redisConnected,
          details: cacheStats
        },
        connectionPool: {
          status: connectionPoolHealth.totalConnections >= 10 ? 'healthy' : 'warning',
          totalConnections: connectionPoolHealth.totalConnections,
          activeConnections: connectionPoolHealth.activeConnections,
          idleConnections: connectionPoolHealth.idleConnections,
          waitingRequests: connectionPoolHealth.waitingRequests
        },
        redis: {
          status: redisHealth ? 'healthy' : 'error',
          connected: redisHealth
        }
      },
      performance: {
        responseTime: Date.now() - startTime,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    };

    // Determine overall health
    const hasErrors = Object.values(healthStatus.systems).some(system => system.status === 'error');
    const hasWarnings = Object.values(healthStatus.systems).some(system => system.status === 'warning');
    
    if (hasErrors) {
      healthStatus.overall = 'error';
    } else if (hasWarnings) {
      healthStatus.overall = 'warning';
    }

    const statusCode = hasErrors ? 503 : hasWarnings ? 200 : 200;

    return NextResponse.json(healthStatus, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'true',
        'X-Response-Time': `${Date.now() - startTime}ms`
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      overall: 'error',
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      performance: {
        responseTime: Date.now() - startTime,
        uptime: process.uptime()
      }
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'true',
        'X-Response-Time': `${Date.now() - startTime}ms`
      }
    });
  }
}
