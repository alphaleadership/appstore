import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { initDb } from '../repositories/db';
import { setupIPC } from './ipc';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  initDb();
  setupIPC();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  // Requirement 9.3: THE Gestionnaire_Téléchargement SHALL utiliser HTTPS for all downloads.
  // We should be careful about ignoring errors.
  console.error(`SSL Certificate error for ${url}: ${error}`);
  
  // For now, let's allow the user to proceed if they want, but in a real app
  // we might want to show a dialog. 
  // event.preventDefault();
  // callback(true);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
