import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { PrismaClient } from '../../../../generated/prisma/client.js';
import { DayTypeRepository } from './day-type.repository.js';

describe('DayTypeRepository', () => {
  let repository: DayTypeRepository;
  let mockPrisma: {
    dayType: {
      findMany: Mock;
      findUnique: Mock;
      create: Mock;
      update: Mock;
      delete: Mock;
    };
  };
  let mockEnsureInitialized: Mock;

  beforeEach(() => {
    mockPrisma = {
      dayType: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    mockEnsureInitialized = vi.fn().mockResolvedValue(undefined);
    repository = new DayTypeRepository(
      mockPrisma as unknown as PrismaClient,
      mockEnsureInitialized,
    );
  });

  describe('getAll', () => {
    it('should return all day types ordered by name', async () => {
      const mockDayTypes = [
        { id: '1', name: 'Festivo', color: '#ef4444' },
        { id: '2', name: 'Vacaciones', color: '#22c55e' },
      ];
      mockPrisma.dayType.findMany.mockResolvedValue(mockDayTypes);

      const result = await repository.getAll();

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.dayType.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockDayTypes);
    });
  });

  describe('getById', () => {
    it('should return a day type by id', async () => {
      const mockDayType = { id: '1', name: 'Festivo', color: '#ef4444' };
      mockPrisma.dayType.findUnique.mockResolvedValue(mockDayType);

      const result = await repository.getById('1');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.dayType.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockDayType);
    });

    it('should return null when day type not found', async () => {
      mockPrisma.dayType.findUnique.mockResolvedValue(null);

      const result = await repository.getById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a day type with all fields', async () => {
      const mockDayType = {
        id: '1',
        name: 'Custom',
        color: '#000000',
        defaultMinutes: 120,
      };
      mockPrisma.dayType.create.mockResolvedValue(mockDayType);

      const result = await repository.create({
        name: 'Custom',
        color: '#000000',
        defaultMinutes: 120,
      });

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.dayType.create).toHaveBeenCalledWith({
        data: {
          name: 'Custom',
          color: '#000000',
          defaultMinutes: 120,
        },
      });
      expect(result).toEqual(mockDayType);
    });

    it('should create a day type with default minutes as 0', async () => {
      const mockDayType = {
        id: '1',
        name: 'Holiday',
        color: '#ff0000',
        defaultMinutes: 0,
      };
      mockPrisma.dayType.create.mockResolvedValue(mockDayType);

      const result = await repository.create({
        name: 'Holiday',
        color: '#ff0000',
      });

      expect(mockPrisma.dayType.create).toHaveBeenCalledWith({
        data: {
          name: 'Holiday',
          color: '#ff0000',
          defaultMinutes: 0,
        },
      });
      expect(result).toEqual(mockDayType);
    });
  });

  describe('update', () => {
    it('should update a day type', async () => {
      const mockDayType = {
        id: '1',
        name: 'Updated',
        color: '#111111',
        defaultMinutes: 60,
      };
      mockPrisma.dayType.update.mockResolvedValue(mockDayType);

      const result = await repository.update('1', {
        name: 'Updated',
        color: '#111111',
        defaultMinutes: 60,
      });

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.dayType.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: 'Updated',
          color: '#111111',
          defaultMinutes: 60,
        },
      });
      expect(result).toEqual(mockDayType);
    });

    it('should update only specified fields', async () => {
      const mockDayType = { id: '1', name: 'Updated' };
      mockPrisma.dayType.update.mockResolvedValue(mockDayType);

      const result = await repository.update('1', { name: 'Updated' });

      expect(mockPrisma.dayType.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated' },
      });
      expect(result).toEqual(mockDayType);
    });
  });

  describe('delete', () => {
    it('should delete a day type', async () => {
      const mockDayType = { id: '1', name: 'Deleted' };
      mockPrisma.dayType.delete.mockResolvedValue(mockDayType);

      const result = await repository.delete('1');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.dayType.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockDayType);
    });
  });

  describe('seedDefaults', () => {
    it('should seed default day types when they do not exist', async () => {
      mockPrisma.dayType.findUnique.mockResolvedValue(null);
      mockPrisma.dayType.create.mockResolvedValue({});

      await repository.seedDefaults();

      expect(mockPrisma.dayType.findUnique).toHaveBeenCalledTimes(5);
      expect(mockPrisma.dayType.create).toHaveBeenCalledTimes(5);
      expect(mockPrisma.dayType.create).toHaveBeenCalledWith({
        data: { name: 'Festivo', color: '#ef4444', defaultMinutes: 0 },
      });
      expect(mockPrisma.dayType.create).toHaveBeenCalledWith({
        data: { name: 'Vacaciones', color: '#22c55e', defaultMinutes: 0 },
      });
    });

    it('should not create day types that already exist', async () => {
      mockPrisma.dayType.findUnique.mockResolvedValue({ id: '1' });

      await repository.seedDefaults();

      expect(mockPrisma.dayType.findUnique).toHaveBeenCalledTimes(5);
      expect(mockPrisma.dayType.create).not.toHaveBeenCalled();
    });

    it('should not call ensureInitialized', async () => {
      mockPrisma.dayType.findUnique.mockResolvedValue(null);
      mockPrisma.dayType.create.mockResolvedValue({});

      await repository.seedDefaults();

      expect(mockEnsureInitialized).not.toHaveBeenCalled();
    });
  });
});
