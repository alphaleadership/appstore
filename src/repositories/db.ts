import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import * as path from 'path';
import { app } from 'electron';
import { Application, DownloadedApp, UserPreferences } from '../models/types';

export interface DatabaseSchema {
  applications: Application[];
  downloaded_apps: DownloadedApp[];
  preferences: UserPreferences;
}

const dbPath = path.join(app.getPath('userData'), 'appstore.json');
const adapter = new FileSync<DatabaseSchema>(dbPath);
export const db = low(adapter);

export function initDb() {
  db.defaults({
    applications: [],
    downloaded_apps: [],
    preferences: {
      downloadFolder: path.join(app.getPath('downloads'), 'ElectronApps'),
      autoUpdate: true,
      enableNotifications: true,
      theme: 'light' as const,
      language: 'en',
      maxParallelDownloads: 3,
      enableCompressionTransfer: true
    }
  }).write();
}
