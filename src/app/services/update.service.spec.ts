import { TestBed } from '@angular/core/testing';
import { UpdateService } from './update.service';

describe('UpdateService', () => {
  let service: UpdateService;
  let originalElectronAPI: unknown;
  let mockElectronAPI: {
    checkForUpdates: jasmine.Spy;
    openExternal: jasmine.Spy;
    getReleaseByTag: jasmine.Spy;
    getAutoCheckUpdates: jasmine.Spy;
    setAutoCheckUpdates: jasmine.Spy;
  };

  beforeEach(() => {
    // Save original electronAPI
    originalElectronAPI = (window as unknown as { electronAPI?: unknown })
      .electronAPI;

    // Create mock
    mockElectronAPI = {
      checkForUpdates: jasmine.createSpy('checkForUpdates'),
      openExternal: jasmine.createSpy('openExternal'),
      getReleaseByTag: jasmine.createSpy('getReleaseByTag'),
      getAutoCheckUpdates: jasmine
        .createSpy('getAutoCheckUpdates')
        .and.returnValue(Promise.resolve(true)),
      setAutoCheckUpdates: jasmine
        .createSpy('setAutoCheckUpdates')
        .and.returnValue(Promise.resolve()),
    };
    (window as unknown as { electronAPI: typeof mockElectronAPI }).electronAPI =
      mockElectronAPI;

    TestBed.configureTestingModule({
      providers: [UpdateService],
    });

    service = TestBed.inject(UpdateService);
  });

  afterEach(() => {
    // Restore original electronAPI
    (window as unknown as { electronAPI?: unknown }).electronAPI =
      originalElectronAPI;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor', () => {
    it('should initialize service without loading preferences', () => {
      const newService = new UpdateService();
      // Constructor no debe cargar preferencias automáticamente
      expect(newService.autoCheck()).toBe(true); // Valor por defecto
      expect(mockElectronAPI.getAutoCheckUpdates).not.toHaveBeenCalled();
    });

    it('should default to true when electronAPI not available', () => {
      delete (window as { electronAPI?: unknown }).electronAPI;

      const newService = new UpdateService();

      expect(newService.autoCheck()).toBe(true);
    });
  });

  describe('init', () => {
    it('should load preferences and check for updates when autoCheck is true', async () => {
      mockElectronAPI.getAutoCheckUpdates.and.returnValue(
        Promise.resolve(true),
      );
      mockElectronAPI.checkForUpdates.and.returnValue(
        Promise.resolve({
          updateAvailable: false,
          version: '1.0.0',
          url: '',
        }),
      );

      await service.init();

      expect(mockElectronAPI.getAutoCheckUpdates).toHaveBeenCalled();
      expect(mockElectronAPI.checkForUpdates).toHaveBeenCalled();
    });

    it('should not check for updates when autoCheck is false', async () => {
      mockElectronAPI.getAutoCheckUpdates.and.returnValue(
        Promise.resolve(false),
      );

      await service.init();

      expect(mockElectronAPI.getAutoCheckUpdates).toHaveBeenCalled();
      expect(mockElectronAPI.checkForUpdates).not.toHaveBeenCalled();
    });

    it('should load preferences only once', async () => {
      mockElectronAPI.getAutoCheckUpdates.and.returnValue(
        Promise.resolve(true),
      );
      mockElectronAPI.checkForUpdates.and.returnValue(
        Promise.resolve({
          updateAvailable: false,
          version: '1.0.0',
          url: '',
        }),
      );

      await service.init();
      await service.init();

      expect(mockElectronAPI.getAutoCheckUpdates).toHaveBeenCalledTimes(1);
    });

    it('should default to true on database error', async () => {
      mockElectronAPI.getAutoCheckUpdates.and.returnValue(
        Promise.reject(new Error('DB error')),
      );
      mockElectronAPI.checkForUpdates.and.returnValue(
        Promise.resolve({
          updateAvailable: false,
          version: '1.0.0',
          url: '',
        }),
      );

      await service.init();

      expect(service.autoCheck()).toBe(true);
      expect(mockElectronAPI.checkForUpdates).toHaveBeenCalled();
    });
  });

  describe('toggleAutoCheck', () => {
    it('should update autoCheck signal', async () => {
      // Initialize service to load preference
      await service.init();

      await service.toggleAutoCheck(false);

      expect(service.autoCheck()).toBe(false);
    });

    it('should save preference to database', async () => {
      await service.init();

      await service.toggleAutoCheck(false);

      expect(mockElectronAPI.setAutoCheckUpdates).toHaveBeenCalledWith(false);
    });

    it('should handle database errors gracefully', async () => {
      await service.init();

      mockElectronAPI.setAutoCheckUpdates.and.returnValue(
        Promise.reject(new Error('DB error')),
      );

      await service.toggleAutoCheck(false);

      // Signal should still be updated even on error
      expect(service.autoCheck()).toBe(false);
    });
  });

  describe('checkForUpdates', () => {
    it('should return null if already checking', async () => {
      service.checking.set(true);

      const result = await service.checkForUpdates();

      expect(result).toBeNull();
      expect(mockElectronAPI.checkForUpdates).not.toHaveBeenCalled();
    });

    it('should set checking to true while checking', async () => {
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockElectronAPI.checkForUpdates.and.returnValue(pendingPromise);

      const checkPromise = service.checkForUpdates();
      expect(service.checking()).toBe(true);

      resolvePromise!({ updateAvailable: false, version: '1.0.0', url: '' });
      await checkPromise;

      expect(service.checking()).toBe(false);
    });

    it('should set updateAvailable when update is available', async () => {
      const updateResult = {
        updateAvailable: true,
        version: '2.0.0',
        url: 'https://example.com/release',
      };
      mockElectronAPI.checkForUpdates.and.returnValue(
        Promise.resolve(updateResult),
      );

      await service.checkForUpdates();

      expect(service.updateAvailable()).toEqual(updateResult);
    });

    it('should not set updateAvailable when no update is available', async () => {
      const noUpdateResult = {
        updateAvailable: false,
        version: '1.0.0',
        url: '',
      };
      mockElectronAPI.checkForUpdates.and.returnValue(
        Promise.resolve(noUpdateResult),
      );

      await service.checkForUpdates();

      expect(service.updateAvailable()).toBeNull();
    });

    it('should return null and log error on failure', async () => {
      const consoleSpy = spyOn(console, 'error');
      mockElectronAPI.checkForUpdates.and.returnValue(
        Promise.reject(new Error('Network error')),
      );

      const result = await service.checkForUpdates();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      expect(service.checking()).toBe(false);
    });

    it('should return the result on success', async () => {
      const updateResult = {
        updateAvailable: true,
        version: '2.0.0',
        url: 'https://example.com',
      };
      mockElectronAPI.checkForUpdates.and.returnValue(
        Promise.resolve(updateResult),
      );

      const result = await service.checkForUpdates();

      expect(result).toEqual(updateResult);
    });
  });

  describe('openDownloadPage', () => {
    it('should call openExternal with update URL', () => {
      service.updateAvailable.set({
        updateAvailable: true,
        version: '2.0.0',
        url: 'https://github.com/releases/v2.0.0',
      });

      service.openDownloadPage();

      expect(mockElectronAPI.openExternal).toHaveBeenCalledWith(
        'https://github.com/releases/v2.0.0',
      );
    });

    it('should not call openExternal when no update is available', () => {
      service.updateAvailable.set(null);

      service.openDownloadPage();

      expect(mockElectronAPI.openExternal).not.toHaveBeenCalled();
    });

    it('should not call openExternal when update has no URL', () => {
      service.updateAvailable.set({
        updateAvailable: true,
        version: '2.0.0',
        url: '',
      });

      service.openDownloadPage();

      expect(mockElectronAPI.openExternal).not.toHaveBeenCalled();
    });
  });

  describe('getReleaseByTag', () => {
    it('should return release data on success', async () => {
      const releaseData = {
        tag_name: 'v1.2.3',
        html_url: 'https://example.com/releases/v1.2.3',
        body: 'Release notes for v1.2.3',
        name: 'Release v1.2.3',
        published_at: '2023-01-01T00:00:00Z',
      };
      mockElectronAPI.getReleaseByTag.and.returnValue(
        Promise.resolve(releaseData),
      );

      const result = await service.getReleaseByTag('v1.2.3');

      expect(mockElectronAPI.getReleaseByTag).toHaveBeenCalledWith('v1.2.3');
      expect(result).toEqual(releaseData);
    });

    it('should return null on failure', async () => {
      const consoleSpy = spyOn(console, 'error');
      mockElectronAPI.getReleaseByTag.and.returnValue(
        Promise.reject(new Error('Not found')),
      );

      const result = await service.getReleaseByTag('v99.99.99');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
