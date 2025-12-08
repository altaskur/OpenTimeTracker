import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { PrismaClient } from '../../../../generated/prisma/client.js';
import { MonthConfigRepository } from './month-config.repository.js';

describe('MonthConfigRepository', () => {
  let repository: MonthConfigRepository;
  let mockPrisma: {
    monthConfig: {
      findUnique: Mock;
      create: Mock;
      update: Mock;
    };
  };
  let mockEnsureInitialized: Mock;

  beforeEach(() => {
    mockPrisma = {
      monthConfig: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };
    mockEnsureInitialized = vi.fn().mockResolvedValue(undefined);
    repository = new MonthConfigRepository(
      mockPrisma as unknown as PrismaClient,
      mockEnsureInitialized,
    );
  });

  describe('get', () => {
    it('should return month config by year and month', async () => {
      const mockConfig = {
        id: '1',
        year: 2025,
        month: 12,
        weeklyMinutes: 2400,
        workDays: '1,2,3,4,5',
        daySchedule: '{"1":480}',
      };
      mockPrisma.monthConfig.findUnique.mockResolvedValue(mockConfig);

      const result = await repository.get(2025, 12);

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.monthConfig.findUnique).toHaveBeenCalledWith({
        where: { year_month: { year: 2025, month: 12 } },
      });
      expect(result).toEqual(mockConfig);
    });

    it('should return null if month config not found', async () => {
      mockPrisma.monthConfig.findUnique.mockResolvedValue(null);

      const result = await repository.get(2025, 1);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new month config', async () => {
      const mockConfig = {
        id: '1',
        year: 2025,
        month: 12,
        weeklyMinutes: 2400,
        workDays: '1,2,3,4,5',
        daySchedule: '{"1":480}',
      };
      mockPrisma.monthConfig.create.mockResolvedValue(mockConfig);

      const result = await repository.create(2025, 12, {
        weeklyMinutes: 2400,
        workDays: '1,2,3,4,5',
        daySchedule: '{"1":480}',
      });

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.monthConfig.create).toHaveBeenCalledWith({
        data: {
          year: 2025,
          month: 12,
          weeklyMinutes: 2400,
          workDays: '1,2,3,4,5',
          daySchedule: '{"1":480}',
        },
      });
      expect(result).toEqual(mockConfig);
    });
  });

  describe('update', () => {
    it('should update an existing month config', async () => {
      const mockConfig = {
        id: '1',
        year: 2025,
        month: 12,
        weeklyMinutes: 2000,
        workDays: '1,2,3,4',
        daySchedule: '{"1":500}',
      };
      mockPrisma.monthConfig.update.mockResolvedValue(mockConfig);

      const result = await repository.update(2025, 12, {
        weeklyMinutes: 2000,
        workDays: '1,2,3,4',
      });

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.monthConfig.update).toHaveBeenCalledWith({
        where: { year_month: { year: 2025, month: 12 } },
        data: { weeklyMinutes: 2000, workDays: '1,2,3,4' },
      });
      expect(result).toEqual(mockConfig);
    });

    it('should update only specified fields', async () => {
      const mockConfig = {
        id: '1',
        year: 2025,
        month: 12,
        weeklyMinutes: 2400,
        workDays: '1,2,3,4,5',
        daySchedule: '{"1":480}',
      };
      mockPrisma.monthConfig.update.mockResolvedValue(mockConfig);

      const result = await repository.update(2025, 12, {
        daySchedule: '{"1":480}',
      });

      expect(mockPrisma.monthConfig.update).toHaveBeenCalledWith({
        where: { year_month: { year: 2025, month: 12 } },
        data: { daySchedule: '{"1":480}' },
      });
      expect(result).toEqual(mockConfig);
    });
  });
});
