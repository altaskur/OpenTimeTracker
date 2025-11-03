import { Injectable } from '@angular/core';
import {
  Project,
  Task,
  TaskStatus,
  TimeEntry,
  WorkPeriod,
} from '../../types/electron';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  // ==================== PROJECTS ====================

  async getProjects(): Promise<Project[]> {
    return globalThis.window?.electronAPI?.getProjects() ?? [];
  }

  async createProject(name: string, description?: string): Promise<any> {
    if (!globalThis.window?.electronAPI) {
      throw new Error('Electron API not available');
    }
    return globalThis.window.electronAPI.createProject(name, description);
  }

  async updateProject(
    id: string,
    name: string,
    description?: string
  ): Promise<any> {
    if (!globalThis.window?.electronAPI) {
      throw new Error('Electron API not available');
    }
    return globalThis.window.electronAPI.updateProject(id, name, description);
  }

  async deleteProject(id: string): Promise<any> {
    if (!globalThis.window?.electronAPI) {
      throw new Error('Electron API not available');
    }
    return globalThis.window.electronAPI.deleteProject(id);
  }

  // ==================== TASKS ====================

  async getTasks(projectId?: string): Promise<Task[]> {
    return globalThis.window?.electronAPI?.getTasks(projectId) ?? [];
  }

  async createTask(
    projectId: string,
    name: string,
    description?: string,
    estimatedHours?: number,
    statusId?: string
  ): Promise<any> {
    if (!globalThis.window?.electronAPI) {
      throw new Error('Electron API not available');
    }
    return globalThis.window.electronAPI.createTask(
      projectId,
      name,
      description,
      estimatedHours,
      statusId
    );
  }

  async updateTask(id: string, data: Partial<Task>): Promise<any> {
    if (!globalThis.window?.electronAPI) {
      throw new Error('Electron API not available');
    }
    return globalThis.window.electronAPI.updateTask(id, data);
  }

  async deleteTask(id: string): Promise<any> {
    if (!globalThis.window?.electronAPI) {
      throw new Error('Electron API not available');
    }
    return globalThis.window.electronAPI.deleteTask(id);
  }

  // ==================== TASK STATUSES ====================

  async getTaskStatuses(): Promise<TaskStatus[]> {
    return globalThis.window?.electronAPI?.getTaskStatuses() ?? [];
  }

  // ==================== TIME ENTRIES ====================

  async getTimeEntries(taskId?: string): Promise<TimeEntry[]> {
    return globalThis.window?.electronAPI?.getTimeEntries(taskId) ?? [];
  }

  async getPendingTimeEntries(): Promise<TimeEntry[]> {
    return globalThis.window?.electronAPI?.getPendingTimeEntries() ?? [];
  }

  async createTimeEntry(
    date: string,
    hours: number,
    taskId?: string,
    notes?: string
  ): Promise<any> {
    if (!globalThis.window?.electronAPI) {
      throw new Error('Electron API not available');
    }
    return globalThis.window.electronAPI.createTimeEntry(
      date,
      hours,
      taskId,
      notes
    );
  }

  async updateTimeEntry(id: string, data: Partial<TimeEntry>): Promise<any> {
    if (!globalThis.window?.electronAPI) {
      throw new Error('Electron API not available');
    }
    return globalThis.window.electronAPI.updateTimeEntry(id, data);
  }

  async deleteTimeEntry(id: string): Promise<any> {
    if (!globalThis.window?.electronAPI) {
      throw new Error('Electron API not available');
    }
    return globalThis.window.electronAPI.deleteTimeEntry(id);
  }

  // ==================== WORK PERIODS ====================

  async getWorkPeriods(): Promise<WorkPeriod[]> {
    return globalThis.window?.electronAPI?.getWorkPeriods() ?? [];
  }

  async createWorkPeriod(
    year: number,
    month: number,
    plannedHours: number,
    note?: string
  ): Promise<any> {
    if (!globalThis.window?.electronAPI) {
      throw new Error('Electron API not available');
    }
    return globalThis.window.electronAPI.createWorkPeriod(
      year,
      month,
      plannedHours,
      note
    );
  }
}
