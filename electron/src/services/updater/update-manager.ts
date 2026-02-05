import electronUpdater from 'electron-updater';
import { app, BrowserWindow } from 'electron';
import {
  UpdateInfo,
  UpdateSettings,
  UpdateStatus,
  UpdateError,
  DownloadProgress,
} from '../../interfaces/update.interface.js';

const { autoUpdater } = electronUpdater;
type ElectronUpdateInfo = electronUpdater.UpdateInfo;
import * as fs from 'node:fs';
import * as path from 'node:path';
import { BackupService } from '../backup/backup.service.js';

/**
 * Update manager configuration.
 */
export interface UpdateManagerConfig {
  autoCheckEnabled: boolean;
  checkOnStartup: boolean;
  autoDownload: boolean;
}

/**
 * Service for managing application updates using electron-updater.
 * Provides functionality for checking, downloading, and installing updates from GitHub Releases.
 */
export class UpdateManager {
  private static instance: UpdateManager;
  private mainWindow: BrowserWindow | null = null;
  private readonly config: UpdateManagerConfig;
  private currentStatus: UpdateStatus = UpdateStatus.Idle;
  private updateInfo: UpdateInfo | null = null;
  private readonly settingsPath: string;
  private backupService: BackupService | null = null;

  private constructor() {
    this.settingsPath = path.join(
      app.getPath('userData'),
      'update-settings.json',
    );
    this.config = this.loadSettings();
    this.setupAutoUpdater();
    this.attachEventHandlers();
  }

  /**
   * Gets the singleton instance of UpdateManager.
   */
  static getInstance(): UpdateManager {
    if (!UpdateManager.instance) {
      UpdateManager.instance = new UpdateManager();
    }
    return UpdateManager.instance;
  }

  /**
   * Sets the main window reference for sending IPC events.
   */
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  /**
   * Initializes the update manager.
   * Should be called after app is ready.
   */
  async initialize(): Promise<void> {
    console.log('[UpdateManager] Initialized');

    if (this.config.checkOnStartup && this.config.autoCheckEnabled) {
      // Delay initial check to allow app to fully load
      setTimeout(() => {
        this.checkForUpdates().catch((error) => {
          console.error('[UpdateManager] Initial check failed:', error);
        });
      }, 5000);
    }
  }

  /**
   * Configures electron-updater settings.
   */
  private setupAutoUpdater(): void {
    // Configure auto-updater
    autoUpdater.autoDownload = this.config.autoDownload;
    autoUpdater.autoInstallOnAppQuit = true;

    // Set logger for debugging
    autoUpdater.logger = {
      info: (msg: string) => console.log('[AutoUpdater]', msg),
      warn: (msg: string) => console.warn('[AutoUpdater]', msg),
      error: (msg: string) => console.error('[AutoUpdater]', msg),
      debug: (msg: string) => console.debug('[AutoUpdater]', msg),
    };

    // In development, use generic versioning server for testing
    if (!app.isPackaged) {
      console.log('[UpdateManager] Running in development mode');
      // Updates won't work in dev mode without mock server
      autoUpdater.forceDevUpdateConfig = true;
    }
  }

  /**
   * Attaches event handlers to autoUpdater events.
   */
  private attachEventHandlers(): void {
    autoUpdater.on('checking-for-update', () => {
      console.log('[UpdateManager] Checking for updates...');
      this.currentStatus = UpdateStatus.Checking;
      this.sendToRenderer('update:checking');
    });

    autoUpdater.on('update-available', (info: ElectronUpdateInfo) => {
      console.log('[UpdateManager] Update available:', info.version);
      this.currentStatus = UpdateStatus.Available;
      this.updateInfo = this.mapUpdateInfo(info);
      this.sendToRenderer('update:available', this.updateInfo);
    });

    autoUpdater.on('update-not-available', (info: ElectronUpdateInfo) => {
      console.log(
        '[UpdateManager] Update not available. Current version:',
        info.version,
      );
      this.currentStatus = UpdateStatus.NotAvailable;
      this.sendToRenderer('update:not-available', { version: info.version });
    });

    autoUpdater.on('download-progress', (progressObj) => {
      const progress: DownloadProgress = {
        bytesPerSecond: progressObj.bytesPerSecond,
        percent: progressObj.percent,
        transferred: progressObj.transferred,
        total: progressObj.total,
      };
      console.log(
        `[UpdateManager] Download progress: ${progress.percent.toFixed(2)}%`,
      );
      this.currentStatus = UpdateStatus.Downloading;
      this.sendToRenderer('update:download-progress', progress);
    });

    autoUpdater.on('update-downloaded', (info: ElectronUpdateInfo) => {
      console.log('[UpdateManager] Update downloaded:', info.version);
      this.currentStatus = UpdateStatus.Downloaded;
      this.updateInfo = this.mapUpdateInfo(info);
      this.sendToRenderer('update:downloaded', this.updateInfo);
    });

    autoUpdater.on('error', (error: Error) => {
      console.error('[UpdateManager] Error:', error);
      this.currentStatus = UpdateStatus.Error;
      const updateError: UpdateError = {
        message: error.message,
      };
      this.sendToRenderer('update:error', updateError);
    });
  }

  /**
   * Sends IPC event to renderer process.
   */
  private sendToRenderer(channel: string, data?: unknown): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  /**
   * Maps electron-updater UpdateInfo to our UpdateInfo interface.
   */
  private mapUpdateInfo(info: ElectronUpdateInfo): UpdateInfo {
    return {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseName: info.releaseName ?? undefined,
      releaseNotes: info.releaseNotes as string | undefined,
    };
  }

