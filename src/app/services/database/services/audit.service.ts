import { Injectable } from '@angular/core';
import {
  ActionHistory,
  AuditLog,
  DeleteResult,
} from '../../../../types/electron';
import { BaseDatabaseService } from '../base-database.service';

/**
 * Service for audit log and action history database operations.
 */
@Injectable({
  providedIn: 'root',
})
export class AuditService extends BaseDatabaseService {
  // Audit Logs
  async getAuditLogs(
    entityType?: string,
    entityId?: string,
    taskId?: string,
  ): Promise<AuditLog[]> {
    return this.executeWithErrorHandling('get audit logs', async () => {
      return globalThis.window.electronAPI.getAuditLogs(
        entityType,
        entityId,
        taskId,
      );
    });
  }

  // Action History
  async getActionHistory(limit?: number): Promise<ActionHistory[]> {
    return this.executeWithErrorHandling('get action history', async () => {
      return globalThis.window.electronAPI.getActionHistory(limit);
    });
  }

  async clearActionHistory(): Promise<DeleteResult> {
    return this.executeWithErrorHandling('clear action history', async () => {
      return globalThis.window.electronAPI.clearActionHistory();
    });
  }
}
