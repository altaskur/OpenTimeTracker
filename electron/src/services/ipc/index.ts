import { DatabaseManager } from '../database/database';
import { BackupService } from '../backup';
import { setupDatabaseHandlers } from './database-handlers';
import { setupThemeHandlers } from './theme-handlers';
import { setupLanguageHandlers } from './language-handlers';
import { setupBackupHandlers } from './backup-handlers';

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
