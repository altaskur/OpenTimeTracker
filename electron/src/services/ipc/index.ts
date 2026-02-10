import { DatabaseManager } from '../database/database.js';
import { BackupService } from '../backup/index.js';
import { UpdateService } from '../update/update.service.js';
import { setupDatabaseHandlers } from './database-handlers.js';
import { setupThemeHandlers } from './theme-handlers.js';
import { setupLanguageHandlers } from './language-handlers.js';
import { setupBackupHandlers } from './backup-handlers.js';
import { setupUpdateHandlers } from './update-handlers.js';

import { setupSystemHandlers } from './system-handlers.js';

/**
 * Sets up all IPC handlers
 */
export const setupIpcHandlers = (
  dbManager: DatabaseManager | null,
  backupService: BackupService | null,
  updateService: UpdateService,
): void => {
  if (dbManager) {
    setupDatabaseHandlers(dbManager);
    setupThemeHandlers(dbManager);
    setupLanguageHandlers(dbManager);
  }
  if (backupService) {
    setupBackupHandlers(backupService);
  }
  setupUpdateHandlers(updateService);
  setupSystemHandlers();
};
