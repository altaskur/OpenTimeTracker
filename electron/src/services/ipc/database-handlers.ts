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
  minutes?: number;
  taskId?: string;
  notes?: string;
}

/**
 * Work config update data interface for IPC communication.
 */
interface WorkConfigUpdateData {
  dailyMinutes?: number;
  weeklyMinutes?: number;
  workDays?: string;
}

/**
 * Day type update data interface for IPC communication.
 */
interface DayTypeUpdateData {
  name?: string;
  color?: string;
  defaultMinutes?: number;
}

/**
 * Day override update data interface for IPC communication.
 */
interface DayOverrideUpdateData {
  dayTypeId?: string;
  minutes?: number;
  note?: string;
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

  // ==================== TIME ENTRIES ====================

  ipcMain.handle('get-time-entries', async (_event, taskId?: string) => {
    try {
      return await dbManager.getTimeEntries(taskId);
    } catch (error) {
      console.error('Error getting time entries:', error);
      throw error;
    }
  });

  ipcMain.handle(
    'get-time-entries-by-date-range',
    async (_event, startDate: string, endDate: string) => {
      try {
        return await dbManager.getTimeEntriesByDateRange(startDate, endDate);
      } catch (error) {
        console.error('Error getting time entries by date range:', error);
        throw error;
      }
    },
  );

