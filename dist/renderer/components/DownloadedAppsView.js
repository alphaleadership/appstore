export class DownloadedAppsView {
    rootId;
    container;
    appList;
    constructor(rootId) {
        this.rootId = rootId;
        const root = document.getElementById(rootId);
        if (!root)
            throw new Error(`Root element ${rootId} not found`);
        this.container = document.createElement('div');
        this.container.className = 'downloaded-apps-container hidden';
        this.container.innerHTML = `
      <h2>Downloaded Applications</h2>
      <div class="app-list" id="downloaded-app-list"></div>
    `;
        root.appendChild(this.container);
        this.appList = this.container.querySelector('#downloaded-app-list');
    }
    displayDownloadedApps(apps) {
        this.appList.innerHTML = '';
        if (apps.length === 0) {
            this.appList.innerHTML = '<p>No applications downloaded yet.</p>';
            return;
        }
        apps.forEach(app => this.addAppCard(app));
    }
    addAppCard(app) {
        const card = document.createElement('div');
        card.className = 'app-card downloaded';
        card.dataset.id = app.id;
        card.innerHTML = `
      <h3>${app.name}</h3>
      <p class="version">v${app.version}</p>
      <p class="details">Downloaded: ${new Date(app.downloadedAt).toLocaleDateString()}</p>
      <p class="details">Size: ${(app.fileSize / 1024 / 1024).toFixed(2)} MB</p>
      <div class="status-indicator ${app.isRunning ? 'running' : ''}">
        ${app.isRunning ? 'Running' : 'Ready'}
      </div>
      <div class="actions">
        <button class="launch-btn" data-id="${app.id}">${app.isRunning ? 'Stop' : 'Launch'}</button>
        <button class="delete-btn" data-id="${app.id}">Delete</button>
      </div>
    `;
        card.querySelector('.launch-btn')?.addEventListener('click', () => {
            this.onLaunch(app.id);
        });
        card.querySelector('.delete-btn')?.addEventListener('click', () => {
            this.onDelete(app.id);
        });
        this.appList.appendChild(card);
    }
    show() {
        this.container.classList.remove('hidden');
    }
    hide() {
        this.container.classList.add('hidden');
    }
    // Event handlers
    onLaunch = () => { };
    onDelete = () => { };
}
//# sourceMappingURL=DownloadedAppsView.js.map