import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { PrismaClient } from '../../../../generated/prisma/client.js';
import { TimeEntryRepository } from './time-entry.repository.js';

describe('TimeEntryRepository', () => {
  let repository: TimeEntryRepository;
  let mockPrisma: {
    timeEntry: {
      findMany: Mock;
      create: Mock;
      update: Mock;
      delete: Mock;
    };
  };
  let mockEnsureInitialized: Mock;

  beforeEach(() => {
    mockPrisma = {
      timeEntry: {
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    mockEnsureInitialized = vi.fn().mockResolvedValue(undefined);
    repository = new TimeEntryRepository(
      mockPrisma as unknown as PrismaClient,
      mockEnsureInitialized,
    );
  });

  describe('getAll', () => {
    it('should return all time entries without filter', async () => {
      const mockEntries = [
        { id: '1', date: '2025-01-01', minutes: 60 },
        { id: '2', date: '2025-01-02', minutes: 120 },
      ];
      mockPrisma.timeEntry.findMany.mockResolvedValue(mockEntries);

      const result = await repository.getAll();

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.timeEntry.findMany).toHaveBeenCalledWith({
        where: undefined,
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
      expect(result).toEqual(mockEntries);
    });

    it('should return time entries filtered by taskId', async () => {
      const mockEntries = [{ id: '1', taskId: 'task1' }];
      mockPrisma.timeEntry.findMany.mockResolvedValue(mockEntries);

      const result = await repository.getAll('task1');

      expect(mockPrisma.timeEntry.findMany).toHaveBeenCalledWith({
        where: { taskId: 'task1' },
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
      expect(result).toEqual(mockEntries);
    });
  });

  describe('getByDateRange', () => {
    it('should return time entries within date range', async () => {
      const mockEntries = [{ id: '1', date: '2025-01-15' }];
      mockPrisma.timeEntry.findMany.mockResolvedValue(mockEntries);

      const result = await repository.getByDateRange(
        '2025-01-01',
        '2025-01-31',
      );

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.timeEntry.findMany).toHaveBeenCalledWith({
        where: {
          date: {
            gte: '2025-01-01',
            lte: '2025-01-31',
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
      expect(result).toEqual(mockEntries);
    });
  });

  describe('getByDate', () => {
    it('should return time entries for a specific date', async () => {
      const mockEntries = [
        { id: '1', date: '2025-01-01' },
        { id: '2', date: '2025-01-01' },
      ];
      mockPrisma.timeEntry.findMany.mockResolvedValue(mockEntries);

      const result = await repository.getByDate('2025-01-01');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.timeEntry.findMany).toHaveBeenCalledWith({
        where: { date: '2025-01-01' },
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
      expect(result).toEqual(mockEntries);
    });
  });

  describe('getPending', () => {
    it('should return time entries without task', async () => {
      const mockEntries = [{ id: '1', taskId: null }];
      mockPrisma.timeEntry.findMany.mockResolvedValue(mockEntries);

      const result = await repository.getPending();

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.timeEntry.findMany).toHaveBeenCalledWith({
        where: { taskId: null },
        orderBy: { date: 'desc' },
      });
      expect(result).toEqual(mockEntries);
    });
  });

  describe('create', () => {
    it('should create a time entry with all fields', async () => {
      const mockEntry = {
        id: '1',
        date: '2025-01-01',
        minutes: 60,
        taskId: 'task1',
        notes: 'Working',
      };
      mockPrisma.timeEntry.create.mockResolvedValue(mockEntry);

      const result = await repository.create(
        '2025-01-01',
        60,
        'task1',
        'Working',
      );

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.timeEntry.create).toHaveBeenCalledWith({
        data: {
          date: '2025-01-01',
          minutes: 60,
          taskId: 'task1',
          notes: 'Working',
        },
      });
      expect(result).toEqual(mockEntry);
    });

    it('should create a time entry without optional fields', async () => {
      const mockEntry = { id: '1', date: '2025-01-01', minutes: 60 };
      mockPrisma.timeEntry.create.mockResolvedValue(mockEntry);

      const result = await repository.create('2025-01-01', 60);

      expect(mockPrisma.timeEntry.create).toHaveBeenCalledWith({
        data: {
          date: '2025-01-01',
          minutes: 60,
          taskId: undefined,
          notes: undefined,
        },
      });
      expect(result).toEqual(mockEntry);
    });
  });

  describe('update', () => {
    it('should update a time entry', async () => {
      const mockEntry = { id: '1', minutes: 120, notes: 'Updated' };
      mockPrisma.timeEntry.update.mockResolvedValue(mockEntry);

      const result = await repository.update('1', {
        minutes: 120,
        notes: 'Updated',
      });

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.timeEntry.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { minutes: 120, notes: 'Updated' },
      });
      expect(result).toEqual(mockEntry);
    });
  });

  describe('delete', () => {
    it('should delete a time entry', async () => {
      const mockEntry = { id: '1' };
      mockPrisma.timeEntry.delete.mockResolvedValue(mockEntry);

      const result = await repository.delete('1');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.timeEntry.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockEntry);
    });
  });
});
