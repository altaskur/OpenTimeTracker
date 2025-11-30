import { contextBridge, ipcRenderer } from 'electron';
import {
  DeleteResult,
  Project,
  Task,
  TaskStatus,
  TimeEntry,
  WorkPeriod,
} from '../interfaces/database.interfaces';

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

  // Tasks
  getTasks: (projectId?: string): Promise<Task[]> =>
    ipcRenderer.invoke('get-tasks', projectId),
  createTask: (
    projectId: string,
    name: string,
    description?: string,
    estimatedHours?: number,
    statusId?: string,
  ): Promise<Task> =>
    ipcRenderer.invoke(
      'create-task',
      projectId,
      name,
      description,
      estimatedHours,
      statusId,
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
  getPendingTimeEntries: (): Promise<TimeEntry[]> =>
    ipcRenderer.invoke('get-pending-time-entries'),
  createTimeEntry: (
    date: string,
    hours: number,
    taskId?: string,
    notes?: string,
  ): Promise<TimeEntry> =>
    ipcRenderer.invoke('create-time-entry', date, hours, taskId, notes),
  updateTimeEntry: (id: string, data: Partial<TimeEntry>): Promise<TimeEntry> =>
    ipcRenderer.invoke('update-time-entry', id, data),
  deleteTimeEntry: (id: string): Promise<DeleteResult> =>
    ipcRenderer.invoke('delete-time-entry', id),

  // Work Periods
  getWorkPeriods: (): Promise<WorkPeriod[]> =>
    ipcRenderer.invoke('get-work-periods'),
  createWorkPeriod: (
    year: number,
    month: number,
    plannedHours: number,
    note?: string,
  ): Promise<WorkPeriod> =>
    ipcRenderer.invoke('create-work-period', year, month, plannedHours, note),

  // Navigation - Listen for navigation events from Electron
  onNavigate: (callback: (route: string) => void): void => {
    ipcRenderer.on('navigate-to', (_event, route) => callback(route));
  },

  // Theme - Dark/Light mode
  getTheme: (): Promise<boolean> => ipcRenderer.invoke('get-theme'),

  toggleTheme: (): void => {
    ipcRenderer.send('toggle-theme');
  },

  onThemeChange: (callback: (isDark: boolean) => void): void => {
    ipcRenderer.on('theme-changed', (_event, isDark) => callback(isDark));
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
