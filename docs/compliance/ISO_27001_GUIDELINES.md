# ISO 27001 Information Security Compliance Guidelines

**Version:** 1.0  
**Last Updated:** January 7, 2026  
**Standard:** ISO/IEC 27001:2022 Information Security Management Systems

---

## Overview

ISO 27001 is the international standard for information security management systems (ISMS). This document provides development guidelines to ensure the Catalyst framework meets ISO 27001 requirements for secure software development.

---

## Key Security Domains

### A.5 Organizational Controls

#### A.5.1 Policies for Information Security

All development MUST follow documented security policies.

```typescript
// Security configuration - centralized
export const securityConfig = {
  // Session settings
  session: {
    maxAge: 24 * 60 * 60, // 24 hours
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
  
  // Password requirements
  password: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
    maxAge: 90 * 24 * 60 * 60, // 90 days
    historyCount: 12, // Prevent reuse of last 12 passwords
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    loginMaxAttempts: 5,
    loginBlockDuration: 15 * 60 * 1000, // 15 minutes
  },
  
  // Token settings
  tokens: {
    access: {
      expiresIn: '15m',
      algorithm: 'RS256',
    },
    refresh: {
      expiresIn: '7d',
    },
    passwordReset: {
      expiresIn: '1h',
    },
  },
};
```

---

### A.8 Technological Controls

#### A.8.1 Security Headers (REQUIRED)

All responses MUST include security headers.

```typescript
// next.config.ts - Security Headers Configuration
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https:;
      font-src 'self' data:;
      connect-src 'self' ${process.env.NODE_ENV === 'development' ? 'ws:' : ''};
      frame-ancestors 'self';
      form-action 'self';
      base-uri 'self';
    `.replace(/\s+/g, ' ').trim(),
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

#### A.8.2 Secure Cookie Configuration

```typescript
// Secure cookie settings
export const cookieSettings = {
  session: {
    name: '__Host-session',
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 86400, // 24 hours
  },
  
  csrf: {
    name: '__Host-csrf',
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const,
    path: '/',
  },
  
  // For cookies that need JavaScript access
  preferences: {
    name: 'preferences',
    httpOnly: false,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
  },
};
```

#### A.8.3 Input Validation (CRITICAL)

ALL user input MUST be validated.

```typescript
// Validation utilities
import { z } from 'zod';

// Common validation schemas
export const validationSchemas = {
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email too long')
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  
  username: z.string()
    .min(3, 'Username too short')
    .max(30, 'Username too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid characters in username'),
  
  // Prevent injection attacks
  safeString: z.string()
    .transform(str => str.trim())
    .refine(
      str => !/<script|javascript:|data:/i.test(str),
      'Invalid characters detected'
    ),
  
  // UUID format validation
  uuid: z.string().uuid('Invalid ID format'),
  
  // URL validation
  url: z.string().url().refine(
    url => url.startsWith('https://'),
    'URL must use HTTPS'
  ),
};

// Usage in API routes
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const validated = z.object({
      email: validationSchemas.email,
      password: validationSchemas.password,
    }).parse(body);
    
    // Proceed with validated data
    return handleLogin(validated);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { errors: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

#### A.8.4 Output Encoding

```typescript
// XSS Prevention
import DOMPurify from 'isomorphic-dompurify';

// For user-generated HTML content
function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false,
  });
}

