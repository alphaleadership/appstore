export class Logger {
    namespace;
    constructor(namespace) {
        this.namespace = namespace;
    }
    formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level.toUpperCase()}] [${this.namespace}] ${message}`;
    }
    info(message, ...args) {
        console.info(this.formatMessage('info', message), ...args);
    }
    warn(message, ...args) {
        console.warn(this.formatMessage('warn', message), ...args);
    }
    error(message, ...args) {
        console.error(this.formatMessage('error', message), ...args);
    }
    debug(message, ...args) {
        console.debug(this.formatMessage('debug', message), ...args);
    }
}
export function createLogger(namespace) {
    return new Logger(namespace);
}
//# sourceMappingURL=logger.js.map