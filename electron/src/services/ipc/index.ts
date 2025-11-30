import { DatabaseManager } from '../database/database';
import { setupDatabaseHandlers } from './database-handlers';
import { setupThemeHandlers } from './theme-handlers';

/**
 * Sets up all IPC handlers
 */
export const setupIpcHandlers = (dbManager: DatabaseManager): void => {
  setupDatabaseHandlers(dbManager);
  setupThemeHandlers(dbManager);
};
