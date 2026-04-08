export class Logger {
    namespace;
    logInstance;
    constructor(namespace) {
        this.namespace = namespace;
        const isRenderer = typeof window !== 'undefined' && typeof window.require === 'function';
        if (isRenderer) {
            try {
                this.logInstance = window.require('electron-log/renderer');
            }
            catch (e) {
                this.logInstance = console;
            }
        }
        else {
            try {
                // @ts-ignore
                const log = require('electron-log');
                // Initialisation automatique dans le processus Main si ce n'est pas déjà fait
                if (typeof log.initialize === 'function') {
                    log.initialize();
                }
                // Configuration par défaut
                log.transports.console.level = 'debug';
                log.transports.file.level = 'info';
                this.logInstance = log;
            }
            catch (e) {
                this.logInstance = console;
            }
        }
    }
    getScope() {
        if (this.logInstance.scope) {
            return this.logInstance.scope(this.namespace);
        }
        return this.logInstance;
    }
    info(message, ...args) {
        this.getScope().info(message, ...args);
        if (!this.logInstance.scope)
            console.info(`[${this.namespace}] ${message}`, ...args);
    }
    warn(message, ...args) {
        this.getScope().warn(message, ...args);
        if (!this.logInstance.scope)
            console.warn(`[${this.namespace}] ${message}`, ...args);
    }
    error(message, ...args) {
        this.getScope().error(message, ...args);
        if (!this.logInstance.scope)
            console.error(`[${this.namespace}] ${message}`, ...args);
    }
    debug(message, ...args) {
        this.getScope().debug(message, ...args);
        if (!this.logInstance.scope)
            console.debug(`[${this.namespace}] ${message}`, ...args);
    }
}
export function createLogger(namespace) {
    return new Logger(namespace);
}
//# sourceMappingURL=logger.js.map