import { ipcMain } from 'electron';
import { DatabaseManager } from '../../database/database.js';

/**
 * Sets up task status IPC handlers.
 */
export const setupTaskStatusHandlers = (dbManager: DatabaseManager): void => {
  ipcMain.handle('get-task-statuses', async () => {
    try {
      return await dbManager.getTaskStatuses();
    } catch (error) {
      console.error('Error getting task statuses:', error);
      throw error;
    }
  });

  ipcMain.handle(
    'create-task-status',
    async (_event, name: string, color: string) => {
      try {
        return await dbManager.createTaskStatus(name, color);
      } catch (error) {
        console.error('Error creating task status:', error);
        throw error;
      }
    },
  );

  ipcMain.handle(
    'update-task-status',
    async (_event, id: string, name: string, color: string) => {
      try {
        return await dbManager.updateTaskStatus(id, name, color);
      } catch (error) {
        console.error('Error updating task status:', error);
        throw error;
      }
    },
  );

  ipcMain.handle('delete-task-status', async (_event, id: string) => {
    try {
      return await dbManager.deleteTaskStatus(id);
    } catch (error) {
      console.error('Error deleting task status:', error);
      throw error;
    }
  });
};
