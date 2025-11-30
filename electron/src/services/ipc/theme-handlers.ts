import { ipcMain, BrowserWindow } from 'electron';
import { DatabaseManager } from '../database/database';

let dbManager: DatabaseManager | null = null;
let isDarkMode = true;

/**
 * Sets up theme-related IPC handlers.
 * Manages dark mode toggle between main and renderer processes.
 */
export const setupThemeHandlers = (db: DatabaseManager): void => {
  dbManager = db;

  ipcMain.handle('get-theme', async () => {
    return getThemeFromDb();
  });

  ipcMain.on('toggle-theme', async (event) => {
    isDarkMode = !isDarkMode;
    await saveThemeToDb(isDarkMode);
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.webContents.send('theme-changed', isDarkMode);
    }
  });

  ipcMain.on('set-theme', async (event, dark: boolean) => {
    isDarkMode = dark;
    await saveThemeToDb(isDarkMode);
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.webContents.send('theme-changed', isDarkMode);
    }
  });
};

/**
 * Gets theme preference from database.
 */
async function getThemeFromDb(): Promise<boolean> {
  if (!dbManager) return true;

  try {
    const prisma = dbManager.getPrisma();
    const settings = await prisma.appSettings.findUnique({
      where: { id: 'app_settings' },
    });

    if (settings) {
      isDarkMode = settings.darkMode;
      return settings.darkMode;
    }

    await prisma.appSettings.create({
      data: { id: 'app_settings', darkMode: true },
    });
    isDarkMode = true;
    return true;
  } catch {
    return true;
  }
}

/**
 * Saves theme preference to database.
 */
async function saveThemeToDb(dark: boolean): Promise<void> {
  if (!dbManager) return;

  try {
    const prisma = dbManager.getPrisma();
    await prisma.appSettings.upsert({
      where: { id: 'app_settings' },
      update: { darkMode: dark },
      create: { id: 'app_settings', darkMode: dark },
    });
  } catch (error) {
    console.error('Error saving theme preference:', error);
  }
}

/**
 * Gets the current dark mode state.
 */
export const getIsDarkMode = (): boolean => isDarkMode;

/**
 * Sets the dark mode state and notifies the window.
 */
export const setDarkMode = async (
  window: BrowserWindow,
  dark: boolean,
): Promise<void> => {
  isDarkMode = dark;
  await saveThemeToDb(dark);
  window.webContents.send('theme-changed', isDarkMode);
};

/**
 * Initializes theme from database.
 */
export const initializeTheme = async (): Promise<boolean> => {
  return getThemeFromDb();
};
