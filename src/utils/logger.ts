export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export class Logger {
  private namespace: string;
  private logInstance: any;

  constructor(namespace: string) {
    this.namespace = namespace;
    
    const isRenderer = typeof window !== 'undefined' && typeof (window as any).require === 'function';

    if (isRenderer) {
      try {
        this.logInstance = (window as any).require('electron-log/renderer');
      } catch (e) {
        this.logInstance = console;
      }
    } else {
      try {
        // Use the main instance
        // @ts-ignore
        const log = require('electron-log');
        this.logInstance = log;
      } catch (e) {
        this.logInstance = console;
      }
    }
  }

  private getScope() {
    if (this.logInstance.scope) {
      return this.logInstance.scope(this.namespace);
    }
    return this.logInstance;
  }

  info(message: string, ...args: any[]) {
    this.getScope().info(message, ...args);
    if (!this.logInstance.scope) console.info(`[${this.namespace}] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.getScope().warn(message, ...args);
    if (!this.logInstance.scope) console.warn(`[${this.namespace}] ${message}`, ...args);
  }

  error(message: string, ...args: any[]) {
    this.getScope().error(message, ...args);
    if (!this.logInstance.scope) console.error(`[${this.namespace}] ${message}`, ...args);
  }

  debug(message: string, ...args: any[]) {
    this.getScope().debug(message, ...args);
    if (!this.logInstance.scope) console.debug(`[${this.namespace}] ${message}`, ...args);
  }
}

export function createLogger(namespace: string): Logger {
  return new Logger(namespace);
}
