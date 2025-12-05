import { Injectable } from '@angular/core';
import { DeleteResult, Project } from '../../../../types/electron';
import { BaseDatabaseService } from '../base-database.service';

/**
 * Service for project-related database operations.
 */
@Injectable({
  providedIn: 'root',
})
export class ProjectService extends BaseDatabaseService {
  async getProjects(): Promise<Project[]> {
    return this.executeWithErrorHandling('get projects', async () => {
      return globalThis.window.electronAPI.getProjects();
    });
  }

  async createProject(name: string, description?: string): Promise<Project> {
    return this.executeWithErrorHandling('create project', async () => {
      return globalThis.window.electronAPI.createProject(name, description);
    });
  }

  async updateProject(
    id: string,
    name: string,
    description?: string,
  ): Promise<Project> {
    return this.executeWithErrorHandling('update project', async () => {
      return globalThis.window.electronAPI.updateProject(id, name, description);
    });
  }

  async deleteProject(id: string): Promise<DeleteResult> {
    return this.executeWithErrorHandling('delete project', async () => {
      return globalThis.window.electronAPI.deleteProject(id);
    });
  }

  async canCloseProject(id: string): Promise<boolean> {
    return this.executeWithErrorHandling(
      'check if project can close',
      async () => {
        return globalThis.window.electronAPI.canCloseProject(id);
      },
    );
  }

  async closeProject(id: string): Promise<Project> {
    return this.executeWithErrorHandling('close project', async () => {
      return globalThis.window.electronAPI.closeProject(id);
    });
  }

  async reopenProject(id: string): Promise<Project> {
    return this.executeWithErrorHandling('reopen project', async () => {
      return globalThis.window.electronAPI.reopenProject(id);
    });
  }
}
