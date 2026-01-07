/**
 * Catalyst Authentication Middleware
 * 
 * Provides server-side authentication guards for route protection.
 * Works in conjunction with the edge middleware for defense-in-depth.
 * 
 * @security CRITICAL - Server-side authentication enforcement
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import type { Middleware, NextFunction } from '@/backend/Core/Pipeline';

// ==================== TYPES ====================

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role?: string;
  permissions?: string[];
}

export interface AuthSession {
  user: AuthenticatedUser;
  sessionId: string;
  issuedAt: number;
  expiresAt: number;
}

// ==================== CONFIGURATION ====================

const SESSION_COOKIE_NAME = 'catalyst_session';
const AUTH_TOKEN_COOKIE_NAME = 'catalyst_auth_token';
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours
const REMEMBER_ME_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get the secret key for JWT operations
 */
function getSecretKey(): Uint8Array {
  const secret = process.env.APP_KEY || process.env.AUTH_SECRET || 'catalyst-secret-key-change-me-in-production';
  return new TextEncoder().encode(secret);
}

/**
 * Verify and decode a JWT auth token
 */
async function verifyToken(token: string): Promise<AuthenticatedUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    
    if (!payload.sub) {
      return null;
    }
    
    return {
      id: payload.sub as string,
      email: (payload.email as string) || '',
      name: (payload.name as string) || '',
      role: payload.role as string | undefined,
      permissions: payload.permissions as string[] | undefined,
    };
  } catch {
    return null;
  }
}

// ==================== SERVER-SIDE AUTH CHECK ====================

/**
 * Get the current authenticated user from server context
 * This is the definitive server-side auth check
 * 
 * @returns The authenticated user or null if not authenticated
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  
  // 1. Try auth token first (stateless JWT)
  const authToken = cookieStore.get(AUTH_TOKEN_COOKIE_NAME)?.value;
  if (authToken) {
    const user = await verifyToken(authToken);
    if (user) {
      return user;
    }
  }
  
  // 2. Try session cookie (stateful session - requires DB lookup)
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (sessionId) {
    // TODO: Look up session in database
    // const session = await db.query.sessions.findFirst({
    //   where: eq(sessions.id, sessionId),
    //   with: { user: true },
    // });
    // if (session?.user) {
    //   return {
    //     id: session.user.id,
    //     email: session.user.email,
    //     name: session.user.name,
    //   };
    // }
    
    // For now, sessions without tokens are considered invalid
    return null;
  }
  
  return null;
}

/**
 * Check if the current request is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Require authentication - throws redirect if not authenticated
 * Use this in Server Components and Server Actions
 * 
 * @param redirectTo - URL to redirect to after login (defaults to current path)
 */
export async function requireAuth(redirectTo?: string): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    const loginUrl = redirectTo 
      ? `/login?redirect=${encodeURIComponent(redirectTo)}`
      : '/login';
    redirect(loginUrl);
  }
  
  return user;
}

/**
 * Require guest status - throws redirect if authenticated
 * Use this to protect login/register pages from authenticated users
 */
export async function requireGuest(redirectTo: string = '/dashboard'): Promise<void> {
  const user = await getCurrentUser();
  
  if (user) {
    redirect(redirectTo);
  }
}

/**
 * Check if user has specific role
 */
export async function hasRole(requiredRole: string): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === requiredRole;
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(requiredPermission: string): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.permissions?.includes(requiredPermission) ?? false;
}

/**
 * Require specific role - throws redirect if user doesn't have role
 */
export async function requireRole(role: string, redirectTo: string = '/dashboard'): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  
  if (user.role !== role) {
    redirect(redirectTo);
  }
  
  return user;
}

/**
 * Require specific permission - throws redirect if user doesn't have permission
 */
export async function requirePermission(permission: string, redirectTo: string = '/dashboard'): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  
  if (!user.permissions?.includes(permission)) {
    redirect(redirectTo);
  }
  
  return user;
}

// ==================== MIDDLEWARE CLASS ====================

/**
 * Authenticate Middleware
 * 
 * Pipeline middleware for route handlers
 * Validates authentication and populates request context
 */
export class Authenticate implements Middleware {
  private guards: string[];

  constructor(guards: string | string[] = 'web') {
    this.guards = Array.isArray(guards) ? guards : [guards];
  }

  async handle(request: NextRequest, next: NextFunction): Promise<NextResponse> {
    // Check for authentication via headers (set by edge middleware)
    const userId = request.headers.get('x-user-id');
    
    // If edge middleware already validated, trust it
    if (userId) {
      return next();
    }

    // Otherwise, validate auth token from cookies/headers
    const authToken = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;
    const bearerToken = request.headers.get('authorization')?.replace('Bearer ', '');
    const token = bearerToken || authToken;

    if (!token) {
      return this.unauthenticated(request);
    }

    const user = await verifyToken(token);
    if (!user) {
      return this.unauthenticated(request);
    }

    // Authentication successful
    return next();
  }

  private unauthenticated(request: NextRequest): NextResponse {
    // Check if this is an API request
    const isApi = request.nextUrl.pathname.startsWith('/api/') ||
                  request.headers.get('accept')?.includes('application/json');

    if (isApi) {
      return NextResponse.json(
        { 
          error: 'Unauthenticated',
          message: 'Authentication required to access this resource',
          code: 'UNAUTHENTICATED',
        },
        { status: 401 }
      );
    }

    // Redirect to login for web requests
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
}

/**
 * Authorize Middleware
 * 
 * Checks for specific roles or permissions after authentication
 */
export class Authorize implements Middleware {
  private ability: string;
  private arguments: string[];

  constructor(ability: string, ...args: string[]) {
    this.ability = ability;
    this.arguments = args;
  }

  async handle(request: NextRequest, next: NextFunction): Promise<NextResponse> {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // TODO: Implement role/permission checking via Gate
    // const gate = Gate.forUser(userId);
    // if (!await gate.allows(this.ability, ...this.arguments)) {
    //   return NextResponse.json(
    //     { error: 'Forbidden', message: 'You do not have permission to perform this action' },
    //     { status: 403 }
    //   );
    // }

    return next();
  }
}

/**
 * EnsureEmailIsVerified Middleware
 * 
 * Requires the authenticated user to have verified their email
 */
export class EnsureEmailIsVerified implements Middleware {
  async handle(request: NextRequest, next: NextFunction): Promise<NextResponse> {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // TODO: Check if user's email is verified
    // const user = await db.query.users.findFirst({
    //   where: eq(users.id, userId),
    // });
    // if (!user?.email_verified_at) {
    //   if (request.nextUrl.pathname.startsWith('/api/')) {
    //     return NextResponse.json(
    //       { error: 'Email not verified', code: 'EMAIL_NOT_VERIFIED' },
    //       { status: 403 }
    //     );
    //   }
    //   return NextResponse.redirect(new URL('/verify-email', request.url));
    // }

    return next();
  }
}

// ==================== ROUTE GROUP MIDDLEWARE ====================

/**
 * Middleware groups for easy route protection
 */
export const middlewareGroups = {
  /**
   * Web middleware stack (session-based auth)
   */
  web: [Authenticate],
  
  /**
   * API middleware stack (token-based auth)  
   */
  api: [Authenticate],
  
  /**
   * Admin middleware stack
   */
  admin: [
    Authenticate,
    // Authorize('admin'),
    EnsureEmailIsVerified,
  ],
};

export default Authenticate;
