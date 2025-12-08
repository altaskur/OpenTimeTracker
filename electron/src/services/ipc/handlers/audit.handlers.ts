import { ipcMain } from 'electron';
import { DatabaseManager } from '../../database/database.js';

/**
 * Sets up audit-related IPC handlers (audit logs and action history).
 */
export const setupAuditHandlers = (dbManager: DatabaseManager): void => {
  // Audit Logs
  ipcMain.handle(
    'get-audit-logs',
    async (_event, entityType?: string, entityId?: string, taskId?: string) => {
      try {
        return await dbManager.getAuditLogs(entityType, entityId, taskId);
      } catch (error) {
        console.error('Error getting audit logs:', error);
        throw error;
      }
    },
  );

  // Action History
  ipcMain.handle(
    'create-action-history',
    async (
      _event,
      entityType: string,
      entityId: string,
      actionType: string,
      description: string,
      previousData?: string,
      newData?: string,
    ) => {
      try {
        return await dbManager.createActionHistory({
          entityType,
          entityId,
          actionType,
          description,
          previousData,
          newData,
        });
      } catch (error) {
        console.error('Error creating action history:', error);
        throw error;
      }
    },
  );

  ipcMain.handle('get-action-history', async (_event, limit?: number) => {
    try {
      return await dbManager.getActionHistory(limit);
    } catch (error) {
      console.error('Error getting action history:', error);
      throw error;
    }
  });

  ipcMain.handle('get-last-undoable-action', async () => {
    try {
      return await dbManager.getLastUndoableAction();
    } catch (error) {
      console.error('Error getting last undoable action:', error);
      throw error;
    }
  });

  ipcMain.handle('get-last-redoable-action', async () => {
    try {
      return await dbManager.getLastRedoableAction();
    } catch (error) {
      console.error('Error getting last redoable action:', error);
      throw error;
    }
  });

  ipcMain.handle('mark-action-undone', async (_event, id: string) => {
    try {
      return await dbManager.markActionUndone(id);
    } catch (error) {
      console.error('Error marking action undone:', error);
      throw error;
    }
  });

  ipcMain.handle('mark-action-redone', async (_event, id: string) => {
    try {
      return await dbManager.markActionRedone(id);
    } catch (error) {
      console.error('Error marking action redone:', error);
      throw error;
    }
  });

  ipcMain.handle('clear-action-history', async () => {
    try {
      return await dbManager.clearActionHistory();
    } catch (error) {
      console.error('Error clearing action history:', error);
      throw error;
    }
  });
};
