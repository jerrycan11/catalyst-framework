/**
 * Catalyst Mail Configuration
 *
 * Mail settings following Laravel's config/mail.php pattern.
 * Supports multiple mailers including SMTP, Mailgun, and log driver.
 */

export type MailDriver = 'smtp' | 'mailgun' | 'ses' | 'log' | 'array';

export interface MailerConfig {
  driver: MailDriver;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  encryption?: 'tls' | 'ssl' | null;
  timeout?: number;
  domain?: string;
  secret?: string;
  endpoint?: string;
  region?: string;
}

export interface MailConfig {
  /** Default mailer to use */
  default: string;
  /** Available mailer configurations */
  mailers: Record<string, MailerConfig>;
  /** Global "From" address */
  from: {
    address: string;
    name: string;
  };
}

const config: MailConfig = {
  default: process.env.MAIL_MAILER || 'log',

  mailers: {
    smtp: {
      driver: 'smtp',
      host: process.env.MAIL_HOST || 'smtp.mailgun.org',
      port: parseInt(process.env.MAIL_PORT || '587', 10),
      username: process.env.MAIL_USERNAME || '',
      password: process.env.MAIL_PASSWORD || '',
      encryption: (process.env.MAIL_ENCRYPTION as 'tls' | 'ssl' | null) || 'tls',
      timeout: 30,
    },

    mailgun: {
      driver: 'mailgun',
      domain: process.env.MAILGUN_DOMAIN || '',
      secret: process.env.MAILGUN_SECRET || '',
      endpoint: process.env.MAILGUN_ENDPOINT || 'api.mailgun.net',
    },

    ses: {
      driver: 'ses',
      region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
    },

    log: {
      driver: 'log',
    },

    array: {
      driver: 'array',
    },
  },

  from: {
    address: process.env.MAIL_FROM_ADDRESS || 'hello@example.com',
    name: process.env.MAIL_FROM_NAME || process.env.APP_NAME || 'Catalyst',
  },
};

export default config;
