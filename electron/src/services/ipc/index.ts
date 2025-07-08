import { DatabaseManager } from '../database/database';
import { setupDatabaseHandlers } from './database-handlers';

/**
 * Sets up all IPC handlers
 */
export const setupIpcHandlers = (dbManager: DatabaseManager): void => {
  setupDatabaseHandlers(dbManager);
  
  // Future handlers can be added here:
  // setupAppHandlers();
  // setupFileHandlers();
  // setupSettingsHandlers();
};
