import { DatabaseManager } from '../database/database.js';
import {
  setupProjectHandlers,
  setupTaskHandlers,
  setupTaskStatusHandlers,
  setupTimeEntryHandlers,
  setupWorkPeriodHandlers,
  setupConfigHandlers,
  setupDayHandlers,
  setupTagHandlers,
  setupAuditHandlers,
} from './handlers/index.js';

/**
 * Sets up all database-related IPC handlers.
 * Delegates to domain-specific handler modules.
 */
export const setupDatabaseHandlers = (dbManager: DatabaseManager): void => {
  setupProjectHandlers(dbManager);
  setupTaskHandlers(dbManager);
  setupTaskStatusHandlers(dbManager);
  setupTimeEntryHandlers(dbManager);
  setupWorkPeriodHandlers(dbManager);
  setupConfigHandlers(dbManager);
  setupDayHandlers(dbManager);
  setupTagHandlers(dbManager);
  setupAuditHandlers(dbManager);
};
