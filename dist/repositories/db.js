import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync.js';
import * as path from 'path';
import { app } from 'electron';
// Define the path to the JSON database file
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'db.json');
// Setup adapter and lowdb instance
const adapter = new FileSync(dbPath);
export const db = low(adapter);
export function initDb() {
    // Ensure default structure if the JSON file is empty or missing
    db.defaults({
        applications: [],
        downloaded_apps: [],
        preferences: {
            downloadFolder: path.join(app.getPath('downloads'), 'ElectronApps'),
            autoUpdate: true,
            enableNotifications: true,
            theme: 'dark',
            language: 'fr',
            maxParallelDownloads: 3,
            enableCompressionTransfer: true
        }
    }).write();
    console.log(`Database initialized at: ${dbPath}`);
}
//# sourceMappingURL=db.js.map