import { Application, DownloadedApp, UserPreferences } from '../models/types';

export interface IApplicationRepository {
  save(app: Application): void;
  findById(id: string): Application | null;
  findAll(): Application[];
  delete(id: string): void;
  update(app: Application): void;
}

export interface IDownloadedAppRepository {
  save(app: DownloadedApp): void;
  findById(id: string): DownloadedApp | null;
  findAll(): DownloadedApp[];
  delete(id: string): void;
  update(app: DownloadedApp): void;
}

export interface IPreferencesRepository {
  save(prefs: UserPreferences): void;
  load(): UserPreferences;
}
