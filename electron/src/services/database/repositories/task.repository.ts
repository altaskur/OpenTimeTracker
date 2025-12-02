import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './base.repository';

/**
 * Repository for task-related database operations.
 */
export class TaskRepository extends BaseRepository {
  constructor(prisma: PrismaClient, ensureInitialized: () => Promise<void>) {
    super(prisma, ensureInitialized);
  }

  /**
   * Gets all tasks, optionally filtered by project.
   */
  async getAll(projectId?: string) {
    await this.ensureInitialized();
    return this.prisma.task.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        status: true,
        project: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Creates a new task.
   */
  async create(
    projectId: string,
    name: string,
    description?: string,
    estimatedHours?: number,
    statusId?: string,
    tagIds?: string[],
  ) {
    await this.ensureInitialized();
    return this.prisma.task.create({
      data: {
        projectId,
        name,
        description,
        estimatedHours,
        statusId,
        ...(tagIds &&
          tagIds.length > 0 && {
            tags: {
              create: tagIds.map((tagId) => ({ tagId })),
            },
          }),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  /**
   * Updates an existing task.
   */
  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      estimatedHours?: number;
      statusId?: string;
      tagIds?: string[];
    },
  ) {
    await this.ensureInitialized();
    const { tagIds, ...updateData } = data;

    return this.prisma.task.update({
      where: { id },
      data: {
        ...updateData,
        ...(tagIds !== undefined && {
          tags: {
            deleteMany: {},
            create: tagIds.map((tagId) => ({ tagId })),
          },
        }),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  /**
   * Deletes a task.
   */
  async delete(id: string) {
    await this.ensureInitialized();
    return this.prisma.task.delete({
      where: { id },
    });
  }

  /**
   * Gets all task statuses.
   */
  async getStatuses() {
    await this.ensureInitialized();
    return this.prisma.taskStatus.findMany();
  }
}
