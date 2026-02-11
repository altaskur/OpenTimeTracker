import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ipcMain } from 'electron';
import { setupAutoCheckUpdatesHandlers } from './auto-check-updates-handlers.js';

// Mock electron
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
  },
}));

describe('Auto-Check Updates Handlers', () => {
  const mockPrisma = {
    appSettings: {
      findUnique: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    },
  };

  const mockDbManager = {
    getPrisma: vi.fn(() => mockPrisma),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setupAutoCheckUpdatesHandlers', () => {
    it('should register get-auto-check-updates handler', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setupAutoCheckUpdatesHandlers(mockDbManager as any);

      expect(ipcMain.handle).toHaveBeenCalledWith(
        'get-auto-check-updates',
        expect.any(Function),
      );
    });

    it('should register set-auto-check-updates handler', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setupAutoCheckUpdatesHandlers(mockDbManager as any);

      expect(ipcMain.handle).toHaveBeenCalledWith(
        'set-auto-check-updates',
        expect.any(Function),
      );
    });
  });

  describe('get-auto-check-updates handler', () => {
    it('should return autoCheckUpdates value from database', async () => {
      mockPrisma.appSettings.findUnique.mockResolvedValue({
        id: 'app_settings',
        darkMode: true,
        language: 'es',
        autoCheckUpdates: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setupAutoCheckUpdatesHandlers(mockDbManager as any);

      const handler = (ipcMain.handle as ReturnType<typeof vi.fn>).mock
        .calls[0][1];
      const result = await handler();

      expect(result).toBe(false);
      expect(mockPrisma.appSettings.findUnique).toHaveBeenCalledWith({
        where: { id: 'app_settings' },
      });
    });

    it('should return true when settings not found and create defaults', async () => {
      mockPrisma.appSettings.findUnique.mockResolvedValue(null);
      mockPrisma.appSettings.create.mockResolvedValue({
        id: 'app_settings',
        darkMode: true,
        language: 'es',
        autoCheckUpdates: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setupAutoCheckUpdatesHandlers(mockDbManager as any);

      const handler = (ipcMain.handle as ReturnType<typeof vi.fn>).mock
        .calls[0][1];
      const result = await handler();

      expect(result).toBe(true);
      expect(mockPrisma.appSettings.create).toHaveBeenCalledWith({
        data: { id: 'app_settings', autoCheckUpdates: true },
      });
    });

    it('should return true on database error', async () => {
      mockPrisma.appSettings.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setupAutoCheckUpdatesHandlers(mockDbManager as any);

      const handler = (ipcMain.handle as ReturnType<typeof vi.fn>).mock
        .calls[0][1];
      const result = await handler();

      expect(result).toBe(true);
    });
  });

  describe('set-auto-check-updates handler', () => {
    it('should save autoCheckUpdates to database', async () => {
      mockPrisma.appSettings.upsert.mockResolvedValue({
        id: 'app_settings',
        darkMode: true,
        language: 'es',
        autoCheckUpdates: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setupAutoCheckUpdatesHandlers(mockDbManager as any);

      const handler = (ipcMain.handle as ReturnType<typeof vi.fn>).mock
        .calls[1][1];
      await handler({}, false);

      expect(mockPrisma.appSettings.upsert).toHaveBeenCalledWith({
        where: { id: 'app_settings' },
        update: { autoCheckUpdates: false },
        create: { id: 'app_settings', autoCheckUpdates: false },
      });
    });

    it('should save true value correctly', async () => {
      mockPrisma.appSettings.upsert.mockResolvedValue({
        id: 'app_settings',
        darkMode: true,
        language: 'es',
        autoCheckUpdates: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setupAutoCheckUpdatesHandlers(mockDbManager as any);

      const handler = (ipcMain.handle as ReturnType<typeof vi.fn>).mock
        .calls[1][1];
      await handler({}, true);

      expect(mockPrisma.appSettings.upsert).toHaveBeenCalledWith({
        where: { id: 'app_settings' },
        update: { autoCheckUpdates: true },
        create: { id: 'app_settings', autoCheckUpdates: true },
      });
    });

    it('should throw error on database failure', async () => {
      mockPrisma.appSettings.upsert.mockRejectedValue(new Error('DB error'));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setupAutoCheckUpdatesHandlers(mockDbManager as any);

      const handler = (ipcMain.handle as ReturnType<typeof vi.fn>).mock
        .calls[1][1];

      await expect(handler({}, false)).rejects.toThrow('DB error');
    });
  });
});
