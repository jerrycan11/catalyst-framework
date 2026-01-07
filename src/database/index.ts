/**
 * Catalyst Database Connection Factory
 * 
 * Provides lazy database connection establishment with read/write replica support.
 */

import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { config } from '@/backend/Services/Config';
import * as schema from './schema';

type DrizzleDB = BetterSQLite3Database<typeof schema>;

interface ConnectionPool {
  read: DrizzleDB | null;
  write: DrizzleDB | null;
}

class DatabaseFactory {
  private static instance: DatabaseFactory | null = null;
  private connections: Map<string, ConnectionPool> = new Map();
  private defaultConnection: string;

  private constructor() {
    this.defaultConnection = config<string>('database.default', 'sqlite');
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): DatabaseFactory {
    if (!DatabaseFactory.instance) {
      DatabaseFactory.instance = new DatabaseFactory();
    }
    return DatabaseFactory.instance;
  }

  /**
   * Reset instance (for testing)
   */
  public static reset(): void {
    if (DatabaseFactory.instance) {
      // Close all connections
      DatabaseFactory.instance.disconnectAll();
    }
    DatabaseFactory.instance = null;
  }

  /**
   * Get a database connection
   * 
   * @param name - Connection name (default: from config)
   * @param forWrite - Whether this is for a write operation (uses write replica if configured)
   */
  public connection(name?: string, forWrite: boolean = false): DrizzleDB {
    const connectionName = name || this.defaultConnection;
    
    let pool = this.connections.get(connectionName);
    
    if (!pool) {
      pool = { read: null, write: null };
      this.connections.set(connectionName, pool);
    }

    // For SQLite, read and write use the same connection
    // For PostgreSQL/MySQL with replicas, they would differ
    const key = forWrite ? 'write' : 'read';
    
    if (!pool[key]) {
      pool[key] = this.createConnection(connectionName);
    }

    return pool[key]!;
  }

  /**
   * Create a new database connection
   */
  private createConnection(name: string): DrizzleDB {
    const dbConfig = config<Record<string, unknown>>(`database.connections.${name}`);
    
    if (!dbConfig) {
      throw new Error(`Database connection [${name}] not configured.`);
    }

    const driver = dbConfig.driver as string;

    switch (driver) {
      case 'sqlite':
        return this.createSQLiteConnection(dbConfig);
      
      case 'postgres':
        // TODO: Implement PostgreSQL with drizzle-orm/postgres-js
        throw new Error('PostgreSQL connection not yet implemented');
      
      case 'mysql':
        // TODO: Implement MySQL with drizzle-orm/mysql2
        throw new Error('MySQL connection not yet implemented');
      
      default:
        throw new Error(`Unsupported database driver: ${driver}`);
    }
  }

  /**
   * Create SQLite connection
   */
  private createSQLiteConnection(config: Record<string, unknown>): DrizzleDB {
    const dbPath = (config.database as string) || ':memory:';
    
    // Ensure the directory exists
    if (dbPath !== ':memory:') {
      const fs = require('fs');
      const path = require('path');
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    const sqlite = new Database(dbPath);
    
    // Enable WAL mode for better concurrent performance
    sqlite.pragma('journal_mode = WAL');
    
    return drizzle(sqlite, { schema });
  }

  /**
   * Close all database connections
   */
  public disconnectAll(): void {
    for (const [, pool] of this.connections) {
      // Note: Drizzle doesn't expose close method directly
      // The underlying driver should be closed
    }
    this.connections.clear();
  }

  /**
   * Begin a database transaction
   */
  public async transaction<T>(
    callback: (db: DrizzleDB) => Promise<T>,
    connectionName?: string
  ): Promise<T> {
    const db = this.connection(connectionName, true);
    
    // Drizzle transactions
    return db.transaction(async (tx) => {
      return callback(tx as unknown as DrizzleDB);
    });
  }

  /**
   * Get the default connection name
   */
  public getDefaultConnection(): string {
    return this.defaultConnection;
  }

  /**
   * Set the default connection name
   */
  public setDefaultConnection(name: string): void {
    this.defaultConnection = name;
  }
}

// Export singleton accessors
export const db = () => DatabaseFactory.getInstance().connection();
export const dbWrite = () => DatabaseFactory.getInstance().connection(undefined, true);
export const dbConnection = (name: string) => DatabaseFactory.getInstance().connection(name);
export const transaction = DatabaseFactory.getInstance().transaction.bind(DatabaseFactory.getInstance());

export default DatabaseFactory;
