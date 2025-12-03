import { PrismaClient } from '@prisma/client';
import { BaseRepository } from '../base.repository';

/**
 * Repository for tag database operations.
 */
export class TagRepository extends BaseRepository {
  constructor(prisma: PrismaClient, ensureInitialized: () => Promise<void>) {
    super(prisma, ensureInitialized);
  }

  /**
   * Gets all tags.
   */
  async getAll() {
    await this.ensureInitialized();
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Gets a tag by ID.
   */
  async getById(id: string) {
    await this.ensureInitialized();
    return this.prisma.tag.findUnique({
      where: { id },
    });
  }

  /**
   * Gets a tag by name.
   */
  async getByName(name: string) {
    await this.ensureInitialized();
    return this.prisma.tag.findFirst({
      where: { name },
    });
  }

  /**
   * Creates a new tag.
   */
  async create(name: string) {
    await this.ensureInitialized();
    return this.prisma.tag.create({
      data: { name },
    });
  }

  /**
   * Updates an existing tag.
   */
  async update(id: string, data: { name?: string }) {
    await this.ensureInitialized();
    return this.prisma.tag.update({
      where: { id },
      data,
    });
  }

  /**
   * Deletes a tag.
   */
  async delete(id: string) {
    await this.ensureInitialized();
    return this.prisma.tag.delete({
      where: { id },
    });
  }

  /**
   * Adds a tag to a task.
   */
  async addToTask(taskId: string, tagId: string) {
    await this.ensureInitialized();
    return this.prisma.taskTag.create({
      data: { taskId, tagId },
    });
  }

  /**
   * Removes a tag from a task.
   */
  async removeFromTask(taskId: string, tagId: string) {
    await this.ensureInitialized();
    return this.prisma.taskTag.delete({
      where: {
        taskId_tagId: { taskId, tagId },
      },
    });
  }

  /**
   * Gets tags for a specific task.
   */
  async getByTaskId(taskId: string) {
    await this.ensureInitialized();
    const taskTags = await this.prisma.taskTag.findMany({
      where: { taskId },
      include: { tag: true },
    });
    return taskTags.map((tt: { tag: { id: string; name: string } }) => tt.tag);
  }
}
