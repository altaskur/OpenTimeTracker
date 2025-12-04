import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { PrismaClient } from '../../../../generated/prisma/client.js';
import { AuditLogRepository } from './audit-log.repository.js';

describe('AuditLogRepository', () => {
  let repository: AuditLogRepository;
  let mockPrisma: {
    auditLog: {
      create: Mock;
      findMany: Mock;
      deleteMany: Mock;
    };
  };
  let mockEnsureInitialized: Mock;

  beforeEach(() => {
    mockPrisma = {
      auditLog: {
        create: vi.fn(),
        findMany: vi.fn(),
        deleteMany: vi.fn(),
      },
    };
    mockEnsureInitialized = vi.fn().mockResolvedValue(undefined);
    repository = new AuditLogRepository(
      mockPrisma as unknown as PrismaClient,
      mockEnsureInitialized,
    );
  });

  describe('create', () => {
    it('should create an audit log entry with all fields', async () => {
      const mockLog = {
        id: '1',
        action: 'CREATE',
        entityType: 'Task',
        entityId: 'task1',
        changes: '{}',
        userName: 'user',
        projectId: 'proj1',
        taskId: 'task1',
      };
      mockPrisma.auditLog.create.mockResolvedValue(mockLog);

      const result = await repository.create({
        action: 'CREATE',
        entityType: 'Task',
        entityId: 'task1',
        changes: '{}',
        userName: 'user',
        projectId: 'proj1',
        taskId: 'task1',
      });

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          action: 'CREATE',
          entityType: 'Task',
          entityId: 'task1',
          changes: '{}',
          userName: 'user',
          projectId: 'proj1',
          taskId: 'task1',
        },
      });
      expect(result).toEqual(mockLog);
    });

    it('should create an audit log entry with minimal fields', async () => {
      const mockLog = {
        id: '1',
        action: 'DELETE',
        entityType: 'Project',
        entityId: 'proj1',
      };
      mockPrisma.auditLog.create.mockResolvedValue(mockLog);

      const result = await repository.create({
        action: 'DELETE',
        entityType: 'Project',
        entityId: 'proj1',
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          action: 'DELETE',
          entityType: 'Project',
          entityId: 'proj1',
          changes: undefined,
          userName: undefined,
          projectId: undefined,
          taskId: undefined,
        },
      });
      expect(result).toEqual(mockLog);
    });
  });

  describe('getAll', () => {
    it('should return all audit logs without filters', async () => {
      const mockLogs = [{ id: '1' }, { id: '2' }];
      mockPrisma.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await repository.getAll();

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        take: undefined,
      });
      expect(result).toEqual(mockLogs);
    });

    it('should filter by entityType', async () => {
      const mockLogs = [{ id: '1', entityType: 'Task' }];
      mockPrisma.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await repository.getAll({ entityType: 'Task' });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith({
        where: { entityType: 'Task' },
        orderBy: { createdAt: 'desc' },
        take: undefined,
      });
      expect(result).toEqual(mockLogs);
    });

    it('should filter by entityId', async () => {
      const mockLogs = [{ id: '1', entityId: 'task1' }];
      mockPrisma.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await repository.getAll({ entityId: 'task1' });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith({
        where: { entityId: 'task1' },
        orderBy: { createdAt: 'desc' },
        take: undefined,
      });
      expect(result).toEqual(mockLogs);
    });

    it('should filter by action', async () => {
      const mockLogs = [{ id: '1', action: 'CREATE' }];
      mockPrisma.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await repository.getAll({ action: 'CREATE' });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith({
        where: { action: 'CREATE' },
        orderBy: { createdAt: 'desc' },
        take: undefined,
      });
      expect(result).toEqual(mockLogs);
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const mockLogs = [{ id: '1' }];
      mockPrisma.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await repository.getAll({ startDate, endDate });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: undefined,
      });
      expect(result).toEqual(mockLogs);
    });

    it('should filter by startDate only', async () => {
      const startDate = new Date('2025-01-01');
      const mockLogs = [{ id: '1' }];
      mockPrisma.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await repository.getAll({ startDate });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: undefined,
      });
      expect(result).toEqual(mockLogs);
    });

    it('should filter by endDate only', async () => {
      const endDate = new Date('2025-01-31');
      const mockLogs = [{ id: '1' }];
      mockPrisma.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await repository.getAll({ endDate });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            lte: endDate,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: undefined,
      });
      expect(result).toEqual(mockLogs);
    });

    it('should apply limit', async () => {
      const mockLogs = [{ id: '1' }];
      mockPrisma.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await repository.getAll({ limit: 10 });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      expect(result).toEqual(mockLogs);
    });

    it('should combine multiple filters', async () => {
      const mockLogs = [{ id: '1' }];
      mockPrisma.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await repository.getAll({
        entityType: 'Task',
        action: 'UPDATE',
        limit: 5,
      });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          entityType: 'Task',
          action: 'UPDATE',
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
      expect(result).toEqual(mockLogs);
    });
  });

  describe('getByEntity', () => {
    it('should return logs for specific entity', async () => {
      const mockLogs = [{ id: '1', entityType: 'Task', entityId: 'task1' }];
      mockPrisma.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await repository.getByEntity('Task', 'task1');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          entityType: 'Task',
          entityId: 'task1',
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockLogs);
    });
  });

  describe('getRecent', () => {
    it('should return recent logs with default limit', async () => {
      const mockLogs = [{ id: '1' }, { id: '2' }];
      mockPrisma.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await repository.getRecent();

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      expect(result).toEqual(mockLogs);
    });

    it('should return recent logs with custom limit', async () => {
      const mockLogs = [{ id: '1' }];
      mockPrisma.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await repository.getRecent(10);

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      expect(result).toEqual(mockLogs);
    });
  });

  describe('deleteOlderThan', () => {
    it('should delete logs older than specified date', async () => {
      const date = new Date('2025-01-01');
      const mockResult = { count: 5 };
      mockPrisma.auditLog.deleteMany.mockResolvedValue(mockResult);

      const result = await repository.deleteOlderThan(date);

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.auditLog.deleteMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            lt: date,
          },
        },
      });
      expect(result).toEqual(mockResult);
    });
  });
});
