import { contextBridge, ipcRenderer } from 'electron';
import {
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
} from '../interfaces/database.interfaces';

try {
  const electronAPI = {
    // Projects
    getProjects: (): Promise<Project[]> => ipcRenderer.invoke('get-projects'),
    createProject: (name: string, description?: string): Promise<Project> =>
      ipcRenderer.invoke('create-project', name, description),
    updateProject: (
      id: string,
      name: string,
      description?: string,
    ): Promise<Project> =>
      ipcRenderer.invoke('update-project', id, name, description),
    deleteProject: (id: string): Promise<DeleteResult> =>
      ipcRenderer.invoke('delete-project', id),
    canCloseProject: (id: string): Promise<boolean> =>
      ipcRenderer.invoke('can-close-project', id),
    closeProject: (id: string): Promise<Project> =>
      ipcRenderer.invoke('close-project', id),
    reopenProject: (id: string): Promise<Project> =>
      ipcRenderer.invoke('reopen-project', id),

    // Tasks
    getTasks: (projectId?: string): Promise<Task[]> =>
      ipcRenderer.invoke('get-tasks', projectId),
    createTask: (
      projectId: string,
      name: string,
      description?: string,
      estimatedHours?: number,
      statusId?: string,
      tagIds?: string[],
    ): Promise<Task> =>
      ipcRenderer.invoke(
        'create-task',
        projectId,
        name,
        description,
        estimatedHours,
        statusId,
        tagIds,
      ),
    updateTask: (id: string, data: Partial<Task>): Promise<Task> =>
      ipcRenderer.invoke('update-task', id, data),
    deleteTask: (id: string): Promise<DeleteResult> =>
      ipcRenderer.invoke('delete-task', id),

    // Task Statuses
    getTaskStatuses: (): Promise<TaskStatus[]> =>
      ipcRenderer.invoke('get-task-statuses'),

    // Time Entries
    getTimeEntries: (taskId?: string): Promise<TimeEntry[]> =>
      ipcRenderer.invoke('get-time-entries', taskId),
    getTimeEntriesByDateRange: (
      startDate: string,
      endDate: string,
    ): Promise<TimeEntry[]> =>
      ipcRenderer.invoke('get-time-entries-by-date-range', startDate, endDate),
    getTimeEntriesByDate: (date: string): Promise<TimeEntry[]> =>
      ipcRenderer.invoke('get-time-entries-by-date', date),
    getPendingTimeEntries: (): Promise<TimeEntry[]> =>
      ipcRenderer.invoke('get-pending-time-entries'),
    createTimeEntry: (
      date: string,
      minutes: number,
      taskId?: string,
      notes?: string,
    ): Promise<TimeEntry> =>
      ipcRenderer.invoke('create-time-entry', date, minutes, taskId, notes),
    updateTimeEntry: (
      id: string,
      data: Partial<TimeEntry>,
    ): Promise<TimeEntry> => ipcRenderer.invoke('update-time-entry', id, data),
    deleteTimeEntry: (id: string): Promise<DeleteResult> =>
      ipcRenderer.invoke('delete-time-entry', id),

    // Work Periods
    getWorkPeriods: (): Promise<WorkPeriod[]> =>
      ipcRenderer.invoke('get-work-periods'),
    getWorkPeriod: (year: number, month: number): Promise<WorkPeriod | null> =>
      ipcRenderer.invoke('get-work-period', year, month),
    createWorkPeriod: (
      year: number,
      month: number,
      plannedHours: number,
      note?: string,
    ): Promise<WorkPeriod> =>
      ipcRenderer.invoke('create-work-period', year, month, plannedHours, note),
    updateWorkPeriod: (
      year: number,
      month: number,
      data: { plannedHours?: number; note?: string },
    ): Promise<WorkPeriod> =>
      ipcRenderer.invoke('update-work-period', year, month, data),
    upsertWorkPeriod: (
      year: number,
      month: number,
      plannedHours: number,
      note?: string,
    ): Promise<WorkPeriod> =>
      ipcRenderer.invoke('upsert-work-period', year, month, plannedHours, note),

    // Work Config
    getWorkConfig: (): Promise<WorkConfig> =>
      ipcRenderer.invoke('get-work-config'),
    updateWorkConfig: (data: Partial<WorkConfig>): Promise<WorkConfig> =>
      ipcRenderer.invoke('update-work-config', data),

    // Month Config
    getMonthConfig: (year: number, month: number): Promise<MonthConfig> =>
      ipcRenderer.invoke('get-month-config', year, month),
    updateMonthConfig: (
      year: number,
      month: number,
      data: Partial<MonthConfig>,
    ): Promise<MonthConfig> =>
      ipcRenderer.invoke('update-month-config', year, month, data),

    // Day Types
    getDayTypes: (): Promise<DayType[]> => ipcRenderer.invoke('get-day-types'),
    createDayType: (
      name: string,
      color: string,
      defaultMinutes?: number,
    ): Promise<DayType> =>
      ipcRenderer.invoke('create-day-type', name, color, defaultMinutes),
    updateDayType: (id: string, data: Partial<DayType>): Promise<DayType> =>
      ipcRenderer.invoke('update-day-type', id, data),
    deleteDayType: (id: string): Promise<DeleteResult> =>
      ipcRenderer.invoke('delete-day-type', id),

    // Day Overrides
    getDayOverrides: (
      startDate?: string,
      endDate?: string,
    ): Promise<DayOverride[]> =>
      ipcRenderer.invoke('get-day-overrides', startDate, endDate),
    getDayOverride: (date: string): Promise<DayOverride | null> =>
      ipcRenderer.invoke('get-day-override', date),
    createDayOverride: (
      date: string,
      dayTypeId?: string,
      minutes?: number,
      note?: string,
    ): Promise<DayOverride> =>
      ipcRenderer.invoke('create-day-override', date, dayTypeId, minutes, note),
    updateDayOverride: (
      id: string,
      data: Partial<DayOverride>,
    ): Promise<DayOverride> =>
      ipcRenderer.invoke('update-day-override', id, data),
    upsertDayOverride: (
      date: string,
      dayTypeId?: string,
      minutes?: number,
      note?: string,
    ): Promise<DayOverride> =>
      ipcRenderer.invoke('upsert-day-override', date, dayTypeId, minutes, note),
    deleteDayOverride: (date: string): Promise<DeleteResult> =>
      ipcRenderer.invoke('delete-day-override', date),

    // Tags
    getTags: (): Promise<Tag[]> => ipcRenderer.invoke('get-tags'),
    createTag: (name: string): Promise<Tag> =>
      ipcRenderer.invoke('create-tag', name),
    deleteTag: (id: string): Promise<DeleteResult> =>
      ipcRenderer.invoke('delete-tag', id),
    addTagToTask: (taskId: string, tagId: string): Promise<void> =>
      ipcRenderer.invoke('add-tag-to-task', taskId, tagId),
    removeTagFromTask: (taskId: string, tagId: string): Promise<void> =>
      ipcRenderer.invoke('remove-tag-from-task', taskId, tagId),

    // Audit Logs
    getAuditLogs: (
      entityType?: string,
      entityId?: string,
    ): Promise<AuditLog[]> =>
      ipcRenderer.invoke('get-audit-logs', entityType, entityId),

    // Navigation
    onNavigate: (callback: (route: string) => void): void => {
      ipcRenderer.on('navigate-to', (_event, route) => callback(route));
    },

    // Theme
    getTheme: (): Promise<boolean> => ipcRenderer.invoke('get-theme'),
    toggleTheme: (): void => {
      ipcRenderer.send('toggle-theme');
    },
    onThemeChange: (callback: (isDark: boolean) => void): void => {
      ipcRenderer.on('theme-changed', (_event, isDark) => callback(isDark));
    },

    // Language
    getLanguage: (): Promise<string> => ipcRenderer.invoke('get-language'),
    setLanguage: (lang: string): void => {
      ipcRenderer.send('set-language', lang);
    },
    onLanguageChange: (callback: (lang: string) => void): void => {
      ipcRenderer.on('language-changed', (_event, lang) => callback(lang));
    },
  };

  contextBridge.exposeInMainWorld('electronAPI', electronAPI);
} catch (error) {
  console.error('Error in preload script:', error);
}
