import { ipcMain } from 'electron';
import { DatabaseManager } from '../database/database';

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
 * Time entry update data interface for IPC communication.
 */
interface TimeEntryUpdateData {
  date?: string;
  hours?: number;
  taskId?: string;
  notes?: string;
}

/**
 * Sets up database-related IPC handlers
 */
export const setupDatabaseHandlers = (dbManager: DatabaseManager): void => {
  // ==================== PROJECTS ====================

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

  // ==================== TASKS ====================

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

  // ==================== TASK STATUS ====================

  ipcMain.handle('get-task-statuses', async () => {
    try {
      return await dbManager.getTaskStatuses();
    } catch (error) {
      console.error('Error getting task statuses:', error);
      throw error;
    }
  });

  // ==================== TIME ENTRIES ====================

  ipcMain.handle('get-time-entries', async (_event, taskId?: string) => {
    try {
      return await dbManager.getTimeEntries(taskId);
    } catch (error) {
      console.error('Error getting time entries:', error);
      throw error;
    }
  });

  ipcMain.handle('get-pending-time-entries', async () => {
    try {
      return await dbManager.getPendingTimeEntries();
    } catch (error) {
      console.error('Error getting pending time entries:', error);
      throw error;
    }
  });

  ipcMain.handle(
    'create-time-entry',
    async (
      _event,
      date: string,
      hours: number,
      taskId?: string,
      notes?: string,
    ) => {
      try {
        return await dbManager.createTimeEntry(date, hours, taskId, notes);
      } catch (error) {
        console.error('Error creating time entry:', error);
        throw error;
      }
    },
  );

  ipcMain.handle(
    'update-time-entry',
    async (_event, id: string, data: TimeEntryUpdateData) => {
      try {
        return await dbManager.updateTimeEntry(id, data);
      } catch (error) {
        console.error('Error updating time entry:', error);
        throw error;
      }
    },
  );

  ipcMain.handle('delete-time-entry', async (_event, id: string) => {
    try {
      return await dbManager.deleteTimeEntry(id);
    } catch (error) {
      console.error('Error deleting time entry:', error);
      throw error;
    }
  });

  // ==================== WORK PERIODS ====================

  ipcMain.handle('get-work-periods', async () => {
    try {
      return await dbManager.getWorkPeriods();
    } catch (error) {
      console.error('Error getting work periods:', error);
      throw error;
    }
  });

  ipcMain.handle(
    'create-work-period',
    async (
      _event,
      year: number,
      month: number,
      plannedHours: number,
      note?: string,
    ) => {
      try {
        return await dbManager.createWorkPeriod(
          year,
          month,
          plannedHours,
          note,
        );
      } catch (error) {
        console.error('Error creating work period:', error);
        throw error;
      }
    },
  );

  // ==================== TAGS ====================

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

  // ==================== AUDIT LOGS ====================

  ipcMain.handle(
    'get-audit-logs',
    async (_event, entityType?: string, entityId?: string) => {
      try {
        return await dbManager.getAuditLogs(entityType, entityId);
      } catch (error) {
        console.error('Error getting audit logs:', error);
        throw error;
      }
    },
  );
};
