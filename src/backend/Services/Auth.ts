/**
 * Catalyst Authentication System
 * 
 * Provides Laravel-like authentication with multiple guards (session, token)
 * and extensible provider architecture.
 */

import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { config } from '@/backend/Services/Config';
import Context, { User } from '@/backend/Core/Context';
import { db } from '@/database';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';

// ==================== AUTH MANAGER ====================

interface AuthGuard {
  user(): Promise<User | null>;
  check(): Promise<boolean>;
  guest(): Promise<boolean>;
  id(): Promise<string | null>;
  validate(credentials: Record<string, unknown>): Promise<boolean>;
  attempt(credentials: Record<string, unknown>, remember?: boolean): Promise<boolean>;
  login(user: User, remember?: boolean): Promise<void>;
  loginUsingId(id: string, remember?: boolean): Promise<User | null>;
  logout(): Promise<void>;
}

class AuthManager {
  private static instance: AuthManager | null = null;
  private guards: Map<string, AuthGuard> = new Map();
  private defaultGuard: string = 'session';

  private constructor() {
    // Register default guards
    this.guards.set('session', new SessionGuard());
    this.guards.set('api', new TokenGuard());
  }

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  /**
   * Get a guard instance by name
   */
  public guard(name?: string): AuthGuard {
    const guardName = name || this.defaultGuard;
    const guard = this.guards.get(guardName);
    
    if (!guard) {
      throw new Error(`Auth guard [${guardName}] is not defined.`);
    }
    
    return guard;
  }

  /**
   * Register a custom guard
   */
  public extend(name: string, guard: AuthGuard): void {
    this.guards.set(name, guard);
  }

  /**
   * Set the default guard
   */
  public setDefaultGuard(name: string): void {
    this.defaultGuard = name;
  }

  /**
   * Get the currently authenticated user
   */
  public async user(): Promise<User | null> {
    return this.guard().user();
  }

  /**
   * Check if the user is authenticated
   */
  public async check(): Promise<boolean> {
    return this.guard().check();
  }

  /**
   * Check if the user is a guest
   */
  public async guest(): Promise<boolean> {
    return this.guard().guest();
  }

  /**
   * Get the authenticated user's ID
   */
  /**
   * Get the authenticated user's ID
   */
  /**
   * Get the authenticated user's ID
   */
  public async id(): Promise<string | null> {
    return this.guard().id();
  }

  /**
   * Validate a user's credentials
   */
  public async validate(credentials: Record<string, unknown>): Promise<boolean> {
    return this.guard().validate(credentials);
  }

  /**
   * Attempt to authenticate a user
   */
  public async attempt(credentials: Record<string, unknown>, remember: boolean = false): Promise<boolean> {
    return this.guard().attempt(credentials, remember);
  }

  /**
   * Log a user into the application
   */
  public async login(user: User, remember: boolean = false): Promise<void> {
    return this.guard().login(user, remember);
  }

  /**
   * Log a user into the application by ID
   */
  public async loginUsingId(id: string, remember: boolean = false): Promise<User | null> {
    return this.guard().loginUsingId(id, remember);
  }

  /**
   * Log the user out of the application
   */
  public async logout(): Promise<void> {
    return this.guard().logout();
  }
}

// ==================== SESSION GUARD ====================

import { session } from '@/backend/Services/Session';

class SessionGuard implements AuthGuard {
  private cachedUser: User | null = null;
  private userLoaded: boolean = false;

  async user(): Promise<User | null> {
    if (this.userLoaded) {
      return this.cachedUser;
    }

    // Check context first
    const contextUser = Context.user();
    if (contextUser) {
      this.cachedUser = contextUser;
      this.userLoaded = true;
      return contextUser;
    }

    // Validate using SessionService
    const validation = await session.validateSession();
    
    if (validation.valid && validation.user) {
      this.cachedUser = validation.user;
    } else if (validation.needsRefresh) {
      // Try to refresh
      const refresh = await session.refreshSession();
      if (refresh.success) {
        // Re-validate after refresh to get user
        const revalidation = await session.validateSession();
        if (revalidation.valid && revalidation.user) {
          this.cachedUser = revalidation.user;
        }
      }
    }

    this.userLoaded = true;
    return this.cachedUser;
  }

  async check(): Promise<boolean> {
    return (await this.user()) !== null;
  }

  async guest(): Promise<boolean> {
    return !(await this.check());
  }

  async id(): Promise<string | null> {
    const user = await this.user();
    return user?.id || null;
  }

  async validate(credentials: Record<string, unknown>): Promise<boolean> {
    const email = credentials.email as string;
    const password = credentials.password as string;

    if (!email || !password) {
      return false;
    }

    const userRecord = await db().select().from(users).where(eq(users.email, email)).get();
    
    if (!userRecord || !userRecord.password) {
      return false;
    }

    return bcrypt.compareSync(password, userRecord.password);
  }

  async attempt(credentials: Record<string, unknown>, remember: boolean = false): Promise<boolean> {
    const email = credentials.email as string;
    const password = credentials.password as string;

    const userRecord = await db().select().from(users).where(eq(users.email, email)).get();
    
    if (!userRecord || !userRecord.password || !bcrypt.compareSync(password, userRecord.password)) {
      return false;
    }

    const user: User = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      role: 'user',
      permissions: ['*']
    };

