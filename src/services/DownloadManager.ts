import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { DownloadProgress, AppStatus } from '../models/types.js';
import { IntegrityChecker } from './IntegrityChecker.js';
import { StorageManager } from './StorageManager.js';

export class DownloadManager {
  private activeDownloads: Map<string, any> = new Map();
  private progressCallbacks: Set<(progress: DownloadProgress) => void> = new Set();
  private completeCallbacks: Set<(appId: string) => void> = new Set();
  private errorCallbacks: Set<(appId: string, error: Error) => void> = new Set();

  constructor(
    private storageManager: StorageManager,
    private integrityChecker: IntegrityChecker
  ) {}

  async startDownload(appId: string, url: string): Promise<void> {
    // Requirement 9.3: THE Gestionnaire_Téléchargement SHALL utiliser HTTPS for all downloads.
    if (url.startsWith('http://')) {
      throw new Error('Insecure download URL: HTTPS is required');
    }

    if (this.activeDownloads.has(appId)) return;
    if (this.activeDownloads.size >= 3) {
      throw new Error('Maximum parallel downloads reached');
    }

    const downloadFolder = this.storageManager.getDownloadFolder();
    if (!fs.existsSync(downloadFolder)) {
      fs.mkdirSync(downloadFolder, { recursive: true });
    }

    const fileName = path.basename(url);
    const filePath = path.join(downloadFolder, fileName);
    const partPath = filePath + '.part';

    let startByte = 0;
    if (fs.existsSync(partPath)) {
      startByte = fs.statSync(partPath).size;
    }

    const abortController = new AbortController();
    this.activeDownloads.set(appId, abortController);

    try {
      const response = await axios.get(url, {
        responseType: 'stream',
        signal: abortController.signal,
        headers: startByte > 0 ? { Range: `bytes=${startByte}-` } : {}
      });

      const totalBytes = parseInt(response.headers['content-length'] || '0') + startByte;
      const fileStream = fs.createWriteStream(partPath, { flags: startByte > 0 ? 'a' : 'w' });
      
      let downloadedBytes = startByte;
      let startTime = Date.now();
      let lastBytes = startByte;
      let lastTime = startTime;

      response.data.on('data', (chunk: any) => {
        downloadedBytes += chunk.length;
        fileStream.write(chunk);

        const now = Date.now();
        const elapsed = (now - lastTime) / 1000;
        if (elapsed >= 0.5) {
          const speed = (downloadedBytes - lastBytes) / elapsed;
          const remaining = totalBytes - downloadedBytes;
          const eta = speed > 0 ? remaining / speed : 0;

          this.notifyProgress({
            appId,
            bytesDownloaded: downloadedBytes,
            totalBytes,
            percentComplete: (downloadedBytes / totalBytes) * 100,
            downloadSpeed: speed,
            estimatedTimeRemaining: eta,
            status: 'downloading'
          });

          lastBytes = downloadedBytes;
          lastTime = now;
        }
      });

      response.data.on('end', async () => {
        fileStream.end();
        fs.renameSync(partPath, filePath);
        this.activeDownloads.delete(appId);
        
        // Finalize
        this.completeCallbacks.forEach(cb => cb(appId));
      });

      response.data.on('error', (err: any) => {
        fileStream.end();
        this.activeDownloads.delete(appId);
        this.errorCallbacks.forEach(cb => cb(appId, err));
      });

    } catch (error: any) {
      this.activeDownloads.delete(appId);
      if (axios.isCancel(error)) {
        console.log('Download canceled:', appId);
      } else {
        this.errorCallbacks.forEach(cb => cb(appId, error));
      }
    }
  }

  async cancelDownload(appId: string): Promise<void> {
    const controller = this.activeDownloads.get(appId);
    if (controller) {
      controller.abort();
      this.activeDownloads.delete(appId);
    }
  }

  onProgressUpdate(callback: (progress: DownloadProgress) => void): void {
    this.progressCallbacks.add(callback);
  }

  onDownloadComplete(callback: (appId: string) => void): void {
    this.completeCallbacks.add(callback);
  }

  onDownloadError(callback: (appId: string, error: Error) => void): void {
    this.errorCallbacks.add(callback);
  }

  private notifyProgress(progress: DownloadProgress): void {
    this.progressCallbacks.forEach(cb => cb(progress));
  }
}
