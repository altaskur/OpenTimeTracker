import { ipcMain } from 'electron';
import { DatabaseManager } from '../../database/database.js';

/**
 * Work config update data interface for IPC communication.
 */
interface WorkConfigUpdateData {
  dailyMinutes?: number;
  weeklyMinutes?: number;
  workDays?: string;
  daySchedule?: string;
}

/**
 * Sets up configuration IPC handlers (work config and month config).
 */
export const setupConfigHandlers = (dbManager: DatabaseManager): void => {
  // Work Config
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

  // Month Config
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
};
