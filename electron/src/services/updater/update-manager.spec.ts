import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type Mock,
  type Mocked,
} from 'vitest';
import { BrowserWindow, app } from 'electron';
import { UpdateManager } from './update-manager.js';
import electronUpdater from 'electron-updater';
import { UpdateStatus } from '../../interfaces/update.interface.js';
import * as fs from 'node:fs';
import { BackupService } from '../backup/backup.service.js';

vi.mock('electron');
vi.mock('electron-updater', () => ({
  default: {
    autoUpdater: {
      checkForUpdates: vi.fn(),
      downloadUpdate: vi.fn(),
      quitAndInstall: vi.fn(),
      on: vi.fn(),
      removeAllListeners: vi.fn(),
      setFeedURL: vi.fn(),
      logger: null,
      autoDownload: false,
      autoInstallOnAppQuit: false,
      allowPrerelease: false,
    },
  },
}));
vi.mock('node:fs');
const createBackupMock = vi.hoisted(() => vi.fn());

vi.mock('../backup/backup.service.js', () => ({
  BackupService: class BackupServiceMock {
    createBackup = createBackupMock;
  },
}));

const { autoUpdater } = electronUpdater;

describe('UpdateManager', () => {
  let updateManager: UpdateManager;
  let mockWindow: Mocked<BrowserWindow>;
  let mockBackupService: Mocked<BackupService>;

  const mockUpdateInfo = {
    version: '2.0.0',
    releaseDate: '2026-02-01',
    releaseName: 'Version 2.0.0',
    releaseNotes: 'New features',
  };

  beforeEach(() => {
    /* Clear only call history, not implementations. */
    (autoUpdater.on as Mock).mockClear();
    (autoUpdater.checkForUpdates as Mock).mockClear();
    (autoUpdater.downloadUpdate as Mock).mockClear();
    (autoUpdater.quitAndInstall as Mock).mockClear();

    /* Reset singleton instance before each test. */
    (
      UpdateManager as unknown as Record<string, UpdateManager | undefined>
    ).instance = undefined;

    mockWindow = {
      webContents: {
        send: vi.fn(),
      },
      isDestroyed: vi.fn().mockReturnValue(false),
    } as unknown as Mocked<BrowserWindow>;

    createBackupMock.mockReset();
    createBackupMock.mockResolvedValue({
      success: true,
      backup: { filename: 'backup.db' },
    });

    mockBackupService = {
      createBackup: createBackupMock,
    } as unknown as Mocked<BackupService>;

    (app.getPath as Mock).mockReturnValue('/test/path');
    (app.getVersion as Mock).mockReturnValue('1.0.0');
    (app.isPackaged as unknown) = false;

    (fs.existsSync as Mock).mockReturnValue(false);
    (fs.readFileSync as Mock).mockReturnValue('{}');
    (fs.writeFileSync as Mock).mockReturnValue(undefined);

    (autoUpdater.on as Mock).mockReturnValue(autoUpdater);
    (autoUpdater.checkForUpdates as Mock).mockResolvedValue({});
    (autoUpdater.downloadUpdate as Mock).mockResolvedValue([]);
    (autoUpdater.quitAndInstall as Mock).mockReturnValue(undefined);

    /* AutoUpdater logger setter. */
    Object.defineProperty(autoUpdater, 'logger', {
      set: vi.fn(),
      get: vi.fn(),
    });
  });

  afterEach(() => {
    /* Reset singleton instance after each test. */
    (
      UpdateManager as unknown as Record<string, UpdateManager | undefined>
    ).instance = undefined;
    vi.restoreAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = UpdateManager.getInstance();
      const instance2 = UpdateManager.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should setup auto updater on first instantiation', () => {
      UpdateManager.getInstance();

      expect(autoUpdater.on).toHaveBeenCalledWith(
        'checking-for-update',
        expect.any(Function),
      );
      expect(autoUpdater.on).toHaveBeenCalledWith(
        'update-available',
        expect.any(Function),
      );
      expect(autoUpdater.on).toHaveBeenCalledWith(
        'update-not-available',
        expect.any(Function),
      );
      expect(autoUpdater.on).toHaveBeenCalledWith(
        'download-progress',
        expect.any(Function),
      );
      expect(autoUpdater.on).toHaveBeenCalledWith(
        'update-downloaded',
        expect.any(Function),
      );
      expect(autoUpdater.on).toHaveBeenCalledWith(
        'error',
        expect.any(Function),
      );
    });
  });

  describe('initialization', () => {
    it('should load settings from file if exists', () => {
      (fs.existsSync as Mock).mockReturnValue(true);
      (fs.readFileSync as Mock).mockReturnValue(
        JSON.stringify({
          autoCheckEnabled: false,
          checkOnStartup: false,
          autoDownload: true,
        }),
      );

      const manager = UpdateManager.getInstance();
      const settings = manager.getSettings();

      expect(settings.autoCheckEnabled).toBe(false);
    });

    it('should use default settings if file does not exist', () => {
      (fs.existsSync as Mock).mockReturnValue(false);

      const manager = UpdateManager.getInstance();
      const settings = manager.getSettings();

      expect(settings.autoCheckEnabled).toBe(true);
    });

    it('should handle settings load error gracefully', () => {
      (fs.existsSync as Mock).mockReturnValue(true);
      (fs.readFileSync as Mock).mockImplementation(() => {
        throw new Error('Read error');
      });

      const manager = UpdateManager.getInstance();
      const settings = manager.getSettings();

      // Should fallback to defaults
      expect(settings.autoCheckEnabled).toBe(true);
    });
  });

  describe('setMainWindow', () => {
    it('should set main window reference', () => {
      updateManager = UpdateManager.getInstance();
      updateManager.setMainWindow(mockWindow);

      // Verify window is set by triggering an event
      const checkingHandler = (autoUpdater.on as Mock).mock.calls.find(
        (call) => call[0] === 'checking-for-update',
      )?.[1];

      if (checkingHandler) {
        checkingHandler();
        expect(mockWindow.webContents.send).toHaveBeenCalledWith(
          'update:checking',
          undefined,
        );
      }
    });
  });

  describe('initialize', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should initialize update manager', async () => {
      updateManager = UpdateManager.getInstance();

      await updateManager.initialize();

      expect(updateManager).toBeDefined();
    });

    it('should check for updates on startup if enabled', async () => {
      (fs.existsSync as Mock).mockReturnValue(true);
      (fs.readFileSync as Mock).mockReturnValue(
        JSON.stringify({
          autoCheckEnabled: true,
          checkOnStartup: true,
        }),
      );
      (app.isPackaged as unknown) = true;

      updateManager = UpdateManager.getInstance();
      const checkSpy = vi
        .spyOn(updateManager, 'checkForUpdates')
        .mockResolvedValue();

      await updateManager.initialize();
      vi.advanceTimersByTime(5000);

      await vi.runAllTimersAsync();

      expect(checkSpy).toHaveBeenCalled();
    });

    it('should not check for updates if auto-check disabled', async () => {
      (fs.existsSync as Mock).mockReturnValue(true);
      (fs.readFileSync as Mock).mockReturnValue(
        JSON.stringify({
          autoCheckEnabled: false,
          checkOnStartup: false,
        }),
      );

      updateManager = UpdateManager.getInstance();
      const checkSpy = vi
        .spyOn(updateManager, 'checkForUpdates')
        .mockResolvedValue();

      await updateManager.initialize();
      vi.advanceTimersByTime(5000);

      expect(checkSpy).not.toHaveBeenCalled();
    });
  });

  describe('checkForUpdates', () => {
    beforeEach(() => {
      updateManager = UpdateManager.getInstance();
    });

    it('should skip check in development mode', async () => {
      (app.isPackaged as unknown) = false;
      updateManager.setMainWindow(mockWindow);

      await updateManager.checkForUpdates();

      expect(autoUpdater.checkForUpdates).not.toHaveBeenCalled();
      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        'update:not-available',
        { version: '1.0.0' },
      );
    });

    it('should check for updates in production mode', async () => {
      (app.isPackaged as unknown) = true;
      (fs.existsSync as Mock).mockReturnValue(true);
      (fs.readFileSync as Mock).mockReturnValue(
        JSON.stringify({ autoCheckEnabled: true }),
      );

      await updateManager.checkForUpdates();

      expect(autoUpdater.checkForUpdates).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should allow manual check when auto-check is disabled', async () => {
      (app.isPackaged as unknown) = true;
      (fs.existsSync as Mock).mockReturnValue(true);
      (fs.readFileSync as Mock).mockReturnValue(
        JSON.stringify({ autoCheckEnabled: false }),
      );

      await updateManager.checkForUpdates();

      expect(autoUpdater.checkForUpdates).toHaveBeenCalled();
    });

    it('should not check if already checking', async () => {
      (app.isPackaged as unknown) = true;
      (fs.existsSync as Mock).mockReturnValue(true);
      (fs.readFileSync as Mock).mockReturnValue(
        JSON.stringify({ autoCheckEnabled: true }),
      );

      // Simulate checking state
      const checkingHandler = (autoUpdater.on as Mock).mock.calls.find(
        (call) => call[0] === 'checking-for-update',
      )?.[1];
      if (checkingHandler) {
        checkingHandler();
      }

      await updateManager.checkForUpdates();

      // Should only be called once from the event
      expect(autoUpdater.checkForUpdates).not.toHaveBeenCalled();
    });

    it('should handle check error', async () => {
      (app.isPackaged as unknown) = true;
      (fs.existsSync as Mock).mockReturnValue(true);
      (fs.readFileSync as Mock).mockReturnValue(
        JSON.stringify({ autoCheckEnabled: true }),
      );
      const error = new Error('Network error');
      (autoUpdater.checkForUpdates as Mock).mockRejectedValue(error);

      await expect(updateManager.checkForUpdates()).rejects.toThrow(
        'Network error',
      );
    });
  });

  describe('downloadUpdate', () => {
    beforeEach(() => {
      updateManager = UpdateManager.getInstance();
    });

    it('should throw error in development mode', async () => {
      (app.isPackaged as unknown) = false;

      await expect(updateManager.downloadUpdate()).rejects.toThrow(
        'Updates not available in development mode',
      );
    });

    it('should throw error if no update available', async () => {
      (app.isPackaged as unknown) = true;

      await expect(updateManager.downloadUpdate()).rejects.toThrow(
        'No update available to download',
      );
    });

    it('should download update if available', async () => {
      (app.isPackaged as unknown) = true;

      // Trigger update available event
      const availableHandler = (autoUpdater.on as Mock).mock.calls.find(
        (call) => call[0] === 'update-available',
      )?.[1];

      if (availableHandler) {
        availableHandler(mockUpdateInfo);
      }

      await updateManager.downloadUpdate();

      expect(autoUpdater.downloadUpdate).toHaveBeenCalled();
    });

    it('should handle download error', async () => {
      (app.isPackaged as unknown) = true;

      // Trigger update available event
      const availableHandler = (autoUpdater.on as Mock).mock.calls.find(
        (call) => call[0] === 'update-available',
      )?.[1];

      if (availableHandler) {
        availableHandler(mockUpdateInfo);
      }

      const error = new Error('Download failed');
      (autoUpdater.downloadUpdate as Mock).mockRejectedValue(error);

      await expect(updateManager.downloadUpdate()).rejects.toThrow(
        'Download failed',
      );
    });
  });

  describe('quitAndInstall', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      updateManager = UpdateManager.getInstance();
      updateManager.setMainWindow(mockWindow);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should do nothing in development mode', async () => {
      (app.isPackaged as unknown) = false;

      await updateManager.quitAndInstall();

      expect(autoUpdater.quitAndInstall).not.toHaveBeenCalled();
    });

    it('should not install if update not downloaded', async () => {
      (app.isPackaged as unknown) = true;

      await updateManager.quitAndInstall();

      expect(autoUpdater.quitAndInstall).not.toHaveBeenCalled();
    });

    it('should create backup and install update', async () => {
      (app.isPackaged as unknown) = true;

      // Trigger update downloaded event
      const downloadedHandler = (autoUpdater.on as Mock).mock.calls.find(
        (call) => call[0] === 'update-downloaded',
      )?.[1];

      if (downloadedHandler) {
        downloadedHandler(mockUpdateInfo);
      }

      const installPromise = updateManager.quitAndInstall();
      await installPromise;

      vi.advanceTimersByTime(1000);

      expect(mockBackupService.createBackup).toHaveBeenCalledWith(
        'before-restore',
      );
      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        'update:installing',
        undefined,
      );
      expect(autoUpdater.quitAndInstall).toHaveBeenCalledWith(false, true);
    });

    it('should continue install even if backup fails', async () => {
      (app.isPackaged as unknown) = true;
      mockBackupService.createBackup.mockResolvedValue({
        success: false,
        error: 'Backup error',
      });

      // Trigger update downloaded event
      const downloadedHandler = (autoUpdater.on as Mock).mock.calls.find(
        (call) => call[0] === 'update-downloaded',
      )?.[1];

      if (downloadedHandler) {
        downloadedHandler(mockUpdateInfo);
      }

      const installPromise = updateManager.quitAndInstall();
      await installPromise;

      vi.advanceTimersByTime(1000);

      expect(autoUpdater.quitAndInstall).toHaveBeenCalled();
    });

    it('should continue install even if backup throws', async () => {
      (app.isPackaged as unknown) = true;
      mockBackupService.createBackup.mockRejectedValue(
        new Error('Backup error'),
      );

      // Trigger update downloaded event
      const downloadedHandler = (autoUpdater.on as Mock).mock.calls.find(
        (call) => call[0] === 'update-downloaded',
      )?.[1];

      if (downloadedHandler) {
        downloadedHandler(mockUpdateInfo);
      }

      const installPromise = updateManager.quitAndInstall();
      await installPromise;

      vi.advanceTimersByTime(1000);

      expect(autoUpdater.quitAndInstall).toHaveBeenCalled();
    });
  });

  describe('event handlers', () => {
    beforeEach(() => {
      updateManager = UpdateManager.getInstance();
      updateManager.setMainWindow(mockWindow);
    });

    it('should handle checking-for-update event', () => {
      const handler = (autoUpdater.on as Mock).mock.calls.find(
        (call) => call[0] === 'checking-for-update',
      )?.[1];

      handler();

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        'update:checking',
        undefined,
      );
      expect(updateManager.getStatus()).toBe(UpdateStatus.Checking);
    });

    it('should handle update-available event', () => {
      const handler = (autoUpdater.on as Mock).mock.calls.find(
        (call) => call[0] === 'update-available',
      )?.[1];

      handler(mockUpdateInfo);

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        'update:available',
        expect.objectContaining({ version: '2.0.0' }),
      );
      expect(updateManager.getStatus()).toBe(UpdateStatus.Available);
    });

    it('should handle update-not-available event', () => {
      const handler = (autoUpdater.on as Mock).mock.calls.find(
        (call) => call[0] === 'update-not-available',
      )?.[1];

      handler({ version: '1.0.0' });

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        'update:not-available',
        { version: '1.0.0' },
      );
      expect(updateManager.getStatus()).toBe(UpdateStatus.NotAvailable);
    });

    it('should handle download-progress event', () => {
      const handler = (autoUpdater.on as Mock).mock.calls.find(
        (call) => call[0] === 'download-progress',
      )?.[1];

      const progress = {
        bytesPerSecond: 1024000,
        percent: 45.67,
        transferred: 5000000,
        total: 10000000,
      };

      handler(progress);

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        'update:download-progress',
        progress,
      );
      expect(updateManager.getStatus()).toBe(UpdateStatus.Downloading);
    });

    it('should handle update-downloaded event', () => {
      const handler = (autoUpdater.on as Mock).mock.calls.find(
        (call) => call[0] === 'update-downloaded',
      )?.[1];

      handler(mockUpdateInfo);

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        'update:downloaded',
        expect.objectContaining({ version: '2.0.0' }),
      );
      expect(updateManager.getStatus()).toBe(UpdateStatus.Downloaded);
    });

    it('should handle error event', () => {
      const handler = (autoUpdater.on as Mock).mock.calls.find(
        (call) => call[0] === 'error',
      )?.[1];

      const error = new Error('Update error');
      handler(error);

      expect(mockWindow.webContents.send).toHaveBeenCalledWith('update:error', {
        message: 'Update error',
      });
      expect(updateManager.getStatus()).toBe(UpdateStatus.Error);
    });

    it('should not send events if window is destroyed', () => {
      mockWindow.isDestroyed.mockReturnValue(true);

      const handler = (autoUpdater.on as Mock).mock.calls.find(
        (call) => call[0] === 'checking-for-update',
      )?.[1];

      handler();

      expect(mockWindow.webContents.send).not.toHaveBeenCalled();
    });
  });

  describe('settings management', () => {
    beforeEach(() => {
      updateManager = UpdateManager.getInstance();
    });

    it('should get settings with last check date', () => {
      (fs.existsSync as Mock).mockReturnValue(true);
      (fs.readFileSync as Mock).mockReturnValue(
        JSON.stringify({
          autoCheckEnabled: true,
          lastCheckDate: '2026-02-01T00:00:00.000Z',
        }),
      );

      const settings = updateManager.getSettings();

      expect(settings.autoCheckEnabled).toBe(true);
      expect(settings.lastCheckDate).toBeInstanceOf(Date);
    });

    it('should set settings', async () => {
      await updateManager.setSettings({ autoCheckEnabled: false });

      expect(fs.writeFileSync).toHaveBeenCalled();
      const settings = updateManager.getSettings();
      expect(settings.autoCheckEnabled).toBe(false);
    });

    it('should handle save settings error', async () => {
      (fs.writeFileSync as Mock).mockImplementation(() => {
        throw new Error('Write error');
      });

      await expect(
        updateManager.setSettings({ autoCheckEnabled: false }),
      ).resolves.not.toThrow();
    });
  });

  describe('getStatus and getUpdateInfo', () => {
    beforeEach(() => {
      updateManager = UpdateManager.getInstance();
    });

    it('should return current status', () => {
      expect(updateManager.getStatus()).toBe(UpdateStatus.Idle);
    });

    it('should return update info when available', () => {
      const handler = (autoUpdater.on as Mock).mock.calls.find(
        (call) => call[0] === 'update-available',
      )?.[1];

      handler(mockUpdateInfo);

      const info = updateManager.getUpdateInfo();
      expect(info).toEqual(
        expect.objectContaining({
          version: '2.0.0',
        }),
      );
    });

    it('should return null if no update info', () => {
      expect(updateManager.getUpdateInfo()).toBeNull();
    });
  });
});
