import { ipcMain, BrowserWindow } from 'electron';
import { CatalogManager } from '../services/CatalogManager.js';
import { DownloadManager } from '../services/DownloadManager.js';
import { StorageManager } from '../services/StorageManager.js';
import { AppLauncher } from '../services/AppLauncher.js';
import { LowdbApplicationRepository, LowdbDownloadedAppRepository, LowdbPreferencesRepository } from '../repositories/lowdb.js';
import { IntegrityChecker } from '../services/IntegrityChecker.js';
export function setupIPC() {
    const appRepo = new LowdbApplicationRepository();
    const downloadedAppRepo = new LowdbDownloadedAppRepository();
    const prefRepo = new LowdbPreferencesRepository();
    const catalogManager = new CatalogManager(appRepo);
    const integrityChecker = new IntegrityChecker();
    const storageManager = new StorageManager(downloadedAppRepo, prefRepo);
    const downloadManager = new DownloadManager(storageManager, integrityChecker);
    const appLauncher = new AppLauncher();
    // Catalog IPC
    ipcMain.handle('catalog:fetch', async (event, page, pageSize) => {
        return await catalogManager.fetchCatalog(page, pageSize);
    });
    ipcMain.handle('catalog:search', async (event, query) => {
        return await catalogManager.searchApplications(query);
    });
    // Download IPC
    ipcMain.handle('download:start', async (event, appId, url) => {
        return await downloadManager.startDownload(appId, url);
    });
    ipcMain.handle('download:cancel', async (event, appId) => {
        return await downloadManager.cancelDownload(appId);
    });
    downloadManager.onProgressUpdate((progress) => {
        eventSender('download:progress', progress);
    });
    downloadManager.onDownloadComplete(async (appId, filePath, fileSize) => {
        const app = appRepo.findById(appId);
        if (app) {
            await storageManager.saveDownloadedApp({
                id: `d-${appId}-${Date.now()}`,
                appId: appId,
                name: app.name,
                version: app.version,
                filePath: filePath,
                fileSize: fileSize,
                downloadedAt: new Date().toISOString(),
                status: 'completed',
                checksum: app.checksum,
                isRunning: false
            });
        }
        eventSender('download:complete', appId);
    });
    downloadManager.onDownloadError((appId, error) => {
        eventSender('download:error', { appId, error: error.message });
    });
    // Storage IPC
    ipcMain.handle('storage:getDownloadedApps', async () => {
        return await storageManager.getDownloadedApps();
    });
    ipcMain.handle('storage:deleteApp', async (event, appId) => {
        return await storageManager.deleteDownloadedApp(appId);
    });
    ipcMain.handle('storage:getDiskUsage', async () => {
        return await storageManager.getDiskUsage();
    });
    // App Launcher IPC
    ipcMain.handle('app:launch', async (event, appId, filePath) => {
        return await appLauncher.launchApp(appId, filePath);
    });
}
function eventSender(channel, data) {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
        win.webContents.send(channel, data);
    }
}
//# sourceMappingURL=ipc.js.map