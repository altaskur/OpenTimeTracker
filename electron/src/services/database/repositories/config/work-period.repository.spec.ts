import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { PrismaClient } from '../../../../generated/prisma/client.js';
import { WorkPeriodRepository } from './work-period.repository.js';

describe('WorkPeriodRepository', () => {
  let repository: WorkPeriodRepository;
  let mockPrisma: {
    workPeriod: {
      findMany: Mock;
      findUnique: Mock;
      create: Mock;
      update: Mock;
      upsert: Mock;
    };
  };
  let mockEnsureInitialized: Mock;

  beforeEach(() => {
    mockPrisma = {
      workPeriod: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        upsert: vi.fn(),
      },
    };
    mockEnsureInitialized = vi.fn().mockResolvedValue(undefined);
    repository = new WorkPeriodRepository(
      mockPrisma as unknown as PrismaClient,
      mockEnsureInitialized,
    );
  });

  describe('getAll', () => {
    it('should return all work periods ordered by year and month descending', async () => {
      const mockPeriods = [
        { id: '1', year: 2025, month: 12, plannedHours: 160 },
        { id: '2', year: 2025, month: 11, plannedHours: 168 },
      ];
      mockPrisma.workPeriod.findMany.mockResolvedValue(mockPeriods);

      const result = await repository.getAll();

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.workPeriod.findMany).toHaveBeenCalledWith({
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      });
      expect(result).toEqual(mockPeriods);
    });
  });

  describe('get', () => {
    it('should return a specific work period by year and month', async () => {
      const mockPeriod = { id: '1', year: 2025, month: 12, plannedHours: 160 };
      mockPrisma.workPeriod.findUnique.mockResolvedValue(mockPeriod);

      const result = await repository.get(2025, 12);

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.workPeriod.findUnique).toHaveBeenCalledWith({
        where: { year_month: { year: 2025, month: 12 } },
      });
      expect(result).toEqual(mockPeriod);
    });

    it('should return null if work period not found', async () => {
      mockPrisma.workPeriod.findUnique.mockResolvedValue(null);

      const result = await repository.get(2025, 1);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new work period', async () => {
      const mockPeriod = {
        id: '1',
        year: 2025,
        month: 12,
        plannedHours: 160,
        note: 'December period',
      };
      mockPrisma.workPeriod.create.mockResolvedValue(mockPeriod);

      const result = await repository.create(2025, 12, 160, 'December period');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.workPeriod.create).toHaveBeenCalledWith({
        data: {
          year: 2025,
          month: 12,
          plannedHours: 160,
          note: 'December period',
        },
      });
      expect(result).toEqual(mockPeriod);
    });

    it('should create a work period without note', async () => {
      const mockPeriod = {
        id: '1',
        year: 2025,
        month: 12,
        plannedHours: 160,
      };
      mockPrisma.workPeriod.create.mockResolvedValue(mockPeriod);

      const result = await repository.create(2025, 12, 160);

      expect(mockPrisma.workPeriod.create).toHaveBeenCalledWith({
        data: {
          year: 2025,
          month: 12,
          plannedHours: 160,
          note: undefined,
        },
      });
      expect(result).toEqual(mockPeriod);
    });
  });

  describe('update', () => {
    it('should update an existing work period', async () => {
      const mockPeriod = {
        id: '1',
        year: 2025,
        month: 12,
        plannedHours: 168,
        note: 'Updated note',
      };
      mockPrisma.workPeriod.update.mockResolvedValue(mockPeriod);

      const result = await repository.update(2025, 12, {
        plannedHours: 168,
        note: 'Updated note',
      });

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.workPeriod.update).toHaveBeenCalledWith({
        where: { year_month: { year: 2025, month: 12 } },
        data: { plannedHours: 168, note: 'Updated note' },
      });
      expect(result).toEqual(mockPeriod);
    });
  });

  describe('upsert', () => {
    it('should create or update a work period', async () => {
      const mockPeriod = {
        id: '1',
        year: 2025,
        month: 12,
        plannedHours: 160,
        note: 'Upserted period',
      };
      mockPrisma.workPeriod.upsert.mockResolvedValue(mockPeriod);

      const result = await repository.upsert(2025, 12, 160, 'Upserted period');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.workPeriod.upsert).toHaveBeenCalledWith({
        where: { year_month: { year: 2025, month: 12 } },
        update: { plannedHours: 160, note: 'Upserted period' },
        create: {
          year: 2025,
          month: 12,
          plannedHours: 160,
          note: 'Upserted period',
        },
      });
      expect(result).toEqual(mockPeriod);
    });
  });
});
