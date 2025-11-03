// Type declarations for Electron API and Database Models

// ==================== DATABASE MODELS ====================

export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface TaskStatus {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  estimated_hours?: number;
  status_id: string;
  created_at: string;
  // Computed fields from JOIN
  status_name?: string;
  project_name?: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface TimeEntry {
  id: string;
  task_id?: string;
  date: string;
  hours: number;
  notes?: string;
  created_at: string;
  // Computed fields from JOIN
  task_name?: string;
  project_name?: string;
}

export interface WorkPeriod {
  id: string;
  year: number;
  month: number;
  planned_hours: number;
  note?: string;
  created_at: string;
}

// ==================== ELECTRON API ====================

declare global {
  interface Window {
    electronAPI: {
      // Projects
      getProjects: () => Promise<Project[]>;
      createProject: (name: string, description?: string) => Promise<any>;
      updateProject: (
        id: string,
        name: string,
        description?: string
      ) => Promise<any>;
      deleteProject: (id: string) => Promise<any>;

      // Tasks
      getTasks: (projectId?: string) => Promise<Task[]>;
      createTask: (
        projectId: string,
        name: string,
        description?: string,
        estimatedHours?: number,
        statusId?: string
      ) => Promise<any>;
      updateTask: (id: string, data: Partial<Task>) => Promise<any>;
      deleteTask: (id: string) => Promise<any>;

      // Task Statuses
      getTaskStatuses: () => Promise<TaskStatus[]>;

      // Time Entries
      getTimeEntries: (taskId?: string) => Promise<TimeEntry[]>;
      getPendingTimeEntries: () => Promise<TimeEntry[]>;
      createTimeEntry: (
        date: string,
        hours: number,
        taskId?: string,
        notes?: string
      ) => Promise<any>;
      updateTimeEntry: (id: string, data: Partial<TimeEntry>) => Promise<any>;
      deleteTimeEntry: (id: string) => Promise<any>;

      // Work Periods
      getWorkPeriods: () => Promise<WorkPeriod[]>;
      createWorkPeriod: (
        year: number,
        month: number,
        plannedHours: number,
        note?: string
      ) => Promise<any>;

      // Navigation
      onNavigate: (callback: (route: string) => void) => void;
    };
  }
}

export {};
