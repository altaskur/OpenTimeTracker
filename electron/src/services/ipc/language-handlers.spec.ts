import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  type Mock,
  type Mocked,
} from 'vitest';
import { BrowserWindow, ipcMain } from 'electron';
import {
  setupLanguageHandlers,
  getCurrentLanguage,
  setLanguage,
  initializeLanguage,
} from './language-handlers.js';
import { DatabaseManager } from '../database/database.js';

describe('Language Handlers', () => {
  let mockDbManager: Mocked<DatabaseManager>;
  let mockPrisma: {
    appSettings: {
      findUnique: Mock;
      create: Mock;
      upsert: Mock;
    };
  };
  let mockWindow: {
    webContents: {
      send: Mock;
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockPrisma = {
      appSettings: {
        findUnique: vi.fn(),
        create: vi.fn(),
        upsert: vi.fn(),
      },
    };

    mockDbManager = {
      getPrisma: vi.fn().mockReturnValue(mockPrisma),
    } as unknown as Mocked<DatabaseManager>;

    mockWindow = {
      webContents: {
        send: vi.fn(),
      },
    };

    (BrowserWindow.fromWebContents as Mock).mockReturnValue(mockWindow);
  });

  describe('setupLanguageHandlers', () => {
    it('should register IPC handlers', () => {
      setupLanguageHandlers(mockDbManager);

      const handleCalls = (ipcMain.handle as Mock).mock.calls;
      const onCalls = (ipcMain.on as Mock).mock.calls;

      expect(handleCalls.some((call) => call[0] === 'get-language')).toBe(true);
      expect(onCalls.some((call) => call[0] === 'set-language')).toBe(true);
    });
  });

  describe('getCurrentLanguage', () => {
    it('should return current language', () => {
      const result = getCurrentLanguage();
      expect(typeof result).toBe('string');
    });
  });

  describe('setLanguage', () => {
    it('should set language and notify window', async () => {
      setupLanguageHandlers(mockDbManager);
      mockPrisma.appSettings.upsert.mockResolvedValue({
        id: 'app_settings',
        language: 'en',
      });

      await setLanguage(mockWindow as unknown as BrowserWindow, 'en');

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        'language-changed',
        'en',
      );
    });

    it('should save language to database', async () => {
      setupLanguageHandlers(mockDbManager);
      mockPrisma.appSettings.upsert.mockResolvedValue({
        id: 'app_settings',
        language: 'es',
      });

      await setLanguage(mockWindow as unknown as BrowserWindow, 'es');

      expect(mockPrisma.appSettings.upsert).toHaveBeenCalledWith({
        where: { id: 'app_settings' },
        update: { language: 'es' },
        create: { id: 'app_settings', darkMode: true, language: 'es' },
      });
    });
  });

  describe('initializeLanguage', () => {
    it('should return language from database', async () => {
      setupLanguageHandlers(mockDbManager);
      mockPrisma.appSettings.findUnique.mockResolvedValue({
        id: 'app_settings',
        language: 'en',
      });

      const result = await initializeLanguage();

      expect(result).toBe('en');
    });

    it('should create default settings if not found', async () => {
      setupLanguageHandlers(mockDbManager);
      mockPrisma.appSettings.findUnique.mockResolvedValue(null);
      mockPrisma.appSettings.create.mockResolvedValue({
        id: 'app_settings',
        language: 'es',
      });

      const result = await initializeLanguage();

      expect(result).toBe('es');
      expect(mockPrisma.appSettings.create).toHaveBeenCalledWith({
        data: { id: 'app_settings', darkMode: true, language: 'es' },
      });
    });

    it('should return es on database error', async () => {
      setupLanguageHandlers(mockDbManager);
      mockPrisma.appSettings.findUnique.mockRejectedValue(
        new Error('DB error'),
      );

      const result = await initializeLanguage();

      expect(result).toBe('es');
    });
  });

  describe('get-language handler', () => {
    it('should return language from database', async () => {
      setupLanguageHandlers(mockDbManager);
      mockPrisma.appSettings.findUnique.mockResolvedValue({
        id: 'app_settings',
        language: 'en',
      });

      const handleCalls = (ipcMain.handle as Mock).mock.calls;
      const getLanguageHandler = handleCalls.find(
        (call) => call[0] === 'get-language',
      )?.[1];

      const result = await getLanguageHandler();

      expect(result).toBe('en');
    });
  });

  describe('set-language handler', () => {
    it('should set language and notify window', async () => {
      setupLanguageHandlers(mockDbManager);
      mockPrisma.appSettings.upsert.mockResolvedValue({
        id: 'app_settings',
        language: 'en',
      });

      const onCalls = (ipcMain.on as Mock).mock.calls;
      const setLanguageHandler = onCalls.find(
        (call) => call[0] === 'set-language',
      )?.[1];

      await setLanguageHandler({ sender: mockWindow.webContents }, 'en');

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        'language-changed',
        'en',
      );
    });

    it('should handle missing window gracefully', async () => {
      setupLanguageHandlers(mockDbManager);
      mockPrisma.appSettings.upsert.mockResolvedValue({
        id: 'app_settings',
        language: 'en',
      });
      (BrowserWindow.fromWebContents as Mock).mockReturnValue(null);

      const onCalls = (ipcMain.on as Mock).mock.calls;
      const setLanguageHandler = onCalls.find(
        (call) => call[0] === 'set-language',
      )?.[1];

      await setLanguageHandler({ sender: mockWindow.webContents }, 'en');

      expect(mockWindow.webContents.send).not.toHaveBeenCalled();
    });
  });

  describe('saveLanguageToDb error handling', () => {
    it('should log error when database save fails', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      setupLanguageHandlers(mockDbManager);
      mockPrisma.appSettings.upsert.mockRejectedValue(new Error('DB error'));

      await setLanguage(mockWindow as unknown as BrowserWindow, 'en');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error saving language preference:',
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });
});
