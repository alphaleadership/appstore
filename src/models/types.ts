export interface Application {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  author: string;
  downloadUrl: string;
  repository?: string;
  fileSize: number;
  checksum: string; // SHA-256
  signature: string;
  publicKey: string;
  thumbnailUrl: string;
  releaseDate: string;
  downloadCount: number;
  rating: number;
  tags: string[];
}

export type AppStatus = 'downloading' | 'paused' | 'completed' | 'error' | 'corrupted' | 'deleted';

export interface DownloadedApp {
  id: string;
  appId: string;
  name: string;
  version: string;
  filePath: string;
  fileSize: number;
  downloadedAt: string;
  status: AppStatus;
  checksum: string;
  isRunning: boolean;
  lastLaunchedAt?: string;
}

export interface UserPreferences {
  downloadFolder: string;
  autoUpdate: boolean;
  enableNotifications: boolean;
  theme: 'light' | 'dark';
  language: string;
  maxParallelDownloads: number;
  enableCompressionTransfer: boolean;
}

export interface FileMetadata {
  filename: string;
  fileSize: number;
  checksum: string;
  signature: string;
  publicKey: string;
  uploadedAt: string;
}

export interface DownloadProgress {
  appId: string;
  bytesDownloaded: number;
  totalBytes: number;
  percentComplete: number;
  downloadSpeed: number; // bytes/sec
  estimatedTimeRemaining: number; // seconds
  status: AppStatus;
}

export interface CatalogPage {
  applications: Application[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  hasMore: boolean;
}

export interface DiskUsage {
  usedBytes: number;
  availableBytes: number;
  totalBytes: number;
}

export interface UpdateInfo {
  version: string;
  releaseNotes: string;
  downloadUrl: string;
  checksum: string;
}

export interface ValidationResult {
  isValid: boolean;
  checksumMatch: boolean;
  signatureValid: boolean;
  errors: string[];
}

export interface DatabaseSchema {
  applications: Application[];
  downloaded_apps: DownloadedApp[];
  preferences: UserPreferences;
}
