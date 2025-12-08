import { ipcMain } from 'electron';
import { DatabaseManager } from '../../database/database.js';

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
 * Sets up time entry IPC handlers.
 */
export const setupTimeEntryHandlers = (dbManager: DatabaseManager): void => {
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
};
