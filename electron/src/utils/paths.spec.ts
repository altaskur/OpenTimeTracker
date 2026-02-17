import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type Mock,
  type Mocked,
} from 'vitest';
import path from 'node:path';
import { app } from 'electron';
import {
  isPackaged,
  getAppPath,
  getDataPath,
  getDatabasePath,
  getBackupPath,
  getIndexPath,
  getPreloadPath,
  getTemplateDatabasePath,
} from './paths.js';

/**
 * Paths Utility Test Suite
 */
describe('Paths Utility', () => {
  const mockApp = app as Mocked<typeof app>;
  const originalResourcesPath = process.resourcesPath;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock process.resourcesPath for packaged mode tests
    Object.defineProperty(process, 'resourcesPath', {
      value: '/mock/app/resources',
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    // Restore original value
    Object.defineProperty(process, 'resourcesPath', {
      value: originalResourcesPath,
      configurable: true,
      writable: true,
    });
  });

  describe('isPackaged', () => {
    it('should return false in development mode', () => {
      Object.defineProperty(mockApp, 'isPackaged', {
        value: false,
        configurable: true,
      });

      expect(isPackaged()).toBe(false);
    });

    it('should return true in production mode', () => {
      Object.defineProperty(mockApp, 'isPackaged', {
        value: true,
        configurable: true,
      });

      expect(isPackaged()).toBe(true);
    });
  });

  describe('getAppPath', () => {
    it('should return development path when not packaged', () => {
      Object.defineProperty(mockApp, 'isPackaged', {
        value: false,
        configurable: true,
      });

      const result = getAppPath();

      expect(result).toContain('electron');
    });

    it('should return exe directory when packaged', () => {
      Object.defineProperty(mockApp, 'isPackaged', {
        value: true,
        configurable: true,
      });

      const exePath =
        process.platform === 'win32'
          ? 'C:\\Program Files\\OpenTimeTracker\\OpenTimeTracker.exe'
          : '/usr/local/OpenTimeTracker/OpenTimeTracker';

      const expectedDir =
        process.platform === 'win32'
          ? 'C:\\Program Files\\OpenTimeTracker'
          : '/usr/local/OpenTimeTracker';

      (mockApp.getPath as Mock).mockReturnValue(exePath);

      const result = getAppPath();

      expect(mockApp.getPath).toHaveBeenCalledWith('exe');
      expect(result).toBe(expectedDir);
    });
  });

  describe('getDataPath', () => {
    it('should return development data path when not packaged', () => {
      Object.defineProperty(mockApp, 'isPackaged', {
        value: false,
        configurable: true,
      });

      const result = getDataPath();

      expect(result).toContain('data');
    });

    it('should return user home data path when packaged', () => {
      Object.defineProperty(mockApp, 'isPackaged', {
        value: true,
        configurable: true,
      });
      (mockApp.getPath as Mock).mockReturnValue('C:\\Users\\TestUser');

      const result = getDataPath();

      expect(mockApp.getPath).toHaveBeenCalledWith('home');
      expect(result).toBe(path.join('C:\\Users\\TestUser', 'OpenTimeTracker'));
    });
  });

  describe('getDatabasePath', () => {
    it('should return database path in data directory', () => {
      Object.defineProperty(mockApp, 'isPackaged', {
        value: false,
        configurable: true,
      });

      const result = getDatabasePath();

      expect(result).toContain('timetracker.db');
    });
  });

  describe('getBackupPath', () => {
    it('should return backup path in data directory', () => {
      Object.defineProperty(mockApp, 'isPackaged', {
        value: false,
        configurable: true,
      });

      const result = getBackupPath();

      expect(result).toContain('backups');
    });
  });

  describe('getIndexPath', () => {
    it('should return development index path when not packaged', () => {
      Object.defineProperty(mockApp, 'isPackaged', {
        value: false,
        configurable: true,
      });

      const result = getIndexPath();

      expect(result).toContain('OpenTimeTracker');
      expect(result).toContain('renderer');
      expect(result).toContain('index.html');
    });

    it('should return packaged index path when packaged', () => {
      Object.defineProperty(mockApp, 'isPackaged', {
        value: true,
        configurable: true,
      });

      const result = getIndexPath();

      expect(result).toContain('resources');
      expect(result).toContain('app.asar');
      expect(result).toContain('index.html');
    });
  });

  describe('getPreloadPath', () => {
    it('should return development preload path when not packaged', () => {
      Object.defineProperty(mockApp, 'isPackaged', {
        value: false,
        configurable: true,
      });

      const result = getPreloadPath();

      expect(result).toContain('preload');
      expect(result).toContain('preload.js');
    });

    it('should return packaged preload path when packaged', () => {
      Object.defineProperty(mockApp, 'isPackaged', {
        value: true,
        configurable: true,
      });

      const result = getPreloadPath();

      expect(result).toContain('resources');
      expect(result).toContain('app.asar');
      expect(result).toContain('preload.js');
    });
  });

  describe('getTemplateDatabasePath', () => {
    it('should return development template path when not packaged', () => {
      Object.defineProperty(mockApp, 'isPackaged', {
        value: false,
        configurable: true,
      });

      const result = getTemplateDatabasePath();

      expect(result).toContain('prisma');
      expect(result).toContain('template.db');
    });

    it('should return packaged template path when packaged', () => {
      Object.defineProperty(mockApp, 'isPackaged', {
        value: true,
        configurable: true,
      });

      const result = getTemplateDatabasePath();

      expect(result).toContain('resources');
      expect(result).toContain('app.asar.unpacked');
      expect(result).toContain('template.db');
    });
  });
});
