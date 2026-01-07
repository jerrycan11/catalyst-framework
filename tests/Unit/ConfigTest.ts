/**
 * Example Unit Test - Config Service
 * 
 * Tests for the Config service singleton.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Config, { config, hasConfig } from '@/backend/Services/Config';

describe('Config Service', () => {
  beforeEach(() => {
    // Reset the singleton before each test
    Config.reset();
  });

  describe('getInstance', () => {
    it('returns the same instance', () => {
      const instance1 = Config.getInstance();
      const instance2 = Config.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('get', () => {
    it('retrieves top-level config values', () => {
      const appName = config('app.name');
      
      expect(appName).toBeDefined();
      expect(typeof appName).toBe('string');
    });

    it('retrieves nested config values using dot notation', () => {
      const locale = config('app.locale');
      
      expect(locale).toBe('en');
    });

    it('returns default value when key does not exist', () => {
      const value = config('app.nonexistent', 'default-value');
      
      expect(value).toBe('default-value');
    });

    it('returns undefined for non-existent keys without default', () => {
      const value = config('app.nonexistent.deep.key');
      
      expect(value).toBeUndefined();
    });
  });

  describe('has', () => {
    it('returns true for existing keys', () => {
      expect(hasConfig('app.name')).toBe(true);
      expect(hasConfig('app.locale')).toBe(true);
    });

    it('returns false for non-existing keys', () => {
      expect(hasConfig('app.nonexistent')).toBe(false);
      expect(hasConfig('nonexistent.key')).toBe(false);
    });
  });

  describe('immutability', () => {
    it('config values cannot be modified after loading', () => {
      const configInstance = Config.getInstance();
      const all = configInstance.all() as Record<string, unknown>;
      
      // The object should be frozen
      expect(Object.isFrozen(all)).toBe(true);
    });
  });
});
