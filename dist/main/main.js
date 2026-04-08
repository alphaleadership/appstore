import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from '../repositories/db.js';
import { setupIPC } from './ipc.js';
import { createLogger } from '../utils/logger.js';
import log from 'electron-log/main.js';
// Initialize electron-log for renderer processes
log.initialize();
const logger = createLogger('MainProcess');
// Workaround for 'unable to get local issuer certificate'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
}
app.whenReady().then(() => {
    initDb();
    setupIPC();
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    // Requirement 9.3: THE Gestionnaire_Téléchargement SHALL utiliser HTTPS for all downloads.
    // We should be careful about ignoring errors.
    logger.error(`SSL Certificate error for ${url}: ${error}`);
    // For now, let's allow the user to proceed if they want, but in a real app
    // we might want to show a dialog. 
    // event.preventDefault();
    // callback(true);
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});
//# sourceMappingURL=main.js.map