import { ipcMain } from 'electron';
import { DatabaseManager } from '../../database/database.js';

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
 * Sets up day-related IPC handlers (day types and day overrides).
 */
export const setupDayHandlers = (dbManager: DatabaseManager): void => {
  // Day Types
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

  // Day Overrides
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
};
