import { ipcMain, dialog } from 'electron';
import { BackupService } from '../backup/index.js';

/**
 * Sets up IPC handlers for backup operations.
 */
export const setupBackupHandlers = (backupService: BackupService): void => {
  /**
   * Creates a manual backup.
   */
  ipcMain.handle('backup-create', async () => {
    try {
      return await backupService.createBackup('manual');
    } catch (error) {
      console.error('Error creating backup:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  /**
   * Lists all available backups.
   */
  ipcMain.handle('backup-list', async () => {
    try {
      return await backupService.listBackups();
    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  });

  /**
   * Restores a backup by path.
   */
  ipcMain.handle('backup-restore', async (_, backupPath: string) => {
    try {
      return await backupService.restoreBackup(backupPath);
    } catch (error) {
      console.error('Error restoring backup:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  /**
   * Deletes a backup by path.
   */
  ipcMain.handle('backup-delete', async (_, backupPath: string) => {
    try {
      return await backupService.deleteBackup(backupPath);
    } catch (error) {
      console.error('Error deleting backup:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  /**
   * Exports a backup to a user-selected location.
   */
  ipcMain.handle('backup-export', async () => {
    try {
      const result = await dialog.showSaveDialog({
        title: 'Export Backup',
        defaultPath: `timetracker-backup-${new Date().toISOString().slice(0, 10)}.db`,
        filters: [{ name: 'Database Files', extensions: ['db'] }],
      });

      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Export cancelled' };
      }

      return await backupService.exportBackup(result.filePath);
    } catch (error) {
      console.error('Error exporting backup:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  /**
   * Imports a backup from a user-selected file.
   */
  ipcMain.handle('backup-import', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Import Backup',
        filters: [{ name: 'Database Files', extensions: ['db'] }],
        properties: ['openFile'],
      });

      if (result.canceled || !result.filePaths[0]) {
        return { success: false, error: 'Import cancelled' };
      }

      return await backupService.importBackup(result.filePaths[0]);
    } catch (error) {
      console.error('Error importing backup:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  /**
   * Gets the backup directory path.
   */
  ipcMain.handle('backup-get-dir', () => {
    return backupService.getBackupDir();
  });
};
