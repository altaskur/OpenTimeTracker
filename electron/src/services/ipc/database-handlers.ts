import { ipcMain } from 'electron';
import { DatabaseManager } from '../database/database';

/**
 * Sets up database-related IPC handlers
 */
export const setupDatabaseHandlers = (dbManager: DatabaseManager): void => {
  ipcMain.handle('ping', async () => {
    console.log('IPC: ping received');
    const response = dbManager?.ping() || 'pong';
    console.log('IPC: responding with:', response);
    return response;
  });

  ipcMain.handle('add-example', async (event, message: string) => {
    try {
      console.log('IPC: add-example called with:', message);
      const result = dbManager?.addExample(message);
      console.log('IPC: example added, result:', result);
      return result;
    } catch (error) {
      console.error('Error adding example:', error);
      throw error;
    }
  });

  ipcMain.handle('get-examples', async () => {
    try {
      console.log('IPC: get-examples called');
      const examples = dbManager?.getExamples() || [];
      console.log('IPC: returning examples:', examples);
      return examples;
    } catch (error) {
      console.error('Error getting examples:', error);
      throw error;
    }
  });
};
