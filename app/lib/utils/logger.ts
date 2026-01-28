/**
 * Logging utility for consistent, informative, and traceable logging.
 * Provides structured logging with appropriate log levels.
 */

/**
 * Log level types for structured logging.
 */
type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

/**
 * Context object for logging additional metadata.
 * Can include component name, function name, and any other key-value pairs.
 */
interface LogContext {
  /** Component or service name that generated the log */
  component?: string;
  /** Function name that generated the log */
  function?: string;
  /** Additional context key-value pairs */
  [key: string]: unknown;
}

/**
 * Determines if a log level should be output based on environment.
 * @param level - The log level to check
 * @returns true if the log should be output, false otherwise
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
 * Formats a log message with context and timestamp.
 * @param level - The log level (DEBUG, INFO, WARN, ERROR)
 * @param message - The log message text
 * @param context - Optional context object with additional metadata
 * @returns Formatted log message string with timestamp and context
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
 * @param message - The debug message to log
 * @param context - Optional context object with additional metadata
 */
export function logDebug(message: string, context?: LogContext): void {
  if (shouldLog('DEBUG')) {
    console.debug(formatMessage('DEBUG', message, context));
  }
}

/**
 * Logs an INFO message.
 * @param message - The info message to log
 * @param context - Optional context object with additional metadata
 */
export function logInfo(message: string, context?: LogContext): void {
  if (shouldLog('INFO')) {
    console.log(formatMessage('INFO', message, context));
  }
}

/**
 * Logs a WARN message.
 * @param message - The warning message to log
 * @param context - Optional context object with additional metadata
 */
export function logWarn(message: string, context?: LogContext): void {
  if (shouldLog('WARN')) {
    console.warn(formatMessage('WARN', message, context));
  }
}

/**
 * Logs an ERROR message with optional error object.
 * @param message - The error message to log
 * @param error - Optional Error object or unknown error value
 * @param context - Optional context object with additional metadata
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
 * Logger instance interface with methods for different log levels.
 */
export interface Logger {
  /**
   * Logs a DEBUG message (only in development).
   * @param message - The debug message to log
   * @param context - Optional context object (component is automatically added)
   */
  debug: (message: string, context?: Omit<LogContext, 'component'>) => void;
  /**
   * Logs an INFO message.
   * @param message - The info message to log
   * @param context - Optional context object (component is automatically added)
   */
  info: (message: string, context?: Omit<LogContext, 'component'>) => void;
  /**
   * Logs a WARN message.
   * @param message - The warning message to log
   * @param context - Optional context object (component is automatically added)
   */
  warn: (message: string, context?: Omit<LogContext, 'component'>) => void;
  /**
   * Logs an ERROR message with optional error object.
   * @param message - The error message to log
   * @param error - Optional Error object or unknown error value
   * @param context - Optional context object (component is automatically added)
   */
  error: (
    message: string,
    error?: Error | unknown,
    context?: Omit<LogContext, 'component'>
  ) => void;
}

/**
 * Creates a logger instance for a specific component/service.
 * The component name is automatically included in all log messages.
 * @param component - The component or service name (e.g., 'EventMonitor', 'Storage')
 * @returns Logger instance with debug, info, warn, and error methods
 */
export function createLogger(component: string): Logger {
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
