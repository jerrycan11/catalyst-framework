/**
 * Catalyst Authorization System
 * 
 * Gate and Policy-based authorization following Laravel's patterns.
 * Provides both closure-based and class-based permission checks.
 */

import Context, { User } from '@/backend/Core/Context';

type GateCallback = (user: User | null, ...args: unknown[]) => boolean | Promise<boolean>;
type PolicyClass = new () => Policy;

// ==================== GATE ====================

class Gate {
  private static instance: Gate | null = null;
  private abilities: Map<string, GateCallback> = new Map();
  private policies: Map<string, PolicyClass> = new Map();
  private before: GateCallback[] = [];
  private after: GateCallback[] = [];

  private constructor() {}

  public static getInstance(): Gate {
    if (!Gate.instance) {
      Gate.instance = new Gate();
    }
    return Gate.instance;
  }

  /**
   * Define a new ability
   * 
   * @param ability - Name of the ability
   * @param callback - Callback that returns true if authorized
   */
  public define(ability: string, callback: GateCallback): this {
    this.abilities.set(ability, callback);
    return this;
  }

  /**
   * Register a policy for a model
   * 
   * @param model - Model name or class
   * @param policy - Policy class
   */
  public policy(model: string | Function, policyClass: PolicyClass): this {
    const modelName = typeof model === 'string' ? model : model.name;
    this.policies.set(modelName, policyClass);
    return this;
  }

  /**
   * Register a callback to run before all checks
   */
  public registerBefore(callback: GateCallback): this {
    this.before.push(callback);
    return this;
  }

  /**
   * Register a callback to run after all checks
   */
  public registerAfter(callback: GateCallback): this {
    this.after.push(callback);
    return this;
  }

  /**
   * Check if the user has the given ability
   */
  public async allows(ability: string, ...args: unknown[]): Promise<boolean> {
    const user = Context.user();

    // Run before callbacks
    for (const callback of this.before) {
      const result = await callback(user, ...args);
      if (result === true) return true;
      if (result === false) return false;
    }

    // Check for registered ability
    const abilityCallback = this.abilities.get(ability);
    if (abilityCallback) {
      const result = await abilityCallback(user, ...args);
      if (result === true || result === false) {
        return result;
      }
    }

    // Check for registered policy
    const [action, model] = this.parseAbility(ability);
    if (model && args[0]) {
      const policyInstance = this.resolvePolicy(model);
      if (policyInstance && typeof policyInstance[action as keyof Policy] === 'function') {
        const result = await (policyInstance[action as keyof Policy] as GateCallback)(user, ...args);
        if (result === true || result === false) {
          return result;
        }
      }
    }

    // Run after callbacks
    for (const callback of this.after) {
      const result = await callback(user, ...args);
      if (result === true) return true;
    }

    return false;
  }

  /**
   * Check if the user is denied the given ability
   */
  public async denies(ability: string, ...args: unknown[]): Promise<boolean> {
    return !(await this.allows(ability, ...args));
  }

  /**
   * Check ability and throw if denied
   */
  public async authorize(ability: string, ...args: unknown[]): Promise<void> {
    if (await this.denies(ability, ...args)) {
      throw new AuthorizationError(`This action is unauthorized: ${ability}`);
    }
  }

  /**
   * Check multiple abilities
   */
  public async any(abilities: string[], ...args: unknown[]): Promise<boolean> {
    for (const ability of abilities) {
      if (await this.allows(ability, ...args)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check that all abilities are allowed
   */
  public async all(abilities: string[], ...args: unknown[]): Promise<boolean> {
    for (const ability of abilities) {
      if (await this.denies(ability, ...args)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Act as a specific user for authorization checks
   */
  public forUser(user: User): GateForUser {
    return new GateForUser(this, user);
  }

  /**
   * Parse ability into action and model
   */
  private parseAbility(ability: string): [string, string | null] {
    if (ability.includes(':')) {
      const [action, model] = ability.split(':');
      return [action, model];
    }
    return [ability, null];
  }

  /**
   * Resolve a policy instance
   */
  private resolvePolicy(model: string): Policy | null {
    const policyClass = this.policies.get(model);
    if (policyClass) {
      return new policyClass();
    }
    return null;
  }

  /**
   * Get a policy for a model
   */
  public getPolicyFor(model: string | Function): Policy | null {
    const modelName = typeof model === 'string' ? model : model.name;
    return this.resolvePolicy(modelName);
  }
}

/**
 * Gate scoped to a specific user
 */
class GateForUser {
  constructor(
    private gate: Gate,
    private user: User
  ) {}

  async allows(ability: string, ...args: unknown[]): Promise<boolean> {
    // Temporarily set the user in context
    const originalUser = Context.user();
    Context.set('user', this.user);
    
    try {
      return await this.gate.allows(ability, ...args);
    } finally {
      Context.set('user', originalUser);
    }
  }

  async denies(ability: string, ...args: unknown[]): Promise<boolean> {
    return !(await this.allows(ability, ...args));
  }
}

// ==================== POLICY BASE CLASS ====================

export abstract class Policy {
  /**
   * Perform pre-authorization checks
   * Return true to allow, false to deny, undefined to continue checking
   */
  before?(user: User | null, ability: string): boolean | undefined | Promise<boolean | undefined>;

  /**
   * Default: can the user view any models?
   */
  viewAny?(user: User | null): boolean | Promise<boolean>;

  /**
   * Default: can the user view the model?
   */
  view?(user: User | null, model: unknown): boolean | Promise<boolean>;

  /**
   * Default: can the user create models?
   */
  create?(user: User | null): boolean | Promise<boolean>;

  /**
   * Default: can the user update the model?
   */
  update?(user: User | null, model: unknown): boolean | Promise<boolean>;

  /**
   * Default: can the user delete the model?
   */
  delete?(user: User | null, model: unknown): boolean | Promise<boolean>;

  /**
   * Default: can the user restore the model?
   */
  restore?(user: User | null, model: unknown): boolean | Promise<boolean>;

  /**
   * Default: can the user permanently delete the model?
   */
  forceDelete?(user: User | null, model: unknown): boolean | Promise<boolean>;
}

// ==================== AUTHORIZATION ERROR ====================

export class AuthorizationError extends Error {
  public status: number = 403;

  constructor(message: string = 'This action is unauthorized.') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

// ==================== AUTHORIZATION MIDDLEWARE ====================

import { NextRequest, NextResponse } from 'next/server';
import type { Middleware, NextFunction } from '@/backend/Core/Pipeline';

/**
 * Can Middleware
 * 
 * Checks authorization before allowing access to a route.
 * 
 * @example
 * Can:update-post,post
 */
export class Can implements Middleware {
  constructor(
    private ability: string,
    private modelParam?: string
  ) {}

  async handle(request: NextRequest, next: NextFunction): Promise<NextResponse> {
    const gate = Gate.getInstance();
    
    // Extract model from request if needed
    let args: unknown[] = [];
    if (this.modelParam) {
      // Get from URL params or body
      const url = new URL(request.url);
      const id = url.searchParams.get(this.modelParam);
      if (id) {
        args = [{ id }]; // Simplified - in production, fetch actual model
      }
    }

    try {
      await gate.authorize(this.ability, ...args);
      return next();
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status }
        );
      }
      throw error;
    }
  }
}

// ==================== EXPORTS ====================

export const gate = Gate.getInstance();
export { Gate, GateForUser };
export default Gate;
