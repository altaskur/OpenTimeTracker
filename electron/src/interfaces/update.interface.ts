/**
 * Information about an available update.
 */
export interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseName?: string;
  releaseNotes?: string;
  size?: number;
}

/**
 * Update download progress information.
 */
export interface DownloadProgress {
  bytesPerSecond: number;
  percent: number;
  transferred: number;
  total: number;
}

/**
 * Update settings and preferences.
 */
export interface UpdateSettings {
  autoCheckEnabled: boolean;
  lastCheckDate?: Date;
}

/**
 * Update status enum.
 */
export enum UpdateStatus {
  Idle = 'idle',
  Checking = 'checking',
  Available = 'available',
  NotAvailable = 'not-available',
  Downloading = 'downloading',
  Downloaded = 'downloaded',
  Error = 'error',
}

/**
 * Update error information.
 */
export interface UpdateError {
  message: string;
  code?: string;
}
