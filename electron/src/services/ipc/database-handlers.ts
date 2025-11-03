import { ipcMain } from 'electron';
import { DatabaseManager } from '../database/database';

/**
 * Sets up database-related IPC handlers
 */
export const setupDatabaseHandlers = (dbManager: DatabaseManager): void => {
  // ==================== PROJECTS ====================

  ipcMain.handle('get-projects', async () => {
    try {
      return dbManager.getProjects();
    } catch (error) {
      console.error('Error getting projects:', error);
      throw error;
    }
  });

  ipcMain.handle(
    'create-project',
    async (event, name: string, description?: string) => {
      try {
        return dbManager.createProject(name, description);
      } catch (error) {
        console.error('Error creating project:', error);
        throw error;
      }
    }
  );

  ipcMain.handle(
    'update-project',
    async (event, id: string, name: string, description?: string) => {
      try {
        return dbManager.updateProject(id, name, description);
      } catch (error) {
        console.error('Error updating project:', error);
        throw error;
      }
    }
  );

  ipcMain.handle('delete-project', async (event, id: string) => {
    try {
      return dbManager.deleteProject(id);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  });

  // ==================== TASKS ====================

  ipcMain.handle('get-tasks', async (event, projectId?: string) => {
    try {
      return dbManager.getTasks(projectId);
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  });

  ipcMain.handle(
    'create-task',
    async (
      event,
      projectId: string,
      name: string,
      description?: string,
      estimatedHours?: number,
      statusId?: string
    ) => {
      try {
        return dbManager.createTask(
          projectId,
          name,
          description,
          estimatedHours,
          statusId
        );
      } catch (error) {
        console.error('Error creating task:', error);
        throw error;
      }
    }
  );

  ipcMain.handle('update-task', async (event, id: string, data: any) => {
    try {
      return dbManager.updateTask(id, data);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  });

  ipcMain.handle('delete-task', async (event, id: string) => {
    try {
      return dbManager.deleteTask(id);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  });

  // ==================== TASK STATUS ====================

  ipcMain.handle('get-task-statuses', async () => {
    try {
      return dbManager.getTaskStatuses();
    } catch (error) {
      console.error('Error getting task statuses:', error);
      throw error;
    }
  });

  // ==================== TIME ENTRIES ====================

  ipcMain.handle('get-time-entries', async (event, taskId?: string) => {
    try {
      return dbManager.getTimeEntries(taskId);
    } catch (error) {
      console.error('Error getting time entries:', error);
      throw error;
    }
  });

  ipcMain.handle('get-pending-time-entries', async () => {
    try {
      return dbManager.getPendingTimeEntries();
    } catch (error) {
      console.error('Error getting pending time entries:', error);
      throw error;
    }
  });

  ipcMain.handle(
    'create-time-entry',
    async (
      event,
      date: string,
      hours: number,
      taskId?: string,
      notes?: string
    ) => {
      try {
        return dbManager.createTimeEntry(date, hours, taskId, notes);
      } catch (error) {
        console.error('Error creating time entry:', error);
        throw error;
      }
    }
  );

  ipcMain.handle('update-time-entry', async (event, id: string, data: any) => {
    try {
      return dbManager.updateTimeEntry(id, data);
    } catch (error) {
      console.error('Error updating time entry:', error);
      throw error;
    }
  });

  ipcMain.handle('delete-time-entry', async (event, id: string) => {
    try {
      return dbManager.deleteTimeEntry(id);
    } catch (error) {
      console.error('Error deleting time entry:', error);
      throw error;
    }
  });

  // ==================== WORK PERIODS ====================

  ipcMain.handle('get-work-periods', async () => {
    try {
      return dbManager.getWorkPeriods();
    } catch (error) {
      console.error('Error getting work periods:', error);
      throw error;
    }
  });

  ipcMain.handle(
    'create-work-period',
    async (
      event,
      year: number,
      month: number,
      plannedHours: number,
      note?: string
    ) => {
      try {
        return dbManager.createWorkPeriod(year, month, plannedHours, note);
      } catch (error) {
        console.error('Error creating work period:', error);
        throw error;
      }
    }
  );
};
