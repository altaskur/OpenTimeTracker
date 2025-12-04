import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type Mocked,
  type MockInstance,
} from 'vitest';
import { ipcMain, dialog } from 'electron';
import { setupBackupHandlers } from './backup-handlers.js';
import { BackupService } from '../backup/index.js';

/**
 * Backup Handlers Test Suite
 */
describe('Backup Handlers', () => {
  let mockBackupService: Mocked<BackupService>;
  let handleSpy: MockInstance;
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(() => {
    mockBackupService = {
      createBackup: vi.fn(),
      listBackups: vi.fn(),
      restoreBackup: vi.fn(),
      deleteBackup: vi.fn(),
      exportBackup: vi.fn(),
      importBackup: vi.fn(),
      getBackupDir: vi.fn(),
    } as unknown as Mocked<BackupService>;

    handlers = new Map();
    handleSpy = vi
      .spyOn(ipcMain, 'handle')
      .mockImplementation((channel, handler) => {
        handlers.set(
          channel,
          handler as (...args: unknown[]) => Promise<unknown>,
        );
        return undefined as unknown as Electron.IpcMain;
      });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Setup', () => {
    it('should register all backup handlers', () => {
      setupBackupHandlers(mockBackupService);

      expect(handleSpy).toHaveBeenCalledWith(
        'backup-create',
        expect.any(Function),
      );
      expect(handleSpy).toHaveBeenCalledWith(
        'backup-list',
        expect.any(Function),
      );
      expect(handleSpy).toHaveBeenCalledWith(
        'backup-restore',
        expect.any(Function),
      );
      expect(handleSpy).toHaveBeenCalledWith(
        'backup-delete',
        expect.any(Function),
      );
      expect(handleSpy).toHaveBeenCalledWith(
        'backup-export',
        expect.any(Function),
      );
      expect(handleSpy).toHaveBeenCalledWith(
        'backup-import',
        expect.any(Function),
      );
      expect(handleSpy).toHaveBeenCalledWith(
        'backup-get-dir',
        expect.any(Function),
      );
    });
  });

  describe('backup-create', () => {
    beforeEach(() => {
      setupBackupHandlers(mockBackupService);
    });

    it('should create a manual backup successfully', async () => {
      const mockResult = { success: true, path: '/backups/backup.db' };
      mockBackupService.createBackup.mockResolvedValue(mockResult);

      const handler = handlers.get('backup-create');
      const result = await handler!({} as Electron.IpcMainInvokeEvent);

      expect(mockBackupService.createBackup).toHaveBeenCalledWith('manual');
      expect(result).toEqual(mockResult);
    });

    it('should handle errors when creating backup', async () => {
      mockBackupService.createBackup.mockRejectedValue(
        new Error('Backup failed'),
      );

      const handler = handlers.get('backup-create');
      const result = await handler!({} as Electron.IpcMainInvokeEvent);

      expect(result).toEqual({
        success: false,
        error: 'Backup failed',
      });
    });

    it('should handle unknown errors when creating backup', async () => {
      mockBackupService.createBackup.mockRejectedValue('Unknown error');

      const handler = handlers.get('backup-create');
      const result = await handler!({} as Electron.IpcMainInvokeEvent);

      expect(result).toEqual({
        success: false,
        error: 'Unknown error',
      });
    });
  });

  describe('backup-list', () => {
    beforeEach(() => {
      setupBackupHandlers(mockBackupService);
    });

    it('should list backups successfully', async () => {
      const mockBackups = [
        {
          filename: 'backup1.db',
          path: '/backup1.db',
          size: 1024,
          createdAt: new Date(),
          type: 'manual' as const,
        },
        {
          filename: 'backup2.db',
          path: '/backup2.db',
          size: 2048,
          createdAt: new Date(),
          type: 'auto' as const,
        },
      ];
      mockBackupService.listBackups.mockResolvedValue(mockBackups);

      const handler = handlers.get('backup-list');
      const result = await handler!({} as Electron.IpcMainInvokeEvent);

      expect(mockBackupService.listBackups).toHaveBeenCalled();
      expect(result).toEqual(mockBackups);
    });

    it('should return empty array on error', async () => {
      mockBackupService.listBackups.mockRejectedValue(new Error('List failed'));

      const handler = handlers.get('backup-list');
      const result = await handler!({} as Electron.IpcMainInvokeEvent);

      expect(result).toEqual([]);
    });
  });

  describe('backup-restore', () => {
    beforeEach(() => {
      setupBackupHandlers(mockBackupService);
    });

    it('should restore backup successfully', async () => {
      const mockResult = { success: true };
      mockBackupService.restoreBackup.mockResolvedValue(mockResult);

      const handler = handlers.get('backup-restore');
      const result = await handler!(
        {} as Electron.IpcMainInvokeEvent,
        '/backup.db',
      );

      expect(mockBackupService.restoreBackup).toHaveBeenCalledWith(
        '/backup.db',
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle errors when restoring backup', async () => {
      mockBackupService.restoreBackup.mockRejectedValue(
        new Error('Restore failed'),
      );

      const handler = handlers.get('backup-restore');
      const result = await handler!(
        {} as Electron.IpcMainInvokeEvent,
        '/backup.db',
      );

      expect(result).toEqual({
        success: false,
        error: 'Restore failed',
      });
    });

    it('should handle unknown errors when restoring backup', async () => {
      mockBackupService.restoreBackup.mockRejectedValue('Unknown');

      const handler = handlers.get('backup-restore');
      const result = await handler!(
        {} as Electron.IpcMainInvokeEvent,
        '/backup.db',
      );

      expect(result).toEqual({
        success: false,
        error: 'Unknown error',
      });
    });
  });

  describe('backup-delete', () => {
    beforeEach(() => {
      setupBackupHandlers(mockBackupService);
    });

    it('should delete backup successfully', async () => {
      const mockResult = { success: true };
      mockBackupService.deleteBackup.mockResolvedValue(mockResult);

      const handler = handlers.get('backup-delete');
      const result = await handler!(
        {} as Electron.IpcMainInvokeEvent,
        '/backup.db',
      );

      expect(mockBackupService.deleteBackup).toHaveBeenCalledWith('/backup.db');
      expect(result).toEqual(mockResult);
    });

    it('should handle errors when deleting backup', async () => {
      mockBackupService.deleteBackup.mockRejectedValue(
        new Error('Delete failed'),
      );

      const handler = handlers.get('backup-delete');
      const result = await handler!(
        {} as Electron.IpcMainInvokeEvent,
        '/backup.db',
      );

      expect(result).toEqual({
        success: false,
        error: 'Delete failed',
      });
    });

    it('should handle unknown errors when deleting backup', async () => {
      mockBackupService.deleteBackup.mockRejectedValue(42);

      const handler = handlers.get('backup-delete');
      const result = await handler!(
        {} as Electron.IpcMainInvokeEvent,
        '/backup.db',
      );

      expect(result).toEqual({
        success: false,
        error: 'Unknown error',
      });
    });
  });

  describe('backup-export', () => {
    beforeEach(() => {
      setupBackupHandlers(mockBackupService);
    });

    it('should export backup successfully', async () => {
      const mockResult = { success: true };
      (dialog.showSaveDialog as Mock).mockResolvedValue({
        canceled: false,
        filePath: '/export/backup.db',
      });
      mockBackupService.exportBackup.mockResolvedValue(mockResult);

      const handler = handlers.get('backup-export');
      const result = await handler!({} as Electron.IpcMainInvokeEvent);

      expect(dialog.showSaveDialog).toHaveBeenCalledWith({
        title: 'Export Backup',
        defaultPath: expect.stringContaining('timetracker-backup-'),
        filters: [{ name: 'Database Files', extensions: ['db'] }],
      });
      expect(mockBackupService.exportBackup).toHaveBeenCalledWith(
        '/export/backup.db',
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle cancelled export', async () => {
      (dialog.showSaveDialog as Mock).mockResolvedValue({
        canceled: true,
      });

      const handler = handlers.get('backup-export');
      const result = await handler!({} as Electron.IpcMainInvokeEvent);

      expect(mockBackupService.exportBackup).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: 'Export cancelled',
      });
    });

    it('should handle missing file path', async () => {
      (dialog.showSaveDialog as Mock).mockResolvedValue({
        canceled: false,
        filePath: undefined,
      });

      const handler = handlers.get('backup-export');
      const result = await handler!({} as Electron.IpcMainInvokeEvent);

      expect(result).toEqual({
        success: false,
        error: 'Export cancelled',
      });
    });

    it('should handle errors when exporting backup', async () => {
      (dialog.showSaveDialog as Mock).mockResolvedValue({
        canceled: false,
        filePath: '/export/backup.db',
      });
      mockBackupService.exportBackup.mockRejectedValue(
        new Error('Export failed'),
      );

      const handler = handlers.get('backup-export');
      const result = await handler!({} as Electron.IpcMainInvokeEvent);

      expect(result).toEqual({
        success: false,
        error: 'Export failed',
      });
    });

    it('should handle unknown errors when exporting backup', async () => {
      (dialog.showSaveDialog as Mock).mockRejectedValue('Unknown');

      const handler = handlers.get('backup-export');
      const result = await handler!({} as Electron.IpcMainInvokeEvent);

      expect(result).toEqual({
        success: false,
        error: 'Unknown error',
      });
    });
  });

  describe('backup-import', () => {
    beforeEach(() => {
      setupBackupHandlers(mockBackupService);
    });

    it('should import backup successfully', async () => {
      const mockResult = { success: true };
      (dialog.showOpenDialog as Mock).mockResolvedValue({
        canceled: false,
        filePaths: ['/import/backup.db'],
      });
      mockBackupService.importBackup.mockResolvedValue(mockResult);

      const handler = handlers.get('backup-import');
      const result = await handler!({} as Electron.IpcMainInvokeEvent);

      expect(dialog.showOpenDialog).toHaveBeenCalledWith({
        title: 'Import Backup',
        filters: [{ name: 'Database Files', extensions: ['db'] }],
        properties: ['openFile'],
      });
      expect(mockBackupService.importBackup).toHaveBeenCalledWith(
        '/import/backup.db',
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle cancelled import', async () => {
      (dialog.showOpenDialog as Mock).mockResolvedValue({
        canceled: true,
        filePaths: [],
      });

      const handler = handlers.get('backup-import');
      const result = await handler!({} as Electron.IpcMainInvokeEvent);

      expect(mockBackupService.importBackup).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: 'Import cancelled',
      });
    });

    it('should handle empty file paths', async () => {
      (dialog.showOpenDialog as Mock).mockResolvedValue({
        canceled: false,
        filePaths: [],
      });

      const handler = handlers.get('backup-import');
      const result = await handler!({} as Electron.IpcMainInvokeEvent);

      expect(result).toEqual({
        success: false,
        error: 'Import cancelled',
      });
    });

    it('should handle errors when importing backup', async () => {
      (dialog.showOpenDialog as Mock).mockResolvedValue({
        canceled: false,
        filePaths: ['/import/backup.db'],
      });
      mockBackupService.importBackup.mockRejectedValue(
        new Error('Import failed'),
      );

      const handler = handlers.get('backup-import');
      const result = await handler!({} as Electron.IpcMainInvokeEvent);

      expect(result).toEqual({
        success: false,
        error: 'Import failed',
      });
    });

    it('should handle unknown errors when importing backup', async () => {
      (dialog.showOpenDialog as Mock).mockRejectedValue(null);

      const handler = handlers.get('backup-import');
      const result = await handler!({} as Electron.IpcMainInvokeEvent);

      expect(result).toEqual({
        success: false,
        error: 'Unknown error',
      });
    });
  });

  describe('backup-get-dir', () => {
    beforeEach(() => {
      setupBackupHandlers(mockBackupService);
    });

    it('should get backup directory', () => {
      mockBackupService.getBackupDir.mockReturnValue('/backups');

      const handler = handlers.get('backup-get-dir');
      const result = handler!({} as Electron.IpcMainInvokeEvent);

      expect(mockBackupService.getBackupDir).toHaveBeenCalled();
      expect(result).toBe('/backups');
    });
  });
});
