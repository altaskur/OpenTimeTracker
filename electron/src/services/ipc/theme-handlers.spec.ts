import { BrowserWindow, ipcMain } from 'electron';
import {
  setupThemeHandlers,
  getIsDarkMode,
  setDarkMode,
  initializeTheme,
} from './theme-handlers';
import { DatabaseManager } from '../database/database';

jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
  },
  BrowserWindow: {
    fromWebContents: jest.fn(),
  },
}));

describe('Theme Handlers', () => {
  let mockDbManager: jest.Mocked<DatabaseManager>;
  let mockPrisma: {
    appSettings: {
      findUnique: jest.Mock;
      create: jest.Mock;
      upsert: jest.Mock;
    };
  };
  let mockWindow: {
    webContents: {
      send: jest.Mock;
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockPrisma = {
      appSettings: {
        findUnique: jest.fn(),
        create: jest.fn(),
        upsert: jest.fn(),
      },
    };

    mockDbManager = {
      getPrisma: jest.fn().mockReturnValue(mockPrisma),
    } as unknown as jest.Mocked<DatabaseManager>;

    mockWindow = {
      webContents: {
        send: jest.fn(),
      },
    };

    (BrowserWindow.fromWebContents as jest.Mock).mockReturnValue(mockWindow);
  });

  describe('setupThemeHandlers', () => {
    it('should register IPC handlers', () => {
      setupThemeHandlers(mockDbManager);

      const handleCalls = (ipcMain.handle as jest.Mock).mock.calls;
      const onCalls = (ipcMain.on as jest.Mock).mock.calls;

      expect(handleCalls.some((call) => call[0] === 'get-theme')).toBe(true);
      expect(onCalls.some((call) => call[0] === 'toggle-theme')).toBe(true);
      expect(onCalls.some((call) => call[0] === 'set-theme')).toBe(true);
    });
  });

  describe('getIsDarkMode', () => {
    it('should return current dark mode state', () => {
      const result = getIsDarkMode();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('setDarkMode', () => {
    it('should set dark mode and notify window', async () => {
      setupThemeHandlers(mockDbManager);
      mockPrisma.appSettings.upsert.mockResolvedValue({
        id: 'app_settings',
        darkMode: true,
      });

      await setDarkMode(mockWindow as unknown as BrowserWindow, true);

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        'theme-changed',
        true,
      );
    });

    it('should save theme to database', async () => {
      setupThemeHandlers(mockDbManager);
      mockPrisma.appSettings.upsert.mockResolvedValue({
        id: 'app_settings',
        darkMode: false,
      });

      await setDarkMode(mockWindow as unknown as BrowserWindow, false);

      expect(mockPrisma.appSettings.upsert).toHaveBeenCalledWith({
        where: { id: 'app_settings' },
        update: { darkMode: false },
        create: { id: 'app_settings', darkMode: false },
      });
    });
  });

  describe('initializeTheme', () => {
    it('should initialize theme from database', async () => {
      setupThemeHandlers(mockDbManager);
      mockPrisma.appSettings.findUnique.mockResolvedValue({
        id: 'app_settings',
        darkMode: true,
      });

      const result = await initializeTheme();

      expect(result).toBe(true);
    });

    it('should create default settings if not found', async () => {
      setupThemeHandlers(mockDbManager);
      mockPrisma.appSettings.findUnique.mockResolvedValue(null);
      mockPrisma.appSettings.create.mockResolvedValue({
        id: 'app_settings',
        darkMode: true,
      });

      const result = await initializeTheme();

      expect(result).toBe(true);
      expect(mockPrisma.appSettings.create).toHaveBeenCalledWith({
        data: { id: 'app_settings', darkMode: true },
      });
    });

    it('should return true on database error', async () => {
      setupThemeHandlers(mockDbManager);
      mockPrisma.appSettings.findUnique.mockRejectedValue(
        new Error('DB error'),
      );

      const result = await initializeTheme();

      expect(result).toBe(true);
    });
  });

  describe('get-theme handler', () => {
    it('should return theme from database', async () => {
      setupThemeHandlers(mockDbManager);
      mockPrisma.appSettings.findUnique.mockResolvedValue({
        id: 'app_settings',
        darkMode: false,
      });

      const handleCalls = (ipcMain.handle as jest.Mock).mock.calls;
      const getThemeHandler = handleCalls.find(
        (call) => call[0] === 'get-theme',
      )?.[1];

      const result = await getThemeHandler();

      expect(result).toBe(false);
    });
  });

  describe('toggle-theme handler', () => {
    it('should toggle theme and notify window', async () => {
      setupThemeHandlers(mockDbManager);
      mockPrisma.appSettings.upsert.mockResolvedValue({
        id: 'app_settings',
        darkMode: false,
      });

      const onCalls = (ipcMain.on as jest.Mock).mock.calls;
      const toggleHandler = onCalls.find(
        (call) => call[0] === 'toggle-theme',
      )?.[1];

      await toggleHandler({ sender: mockWindow.webContents });

      const sendCall = mockWindow.webContents.send.mock.calls.find(
        (call) => call[0] === 'theme-changed',
      );
      expect(sendCall).toBeDefined();
      expect(typeof sendCall?.[1]).toBe('boolean');
    });
  });

  describe('set-theme handler', () => {
    it('should set theme explicitly', async () => {
      setupThemeHandlers(mockDbManager);
      mockPrisma.appSettings.upsert.mockResolvedValue({
        id: 'app_settings',
        darkMode: true,
      });

      const onCalls = (ipcMain.on as jest.Mock).mock.calls;
      const setThemeHandler = onCalls.find(
        (call) => call[0] === 'set-theme',
      )?.[1];

      await setThemeHandler({ sender: mockWindow.webContents }, true);

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        'theme-changed',
        true,
      );
    });
  });
});
