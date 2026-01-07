/**
 * Catalyst Database Configuration
 * 
 * Database connection settings following Laravel's config/database.php pattern.
 * Supports multiple connection types and read/write separation.
 */

export interface ConnectionConfig {
  driver: 'sqlite' | 'postgres' | 'mysql';
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  charset?: string;
  prefix?: string;
  schema?: string;
  sslmode?: string;
  pool?: {
    min?: number;
    max?: number;
  };
  /** Read replica configuration */
  read?: {
    host: string[];
  };
  /** Write primary configuration */
  write?: {
    host: string;
  };
}

export interface DatabaseConfig {
  /** Default database connection name */
  default: string;
  /** Database connections dictionary */
  connections: Record<string, ConnectionConfig>;
  /** Migrations configuration */
  migrations: {
    table: string;
    directory: string;
  };
  /** Redis configuration for caching/queues */
  redis: {
    default: {
      host: string;
      port: number;
      password: string | null;
      database: number;
    };
    cache: {
      host: string;
      port: number;
      password: string | null;
      database: number;
    };
    queue: {
      host: string;
      port: number;
      password: string | null;
      database: number;
    };
  };
}

const config: DatabaseConfig = {
  default: process.env.DB_CONNECTION || 'sqlite',

  connections: {
    sqlite: {
      driver: 'sqlite',
      database: process.env.DB_DATABASE || './data/catalyst.db',
      prefix: '',
    },

    postgres: {
      driver: 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_DATABASE || 'catalyst',
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      charset: 'utf8',
      prefix: '',
      schema: 'public',
      sslmode: process.env.DB_SSLMODE || 'prefer',
      pool: {
        min: 2,
        max: 10,
      },
      // Example read/write replica configuration
      // read: {
      //   host: ['replica1.example.com', 'replica2.example.com'],
      // },
      // write: {
      //   host: 'primary.example.com',
      // },
    },

    mysql: {
      driver: 'mysql',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      database: process.env.DB_DATABASE || 'catalyst',
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      charset: 'utf8mb4',
      prefix: '',
      pool: {
        min: 2,
        max: 10,
      },
    },
  },

  migrations: {
    table: 'catalyst_migrations',
    directory: './src/database/migrations',
  },

  redis: {
    default: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || null,
      database: parseInt(process.env.REDIS_DB || '0', 10),
    },
    cache: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || null,
      database: parseInt(process.env.REDIS_CACHE_DB || '1', 10),
    },
    queue: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || null,
      database: parseInt(process.env.REDIS_QUEUE_DB || '2', 10),
    },
  },
};

export default config;