  ipcMain.handle('get-time-entries-by-date', async (_event, date: string) => {
    try {
      return await dbManager.getTimeEntriesByDate(date);
    } catch (error) {
      console.error('Error getting time entries by date:', error);
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
      minutes: number,
      taskId?: string,
      notes?: string,
    ) => {
      try {
        return await dbManager.createTimeEntry(date, minutes, taskId, notes);
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
    'get-work-period',
    async (_event, year: number, month: number) => {
      try {
        return await dbManager.getWorkPeriod(year, month);
      } catch (error) {
        console.error('Error getting work period:', error);
        throw error;
      }
    },
  );

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

  ipcMain.handle(
    'update-work-period',
    async (
      _event,
      year: number,
      month: number,
      data: { plannedHours?: number; note?: string },
    ) => {
      try {
        return await dbManager.updateWorkPeriod(year, month, data);
      } catch (error) {
        console.error('Error updating work period:', error);
        throw error;
      }
    },
  );

  ipcMain.handle(
    'upsert-work-period',
    async (
      _event,
      year: number,
      month: number,
      plannedHours: number,
      note?: string,
    ) => {
      try {
        return await dbManager.upsertWorkPeriod(
          year,
          month,
          plannedHours,
          note,
        );
      } catch (error) {
        console.error('Error upserting work period:', error);
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

  // ==================== WORK CONFIG ====================

  ipcMain.handle('get-work-config', async () => {
    try {
      return await dbManager.getWorkConfig();
    } catch (error) {
      console.error('Error getting work config:', error);
      throw error;
    }
  });

  ipcMain.handle(
    'update-work-config',
    async (_event, data: WorkConfigUpdateData) => {
      try {
        return await dbManager.updateWorkConfig(data);
      } catch (error) {
        console.error('Error updating work config:', error);
        throw error;
      }
    },
  );

  // ==================== MONTH CONFIG ====================

  ipcMain.handle(
    'get-month-config',
    async (_event, year: number, month: number) => {
      try {
        return await dbManager.getMonthConfig(year, month);
      } catch (error) {
        console.error('Error getting month config:', error);
        throw error;
      }
    },
  );

  ipcMain.handle(
    'update-month-config',
    async (
      _event,
      year: number,
      month: number,
      data: { weeklyMinutes?: number; workDays?: string; daySchedule?: string },
    ) => {
      try {
        return await dbManager.updateMonthConfig(year, month, data);
      } catch (error) {
        console.error('Error updating month config:', error);
        throw error;
      }
    },
  );

  // ==================== DAY TYPES ====================

  ipcMain.handle('get-day-types', async () => {
    try {
      return await dbManager.getDayTypes();
    } catch (error) {
      console.error('Error getting day types:', error);
      throw error;
    }
  });

  ipcMain.handle(
    'create-day-type',
    async (_event, name: string, color: string, defaultMinutes?: number) => {
      try {
        return await dbManager.createDayType(name, color, defaultMinutes);
      } catch (error) {
        console.error('Error creating day type:', error);
        throw error;
      }
    },
  );

  ipcMain.handle(
    'update-day-type',
    async (_event, id: string, data: DayTypeUpdateData) => {
      try {
        return await dbManager.updateDayType(id, data);
      } catch (error) {
        console.error('Error updating day type:', error);
        throw error;
      }
    },
  );

  ipcMain.handle('delete-day-type', async (_event, id: string) => {
    try {
      return await dbManager.deleteDayType(id);
    } catch (error) {
      console.error('Error deleting day type:', error);
      throw error;
    }
  });

  // ==================== DAY OVERRIDES ====================

  ipcMain.handle(
    'get-day-overrides',
    async (_event, startDate?: string, endDate?: string) => {
      try {
        return await dbManager.getDayOverrides(startDate, endDate);
      } catch (error) {
        console.error('Error getting day overrides:', error);
        throw error;
      }
    },
  );

  ipcMain.handle('get-day-override', async (_event, date: string) => {
    try {
      return await dbManager.getDayOverride(date);
    } catch (error) {
      console.error('Error getting day override:', error);
      throw error;
    }
  });

  ipcMain.handle(
    'create-day-override',
    async (
      _event,
      date: string,
      dayTypeId?: string,
      minutes?: number,
      note?: string,
    ) => {
      try {
        return await dbManager.createDayOverride(
          date,
          dayTypeId,
          minutes,
          note,
        );
      } catch (error) {
        console.error('Error creating day override:', error);
        throw error;
      }
    },
  );

  ipcMain.handle(
    'update-day-override',
    async (_event, id: string, data: DayOverrideUpdateData) => {
      try {
        return await dbManager.updateDayOverride(id, data);
      } catch (error) {
        console.error('Error updating day override:', error);
        throw error;
      }
    },
  );

  ipcMain.handle(
    'upsert-day-override',
    async (
      _event,
      date: string,
      dayTypeId?: string,
      minutes?: number,
      note?: string,
    ) => {
      try {
        return await dbManager.upsertDayOverride(
          date,
          dayTypeId,
          minutes,
          note,
        );
      } catch (error) {
        console.error('Error upserting day override:', error);
        throw error;
      }
    },
  );

  ipcMain.handle('delete-day-override', async (_event, date: string) => {
    try {
      return await dbManager.deleteDayOverride(date);
    } catch (error) {
      console.error('Error deleting day override:', error);
      throw error;
    }
  });

  // ==================== AUDIT LOGS ====================

  ipcMain.handle(
    'get-audit-logs',
    async (_event, entityType?: string, entityId?: string, taskId?: string) => {
      try {
        return await dbManager.getAuditLogs(entityType, entityId, taskId);
      } catch (error) {
        console.error('Error getting audit logs:', error);
        throw error;
      }
    },
  );

  // ==================== ACTION HISTORY ====================

  ipcMain.handle(
    'create-action-history',
    async (
      _event,
      entityType: string,
      entityId: string,
      actionType: string,
      description: string,
      previousData?: string,
      newData?: string,
    ) => {
      try {
        return await dbManager.createActionHistory({
          entityType,
          entityId,
          actionType,
          description,
          previousData,
          newData,
        });
      } catch (error) {
        console.error('Error creating action history:', error);
        throw error;
      }
    },
  );

  ipcMain.handle('get-action-history', async (_event, limit?: number) => {
    try {
      return await dbManager.getActionHistory(limit);
    } catch (error) {
      console.error('Error getting action history:', error);
      throw error;
    }
  });

  ipcMain.handle('get-last-undoable-action', async () => {
    try {
      return await dbManager.getLastUndoableAction();
    } catch (error) {
      console.error('Error getting last undoable action:', error);
      throw error;
    }
  });

  ipcMain.handle('get-last-redoable-action', async () => {
    try {
      return await dbManager.getLastRedoableAction();
    } catch (error) {
      console.error('Error getting last redoable action:', error);
      throw error;
    }
  });

  ipcMain.handle('mark-action-undone', async (_event, id: string) => {
    try {
      return await dbManager.markActionUndone(id);
    } catch (error) {
      console.error('Error marking action undone:', error);
      throw error;
    }
  });

  ipcMain.handle('mark-action-redone', async (_event, id: string) => {
    try {
      return await dbManager.markActionRedone(id);
    } catch (error) {
      console.error('Error marking action redone:', error);
      throw error;
    }
  });

  ipcMain.handle('clear-action-history', async () => {
    try {
      return await dbManager.clearActionHistory();
    } catch (error) {
      console.error('Error clearing action history:', error);
      throw error;
    }
  });
};
