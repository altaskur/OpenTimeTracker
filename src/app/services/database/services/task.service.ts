import { Injectable } from '@angular/core';
import { DeleteResult, Task, TaskStatus } from '../../../../types/electron';
import { BaseDatabaseService } from '../base-database.service';

/**
 * Service for task and task status database operations.
 */
@Injectable({
  providedIn: 'root',
})
export class TaskService extends BaseDatabaseService {
  // Tasks
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

  // Task Statuses
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
}
