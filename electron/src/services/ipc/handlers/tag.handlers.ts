import { ipcMain } from 'electron';
import { DatabaseManager } from '../../database/database.js';

/**
 * Sets up tag-related IPC handlers.
 */
export const setupTagHandlers = (dbManager: DatabaseManager): void => {
  ipcMain.handle('get-tags', async () => {
    try {
      return await dbManager.getTags();
    } catch (error) {
      console.error('Error getting tags:', error);
      throw error;
    }
  });

  ipcMain.handle('create-tag', async (_event, name: string) => {
    try {
      return await dbManager.createTag(name);
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  });

  ipcMain.handle('update-tag', async (_event, id: string, name: string) => {
    try {
      return await dbManager.updateTag(id, name);
    } catch (error) {
      console.error('Error updating tag:', error);
      throw error;
    }
  });

  ipcMain.handle('delete-tag', async (_event, id: string) => {
    try {
      return await dbManager.deleteTag(id);
    } catch (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }
  });

  ipcMain.handle(
    'add-tag-to-task',
    async (_event, taskId: string, tagId: string) => {
      try {
        return await dbManager.addTagToTask(taskId, tagId);
      } catch (error) {
        console.error('Error adding tag to task:', error);
        throw error;
      }
    },
  );

  ipcMain.handle(
    'remove-tag-from-task',
    async (_event, taskId: string, tagId: string) => {
      try {
        return await dbManager.removeTagFromTask(taskId, tagId);
      } catch (error) {
        console.error('Error removing tag from task:', error);
        throw error;
      }
    },
  );
};
