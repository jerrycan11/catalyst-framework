/**
 * Catalyst Frontend Logger
 *
 * Client-side logger that sends logs to the backend API for centralized storage.
 * Supports all log levels and automatically includes error details.
 *
 * @example
 * ```ts
 * import { FrontendLog } from '@/resources/lib/logger';
 *
 * // Simple logging
 * FrontendLog.info('Page loaded', { page: 'dashboard' });
 * FrontendLog.error('API call failed', { endpoint: '/api/users' }, error);
 *
 * // With try-catch
 * try {
 *   await fetchData();
 * } catch (error) {
 *   FrontendLog.error('Failed to fetch data', { component: 'DataTable' }, error as Error);
 * }
 * ```
 */

export type FrontendLogLevel =
  | 'emergency'
  | 'alert'
  | 'critical'
  | 'error'
  | 'warning'
  | 'notice'
  | 'info'
  | 'debug';

export interface FrontendLogContext {
  [key: string]: unknown;
}

interface LogPayload {
  level: FrontendLogLevel;
  message: string;
  context?: FrontendLogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Send a log to the backend API
 */
async function sendLog(payload: LogPayload): Promise<void> {
  try {
    // Use sendBeacon for better reliability (won't be cancelled on page unload)
    const useBeacon = typeof navigator !== 'undefined' && navigator.sendBeacon;

    if (useBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon('/api/log', blob);
    } else {
      // Fallback to fetch for non-browser environments
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
  } catch {
    // Silently fail - we don't want logging failures to break the app
    // But log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Failed to send log to server:', payload);
    }
  }
}

/**
 * Create a log payload from arguments
 */
function createPayload(
  level: FrontendLogLevel,
  message: string,
  context?: FrontendLogContext,
  error?: Error
): LogPayload {
  const payload: LogPayload = {
    level,
    message,
    context,
  };

  if (error) {
    payload.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return payload;
}

/**
 * Frontend Logger facade
 */
export const FrontendLog = {
  /**
   * Log an emergency message (system is unusable)
   */
  emergency(message: string, context?: FrontendLogContext, error?: Error): void {
    const payload = createPayload('emergency', message, context, error);
    sendLog(payload);
    console.error(`[EMERGENCY] ${message}`, context, error);
  },

  /**
   * Log an alert message (action must be taken immediately)
   */
  alert(message: string, context?: FrontendLogContext, error?: Error): void {
    const payload = createPayload('alert', message, context, error);
    sendLog(payload);
    console.error(`[ALERT] ${message}`, context, error);
  },

  /**
   * Log a critical message (critical conditions)
   */
  critical(message: string, context?: FrontendLogContext, error?: Error): void {
    const payload = createPayload('critical', message, context, error);
    sendLog(payload);
    console.error(`[CRITICAL] ${message}`, context, error);
  },

  /**
   * Log an error message
   */
  error(message: string, context?: FrontendLogContext, error?: Error): void {
    const payload = createPayload('error', message, context, error);
    sendLog(payload);
    console.error(`[ERROR] ${message}`, context, error);
  },

  /**
   * Log a warning message
   */
  warning(message: string, context?: FrontendLogContext): void {
    const payload = createPayload('warning', message, context);
    sendLog(payload);
    console.warn(`[WARNING] ${message}`, context);
  },

  /**
   * Log a notice message
   */
  notice(message: string, context?: FrontendLogContext): void {
    const payload = createPayload('notice', message, context);
    sendLog(payload);
    console.log(`[NOTICE] ${message}`, context);
  },

  /**
   * Log an info message
   */
  info(message: string, context?: FrontendLogContext): void {
    const payload = createPayload('info', message, context);
    sendLog(payload);
    console.log(`[INFO] ${message}`, context);
  },

  /**
   * Log a debug message
   */
  debug(message: string, context?: FrontendLogContext): void {
    const payload = createPayload('debug', message, context);
    sendLog(payload);
    console.debug(`[DEBUG] ${message}`, context);
  },

  /**
   * Capture and log an error from a try-catch block
   */
  captureError(error: Error, context?: FrontendLogContext): void {
    this.error(error.message, { ...context, errorName: error.name }, error);
  },

  /**
   * Create an error boundary handler for React components
   */
  createErrorBoundaryHandler(componentName: string) {
    return (error: Error, errorInfo: { componentStack: string }) => {
      this.error(`Error in ${componentName}`, {
        componentStack: errorInfo.componentStack,
        component: componentName,
      }, error);
    };
  },
};

/**
 * Setup global error handlers for uncaught errors
 */
export function setupGlobalErrorHandlers(): void {
  if (typeof window === 'undefined') return;

  // Catch unhandled errors
  window.addEventListener('error', (event) => {
    FrontendLog.error('Uncaught error', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    }, event.error);
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));
    FrontendLog.error('Unhandled promise rejection', {}, error);
  });
}

export default FrontendLog;
