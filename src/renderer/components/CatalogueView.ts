import { Application, DownloadProgress } from '../../models/types';

export class CatalogueView {
  private container: HTMLElement;
  private appList: HTMLElement;
  private searchInput: HTMLInputElement;
  private categorySelect: HTMLSelectElement;
  private loadingIndicator: HTMLElement;
  private currentApps: Application[] = [];

  constructor(private rootId: string) {
    const root = document.getElementById(rootId);
    if (!root) throw new Error(`Root element ${rootId} not found`);

    this.container = document.createElement('div');
    this.container.className = 'catalogue-container';
    this.container.innerHTML = `
      <div class="controls">
        <input type="text" id="app-search" placeholder="Search applications...">
        <select id="category-filter">
          <option value="">All Categories</option>
          <option value="Development">Development</option>
          <option value="Design">Design</option>
          <option value="Productivity">Productivity</option>
          <option value="Utilities">Utilities</option>
        </select>
      </div>
      <div id="loading-indicator" class="hidden">Loading...</div>
      <div class="app-list" id="app-list"></div>
      <button id="load-more">Load More</button>
    `;

    root.appendChild(this.container);
    this.appList = this.container.querySelector('#app-list')!;
    this.searchInput = this.container.querySelector('#app-search')!;
    this.categorySelect = this.container.querySelector('#category-filter')!;
    this.loadingIndicator = this.container.querySelector('#loading-indicator')!;

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.searchInput.addEventListener('input', () => {
      this.onSearch(this.searchInput.value);
    });

    this.categorySelect.addEventListener('change', () => {
      this.onFilter(this.categorySelect.value);
    });

    this.container.querySelector('#load-more')?.addEventListener('click', () => {
      this.onLoadMore();
    });
  }

  displayCatalog(apps: Application[]) {
    this.currentApps = apps;
    this.appList.innerHTML = '';
    apps.forEach(app => this.addAppCard(app));
  }

  getAppById(id: string): Application | undefined {
    return this.currentApps.find(app => app.id === id);
  }

  private addAppCard(app: Application) {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.dataset.id = app.id;
    card.innerHTML = `
      <img src="${app.thumbnailUrl}" alt="${app.name}">
      <h3>${app.name}</h3>
      <p class="version">v${app.version}</p>
      <p class="description">${app.description}</p>
      <div class="progress-bar hidden">
        <div class="progress-fill"></div>
        <span class="progress-text">0%</span>
      </div>
      <div class="actions">
        <button class="download-btn" data-id="${app.id}">Download</button>
      </div>
    `;

    card.querySelector('.download-btn')?.addEventListener('click', () => {
      this.onDownload(app.id);
    });

    this.appList.appendChild(card);
  }

  updateProgress(appId: string, progress: DownloadProgress) {
    const card = this.appList.querySelector(`.app-card[data-id="${appId}"]`);
    if (card) {
      const progressBar = card.querySelector('.progress-bar') as HTMLElement;
      const progressFill = card.querySelector('.progress-fill') as HTMLElement;
      const progressText = card.querySelector('.progress-text') as HTMLElement;
      const downloadBtn = card.querySelector('.download-btn') as HTMLButtonElement;

      progressBar.classList.remove('hidden');
      downloadBtn.disabled = true;
      progressFill.style.width = `${progress.percentComplete}%`;
      progressText.textContent = `${Math.round(progress.percentComplete)}%`;

      if (progress.status === 'completed') {
        progressBar.classList.add('hidden');
        downloadBtn.textContent = 'Downloaded';
        downloadBtn.disabled = true;
      }
    }
  }

  showError(message: string) {
    alert(message);
  }

  showLoadingIndicator() {
    this.loadingIndicator.classList.remove('hidden');
  }

  hideLoadingIndicator() {
    this.loadingIndicator.classList.add('hidden');
  }

  // Event handlers to be implemented by consumer
  onSearch: (query: string) => void = () => {};
  onFilter: (category: string) => void = () => {};
  onDownload: (appId: string) => void = () => {};
  onLoadMore: () => void = () => {};
}
