import { ipcMain } from 'electron';
import { DatabaseManager } from '../database/database.js';

let dbManager: DatabaseManager | null = null;

/**
 * Sets up auto-check updates related IPC handlers.
 * Manages auto-check preference in app_settings table.
 */
export const setupAutoCheckUpdatesHandlers = (db: DatabaseManager): void => {
  dbManager = db;

  ipcMain.handle('get-auto-check-updates', async () => {
    return getAutoCheckUpdatesFromDb();
  });

  ipcMain.handle('set-auto-check-updates', async (_event, value: boolean) => {
    return saveAutoCheckUpdatesToDb(value);
  });
};

/**
 * Gets auto-check updates preference from database.
 * Defaults to true if no setting exists.
 */
async function getAutoCheckUpdatesFromDb(): Promise<boolean> {
  if (!dbManager) return true;

  try {
    const prisma = dbManager.getPrisma();
    const settings = await prisma.appSettings.findUnique({
      where: { id: 'app_settings' },
    });

    if (settings) {
      return settings.autoCheckUpdates;
    }

    // Create default settings if not found
    await prisma.appSettings.create({
      data: { id: 'app_settings', autoCheckUpdates: true },
    });
    return true;
  } catch (error) {
    console.error('Error getting auto-check updates preference:', error);
    return true;
  }
}

/**
 * Saves auto-check updates preference to database.
 */
async function saveAutoCheckUpdatesToDb(value: boolean): Promise<void> {
  if (!dbManager) return;

  try {
    const prisma = dbManager.getPrisma();
    await prisma.appSettings.upsert({
      where: { id: 'app_settings' },
      update: { autoCheckUpdates: value },
      create: { id: 'app_settings', autoCheckUpdates: value },
    });
  } catch (error) {
    console.error('Error saving auto-check updates preference:', error);
    throw error;
  }
}
