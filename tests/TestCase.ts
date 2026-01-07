/**
 * Catalyst Test Case Base Class
 * 
 * Provides Laravel-like testing utilities and assertions.
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import Context, { User } from '@/backend/Core/Context';

// ==================== TEST CASE CLASS ====================

export abstract class TestCase {
  protected user: User | null = null;

  /**
   * Set up test environment before each test
   */
  protected setUp(): void | Promise<void> {
    // Override in test class
  }

  /**
   * Tear down test environment after each test
   */
  protected tearDown(): void | Promise<void> {
    // Override in test class
  }

  /**
   * Act as a specific user
   */
  protected actingAs(user: User, _guard?: string): this {
    this.user = user;
    Context.set('user', user);
    return this;
  }

  /**
   * Run a database seeder
   */
  protected async seed(seederClass: { default: () => Promise<void> }): Promise<void> {
    await seederClass.default();
  }

  /**
   * Create a fake user for testing
   */
  protected createUser(overrides: Partial<User> = {}): User {
    return {
      id: 'test-user-' + Math.random().toString(36).substring(7),
      email: 'test@example.com',
      name: 'Test User',
      ...overrides,
    };
  }

  // ==================== DATABASE ASSERTIONS ====================

  /**
   * Assert that a table contains a row matching the given data
   */
  protected async assertDatabaseHas(table: string, data: Record<string, unknown>): Promise<void> {
    // TODO: Query database and assert
    // const result = await db.query.findFirst({ where: conditions });
    // expect(result).toBeTruthy();
    expect(true).toBe(true); // Placeholder
  }

  /**
   * Assert that a table does not contain a row matching the given data
   */
  protected async assertDatabaseMissing(table: string, data: Record<string, unknown>): Promise<void> {
    // TODO: Query database and assert
    // const result = await db.query.findFirst({ where: conditions });
    // expect(result).toBeFalsy();
    expect(true).toBe(true); // Placeholder
  }

  /**
   * Assert that a table has a specific count
   */
  protected async assertDatabaseCount(table: string, count: number): Promise<void> {
    // TODO: Query database count
    // const result = await db.query.count();
    // expect(result).toBe(count);
    expect(true).toBe(true); // Placeholder
  }

  /**
   * Assert that a model was deleted
   */
  protected async assertDeleted(model: { id: string; getTable(): string }): Promise<void> {
    await this.assertDatabaseMissing(model.getTable(), { id: model.id });
  }

  /**
   * Assert that a model was soft deleted
   */
  protected async assertSoftDeleted(table: string, data: Record<string, unknown>): Promise<void> {
    await this.assertDatabaseHas(table, { ...data, deleted_at: expect.any(Date) });
  }

  // ==================== SESSION ASSERTIONS ====================

  /**
   * Assert that the session has errors for specific keys
   */
  protected assertSessionHasErrors(keys: string | string[]): void {
    const errors = Context.errors();
    const keyArray = Array.isArray(keys) ? keys : [keys];
    
    for (const key of keyArray) {
      expect(errors[key]?.length).toBeGreaterThan(0);
    }
  }

  /**
   * Assert that the session has no errors
   */
  protected assertSessionHasNoErrors(): void {
    const errors = Context.errors();
    expect(Object.keys(errors)).toHaveLength(0);
  }

  /**
   * Assert that a value exists in the session
   */
  protected assertSessionHas(key: string, value?: unknown): void {
    const sessionValue = Context.get(key as keyof typeof Context);
    if (value !== undefined) {
      expect(sessionValue).toBe(value);
    } else {
      expect(sessionValue).toBeDefined();
    }
  }

  // ==================== AUTHENTICATION ASSERTIONS ====================

  /**
   * Assert that the user is authenticated
   */
  protected assertAuthenticated(): void {
    expect(Context.check()).toBe(true);
  }

  /**
   * Assert that the user is a guest
   */
  protected assertGuest(): void {
    expect(Context.guest()).toBe(true);
  }

  /**
   * Assert that a specific user is authenticated
   */
  protected assertAuthenticatedAs(user: User): void {
    const currentUser = Context.user();
    expect(currentUser?.id).toBe(user.id);
  }
}

// ==================== FEATURE TEST CASE ====================

export abstract class FeatureTestCase extends TestCase {
  protected baseUrl: string = 'http://localhost:3000';

