import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { PrismaClient } from '../../../../generated/prisma/client.js';
import { WorkConfigRepository } from './work-config.repository.js';

describe('WorkConfigRepository', () => {
  let repository: WorkConfigRepository;
  let mockPrisma: {
    workConfig: {
      findUnique: Mock;
      create: Mock;
      upsert: Mock;
    };
    monthConfig: {
      findUnique: Mock;
      findMany: Mock;
      create: Mock;
      update: Mock;
      delete: Mock;
    };
  };
  let mockEnsureInitialized: Mock;

  beforeEach(() => {
    mockPrisma = {
      workConfig: {
        findUnique: vi.fn(),
        create: vi.fn(),
        upsert: vi.fn(),
      },
      monthConfig: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    mockEnsureInitialized = vi.fn().mockResolvedValue(undefined);
    repository = new WorkConfigRepository(
      mockPrisma as unknown as PrismaClient,
      mockEnsureInitialized,
    );
  });

  describe('get', () => {
    it('should return existing work config', async () => {
      const mockConfig = { id: 'work_config', dailyMinutes: 480 };
      mockPrisma.workConfig.findUnique.mockResolvedValue(mockConfig);

      const result = await repository.get();

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.workConfig.findUnique).toHaveBeenCalledWith({
        where: { id: 'work_config' },
      });
      expect(result).toEqual(mockConfig);
    });

    it('should create default config when not exists', async () => {
      const mockConfig = { id: 'work_config' };
      mockPrisma.workConfig.findUnique.mockResolvedValue(null);
      mockPrisma.workConfig.create.mockResolvedValue(mockConfig);

      const result = await repository.get();

      expect(mockPrisma.workConfig.create).toHaveBeenCalledWith({
        data: { id: 'work_config' },
      });
      expect(result).toEqual(mockConfig);
    });
  });

  describe('update', () => {
    it('should upsert work config', async () => {
      const mockConfig = { id: 'work_config', dailyMinutes: 480 };
      mockPrisma.workConfig.upsert.mockResolvedValue(mockConfig);

      const result = await repository.update({ dailyMinutes: 480 });

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.workConfig.upsert).toHaveBeenCalledWith({
        where: { id: 'work_config' },
        update: { dailyMinutes: 480 },
        create: { id: 'work_config', dailyMinutes: 480 },
      });
      expect(result).toEqual(mockConfig);
    });
  });

  describe('getMonthConfig', () => {
    it('should return existing month config', async () => {
      const mockMonthConfig = { year: 2025, month: 1, weeklyMinutes: 2400 };
      mockPrisma.monthConfig.findUnique.mockResolvedValue(mockMonthConfig);

      const result = await repository.getMonthConfig(2025, 1);

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.monthConfig.findUnique).toHaveBeenCalledWith({
        where: { year_month: { year: 2025, month: 1 } },
      });
      expect(result).toEqual(mockMonthConfig);
    });

    it('should create month config from work config when not exists', async () => {
      const mockWorkConfig = {
        id: 'work_config',
        weeklyMinutes: 2400,
        workDays: '1,2,3,4,5',
        daySchedule: '{}',
      };
      const mockMonthConfig = {
        year: 2025,
        month: 1,
        weeklyMinutes: 2400,
        workDays: '1,2,3,4,5',
        daySchedule: '{}',
      };
      mockPrisma.monthConfig.findUnique.mockResolvedValue(null);
      mockPrisma.workConfig.findUnique.mockResolvedValue(mockWorkConfig);
      mockPrisma.monthConfig.create.mockResolvedValue(mockMonthConfig);

      const result = await repository.getMonthConfig(2025, 1);

      expect(mockPrisma.monthConfig.create).toHaveBeenCalledWith({
        data: {
          year: 2025,
          month: 1,
          weeklyMinutes: 2400,
          workDays: '1,2,3,4,5',
          daySchedule: '{}',
        },
      });
      expect(result).toEqual(mockMonthConfig);
    });
  });

  describe('updateMonthConfig', () => {
    it('should update existing month config', async () => {
      const existingConfig = { year: 2025, month: 1 };
      const mockResult = { year: 2025, month: 1, weeklyMinutes: 2000 };
      mockPrisma.monthConfig.findUnique.mockResolvedValue(existingConfig);
      mockPrisma.monthConfig.update.mockResolvedValue(mockResult);

      const result = await repository.updateMonthConfig(2025, 1, {
        weeklyMinutes: 2000,
      });

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.monthConfig.update).toHaveBeenCalledWith({
        where: { year_month: { year: 2025, month: 1 } },
        data: { weeklyMinutes: 2000 },
      });
      expect(result).toEqual(mockResult);
    });

    it('should create month config if not exists', async () => {
      const mockWorkConfig = {
        id: 'work_config',
        weeklyMinutes: 2400,
        workDays: '1,2,3,4,5',
        daySchedule: '{}',
      };
      const mockResult = { year: 2025, month: 1, weeklyMinutes: 2000 };
      mockPrisma.monthConfig.findUnique.mockResolvedValue(null);
      mockPrisma.workConfig.findUnique.mockResolvedValue(mockWorkConfig);
      mockPrisma.monthConfig.create.mockResolvedValue(mockResult);

      const result = await repository.updateMonthConfig(2025, 1, {
        weeklyMinutes: 2000,
      });

      expect(mockPrisma.monthConfig.create).toHaveBeenCalledWith({
        data: {
          year: 2025,
          month: 1,
          weeklyMinutes: 2000,
          workDays: '1,2,3,4,5',
          daySchedule: '{}',
        },
      });
      expect(result).toEqual(mockResult);
    });

    it('should use work config defaults for missing values', async () => {
      const mockWorkConfig = {
        id: 'work_config',
        weeklyMinutes: 2400,
        workDays: '1,2,3,4,5',
        daySchedule: '{}',
      };
      const mockResult = { year: 2025, month: 1 };
      mockPrisma.monthConfig.findUnique.mockResolvedValue(null);
      mockPrisma.workConfig.findUnique.mockResolvedValue(mockWorkConfig);
      mockPrisma.monthConfig.create.mockResolvedValue(mockResult);

      await repository.updateMonthConfig(2025, 1, {});

      expect(mockPrisma.monthConfig.create).toHaveBeenCalledWith({
        data: {
          year: 2025,
          month: 1,
          weeklyMinutes: 2400,
          workDays: '1,2,3,4,5',
          daySchedule: '{}',
        },
      });
    });
  });

  describe('deleteMonthConfig', () => {
    it('should delete a month config', async () => {
      const mockResult = { year: 2025, month: 1 };
      mockPrisma.monthConfig.delete.mockResolvedValue(mockResult);

      const result = await repository.deleteMonthConfig(2025, 1);

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.monthConfig.delete).toHaveBeenCalledWith({
        where: { year_month: { year: 2025, month: 1 } },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('getAllMonthConfigs', () => {
    it('should return all month configs ordered by year and month desc', async () => {
      const mockConfigs = [
        { year: 2025, month: 2 },
        { year: 2025, month: 1 },
      ];
      mockPrisma.monthConfig.findMany.mockResolvedValue(mockConfigs);

      const result = await repository.getAllMonthConfigs();

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.monthConfig.findMany).toHaveBeenCalledWith({
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      });
      expect(result).toEqual(mockConfigs);
    });
  });
});
