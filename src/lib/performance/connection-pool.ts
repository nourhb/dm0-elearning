import { getAdminServices } from '../firebase-admin';

// Connection pool configuration for high concurrency
const POOL_CONFIG = {
  maxConnections: 50,
  minConnections: 10,
  acquireTimeout: 30000, // 30 seconds
  idleTimeout: 60000, // 1 minute
  maxIdleTime: 300000, // 5 minutes
  connectionTimeout: 10000, // 10 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;

interface Connection {
  id: string;
  createdAt: number;
  lastUsed: number;
  inUse: boolean;
  firebaseApp: any;
}

class ConnectionPool {
  private static instance: ConnectionPool;
  private connections: Map<string, Connection> = new Map();
  private waitingQueue: Array<{
    resolve: (connection: Connection) => void;
    reject: (error: Error) => void;
    timestamp: number;
  }> = [];
  private cleanupInterval: NodeJS.Timeout;

  private constructor() {
    // Initialize minimum connections
    this.initializePool();
    
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleConnections();
    }, 30000); // Every 30 seconds
  }

  static getInstance(): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool();
    }
    return ConnectionPool.instance;
  }

  private async initializePool(): Promise<void> {
    for (let i = 0; i < POOL_CONFIG.minConnections; i++) {
      await this.createConnection();
    }
  }

  private async createConnection(): Promise<Connection> {
    try {
      const { auth, db } = getAdminServices();
      const connection: Connection = {
        id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        inUse: false,
        firebaseApp: { auth, db }
      };

      this.connections.set(connection.id, connection);
      console.log(`Created connection ${connection.id}, total: ${this.connections.size}`);
      return connection;
    } catch (error) {
      console.error('Failed to create connection:', error);
      throw error;
    }
  }

  async acquire(): Promise<Connection> {
    // Try to find an available connection
    for (const connection of this.connections.values()) {
      if (!connection.inUse) {
        connection.inUse = true;
        connection.lastUsed = Date.now();
        return connection;
      }
    }

    // If no available connections and under max limit, create new one
    if (this.connections.size < POOL_CONFIG.maxConnections) {
      const newConnection = await this.createConnection();
      newConnection.inUse = true;
      newConnection.lastUsed = Date.now();
      return newConnection;
    }

    // Wait for a connection to become available
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.waitingQueue.findIndex(item => item.reject === reject);
        if (index > -1) {
          this.waitingQueue.splice(index, 1);
        }
        reject(new Error('Connection acquisition timeout'));
      }, POOL_CONFIG.acquireTimeout);

      this.waitingQueue.push({
        resolve: (connection: Connection) => {
          clearTimeout(timeout);
          resolve(connection);
        },
        reject: (error: Error) => {
          clearTimeout(timeout);
          reject(error);
        },
        timestamp: Date.now()
      });
    });
  }

  release(connection: Connection): void {
    if (!this.connections.has(connection.id)) {
      console.warn(`Attempted to release non-existent connection: ${connection.id}`);
      return;
    }

    connection.inUse = false;
    connection.lastUsed = Date.now();

    // Process waiting queue
    if (this.waitingQueue.length > 0) {
      const nextRequest = this.waitingQueue.shift();
      if (nextRequest) {
        connection.inUse = true;
        connection.lastUsed = Date.now();
        nextRequest.resolve(connection);
      }
    }
  }

  private cleanupIdleConnections(): void {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [id, connection] of this.connections.entries()) {
      if (!connection.inUse && 
          now - connection.lastUsed > POOL_CONFIG.maxIdleTime &&
          this.connections.size > POOL_CONFIG.minConnections) {
        toRemove.push(id);
      }
    }

    toRemove.forEach(id => {
      this.connections.delete(id);
      console.log(`Removed idle connection ${id}`);
    });
  }

  async executeWithConnection<T>(
    operation: (connection: Connection) => Promise<T>
  ): Promise<T> {
    let connection: Connection | null = null;
    
    try {
      connection = await this.acquire();
      return await operation(connection);
    } catch (error) {
      console.error('Connection operation failed:', error);
      throw error;
    } finally {
      if (connection) {
        this.release(connection);
      }
    }
  }

  getStats(): {
    totalConnections: number;
    activeConnections: number;
    idleConnections: number;
    waitingRequests: number;
  } {
    let activeCount = 0;
    let idleCount = 0;

    for (const connection of this.connections.values()) {
      if (connection.inUse) {
        activeCount++;
      } else {
        idleCount++;
      }
    }

    return {
      totalConnections: this.connections.size,
      activeConnections: activeCount,
      idleConnections: idleCount,
      waitingRequests: this.waitingQueue.length
    };
  }

  async shutdown(): Promise<void> {
    clearInterval(this.cleanupInterval);
    
    // Reject all waiting requests
    this.waitingQueue.forEach(request => {
      request.reject(new Error('Connection pool shutdown'));
    });
    this.waitingQueue = [];

    // Clear all connections
    this.connections.clear();
    
    console.log('Connection pool shutdown complete');
  }
}

export const connectionPool = ConnectionPool.getInstance();

// Utility function for executing database operations with connection pooling
export async function withConnection<T>(
  operation: (firebaseApp: { auth: any; db: any }) => Promise<T>
): Promise<T> {
  return connectionPool.executeWithConnection(async (connection) => {
    return await operation(connection.firebaseApp);
  });
}

// Batch operations with connection pooling
export async function batchWithConnection<T>(
  operations: Array<(firebaseApp: { auth: any; db: any }) => Promise<T>>
): Promise<T[]> {
  return connectionPool.executeWithConnection(async (connection) => {
    const results: T[] = [];
    
    for (const operation of operations) {
      try {
        const result = await operation(connection.firebaseApp);
        results.push(result);
      } catch (error) {
        console.error('Batch operation failed:', error);
        throw error;
      }
    }
    
    return results;
  });
}

// Connection pool health check
export async function checkConnectionPoolHealth(): Promise<{
  healthy: boolean;
  stats: any;
  errors: string[];
}> {
  const errors: string[] = [];
  const stats = connectionPool.getStats();

  // Check if pool is healthy
  if (stats.totalConnections < POOL_CONFIG.minConnections) {
    errors.push(`Pool has fewer connections than minimum: ${stats.totalConnections}/${POOL_CONFIG.minConnections}`);
  }

  if (stats.waitingRequests > 10) {
    errors.push(`Too many waiting requests: ${stats.waitingRequests}`);
  }

  // Test connection acquisition
  try {
    const testConnection = await connectionPool.acquire();
    connectionPool.release(testConnection);
  } catch (error) {
    errors.push(`Connection acquisition test failed: ${error}`);
  }

  return {
    healthy: errors.length === 0,
    stats,
    errors
  };
}
