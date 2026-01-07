/**
 * File Cache Driver
 *
 * File-based cache driver. Stores cache entries as JSON files.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { CacheDriver } from './CacheDriver';

interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number | null;
}

export class FileDriver extends CacheDriver {
  private cachePath: string;

  constructor(cachePath: string = './storage/cache') {
    super();
    this.cachePath = path.resolve(process.cwd(), cachePath);
    this.ensureDirectory();
  }

  getName(): string {
    return 'file';
  }

  private ensureDirectory(): void {
    if (!fs.existsSync(this.cachePath)) {
      fs.mkdirSync(this.cachePath, { recursive: true });
    }
  }

  private getFilePath(key: string): string {
    // Hash the key to create a safe filename
    const hash = crypto.createHash('md5').update(key).digest('hex');
    return path.join(this.cachePath, `${hash}.cache`);
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const filePath = this.getFilePath(key);

    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const entry: CacheEntry<T> = JSON.parse(content);

      // Check if expired
      if (entry.expiresAt !== null && entry.expiresAt < Date.now()) {
        fs.unlinkSync(filePath);
        return null;
      }

      return entry.value;
    } catch {
      return null;
    }
  }

  async put<T = unknown>(key: string, value: T, ttl?: number): Promise<boolean> {
    const filePath = this.getFilePath(key);
    const expiresAt = ttl ? Date.now() + ttl * 1000 : null;

    const entry: CacheEntry<T> = {
      value,
      expiresAt,
    };

    try {
      fs.writeFileSync(filePath, JSON.stringify(entry), 'utf-8');
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
    const filePath = this.getFilePath(key);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return true;
    } catch {
      return false;
    }
  }

  async flush(): Promise<boolean> {
    try {
      const files = fs.readdirSync(this.cachePath);
      for (const file of files) {
        if (file.endsWith('.cache')) {
          fs.unlinkSync(path.join(this.cachePath, file));
        }
      }
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
    return this.put(key, value);
  }

  /**
   * Clean up expired cache files
   */
  async cleanup(): Promise<number> {
    let cleaned = 0;

    try {
      const files = fs.readdirSync(this.cachePath);
      const now = Date.now();

      for (const file of files) {
        if (!file.endsWith('.cache')) continue;

        const filePath = path.join(this.cachePath, file);
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const entry: CacheEntry = JSON.parse(content);

          if (entry.expiresAt !== null && entry.expiresAt < now) {
            fs.unlinkSync(filePath);
            cleaned++;
          }
        } catch {
          // Invalid file, remove it
          fs.unlinkSync(filePath);
          cleaned++;
        }
      }
    } catch {
      // Ignore errors
    }

    return cleaned;
  }
}

export default FileDriver;
