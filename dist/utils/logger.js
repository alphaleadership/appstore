import log from 'electron-log/main.js';
export class Logger {
    namespace;
    constructor(namespace) {
        this.namespace = namespace;
        // Configuration d'electron-log
        log.transports.file.level = 'info';
        log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] [{scope}] {text}';
    }
    getScope() {
        return log.scope(this.namespace);
    }
    info(message, ...args) {
        this.getScope().info(message, ...args);
    }
    warn(message, ...args) {
        this.getScope().warn(message, ...args);
    }
    error(message, ...args) {
        this.getScope().error(message, ...args);
    }
    debug(message, ...args) {
        this.getScope().debug(message, ...args);
    }
}
export function createLogger(namespace) {
    return new Logger(namespace);
}
export default log;
//# sourceMappingURL=logger.js.map