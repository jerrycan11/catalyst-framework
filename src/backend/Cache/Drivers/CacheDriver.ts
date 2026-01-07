/**
 * Cache Driver Interface
 *
 * Contract that all cache drivers must implement.
 */

export interface CacheDriverInterface {
  /**
   * Get an item from the cache
   */
  get<T = unknown>(key: string): Promise<T | null>;

  /**
   * Store an item in the cache
   * @param key Cache key
   * @param value Value to store
   * @param ttl Time to live in seconds (optional)
   */
  put<T = unknown>(key: string, value: T, ttl?: number): Promise<boolean>;

  /**
   * Check if an item exists in the cache
   */
  has(key: string): Promise<boolean>;

  /**
   * Remove an item from the cache
   */
  forget(key: string): Promise<boolean>;

  /**
   * Remove all items from the cache
   */
  flush(): Promise<boolean>;

  /**
   * Get multiple items from the cache
   */
  many<T = unknown>(keys: string[]): Promise<Record<string, T | null>>;

  /**
   * Store multiple items in the cache
   */
  putMany<T = unknown>(items: Record<string, T>, ttl?: number): Promise<boolean>;

  /**
   * Increment a value
   */
  increment(key: string, value?: number): Promise<number>;

  /**
   * Decrement a value
   */
  decrement(key: string, value?: number): Promise<number>;

  /**
   * Store an item forever
   */
  forever<T = unknown>(key: string, value: T): Promise<boolean>;

  /**
   * Get the driver name
   */
  getName(): string;
}

export abstract class CacheDriver implements CacheDriverInterface {
  abstract get<T = unknown>(key: string): Promise<T | null>;
  abstract put<T = unknown>(key: string, value: T, ttl?: number): Promise<boolean>;
  abstract has(key: string): Promise<boolean>;
  abstract forget(key: string): Promise<boolean>;
  abstract flush(): Promise<boolean>;
  abstract many<T = unknown>(keys: string[]): Promise<Record<string, T | null>>;
  abstract putMany<T = unknown>(items: Record<string, T>, ttl?: number): Promise<boolean>;
  abstract increment(key: string, value?: number): Promise<number>;
  abstract decrement(key: string, value?: number): Promise<number>;
  abstract forever<T = unknown>(key: string, value: T): Promise<boolean>;
  abstract getName(): string;
}

export default CacheDriver;
