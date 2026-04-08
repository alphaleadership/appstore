export function isApplication(obj) {
    return (typeof obj.id === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.version === 'string' &&
        typeof obj.downloadUrl === 'string');
}
export function isDownloadedApp(obj) {
    return (typeof obj.id === 'string' &&
        typeof obj.appId === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.filePath === 'string' &&
        typeof obj.status === 'string');
}
export function isUserPreferences(obj) {
    return (typeof obj.downloadFolder === 'string' &&
        typeof obj.autoUpdate === 'boolean' &&
        typeof obj.enableNotifications === 'boolean' &&
        (obj.theme === 'light' || obj.theme === 'dark') &&
        typeof obj.language === 'string');
}
//# sourceMappingURL=validators.js.map