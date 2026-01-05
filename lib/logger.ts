import 'server-only'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  requestId?: string
  userId?: string
  method?: string
  path?: string
  [key: string]: any
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: any
}

/**
 * Structured logger for server-side logging
 * Logs are formatted as JSON in production for easy parsing
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatLog(entry: LogEntry): string {
    if (this.isDevelopment) {
      // Human-readable format for development
      const contextStr = entry.context 
        ? ` | ${Object.entries(entry.context).map(([k, v]) => `${k}=${v}`).join(' ')}`
        : ''
      const errorStr = entry.error ? ` | Error: ${entry.error}` : ''
      return `[${entry.timestamp}] ${entry.level.toUpperCase()} ${entry.message}${contextStr}${errorStr}`
    } else {
      // JSON format for production (easier to parse)
      return JSON.stringify(entry)
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...(error.cause && { cause: error.cause }),
      } : undefined,
    }

    const formatted = this.formatLog(entry)

    switch (level) {
      case 'debug':
        console.debug(formatted)
        break
      case 'info':
        console.log(formatted)
        break
      case 'warn':
        console.warn(formatted)
        break
      case 'error':
        console.error(formatted)
        break
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, contextOrError?: LogContext | Error, error?: Error) {
    if (contextOrError instanceof Error) {
      this.log('error', message, undefined, contextOrError)
    } else {
      this.log('error', message, contextOrError, error)
    }
  }
}

// Export singleton logger instance
export const logger = new Logger()

/**
 * Create a logger with pre-filled context
 * Useful for adding requestId, userId, etc. to all logs in a request
 */
export function createContextLogger(baseContext: LogContext) {
  return {
    debug: (message: string, additionalContext?: LogContext) =>
      logger.debug(message, { ...baseContext, ...additionalContext }),
    info: (message: string, additionalContext?: LogContext) =>
      logger.info(message, { ...baseContext, ...additionalContext }),
    warn: (message: string, additionalContext?: LogContext) =>
      logger.warn(message, { ...baseContext, ...additionalContext }),
    error: (message: string, contextOrError?: LogContext | Error, error?: Error) => {
      if (contextOrError instanceof Error) {
        logger.error(message, { ...baseContext }, contextOrError)
      } else {
        logger.error(message, { ...baseContext, ...contextOrError }, error)
      }
    },
  }
}

