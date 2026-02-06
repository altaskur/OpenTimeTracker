import { TestBed } from '@angular/core/testing';
import { UpdateService } from './update.service';
import {
  UpdateInfo,
  UpdateSettings,
  DownloadProgress,
  UpdateResult,
} from '../../../types/electron';

interface MockElectronAPI {
  onUpdateChecking?: jasmine.Spy<(callback: () => void) => void>;
  onUpdateAvailable?: jasmine.Spy<
    (callback: (info: UpdateInfo) => void) => void
  >;
  onUpdateNotAvailable?: jasmine.Spy<
    (callback: (info: { version: string }) => void) => void
  >;
  onDownloadProgress?: jasmine.Spy<
    (callback: (progress: DownloadProgress) => void) => void
  >;
  onUpdateDownloaded?: jasmine.Spy<
    (callback: (info: UpdateInfo) => void) => void
  >;
  onUpdateError?: jasmine.Spy<
    (callback: (error: { message: string }) => void) => void
  >;
  checkForUpdates?: jasmine.Spy<() => Promise<UpdateResult>>;
  downloadUpdate?: jasmine.Spy<() => Promise<UpdateResult>>;
  installUpdate?: jasmine.Spy<() => Promise<UpdateResult>>;
  getUpdateSettings?: jasmine.Spy<() => Promise<UpdateResult>>;
  setUpdateSettings?: jasmine.Spy<
    (settings: UpdateSettings) => Promise<UpdateResult>
  >;
  getUpdateStatus?: jasmine.Spy<() => Promise<UpdateResult>>;
  getAppVersion?: jasmine.Spy<() => Promise<UpdateResult>>;
}

