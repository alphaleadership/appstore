import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync.js';
import * as path from 'path';
import { app } from 'electron';
import { Application, DownloadedApp, UserPreferences } from '../models/types.js';

export interface DatabaseSchema {
  applications: Application[];
  downloaded_apps: DownloadedApp[];
  preferences: UserPreferences;
}

// Ensure initDb uses commonjs require or proper ESM import for lowdb if needed
// For now, let's keep the standard ESM syntax and see.

export function initDb() {
  const dbPath = path.join(app.getPath('userData'), 'appstore.json');
  const adapter = new FileSync<DatabaseSchema>(dbPath);
  const db = low(adapter);

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

// Note: db exported as a singleton might be tricky in ESM if initialized asynchronously
// but here it's fine for simple use.
const dbPath = path.join(app.getPath('userData'), 'appstore.json');
const adapter = new FileSync<DatabaseSchema>(dbPath);
export const db = low(adapter);