// React automatically escapes, but for dynamic content:
function UserContent({ html }: { html: string }) {
  const sanitized = sanitizeHTML(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

#### A.8.5 SQL Injection Prevention

```typescript
// Using Drizzle ORM (parameterized queries by default)

// ❌ NEVER - String concatenation
const dangerous = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ CORRECT - Parameterized queries
import { eq } from 'drizzle-orm';

const user = await db.query.users.findFirst({
  where: eq(users.id, userId), // Automatically parameterized
});

// For raw SQL when absolutely necessary
import { sql } from 'drizzle-orm';

const result = await db.execute(
  sql`SELECT * FROM users WHERE email = ${email}`
  // ${email} is automatically parameterized
);
```

---

### A.8.6 Authentication Security

#### Password Hashing

```typescript
import { hash, verify } from '@node-rs/argon2';

const hashOptions = {
  memoryCost: 65536,      // 64 MB
  timeCost: 3,            // Iterations
  outputLen: 32,          // Output length
  parallelism: 4,         // Parallel threads
};

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, hashOptions);
}

export async function verifyPassword(
  password: string, 
  hashedPassword: string
): Promise<boolean> {
  try {
    return await verify(hashedPassword, password, hashOptions);
  } catch {
    return false;
  }
}
```

#### Multi-Factor Authentication

```typescript
import { createTOTPKeyURI, verifyTOTP } from '@epic-web/totp';

// Generate MFA secret
async function enableMFA(userId: string) {
  const secret = generateSecureRandom(20);
  
  // Store securely (encrypted)
  await db.update(users)
    .set({ mfaSecret: encrypt(secret) })
    .where(eq(users.id, userId));
  
  // Generate QR code URI
  const uri = createTOTPKeyURI({
    issuer: 'Catalyst',
    accountName: user.email,
    secret,
  });
  
  return { uri, secret };
}

// Verify MFA code
async function verifyMFA(userId: string, code: string): Promise<boolean> {
  const user = await getUser(userId);
  const secret = decrypt(user.mfaSecret);
  
  return verifyTOTP({ secret, otp: code });
}
```

#### Session Management

```typescript
// Session security requirements
interface SecureSession {
  id: string;           // Cryptographically random
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress: string;    // For anomaly detection
  userAgent: string;    // For anomaly detection
  lastActivity: Date;
}

// Session rotation after authentication
async function rotateSession(oldSessionId: string): Promise<string> {
  // Create new session
  const newSessionId = generateSecureId();
  
  // Invalidate old session
  await db.delete(sessions)
    .where(eq(sessions.id, oldSessionId));
  
  return newSessionId;
}

// Inactivity timeout
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

async function validateSession(sessionId: string): Promise<boolean> {
  const session = await getSession(sessionId);
  
  if (!session) return false;
  if (session.expiresAt < new Date()) return false;
  
  const lastActivity = new Date(session.lastActivity);
  if (Date.now() - lastActivity.getTime() > INACTIVITY_TIMEOUT) {
    await invalidateSession(sessionId);
    return false;
  }
  
  // Update last activity
  await updateSessionActivity(sessionId);
  return true;
}
```

---

### A.8.7 Logging and Monitoring

#### Security Event Logging

```typescript
// Security event types
type SecurityEventType =
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'password_change'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'permission_change'
  | 'data_access'
  | 'data_export'
  | 'account_locked'
  | 'suspicious_activity';

interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details: Record<string, unknown>;
  severity: 'info' | 'warning' | 'critical';
}

async function logSecurityEvent(event: SecurityEvent) {
  // Never log passwords, tokens, or sensitive data
  const sanitizedDetails = sanitizeLogData(event.details);
  
  await db.insert(securityLogs).values({
    ...event,
    details: sanitizedDetails,
  });
  
  // Alert on critical events
  if (event.severity === 'critical') {
    await notifySecurityTeam(event);
  }
}

// Sanitize sensitive data from logs
function sanitizeLogData(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      sensitiveFields.some(f => key.toLowerCase().includes(f))
        ? '[REDACTED]'
        : value
    ])
  );
}
```

---

### A.8.8 Error Handling

```typescript
// Never expose internal errors to users

class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true,
    public code?: string
  ) {
    super(message);
  }
}

// Global error handler
function handleError(error: unknown, request: Request): Response {
  // Log full error internally
  console.error('Error:', {
    error,
    url: request.url,
    method: request.method,
    timestamp: new Date().toISOString(),
  });
  
  if (error instanceof AppError && error.isOperational) {
    // Operational error - safe to expose
    return Response.json(
      { error: { message: error.message, code: error.code } },
      { status: error.statusCode }
    );
  }
  
  // Programming or unknown error - don't expose details
  return Response.json(
    { error: { message: 'An unexpected error occurred', code: 'INTERNAL_ERROR' } },
    { status: 500 }
  );
}
```

---

### A.8.9 Data Protection

#### Encryption at Rest

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

interface EncryptedData {
  iv: string;
  authTag: string;
  encrypted: string;
}

export function encrypt(plaintext: string): EncryptedData {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    iv: iv.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex'),
    encrypted,
  };
}

export function decrypt(data: EncryptedData): string {
  const decipher = createDecipheriv(
    ALGORITHM,
    ENCRYPTION_KEY,
    Buffer.from(data.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));
  
  let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

#### Data Classification

```typescript
// Data classification levels
type DataClassification = 
  | 'public'       // No restrictions
  | 'internal'     // Employees only
  | 'confidential' // Need-to-know basis
  | 'restricted';  // Highly sensitive, encrypted

// Field-level classification
const fieldClassifications: Record<string, DataClassification> = {
  email: 'confidential',
  password: 'restricted',
  name: 'internal',
  publicProfile: 'public',
  healthInfo: 'restricted',
  financialData: 'restricted',
};

// Access control based on classification
function canAccessField(userRole: string, field: string): boolean {
  const classification = fieldClassifications[field] || 'confidential';
  
  const accessMatrix: Record<DataClassification, string[]> = {
    public: ['guest', 'user', 'admin'],
    internal: ['user', 'admin'],
    confidential: ['admin', 'data_officer'],
    restricted: ['security_admin'],
  };
  
  return accessMatrix[classification]?.includes(userRole) ?? false;
}
```

---

### A.8.10 Secure Development Lifecycle

#### Code Review Requirements

All code changes MUST be reviewed for:
- [ ] Input validation implemented
- [ ] Output encoding for user data
- [ ] No hard-coded secrets
- [ ] Error handling doesn't expose internals
- [ ] Authentication/authorization checks in place
- [ ] Logging for security events
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] CSRF protection implemented
- [ ] Secure cookie flags set

#### Dependency Security

```bash
# Run before every deployment
npm audit --production

# Check for known vulnerabilities
npx snyk test

# Update dependencies regularly
npm update
```

---

## Incident Response

### Security Incident Classification

| Level | Description | Response Time |
|-------|-------------|---------------|
| Critical | Active breach, data loss | Immediate |
| High | Vulnerability exploited | < 4 hours |
| Medium | Potential vulnerability | < 24 hours |
| Low | Minor security issue | < 1 week |

### Response Procedures

```typescript
// Incident response interface
interface SecurityIncident {
  id: string;
  level: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  discoveredAt: Date;
  discoveredBy: string;
  affectedSystems: string[];
  affectedUsers?: number;
  containmentActions: string[];
  status: 'identified' | 'contained' | 'eradicated' | 'recovered' | 'closed';
}

// Escalation contacts
const escalationContacts = {
  critical: ['security-team@catalyst.dev', 'cto@catalyst.dev'],
  high: ['security-team@catalyst.dev'],
  medium: ['dev-lead@catalyst.dev'],
  low: ['security@catalyst.dev'],
};
```

---

## Compliance Checklist

### Application Security
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Secure cookie settings
- [ ] CSRF protection enabled
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Output encoding for user data

### Authentication
- [ ] Strong password policy
- [ ] Account lockout after failed attempts
- [ ] Secure session management
- [ ] Session timeout implemented
- [ ] MFA option available

### Data Protection
- [ ] Encryption at rest for sensitive data
- [ ] Encryption in transit (TLS 1.2+)
- [ ] Secure key management
- [ ] Data classification scheme
- [ ] Secure data destruction

### Logging & Monitoring
- [ ] Security event logging
- [ ] No sensitive data in logs
- [ ] Log retention policy
- [ ] Alerting for critical events
- [ ] Regular log review

### Development Security
- [ ] Code review process
- [ ] Dependency scanning
- [ ] Security testing in CI/CD
- [ ] Secure coding training
- [ ] Incident response plan
