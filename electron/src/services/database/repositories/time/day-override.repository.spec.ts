import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { PrismaClient } from '../../../../generated/prisma/client.js';
import { DayOverrideRepository } from './day-override.repository.js';

describe('DayOverrideRepository', () => {
  let repository: DayOverrideRepository;
  let mockPrisma: {
    dayOverride: {
      findMany: Mock;
      findUnique: Mock;
      create: Mock;
      update: Mock;
      upsert: Mock;
      delete: Mock;
    };
  };
  let mockEnsureInitialized: Mock;

  beforeEach(() => {
    mockPrisma = {
      dayOverride: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        upsert: vi.fn(),
        delete: vi.fn(),
      },
    };
    mockEnsureInitialized = vi.fn().mockResolvedValue(undefined);
    repository = new DayOverrideRepository(
      mockPrisma as unknown as PrismaClient,
      mockEnsureInitialized,
    );
  });

  describe('getAll', () => {
    it('should return all day overrides with dayType included', async () => {
      const mockOverrides = [
        { id: '1', date: '2025-01-01', dayType: { name: 'Festivo' } },
        { id: '2', date: '2025-01-02', dayType: { name: 'Vacaciones' } },
      ];
      mockPrisma.dayOverride.findMany.mockResolvedValue(mockOverrides);

      const result = await repository.getAll();

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.dayOverride.findMany).toHaveBeenCalledWith({
        include: { dayType: true },
        orderBy: { date: 'asc' },
      });
      expect(result).toEqual(mockOverrides);
    });
  });

  describe('getByDateRange', () => {
    it('should return day overrides within date range', async () => {
      const mockOverrides = [{ id: '1', date: '2025-01-15' }];
      mockPrisma.dayOverride.findMany.mockResolvedValue(mockOverrides);

      const result = await repository.getByDateRange(
        '2025-01-01',
        '2025-01-31',
      );

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.dayOverride.findMany).toHaveBeenCalledWith({
        where: {
          date: {
            gte: '2025-01-01',
            lte: '2025-01-31',
          },
        },
        include: { dayType: true },
        orderBy: { date: 'asc' },
      });
      expect(result).toEqual(mockOverrides);
    });
  });

  describe('getByDate', () => {
    it('should return day override for specific date', async () => {
      const mockOverride = { id: '1', date: '2025-01-01' };
      mockPrisma.dayOverride.findUnique.mockResolvedValue(mockOverride);

      const result = await repository.getByDate('2025-01-01');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.dayOverride.findUnique).toHaveBeenCalledWith({
        where: { date: '2025-01-01' },
        include: { dayType: true },
      });
      expect(result).toEqual(mockOverride);
    });

    it('should return null when no override for date', async () => {
      mockPrisma.dayOverride.findUnique.mockResolvedValue(null);

      const result = await repository.getByDate('2025-01-01');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a day override with all fields', async () => {
      const mockOverride = {
        id: '1',
        date: '2025-01-01',
        dayTypeId: 'dt1',
        note: 'Note',
        minutes: 240,
      };
      mockPrisma.dayOverride.create.mockResolvedValue(mockOverride);

      const result = await repository.create({
        date: '2025-01-01',
        dayTypeId: 'dt1',
        note: 'Note',
        minutes: 240,
      });

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.dayOverride.create).toHaveBeenCalledWith({
        data: {
          date: '2025-01-01',
          dayTypeId: 'dt1',
          note: 'Note',
          minutes: 240,
        },
        include: { dayType: true },
      });
      expect(result).toEqual(mockOverride);
    });

    it('should create a day override with only required fields', async () => {
      const mockOverride = { id: '1', date: '2025-01-01' };
      mockPrisma.dayOverride.create.mockResolvedValue(mockOverride);

      const result = await repository.create({ date: '2025-01-01' });

      expect(mockPrisma.dayOverride.create).toHaveBeenCalledWith({
        data: {
          date: '2025-01-01',
          dayTypeId: undefined,
          note: undefined,
          minutes: undefined,
        },
        include: { dayType: true },
      });
      expect(result).toEqual(mockOverride);
    });
  });

  describe('update', () => {
    it('should update a day override', async () => {
      const mockOverride = { id: '1', dayTypeId: 'dt2', note: 'Updated' };
      mockPrisma.dayOverride.update.mockResolvedValue(mockOverride);

      const result = await repository.update('1', {
        dayTypeId: 'dt2',
        note: 'Updated',
      });

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.dayOverride.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { dayTypeId: 'dt2', note: 'Updated' },
        include: { dayType: true },
      });
      expect(result).toEqual(mockOverride);
    });
  });

  describe('upsert', () => {
    it('should upsert a day override', async () => {
      const mockOverride = { id: '1', date: '2025-01-01', dayTypeId: 'dt1' };
      mockPrisma.dayOverride.upsert.mockResolvedValue(mockOverride);

      const result = await repository.upsert({
        date: '2025-01-01',
        dayTypeId: 'dt1',
        note: 'Note',
        minutes: 240,
      });

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.dayOverride.upsert).toHaveBeenCalledWith({
        where: { date: '2025-01-01' },
        update: {
          dayTypeId: 'dt1',
          note: 'Note',
          minutes: 240,
        },
        create: {
          date: '2025-01-01',
          dayTypeId: 'dt1',
          note: 'Note',
          minutes: 240,
        },
        include: { dayType: true },
      });
      expect(result).toEqual(mockOverride);
    });
  });

  describe('delete', () => {
    it('should delete a day override by id', async () => {
      const mockOverride = { id: '1', date: '2025-01-01' };
      mockPrisma.dayOverride.delete.mockResolvedValue(mockOverride);

      const result = await repository.delete('1');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.dayOverride.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockOverride);
    });
  });

  describe('deleteByDate', () => {
    it('should delete a day override by date', async () => {
      const mockOverride = { id: '1', date: '2025-01-01' };
      mockPrisma.dayOverride.delete.mockResolvedValue(mockOverride);

      const result = await repository.deleteByDate('2025-01-01');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.dayOverride.delete).toHaveBeenCalledWith({
        where: { date: '2025-01-01' },
      });
      expect(result).toEqual(mockOverride);
    });
  });
});
