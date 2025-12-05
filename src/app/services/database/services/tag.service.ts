import { Injectable } from '@angular/core';
import { DeleteResult, Tag } from '../../../../types/electron';
import { BaseDatabaseService } from '../base-database.service';

/**
 * Service for tag database operations.
 */
@Injectable({
  providedIn: 'root',
})
export class TagService extends BaseDatabaseService {
  async getTags(): Promise<Tag[]> {
    return this.executeWithErrorHandling('get tags', async () => {
      return globalThis.window.electronAPI.getTags();
    });
  }

  async createTag(name: string): Promise<Tag> {
    return this.executeWithErrorHandling('create tag', async () => {
      return globalThis.window.electronAPI.createTag(name);
    });
  }

  async updateTag(id: string, name: string): Promise<Tag> {
    return this.executeWithErrorHandling('update tag', async () => {
      return globalThis.window.electronAPI.updateTag(id, name);
    });
  }

  async deleteTag(id: string): Promise<DeleteResult> {
    return this.executeWithErrorHandling('delete tag', async () => {
      return globalThis.window.electronAPI.deleteTag(id);
    });
  }

  async addTagToTask(taskId: string, tagId: string): Promise<void> {
    return this.executeWithErrorHandling('add tag to task', async () => {
      return globalThis.window.electronAPI.addTagToTask(taskId, tagId);
    });
  }

  async removeTagFromTask(taskId: string, tagId: string): Promise<void> {
    return this.executeWithErrorHandling('remove tag from task', async () => {
      return globalThis.window.electronAPI.removeTagFromTask(taskId, tagId);
    });
  }
}