describe('UpdateService', () => {
  let service: UpdateService;
  let mockElectronAPI: MockElectronAPI;

  const mockUpdateInfo: UpdateInfo = {
    version: '2.0.0',
    releaseName: 'Version 2.0.0',
    releaseNotes: 'New features',
    releaseDate: '2026-02-01',
  };

  const mockUpdateSettings: UpdateSettings = {
    autoCheckEnabled: true,
  };

  beforeEach(() => {
    /*
     * Setup mock electronAPI
     */
    mockElectronAPI = {
      onUpdateChecking: jasmine.createSpy('onUpdateChecking'),
      onUpdateAvailable: jasmine.createSpy('onUpdateAvailable'),
      onUpdateNotAvailable: jasmine.createSpy('onUpdateNotAvailable'),
      onDownloadProgress: jasmine.createSpy('onDownloadProgress'),
      onUpdateDownloaded: jasmine.createSpy('onUpdateDownloaded'),
      onUpdateError: jasmine.createSpy('onUpdateError'),
      checkForUpdates: jasmine
        .createSpy('checkForUpdates')
        .and.returnValue(Promise.resolve({ success: true })),
      downloadUpdate: jasmine
        .createSpy('downloadUpdate')
        .and.returnValue(Promise.resolve({ success: true })),
      installUpdate: jasmine
        .createSpy('installUpdate')
        .and.returnValue(Promise.resolve({ success: true })),
      getUpdateSettings: jasmine
        .createSpy('getUpdateSettings')
        .and.returnValue(
          Promise.resolve({ success: true, settings: mockUpdateSettings }),
        ),
      setUpdateSettings: jasmine
        .createSpy('setUpdateSettings')
        .and.returnValue(Promise.resolve({ success: true })),
      getUpdateStatus: jasmine
        .createSpy('getUpdateStatus')
        .and.returnValue(Promise.resolve({ success: true })),
    } as MockElectronAPI;

    /*
     * Define electronAPI as a configurable property so it can be deleted in tests
     */
    Object.defineProperty(window, 'electronAPI', {
      configurable: true,
      writable: true,
      value: mockElectronAPI,
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(UpdateService);
  });

  afterEach(() => {
    delete (window as { electronAPI?: unknown }).electronAPI;
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with default signal values', () => {
      expect(service.updateAvailable()).toBeNull();
      expect(service.downloadProgress()).toBe(0);
      expect(service.isChecking()).toBe(false);
      expect(service.isDownloading()).toBe(false);
      expect(service.updateDownloaded()).toBe(false);
      expect(service.settings()).toEqual({ autoCheckEnabled: true });
      expect(service.errorMessage()).toBeNull();
    });

    it('should setup listeners on construction', () => {
      expect(mockElectronAPI.onUpdateChecking).toHaveBeenCalled();
      expect(mockElectronAPI.onUpdateAvailable).toHaveBeenCalled();
      expect(mockElectronAPI.onUpdateNotAvailable).toHaveBeenCalled();
      expect(mockElectronAPI.onDownloadProgress).toHaveBeenCalled();
      expect(mockElectronAPI.onUpdateDownloaded).toHaveBeenCalled();
      expect(mockElectronAPI.onUpdateError).toHaveBeenCalled();
    });

    it('should not setup listeners when electronAPI is not available', () => {
      delete (window as { electronAPI?: unknown }).electronAPI;

      const newService = new UpdateService();

      expect(newService).toBeTruthy();
    });

    it('should load settings on init', async () => {
      await service.init();

      expect(mockElectronAPI.getUpdateSettings).toHaveBeenCalled();
      expect(service.settings()).toEqual(mockUpdateSettings);
    });

    it('should handle init when electronAPI is not available', async () => {
      delete (window as { electronAPI?: unknown }).electronAPI;
      const newService = new UpdateService();

      await newService.init();

      expect(newService.settings()).toEqual({ autoCheckEnabled: true });
    });

    it('should handle errors during settings load', async () => {
      mockElectronAPI.getUpdateSettings!.and.returnValue(
        Promise.reject('Error'),
      );
      spyOn(console, 'error');

      await service.init();

      expect(console.error).toHaveBeenCalledWith(
        '[UpdateService] Failed to load settings:',
        'Error',
      );
    });

    it('should handle unsuccessful settings load', async () => {
      mockElectronAPI.getUpdateSettings!.and.returnValue(
        Promise.resolve({ success: false }),
      );

      await service.init();

      expect(service.settings()).toEqual({ autoCheckEnabled: true });
    });
  });

  describe('event listeners', () => {
    let checkingCallback: () => void;
    let availableCallback: (info: UpdateInfo) => void;
    let notAvailableCallback: (info: { version: string }) => void;
    let progressCallback: (progress: DownloadProgress) => void;
    let downloadedCallback: (info: UpdateInfo) => void;
    let errorCallback: (error: { message: string }) => void;

    beforeEach(() => {
      checkingCallback = mockElectronAPI.onUpdateChecking!.calls.argsFor(0)[0];
      availableCallback =
        mockElectronAPI.onUpdateAvailable!.calls.argsFor(0)[0];
      notAvailableCallback =
        mockElectronAPI.onUpdateNotAvailable!.calls.argsFor(0)[0];
      progressCallback =
        mockElectronAPI.onDownloadProgress!.calls.argsFor(0)[0];
      downloadedCallback =
        mockElectronAPI.onUpdateDownloaded!.calls.argsFor(0)[0];
      errorCallback = mockElectronAPI.onUpdateError!.calls.argsFor(0)[0];
    });

    it('should handle onUpdateChecking event', () => {
      spyOn(console, 'log');

      checkingCallback();

      expect(service.isChecking()).toBe(true);
      expect(service.errorMessage()).toBeNull();
      expect(console.log).toHaveBeenCalledWith(
        '[UpdateService] Checking for updates...',
      );
    });

    it('should handle onUpdateAvailable event', () => {
      spyOn(console, 'log');

      availableCallback(mockUpdateInfo);

      expect(service.isChecking()).toBe(false);
      expect(service.updateAvailable()).toEqual(mockUpdateInfo);
      expect(console.log).toHaveBeenCalledWith(
        '[UpdateService] Update available:',
        '2.0.0',
      );
    });

    it('should handle onUpdateNotAvailable event', () => {
      spyOn(console, 'log');

      notAvailableCallback({ version: '1.0.0' });

      expect(service.isChecking()).toBe(false);
      expect(service.updateAvailable()).toBeNull();
      expect(console.log).toHaveBeenCalledWith(
        '[UpdateService] No updates available. Current version:',
        '1.0.0',
      );
    });

    it('should handle onDownloadProgress event', () => {
      spyOn(console, 'log');
      const progress: DownloadProgress = {
        percent: 45.67,
        bytesPerSecond: 1024000,
        transferred: 5000000,
        total: 10000000,
      };

      progressCallback(progress);

      expect(service.isDownloading()).toBe(true);
      expect(service.downloadProgress()).toBe(46);
      expect(console.log).toHaveBeenCalledWith(
        '[UpdateService] Download progress: 45.67%',
      );
    });

    it('should handle onUpdateDownloaded event', () => {
      spyOn(console, 'log');

      downloadedCallback(mockUpdateInfo);

      expect(service.isDownloading()).toBe(false);
      expect(service.updateDownloaded()).toBe(true);
      expect(service.downloadProgress()).toBe(100);
      expect(console.log).toHaveBeenCalledWith(
        '[UpdateService] Update downloaded:',
        '2.0.0',
      );
    });

    it('should handle onUpdateError event', () => {
      spyOn(console, 'error');

      errorCallback({ message: 'Download failed' });

      expect(service.isChecking()).toBe(false);
      expect(service.isDownloading()).toBe(false);
      expect(service.errorMessage()).toBe('Download failed');
      expect(console.error).toHaveBeenCalledWith(
        '[UpdateService] Update error:',
        'Download failed',
      );
    });
  });

  describe('checkForUpdates', () => {
    it('should check for updates successfully', async () => {
      await service.checkForUpdates();

      expect(mockElectronAPI.checkForUpdates).toHaveBeenCalled();
    });

    it('should handle check for updates error', async () => {
      mockElectronAPI.checkForUpdates!.and.returnValue(
        Promise.resolve({ success: false, error: 'Network error' }),
      );

      await expectAsync(service.checkForUpdates()).toBeRejectedWithError(
        'Failed to check for updates',
      );
      expect(service.errorMessage()).toBe('Network error');
    });

    it('should throw error when electronAPI is not available', async () => {
      delete (window as { electronAPI?: unknown }).electronAPI;

      await expectAsync(service.checkForUpdates()).toBeRejectedWithError(
        'Update API not available',
      );
    });

    it('should handle missing checkForUpdates method', async () => {
      delete mockElectronAPI.checkForUpdates;

      await expectAsync(service.checkForUpdates()).toBeRejectedWithError(
        'Update API not available',
      );
    });
  });

  describe('downloadUpdate', () => {
    it('should download update successfully', async () => {
      await service.downloadUpdate();

      expect(mockElectronAPI.downloadUpdate).toHaveBeenCalled();
    });

    it('should handle download update error', async () => {
      mockElectronAPI.downloadUpdate!.and.returnValue(
        Promise.resolve({ success: false, error: 'Download failed' }),
      );

      await expectAsync(service.downloadUpdate()).toBeRejectedWithError(
        'Failed to download update',
      );
      expect(service.errorMessage()).toBe('Download failed');
    });

    it('should throw error when electronAPI is not available', async () => {
      delete (window as { electronAPI?: unknown }).electronAPI;

      await expectAsync(service.downloadUpdate()).toBeRejectedWithError(
        'Update API not available',
      );
    });

    it('should handle missing downloadUpdate method', async () => {
      delete mockElectronAPI.downloadUpdate;

      await expectAsync(service.downloadUpdate()).toBeRejectedWithError(
        'Update API not available',
      );
    });
  });

  describe('installUpdate', () => {
    it('should install update successfully', async () => {
      await service.installUpdate();

      expect(mockElectronAPI.installUpdate).toHaveBeenCalled();
    });

    it('should handle install update error', async () => {
      mockElectronAPI.installUpdate!.and.returnValue(
        Promise.resolve({ success: false, error: 'Install failed' }),
      );

      await expectAsync(service.installUpdate()).toBeRejectedWithError(
        'Failed to install update',
      );
      expect(service.errorMessage()).toBe('Install failed');
    });

    it('should throw error when electronAPI is not available', async () => {
      delete (window as { electronAPI?: unknown }).electronAPI;

      await expectAsync(service.installUpdate()).toBeRejectedWithError(
        'Update API not available',
      );
    });

    it('should handle missing installUpdate method', async () => {
      delete mockElectronAPI.installUpdate;

      await expectAsync(service.installUpdate()).toBeRejectedWithError(
        'Update API not available',
      );
    });
  });

  describe('getSettings', () => {
    it('should get settings successfully', async () => {
      const settings = await service.getSettings();

      expect(mockElectronAPI.getUpdateSettings).toHaveBeenCalled();
      expect(settings).toEqual(mockUpdateSettings);
      expect(service.settings()).toEqual(mockUpdateSettings);
    });

    it('should handle get settings error', async () => {
      mockElectronAPI.getUpdateSettings!.and.returnValue(
        Promise.resolve({ success: false, error: 'Settings error' }),
      );

      await expectAsync(service.getSettings()).toBeRejectedWithError(
        'Failed to get update settings',
      );
    });

    it('should handle get settings without error message', async () => {
      mockElectronAPI.getUpdateSettings!.and.returnValue(
        Promise.resolve({ success: false }),
      );

      await expectAsync(service.getSettings()).toBeRejectedWithError(
        'Failed to get update settings',
      );
    });

    it('should throw error when electronAPI is not available', async () => {
      delete (window as { electronAPI?: unknown }).electronAPI;

      await expectAsync(service.getSettings()).toBeRejectedWithError(
        'Update API not available',
      );
    });

    it('should handle missing getUpdateSettings method', async () => {
      delete mockElectronAPI.getUpdateSettings;

      await expectAsync(service.getSettings()).toBeRejectedWithError(
        'Update API not available',
      );
    });
  });

  describe('setAutoCheck', () => {
    it('should enable auto-check successfully', async () => {
      await service.setAutoCheck(true);

      expect(mockElectronAPI.setUpdateSettings!).toHaveBeenCalledWith({
        autoCheckEnabled: true,
      });
      expect(service.settings().autoCheckEnabled).toBe(true);
    });

    it('should disable auto-check successfully', async () => {
      await service.setAutoCheck(false);

      expect(mockElectronAPI.setUpdateSettings!).toHaveBeenCalledWith({
        autoCheckEnabled: false,
      });
      expect(service.settings().autoCheckEnabled).toBe(false);
    });

    it('should handle set auto-check error', async () => {
      mockElectronAPI.setUpdateSettings!.and.returnValue(
        Promise.resolve({ success: false, error: 'Update failed' }),
      );

      await expectAsync(service.setAutoCheck(true)).toBeRejectedWithError(
        'Failed to set auto-check setting',
      );
    });

    it('should handle set auto-check error without message', async () => {
      mockElectronAPI.setUpdateSettings!.and.returnValue(
        Promise.resolve({ success: false }),
      );

      await expectAsync(service.setAutoCheck(true)).toBeRejectedWithError(
        'Failed to set auto-check setting',
      );
    });

    it('should throw error when electronAPI is not available', async () => {
      delete (window as { electronAPI?: unknown }).electronAPI;

      await expectAsync(service.setAutoCheck(true)).toBeRejectedWithError(
        'Update API not available',
      );
    });

    it('should handle missing setUpdateSettings method', async () => {
      delete mockElectronAPI.setUpdateSettings;

      await expectAsync(service.setAutoCheck(true)).toBeRejectedWithError(
        'Update API not available',
      );
    });
  });

  describe('getAppVersion', () => {
    it('should return the app version when available', async () => {
      mockElectronAPI.getAppVersion = jasmine
        .createSpy('getAppVersion')
        .and.returnValue(Promise.resolve({ success: true, version: '1.2.3' }));

      const version = await service.getAppVersion();

      expect(mockElectronAPI.getAppVersion).toHaveBeenCalled();
      expect(version).toBe('1.2.3');
    });

    it('should reject when app version retrieval fails', async () => {
      mockElectronAPI.getAppVersion = jasmine
        .createSpy('getAppVersion')
        .and.returnValue(Promise.resolve({ success: false, error: 'boom' }));

      await expectAsync(service.getAppVersion()).toBeRejectedWithError(
        'Failed to get app version',
      );
    });

    it('should reject when version is missing in result', async () => {
      mockElectronAPI.getAppVersion = jasmine
        .createSpy('getAppVersion')
        .and.returnValue(Promise.resolve({ success: true }));

      await expectAsync(service.getAppVersion()).toBeRejectedWithError(
        'Failed to get app version',
      );
    });

    it('should throw when electronAPI is not available', async () => {
      delete (window as { electronAPI?: unknown }).electronAPI;

      await expectAsync(service.getAppVersion()).toBeRejectedWithError(
        'Update API not available',
      );
    });

    it('should throw when getAppVersion is missing', async () => {
      delete (mockElectronAPI as { getAppVersion?: unknown }).getAppVersion;

      await expectAsync(service.getAppVersion()).toBeRejectedWithError(
        'Update API not available',
      );
    });
  });

  describe('getStatus', () => {
    it('should get update status successfully', async () => {
      const expectedStatus: UpdateResult = {
        success: true,
      };

      const status = await service.getStatus();

      expect(mockElectronAPI.getUpdateStatus!).toHaveBeenCalled();
      expect(status).toEqual(expectedStatus);
    });

    it('should throw error when electronAPI is not available', async () => {
      delete (window as { electronAPI?: unknown }).electronAPI;

      await expectAsync(service.getStatus()).toBeRejectedWithError(
        'Update API not available',
      );
    });

    it('should handle missing getUpdateStatus method', async () => {
      delete mockElectronAPI.getUpdateStatus;

      await expectAsync(service.getStatus()).toBeRejectedWithError(
        'Update API not available',
      );
    });
  });

  describe('resetState', () => {
    it('should reset all state signals', () => {
      /*
       * Set some non-default values
       */
      service.updateAvailable.set(mockUpdateInfo);
      service.downloadProgress.set(50);
      service.isChecking.set(true);
      service.isDownloading.set(true);
      service.updateDownloaded.set(true);
      service.errorMessage.set('Some error');

      service.resetState();

      expect(service.updateAvailable()).toBeNull();
      expect(service.downloadProgress()).toBe(0);
      expect(service.isChecking()).toBe(false);
      expect(service.isDownloading()).toBe(false);
      expect(service.updateDownloaded()).toBe(false);
      expect(service.errorMessage()).toBeNull();
    });

    it('should be safe to call resetState multiple times', () => {
      service.resetState();
      service.resetState();

      expect(service.updateAvailable()).toBeNull();
      expect(service.downloadProgress()).toBe(0);
    });
  });

  describe('signal updates', () => {
    it('should allow manual signal updates', () => {
      service.updateAvailable.set(mockUpdateInfo);
      service.downloadProgress.set(75);
      service.isChecking.set(true);

      expect(service.updateAvailable()).toEqual(mockUpdateInfo);
      expect(service.downloadProgress()).toBe(75);
      expect(service.isChecking()).toBe(true);
    });

    it('should handle settings signal update', () => {
      const newSettings: UpdateSettings = { autoCheckEnabled: false };
      service.settings.set(newSettings);

      expect(service.settings()).toEqual(newSettings);
    });

    it('should handle settings signal partial update', () => {
      service.settings.update((s) => ({ ...s, autoCheckEnabled: false }));

      expect(service.settings().autoCheckEnabled).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle multiple simultaneous checks', async () => {
      const promise1 = service.checkForUpdates();
      const promise2 = service.checkForUpdates();

      await Promise.all([promise1, promise2]);

      expect(mockElectronAPI.checkForUpdates!).toHaveBeenCalledTimes(2);
    });

    it('should handle rapid state changes', () => {
      service.isChecking.set(true);
      service.isChecking.set(false);
      service.isChecking.set(true);

      expect(service.isChecking()).toBe(true);
    });

    it('should handle progress rounding edge cases', () => {
      const progressCallback =
        mockElectronAPI.onDownloadProgress!.calls.argsFor(0)[0];

      progressCallback({ percent: 99.99 } as DownloadProgress);
      expect(service.downloadProgress()).toBe(100);

      progressCallback({ percent: 0.01 } as DownloadProgress);
      expect(service.downloadProgress()).toBe(0);

      progressCallback({ percent: 50.5 } as DownloadProgress);
      expect(service.downloadProgress()).toBe(51);
    });
  });
});
