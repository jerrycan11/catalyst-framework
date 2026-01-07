/**
 * Catalyst Cache Service
 *
 * Singleton service for caching data with multiple driver support.
 * Supports memory, file, database, and null drivers.
 *
 * @example
 * ```ts
 * import { Cache } from '@/backend/Services/Cache';
 *
 * // Basic operations
 * await Cache.put('key', 'value', 3600); // 1 hour TTL
 * const value = await Cache.get('key');
 * await Cache.forget('key');
 *
 * // Remember pattern (get or compute)
 * const users = await Cache.remember('users', 3600, async () => {
 *   return await db.query.users.findMany();
 * });
 *
 * // Using specific store
 * await Cache.store('file').put('key', 'value');
 *
 * // Tags (for grouped invalidation)
 * await Cache.tags(['users', 'posts']).put('key', 'value');
 * await Cache.tags(['users']).flush();
 * ```
 */

import cacheConfig, { CacheDriver as CacheDriverType } from '../../../config/cache';
import { CacheDriverInterface } from '../Cache/Drivers/CacheDriver';
import { MemoryDriver } from '../Cache/Drivers/MemoryDriver';
import { FileDriver } from '../Cache/Drivers/FileDriver';
import { DatabaseDriver } from '../Cache/Drivers/DatabaseDriver';
import { NullDriver } from '../Cache/Drivers/NullDriver';
import { Log } from './Logger';

class CacheService {
  private static instance: CacheService | null = null;
  private drivers: Map<string, CacheDriverInterface> = new Map();
  private defaultStore: string;
  private prefix: string;

