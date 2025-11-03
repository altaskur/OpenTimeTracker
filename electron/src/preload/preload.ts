import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  // Projects
  getProjects: (): Promise<any[]> => ipcRenderer.invoke('get-projects'),
  createProject: (name: string, description?: string): Promise<any> =>
    ipcRenderer.invoke('create-project', name, description),
  updateProject: (
    id: string,
    name: string,
    description?: string
  ): Promise<any> =>
    ipcRenderer.invoke('update-project', id, name, description),
  deleteProject: (id: string): Promise<any> =>
    ipcRenderer.invoke('delete-project', id),

  // Tasks
  getTasks: (projectId?: string): Promise<any[]> =>
    ipcRenderer.invoke('get-tasks', projectId),
  createTask: (
    projectId: string,
    name: string,
    description?: string,
    estimatedHours?: number,
    statusId?: string
  ): Promise<any> =>
    ipcRenderer.invoke(
      'create-task',
      projectId,
      name,
      description,
      estimatedHours,
      statusId
    ),
  updateTask: (id: string, data: any): Promise<any> =>
    ipcRenderer.invoke('update-task', id, data),
  deleteTask: (id: string): Promise<any> =>
    ipcRenderer.invoke('delete-task', id),

  // Task Statuses
  getTaskStatuses: (): Promise<any[]> =>
    ipcRenderer.invoke('get-task-statuses'),

  // Time Entries
  getTimeEntries: (taskId?: string): Promise<any[]> =>
    ipcRenderer.invoke('get-time-entries', taskId),
  getPendingTimeEntries: (): Promise<any[]> =>
    ipcRenderer.invoke('get-pending-time-entries'),
  createTimeEntry: (
    date: string,
    hours: number,
    taskId?: string,
    notes?: string
  ): Promise<any> =>
    ipcRenderer.invoke('create-time-entry', date, hours, taskId, notes),
  updateTimeEntry: (id: string, data: any): Promise<any> =>
    ipcRenderer.invoke('update-time-entry', id, data),
  deleteTimeEntry: (id: string): Promise<any> =>
    ipcRenderer.invoke('delete-time-entry', id),

  // Work Periods
  getWorkPeriods: (): Promise<any[]> => ipcRenderer.invoke('get-work-periods'),
  createWorkPeriod: (
    year: number,
    month: number,
    plannedHours: number,
    note?: string
  ): Promise<any> =>
    ipcRenderer.invoke('create-work-period', year, month, plannedHours, note),

  // Navigation - Listen for navigation events from Electron
  onNavigate: (callback: (route: string) => void) => {
    ipcRenderer.on('navigate-to', (_event, route) => callback(route));
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
