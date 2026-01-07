/**
 * Catalyst Application Configuration
 * 
 * Core application settings following Laravel's config/app.php pattern.
 * All values can be accessed via: config.get('app.key')
 */

export interface AppConfig {
  /** Application name */
  name: string;
  /** Current environment: 'local' | 'staging' | 'production' */
  env: 'local' | 'staging' | 'production' | 'testing';
  /** Enable debug mode */
  debug: boolean;
  /** Application base URL */
  url: string;
  /** Application timezone */
  timezone: string;
  /** Default application locale */
  locale: string;
  /** Fallback locale when translation missing */
  fallback_locale: string;
  /** Encryption key (32 characters for AES-256) */
  key: string;
  /** Encryption cipher algorithm */
  cipher: 'aes-256-cbc' | 'aes-256-gcm';
  /** Registered service providers */
  providers: string[];
  /** Class aliases */
  aliases: Record<string, string>;
}

const config: AppConfig = {
  name: process.env.APP_NAME || 'Catalyst',
  
  env: (process.env.NODE_ENV as AppConfig['env']) || 'local',
  
  debug: process.env.APP_DEBUG === 'true' || process.env.NODE_ENV !== 'production',
  
  url: process.env.APP_URL || 'http://localhost:3000',
  
  timezone: process.env.APP_TIMEZONE || 'UTC',
  
  locale: process.env.APP_LOCALE || 'en',
  
  fallback_locale: process.env.APP_FALLBACK_LOCALE || 'en',
  
  key: process.env.APP_KEY || '',
  
  cipher: 'aes-256-gcm',
  
  providers: [
    // Framework Service Providers
    'AppServiceProvider',
    'AuthServiceProvider',
    'EventServiceProvider',
    'RouteServiceProvider',
  ],
  
  aliases: {
    App: '@/app/Core/Application',
    Config: '@/app/Services/Config',
  },
};

export default config;
