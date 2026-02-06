import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  type Mock,
  type Mocked,
} from 'vitest';
import { app, ipcMain } from 'electron';
import { setupUpdateHandlers } from './update-handlers.js';
import { UpdateManager } from '../updater/update-manager.js';
import {
  UpdateSettings,
  UpdateStatus,
  UpdateInfo,
} from '../../interfaces/update.interface.js';

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
vi.mock('../updater/update-manager.js');

describe('Update IPC Handlers', () => {
  let mockUpdateManager: Mocked<UpdateManager>;
  let ipcHandlers: Map<string, Mock>;

  const mockUpdateSettings: UpdateSettings = {
    autoCheckEnabled: true,
  };

  const mockUpdateInfo: UpdateInfo = {
    version: '2.0.0',
    releaseName: 'Version 2.0.0',
    releaseNotes: 'New features',
    releaseDate: '2026-02-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    ipcHandlers = new Map();

    mockUpdateManager = {
      checkForUpdates: vi.fn().mockResolvedValue(undefined),
      downloadUpdate: vi.fn().mockResolvedValue(undefined),
      quitAndInstall: vi.fn(),
      getSettings: vi.fn().mockReturnValue(mockUpdateSettings),
      setSettings: vi.fn().mockResolvedValue(undefined),
      getStatus: vi.fn().mockReturnValue(UpdateStatus.Idle),
      getUpdateInfo: vi.fn().mockReturnValue(null),
    } as unknown as Mocked<UpdateManager>;

    (UpdateManager.getInstance as Mock).mockReturnValue(mockUpdateManager);

    (ipcMain.handle as Mock).mockImplementation(
      (channel: string, handler: Mock) => {
        ipcHandlers.set(channel, handler);
      },
    );
  });

  describe('setupUpdateHandlers', () => {
    it('should register all update IPC handlers', () => {
      setupUpdateHandlers();

      expect(ipcMain.handle).toHaveBeenCalledWith(
        'update:check',
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        'update:download',
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        'update:install',
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        'update:get-settings',
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        'update:set-settings',
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        'update:get-status',
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        'update:get-app-version',
        expect.any(Function),
      );
    });

    it('should initialize UpdateManager instance', () => {
      setupUpdateHandlers();

      expect(UpdateManager.getInstance).toHaveBeenCalled();
    });
  });

  describe('update:check handler', () => {
    it('should check for updates successfully', async () => {
      setupUpdateHandlers();
      const handler = ipcHandlers.get('update:check')!;

      const result = await handler();

      expect(mockUpdateManager.checkForUpdates).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should handle check for updates error', async () => {
      setupUpdateHandlers();
      const handler = ipcHandlers.get('update:check')!;
      const error = new Error('Network error');
      mockUpdateManager.checkForUpdates.mockRejectedValue(error);

      const result = await handler();

      expect(result).toEqual({
        success: false,
        error: 'Network error',
      });
    });

    it('should handle non-Error objects', async () => {
      setupUpdateHandlers();
      const handler = ipcHandlers.get('update:check')!;
      mockUpdateManager.checkForUpdates.mockRejectedValue('String error');

      const result = await handler();

      expect(result).toEqual({
        success: false,
        error: 'Unknown error',
      });
    });
  });

  describe('update:download handler', () => {
    it('should download update successfully', async () => {
      setupUpdateHandlers();
      const handler = ipcHandlers.get('update:download')!;

      const result = await handler();

      expect(mockUpdateManager.downloadUpdate).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should handle download error', async () => {
      setupUpdateHandlers();
      const handler = ipcHandlers.get('update:download')!;
      const error = new Error('Download failed');
      mockUpdateManager.downloadUpdate.mockRejectedValue(error);

      const result = await handler();

      expect(result).toEqual({
        success: false,
        error: 'Download failed',
      });
    });
  });

  describe('update:install handler', () => {
    it('should install update successfully', async () => {
      setupUpdateHandlers();
      const handler = ipcHandlers.get('update:install')!;

      const result = await handler();

      expect(mockUpdateManager.quitAndInstall).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should handle install error', async () => {
      setupUpdateHandlers();
      const handler = ipcHandlers.get('update:install')!;
      const error = new Error('Install failed');
      mockUpdateManager.quitAndInstall.mockImplementation(() => {
        throw error;
      });

      const result = await handler();

      expect(result).toEqual({
        success: false,
        error: 'Install failed',
      });
    });
  });

  describe('update:get-settings handler', () => {
    it('should get settings successfully', async () => {
      setupUpdateHandlers();
      const handler = ipcHandlers.get('update:get-settings')!;

      const result = await handler();

      expect(mockUpdateManager.getSettings).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        settings: mockUpdateSettings,
      });
    });

    it('should handle get settings error', async () => {
      setupUpdateHandlers();
      const handler = ipcHandlers.get('update:get-settings')!;
      const error = new Error('Settings error');
      mockUpdateManager.getSettings.mockImplementation(() => {
        throw error;
      });

      const result = await handler();

      expect(result).toEqual({
        success: false,
        error: 'Settings error',
      });
    });
  });

  describe('update:set-settings handler', () => {
    it('should set settings successfully', async () => {
      setupUpdateHandlers();
      const handler = ipcHandlers.get('update:set-settings')!;
      const newSettings: Partial<UpdateSettings> = {
        autoCheckEnabled: false,
      };

      const result = await handler({}, newSettings);

      expect(mockUpdateManager.setSettings).toHaveBeenCalledWith(newSettings);
      expect(result).toEqual({ success: true });
    });

    it('should handle set settings error', async () => {
      setupUpdateHandlers();
      const handler = ipcHandlers.get('update:set-settings')!;
      const error = new Error('Update failed');
      mockUpdateManager.setSettings.mockRejectedValue(error);

      const result = await handler({}, {});

      expect(result).toEqual({
        success: false,
        error: 'Update failed',
      });
    });
  });

  describe('update:get-status handler', () => {
    it('should get status successfully', async () => {
      setupUpdateHandlers();
      const handler = ipcHandlers.get('update:get-status')!;
      mockUpdateManager.getStatus.mockReturnValue(UpdateStatus.Checking);
      mockUpdateManager.getUpdateInfo.mockReturnValue(mockUpdateInfo);

      const result = await handler();

      expect(mockUpdateManager.getStatus).toHaveBeenCalled();
      expect(mockUpdateManager.getUpdateInfo).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        status: UpdateStatus.Checking,
        updateInfo: mockUpdateInfo,
      });
    });

    it('should get status with null updateInfo', async () => {
      setupUpdateHandlers();
      const handler = ipcHandlers.get('update:get-status')!;
      mockUpdateManager.getStatus.mockReturnValue(UpdateStatus.Idle);
      mockUpdateManager.getUpdateInfo.mockReturnValue(null);

      const result = await handler();

      expect(result).toEqual({
        success: true,
        status: UpdateStatus.Idle,
        updateInfo: null,
      });
    });

    it('should handle get status error', async () => {
      setupUpdateHandlers();
      const handler = ipcHandlers.get('update:get-status')!;
      const error = new Error('Status error');
      mockUpdateManager.getStatus.mockImplementation(() => {
        throw error;
      });

      const result = await handler();

      expect(result).toEqual({
        success: false,
        error: 'Status error',
      });
    });
  });

  describe('update:get-app-version handler', () => {
    it('should return app version successfully', async () => {
      setupUpdateHandlers();
      const handler = ipcHandlers.get('update:get-app-version')!;

      const result = await handler();

      expect(result).toEqual({ success: true, version: '1.0.0' });
    });

    it('should handle get version error', async () => {
      setupUpdateHandlers();
      const handler = ipcHandlers.get('update:get-app-version')!;
      (app.getVersion as Mock).mockImplementation(() => {
        throw new Error('Version error');
      });

      const result = await handler();

      expect(result).toEqual({ success: false, error: 'Version error' });
    });
  });
});
