/**
 * Catalyst Cache Configuration
 *
 * Cache settings following Laravel's config/cache.php pattern.
 * Supports memory, file, database, and Redis drivers.
 */

export type CacheDriver = 'memory' | 'file' | 'database' | 'redis' | 'null';

export interface CacheStoreConfig {
  driver: CacheDriver;
  path?: string;
  table?: string;
  connection?: string;
  host?: string;
  port?: number;
  password?: string;
  database?: number;
  prefix?: string;
}

export interface CacheConfig {
  /** Default cache store */
  default: string;
  /** Available cache stores */
  stores: Record<string, CacheStoreConfig>;
  /** Cache key prefix */
  prefix: string;
}

const config: CacheConfig = {
  default: process.env.CACHE_STORE || 'memory',

  stores: {
    memory: {
      driver: 'memory',
    },

    file: {
      driver: 'file',
      path: './storage/cache',
    },

    database: {
      driver: 'database',
      table: 'cache',
      connection: process.env.DB_CONNECTION || 'sqlite',
    },

    redis: {
      driver: 'redis',
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      database: parseInt(process.env.REDIS_CACHE_DB || '1', 10),
    },

    null: {
      driver: 'null',
    },
  },

  prefix: process.env.CACHE_PREFIX || 'catalyst_cache_',
};

export default config;
