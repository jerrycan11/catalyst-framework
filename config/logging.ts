/**
 * Catalyst Logging Configuration
 * 
 * Logging settings following Laravel's config/logging.php pattern.
 * Supports multiple channels including console, file, and external services.
 */

export type LogLevel = 'emergency' | 'alert' | 'critical' | 'error' | 'warning' | 'notice' | 'info' | 'debug';

export interface ChannelConfig {
  driver: 'stack' | 'single' | 'daily' | 'console' | 'slack' | 'null';
  level?: LogLevel;
  path?: string;
  days?: number;
  channels?: string[];
  url?: string;
  username?: string;
  emoji?: string;
  bubble?: boolean;
  permission?: number;
}

export interface LoggingConfig {
  /** Default log channel */
  default: string;
  /** Whether error logging is enabled */
  errorsEnabled: boolean;
  /** Whether info logging is enabled */
  infoEnabled: boolean;
  /** Deprecation logging channel */
  deprecations: {
    channel: string | null;
    trace: boolean;
  };
  /** Available log channels */
  channels: Record<string, ChannelConfig>;
}

const config: LoggingConfig = {
  default: process.env.LOG_CHANNEL || 'stack',

  errorsEnabled: process.env.LOG_ERRORS_ENABLED !== 'false',
  infoEnabled: process.env.LOG_INFO_ENABLED !== 'false',

  deprecations: {
    channel: process.env.LOG_DEPRECATIONS_CHANNEL || 'null',
    trace: false,
  },

  channels: {
    stack: {
      driver: 'stack',
      channels: ['daily', 'console'],
      level: 'debug',
    },

    single: {
      driver: 'single',
      path: './storage/logs/catalyst.log',
      level: (process.env.LOG_LEVEL as LogLevel) || 'debug',
      bubble: true,
      permission: 0o644,
    },

    daily: {
      driver: 'daily',
      path: './storage/logs/catalyst.log',
      level: (process.env.LOG_LEVEL as LogLevel) || 'debug',
      days: parseInt(process.env.LOG_DAILY_DAYS || '14', 10),
      bubble: true,
      permission: 0o644,
    },

    console: {
      driver: 'console',
      level: (process.env.LOG_LEVEL as LogLevel) || 'debug',
    },

    slack: {
      driver: 'slack',
      url: process.env.LOG_SLACK_WEBHOOK_URL || '',
      username: 'Catalyst Logger',
      emoji: ':boom:',
      level: 'critical',
    },

    null: {
      driver: 'null',
    },
  },
};

export default config;
