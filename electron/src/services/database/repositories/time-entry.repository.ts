import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './base.repository';

/**
 * Repository for time entry database operations.
 */
export class TimeEntryRepository extends BaseRepository {
  constructor(prisma: PrismaClient, ensureInitialized: () => Promise<void>) {
    super(prisma, ensureInitialized);
  }

  /**
   * Gets all time entries, optionally filtered by task.
   */
  async getAll(taskId?: string) {
    await this.ensureInitialized();
    return this.prisma.timeEntry.findMany({
      where: taskId ? { taskId } : undefined,
      include: {
        task: {
          include: {
            project: true,
            status: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Gets time entries within a date range.
   */
  async getByDateRange(startDate: string, endDate: string) {
    await this.ensureInitialized();
    return this.prisma.timeEntry.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        task: {
          include: {
            project: true,
            status: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Gets time entries for a specific date.
   */
  async getByDate(date: string) {
    await this.ensureInitialized();
    return this.prisma.timeEntry.findMany({
      where: { date },
      include: {
        task: {
          include: {
            project: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Gets time entries without assigned task.
   */
  async getPending() {
    await this.ensureInitialized();
    return this.prisma.timeEntry.findMany({
      where: { taskId: null },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Creates a new time entry.
   */
  async create(date: string, minutes: number, taskId?: string, notes?: string) {
    await this.ensureInitialized();
    return this.prisma.timeEntry.create({
      data: { date, minutes, taskId, notes },
    });
  }

  /**
   * Updates an existing time entry.
   */
  async update(
    id: string,
    data: {
      taskId?: string;
      date?: string;
      minutes?: number;
      notes?: string;
    },
  ) {
    await this.ensureInitialized();
    return this.prisma.timeEntry.update({
      where: { id },
      data,
    });
  }

  /**
   * Deletes a time entry.
   */
  async delete(id: string) {
    await this.ensureInitialized();
    return this.prisma.timeEntry.delete({
      where: { id },
    });
  }
}
