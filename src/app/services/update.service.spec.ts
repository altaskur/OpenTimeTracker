import { TestBed } from '@angular/core/testing';
import { UpdateService } from './update.service';

describe('UpdateService', () => {
    let service: UpdateService;
    let originalElectronAPI: unknown;
    let mockElectronAPI: {
        checkForUpdates: jasmine.Spy;
        openExternal: jasmine.Spy;
        getReleaseByTag: jasmine.Spy;
    };

    beforeEach(() => {
        // Save original electronAPI
        originalElectronAPI = (window as unknown as { electronAPI?: unknown }).electronAPI;

        // Create mock
        mockElectronAPI = {
            checkForUpdates: jasmine.createSpy('checkForUpdates'),
            openExternal: jasmine.createSpy('openExternal'),
            getReleaseByTag: jasmine.createSpy('getReleaseByTag'),
        };
        (window as unknown as { electronAPI: typeof mockElectronAPI }).electronAPI = mockElectronAPI;

        // Clear localStorage
        localStorage.clear();

        TestBed.configureTestingModule({
            providers: [UpdateService],
        });

        service = TestBed.inject(UpdateService);
    });

    afterEach(() => {
        // Restore original electronAPI
        (window as unknown as { electronAPI?: unknown }).electronAPI = originalElectronAPI;
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('constructor', () => {
        it('should load autoCheck preference from localStorage', () => {
            localStorage.setItem('autoCheckUpdates', 'false');

            const newService = new UpdateService();

            expect(newService.autoCheck()).toBe(false);
        });

        it('should default to true when no localStorage value', () => {
            expect(service.autoCheck()).toBe(true);
        });
    });

    describe('init', () => {
        it('should check for updates when autoCheck is true', () => {
            mockElectronAPI.checkForUpdates.and.returnValue(Promise.resolve({
                updateAvailable: false,
                version: '1.0.0',
                url: '',
            }));

            service.init();

            expect(mockElectronAPI.checkForUpdates).toHaveBeenCalled();
        });

        it('should not check for updates when autoCheck is false', () => {
            service.autoCheck.set(false);

            service.init();

            expect(mockElectronAPI.checkForUpdates).not.toHaveBeenCalled();
        });
    });

    describe('toggleAutoCheck', () => {
        it('should update autoCheck signal', () => {
            service.toggleAutoCheck(false);

            expect(service.autoCheck()).toBe(false);
        });

        it('should save preference to localStorage', () => {
            service.toggleAutoCheck(false);

            expect(localStorage.getItem('autoCheckUpdates')).toBe('false');
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
            mockElectronAPI.checkForUpdates.and.returnValue(Promise.resolve(updateResult));

            await service.checkForUpdates();

            expect(service.updateAvailable()).toEqual(updateResult);
        });

        it('should not set updateAvailable when no update is available', async () => {
            const noUpdateResult = {
                updateAvailable: false,
                version: '1.0.0',
                url: '',
            };
            mockElectronAPI.checkForUpdates.and.returnValue(Promise.resolve(noUpdateResult));

            await service.checkForUpdates();

            expect(service.updateAvailable()).toBeNull();
        });

        it('should return null and log error on failure', async () => {
            const consoleSpy = spyOn(console, 'error');
            mockElectronAPI.checkForUpdates.and.returnValue(Promise.reject(new Error('Network error')));

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
            mockElectronAPI.checkForUpdates.and.returnValue(Promise.resolve(updateResult));

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

            expect(mockElectronAPI.openExternal).toHaveBeenCalledWith('https://github.com/releases/v2.0.0');
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
            const releaseData = { body: 'Release notes for v1.2.3' };
            mockElectronAPI.getReleaseByTag.and.returnValue(Promise.resolve(releaseData));

            const result = await service.getReleaseByTag('v1.2.3');

            expect(mockElectronAPI.getReleaseByTag).toHaveBeenCalledWith('v1.2.3');
            expect(result).toEqual(releaseData);
        });

        it('should return null on failure', async () => {
            const consoleSpy = spyOn(console, 'error');
            mockElectronAPI.getReleaseByTag.and.returnValue(Promise.reject(new Error('Not found')));

            const result = await service.getReleaseByTag('v99.99.99');

            expect(result).toBeNull();
            expect(consoleSpy).toHaveBeenCalled();
        });
    });
});
