import { Injectable, signal } from '@angular/core';
import {
  UpdateInfo,
  UpdateSettings,
  DownloadProgress,
  UpdateResult,
} from '../../../types/electron';
import { BaseDatabaseService } from '../database/base-database.service';

/**
 * Service for managing application updates.
 * Provides functionality for checking, downloading, and installing updates from GitHub Releases.
 */
@Injectable({
  providedIn: 'root',
})
export class UpdateService extends BaseDatabaseService {
  /**
   * Signal indicating if an update is available.
   */
  readonly updateAvailable = signal<UpdateInfo | null>(null);

  /**
   * Signal tracking download progress percentage (0-100).
   */
  readonly downloadProgress = signal<number>(0);

  /**
   * Signal indicating if the app is currently checking for updates.
   */
  readonly isChecking = signal<boolean>(false);

  /**
   * Signal indicating if an update is currently being downloaded.
   */
  readonly isDownloading = signal<boolean>(false);

  /**
   * Signal indicating if an update has been downloaded and is ready to install.
   */
  readonly updateDownloaded = signal<boolean>(false);

  /**
   * Signal holding current update settings.
   */
  readonly settings = signal<UpdateSettings>({ autoCheckEnabled: true });

  /**
   * Signal holding any update error message.
   */
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    super();
    this.setupListeners();
  }

  /**
   * Initializes the service by loading update settings.
   */
  async init(): Promise<void> {
    await this.loadSettings();
  }

  /**
   * Sets up event listeners for update events from main process.
   */
  private setupListeners(): void {
    // Check if electronAPI exists (not available in tests)
    if (!globalThis.window?.electronAPI) {
      return;
    }

    const api = globalThis.window.electronAPI;

    if (api.onUpdateChecking) {
      api.onUpdateChecking(() => {
        this.isChecking.set(true);
        this.errorMessage.set(null);
        console.log('[UpdateService] Checking for updates...');
      });
    }

    if (api.onUpdateAvailable) {
      api.onUpdateAvailable((info: UpdateInfo) => {
        this.isChecking.set(false);
        this.updateAvailable.set(info);
        console.log('[UpdateService] Update available:', info.version);
      });
    }

    if (api.onUpdateNotAvailable) {
      api.onUpdateNotAvailable((info: { version: string }) => {
        this.isChecking.set(false);
        this.updateAvailable.set(null);
        console.log(
          '[UpdateService] No updates available. Current version:',
          info.version,
        );
      });
    }

    if (api.onDownloadProgress) {
      api.onDownloadProgress((progress: DownloadProgress) => {
        this.isDownloading.set(true);
        this.downloadProgress.set(Math.round(progress.percent));
        console.log(
          `[UpdateService] Download progress: ${progress.percent.toFixed(2)}%`,
        );
      });
    }

    if (api.onUpdateDownloaded) {
      api.onUpdateDownloaded((info: UpdateInfo) => {
        this.isDownloading.set(false);
        this.updateDownloaded.set(true);
        this.downloadProgress.set(100);
        console.log('[UpdateService] Update downloaded:', info.version);
      });
    }

    if (api.onUpdateError) {
      api.onUpdateError((error: { message: string }) => {
        this.isChecking.set(false);
        this.isDownloading.set(false);
        this.errorMessage.set(error.message);
        console.error('[UpdateService] Update error:', error.message);
      });
    }
  }

  /**
   * Loads current update settings from main process.
   */
  private async loadSettings(): Promise<void> {
    if (!globalThis.window?.electronAPI?.getUpdateSettings) {
      return;
    }

    try {
      const result = await globalThis.window.electronAPI.getUpdateSettings();
      if (result.success && result.settings) {
        this.settings.set(result.settings);
      }
    } catch (error) {
      console.error('[UpdateService] Failed to load settings:', error);
    }
  }

  /**
   * Manually checks for available updates.
   */
  async checkForUpdates(): Promise<void> {
    if (!globalThis.window?.electronAPI?.checkForUpdates) {
      throw new Error('Update API not available');
    }

    return this.executeWithErrorHandling('check for updates', async () => {
      const result: UpdateResult =
        await globalThis.window.electronAPI.checkForUpdates();
      if (!result.success && result.error) {
        this.errorMessage.set(result.error);
        throw new Error(result.error);
      }
    });
  }

  /**
   * Downloads the available update.
   */
  async downloadUpdate(): Promise<void> {
    if (!globalThis.window?.electronAPI?.downloadUpdate) {
      throw new Error('Update API not available');
    }

    return this.executeWithErrorHandling('download update', async () => {
      const result: UpdateResult =
        await globalThis.window.electronAPI.downloadUpdate();
      if (!result.success && result.error) {
        this.errorMessage.set(result.error);
        throw new Error(result.error);
      }
    });
  }

  /**
   * Installs the downloaded update and restarts the application.
   */
  async installUpdate(): Promise<void> {
    if (!globalThis.window?.electronAPI?.installUpdate) {
      throw new Error('Update API not available');
    }

    return this.executeWithErrorHandling('install update', async () => {
      const result: UpdateResult =
        await globalThis.window.electronAPI.installUpdate();
      if (!result.success && result.error) {
        this.errorMessage.set(result.error);
        throw new Error(result.error);
      }
    });
  }

  /**
   * Gets current update settings.
   */
  async getSettings(): Promise<UpdateSettings> {
    if (!globalThis.window?.electronAPI?.getUpdateSettings) {
      throw new Error('Update API not available');
    }

    return this.executeWithErrorHandling('get update settings', async () => {
      const result: UpdateResult =
        await globalThis.window.electronAPI.getUpdateSettings();
      if (result.success && result.settings) {
        this.settings.set(result.settings);
        return result.settings;
      }
      throw new Error(result.error || 'Failed to get settings');
    });
  }

  /**
   * Updates the auto-check setting.
   */
  async setAutoCheck(enabled: boolean): Promise<void> {
    if (!globalThis.window?.electronAPI?.setUpdateSettings) {
      throw new Error('Update API not available');
    }

    return this.executeWithErrorHandling('set auto-check setting', async () => {
      const result: UpdateResult =
        await globalThis.window.electronAPI.setUpdateSettings({
          autoCheckEnabled: enabled,
        });
      if (result.success) {
        this.settings.update((s) => ({ ...s, autoCheckEnabled: enabled }));
      } else {
        throw new Error(result.error || 'Failed to update settings');
      }
    });
  }

  /**
   * Gets current update status.
   */
  async getStatus(): Promise<UpdateResult> {
    if (!globalThis.window?.electronAPI?.getUpdateStatus) {
      throw new Error('Update API not available');
    }

    return this.executeWithErrorHandling('get update status', async () => {
      return globalThis.window.electronAPI.getUpdateStatus();
    });
  }

  /**
   * Resets all update state signals.
   */
  resetState(): void {
    this.updateAvailable.set(null);
    this.downloadProgress.set(0);
    this.isChecking.set(false);
    this.isDownloading.set(false);
    this.updateDownloaded.set(false);
    this.errorMessage.set(null);
  }
}
