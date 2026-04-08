import { spawn } from 'child_process';
import { EventEmitter } from 'events';
export class AppLauncher extends EventEmitter {
    runningApps = new Map();
    async launchApp(appId, filePath) {
        if (this.runningApps.has(appId)) {
            throw new Error(`Application ${appId} is already running`);
        }
        const child = spawn(filePath, [], {
            detached: true,
            stdio: 'ignore'
        });
        child.unref();
        if (!child.pid) {
            throw new Error(`Failed to launch application ${appId}`);
        }
        this.runningApps.set(appId, child);
        child.on('exit', (code) => {
            this.runningApps.delete(appId);
            this.emit('app-terminated', appId, code);
        });
        child.on('error', (err) => {
            this.runningApps.delete(appId);
            this.emit('app-error', appId, err);
        });
        this.emit('app-started', appId, child.pid);
        return child.pid;
    }
    isAppRunning(appId) {
        return this.runningApps.has(appId);
    }
    async terminateApp(appId) {
        const child = this.runningApps.get(appId);
        if (child) {
            child.kill();
            this.runningApps.delete(appId);
        }
    }
}
//# sourceMappingURL=AppLauncher.js.map