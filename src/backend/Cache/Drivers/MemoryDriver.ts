/**
 * Memory Cache Driver
 *
 * In-memory cache driver using a Map. Data is lost when the process restarts.
 * Best for development or single-process applications.
 */

import { CacheDriver } from './CacheDriver';

interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number | null; // null means forever
}

export class MemoryDriver extends CacheDriver {
  private store: Map<string, CacheEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    // Run cleanup every minute to remove expired entries
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  getName(): string {
    return 'memory';
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiresAt !== null && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async put<T = unknown>(key: string, value: T, ttl?: number): Promise<boolean> {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : null;

    this.store.set(key, {
      value,
      expiresAt,
    });

    return true;
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async forget(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  async flush(): Promise<boolean> {
    this.store.clear();
    return true;
  }

  async many<T = unknown>(keys: string[]): Promise<Record<string, T | null>> {
    const result: Record<string, T | null> = {};

    for (const key of keys) {
      result[key] = await this.get<T>(key);
    }

    return result;
  }

  async putMany<T = unknown>(items: Record<string, T>, ttl?: number): Promise<boolean> {
    for (const [key, value] of Object.entries(items)) {
      await this.put(key, value, ttl);
    }
    return true;
  }

  async increment(key: string, value: number = 1): Promise<number> {
    const current = await this.get<number>(key);
    const newValue = (current || 0) + value;

    // Preserve TTL if exists
    const entry = this.store.get(key);
    const remainingTtl = entry?.expiresAt
      ? Math.max(0, Math.floor((entry.expiresAt - Date.now()) / 1000))
      : undefined;

    await this.put(key, newValue, remainingTtl);
    return newValue;
  }

  async decrement(key: string, value: number = 1): Promise<number> {
    return this.increment(key, -value);
  }

  async forever<T = unknown>(key: string, value: T): Promise<boolean> {
    return this.put(key, value);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt !== null && entry.expiresAt < now) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Stop the cleanup interval (for testing/shutdown)
   */
  public stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get the current size of the cache
   */
  public size(): number {
    return this.store.size;
  }
}

export default MemoryDriver;
