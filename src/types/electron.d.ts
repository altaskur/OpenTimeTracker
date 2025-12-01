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

export interface TaskStatus {
  id: string;
  name: string;
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
  hours: number;
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

// ==================== ELECTRON API ====================

export interface DeleteResult {
  success: boolean;
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

      // Time Entries
      getTimeEntries: (taskId?: string) => Promise<TimeEntry[]>;
      getPendingTimeEntries: () => Promise<TimeEntry[]>;
      createTimeEntry: (
        date: string,
        hours: number,
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
      createWorkPeriod: (
        year: number,
        month: number,
        plannedHours: number,
        note?: string,
      ) => Promise<WorkPeriod>;

      // Tags
      getTags: () => Promise<Tag[]>;
      createTag: (name: string) => Promise<Tag>;
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
    };
  }
}

export {};
