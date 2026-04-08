export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export class Logger {
  private namespace: string;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${this.namespace}] ${message}`;
  }

  info(message: string, ...args: any[]) {
    console.info(this.formatMessage('info', message), ...args);
  }

  warn(message: string, ...args: any[]) {
    console.warn(this.formatMessage('warn', message), ...args);
  }

  error(message: string, ...args: any[]) {
    console.error(this.formatMessage('error', message), ...args);
  }

  debug(message: string, ...args: any[]) {
    console.debug(this.formatMessage('debug', message), ...args);
  }
}

export function createLogger(namespace: string): Logger {
  return new Logger(namespace);
}
