import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { ipcMain, app } from 'electron';
import { setupUpdateHandlers } from './update-handlers.js';
import { UpdateService } from '../update/update.service.js';

// Mock electron modules
vi.mock('electron', () => ({
    ipcMain: {
        handle: vi.fn(),
    },
    app: {
        getVersion: vi.fn(),
    },
}));

describe('Update Handlers', () => {
    let mockUpdateService: {
        checkForUpdates: Mock;
        getReleaseByTag: Mock;
    };

    beforeEach(() => {
        vi.clearAllMocks();

        mockUpdateService = {
            checkForUpdates: vi.fn(),
            getReleaseByTag: vi.fn(),
        };
    });

    describe('setupUpdateHandlers', () => {
        it('should register all IPC handlers', () => {
            setupUpdateHandlers(mockUpdateService as unknown as UpdateService);

            expect(ipcMain.handle).toHaveBeenCalledTimes(3);
            expect(ipcMain.handle).toHaveBeenCalledWith(
                'check-for-updates',
                expect.any(Function)
            );
            expect(ipcMain.handle).toHaveBeenCalledWith(
                'get-version',
                expect.any(Function)
            );
            expect(ipcMain.handle).toHaveBeenCalledWith(
                'get-release-by-tag',
                expect.any(Function)
            );
        });

        it('should call updateService.checkForUpdates when check-for-updates is invoked', async () => {
            const mockResult = { updateAvailable: true, version: '2.0.0', url: 'https://example.com' };
            mockUpdateService.checkForUpdates.mockResolvedValue(mockResult);

            setupUpdateHandlers(mockUpdateService as unknown as UpdateService);

            const handlers = (ipcMain.handle as Mock).mock.calls;
            const checkForUpdatesHandler = handlers.find(
                (call) => call[0] === 'check-for-updates'
            )?.[1];

            const result = await checkForUpdatesHandler();

            expect(mockUpdateService.checkForUpdates).toHaveBeenCalled();
            expect(result).toEqual(mockResult);
        });

        it('should return app version when get-version is invoked', async () => {
            (app.getVersion as Mock).mockReturnValue('1.5.0');

            setupUpdateHandlers(mockUpdateService as unknown as UpdateService);

            const handlers = (ipcMain.handle as Mock).mock.calls;
            const getVersionHandler = handlers.find(
                (call) => call[0] === 'get-version'
            )?.[1];

            const result = getVersionHandler();

            expect(app.getVersion).toHaveBeenCalled();
            expect(result).toBe('1.5.0');
        });

        it('should call updateService.getReleaseByTag when get-release-by-tag is invoked', async () => {
            const mockRelease = { body: 'Release notes for v1.2.3' };
            mockUpdateService.getReleaseByTag.mockResolvedValue(mockRelease);

            setupUpdateHandlers(mockUpdateService as unknown as UpdateService);

            const handlers = (ipcMain.handle as Mock).mock.calls;
            const getReleaseByTagHandler = handlers.find(
                (call) => call[0] === 'get-release-by-tag'
            )?.[1];

            const result = await getReleaseByTagHandler({}, 'v1.2.3');

            expect(mockUpdateService.getReleaseByTag).toHaveBeenCalledWith('v1.2.3');
            expect(result).toEqual(mockRelease);
        });

        it('should handle checkForUpdates when no update is available', async () => {
            const mockResult = { updateAvailable: false, version: '1.0.0', url: '' };
            mockUpdateService.checkForUpdates.mockResolvedValue(mockResult);

            setupUpdateHandlers(mockUpdateService as unknown as UpdateService);

            const handlers = (ipcMain.handle as Mock).mock.calls;
            const checkForUpdatesHandler = handlers.find(
                (call) => call[0] === 'check-for-updates'
            )?.[1];

            const result = await checkForUpdatesHandler();

            expect(result.updateAvailable).toBe(false);
        });

        it('should handle getReleaseByTag returning null', async () => {
            mockUpdateService.getReleaseByTag.mockResolvedValue(null);

            setupUpdateHandlers(mockUpdateService as unknown as UpdateService);

            const handlers = (ipcMain.handle as Mock).mock.calls;
            const getReleaseByTagHandler = handlers.find(
                (call) => call[0] === 'get-release-by-tag'
            )?.[1];

            const result = await getReleaseByTagHandler({}, 'v99.99.99');

            expect(result).toBeNull();
        });
    });
});