  /**
   * Checks for available updates.
   */
  async checkForUpdates(): Promise<void> {
    try {
      if (this.currentStatus === UpdateStatus.Checking) {
        console.log('[UpdateManager] Already checking for updates');
        return;
      }

      if (!this.config.autoCheckEnabled) {
        console.log('[UpdateManager] Auto-check is disabled');
        return;
      }

      // In development mode, skip actual update check
      if (!app.isPackaged) {
        console.log(
          '[UpdateManager] Skipping update check in development mode',
        );
        this.currentStatus = UpdateStatus.NotAvailable;
        this.sendToRenderer('update:not-available', {
          version: app.getVersion(),
        });
        return;
      }

      console.log('[UpdateManager] Checking for updates...');
      await autoUpdater.checkForUpdates();

      // Update last check date
      this.updateLastCheckDate();
    } catch (error) {
      console.error('[UpdateManager] Check for updates failed:', error);
      throw error;
    }
  }

  /**
   * Downloads the available update.
   */
  async downloadUpdate(): Promise<void> {
    try {
      if (!app.isPackaged) {
        console.log(
          '[UpdateManager] Download not available in development mode',
        );
        throw new Error('Updates not available in development mode');
      }

      if (this.currentStatus !== UpdateStatus.Available) {
        throw new Error('No update available to download');
      }

      console.log('[UpdateManager] Starting download...');
      await autoUpdater.downloadUpdate();
    } catch (error) {
      console.error('[UpdateManager] Download failed:', error);
      throw error;
    }
  }

  /**
   * Quits the application and installs the downloaded update.
   */
  async quitAndInstall(): Promise<void> {
    if (!app.isPackaged) {
      console.log('[UpdateManager] Install not available in development mode');
      return;
    }

    if (this.currentStatus !== UpdateStatus.Downloaded) {
      console.error('[UpdateManager] No update downloaded to install');
      return;
    }

    console.log('[UpdateManager] Creating backup before update...');

    // Create backup before installing update
    if (!this.backupService) {
      this.backupService = new BackupService();
    }

    try {
      const backupResult =
        await this.backupService.createBackup('before-restore');
      if (backupResult.success) {
        console.log(
          '[UpdateManager] Backup created successfully:',
          backupResult.backup?.filename,
        );
      } else {
        console.warn(
          '[UpdateManager] Backup failed, continuing with update:',
          backupResult.error,
        );
      }
    } catch (error) {
      console.warn(
        '[UpdateManager] Backup error, continuing with update:',
        error,
      );
    }

    console.log('[UpdateManager] Quitting and installing update...');

    // Notify renderer to allow cleanup
    this.sendToRenderer('update:installing');

    // Give renderer time to cleanup
    setTimeout(() => {
      autoUpdater.quitAndInstall(false, true);
    }, 1000);
  }

  /**
   * Gets current update settings.
   */
  getSettings(): UpdateSettings {
    return {
      autoCheckEnabled: this.config.autoCheckEnabled,
      lastCheckDate: this.loadLastCheckDate(),
    };
  }

  /**
   * Updates update settings.
   */
  async setSettings(settings: Partial<UpdateSettings>): Promise<void> {
    if (settings.autoCheckEnabled !== undefined) {
      this.config.autoCheckEnabled = settings.autoCheckEnabled;
    }

    this.saveSettings();
    console.log('[UpdateManager] Settings updated:', this.config);
  }

  /**
   * Gets current update status.
   */
  getStatus(): UpdateStatus {
    return this.currentStatus;
  }

  /**
   * Gets current update info if available.
   */
  getUpdateInfo(): UpdateInfo | null {
    return this.updateInfo;
  }

  /**
   * Loads settings from disk.
   */
  private loadSettings(): UpdateManagerConfig {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const data = fs.readFileSync(this.settingsPath, 'utf-8');
        const saved = JSON.parse(data);
        return {
          autoCheckEnabled: saved.autoCheckEnabled ?? true,
          checkOnStartup: saved.checkOnStartup ?? true,
          autoDownload: saved.autoDownload ?? false,
        };
      }
    } catch (error) {
      console.error('[UpdateManager] Failed to load settings:', error);
    }

    // Default settings
    return {
      autoCheckEnabled: true,
      checkOnStartup: true,
      autoDownload: false,
    };
  }

  /**
   * Saves settings to disk.
   */
  private saveSettings(): void {
    try {
      fs.writeFileSync(this.settingsPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('[UpdateManager] Failed to save settings:', error);
    }
  }

  /**
   * Loads last check date from settings.
   */
  private loadLastCheckDate(): Date | undefined {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const data = fs.readFileSync(this.settingsPath, 'utf-8');
        const saved = JSON.parse(data);
        return saved.lastCheckDate ? new Date(saved.lastCheckDate) : undefined;
      }
    } catch (error) {
      console.error('[UpdateManager] Failed to load last check date:', error);
    }
    return undefined;
  }

  /**
   * Updates last check date in settings.
   */
  private updateLastCheckDate(): void {
    try {
      const currentSettings = this.loadSettings();
      const updated = {
        ...currentSettings,
        lastCheckDate: new Date().toISOString(),
      };
      fs.writeFileSync(this.settingsPath, JSON.stringify(updated, null, 2));
    } catch (error) {
      console.error('[UpdateManager] Failed to update last check date:', error);
    }
  }
}
