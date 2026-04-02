import { db } from './db';
import { Application, DownloadedApp, UserPreferences } from '../models/types';
import { IApplicationRepository, IDownloadedAppRepository, IPreferencesRepository } from './interfaces';

export class SQLiteApplicationRepository implements IApplicationRepository {
  save(app: Application): void {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO applications (
        id, name, version, description, category, author, downloadUrl,
        fileSize, checksum, signature, publicKey, thumbnailUrl,
        releaseDate, downloadCount, rating, tags
      ) VALUES (
        @id, @name, @version, @description, @category, @author, @downloadUrl,
        @fileSize, @checksum, @signature, @publicKey, @thumbnailUrl,
        @releaseDate, @downloadCount, @rating, @tags
      )
    `);
    stmt.run({
      ...app,
      tags: JSON.stringify(app.tags)
    });
  }

  findById(id: string): Application | null {
    const row = db.prepare('SELECT * FROM applications WHERE id = ?').get(id) as any;
    if (!row) return null;
    return {
      ...row,
      tags: JSON.parse(row.tags || '[]')
    };
  }

  findAll(): Application[] {
    const rows = db.prepare('SELECT * FROM applications').all() as any[];
    return rows.map(row => ({
      ...row,
      tags: JSON.parse(row.tags || '[]')
    }));
  }

  delete(id: string): void {
    db.prepare('DELETE FROM applications WHERE id = ?').run(id);
  }

  update(app: Application): void {
    this.save(app);
  }
}

export class SQLiteDownloadedAppRepository implements IDownloadedAppRepository {
  save(app: DownloadedApp): void {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO downloaded_apps (
        id, appId, name, version, filePath, fileSize,
        downloadedAt, status, checksum, isRunning, lastLaunchedAt
      ) VALUES (
        @id, @appId, @name, @version, @filePath, @fileSize,
        @downloadedAt, @status, @checksum, @isRunning, @lastLaunchedAt
      )
    `);
    stmt.run({
      ...app,
      isRunning: app.isRunning ? 1 : 0
    });
  }

  findById(id: string): DownloadedApp | null {
    const row = db.prepare('SELECT * FROM downloaded_apps WHERE id = ?').get(id) as any;
    if (!row) return null;
    return {
      ...row,
      isRunning: !!row.isRunning
    };
  }

  findAll(): DownloadedApp[] {
    const rows = db.prepare('SELECT * FROM downloaded_apps').all() as any[];
    return rows.map(row => ({
      ...row,
      isRunning: !!row.isRunning
    }));
  }

  delete(id: string): void {
    db.prepare('DELETE FROM downloaded_apps WHERE id = ?').run(id);
  }

  update(app: DownloadedApp): void {
    this.save(app);
  }
}

export class SQLitePreferencesRepository implements IPreferencesRepository {
  save(prefs: UserPreferences): void {
    const stmt = db.prepare(`
      UPDATE preferences SET
        downloadFolder = @downloadFolder,
        autoUpdate = @autoUpdate,
        enableNotifications = @enableNotifications,
        theme = @theme,
        language = @language,
        maxParallelDownloads = @maxParallelDownloads,
        enableCompressionTransfer = @enableCompressionTransfer
      WHERE id = 1
    `);
    stmt.run({
      ...prefs,
      autoUpdate: prefs.autoUpdate ? 1 : 0,
      enableNotifications: prefs.enableNotifications ? 1 : 0,
      enableCompressionTransfer: prefs.enableCompressionTransfer ? 1 : 0
    });
  }

  load(): UserPreferences {
    const row = db.prepare('SELECT * FROM preferences WHERE id = 1').get() as any;
    return {
      ...row,
      autoUpdate: !!row.autoUpdate,
      enableNotifications: !!row.enableNotifications,
      enableCompressionTransfer: !!row.enableCompressionTransfer
    };
  }
}
