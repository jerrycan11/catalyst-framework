/**
 * Database Cache Driver
 *
 * Database-backed cache driver using the cache table.
 */

import { CacheDriver } from './CacheDriver';
import { db } from '@/database';
import { cache } from '@/database/schema';
import { eq } from 'drizzle-orm';

export class DatabaseDriver extends CacheDriver {
  private prefix: string;

  constructor(prefix: string = '') {
    super();
    this.prefix = prefix;
  }

  getName(): string {
    return 'database';
  }

  private prefixKey(key: string): string {
    return this.prefix + key;
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const prefixedKey = this.prefixKey(key);

    try {
      const result = await db()
        .select()
        .from(cache)
        .where(eq(cache.key, prefixedKey))
        .get();

      if (!result) {
        return null;
      }

      // Check if expired
      if (result.expiration < Math.floor(Date.now() / 1000)) {
        await this.forget(key);
        return null;
      }

      return JSON.parse(result.value) as T;
    } catch {
      return null;
    }
  }

  async put<T = unknown>(key: string, value: T, ttl?: number): Promise<boolean> {
    const prefixedKey = this.prefixKey(key);
    const serialized = JSON.stringify(value);
    // Default TTL: 1 year if not specified
    const expiration = ttl
      ? Math.floor(Date.now() / 1000) + ttl
      : Math.floor(Date.now() / 1000) + 31536000;

    try {
      // Try to update first
      const existing = await db()
        .select()
        .from(cache)
        .where(eq(cache.key, prefixedKey))
        .get();

      if (existing) {
        await db()
          .update(cache)
          .set({ value: serialized, expiration })
          .where(eq(cache.key, prefixedKey));
      } else {
        await db().insert(cache).values({
          key: prefixedKey,
          value: serialized,
          expiration,
        });
      }

      return true;
    } catch {
      return false;
    }
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async forget(key: string): Promise<boolean> {
    const prefixedKey = this.prefixKey(key);

    try {
      await db().delete(cache).where(eq(cache.key, prefixedKey));
      return true;
    } catch {
      return false;
    }
  }

  async flush(): Promise<boolean> {
    try {
      // Delete all entries with our prefix
      // For SQLite, we'll delete all entries
      await db().delete(cache);
      return true;
    } catch {
      return false;
    }
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
    await this.put(key, newValue);
    return newValue;
  }

  async decrement(key: string, value: number = 1): Promise<number> {
    return this.increment(key, -value);
  }

  async forever<T = unknown>(key: string, value: T): Promise<boolean> {
    // Set expiration far in the future (100 years)
    const expiration = Math.floor(Date.now() / 1000) + 3153600000;
    const prefixedKey = this.prefixKey(key);
    const serialized = JSON.stringify(value);

    try {
      const existing = await db()
        .select()
        .from(cache)
        .where(eq(cache.key, prefixedKey))
        .get();

      if (existing) {
        await db()
          .update(cache)
          .set({ value: serialized, expiration })
          .where(eq(cache.key, prefixedKey));
      } else {
        await db().insert(cache).values({
          key: prefixedKey,
          value: serialized,
          expiration,
        });
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clean up expired cache entries
   */
  async cleanup(): Promise<number> {
    try {
      const now = Math.floor(Date.now() / 1000);
      // SQLite doesn't return affected rows easily, so we count first
      const expired = await db()
        .select()
        .from(cache)
        .where(eq(cache.expiration, now))
        .all();

      await db().delete(cache);

      return expired.length;
    } catch {
      return 0;
    }
  }
}

export default DatabaseDriver;
