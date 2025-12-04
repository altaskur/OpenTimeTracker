import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { PrismaClient } from '../../../../generated/prisma/client.js';
import { TaskRepository } from './task.repository.js';

describe('TaskRepository', () => {
  let repository: TaskRepository;
  let mockPrisma: {
    task: {
      findMany: Mock;
      create: Mock;
      update: Mock;
      delete: Mock;
    };
    taskStatus: {
      findMany: Mock;
    };
  };
  let mockEnsureInitialized: Mock;

  beforeEach(() => {
    mockPrisma = {
      task: {
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      taskStatus: {
        findMany: vi.fn(),
      },
    };
    mockEnsureInitialized = vi.fn().mockResolvedValue(undefined);
    repository = new TaskRepository(
      mockPrisma as unknown as PrismaClient,
      mockEnsureInitialized,
    );
  });

  describe('getAll', () => {
    it('should return all tasks without filter', async () => {
      const mockTasks = [
        { id: '1', name: 'Task 1' },
        { id: '2', name: 'Task 2' },
      ];
      mockPrisma.task.findMany.mockResolvedValue(mockTasks);

      const result = await repository.getAll();

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: {
          status: true,
          project: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockTasks);
    });

    it('should return tasks filtered by projectId', async () => {
      const mockTasks = [{ id: '1', projectId: 'proj1' }];
      mockPrisma.task.findMany.mockResolvedValue(mockTasks);

      const result = await repository.getAll('proj1');

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: { projectId: 'proj1' },
        include: {
          status: true,
          project: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockTasks);
    });
  });

  describe('create', () => {
    it('should create a task with all fields including tags', async () => {
      const mockTask = {
        id: '1',
        name: 'New Task',
        projectId: 'proj1',
        tags: [{ tag: { id: 'tag1' } }],
      };
      mockPrisma.task.create.mockResolvedValue(mockTask);

      const result = await repository.create(
        'proj1',
        'New Task',
        'Description',
        8,
        'status1',
        ['tag1', 'tag2'],
      );

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: {
          projectId: 'proj1',
          name: 'New Task',
          description: 'Description',
          estimatedHours: 8,
          statusId: 'status1',
          tags: {
            create: [{ tagId: 'tag1' }, { tagId: 'tag2' }],
          },
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
      expect(result).toEqual(mockTask);
    });

    it('should create a task without tags', async () => {
      const mockTask = { id: '1', name: 'Task', projectId: 'proj1' };
      mockPrisma.task.create.mockResolvedValue(mockTask);

      const result = await repository.create('proj1', 'Task');

      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: {
          projectId: 'proj1',
          name: 'Task',
          description: undefined,
          estimatedHours: undefined,
          statusId: undefined,
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
      expect(result).toEqual(mockTask);
    });

    it('should create a task with empty tagIds array', async () => {
      const mockTask = { id: '1', name: 'Task', projectId: 'proj1' };
      mockPrisma.task.create.mockResolvedValue(mockTask);

      const result = await repository.create(
        'proj1',
        'Task',
        undefined,
        undefined,
        undefined,
        [],
      );

      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: {
          projectId: 'proj1',
          name: 'Task',
          description: undefined,
          estimatedHours: undefined,
          statusId: undefined,
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('update', () => {
    it('should update a task with tagIds', async () => {
      const mockTask = { id: '1', name: 'Updated' };
      mockPrisma.task.update.mockResolvedValue(mockTask);

      const result = await repository.update('1', {
        name: 'Updated',
        tagIds: ['tag1', 'tag2'],
      });

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: 'Updated',
          tags: {
            deleteMany: {},
            create: [{ tagId: 'tag1' }, { tagId: 'tag2' }],
          },
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
      expect(result).toEqual(mockTask);
    });

    it('should update a task without tagIds', async () => {
      const mockTask = { id: '1', name: 'Updated', description: 'New desc' };
      mockPrisma.task.update.mockResolvedValue(mockTask);

      const result = await repository.update('1', {
        name: 'Updated',
        description: 'New desc',
      });

      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: 'Updated',
          description: 'New desc',
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
      expect(result).toEqual(mockTask);
    });

    it('should update a task with empty tagIds to remove all tags', async () => {
      const mockTask = { id: '1' };
      mockPrisma.task.update.mockResolvedValue(mockTask);

      const result = await repository.update('1', { tagIds: [] });

      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          tags: {
            deleteMany: {},
            create: [],
          },
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      const mockTask = { id: '1', name: 'Deleted' };
      mockPrisma.task.delete.mockResolvedValue(mockTask);

      const result = await repository.delete('1');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.task.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('getStatuses', () => {
    it('should return all task statuses', async () => {
      const mockStatuses = [
        { id: '1', name: 'Pending' },
        { id: '2', name: 'Completed' },
      ];
      mockPrisma.taskStatus.findMany.mockResolvedValue(mockStatuses);

      const result = await repository.getStatuses();

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.taskStatus.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockStatuses);
    });
  });
});
