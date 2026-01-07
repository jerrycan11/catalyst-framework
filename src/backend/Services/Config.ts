/**
 * Catalyst Config Service
 * 
 * A Singleton configuration accessor providing Laravel-like dot-notation access
 * to the application's configuration values.
 * 
 * @example
 * ```ts
 * const config = Config.getInstance();
 * const appName = config.get('app.name', 'Catalyst');
 * const debug = config.get('app.debug') as boolean;
 * ```
 */

import appConfig from '../../../config/app';
import databaseConfig from '../../../config/database';
import filesystemsConfig from '../../../config/filesystems';
import loggingConfig from '../../../config/logging';
import authConfig from '../../../config/auth';
import mailConfig from '../../../config/mail';
import cacheConfig from '../../../config/cache';
import eventsConfig from '../../../config/events';

type ConfigValue = string | number | boolean | null | undefined | ConfigObject | ConfigValue[];
interface ConfigObject {
  [key: string]: ConfigValue;
}

interface ConfigRepository {
  app: typeof appConfig;
  database: typeof databaseConfig;
  filesystems: typeof filesystemsConfig;
  logging: typeof loggingConfig;
  auth: typeof authConfig;
  mail: typeof mailConfig;
  cache: typeof cacheConfig;
  events: typeof eventsConfig;
}

class Config {
  private static instance: Config | null = null;
  private readonly config: ConfigRepository;
  private frozen: boolean = false;

  private constructor() {
    // Load all configuration modules
    this.config = {
      app: appConfig,
      database: databaseConfig,
      filesystems: filesystemsConfig,
      logging: loggingConfig,
      auth: authConfig,
      mail: mailConfig,
      cache: cacheConfig,
      events: eventsConfig,
    };

    // Freeze configuration after loading to make it immutable
    this.frozen = true;
    Object.freeze(this.config);
  }

  /**
   * Get the singleton instance of the Config class
   */
  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static reset(): void {
    Config.instance = null;
  }

  /**
   * Get a configuration value using dot-notation
   * 
   * @param key - Dot-notation key (e.g., 'app.name', 'database.connections.sqlite')
   * @param defaultValue - Default value if key is not found
   * @returns The configuration value or default
   * 
   * @example
   * ```ts
   * config.get('app.name'); // Returns app name
   * config.get('app.unknown', 'default'); // Returns 'default'
   * config.get('database.connections.sqlite.driver'); // Deep access
   * ```
   */
  public get<T = ConfigValue>(key: string, defaultValue?: T): T {
    const keys = key.split('.');
    let current: ConfigValue = this.config as unknown as ConfigValue;

    for (const k of keys) {
      if (current === null || current === undefined) {
        return defaultValue as T;
      }
      
      if (typeof current === 'object' && !Array.isArray(current)) {
        current = (current as ConfigObject)[k];
      } else {
        return defaultValue as T;
      }
    }

    return (current === undefined ? defaultValue : current) as T;
  }

  /**
   * Check if a configuration key exists
   * 
   * @param key - Dot-notation key to check
   * @returns boolean indicating if the key exists
   * 
   * @example
   * ```ts
   * config.has('app.name'); // true
   * config.has('app.nonexistent'); // false
   * ```
   */
  public has(key: string): boolean {
    const keys = key.split('.');
    let current: ConfigValue = this.config as unknown as ConfigValue;

    for (const k of keys) {
      if (current === null || current === undefined) {
        return false;
      }
      
      if (typeof current === 'object' && !Array.isArray(current)) {
        if (!(k in (current as ConfigObject))) {
          return false;
        }
        current = (current as ConfigObject)[k];
      } else {
        return false;
      }
    }

    return true;
  }

  /**
   * Get all configuration values for a top-level key
   * 
   * @param key - Top-level config key (e.g., 'app', 'database')
   * @returns The entire configuration object for that key
   */
  public all(key?: keyof ConfigRepository): ConfigValue {
    if (key) {
      return this.config[key] as unknown as ConfigValue;
    }
    return this.config as unknown as ConfigValue;
  }
}

// Export singleton accessor function for convenience
export function config<T = ConfigValue>(key: string, defaultValue?: T): T {
  return Config.getInstance().get<T>(key, defaultValue);
}

export function hasConfig(key: string): boolean {
  return Config.getInstance().has(key);
}

export default Config;
