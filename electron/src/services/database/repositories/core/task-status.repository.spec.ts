import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { PrismaClient } from '../../../../generated/prisma/client.js';
import { TaskStatusRepository } from './task-status.repository.js';

describe('TaskStatusRepository', () => {
  let repository: TaskStatusRepository;
  let mockPrisma: {
    taskStatus: {
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
      taskStatus: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    mockEnsureInitialized = vi.fn().mockResolvedValue(undefined);
    repository = new TaskStatusRepository(
      mockPrisma as unknown as PrismaClient,
      mockEnsureInitialized,
    );
  });

  describe('getAll', () => {
    it('should return all task statuses ordered by name', async () => {
      const mockStatuses = [
        { id: '1', name: 'Blocked', color: '#ef4444', isDefault: true },
        { id: '2', name: 'Completed', color: '#6b7280', isDefault: true },
      ];
      mockPrisma.taskStatus.findMany.mockResolvedValue(mockStatuses);

      const result = await repository.getAll();

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.taskStatus.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockStatuses);
    });
  });

  describe('create', () => {
    it('should create a new task status with isDefault false', async () => {
      const mockStatus = {
        id: '1',
        name: 'Custom Status',
        color: '#ff0000',
        isDefault: false,
      };
      mockPrisma.taskStatus.create.mockResolvedValue(mockStatus);

      const result = await repository.create('Custom Status', '#ff0000');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.taskStatus.create).toHaveBeenCalledWith({
        data: { name: 'Custom Status', color: '#ff0000', isDefault: false },
      });
      expect(result).toEqual(mockStatus);
    });
  });

  describe('update', () => {
    it('should update an existing task status', async () => {
      const mockStatus = {
        id: '1',
        name: 'Updated Status',
        color: '#00ff00',
        isDefault: false,
      };
      mockPrisma.taskStatus.update.mockResolvedValue(mockStatus);

      const result = await repository.update('1', 'Updated Status', '#00ff00');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.taskStatus.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated Status', color: '#00ff00' },
      });
      expect(result).toEqual(mockStatus);
    });
  });

  describe('delete', () => {
    it('should delete a non-default task status', async () => {
      const mockStatus = {
        id: '1',
        name: 'Custom Status',
        color: '#ff0000',
        isDefault: false,
      };
      mockPrisma.taskStatus.findUnique.mockResolvedValue(mockStatus);
      mockPrisma.taskStatus.delete.mockResolvedValue(mockStatus);

      const result = await repository.delete('1');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.taskStatus.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockPrisma.taskStatus.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockStatus);
    });

    it('should return null if status does not exist', async () => {
      mockPrisma.taskStatus.findUnique.mockResolvedValue(null);

      const result = await repository.delete('nonexistent');

      expect(result).toBeNull();
      expect(mockPrisma.taskStatus.delete).not.toHaveBeenCalled();
    });

    it('should throw error if trying to delete a default status', async () => {
      const mockStatus = {
        id: '1',
        name: 'status.pending',
        color: '#f59e0b',
        isDefault: true,
      };
      mockPrisma.taskStatus.findUnique.mockResolvedValue(mockStatus);

      await expect(repository.delete('1')).rejects.toThrow(
        'Cannot delete default status',
      );
      expect(mockPrisma.taskStatus.delete).not.toHaveBeenCalled();
    });
  });

  describe('findByName', () => {
    it('should find a task status by name', async () => {
      const mockStatus = {
        id: '1',
        name: 'status.pending',
        color: '#f59e0b',
        isDefault: true,
      };
      mockPrisma.taskStatus.findUnique.mockResolvedValue(mockStatus);

      const result = await repository.findByName('status.pending');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.taskStatus.findUnique).toHaveBeenCalledWith({
        where: { name: 'status.pending' },
      });
      expect(result).toEqual(mockStatus);
    });

    it('should return null if status not found', async () => {
      mockPrisma.taskStatus.findUnique.mockResolvedValue(null);

      const result = await repository.findByName('nonexistent');

      expect(result).toBeNull();
    });
  });
});
