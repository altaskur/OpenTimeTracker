// Type declarations for Electron API and Database Models

// ==================== DATABASE MODELS ====================

export interface Project {
  id: string;
  name: string;
  description: string | null;
  isClosed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changes: string | null;
  userName: string | null;
  createdAt: Date;
  projectId: string | null;
  taskId: string | null;
}

export interface ActionHistory {
  id: string;
  entityType: string;
  entityId: string;
  actionType: string;
  description: string;
  previousData: string | null;
  newData: string | null;
  undone: boolean;
  createdAt: Date;
}

export interface TaskStatus {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
}

export interface Tag {
  id: string;
  name: string;
}

export interface TaskTag {
  tag: Tag;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  estimatedHours: number | null;
  statusId: string | null;
  createdAt: Date;
  updatedAt: Date;
  /** Computed fields from JOIN */
  project?: Project;
  status?: TaskStatus | null;
  tags?: TaskTag[];
  /** For update operations */
  tagIds?: string[];
}

export interface TimeEntry {
  id: string;
  taskId: string | null;
  date: string;
  minutes: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  /** Computed field from JOIN */
  task?: Task | null;
}

export interface WorkPeriod {
  id: string;
  year: number;
  month: number;
  plannedHours: number;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Day schedule mapping weekday number to minutes
 * Keys: "1" (Monday) to "7" (Sunday)
 */
export type DaySchedule = Record<string, number>;

export interface WorkConfig {
  id: string;
  dailyMinutes: number;
  weeklyMinutes: number;
  workDays: string;
  daySchedule: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthConfig {
  id: string;
  year: number;
  month: number;
  weeklyMinutes: number;
  workDays: string;
  daySchedule: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DayType {
  id: string;
  name: string;
  color: string;
  defaultMinutes: number;
  createdAt: Date;
}

export interface DayOverride {
  id: string;
  date: string;
  dayTypeId: string | null;
  minutes: number | null;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  /** Computed field from JOIN */
  dayType?: DayType | null;
}

// ==================== BACKUP MODELS ====================

export interface BackupInfo {
  filename: string;
  path: string;
  size: number;
  createdAt: Date;
  type: 'auto' | 'manual' | 'startup' | 'shutdown' | 'before-restore';
}

export interface BackupResult {
  success: boolean;
  backup?: BackupInfo;
  error?: string;
}

// ==================== ELECTRON API ====================

export interface DeleteResult {
  success: boolean;
}

export interface UpdateCheckResult {
  updateAvailable: boolean;
  version: string;
  url: string;
  releaseNotes?: string | null;
}

export interface GitHubRelease {
  tag_name: string;
  html_url: string;
  body: string;
  name: string;
  published_at: string;
}

declare global {
  interface Window {
    electronAPI: {
      // Projects
      getProjects: () => Promise<Project[]>;
      createProject: (name: string, description?: string) => Promise<Project>;
      updateProject: (
        id: string,
        name: string,
        description?: string,
      ) => Promise<Project>;
      deleteProject: (id: string) => Promise<DeleteResult>;
      closeProject: (id: string) => Promise<Project>;
      reopenProject: (id: string) => Promise<Project>;
      canCloseProject: (id: string) => Promise<boolean>;

      // Audit Logs
      getAuditLogs: (
        entityType?: string,
        entityId?: string,
        taskId?: string,
      ) => Promise<AuditLog[]>;

      // Tasks
      getTasks: (projectId?: string) => Promise<Task[]>;
      createTask: (
        projectId: string,
        name: string,
        description?: string,
        estimatedHours?: number,
        statusId?: string,
        tagIds?: string[],
      ) => Promise<Task>;
      updateTask: (id: string, data: Partial<Task>) => Promise<Task>;
      deleteTask: (id: string) => Promise<DeleteResult>;

      // Task Statuses
      getTaskStatuses: () => Promise<TaskStatus[]>;
      createTaskStatus: (name: string, color: string) => Promise<TaskStatus>;
      updateTaskStatus: (
        id: string,
        name: string,
        color: string,
      ) => Promise<TaskStatus>;
      deleteTaskStatus: (id: string) => Promise<TaskStatus | null>;

      // Time Entries
      getTimeEntries: (taskId?: string) => Promise<TimeEntry[]>;
      getTimeEntriesByDateRange: (
        startDate: string,
        endDate: string,
      ) => Promise<TimeEntry[]>;
      getTimeEntriesByDate: (date: string) => Promise<TimeEntry[]>;
      getPendingTimeEntries: () => Promise<TimeEntry[]>;
      createTimeEntry: (
        date: string,
        minutes: number,
        taskId?: string,
        notes?: string,
      ) => Promise<TimeEntry>;
      updateTimeEntry: (
        id: string,
        data: Partial<TimeEntry>,
      ) => Promise<TimeEntry>;
      deleteTimeEntry: (id: string) => Promise<DeleteResult>;

      // Work Periods
      getWorkPeriods: () => Promise<WorkPeriod[]>;
      getWorkPeriod: (
        year: number,
        month: number,
      ) => Promise<WorkPeriod | null>;
      createWorkPeriod: (
        year: number,
        month: number,
        plannedHours: number,
        note?: string,
      ) => Promise<WorkPeriod>;
      updateWorkPeriod: (
        year: number,
        month: number,
        data: { plannedHours?: number; note?: string },
      ) => Promise<WorkPeriod>;
      upsertWorkPeriod: (
        year: number,
        month: number,
        plannedHours: number,
        note?: string,
      ) => Promise<WorkPeriod>;

      // Work Config
      getWorkConfig: () => Promise<WorkConfig>;
      updateWorkConfig: (data: Partial<WorkConfig>) => Promise<WorkConfig>;

      // Month Config
      getMonthConfig: (year: number, month: number) => Promise<MonthConfig>;
      updateMonthConfig: (
        year: number,
        month: number,
        data: Partial<MonthConfig>,
      ) => Promise<MonthConfig>;

      // Day Types
      getDayTypes: () => Promise<DayType[]>;
      createDayType: (
        name: string,
        color: string,
        defaultMinutes?: number,
      ) => Promise<DayType>;
      updateDayType: (id: string, data: Partial<DayType>) => Promise<DayType>;
      deleteDayType: (id: string) => Promise<DeleteResult>;

      // Day Overrides
      getDayOverrides: (
        startDate?: string,
        endDate?: string,
      ) => Promise<DayOverride[]>;
      getDayOverride: (date: string) => Promise<DayOverride | null>;
      createDayOverride: (
        date: string,
        dayTypeId?: string,
        minutes?: number,
        note?: string,
      ) => Promise<DayOverride>;
      updateDayOverride: (
        id: string,
        data: Partial<DayOverride>,
      ) => Promise<DayOverride>;
      upsertDayOverride: (
        date: string,
        dayTypeId?: string,
        minutes?: number,
        note?: string,
      ) => Promise<DayOverride>;
      deleteDayOverride: (date: string) => Promise<DeleteResult>;

      // Tags
      getTags: () => Promise<Tag[]>;
      createTag: (name: string) => Promise<Tag>;
      updateTag: (id: string, name: string) => Promise<Tag>;
      deleteTag: (id: string) => Promise<DeleteResult>;
      addTagToTask: (taskId: string, tagId: string) => Promise<void>;
      removeTagFromTask: (taskId: string, tagId: string) => Promise<void>;

      // Navigation
      onNavigate: (callback: (route: string) => void) => void;

      // Theme
      getTheme: () => Promise<boolean>;
      toggleTheme: () => void;
      onThemeChange: (callback: (isDark: boolean) => void) => void;

      // Language
      getLanguage: () => Promise<string>;
      setLanguage: (lang: string) => void;
      onLanguageChange: (callback: (lang: string) => void) => void;

      // Action History
      createActionHistory: (
        entityType: string,
        entityId: string,
        actionType: string,
        description: string,
        previousData?: string,
        newData?: string,
      ) => Promise<ActionHistory>;
      getActionHistory: (limit?: number) => Promise<ActionHistory[]>;
      markActionUndone: (id: string) => Promise<ActionHistory>;
      markActionRedone: (id: string) => Promise<ActionHistory>;
      getLastUndoableAction: () => Promise<ActionHistory | null>;
      getLastRedoableAction: () => Promise<ActionHistory | null>;
      clearActionHistory: () => Promise<DeleteResult>;
      onUndoAction: (callback: () => void) => void;
      onRedoAction: (callback: () => void) => void;

      // Backup
      createBackup: () => Promise<BackupResult>;
      listBackups: () => Promise<BackupInfo[]>;
      restoreBackup: (backupPath: string) => Promise<BackupResult>;
      deleteBackup: (backupPath: string) => Promise<BackupResult>;
      exportBackup: () => Promise<BackupResult>;
      importBackup: () => Promise<BackupResult>;
      getBackupDir: () => Promise<string>;

      // System
      openExternal: (url: string) => Promise<void>;

      // Updates
      checkForUpdates: () => Promise<UpdateCheckResult>;

      // App Info
      getVersion: () => Promise<string>;

      // Release Info
      getReleaseByTag: (tag: string) => Promise<GitHubRelease | null>;
    };
  }
}

export {};
