import { ipcMain, BrowserWindow, app } from 'electron';
import { DatabaseManager } from '../database/database';

let dbManager: DatabaseManager | null = null;
let currentLanguage = 'es';

/**
 * Supported languages in the application
 */
const SUPPORTED_LANGUAGES = ['es', 'en'];
const DEFAULT_LANGUAGE = 'es';

/**
 * Gets the system language and maps it to a supported language.
 */
function getSystemLanguage(): string {
  const systemLocale = app.getLocale();
  const langCode = systemLocale.split('-')[0].toLowerCase();

  if (SUPPORTED_LANGUAGES.includes(langCode)) {
    return langCode;
  }

  return DEFAULT_LANGUAGE;
}

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
 * Falls back to system language if no preference is stored.
 */
async function getLanguageFromDb(): Promise<string> {
  if (!dbManager) return getSystemLanguage();

  try {
    const prisma = dbManager.getPrisma();
    const settings = await prisma.appSettings.findUnique({
      where: { id: 'app_settings' },
    });

    if (settings?.language) {
      currentLanguage = settings.language;
      return settings.language;
    }

    const systemLang = getSystemLanguage();
    await prisma.appSettings.create({
      data: { id: 'app_settings', darkMode: true, language: systemLang },
    });
    currentLanguage = systemLang;
    return systemLang;
  } catch {
    return getSystemLanguage();
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
