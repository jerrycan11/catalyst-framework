import type { NextConfig } from "next";

/**
 * ISO 27001 Compliant Security Headers
 * 
 * These headers are required for information security compliance.
 * See: docs/compliance/ISO_27001_GUIDELINES.md
 */
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    // HSTS - Force HTTPS connections
    // max-age: 2 years, include subdomains, preload list eligible
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    // Prevent clickjacking attacks
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    // Prevent MIME type sniffing
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // XSS Protection (legacy, but still useful for older browsers)
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    // Control referrer information
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Disable unnecessary browser features
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    // Content Security Policy
    // Adjust as needed for your specific requirements
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Scripts: self + inline for Next.js hydration
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      // Styles: self + inline for styled-components/emotion
      "style-src 'self' 'unsafe-inline'",
      // Images: self + data URIs + external images
      "img-src 'self' blob: data: https:",
      // Fonts: self + data URIs
      "font-src 'self' data:",
      // Connect: self + WebSocket for dev
      `connect-src 'self' ${process.env.NODE_ENV === 'development' ? 'ws: wss:' : ''}`,
      // Prevent embedding in frames except same origin
      "frame-ancestors 'self'",
      // Form submissions only to self
      "form-action 'self'",
      // Base URI restriction
      "base-uri 'self'",
      // Upgrade insecure requests in production
      process.env.NODE_ENV === 'production' ? 'upgrade-insecure-requests' : '',
    ].filter(Boolean).join('; '),
  },
];

const nextConfig: NextConfig = {
  // Security headers for all routes
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  
  // Powered by header removal (security through obscurity)
  poweredByHeader: false,
  
  // Strict mode for React
  reactStrictMode: true,
};

export default nextConfig;