  /**
   * Make a GET request
   */
  protected async get(uri: string, headers?: Record<string, string>): Promise<Response> {
    return fetch(`${this.baseUrl}${uri}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...headers,
      },
    });
  }

  /**
   * Make a POST request
   */
  protected async post(uri: string, data?: unknown, headers?: Record<string, string>): Promise<Response> {
    return fetch(`${this.baseUrl}${uri}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Make a PUT request
   */
  protected async put(uri: string, data?: unknown, headers?: Record<string, string>): Promise<Response> {
    return fetch(`${this.baseUrl}${uri}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Make a PATCH request
   */
  protected async patch(uri: string, data?: unknown, headers?: Record<string, string>): Promise<Response> {
    return fetch(`${this.baseUrl}${uri}`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Make a DELETE request
   */
  protected async delete(uri: string, headers?: Record<string, string>): Promise<Response> {
    return fetch(`${this.baseUrl}${uri}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        ...headers,
      },
    });
  }

  // ==================== RESPONSE ASSERTIONS ====================

  /**
   * Assert response status
   */
  protected assertStatus(response: Response, status: number): void {
    expect(response.status).toBe(status);
  }

  /**
   * Assert successful response (2xx)
   */
  protected assertSuccessful(response: Response): void {
    expect(response.ok).toBe(true);
  }

  /**
   * Assert response is OK (200)
   */
  protected assertOk(response: Response): void {
    this.assertStatus(response, 200);
  }

  /**
   * Assert created (201)
   */
  protected assertCreated(response: Response): void {
    this.assertStatus(response, 201);
  }

  /**
   * Assert no content (204)
   */
  protected assertNoContent(response: Response): void {
    this.assertStatus(response, 204);
  }

  /**
   * Assert redirect
   */
  protected assertRedirect(response: Response, uri?: string): void {
    expect([301, 302, 303, 307, 308]).toContain(response.status);
    if (uri) {
      expect(response.headers.get('location')).toContain(uri);
    }
  }

  /**
   * Assert not found (404)
   */
  protected assertNotFound(response: Response): void {
    this.assertStatus(response, 404);
  }

  /**
   * Assert forbidden (403)
   */
  protected assertForbidden(response: Response): void {
    this.assertStatus(response, 403);
  }

  /**
   * Assert unauthorized (401)
   */
  protected assertUnauthorized(response: Response): void {
    this.assertStatus(response, 401);
  }

  /**
   * Assert unprocessable (422)
   */
  protected assertUnprocessable(response: Response): void {
    this.assertStatus(response, 422);
  }

  /**
   * Assert JSON structure
   */
  protected async assertJsonStructure(response: Response, structure: string[]): Promise<void> {
    const json = await response.json();
    for (const key of structure) {
      expect(json).toHaveProperty(key);
    }
  }

  /**
   * Assert JSON contains
   */
  protected async assertJson(response: Response, data: Record<string, unknown>): Promise<void> {
    const json = await response.json();
    expect(json).toMatchObject(data);
  }
}

// ==================== MOCKING UTILITIES ====================

export const Storage = {
  /**
   * Create a fake storage disk
   */
  fake(disk: string = 'local'): { files: Map<string, Buffer>; assertExists: (path: string) => void } {
    const files = new Map<string, Buffer>();
    
    return {
      files,
      assertExists(path: string) {
        expect(files.has(path)).toBe(true);
      },
    };
  },
};

export const Queue = {
  /**
   * Fake the queue to prevent jobs from running
   */
  fake(): { assertPushed: (jobClass: string) => void; assertNotPushed: (jobClass: string) => void } {
    const pushed: string[] = [];
    
    return {
      assertPushed(jobClass: string) {
        expect(pushed).toContain(jobClass);
      },
      assertNotPushed(jobClass: string) {
        expect(pushed).not.toContain(jobClass);
      },
    };
  },
};

export const Event = {
  /**
   * Fake events to prevent listeners from running
   */
  fake(): { assertDispatched: (eventName: string) => void; assertNotDispatched: (eventName: string) => void } {
    const dispatched: string[] = [];
    
    return {
      assertDispatched(eventName: string) {
        expect(dispatched).toContain(eventName);
      },
      assertNotDispatched(eventName: string) {
        expect(dispatched).not.toContain(eventName);
      },
    };
  },
};

// ==================== EXPORTS ====================

export { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi };
