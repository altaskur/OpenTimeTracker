import { PrismaClient } from '../../../../generated/prisma/client.js';
import { BaseRepository } from '../base.repository.js';

/**
 * Repository for audit log database operations.
 */
export class AuditLogRepository extends BaseRepository {
  constructor(prisma: PrismaClient, ensureInitialized: () => Promise<void>) {
    super(prisma, ensureInitialized);
  }

  /**
   * Creates a new audit log entry.
   */
  async create(data: {
    action: string;
    entityType: string;
    entityId: string;
    changes?: string;
    userName?: string;
    projectId?: string;
    taskId?: string;
  }) {
    await this.ensureInitialized();
    return this.prisma.auditLog.create({
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        changes: data.changes,
        userName: data.userName,
        projectId: data.projectId,
        taskId: data.taskId,
      },
    });
  }

  /**
   * Gets all audit logs, optionally filtered.
   */
  async getAll(filter?: {
    entityType?: string;
    entityId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    await this.ensureInitialized();

    const where: Record<string, unknown> = {};

    if (filter?.entityType) {
      where.entityType = filter.entityType;
    }
    if (filter?.entityId) {
      where.entityId = filter.entityId;
    }
    if (filter?.action) {
      where.action = filter.action;
    }
    if (filter?.startDate || filter?.endDate) {
      where.createdAt = {};
      if (filter.startDate) {
        (where.createdAt as Record<string, Date>).gte = filter.startDate;
      }
      if (filter.endDate) {
        (where.createdAt as Record<string, Date>).lte = filter.endDate;
      }
    }

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filter?.limit,
    });
  }

  /**
   * Gets audit logs for a specific entity.
   */
  async getByEntity(entityType: string, entityId: string) {
    await this.ensureInitialized();
    return this.prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Gets recent audit logs.
   */
  async getRecent(limit = 50) {
    await this.ensureInitialized();
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Deletes old audit logs.
   */
  async deleteOlderThan(date: Date) {
    await this.ensureInitialized();
    return this.prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: date,
        },
      },
    });
  }
}
