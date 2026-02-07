import { DatabaseManager } from '../database/database.js';
import { BackupService } from '../backup/index.js';
import { setupDatabaseHandlers } from './database-handlers.js';
import { setupThemeHandlers } from './theme-handlers.js';
import { setupLanguageHandlers } from './language-handlers.js';
import { setupBackupHandlers } from './backup-handlers.js';

/**
 * Sets up all IPC handlers
 */
export const setupIpcHandlers = (
  dbManager: DatabaseManager,
  backupService?: BackupService,
): void => {
  setupDatabaseHandlers(dbManager);
  setupThemeHandlers(dbManager);
  setupLanguageHandlers(dbManager);
  if (backupService) {
    setupBackupHandlers(backupService);
  }
};
