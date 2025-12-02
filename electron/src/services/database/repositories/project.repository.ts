import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './base.repository';

/**
 * Repository for project-related database operations.
 */
export class ProjectRepository extends BaseRepository {
  constructor(prisma: PrismaClient, ensureInitialized: () => Promise<void>) {
    super(prisma, ensureInitialized);
  }

  /**
   * Gets all projects ordered by creation date.
   */
  async getAll() {
    await this.ensureInitialized();
    return this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Creates a new project.
   */
  async create(name: string, description?: string) {
    await this.ensureInitialized();
    return this.prisma.project.create({
      data: { name, description },
    });
  }

  /**
   * Updates an existing project.
   */
  async update(id: string, name: string, description?: string) {
    await this.ensureInitialized();
    return this.prisma.project.update({
      where: { id },
      data: { name, description },
    });
  }

  /**
   * Deletes a project.
   */
  async delete(id: string) {
    await this.ensureInitialized();
    return this.prisma.project.delete({
      where: { id },
    });
  }

  /**
   * Checks if a project can be closed (all tasks must be completed).
   */
  async canClose(id: string): Promise<boolean> {
    await this.ensureInitialized();
    const incompleteTasks = await this.prisma.task.count({
      where: {
        projectId: id,
        status: {
          name: { not: 'Completada' },
        },
      },
    });
    return incompleteTasks === 0;
  }

  /**
   * Closes a project.
   */
  async close(id: string) {
    await this.ensureInitialized();
    return this.prisma.project.update({
      where: { id },
      data: { isClosed: true },
    });
  }

  /**
   * Reopens a closed project.
   */
  async reopen(id: string) {
    await this.ensureInitialized();
    return this.prisma.project.update({
      where: { id },
      data: { isClosed: false },
    });
  }
}
