import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { PrismaClient } from '../../../../generated/prisma/client.js';
import { ActionHistoryRepository } from './action-history.repository.js';

describe('ActionHistoryRepository', () => {
  let repository: ActionHistoryRepository;
  let mockPrisma: {
    actionHistory: {
      findMany: Mock;
      findFirst: Mock;
      create: Mock;
      update: Mock;
      deleteMany: Mock;
    };
  };
  let mockEnsureInitialized: Mock;

  beforeEach(() => {
    mockPrisma = {
      actionHistory: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        deleteMany: vi.fn(),
      },
    };
    mockEnsureInitialized = vi.fn().mockResolvedValue(undefined);
    repository = new ActionHistoryRepository(
      mockPrisma as unknown as PrismaClient,
      mockEnsureInitialized,
    );
  });

  describe('create', () => {
    it('should create a new action history entry', async () => {
      const mockEntry = {
        id: '1',
        entityType: 'Task',
        entityId: 'task-1',
        actionType: 'CREATE',
        description: 'Created task',
        previousData: null,
        newData: '{"name":"Task 1"}',
        undone: false,
        createdAt: new Date(),
      };
      mockPrisma.actionHistory.create.mockResolvedValue(mockEntry);

      const result = await repository.create({
        entityType: 'Task',
        entityId: 'task-1',
        actionType: 'CREATE',
        description: 'Created task',
        newData: '{"name":"Task 1"}',
      });

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.actionHistory.create).toHaveBeenCalledWith({
        data: {
          entityType: 'Task',
          entityId: 'task-1',
          actionType: 'CREATE',
          description: 'Created task',
          previousData: undefined,
          newData: '{"name":"Task 1"}',
          undone: false,
        },
      });
      expect(result).toEqual(mockEntry);
    });
  });

  describe('getAll', () => {
    it('should return action history with default limit', async () => {
      const mockEntries = [
        { id: '1', entityType: 'Task', actionType: 'CREATE' },
        { id: '2', entityType: 'Task', actionType: 'UPDATE' },
      ];
      mockPrisma.actionHistory.findMany.mockResolvedValue(mockEntries);

      const result = await repository.getAll();

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.actionHistory.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      expect(result).toEqual(mockEntries);
    });

    it('should return action history with custom limit', async () => {
      const mockEntries = [{ id: '1', entityType: 'Task' }];
      mockPrisma.actionHistory.findMany.mockResolvedValue(mockEntries);

      const result = await repository.getAll(10);

      expect(mockPrisma.actionHistory.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      expect(result).toEqual(mockEntries);
    });
  });

  describe('getLastUndoable', () => {
    it('should return the last undoable action', async () => {
      const mockEntry = {
        id: '1',
        entityType: 'Task',
        actionType: 'CREATE',
        undone: false,
      };
      mockPrisma.actionHistory.findFirst.mockResolvedValue(mockEntry);

      const result = await repository.getLastUndoable();

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.actionHistory.findFirst).toHaveBeenCalledWith({
        where: { undone: false },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockEntry);
    });

    it('should return null if no undoable actions', async () => {
      mockPrisma.actionHistory.findFirst.mockResolvedValue(null);

      const result = await repository.getLastUndoable();

      expect(result).toBeNull();
    });
  });

  describe('getLastRedoable', () => {
    it('should return the last redoable action', async () => {
      const mockEntry = {
        id: '1',
        entityType: 'Task',
        actionType: 'CREATE',
        undone: true,
      };
      mockPrisma.actionHistory.findFirst.mockResolvedValue(mockEntry);

      const result = await repository.getLastRedoable();

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.actionHistory.findFirst).toHaveBeenCalledWith({
        where: { undone: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockEntry);
    });
  });

  describe('markUndone', () => {
    it('should mark an action as undone', async () => {
      const mockEntry = { id: '1', undone: true };
      mockPrisma.actionHistory.update.mockResolvedValue(mockEntry);

      const result = await repository.markUndone('1');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.actionHistory.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { undone: true },
      });
      expect(result).toEqual(mockEntry);
    });
  });

  describe('markRedone', () => {
    it('should mark an action as redone', async () => {
      const mockEntry = { id: '1', undone: false };
      mockPrisma.actionHistory.update.mockResolvedValue(mockEntry);

      const result = await repository.markRedone('1');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.actionHistory.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { undone: false },
      });
      expect(result).toEqual(mockEntry);
    });
  });

  describe('clear', () => {
    it('should clear all action history', async () => {
      mockPrisma.actionHistory.deleteMany.mockResolvedValue({ count: 10 });

      const result = await repository.clear();

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.actionHistory.deleteMany).toHaveBeenCalledWith();
      expect(result).toEqual({ count: 10 });
    });
  });

  describe('cleanOld', () => {
    it('should clean actions older than specified days', async () => {
      mockPrisma.actionHistory.deleteMany.mockResolvedValue({ count: 5 });

      const result = await repository.cleanOld(30);

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.actionHistory.deleteMany).toHaveBeenCalledWith({
        where: {
          createdAt: { lt: expect.any(Date) },
        },
      });
      expect(result).toEqual({ count: 5 });
    });

    it('should use default 30 days if not specified', async () => {
      mockPrisma.actionHistory.deleteMany.mockResolvedValue({ count: 3 });

      await repository.cleanOld();

      expect(mockPrisma.actionHistory.deleteMany).toHaveBeenCalledWith({
        where: {
          createdAt: { lt: expect.any(Date) },
        },
      });
    });
  });
});
