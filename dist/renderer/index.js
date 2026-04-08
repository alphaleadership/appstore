import { CatalogueView } from './components/CatalogueView.js';
import { DownloadedAppsView } from './components/DownloadedAppsView.js';
import { SettingsView } from './components/SettingsView.js';
import { createLogger } from '../utils/logger.js';
const logger = createLogger('Renderer');
logger.info('Renderer process started');
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
const { ipcRenderer } = window.require('electron');
let currentPage = 1;
const pageSize = 12;
function showView(viewName) {
    const views = {
        catalogue: document.querySelector('.catalogue-container'),
        downloaded: document.querySelector('.downloaded-apps-container'),
        settings: document.querySelector('.settings-container')
    };
    Object.values(views).forEach(v => v?.classList.add('hidden'));
    views[viewName]?.classList.remove('hidden');
    if (viewName === 'catalogue') {
        loadCatalog();
    }
    else if (viewName === 'downloaded') {
        loadDownloadedApps();
    }
    else if (viewName === 'settings') {
        loadSettings();
    }
}
async function loadCatalog() {
    catalogueView.showLoadingIndicator();
    try {
        const page = await ipcRenderer.invoke('catalog:fetch', 1, pageSize);
        catalogueView.displayCatalog(page.applications);
        currentPage = 1;
    }
    catch (error) {
        logger.error('Failed to load catalog', error);
    }
    finally {
        catalogueView.hideLoadingIndicator();
    }
}
async function loadDownloadedApps() {
    try {
        const apps = await ipcRenderer.invoke('storage:getDownloadedApps');
        downloadedAppsView.displayDownloadedApps(apps);
    }
    catch (error) {
        logger.error('Failed to load downloaded apps', error);
    }
}
async function loadSettings() {
    try {
        const usage = await ipcRenderer.invoke('storage:getDiskUsage');
        settingsView.displayDiskUsage(usage);
        // Preferences are usually loaded from storage manager in Main, but let's assume we have them
        // For now we use hardcoded defaults if not exposed via IPC yet
        settingsView.displayPreferences({
            downloadFolder: '',
            autoUpdate: true,
            enableNotifications: true,
            theme: 'dark',
            language: 'fr',
            maxParallelDownloads: 3,
            enableCompressionTransfer: true
        });
    }
    catch (error) {
        logger.error('Failed to load settings', error);
    }
}
document.getElementById('nav-catalogue')?.addEventListener('click', () => showView('catalogue'));
document.getElementById('nav-downloaded')?.addEventListener('click', () => showView('downloaded'));
document.getElementById('nav-settings')?.addEventListener('click', () => showView('settings'));
// Initialize
showView('catalogue');
// Event Handlers
catalogueView.onDownload = async (appId) => {
    const app = catalogueView.getAppById(appId);
    if (app) {
        await ipcRenderer.invoke('download:start', appId, app.downloadUrl);
    }
};
catalogueView.onSearch = async (query) => {
    if (!query) {
        loadCatalog();
        return;
    }
    try {
        const apps = await ipcRenderer.invoke('catalog:search', query);
        catalogueView.displayCatalog(apps);
    }
    catch (error) {
        logger.error('Search failed', error);
    }
};
ipcRenderer.on('download:progress', (event, progress) => {
    catalogueView.updateProgress(progress.appId, progress);
});
ipcRenderer.on('download:error', (event, { appId, error }) => {
    catalogueView.showError(`Download failed for app ${appId}: ${error}`);
});
ipcRenderer.on('download:complete', (event, appId) => {
    logger.info(`Download complete for app: ${appId}`);
    loadDownloadedApps(); // Refresh downloaded list if visible
});
//# sourceMappingURL=index.js.map