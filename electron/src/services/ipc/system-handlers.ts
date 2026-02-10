import { ipcMain, shell } from 'electron';

/**
 * Sets up system-related IPC handlers
 */
export const setupSystemHandlers = (): void => {
  // Open external links
  ipcMain.handle('open-external', async (_event, url: string) => {
    try {
      await shell.openExternal(url);
    } catch (error) {
      console.error('Error opening external URL:', error);
      throw error;
    }
  });
};
