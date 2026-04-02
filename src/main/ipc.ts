import { ipcMain } from 'electron';
import { CatalogManager } from '../services/CatalogManager';
import { DownloadManager } from '../services/DownloadManager';
import { StorageManager } from '../services/StorageManager';
import { AppLauncher } from '../services/AppLauncher';
import { SQLiteApplicationRepository, SQLiteDownloadedAppRepository, SQLitePreferencesRepository } from '../repositories/sqlite';
import { IntegrityChecker } from '../services/IntegrityChecker';
import { DownloadProgress } from '../models/types';

export function setupIPC() {
  const appRepo = new SQLiteApplicationRepository();
  const downloadedAppRepo = new SQLiteDownloadedAppRepository();
  const prefRepo = new SQLitePreferencesRepository();

  const catalogManager = new CatalogManager(appRepo);
  const integrityChecker = new IntegrityChecker();
  const storageManager = new StorageManager(downloadedAppRepo, prefRepo);
  const downloadManager = new DownloadManager(storageManager, integrityChecker);
  const appLauncher = new AppLauncher();

  // Catalog IPC
  ipcMain.handle('catalog:fetch', async (event, page: number, pageSize: number) => {
    return await catalogManager.fetchCatalog(page, pageSize);
  });

  ipcMain.handle('catalog:search', async (event, query: string) => {
    return await catalogManager.searchApplications(query);
  });

  // Download IPC
  ipcMain.handle('download:start', async (event, appId: string, url: string) => {
    return await downloadManager.startDownload(appId, url);
  });

  ipcMain.handle('download:cancel', async (event, appId: string) => {
    return await downloadManager.cancelDownload(appId);
  });

  downloadManager.onProgressUpdate((progress: DownloadProgress) => {
    eventSender('download:progress', progress);
  });

  downloadManager.onDownloadComplete((appId: string) => {
    eventSender('download:complete', appId);
  });

  // Storage IPC
  ipcMain.handle('storage:getDownloadedApps', async () => {
    return await storageManager.getDownloadedApps();
  });

  ipcMain.handle('storage:deleteApp', async (event, appId: string) => {
    return await storageManager.deleteDownloadedApp(appId);
  });

  ipcMain.handle('storage:getDiskUsage', async () => {
    return await storageManager.getDiskUsage();
  });

  // App Launcher IPC
  ipcMain.handle('app:launch', async (event, appId: string, filePath: string) => {
    return await appLauncher.launchApp(appId, filePath);
  });
}

function eventSender(channel: string, data: any) {
  const { BrowserWindow } = require('electron');
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    win.webContents.send(channel, data);
  }
}
