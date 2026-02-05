import { app, ipcMain } from 'electron';
import { UpdateManager } from '../updater/update-manager.js';
import { UpdateSettings } from '../../interfaces/update.interface.js';

let updateManager: UpdateManager | null = null;

/**
 * Sets up update-related IPC handlers.
 * Manages update checking, downloading, and installation between main and renderer processes.
 */
export const setupUpdateHandlers = (): void => {
  updateManager = UpdateManager.getInstance();

  /**
   * Trigger manual update check.
   */
  ipcMain.handle('update:check', async () => {
    try {
      await updateManager?.checkForUpdates();
      return { success: true };
    } catch (error) {
      console.error('[IPC] Update check failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  /**
   * Download available update.
   */
  ipcMain.handle('update:download', async () => {
    try {
      await updateManager?.downloadUpdate();
      return { success: true };
    } catch (error) {
      console.error('[IPC] Update download failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  /**
   * Install downloaded update and restart app.
   */
  ipcMain.handle('update:install', async () => {
    try {
      updateManager?.quitAndInstall();
      return { success: true };
    } catch (error) {
      console.error('[IPC] Update installation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  /**
   * Get current update settings.
   */
  ipcMain.handle('update:get-settings', async () => {
    try {
      const settings = updateManager?.getSettings();
      return { success: true, settings };
    } catch (error) {
      console.error('[IPC] Failed to get update settings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  /**
   * Update update settings.
   */
  ipcMain.handle(
    'update:set-settings',
    async (_event, settings: Partial<UpdateSettings>) => {
      try {
        await updateManager?.setSettings(settings);
        return { success: true };
      } catch (error) {
        console.error('[IPC] Failed to set update settings:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
  );

  /**
   * Get current update status.
   */
  ipcMain.handle('update:get-status', async () => {
    try {
      const status = updateManager?.getStatus();
      const updateInfo = updateManager?.getUpdateInfo();
      return {
        success: true,
        status,
        updateInfo,
      };
    } catch (error) {
      console.error('[IPC] Failed to get update status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  /**
   * Get current application version.
   */
  ipcMain.handle('update:get-app-version', async () => {
    try {
      return { success: true, version: app.getVersion() };
    } catch (error) {
      console.error('[IPC] Failed to get app version:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });
};
