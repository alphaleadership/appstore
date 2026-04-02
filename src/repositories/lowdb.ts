import { db } from './db';
import { Application, DownloadedApp, UserPreferences } from '../models/types';
import { IApplicationRepository, IDownloadedAppRepository, IPreferencesRepository } from './interfaces';

export class LowdbApplicationRepository implements IApplicationRepository {
  save(app: Application): void {
    const existing = db.get('applications').find({ id: app.id }).value();
    if (existing) {
      db.get('applications').find({ id: app.id }).assign(app).write();
    } else {
      db.get('applications').push(app).write();
    }
  }

  findById(id: string): Application | null {
    const app = db.get('applications').find({ id }).value();
    return app || null;
  }

  findAll(): Application[] {
    return db.get('applications').value() || [];
  }

  delete(id: string): void {
    db.get('applications').remove({ id }).write();
  }

  update(app: Application): void {
    this.save(app);
  }
}

export class LowdbDownloadedAppRepository implements IDownloadedAppRepository {
  save(app: DownloadedApp): void {
    const existing = db.get('downloaded_apps').find({ id: app.id }).value();
    if (existing) {
      db.get('downloaded_apps').find({ id: app.id }).assign(app).write();
    } else {
      db.get('downloaded_apps').push(app).write();
    }
  }

  findById(id: string): DownloadedApp | null {
    const app = db.get('downloaded_apps').find({ id }).value();
    return app || null;
  }

  findAll(): DownloadedApp[] {
    return db.get('downloaded_apps').value() || [];
  }

  delete(id: string): void {
    db.get('downloaded_apps').remove({ id }).write();
  }

  update(app: DownloadedApp): void {
    this.save(app);
  }
}

export class LowdbPreferencesRepository implements IPreferencesRepository {
  save(prefs: UserPreferences): void {
    db.get('preferences').assign(prefs).write();
  }

  load(): UserPreferences {
    return db.get('preferences').value();
  }
}
