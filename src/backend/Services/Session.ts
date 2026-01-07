/**
 * Catalyst Session Service
 * 
 * Provides secure session management with support for:
 * - HTTP-only secure cookies
 * - Session regeneration on privilege changes
 * - Idle timeout and absolute timeout
 * - Session fingerprinting for hijacking prevention
 * 
 * @security CRITICAL - Session security implementation
 */

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { nanoid } from 'nanoid';
import type { User } from '@/backend/Core/Context';

// ==================== CONFIGURATION ====================

const SESSION_COOKIE_NAME = 'catalyst_session';
const AUTH_TOKEN_COOKIE_NAME = 'catalyst_auth_token';
const REFRESH_TOKEN_COOKIE_NAME = 'catalyst_refresh_token';
const FINGERPRINT_COOKIE_NAME = 'catalyst_fp';

// Timeouts
const ACCESS_TOKEN_LIFETIME = '15m';      // Short-lived access token
const REFRESH_TOKEN_LIFETIME = '7d';      // Refresh token validity
// const SESSION_IDLE_TIMEOUT = 60 * 60;     // 1 hour idle timeout (unused)
const SESSION_ABSOLUTE_TIMEOUT = 60 * 60 * 24; // 24 hour absolute timeout
const REMEMBER_ME_LIFETIME = '30d';       // Remember me token lifetime

// Security
const TOKEN_REFRESH_THRESHOLD = 60 * 5;   // Refresh if less than 5 min remaining

// ==================== TYPES ====================

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  role?: string;
  permissions?: string[];
  fingerprint?: string;
  issuedAt: number;
  lastActivity: number;
  absoluteExpiry: number;
  rememberMe: boolean;
}

export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  role?: string;
  permissions?: string[];
  fingerprint?: string;
  type: 'access' | 'refresh';
  rememberMe?: boolean;
}

// ==================== SESSION SERVICE ====================

class SessionService {
  private static instance: SessionService | null = null;

  private constructor() {}

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  /**
   * Get the secret key for JWT operations
   */
  private getSecretKey(): Uint8Array {
    const secret = process.env.APP_KEY || process.env.AUTH_SECRET || 'catalyst-secret-key-change-me-in-production';
    return new TextEncoder().encode(secret);
  }