    await this.login(user, remember);
    return true;
  }

  async login(user: User, remember: boolean = false): Promise<void> {
    // Delegate to SessionService for secure session creation
    await session.createSession(user, { rememberMe: remember });

    // Update cached user
    this.cachedUser = user;
    this.userLoaded = true;
    
    // Update context
    Context.set('user', user);
  }

  async loginUsingId(id: string, remember: boolean = false): Promise<User | null> {
    const userRecord = await db().select().from(users).where(eq(users.id, id)).get();
    
    if (userRecord) {
      const user: User = {
        id: userRecord.id,
        email: userRecord.email,
        name: userRecord.name,
        role: 'user',
        permissions: ['*']
      };
      await this.login(user, remember);
      return user;
    }
    return null;
  }

  async logout(): Promise<void> {
    // Delegate to SessionService
    await session.destroySession();

    // Clear cached user
    this.cachedUser = null;
    this.userLoaded = false;
    
    // Update context
    Context.set('user', null);
  }
}

// ==================== TOKEN GUARD (API) ====================

class TokenGuard implements AuthGuard {
  private cachedUser: User | null = null;
  private userLoaded: boolean = false;

  private getSecretKey(): Uint8Array {
    const secret = config('app.key', 'catalyst-secret-key-change-me');
    return new TextEncoder().encode(secret);
  }

  async user(): Promise<User | null> {
    if (this.userLoaded) {
      return this.cachedUser;
    }

    // Check context first
    const contextUser = Context.user();
    if (contextUser) {
      this.cachedUser = contextUser;
      this.userLoaded = true;
      return contextUser;
    }

    // Token is typically passed via Authorization header
    // This would be extracted in middleware
    this.userLoaded = true;
    return this.cachedUser;
  }

  async check(): Promise<boolean> {
    return (await this.user()) !== null;
  }

  async guest(): Promise<boolean> {
    return !(await this.check());
  }

  async id(): Promise<string | null> {
    const user = await this.user();
    return user?.id || null;
  }

  async validate(credentials: Record<string, unknown>): Promise<boolean> {
    const token = credentials.token as string;
    
    if (!token) {
      return false;
    }

    try {
      const { payload } = await jwtVerify(token, this.getSecretKey());
      return !!payload.sub;
    } catch {
      return false;
    }
  }

  async attempt(credentials: Record<string, unknown>, _remember?: boolean): Promise<boolean> {
    // For API, validate credentials and return a token
    const email = credentials.email as string;
    const password = credentials.password as string;

    // TODO: Validate and return token
    // Similar to SessionGuard but returns JWT instead
    return false;
  }

  async login(user: User, _remember?: boolean): Promise<void> {
    this.cachedUser = user;
    this.userLoaded = true;
    Context.set('user', user);
  }

  async loginUsingId(id: string, _remember?: boolean): Promise<User | null> {
    // TODO: Similar to SessionGuard
    return null;
  }

  async logout(): Promise<void> {
    // For token-based auth, client just discards the token
    // Optionally implement token blacklisting
    this.cachedUser = null;
    this.userLoaded = false;
    Context.set('user', null);
  }

  /**
   * Generate a JWT token for a user
   */
  async generateToken(user: User, expiresIn: string = '1d'): Promise<string> {
    const token = await new SignJWT({ 
      sub: user.id,
      email: user.email,
      name: user.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(this.getSecretKey());

    return token;
  }

  /**
   * Verify and decode a JWT token
   */
  async verifyToken(token: string): Promise<User | null> {
    try {
      const { payload } = await jwtVerify(token, this.getSecretKey());
      
      if (!payload.sub) {
        return null;
      }

      return {
        id: payload.sub as string,
        email: payload.email as string,
        name: payload.name as string,
      };
    } catch {
      return null;
    }
  }
}

// ==================== PASSWORD BROKER ====================

export class PasswordBroker {
  /**
   * Send a password reset link
   */
  async sendResetLink(credentials: { email: string }): Promise<'sent' | 'user' | 'throttled'> {
    const { email } = credentials;

    // TODO: Look up user by email
    // if (!user) return 'user';

    // Generate reset token
    const token = nanoid(64);

    // Store token in database
    // await db.insert(passwordResetTokens).values({
    //   email,
    //   token: bcrypt.hashSync(token, 10),
    //   created_at: new Date(),
    // });

    // TODO: Send email with reset link
    // await mail.send(new PasswordResetMail(email, token));

    return 'sent';
  }

  /**
   * Reset the password
   */
  async reset(
    credentials: { email: string; token: string; password: string },
    callback?: (user: User) => Promise<void>
  ): Promise<'passwords.reset' | 'passwords.token' | 'passwords.user'> {
    const { email, token, password } = credentials;

    // TODO: Validate token
    // const resetRecord = await db.query.passwordResetTokens.findFirst({
    //   where: eq(passwordResetTokens.email, email)
    // });
    // if (!resetRecord || !bcrypt.compareSync(token, resetRecord.token)) {
    //   return 'passwords.token';
    // }

    // TODO: Look up user
    // const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    // if (!user) return 'passwords.user';

    // Execute callback if provided
    // await callback?.(user);

    // Delete used token
    // await db.delete(passwordResetTokens).where(eq(passwordResetTokens.email, email));

    return 'passwords.reset';
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Hash a password
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

// ==================== EXPORTS ====================

export const auth = AuthManager.getInstance();
export { AuthManager, SessionGuard, TokenGuard };
export default AuthManager;
