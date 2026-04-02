import Database from 'better-sqlite3';
import * as path from 'path';
import { app } from 'electron';

const dbPath = path.join(app.getPath('userData'), 'appstore.db');

export const db = new Database(dbPath);

export function initDb() {
  db.pragma('journal_mode = WAL');

  // Table for cached catalog applications
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      description TEXT,
      category TEXT,
      author TEXT,
      downloadUrl TEXT NOT NULL,
      fileSize INTEGER,
      checksum TEXT,
      signature TEXT,
      publicKey TEXT,
      thumbnailUrl TEXT,
      releaseDate TEXT,
      downloadCount INTEGER,
      rating REAL,
      tags TEXT
    )
  `);

  // Table for downloaded applications
  db.exec(`
    CREATE TABLE IF NOT EXISTS downloaded_apps (
      id TEXT PRIMARY KEY,
      appId TEXT NOT NULL,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      filePath TEXT NOT NULL,
      fileSize INTEGER,
      downloadedAt TEXT NOT NULL,
      status TEXT NOT NULL,
      checksum TEXT,
      isRunning INTEGER DEFAULT 0,
      lastLaunchedAt TEXT,
      FOREIGN KEY (appId) REFERENCES applications (id)
    )
  `);

  // Table for user preferences (single row)
  db.exec(`
    CREATE TABLE IF NOT EXISTS preferences (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      downloadFolder TEXT,
      autoUpdate INTEGER DEFAULT 1,
      enableNotifications INTEGER DEFAULT 1,
      theme TEXT DEFAULT 'light',
      language TEXT DEFAULT 'en',
      maxParallelDownloads INTEGER DEFAULT 3,
      enableCompressionTransfer INTEGER DEFAULT 1
    )
  `);

  // Initialize default preferences if not exists
  const stmt = db.prepare('SELECT COUNT(*) as count FROM preferences WHERE id = 1');
  const result = stmt.get() as { count: number };
  if (result.count === 0) {
    db.prepare(`
      INSERT INTO preferences (id, downloadFolder)
      VALUES (1, ?)
    `).run(path.join(app.getPath('downloads'), 'ElectronApps'));
  }
}
