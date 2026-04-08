import { db } from './db.js';
import { Application, DownloadedApp, UserPreferences } from '../models/types.js';
import { IApplicationRepository, IDownloadedAppRepository, IPreferencesRepository } from './interfaces.js';

export class LowdbApplicationRepository implements IApplicationRepository {
  save(app: Application): void {
    const existing = (db.get('applications') as any).find({ id: app.id }).value();
    if (existing) {
      (db.get('applications') as any).find({ id: app.id }).assign(app).write();
    } else {
      (db.get('applications') as any).push(app).write();
    }
  }

  findById(id: string): Application | null {
    const app = (db.get('applications') as any).find({ id }).value();
    return app || null;
  }

  findAll(): Application[] {
    return (db.get('applications') as any).value() || [];
  }

  delete(id: string): void {
    (db.get('applications') as any).remove({ id }).write();
  }

  update(app: Application): void {
    this.save(app);
  }
}

export class LowdbDownloadedAppRepository implements IDownloadedAppRepository {
  save(app: DownloadedApp): void {
    const existing = (db.get('downloaded_apps') as any).find({ id: app.id }).value();
    if (existing) {
      (db.get('downloaded_apps') as any).find({ id: app.id }).assign(app).write();
    } else {
      (db.get('downloaded_apps') as any).push(app).write();
    }
  }

  findById(id: string): DownloadedApp | null {
    const app = (db.get('downloaded_apps') as any).find({ id }).value();
    return app || null;
  }

  findAll(): DownloadedApp[] {
    return (db.get('downloaded_apps') as any).value() || [];
  }

  delete(id: string): void {
    (db.get('downloaded_apps') as any).remove({ id }).write();
  }

  update(app: DownloadedApp): void {
    this.save(app);
  }
}

export class LowdbPreferencesRepository implements IPreferencesRepository {
  save(prefs: UserPreferences): void {
    (db.get('preferences') as any).assign(prefs).write();
  }

  load(): UserPreferences {
    return (db.get('preferences') as any).value();
  }
}
