/**
 * Barrel file for database services.
 * Re-exports all domain-specific services for backward compatibility.
 */

// Base service
export { BaseDatabaseService } from './base-database.service';

// Domain services
export {
  ProjectService,
  TaskService,
  TimeEntryService,
  ConfigService,
  DayService,
  TagService,
  AuditService,
} from './services';

// Legacy DatabaseService - combines all domain services for backward compatibility
import { inject, Injectable, signal } from '@angular/core';
import { ProjectService } from './services/project.service';
import { TaskService } from './services/task.service';
import { TimeEntryService } from './services/time-entry.service';
import { ConfigService } from './services/config.service';
import { DayService } from './services/day.service';
import { TagService } from './services/tag.service';
import { AuditService } from './services/audit.service';
import { ElectronApiError } from '../errors/electron-api-error';
import { TimeEntry } from '../../../types/electron';

/**
 * Legacy DatabaseService that delegates to domain-specific services.
 * Maintained for backward compatibility with existing code.
 * For new code, prefer injecting the specific domain service.
 */
@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  readonly lastError = signal<ElectronApiError | null>(null);
  readonly isElectronAvailable = signal<boolean>(
    !!globalThis.window?.electronAPI,
  );

  private readonly projects = inject(ProjectService);
  private readonly tasks = inject(TaskService);
  private readonly timeEntries = inject(TimeEntryService);
  private readonly config = inject(ConfigService);
  private readonly days = inject(DayService);
  private readonly tags = inject(TagService);
  private readonly audit = inject(AuditService);

  /**
   * Wraps async operations to sync lastError state.
   */
  private async wrap<T>(fn: () => Promise<T>): Promise<T> {
    this.lastError.set(null);
    try {
      return await fn();
    } catch (error) {
      const wrappedError =
        error instanceof ElectronApiError
          ? error
          : new ElectronApiError(`Operation failed`, 'database', error);
      this.lastError.set(wrappedError);
      throw error;
    }
  }

  // Project methods
  getProjects = () => this.wrap(() => this.projects.getProjects());
  createProject = (name: string, description?: string) =>
    this.wrap(() => this.projects.createProject(name, description));
  updateProject = (id: string, name: string, description?: string) =>
    this.wrap(() => this.projects.updateProject(id, name, description));
  deleteProject = (id: string) =>
    this.wrap(() => this.projects.deleteProject(id));
  canCloseProject = (id: string) =>
    this.wrap(() => this.projects.canCloseProject(id));
  closeProject = (id: string) =>
    this.wrap(() => this.projects.closeProject(id));
  reopenProject = (id: string) =>
    this.wrap(() => this.projects.reopenProject(id));

  // Task methods
  getTasks = (projectId?: string) =>
    this.wrap(() => this.tasks.getTasks(projectId));
  createTask = (
    projectId: string,
    name: string,
    description?: string,
    estimatedHours?: number,
    statusId?: string,
    tagIds?: string[],
  ) =>
    this.wrap(() =>
      this.tasks.createTask(
        projectId,
        name,
        description,
        estimatedHours,
        statusId,
        tagIds,
      ),
    );
  updateTask = (
    id: string,
    data: {
      name?: string;
      description?: string;
      estimatedHours?: number;
      statusId?: string;
      tagIds?: string[];
    },
  ) => this.wrap(() => this.tasks.updateTask(id, data));
  deleteTask = (id: string) => this.wrap(() => this.tasks.deleteTask(id));
  getTaskStatuses = () => this.wrap(() => this.tasks.getTaskStatuses());
  createTaskStatus = (name: string, color: string) =>
    this.wrap(() => this.tasks.createTaskStatus(name, color));
  updateTaskStatus = (id: string, name: string, color: string) =>
    this.wrap(() => this.tasks.updateTaskStatus(id, name, color));
  deleteTaskStatus = (id: string) =>
    this.wrap(() => this.tasks.deleteTaskStatus(id));

  // Time entry methods
  getTimeEntries = (taskId?: string) =>
    this.wrap(() => this.timeEntries.getTimeEntries(taskId));
  getTimeEntriesByDateRange = (startDate: string, endDate: string) =>
    this.wrap(() =>
      this.timeEntries.getTimeEntriesByDateRange(startDate, endDate),
    );
  getTimeEntriesByDate = (date: string) =>
    this.wrap(() => this.timeEntries.getTimeEntriesByDate(date));
  getPendingTimeEntries = () =>
    this.wrap(() => this.timeEntries.getPendingTimeEntries());
  createTimeEntry = (
    date: string,
    minutes: number,
    taskId?: string,
    notes?: string,
  ) =>
    this.wrap(() =>
      this.timeEntries.createTimeEntry(date, minutes, taskId, notes),
    );
  updateTimeEntry = (id: string, data: Partial<TimeEntry>) =>
    this.wrap(() => this.timeEntries.updateTimeEntry(id, data));
  deleteTimeEntry = (id: string) =>
    this.wrap(() => this.timeEntries.deleteTimeEntry(id));
  getWorkPeriods = () => this.wrap(() => this.timeEntries.getWorkPeriods());
  getWorkPeriod = (year: number, month: number) =>
    this.wrap(() => this.timeEntries.getWorkPeriod(year, month));
  createWorkPeriod = (
    year: number,
    month: number,
    plannedHours: number,
    note?: string,
  ) =>
    this.wrap(() =>
      this.timeEntries.createWorkPeriod(year, month, plannedHours, note),
    );
  updateWorkPeriod = (
    year: number,
    month: number,
    data: { plannedHours?: number; note?: string },
  ) => this.wrap(() => this.timeEntries.updateWorkPeriod(year, month, data));
  upsertWorkPeriod = (
    year: number,
    month: number,
    plannedHours: number,
    note?: string,
  ) =>
    this.wrap(() =>
      this.timeEntries.upsertWorkPeriod(year, month, plannedHours, note),
    );

  // Config methods
  getWorkConfig = () => this.wrap(() => this.config.getWorkConfig());
  updateWorkConfig = (data: {
    dailyMinutes?: number;
    weeklyMinutes?: number;
    workDays?: string;
  }) => this.wrap(() => this.config.updateWorkConfig(data));
  getMonthConfig = (year: number, month: number) =>
    this.wrap(() => this.config.getMonthConfig(year, month));
  updateMonthConfig = (
    year: number,
    month: number,
    data: { weeklyMinutes?: number; workDays?: string; daySchedule?: string },
  ) => this.wrap(() => this.config.updateMonthConfig(year, month, data));

  // Day methods
  getDayTypes = () => this.wrap(() => this.days.getDayTypes());
  createDayType = (name: string, color: string, defaultMinutes?: number) =>
    this.wrap(() => this.days.createDayType(name, color, defaultMinutes));
  updateDayType = (
    id: string,
    data: { name?: string; color?: string; defaultMinutes?: number },
  ) => this.wrap(() => this.days.updateDayType(id, data));
  deleteDayType = (id: string) => this.wrap(() => this.days.deleteDayType(id));
  getDayOverrides = (startDate?: string, endDate?: string) =>
    this.wrap(() => this.days.getDayOverrides(startDate, endDate));
  getDayOverride = (date: string) =>
    this.wrap(() => this.days.getDayOverride(date));
  createDayOverride = (
    date: string,
    dayTypeId?: string,
    minutes?: number,
    note?: string,
  ) =>
    this.wrap(() =>
      this.days.createDayOverride(date, dayTypeId, minutes, note),
    );
  updateDayOverride = (
    id: string,
    data: { dayTypeId?: string; minutes?: number; note?: string },
  ) => this.wrap(() => this.days.updateDayOverride(id, data));
  upsertDayOverride = (
    date: string,
    dayTypeId?: string,
    minutes?: number,
    note?: string,
  ) =>
    this.wrap(() =>
      this.days.upsertDayOverride(date, dayTypeId, minutes, note),
    );
  deleteDayOverride = (date: string) =>
    this.wrap(() => this.days.deleteDayOverride(date));

  // Tag methods
  getTags = () => this.wrap(() => this.tags.getTags());
  createTag = (name: string) => this.wrap(() => this.tags.createTag(name));
  updateTag = (id: string, name: string) =>
    this.wrap(() => this.tags.updateTag(id, name));
  deleteTag = (id: string) => this.wrap(() => this.tags.deleteTag(id));
  addTagToTask = (taskId: string, tagId: string) =>
    this.wrap(() => this.tags.addTagToTask(taskId, tagId));
  removeTagFromTask = (taskId: string, tagId: string) =>
    this.wrap(() => this.tags.removeTagFromTask(taskId, tagId));

  // Audit methods
  getAuditLogs = (entityType?: string, entityId?: string, taskId?: string) =>
    this.wrap(() => this.audit.getAuditLogs(entityType, entityId, taskId));
  getActionHistory = (limit?: number) =>
    this.wrap(() => this.audit.getActionHistory(limit));
  clearActionHistory = () => this.wrap(() => this.audit.clearActionHistory());
}
