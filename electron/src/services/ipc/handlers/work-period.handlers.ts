import { ipcMain } from 'electron';
import { DatabaseManager } from '../../database/database.js';

/**
 * Sets up work period IPC handlers.
 */
export const setupWorkPeriodHandlers = (dbManager: DatabaseManager): void => {
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
};
