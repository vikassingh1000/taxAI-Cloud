/**
 * Production-ready logging utility for tax alert extraction service
 * Supports multiple log levels and structured logging
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: Record<string, any>;
}

class Logger {
  private level: LogLevel;
  private prefix: string;

  constructor(level: LogLevel = LogLevel.INFO, prefix: string = "[TaxAlertService]") {
    this.level = level;
    this.prefix = prefix;
  }

  /**
   * Set the minimum log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Format log entry with timestamp and structured data
   */
  private format(level: string, message: string, context?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message: `${this.prefix} ${message}`,
      ...(context && { context })
    };
  }

  /**
   * Output log to console (can be extended to file/service)
   */
  private output(entry: LogEntry, consoleMethod: (msg: string) => void): void {
    if (process.env.NODE_ENV === "test") {
      return; // Suppress logs in test environment
    }

    const { timestamp, level, message, context } = entry;
    const baseMessage = `[${timestamp}] ${level.padEnd(5)} ${message}`;

    if (context && Object.keys(context).length > 0) {
      consoleMethod(`${baseMessage}\n${JSON.stringify(context, null, 2)}`);
    } else {
      consoleMethod(baseMessage);
    }
  }

  /**
   * DEBUG level logging
   */
  debug(message: string, context?: Record<string, any>): void {
    if (this.level <= LogLevel.DEBUG) {
      const entry = this.format("DEBUG", message, context);
      this.output(entry, console.debug);
    }
  }

  /**
   * INFO level logging
   */
  info(message: string, context?: Record<string, any>): void {
    if (this.level <= LogLevel.INFO) {
      const entry = this.format("INFO", message, context);
      this.output(entry, console.info);
    }
  }

  /**
   * WARN level logging
   */
  warn(message: string, context?: Record<string, any>): void {
    if (this.level <= LogLevel.WARN) {
      const entry = this.format("WARN", message, context);
      this.output(entry, console.warn);
    }
  }

  /**
   * ERROR level logging
   */
  error(message: string, context?: Record<string, any>): void {
    if (this.level <= LogLevel.ERROR) {
      const entry = this.format("ERROR", message, context);
      this.output(entry, console.error);
    }
  }

  /**
   * Create a child logger with additional prefix
   */
  child(childPrefix: string): Logger {
    return new Logger(this.level, `${this.prefix}${childPrefix}`);
  }
}

// Singleton instance
export const logger = new Logger(
  process.env.LOG_LEVEL === "DEBUG" ? LogLevel.DEBUG : LogLevel.INFO
);

export default logger;
