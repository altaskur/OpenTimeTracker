import {
  PrismaClient,
  TaskStatus,
} from '../../../../generated/prisma/client.js';
import { BaseRepository } from '../base.repository.js';

/**
 * Repository for task status database operations.
 */
export class TaskStatusRepository extends BaseRepository {
  constructor(prisma: PrismaClient, ensureInitialized: () => Promise<void>) {
    super(prisma, ensureInitialized);
  }

  /**
   * Gets all task statuses ordered by name.
   */
  async getAll(): Promise<TaskStatus[]> {
    await this.ensureInitialized();
    return this.prisma.taskStatus.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Creates a new task status.
   */
  async create(name: string, color: string): Promise<TaskStatus> {
    await this.ensureInitialized();
    return this.prisma.taskStatus.create({
      data: { name, color, isDefault: false },
    });
  }

  /**
   * Updates an existing task status.
   */
  async update(id: string, name: string, color: string): Promise<TaskStatus> {
    await this.ensureInitialized();
    return this.prisma.taskStatus.update({
      where: { id },
      data: { name, color },
    });
  }

  /**
   * Deletes a task status if not default.
   */
  async delete(id: string): Promise<TaskStatus | null> {
    await this.ensureInitialized();
    const status = await this.prisma.taskStatus.findUnique({
      where: { id },
    });

    if (!status) {
      return null;
    }

    if (status.isDefault) {
      throw new Error('Cannot delete default status');
    }

    return this.prisma.taskStatus.delete({
      where: { id },
    });
  }

  /**
   * Finds a task status by name.
   */
  async findByName(name: string): Promise<TaskStatus | null> {
    await this.ensureInitialized();
    return this.prisma.taskStatus.findUnique({
      where: { name },
    });
  }
}
