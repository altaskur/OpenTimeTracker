import {
  PrismaClient,
  ActionHistory,
} from '../../../../generated/prisma/client.js';
import { BaseRepository } from '../base.repository.js';

/**
 * Repository for action history database operations.
 * Handles undo/redo functionality tracking.
 */
export class ActionHistoryRepository extends BaseRepository {
  constructor(prisma: PrismaClient, ensureInitialized: () => Promise<void>) {
    super(prisma, ensureInitialized);
  }

  /**
   * Creates a new action history entry.
   */
  async create(data: {
    entityType: string;
    entityId: string;
    actionType: string;
    description: string;
    previousData?: string;
    newData?: string;
  }): Promise<ActionHistory> {
    await this.ensureInitialized();
    return this.prisma.actionHistory.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        actionType: data.actionType,
        description: data.description,
        previousData: data.previousData,
        newData: data.newData,
        undone: false,
      },
    });
  }

  /**
   * Gets action history entries with limit.
   */
  async getAll(limit = 50): Promise<ActionHistory[]> {
    await this.ensureInitialized();
    return this.prisma.actionHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Gets the last action that can be undone.
   */
  async getLastUndoable(): Promise<ActionHistory | null> {
    await this.ensureInitialized();
    return this.prisma.actionHistory.findFirst({
      where: { undone: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Gets the last action that can be redone.
   */
  async getLastRedoable(): Promise<ActionHistory | null> {
    await this.ensureInitialized();
    return this.prisma.actionHistory.findFirst({
      where: { undone: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Marks an action as undone.
   */
  async markUndone(id: string): Promise<ActionHistory> {
    await this.ensureInitialized();
    return this.prisma.actionHistory.update({
      where: { id },
      data: { undone: true },
    });
  }

  /**
   * Marks an action as redone (not undone).
   */
  async markRedone(id: string): Promise<ActionHistory> {
    await this.ensureInitialized();
    return this.prisma.actionHistory.update({
      where: { id },
      data: { undone: false },
    });
  }

  /**
   * Clears all action history.
   */
  async clear(): Promise<{ count: number }> {
    await this.ensureInitialized();
    return this.prisma.actionHistory.deleteMany();
  }

  /**
   * Clears actions older than specified days.
   */
  async cleanOld(daysOld = 30): Promise<{ count: number }> {
    await this.ensureInitialized();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    return this.prisma.actionHistory.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });
  }
}
