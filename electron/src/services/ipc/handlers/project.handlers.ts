import { ipcMain } from 'electron';
import { DatabaseManager } from '../../database/database.js';

/**
 * Sets up project-related IPC handlers.
 */
export const setupProjectHandlers = (dbManager: DatabaseManager): void => {
  ipcMain.handle('get-projects', async () => {
    try {
      return await dbManager.getProjects();
    } catch (error) {
      console.error('Error getting projects:', error);
      throw error;
    }
  });

  ipcMain.handle(
    'create-project',
    async (_event, name: string, description?: string) => {
      try {
        return await dbManager.createProject(name, description);
      } catch (error) {
        console.error('Error creating project:', error);
        throw error;
      }
    },
  );

  ipcMain.handle(
    'update-project',
    async (_event, id: string, name: string, description?: string) => {
      try {
        return await dbManager.updateProject(id, name, description);
      } catch (error) {
        console.error('Error updating project:', error);
        throw error;
      }
    },
  );

  ipcMain.handle('delete-project', async (_event, id: string) => {
    try {
      return await dbManager.deleteProject(id);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  });

  ipcMain.handle('can-close-project', async (_event, id: string) => {
    try {
      return await dbManager.canCloseProject(id);
    } catch (error) {
      console.error('Error checking if project can be closed:', error);
      throw error;
    }
  });

  ipcMain.handle('close-project', async (_event, id: string) => {
    try {
      return await dbManager.closeProject(id);
    } catch (error) {
      console.error('Error closing project:', error);
      throw error;
    }
  });

  ipcMain.handle('reopen-project', async (_event, id: string) => {
    try {
      return await dbManager.reopenProject(id);
    } catch (error) {
      console.error('Error reopening project:', error);
      throw error;
    }
  });
};