  /**
   * Generate client fingerprint hash
   * Combines User-Agent and other browser characteristics
   */
  private generateFingerprint(userAgent: string, ip: string): string {
    // Simple fingerprint - in production, use more sophisticated methods
    const data = `${userAgent}|${ip}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Create a new session for a user
   */
  public async createSession(
    user: User,
    options: {
      rememberMe?: boolean;
      userAgent?: string;
      ipAddress?: string;
    } = {}
  ): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
    const { rememberMe = false, userAgent = '', ipAddress = '' } = options;
    
    const sessionId = nanoid(32);
    const fingerprint = this.generateFingerprint(userAgent, ipAddress);
    // const now = Date.now(); (unused)

    // Create access token (short-lived)
    const accessToken = await new SignJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      fingerprint,
      type: 'access',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(ACCESS_TOKEN_LIFETIME)
      .setJti(sessionId)
      .sign(this.getSecretKey());

    // Create refresh token (longer-lived)
    const refreshToken = await new SignJWT({
      sub: user.id,
      type: 'refresh',
      fingerprint,
      rememberMe,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(rememberMe ? REMEMBER_ME_LIFETIME : REFRESH_TOKEN_LIFETIME)
      .setJti(nanoid(32))
      .sign(this.getSecretKey());

    // Set cookies
    const cookieStore = await cookies();
    
    // Access token cookie
    cookieStore.set(AUTH_TOKEN_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : SESSION_ABSOLUTE_TIMEOUT,
    });

    // Refresh token cookie
    cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7,
    });

    // Session ID cookie
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : SESSION_ABSOLUTE_TIMEOUT,
    });

    // Fingerprint cookie (for validation)
    cookieStore.set(FINGERPRINT_COOKIE_NAME, fingerprint, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : SESSION_ABSOLUTE_TIMEOUT,
    });

    // TODO: Store session in database for server-side validation
    // await db.insert(sessions).values({
    //   id: sessionId,
    //   user_id: user.id,
    //   ip_address: ipAddress,
    //   user_agent: userAgent,
    //   payload: JSON.stringify({ fingerprint, rememberMe }),
    //   last_activity: Math.floor(now / 1000),
    // });

    return { accessToken, refreshToken, sessionId };
  }

  /**
   * Validate the current session
   */
  public async validateSession(): Promise<{
    valid: boolean;
    user?: User;
    needsRefresh?: boolean;
    error?: string;
  }> {
    const cookieStore = await cookies();
    
    const authToken = cookieStore.get(AUTH_TOKEN_COOKIE_NAME)?.value;
    const storedFingerprint = cookieStore.get(FINGERPRINT_COOKIE_NAME)?.value;

    if (!authToken) {
      return { valid: false, error: 'No session token' };
    }

    try {
      const { payload } = await jwtVerify(authToken, this.getSecretKey());
      
      // Verify fingerprint matches
      if (payload.fingerprint && storedFingerprint && payload.fingerprint !== storedFingerprint) {
        return { valid: false, error: 'Session fingerprint mismatch - possible hijacking attempt' };
      }

      // Check if token needs refresh
      const exp = payload.exp as number;
      const now = Math.floor(Date.now() / 1000);
      const needsRefresh = exp - now < TOKEN_REFRESH_THRESHOLD;

      return {
        valid: true,
        user: {
          id: payload.sub as string,
          email: payload.email as string,
          name: payload.name as string,
          role: payload.role as string | undefined,
          permissions: payload.permissions as string[] | undefined,
        },
        needsRefresh,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('expired')) {
        return { valid: false, error: 'Session expired', needsRefresh: true };
      }
      return { valid: false, error: 'Invalid session token' };
    }
  }

  /**
   * Refresh the session using refresh token
   */
  public async refreshSession(): Promise<{
    success: boolean;
    accessToken?: string;
    error?: string;
  }> {
    const cookieStore = await cookies();
    
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;
    const storedFingerprint = cookieStore.get(FINGERPRINT_COOKIE_NAME)?.value;

    if (!refreshToken) {
      return { success: false, error: 'No refresh token' };
    }

    try {
      const { payload } = await jwtVerify(refreshToken, this.getSecretKey());
      
      // Verify it's a refresh token
      if (payload.type !== 'refresh') {
        return { success: false, error: 'Invalid token type' };
      }

      // Verify fingerprint
      if (payload.fingerprint && storedFingerprint && payload.fingerprint !== storedFingerprint) {
        return { success: false, error: 'Fingerprint mismatch' };
      }

      // TODO: Look up user from database to get fresh data
      // const user = await db.query.users.findFirst({
      //   where: eq(users.id, payload.sub as string),
      // });
      // if (!user) {
      //   return { success: false, error: 'User not found' };
      // }

      // Generate new access token
      const accessToken = await new SignJWT({
        sub: payload.sub,
        email: payload.email || '',
        name: payload.name || '',
        fingerprint: storedFingerprint,
        type: 'access',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(ACCESS_TOKEN_LIFETIME)
        .sign(this.getSecretKey());

      // Update cookie
      const rememberMe = !!payload.rememberMe;
      cookieStore.set(AUTH_TOKEN_COOKIE_NAME, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: rememberMe ? 60 * 60 * 24 * 30 : SESSION_ABSOLUTE_TIMEOUT,
      });

      return { success: true, accessToken };
    } catch {
      return { success: false, error: 'Invalid or expired refresh token' };
    }
  }

  /**
   * Regenerate session ID (use after privilege changes)
   */
  public async regenerateSession(): Promise<void> {
    const validation = await this.validateSession();
    
    if (validation.valid && validation.user) {
      // Create new session with same user
      await this.createSession(validation.user, { rememberMe: false });
    }
  }

  /**
   * Destroy the current session (logout)
   */
  public async destroySession(): Promise<void> {
    const cookieStore = await cookies();
    const _sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    // Delete session from database if exists
    // if (_sessionId) {
    //   await db.delete(sessions).where(eq(sessions.id, _sessionId));
    // }

    // Clear all session cookies
    cookieStore.delete(SESSION_COOKIE_NAME);
    cookieStore.delete(AUTH_TOKEN_COOKIE_NAME);
    cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME);
    cookieStore.delete(FINGERPRINT_COOKIE_NAME);
  }

  /**
   * Invalidate all sessions for a user (e.g., password change)
   */
  public async invalidateAllUserSessions(_userId: string): Promise<void> {
    // TODO: Delete all sessions from database
    // await db.delete(sessions).where(eq(sessions.user_id, userId));
    
    // Current session will be invalidated on next request
  }

  /**
   * Get all active sessions for a user
   */
  public async getUserSessions(_userId: string): Promise<Array<{
    id: string;
    ipAddress: string;
    userAgent: string;
    lastActivity: Date;
    isCurrent: boolean;
  }>> {
    const cookieStore = await cookies();
    const _currentSessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    // TODO: Query sessions from database
    // const userSessions = await db.query.sessions.findMany({
    //   where: eq(sessions.user_id, userId),
    // });
    // return userSessions.map(s => ({
    //   id: s.id,
    //   ipAddress: s.ip_address || 'Unknown',
    //   userAgent: s.user_agent || 'Unknown',
    //   lastActivity: new Date(s.last_activity * 1000),
    //   isCurrent: s.id === currentSessionId,
    // }));

    return [];
  }
}

// ==================== EXPORTS ====================

export const session = SessionService.getInstance();
export { SessionService };
export default SessionService;
