export class SettingsView {
    rootId;
    container;
    diskInfo;
    form;
    constructor(rootId) {
        this.rootId = rootId;
        const root = document.getElementById(rootId);
        if (!root)
            throw new Error(`Root element ${rootId} not found`);
        this.container = document.createElement('div');
        this.container.className = 'settings-container hidden';
        this.container.innerHTML = `
      <h2>Settings</h2>
      <div id="disk-info"></div>
      <form id="settings-form">
        <div class="field">
          <label>Download Folder:</label>
          <input type="text" name="downloadFolder" id="download-folder">
        </div>
        <div class="field">
          <label><input type="checkbox" name="autoUpdate"> Auto Update</label>
        </div>
        <div class="field">
          <label><input type="checkbox" name="enableNotifications"> Enable Notifications</label>
        </div>
        <div class="field">
          <label>Theme:</label>
          <select name="theme">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div class="field">
          <label>Language:</label>
          <select name="language">
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>
        <button type="submit">Save Settings</button>
      </form>
    `;
        root.appendChild(this.container);
        this.diskInfo = this.container.querySelector('#disk-info');
        this.form = this.container.querySelector('#settings-form');
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(this.form);
            const prefs = {
                downloadFolder: formData.get('downloadFolder'),
                autoUpdate: formData.get('autoUpdate') === 'on',
                enableNotifications: formData.get('enableNotifications') === 'on',
                theme: formData.get('theme'),
                language: formData.get('language')
            };
            this.onSave(prefs);
        });
    }
    displayDiskUsage(usage) {
        this.diskInfo.innerHTML = `
      <p>Disk Usage: ${(usage.usedBytes / 1024 / 1024).toFixed(2)} MB used / ${(usage.availableBytes / 1024 / 1024).toFixed(2)} MB available</p>
    `;
    }
    displayPreferences(prefs) {
        const form = this.form;
        form.querySelector('#download-folder').value = prefs.downloadFolder;
        form.querySelector('[name="autoUpdate"]').checked = prefs.autoUpdate;
        form.querySelector('[name="enableNotifications"]').checked = prefs.enableNotifications;
        form.querySelector('[name="theme"]').value = prefs.theme;
        form.querySelector('[name="language"]').value = prefs.language;
    }
    show() {
        this.container.classList.remove('hidden');
    }
    hide() {
        this.container.classList.add('hidden');
    }
    // Event handler
    onSave = () => { };
}
//# sourceMappingURL=SettingsView.js.map