  private constructor() {
    this.defaultStore = cacheConfig.default;
    this.prefix = cacheConfig.prefix;
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Reset the singleton instance (for testing)
   */
  public static reset(): void {
    CacheService.instance = null;
  }

  /**
   * Get a cache driver instance
   */
  private getDriver(name?: string): CacheDriverInterface {
    const storeName = name || this.defaultStore;

    if (!this.drivers.has(storeName)) {
      this.drivers.set(storeName, this.createDriver(storeName));
    }

    return this.drivers.get(storeName)!;
  }

  /**
   * Create a driver instance
   */
  private createDriver(name: string): CacheDriverInterface {
    const config = cacheConfig.stores[name];

    if (!config) {
      throw new Error(`Cache store [${name}] not configured.`);
    }

    switch (config.driver as CacheDriverType) {
      case 'memory':
        return new MemoryDriver();
      case 'file':
        return new FileDriver(config.path);
      case 'database':
        return new DatabaseDriver(this.prefix);
      case 'redis':
        // TODO: Implement Redis driver
        Log.warning('Redis cache driver not yet implemented, falling back to memory');
        return new MemoryDriver();
      case 'null':
        return new NullDriver();
      default:
        throw new Error(`Unsupported cache driver: ${config.driver}`);
    }
  }

  /**
   * Prefix a key with the cache prefix
   */
  private prefixKey(key: string): string {
    return this.prefix + key;
  }

  /**
   * Get an item from the cache
   */
  public async get<T = unknown>(key: string, defaultValue?: T): Promise<T | null> {
    const value = await this.getDriver().get<T>(this.prefixKey(key));
    return value ?? defaultValue ?? null;
  }

  /**
   * Store an item in the cache
   */
  public async put<T = unknown>(key: string, value: T, ttl?: number): Promise<boolean> {
    return this.getDriver().put(this.prefixKey(key), value, ttl);
  }

  /**
   * Check if an item exists
   */
  public async has(key: string): Promise<boolean> {
    return this.getDriver().has(this.prefixKey(key));
  }

  /**
   * Remove an item from the cache
   */
  public async forget(key: string): Promise<boolean> {
    return this.getDriver().forget(this.prefixKey(key));
  }

  /**
   * Remove all items from the cache
   */
  public async flush(): Promise<boolean> {
    return this.getDriver().flush();
  }

  /**
   * Get multiple items
   */
  public async many<T = unknown>(keys: string[]): Promise<Record<string, T | null>> {
    const prefixedKeys = keys.map((k) => this.prefixKey(k));
    const result = await this.getDriver().many<T>(prefixedKeys);

    // Remove prefix from keys in result
    const unprefixedResult: Record<string, T | null> = {};
    for (const key of keys) {
      unprefixedResult[key] = result[this.prefixKey(key)];
    }
    return unprefixedResult;
  }

  /**
   * Store multiple items
   */
  public async putMany<T = unknown>(items: Record<string, T>, ttl?: number): Promise<boolean> {
    const prefixedItems: Record<string, T> = {};
    for (const [key, value] of Object.entries(items)) {
      prefixedItems[this.prefixKey(key)] = value;
    }
    return this.getDriver().putMany(prefixedItems, ttl);
  }

  /**
   * Increment a value
   */
  public async increment(key: string, value: number = 1): Promise<number> {
    return this.getDriver().increment(this.prefixKey(key), value);
  }

  /**
   * Decrement a value
   */
  public async decrement(key: string, value: number = 1): Promise<number> {
    return this.getDriver().decrement(this.prefixKey(key), value);
  }

  /**
   * Store an item forever
   */
  public async forever<T = unknown>(key: string, value: T): Promise<boolean> {
    return this.getDriver().forever(this.prefixKey(key), value);
  }

  /**
   * Get an item or execute callback and store result
   */
  public async remember<T>(key: string, ttl: number, callback: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const value = await callback();
    await this.put(key, value, ttl);
    return value;
  }

  /**
   * Get an item or store forever
   */
  public async rememberForever<T>(key: string, callback: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const value = await callback();
    await this.forever(key, value);
    return value;
  }

  /**
   * Get and remove an item
   */
  public async pull<T = unknown>(key: string): Promise<T | null> {
    const value = await this.get<T>(key);
    await this.forget(key);
    return value;
  }

  /**
   * Add an item only if it doesn't exist
   */
  public async add<T = unknown>(key: string, value: T, ttl?: number): Promise<boolean> {
    if (await this.has(key)) {
      return false;
    }
    return this.put(key, value, ttl);
  }

  /**
   * Use a specific cache store
   */
  public store(name: string): CacheStoreInstance {
    return new CacheStoreInstance(this.getDriver(name), this.prefix);
  }

  /**
   * Get the default store name
   */
  public getDefaultStore(): string {
    return this.defaultStore;
  }

  /**
   * Set the default store
   */
  public setDefaultStore(name: string): void {
    this.defaultStore = name;
  }
}

/**
 * Cache store instance for fluent API with specific driver
 */
class CacheStoreInstance {
  constructor(
    private driver: CacheDriverInterface,
    private prefix: string
  ) {}

  private prefixKey(key: string): string {
    return this.prefix + key;
  }

  async get<T = unknown>(key: string, defaultValue?: T): Promise<T | null> {
    const value = await this.driver.get<T>(this.prefixKey(key));
    return value ?? defaultValue ?? null;
  }

  async put<T = unknown>(key: string, value: T, ttl?: number): Promise<boolean> {
    return this.driver.put(this.prefixKey(key), value, ttl);
  }

  async has(key: string): Promise<boolean> {
    return this.driver.has(this.prefixKey(key));
  }

  async forget(key: string): Promise<boolean> {
    return this.driver.forget(this.prefixKey(key));
  }

  async flush(): Promise<boolean> {
    return this.driver.flush();
  }

  async forever<T = unknown>(key: string, value: T): Promise<boolean> {
    return this.driver.forever(this.prefixKey(key), value);
  }

  async remember<T>(key: string, ttl: number, callback: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    const value = await callback();
    await this.put(key, value, ttl);
    return value;
  }
}

// Export singleton accessor
export const Cache = CacheService.getInstance();

export default CacheService;
