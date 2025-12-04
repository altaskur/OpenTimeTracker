import { app } from 'electron';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Determines if the application is running in production (packaged) mode.
 */
export const isPackaged = (): boolean => {
  return app.isPackaged;
};

/**
 * Gets the application root directory.
 * In development: project root/dist folder
 * In production: installation directory (where .exe is located)
 */
export const getAppPath = (): string => {
  if (isPackaged()) {
    return path.dirname(app.getPath('exe'));
  }
  return path.join(__dirname, '..', '..');
};

/**
 * Gets the user data directory path where the database and backups are stored.
 * In production: C:/Users/<user>/OpenTimeTracker (persists across reinstalls)
 * In development: project root/data folder
 */
export const getDataPath = (): string => {
  if (isPackaged()) {
    return path.join(app.getPath('home'), 'OpenTimeTracker');
  }
  return path.join(getAppPath(), 'data');
};

/**
 * Gets the full database file path.
 */
export const getDatabasePath = (): string => {
  return path.join(getDataPath(), 'timetracker.db');
};

/**
 * Gets the backup directory path.
 * Stored in the data folder alongside the database.
 */
export const getBackupPath = (): string => {
  return path.join(getDataPath(), 'backups');
};

/**
 * Gets the path to the Angular index.html file.
 * In development: dist/OpenTimeTracker/browser/index.html
 * In production: resources/app.asar/dist/OpenTimeTracker/browser/index.html
 */
export const getIndexPath = (): string => {
  if (isPackaged()) {
    return path.join(
      path.dirname(app.getPath('exe')),
      'resources',
      'app.asar',
      'dist',
      'OpenTimeTracker',
      'browser',
      'index.html',
    );
  }
  return path.join(
    __dirname,
    '..',
    '..',
    'OpenTimeTracker',
    'browser',
    'index.html',
  );
};

/**
 * Gets the path to the preload script.
 */
export const getPreloadPath = (): string => {
  if (isPackaged()) {
    return path.join(
      path.dirname(app.getPath('exe')),
      'resources',
      'app.asar',
      'dist',
      'electron',
      'preload',
      'preload.js',
    );
  }
  return path.join(__dirname, '..', 'preload', 'preload.js');
};

/**
 * Gets the path to the template database file.
 * Used to initialize a new database with pre-created schema.
 * In development: prisma/template.db
 * In production: resources/app.asar/prisma/template.db
 */
export const getTemplateDatabasePath = (): string => {
  if (isPackaged()) {
    return path.join(
      path.dirname(app.getPath('exe')),
      'resources',
      'app.asar',
      'prisma',
      'template.db',
    );
  }
  return path.join(__dirname, '..', '..', '..', 'prisma', 'template.db');
};
