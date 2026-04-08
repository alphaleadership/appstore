import log from 'electron-log/main.js';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export class Logger {
  private namespace: string;

  constructor(namespace: string) {
    this.namespace = namespace;
    
    // Configuration d'electron-log
    log.transports.file.level = 'info';
    log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] [{scope}] {text}';
  }

  private getScope() {
    return log.scope(this.namespace);
  }

  info(message: string, ...args: any[]) {
    this.getScope().info(message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.getScope().warn(message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.getScope().error(message, ...args);
  }

  debug(message: string, ...args: any[]) {
    this.getScope().debug(message, ...args);
  }
}

export function createLogger(namespace: string): Logger {
  return new Logger(namespace);
}

export default log;
