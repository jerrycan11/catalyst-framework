/**
 * Null Cache Driver
 *
 * A cache driver that doesn't actually cache anything.
 * Useful for testing or when caching needs to be disabled.
 */

import { CacheDriver } from './CacheDriver';

export class NullDriver extends CacheDriver {
  getName(): string {
    return 'null';
  }

  async get<T = unknown>(): Promise<T | null> {
    return null;
  }

  async put<T = unknown>(): Promise<boolean> {
    return true;
  }

  async has(): Promise<boolean> {
    return false;
  }

  async forget(): Promise<boolean> {
    return true;
  }

  async flush(): Promise<boolean> {
    return true;
  }

  async many<T = unknown>(keys: string[]): Promise<Record<string, T | null>> {
    const result: Record<string, T | null> = {};
    for (const key of keys) {
      result[key] = null;
    }
    return result;
  }

  async putMany<T = unknown>(): Promise<boolean> {
    return true;
  }

  async increment(): Promise<number> {
    return 0;
  }

  async decrement(): Promise<number> {
    return 0;
  }

  async forever<T = unknown>(): Promise<boolean> {
    return true;
  }
}

export default NullDriver;
