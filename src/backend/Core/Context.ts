/**
 * Catalyst Request Context
 * 
 * Uses AsyncLocalStorage to provide request-scoped context throughout the
 * application, similar to Laravel's request context and dependency injection.
 * 
 * @example
 * ```ts
 * // In middleware
 * await Context.run({ user, requestId, segment: 'api' }, async () => {
 *   // All code in this callback has access to context
 *   const user = Context.get('user');
 * });
 * ```
 */

import { AsyncLocalStorage } from 'async_hooks';

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  permissions?: string[];
  [key: string]: unknown;
}

export interface ContextStore {
  /** Authenticated user (null if guest) */
  user: User | null;
  /** Unique request identifier */
  requestId: string;
  /** Request segment (web, api, console) */
  segment: 'web' | 'api' | 'console';
  /** Flash messages */
  flash?: {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
  };
  /** Validation errors */
  errors?: Record<string, string[]>;
  /** Previous URL for redirects */
  previousUrl?: string;
  /** Additional context data */
  [key: string]: unknown;
}

class Context {
  private static storage = new AsyncLocalStorage<ContextStore>();

  /**
   * Run code within a context
   * 
   * @param store - Initial context values
   * @param callback - Code to run within context
   */
  public static async run<T>(
    store: Partial<ContextStore>,
    callback: () => T | Promise<T>
  ): Promise<T> {
    const fullStore: ContextStore = {
      user: null,
      requestId: store.requestId || generateRequestId(),
      segment: 'web',
      ...store,
    };

    return this.storage.run(fullStore, callback);
  }

  /**
   * Get the current context store
   */
  public static getStore(): ContextStore | undefined {
    return this.storage.getStore();
  }

  /**
   * Get a value from the current context
   * 
   * @param key - Key to retrieve
   * @param defaultValue - Default if not found
   */
  public static get<K extends keyof ContextStore>(
    key: K,
    defaultValue?: ContextStore[K]
  ): ContextStore[K] | undefined {
    const store = this.getStore();
    if (!store) {
      return defaultValue;
    }
    return store[key] ?? defaultValue;
  }

  /**
   * Set a value in the current context
   */
  public static set<K extends keyof ContextStore>(key: K, value: ContextStore[K]): void {
    const store = this.getStore();
    if (store) {
      store[key] = value;
    }
  }

  /**
   * Check if we're running in a context
   */
  public static isActive(): boolean {
    return this.getStore() !== undefined;
  }

  /**
   * Get the authenticated user
   */
  public static user(): User | null {
    return this.get('user', null) ?? null;
  }

  /**
   * Check if user is authenticated
   */
  public static check(): boolean {
    return this.user() !== null;
  }

  /**
   * Check if user is a guest
   */
  public static guest(): boolean {
    return !this.check();
  }

  /**
   * Get the authenticated user's ID
   */
  public static id(): string | null {
    return this.user()?.id ?? null;
  }

  /**
   * Get the current request ID
   */
  public static requestId(): string {
    return this.get('requestId', 'unknown') ?? 'unknown';
  }

  /**
   * Get the current segment
   */
  public static segment(): 'web' | 'api' | 'console' {
    return this.get('segment', 'web') ?? 'web';
  }

  /**
   * Flash a message to the session
   */
  public static flash(type: 'success' | 'error' | 'warning' | 'info', message: string): void {
    const store = this.getStore();
    if (store) {
      store.flash = {
        ...store.flash,
        [type]: message,
      };
    }
  }

  /**
   * Set validation errors
   */
  public static withErrors(errors: Record<string, string[]>): void {
    const store = this.getStore();
    if (store) {
      store.errors = errors;
    }
  }

  /**
   * Get validation errors
   */
  public static errors(): Record<string, string[]> {
    return this.get('errors', {}) ?? {};
  }

  /**
   * Check if there are any errors for a field
   */
  public static hasError(field: string): boolean {
    const errors = this.errors();
    return Boolean(errors[field]?.length);
  }

  /**
   * Get the first error for a field
   */
  public static error(field: string): string | undefined {
    return this.errors()[field]?.[0];
  }
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

export default Context;
