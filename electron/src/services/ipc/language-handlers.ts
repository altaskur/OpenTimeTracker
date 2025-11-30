import { ipcMain, BrowserWindow } from 'electron';
import { DatabaseManager } from '../database/database';

let dbManager: DatabaseManager | null = null;
let currentLanguage = 'es';

/**
 * Sets up language-related IPC handlers.
 * Manages language switching between main and renderer processes.
 */
export const setupLanguageHandlers = (db: DatabaseManager): void => {
  dbManager = db;

  ipcMain.handle('get-language', async () => {
    return getLanguageFromDb();
  });

  ipcMain.on('set-language', async (event, lang: string) => {
    currentLanguage = lang;
    await saveLanguageToDb(lang);
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.webContents.send('language-changed', lang);
    }
  });
};

/**
 * Gets language preference from database.
 */
async function getLanguageFromDb(): Promise<string> {
  if (!dbManager) return 'es';

  try {
    const prisma = dbManager.getPrisma();
    const settings = await prisma.appSettings.findUnique({
      where: { id: 'app_settings' },
    });

    if (settings) {
      currentLanguage = settings.language;
      return settings.language;
    }

    await prisma.appSettings.create({
      data: { id: 'app_settings', darkMode: true, language: 'es' },
    });
    currentLanguage = 'es';
    return 'es';
  } catch {
    return 'es';
  }
}

/**
 * Saves language preference to database.
 */
async function saveLanguageToDb(lang: string): Promise<void> {
  if (!dbManager) return;

  try {
    const prisma = dbManager.getPrisma();
    await prisma.appSettings.upsert({
      where: { id: 'app_settings' },
      update: { language: lang },
      create: { id: 'app_settings', darkMode: true, language: lang },
    });
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
}

/**
 * Gets the current language.
 */
export const getCurrentLanguage = (): string => currentLanguage;

/**
 * Sets the language and notifies the window.
 */
export const setLanguage = async (
  window: BrowserWindow,
  lang: string,
): Promise<void> => {
  currentLanguage = lang;
  await saveLanguageToDb(lang);
  window.webContents.send('language-changed', lang);
};

/**
 * Initializes language from database.
 */
export const initializeLanguage = async (): Promise<string> => {
  return getLanguageFromDb();
};
