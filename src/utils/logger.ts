export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export class Logger {
  private namespace: string;
  private log: any;

  constructor(namespace: string) {
    this.namespace = namespace;
    
    // Détection de l'environnement (Main vs Renderer)
    const isRenderer = typeof window !== 'undefined' && typeof (window as any).require === 'function';

    if (isRenderer) {
      // Dans le Renderer, on utilise le require d'Electron
      try {
        this.log = (window as any).require('electron-log/renderer');
      } catch (e) {
        // Fallback si electron-log n'est pas dispo
        this.log = console;
      }
    } else {
      // Dans le Main, on utilise l'import dynamique (ou require)
      // On utilise require ici pour éviter les problèmes d'import ESM dans le Main avec electron-log
      try {
        // @ts-ignore
        const electronLog = require('electron-log');
        this.log = electronLog;
      } catch (e) {
        this.log = console;
      }
    }
  }

  private getScope() {
    return this.log.scope ? this.log.scope(this.namespace) : this.log;
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
