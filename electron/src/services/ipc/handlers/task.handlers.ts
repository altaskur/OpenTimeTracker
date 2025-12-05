import { ipcMain } from 'electron';
import { DatabaseManager } from '../../database/database.js';

/**
 * Task update data interface for IPC communication.
 */
interface TaskUpdateData {
  name?: string;
  description?: string;
  estimatedHours?: number;
  statusId?: string;
  tagIds?: string[];
}

/**
 * Sets up task-related IPC handlers.
 */
export const setupTaskHandlers = (dbManager: DatabaseManager): void => {
  ipcMain.handle('get-tasks', async (_event, projectId?: string) => {
    try {
      return await dbManager.getTasks(projectId);
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  });

  ipcMain.handle(
    'create-task',
    async (
      _event,
      projectId: string,
      name: string,
      description?: string,
      estimatedHours?: number,
      statusId?: string,
      tagIds?: string[],
    ) => {
      try {
        return await dbManager.createTask(
          projectId,
          name,
          description,
          estimatedHours,
          statusId,
          tagIds,
        );
      } catch (error) {
        console.error('Error creating task:', error);
        throw error;
      }
    },
  );

  ipcMain.handle(
    'update-task',
    async (_event, id: string, data: TaskUpdateData) => {
      try {
        return await dbManager.updateTask(id, data);
      } catch (error) {
        console.error('Error updating task:', error);
        throw error;
      }
    },
  );

  ipcMain.handle('delete-task', async (_event, id: string) => {
    try {
      return await dbManager.deleteTask(id);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  });
};
