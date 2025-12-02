import { Injectable, signal } from '@angular/core';
import {
  ActionHistory,
  AuditLog,
  DayOverride,
  DayType,
  DeleteResult,
  MonthConfig,
  Project,
  Tag,
  Task,
  TaskStatus,
  TimeEntry,
  WorkConfig,
  WorkPeriod,
} from '../../../types/electron';
import { ElectronApiError } from '../errors/electron-api-error';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  readonly lastError = signal<ElectronApiError | null>(null);
  readonly isElectronAvailable = signal<boolean>(
    !!globalThis.window?.electronAPI,
  );

  private ensureElectronApi(operation: string): void {
    if (!globalThis.window?.electronAPI) {
      const error = new ElectronApiError(
        'Electron API not available. Are you running in Electron?',
        operation,
      );
      this.lastError.set(error);
      throw error;
    }
  }

  private async executeWithErrorHandling<T>(
    operation: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    this.lastError.set(null);
    try {
      this.ensureElectronApi(operation);
      return await fn();
    } catch (error) {
      const wrappedError =
        error instanceof ElectronApiError
          ? error
          : new ElectronApiError(`Failed to ${operation}`, operation, error);
      this.lastError.set(wrappedError);
      throw wrappedError;
    }
  }

  // ==================== PROJECTS ====================

  async getProjects(): Promise<Project[]> {
    return this.executeWithErrorHandling('get projects', async () => {
      return globalThis.window.electronAPI.getProjects();
    });
  }

  async createProject(name: string, description?: string): Promise<Project> {
    return this.executeWithErrorHandling('create project', async () => {
      return globalThis.window.electronAPI.createProject(name, description);
    });
  }

  async updateProject(
    id: string,
    name: string,
    description?: string,
  ): Promise<Project> {
    return this.executeWithErrorHandling('update project', async () => {
      return globalThis.window.electronAPI.updateProject(id, name, description);
    });
  }

  async deleteProject(id: string): Promise<DeleteResult> {
    return this.executeWithErrorHandling('delete project', async () => {
      return globalThis.window.electronAPI.deleteProject(id);
    });
  }

  async canCloseProject(id: string): Promise<boolean> {
    return this.executeWithErrorHandling(
      'check if project can close',
      async () => {
        return globalThis.window.electronAPI.canCloseProject(id);
      },
    );
  }

  async closeProject(id: string): Promise<Project> {
    return this.executeWithErrorHandling('close project', async () => {
      return globalThis.window.electronAPI.closeProject(id);
    });
  }

  async reopenProject(id: string): Promise<Project> {
    return this.executeWithErrorHandling('reopen project', async () => {
      return globalThis.window.electronAPI.reopenProject(id);
    });
  }

  // ==================== TASKS ====================

  async getTasks(projectId?: string): Promise<Task[]> {
    return this.executeWithErrorHandling('get tasks', async () => {
      return globalThis.window.electronAPI.getTasks(projectId);
    });
  }

  async createTask(
    projectId: string,
    name: string,
    description?: string,
    estimatedHours?: number,
    statusId?: string,
    tagIds?: string[],
  ): Promise<Task> {
    return this.executeWithErrorHandling('create task', async () => {
      return globalThis.window.electronAPI.createTask(
        projectId,
        name,
        description,
        estimatedHours,
        statusId,
        tagIds,
      );
    });
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    return this.executeWithErrorHandling('update task', async () => {
      return globalThis.window.electronAPI.updateTask(id, data);
    });
  }

  async deleteTask(id: string): Promise<DeleteResult> {
    return this.executeWithErrorHandling('delete task', async () => {
      return globalThis.window.electronAPI.deleteTask(id);
    });
  }

  // ==================== TASK STATUSES ====================

  async getTaskStatuses(): Promise<TaskStatus[]> {
    return this.executeWithErrorHandling('get task statuses', async () => {
      return globalThis.window.electronAPI.getTaskStatuses();
    });
  }

  async createTaskStatus(name: string, color: string): Promise<TaskStatus> {
    return this.executeWithErrorHandling('create task status', async () => {
      return globalThis.window.electronAPI.createTaskStatus(name, color);
    });
  }

  async updateTaskStatus(
    id: string,
    name: string,
    color: string,
  ): Promise<TaskStatus> {
    return this.executeWithErrorHandling('update task status', async () => {
      return globalThis.window.electronAPI.updateTaskStatus(id, name, color);
    });
  }

  async deleteTaskStatus(id: string): Promise<TaskStatus | null> {
    return this.executeWithErrorHandling('delete task status', async () => {
      return globalThis.window.electronAPI.deleteTaskStatus(id);
    });
  }

  // ==================== TIME ENTRIES ====================

  async getTimeEntries(taskId?: string): Promise<TimeEntry[]> {
    return this.executeWithErrorHandling('get time entries', async () => {
      return globalThis.window.electronAPI.getTimeEntries(taskId);
    });
  }

  async getTimeEntriesByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<TimeEntry[]> {
    return this.executeWithErrorHandling(
      'get time entries by date range',
      async () => {
        return globalThis.window.electronAPI.getTimeEntriesByDateRange(
          startDate,
          endDate,
        );
      },
    );
  }

  async getTimeEntriesByDate(date: string): Promise<TimeEntry[]> {
    return this.executeWithErrorHandling(
      'get time entries by date',
      async () => {
        return globalThis.window.electronAPI.getTimeEntriesByDate(date);
      },
    );
  }

  async getPendingTimeEntries(): Promise<TimeEntry[]> {
    return this.executeWithErrorHandling(
      'get pending time entries',
      async () => {
        return globalThis.window.electronAPI.getPendingTimeEntries();
      },
    );
  }

  async createTimeEntry(
    date: string,
    minutes: number,
    taskId?: string,
    notes?: string,
  ): Promise<TimeEntry> {
    return this.executeWithErrorHandling('create time entry', async () => {
      return globalThis.window.electronAPI.createTimeEntry(
        date,
        minutes,
        taskId,
        notes,
      );
    });
  }

  async updateTimeEntry(
    id: string,
    data: Partial<TimeEntry>,
  ): Promise<TimeEntry> {
    return this.executeWithErrorHandling('update time entry', async () => {
      return globalThis.window.electronAPI.updateTimeEntry(id, data);
    });
  }

  async deleteTimeEntry(id: string): Promise<DeleteResult> {
    return this.executeWithErrorHandling('delete time entry', async () => {
      return globalThis.window.electronAPI.deleteTimeEntry(id);
    });
  }

  // ==================== WORK PERIODS ====================

  async getWorkPeriods(): Promise<WorkPeriod[]> {
    return this.executeWithErrorHandling('get work periods', async () => {
      return globalThis.window.electronAPI.getWorkPeriods();
    });
  }

  async getWorkPeriod(year: number, month: number): Promise<WorkPeriod | null> {
    return this.executeWithErrorHandling('get work period', async () => {
      return globalThis.window.electronAPI.getWorkPeriod(year, month);
    });
  }

  async createWorkPeriod(
    year: number,
    month: number,
    plannedHours: number,
    note?: string,
  ): Promise<WorkPeriod> {
    return this.executeWithErrorHandling('create work period', async () => {
      return globalThis.window.electronAPI.createWorkPeriod(
        year,
        month,
        plannedHours,
        note,
      );
    });
  }

  async updateWorkPeriod(
    year: number,
    month: number,
    data: { plannedHours?: number; note?: string },
  ): Promise<WorkPeriod> {
    return this.executeWithErrorHandling('update work period', async () => {
      return globalThis.window.electronAPI.updateWorkPeriod(year, month, data);
    });
  }

  async upsertWorkPeriod(
    year: number,
    month: number,
    plannedHours: number,
    note?: string,
  ): Promise<WorkPeriod> {
    return this.executeWithErrorHandling('upsert work period', async () => {
      return globalThis.window.electronAPI.upsertWorkPeriod(
        year,
        month,
        plannedHours,
        note,
      );
    });
  }

  // ==================== WORK CONFIG ====================

  async getWorkConfig(): Promise<WorkConfig> {
    return this.executeWithErrorHandling('get work config', async () => {
      return globalThis.window.electronAPI.getWorkConfig();
    });
  }

  async updateWorkConfig(data: Partial<WorkConfig>): Promise<WorkConfig> {
    return this.executeWithErrorHandling('update work config', async () => {
      return globalThis.window.electronAPI.updateWorkConfig(data);
    });
  }

  // ==================== MONTH CONFIG ====================

  async getMonthConfig(year: number, month: number): Promise<MonthConfig> {
    return this.executeWithErrorHandling('get month config', async () => {
      return globalThis.window.electronAPI.getMonthConfig(year, month);
    });
  }

  async updateMonthConfig(
    year: number,
    month: number,
    data: Partial<MonthConfig>,
  ): Promise<MonthConfig> {
    return this.executeWithErrorHandling('update month config', async () => {
      return globalThis.window.electronAPI.updateMonthConfig(year, month, data);
    });
  }

  // ==================== DAY TYPES ====================

  async getDayTypes(): Promise<DayType[]> {
    return this.executeWithErrorHandling('get day types', async () => {
      return globalThis.window.electronAPI.getDayTypes();
    });
  }

  async createDayType(
    name: string,
    color: string,
    defaultMinutes?: number,
  ): Promise<DayType> {
    return this.executeWithErrorHandling('create day type', async () => {
      return globalThis.window.electronAPI.createDayType(
        name,
        color,
        defaultMinutes,
      );
    });
  }

  async updateDayType(id: string, data: Partial<DayType>): Promise<DayType> {
    return this.executeWithErrorHandling('update day type', async () => {
      return globalThis.window.electronAPI.updateDayType(id, data);
    });
  }

  async deleteDayType(id: string): Promise<DeleteResult> {
    return this.executeWithErrorHandling('delete day type', async () => {
      return globalThis.window.electronAPI.deleteDayType(id);
    });
  }

  // ==================== DAY OVERRIDES ====================

  async getDayOverrides(
    startDate?: string,
    endDate?: string,
  ): Promise<DayOverride[]> {
    return this.executeWithErrorHandling('get day overrides', async () => {
      return globalThis.window.electronAPI.getDayOverrides(startDate, endDate);
    });
  }

  async getDayOverride(date: string): Promise<DayOverride | null> {
    return this.executeWithErrorHandling('get day override', async () => {
      return globalThis.window.electronAPI.getDayOverride(date);
    });
  }

  async createDayOverride(
    date: string,
    dayTypeId?: string,
    minutes?: number,
    note?: string,
  ): Promise<DayOverride> {
    return this.executeWithErrorHandling('create day override', async () => {
      return globalThis.window.electronAPI.createDayOverride(
        date,
        dayTypeId,
        minutes,
        note,
      );
    });
  }

  async updateDayOverride(
    id: string,
    data: Partial<DayOverride>,
  ): Promise<DayOverride> {
    return this.executeWithErrorHandling('update day override', async () => {
      return globalThis.window.electronAPI.updateDayOverride(id, data);
    });
  }

  async upsertDayOverride(
    date: string,
    dayTypeId?: string,
    minutes?: number,
    note?: string,
  ): Promise<DayOverride> {
    return this.executeWithErrorHandling('upsert day override', async () => {
      return globalThis.window.electronAPI.upsertDayOverride(
        date,
        dayTypeId,
        minutes,
        note,
      );
    });
  }

  async deleteDayOverride(date: string): Promise<DeleteResult> {
    return this.executeWithErrorHandling('delete day override', async () => {
      return globalThis.window.electronAPI.deleteDayOverride(date);
    });
  }

  // ==================== TAGS ====================

  async getTags(): Promise<Tag[]> {
    return this.executeWithErrorHandling('get tags', async () => {
      return globalThis.window.electronAPI.getTags();
    });
  }

  async createTag(name: string): Promise<Tag> {
    return this.executeWithErrorHandling('create tag', async () => {
      return globalThis.window.electronAPI.createTag(name);
    });
  }

  async updateTag(id: string, name: string): Promise<Tag> {
    return this.executeWithErrorHandling('update tag', async () => {
      return globalThis.window.electronAPI.updateTag(id, name);
    });
  }

  async deleteTag(id: string): Promise<DeleteResult> {
    return this.executeWithErrorHandling('delete tag', async () => {
      return globalThis.window.electronAPI.deleteTag(id);
    });
  }

  async addTagToTask(taskId: string, tagId: string): Promise<void> {
    return this.executeWithErrorHandling('add tag to task', async () => {
      return globalThis.window.electronAPI.addTagToTask(taskId, tagId);
    });
  }

  async removeTagFromTask(taskId: string, tagId: string): Promise<void> {
    return this.executeWithErrorHandling('remove tag from task', async () => {
      return globalThis.window.electronAPI.removeTagFromTask(taskId, tagId);
    });
  }

  // ==================== AUDIT LOGS ====================

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

  // ==================== ACTION HISTORY ====================

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
