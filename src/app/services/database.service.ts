import { Injectable, signal } from '@angular/core';
import {
  DeleteResult,
  Project,
  Task,
  TaskStatus,
  TimeEntry,
  WorkPeriod,
} from '../../types/electron';
import { ElectronApiError } from './electron-api-error';

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
      return globalThis.window.electronAPI!.getProjects();
    });
  }

  async createProject(name: string, description?: string): Promise<Project> {
    return this.executeWithErrorHandling('create project', async () => {
      return globalThis.window.electronAPI!.createProject(name, description);
    });
  }

  async updateProject(
    id: string,
    name: string,
    description?: string,
  ): Promise<Project> {
    return this.executeWithErrorHandling('update project', async () => {
      return globalThis.window.electronAPI!.updateProject(
        id,
        name,
        description,
      );
    });
  }

  async deleteProject(id: string): Promise<DeleteResult> {
    return this.executeWithErrorHandling('delete project', async () => {
      return globalThis.window.electronAPI!.deleteProject(id);
    });
  }

  // ==================== TASKS ====================

  async getTasks(projectId?: string): Promise<Task[]> {
    return this.executeWithErrorHandling('get tasks', async () => {
      return globalThis.window.electronAPI!.getTasks(projectId);
    });
  }

  async createTask(
    projectId: string,
    name: string,
    description?: string,
    estimatedHours?: number,
    statusId?: string,
  ): Promise<Task> {
    return this.executeWithErrorHandling('create task', async () => {
      return globalThis.window.electronAPI!.createTask(
        projectId,
        name,
        description,
        estimatedHours,
        statusId,
      );
    });
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    return this.executeWithErrorHandling('update task', async () => {
      return globalThis.window.electronAPI!.updateTask(id, data);
    });
  }

  async deleteTask(id: string): Promise<DeleteResult> {
    return this.executeWithErrorHandling('delete task', async () => {
      return globalThis.window.electronAPI!.deleteTask(id);
    });
  }

  // ==================== TASK STATUSES ====================

  async getTaskStatuses(): Promise<TaskStatus[]> {
    return this.executeWithErrorHandling('get task statuses', async () => {
      return globalThis.window.electronAPI!.getTaskStatuses();
    });
  }

  // ==================== TIME ENTRIES ====================

  async getTimeEntries(taskId?: string): Promise<TimeEntry[]> {
    return this.executeWithErrorHandling('get time entries', async () => {
      return globalThis.window.electronAPI!.getTimeEntries(taskId);
    });
  }

  async getPendingTimeEntries(): Promise<TimeEntry[]> {
    return this.executeWithErrorHandling(
      'get pending time entries',
      async () => {
        return globalThis.window.electronAPI!.getPendingTimeEntries();
      },
    );
  }

  async createTimeEntry(
    date: string,
    hours: number,
    taskId?: string,
    notes?: string,
  ): Promise<TimeEntry> {
    return this.executeWithErrorHandling('create time entry', async () => {
      return globalThis.window.electronAPI!.createTimeEntry(
        date,
        hours,
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
      return globalThis.window.electronAPI!.updateTimeEntry(id, data);
    });
  }

  async deleteTimeEntry(id: string): Promise<DeleteResult> {
    return this.executeWithErrorHandling('delete time entry', async () => {
      return globalThis.window.electronAPI!.deleteTimeEntry(id);
    });
  }

  // ==================== WORK PERIODS ====================

  async getWorkPeriods(): Promise<WorkPeriod[]> {
    return this.executeWithErrorHandling('get work periods', async () => {
      return globalThis.window.electronAPI!.getWorkPeriods();
    });
  }

  async createWorkPeriod(
    year: number,
    month: number,
    plannedHours: number,
    note?: string,
  ): Promise<WorkPeriod> {
    return this.executeWithErrorHandling('create work period', async () => {
      return globalThis.window.electronAPI!.createWorkPeriod(
        year,
        month,
        plannedHours,
        note,
      );
    });
  }
}
