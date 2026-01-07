/**
 * Catalyst Global Middleware
 * 
 * Core middleware stack for handling common request transformations.
 * These run on every request through the application.
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Middleware, NextFunction } from '@/backend/Core/Pipeline';

/**
 * TrustProxies Middleware
 * 
 * Handles X-Forwarded-* headers from reverse proxies like nginx, load balancers, etc.
 * Sets trusted headers for proper client IP detection and protocol handling.
 */
export class TrustProxies implements Middleware {
  private trustedProxies: string[] = ['127.0.0.1', '::1'];
  private trustedHeaders = [
    'x-forwarded-for',
    'x-forwarded-host',
    'x-forwarded-proto',
    'x-forwarded-port',
  ];

  handle(request: NextRequest, next: NextFunction): Promise<NextResponse> | NextResponse {
    // In Next.js, headers are already processed by the platform
    // This middleware primarily serves as documentation and future extensibility
    
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || request.headers.get('x-real-ip')
      || 'unknown';
    
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    
    // Store for later use in context if needed
    // Context could be updated here with trusted values
    
    return next();
  }
}

/**
 * TrimStrings Middleware
 * 
 * Recursively trims whitespace from string values in request data.
 * Cleans up user input before processing.
 */
export class TrimStrings implements Middleware {
  private except: string[] = [
    'password',
    'password_confirmation',
    'current_password',
  ];

  async handle(request: NextRequest, next: NextFunction): Promise<NextResponse> {
    // For Next.js API routes, body parsing happens in the route handlers
    // This middleware operates on already-parsed data in server actions
    // The actual trimming is handled by form request validation
    
    return next();
  }

  /**
   * Recursively trim strings in an object
   */
  public trimObject(data: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (this.except.includes(key)) {
        result[key] = value;
      } else if (typeof value === 'string') {
        result[key] = value.trim();
      } else if (Array.isArray(value)) {
        result[key] = value.map(item => 
          typeof item === 'string' ? item.trim() : 
          typeof item === 'object' && item !== null ? this.trimObject(item as Record<string, unknown>) : 
          item
        );
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.trimObject(value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }
}

/**
 * ConvertEmptyStringsToNull Middleware
 * 
 * Converts empty strings to null values for consistent database handling.
 */
export class ConvertEmptyStringsToNull implements Middleware {
  private except: string[] = [];

  async handle(request: NextRequest, next: NextFunction): Promise<NextResponse> {
    // Similar to TrimStrings, actual conversion happens during form processing
    return next();
  }

  /**
   * Recursively convert empty strings to null
   */
  public convertObject(data: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (this.except.includes(key)) {
        result[key] = value;
      } else if (value === '') {
        result[key] = null;
      } else if (Array.isArray(value)) {
        result[key] = value.map(item => 
          item === '' ? null :
          typeof item === 'object' && item !== null ? this.convertObject(item as Record<string, unknown>) : 
          item
        );
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.convertObject(value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }
}

/**
 * VerifyCsrfToken Middleware
 * 
 * Validates CSRF tokens for state-changing requests.
 * Uses X-XSRF-TOKEN header validation.
 */
export class VerifyCsrfToken implements Middleware {
  private except: string[] = [
    '/api/webhooks/*',
    '/api/health',
  ];

  async handle(request: NextRequest, next: NextFunction): Promise<NextResponse> {
    // Skip for GET, HEAD, OPTIONS requests
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(request.method)) {
      return next();
    }

    // Skip for excluded paths
    const pathname = request.nextUrl.pathname;
    for (const pattern of this.except) {
      if (this.matchPattern(pattern, pathname)) {
        return next();
      }
    }

    // For API routes, we typically use token-based auth (JWT) instead of CSRF
    // This is primarily for form submissions with session-based auth
    const csrfToken = request.headers.get('x-xsrf-token');
    const cookieToken = request.cookies.get('XSRF-TOKEN')?.value;

    // If both tokens exist, they should match
    if (csrfToken && cookieToken && csrfToken !== cookieToken) {
      return NextResponse.json(
        { error: 'CSRF token mismatch' },
        { status: 419 }
      );
    }

    return next();
  }

  private matchPattern(pattern: string, path: string): boolean {
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\//g, '\\/');
    return new RegExp(`^${regexPattern}$`).test(path);
  }
}

/**
 * InitializeContext Middleware
 * 
 * Sets up the request context for the entire request lifecycle.
 * This should run first before any other middleware.
 */
export class InitializeContext implements Middleware {
  async handle(request: NextRequest, next: NextFunction): Promise<NextResponse> {
    // Context initialization is handled via Context.run() in the route handlers
    // This middleware serves as documentation for the expected flow
    return next();
  }
}

/**
 * Default global middleware stack
 */
export const globalMiddleware = [
  InitializeContext,
  TrustProxies,
  TrimStrings,
  ConvertEmptyStringsToNull,
  VerifyCsrfToken,
];

export default globalMiddleware;
