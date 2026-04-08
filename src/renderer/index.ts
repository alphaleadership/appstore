import { CatalogueView } from './components/CatalogueView.js';
import { DownloadedAppsView } from './components/DownloadedAppsView.js';
import { SettingsView } from './components/SettingsView.js';

console.log('Renderer process started');

const rootId = 'root';
const root = document.getElementById(rootId);
if (root) {
  const nav = document.createElement('nav');
  nav.innerHTML = `
    <button id="nav-catalogue">Catalogue</button>
    <button id="nav-downloaded">Downloaded</button>
    <button id="nav-settings">Settings</button>
  `;
  root.appendChild(nav);
}

const catalogueView = new CatalogueView(rootId);
const downloadedAppsView = new DownloadedAppsView(rootId);
const settingsView = new SettingsView(rootId);

function showView(viewName: 'catalogue' | 'downloaded' | 'settings') {
  catalogueView.hideLoadingIndicator(); // Ensure it's hidden when switching
  
  // Actually I need to add hide/show to CatalogueView too or just toggle container
  // For now let's just use CSS classes
  const views = {
    catalogue: document.querySelector('.catalogue-container'),
    downloaded: document.querySelector('.downloaded-apps-container'),
    settings: document.querySelector('.settings-container')
  };

  Object.values(views).forEach(v => v?.classList.add('hidden'));
  views[viewName]?.classList.remove('hidden');
}

document.getElementById('nav-catalogue')?.addEventListener('click', () => showView('catalogue'));
document.getElementById('nav-downloaded')?.addEventListener('click', () => showView('downloaded'));
document.getElementById('nav-settings')?.addEventListener('click', () => showView('settings'));

// Initialize with Catalogue
showView('catalogue');

// Mock data
catalogueView.displayCatalog([
  {
    id: 'app-001',
    name: 'VS Code',
    version: '1.85.0',
    description: 'Code editor',
    category: 'Development',
    author: 'Microsoft',
    downloadUrl: 'https://update.code.visualstudio.com/latest/win32-x64-user/stable',
    fileSize: 150000000,
    checksum: 'sha256:abc123',
    signature: 'sig123',
    publicKey: 'key123',
    thumbnailUrl: 'https://via.placeholder.com/250x150',
    releaseDate: '2024-01-15',
    downloadCount: 50000,
    rating: 4.8,
    tags: ['editor', 'development', 'code']
  }
]);

downloadedAppsView.displayDownloadedApps([
  {
    id: 'd-001',
    appId: 'app-001',
    name: 'VS Code',
    version: '1.84.0',
    filePath: '/path/to/vscode.exe',
    fileSize: 140000000,
    downloadedAt: new Date().toISOString(),
    status: 'completed',
    checksum: 'sha256:abc123',
    isRunning: false
  }
]);

settingsView.displayPreferences({
  downloadFolder: '/downloads/ElectronApps',
  autoUpdate: true,
  enableNotifications: true,
  theme: 'light',
  language: 'en',
  maxParallelDownloads: 3,
  enableCompressionTransfer: true
});

settingsView.displayDiskUsage({
  usedBytes: 500 * 1024 * 1024,
  availableBytes: 5000 * 1024 * 1024,
  totalBytes: 10000 * 1024 * 1024
});

const { ipcRenderer } = (window as any).require('electron');

catalogueView.onDownload = async (appId) => {
  const app = catalogueView.getAppById(appId);
  if (app) {
    await ipcRenderer.invoke('download:start', appId, app.downloadUrl);
  }
};

ipcRenderer.on('download:progress', (event: any, progress: any) => {
  catalogueView.updateProgress(progress.appId, progress);
});

ipcRenderer.on('download:error', (event: any, { appId, error }: { appId: string, error: string }) => {
  catalogueView.showError(`Download failed for app ${appId}: ${error}`);
});
