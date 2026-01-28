/**
 * Logging utility for consistent, informative, and traceable logging.
 * Provides structured logging with appropriate log levels.
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogContext {
  component?: string;
  function?: string;
  [key: string]: unknown;
}

/**
 * Determines if a log level should be output based on environment.
 */
function shouldLog(level: LogLevel): boolean {
  // In production, only log WARN and ERROR
  if (process.env.NODE_ENV === 'production') {
    return level === 'WARN' || level === 'ERROR';
  }
  // In development, log everything
  return true;
}

/**
 * Formats a log message with context.
 */
function formatMessage(
  level: LogLevel,
  message: string,
  context?: LogContext
): string {
  const timestamp = new Date().toISOString();
  const contextStr = context
    ? ` [${Object.entries(context)
        .map(([key, value]) => `${key}:${value}`)
        .join(', ')}]`
    : '';
  return `[${timestamp}] [${level}]${contextStr} ${message}`;
}

/**
 * Logs a DEBUG message (only in development).
 */
export function logDebug(message: string, context?: LogContext): void {
  if (shouldLog('DEBUG')) {
    console.debug(formatMessage('DEBUG', message, context));
  }
}

/**
 * Logs an INFO message.
 */
export function logInfo(message: string, context?: LogContext): void {
  if (shouldLog('INFO')) {
    console.log(formatMessage('INFO', message, context));
  }
}

/**
 * Logs a WARN message.
 */
export function logWarn(message: string, context?: LogContext): void {
  if (shouldLog('WARN')) {
    console.warn(formatMessage('WARN', message, context));
  }
}

/**
 * Logs an ERROR message.
 */
export function logError(
  message: string,
  error?: Error | unknown,
  context?: LogContext
): void {
  if (shouldLog('ERROR')) {
    const errorContext = error
      ? {
          ...context,
          error:
            error instanceof Error
              ? error.message
              : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        }
      : context;
    console.error(formatMessage('ERROR', message, errorContext));
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }
}

/**
 * Creates a logger instance for a specific component/service.
 */
export function createLogger(component: string) {
  return {
    debug: (message: string, context?: Omit<LogContext, 'component'>) =>
      logDebug(message, { ...context, component }),
    info: (message: string, context?: Omit<LogContext, 'component'>) =>
      logInfo(message, { ...context, component }),
    warn: (message: string, context?: Omit<LogContext, 'component'>) =>
      logWarn(message, { ...context, component }),
    error: (
      message: string,
      error?: Error | unknown,
      context?: Omit<LogContext, 'component'>
    ) => logError(message, error, { ...context, component }),
  };
}
