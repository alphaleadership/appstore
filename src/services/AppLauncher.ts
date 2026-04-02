import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

export class AppLauncher extends EventEmitter {
  private runningApps: Map<string, ChildProcess> = new Map();

  async launchApp(appId: string, filePath: string): Promise<number> {
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

  isAppRunning(appId: string): boolean {
    return this.runningApps.has(appId);
  }

  async terminateApp(appId: string): Promise<void> {
    const child = this.runningApps.get(appId);
    if (child) {
      child.kill();
      this.runningApps.delete(appId);
    }
  }
}
