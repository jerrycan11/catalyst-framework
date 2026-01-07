/**
 * Catalyst Logger Service
 *
 * A Singleton logger providing centralized logging for both frontend and backend.
 * Supports file-based logging with configurable error and info log levels.
 *
 * @example
 * ```ts
 * import { logger, Log } from '@/backend/Services/Logger';
 *
 * // Using the singleton
 * logger().info('User logged in', { userId: '123' });
 * logger().error('Failed to process payment', { orderId: '456' }, error);
 *
 * // Using the Log facade
 * Log.info('Application started');
 * Log.error('Database connection failed', {}, error);
 * ```
 */

import * as fs from 'fs';
import * as path from 'path';
import loggingConfig, { LogLevel } from '../../../config/logging';

export type LogSource = 'frontend' | 'backend';

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  source: LogSource;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private static instance: Logger | null = null;
  private readonly logsDir: string;
  private readonly errorsEnabled: boolean;
  private readonly infoEnabled: boolean;

  private constructor() {
    this.logsDir = path.resolve(process.cwd(), 'storage', 'logs');
    this.errorsEnabled = loggingConfig.errorsEnabled;
    this.infoEnabled = loggingConfig.infoEnabled;
    this.ensureLogDirectory();
  }

  /**
   * Get the singleton instance of the Logger
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static reset(): void {
    Logger.instance = null;
  }

  /**
   * Ensure the logs directory exists
   */
  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  /**
   * Get the current date formatted for log filenames
   */
  private getDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  /**
   * Get the current timestamp formatted for log entries
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Format a log entry as a string
   */
  private formatLogEntry(entry: LogEntry): string {
    const parts = [
      `[${entry.timestamp}]`,
      `[${entry.level.toUpperCase()}]`,
      `[${entry.source}]`,
      entry.message,
    ];

    if (entry.context && Object.keys(entry.context).length > 0) {
      parts.push(`Context: ${JSON.stringify(entry.context)}`);
    }

    if (entry.error) {
      parts.push(`Error: ${entry.error.name}: ${entry.error.message}`);
      if (entry.error.stack) {
        parts.push(`Stack: ${entry.error.stack}`);
      }
    }

    return parts.join(' ') + '\n';
  }

  /**
   * Write a log entry to the appropriate file
   */
  private writeToFile(entry: LogEntry): void {
    const dateStr = this.getDateString();
    const isErrorLevel = ['emergency', 'alert', 'critical', 'error'].includes(entry.level);

    // Determine which file to write to based on level
    const filename = isErrorLevel
      ? `errors-${dateStr}.log`
      : `info-${dateStr}.log`;

    const filePath = path.join(this.logsDir, filename);
    const formattedEntry = this.formatLogEntry(entry);

    try {
      fs.appendFileSync(filePath, formattedEntry, { encoding: 'utf-8' });
    } catch (err) {
      // Fallback to console if file writing fails
      console.error('Failed to write to log file:', err);
      console.log(formattedEntry);
    }
  }

  /**
   * Check if logging is enabled for the given level
   */
  private isEnabled(level: LogLevel): boolean {
    const errorLevels: LogLevel[] = ['emergency', 'alert', 'critical', 'error'];
    const infoLevels: LogLevel[] = ['warning', 'notice', 'info', 'debug'];

    if (errorLevels.includes(level)) {
      return this.errorsEnabled;
    }
    if (infoLevels.includes(level)) {
      return this.infoEnabled;
    }
    return true;
  }

  /**
   * Log a message at the specified level
   */
  public log(
    level: LogLevel,
    message: string,
    context: LogContext = {},
    error?: Error,
    source: LogSource = 'backend'
  ): void {
    if (!this.isEnabled(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level,
      source,
      message,
      context: Object.keys(context).length > 0 ? context : undefined,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    this.writeToFile(entry);

    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
      const consoleMethod = ['emergency', 'alert', 'critical', 'error'].includes(level)
        ? console.error
        : console.log;
      consoleMethod(this.formatLogEntry(entry).trim());
    }
  }

  // Convenience methods for each log level
  public emergency(message: string, context: LogContext = {}, error?: Error, source: LogSource = 'backend'): void {
    this.log('emergency', message, context, error, source);
  }

  public alert(message: string, context: LogContext = {}, error?: Error, source: LogSource = 'backend'): void {
    this.log('alert', message, context, error, source);
  }

  public critical(message: string, context: LogContext = {}, error?: Error, source: LogSource = 'backend'): void {
    this.log('critical', message, context, error, source);
  }

  public error(message: string, context: LogContext = {}, error?: Error, source: LogSource = 'backend'): void {
    this.log('error', message, context, error, source);
  }

  public warning(message: string, context: LogContext = {}, source: LogSource = 'backend'): void {
    this.log('warning', message, context, undefined, source);
  }

  public notice(message: string, context: LogContext = {}, source: LogSource = 'backend'): void {
    this.log('notice', message, context, undefined, source);
  }

  public info(message: string, context: LogContext = {}, source: LogSource = 'backend'): void {
    this.log('info', message, context, undefined, source);
  }

  public debug(message: string, context: LogContext = {}, source: LogSource = 'backend'): void {
    this.log('debug', message, context, undefined, source);
  }

  /**
   * Log from frontend source
   */
  public fromFrontend(level: LogLevel, message: string, context: LogContext = {}, error?: Error): void {
    this.log(level, message, context, error, 'frontend');
  }

  /**
   * Check if error logging is enabled
   */
  public isErrorsEnabled(): boolean {
    return this.errorsEnabled;
  }

  /**
   * Check if info logging is enabled
   */
  public isInfoEnabled(): boolean {
    return this.infoEnabled;
  }
  /**
   * Get logs from the current log files
   */
  public async getLogs(limit: number = 100): Promise<LogEntry[]> {
    const dateStr = this.getDateString();
    const infoFile = path.join(this.logsDir, `info-${dateStr}.log`);
    const errorFile = path.join(this.logsDir, `errors-${dateStr}.log`);

    const logs: LogEntry[] = [];

    const processFile = (filePath: string) => {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            // Regex to parse: [TIMESTAMP] [LEVEL] [SOURCE] message...
            // We use a non-greedy match for the headers and then capture the rest
            const match = line.match(/^\[(.*?)\] \[(.*?)\] \[(.*?)\] (.*)$/);
            
            if (match) {
              const [, timestamp, levelStr, source, remaining] = match;
              let message = remaining;
              let context: LogContext | undefined;
              let error: { name: string; message: string; stack?: string } | undefined;

              // Extract Context if present
              const contextIndex = message.indexOf(' Context: {');
              if (contextIndex !== -1) {
                 // Check if there is an Error part after Context
                 const errorIndex = message.indexOf(' Error: ', contextIndex);
                 let contextJson = '';
                 
                 if (errorIndex !== -1) {
                     contextJson = message.substring(contextIndex + 10, errorIndex);
                     const errorPart = message.substring(errorIndex + 8);
                     
                     // Parse Error
                     const [errName, ...errMsgParts] = errorPart.split(': ');
                     const fullErrorMsg = errMsgParts.join(': ');
                      error = { name: errName, message: fullErrorMsg };
                      
                      const stackSplit = error.message.split(' Stack: ');
                       if (stackSplit.length > 1) {
                           error.message = stackSplit[0];
                           error.stack = stackSplit[1];
                       }
                 } else {
                     contextJson = message.substring(contextIndex + 10);
                 }
                 
                 try {
                     context = JSON.parse(contextJson);
                 } catch (e) {
                     // ignore json parse error
                 }
                 
                 message = message.substring(0, contextIndex);
              } else {
                  // No Context, check for Error directly
                  const errorIndex = message.indexOf(' Error: ');
                  if (errorIndex !== -1) {
                       const errorPart = message.substring(errorIndex + 8);
                       const [errName, ...errMsgParts] = errorPart.split(': ');
                       error = { name: errName, message: errMsgParts.join(': ') };
                        const stackSplit = error.message.split(' Stack: ');
                       if (stackSplit.length > 1) {
                           error.message = stackSplit[0];
                           error.stack = stackSplit[1];
                       }
                       
                       message = message.substring(0, errorIndex);
                  }
              }

              logs.push({
                timestamp,
                level: levelStr.toLowerCase() as LogLevel,
                source: source as LogSource,
                message: message.trim(),
                context,
                error
              });
            }
          } catch (e) {
            console.error('Failed to parse log line:', line);
          }
        }
      }
    };

    processFile(infoFile);
    processFile(errorFile);

    // Sort by timestamp descending
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
               .slice(0, limit);
  }
}

/**
 * Get the Logger singleton instance
 */
export function logger(): Logger {
  return Logger.getInstance();
}

/**
 * Log facade for static access
 */
export const Log = {
  emergency: (message: string, context: LogContext = {}, error?: Error) =>
    logger().emergency(message, context, error),

  alert: (message: string, context: LogContext = {}, error?: Error) =>
    logger().alert(message, context, error),

  critical: (message: string, context: LogContext = {}, error?: Error) =>
    logger().critical(message, context, error),

  error: (message: string, context: LogContext = {}, error?: Error) =>
    logger().error(message, context, error),

  warning: (message: string, context: LogContext = {}) =>
    logger().warning(message, context),

  notice: (message: string, context: LogContext = {}) =>
    logger().notice(message, context),

  info: (message: string, context: LogContext = {}) =>
    logger().info(message, context),

  debug: (message: string, context: LogContext = {}) =>
    logger().debug(message, context),

  fromFrontend: (level: LogLevel, message: string, context: LogContext = {}, error?: Error) =>
    logger().fromFrontend(level, message, context, error),

  getLogs: (limit?: number) => logger().getLogs(limit),
};

export default Logger;
