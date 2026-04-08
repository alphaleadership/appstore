import * as fs from 'fs';
import * as path from 'path';
import { DownloadedApp, UserPreferences, DiskUsage } from '../models/types.js';
import { IDownloadedAppRepository, IPreferencesRepository } from '../repositories/interfaces.js';
import { checkDiskSpace } from './utils.js'; // Assuming I'll create some utils

export class StorageManager {
  constructor(
    private appRepo: IDownloadedAppRepository,
    private prefRepo: IPreferencesRepository
  ) {}

  async saveDownloadedApp(app: DownloadedApp): Promise<void> {
    this.appRepo.save(app);
  }

  async deleteDownloadedApp(appId: string): Promise<void> {
    const app = this.appRepo.findById(appId);
    if (app && fs.existsSync(app.filePath)) {
      fs.unlinkSync(app.filePath);
    }
    this.appRepo.delete(appId);
  }

  async getDownloadedApps(): Promise<DownloadedApp[]> {
    return this.appRepo.findAll();
  }

  async verifyDownloadedApps(): Promise<void> {
    const apps = this.appRepo.findAll();
    for (const app of apps) {
      if (!fs.existsSync(app.filePath)) {
        this.appRepo.delete(app.id);
      }
    }
  }

  getDownloadFolder(): string {
    return this.prefRepo.load().downloadFolder;
  }

  async setDownloadFolder(newPath: string): Promise<void> {
    const prefs = this.prefRepo.load();
    prefs.downloadFolder = newPath;
    this.prefRepo.save(prefs);
    if (!fs.existsSync(newPath)) {
      fs.mkdirSync(newPath, { recursive: true });
    }
  }

  async getDiskUsage(): Promise<DiskUsage> {
    const downloadFolder = this.getDownloadFolder();
    // Simplified disk usage calculation
    // In a real app, I'd use a library like 'diskusage'
    return {
      usedBytes: this.getFolderSize(downloadFolder),
      availableBytes: 1000 * 1024 * 1024, // Mock 1GB available
      totalBytes: 2000 * 1024 * 1024 // Mock 2GB total
    };
  }

  private getFolderSize(folderPath: string): number {
    if (!fs.existsSync(folderPath)) return 0;
    const stats = fs.statSync(folderPath);
    if (stats.isFile()) return stats.size;
    
    let totalSize = 0;
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
      totalSize += this.getFolderSize(path.join(folderPath, file));
    }
    return totalSize;
  }

  async cleanupPartialFiles(): Promise<void> {
    const downloadFolder = this.getDownloadFolder();
    if (fs.existsSync(downloadFolder)) {
      const files = fs.readdirSync(downloadFolder);
      for (const file of files) {
        if (file.endsWith('.part')) {
          fs.unlinkSync(path.join(downloadFolder, file));
        }
      }
    }
  }

  async savePreferences(prefs: UserPreferences): Promise<void> {
    this.prefRepo.save(prefs);
  }

  async loadPreferences(): Promise<UserPreferences> {
    return this.prefRepo.load();
  }
}
