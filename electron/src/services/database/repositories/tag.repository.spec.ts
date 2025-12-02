import { PrismaClient } from '@prisma/client';
import { TagRepository } from './tag.repository';

describe('TagRepository', () => {
  let repository: TagRepository;
  let mockPrisma: {
    tag: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    taskTag: {
      create: jest.Mock;
      delete: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let mockEnsureInitialized: jest.Mock;

  beforeEach(() => {
    mockPrisma = {
      tag: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      taskTag: {
        create: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
    };
    mockEnsureInitialized = jest.fn().mockResolvedValue(undefined);
    repository = new TagRepository(
      mockPrisma as unknown as PrismaClient,
      mockEnsureInitialized,
    );
  });

  describe('getAll', () => {
    it('should return all tags ordered by name', async () => {
      const mockTags = [
        { id: '1', name: 'Alpha' },
        { id: '2', name: 'Beta' },
      ];
      mockPrisma.tag.findMany.mockResolvedValue(mockTags);

      const result = await repository.getAll();

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockTags);
    });
  });

  describe('getById', () => {
    it('should return a tag by id', async () => {
      const mockTag = { id: '1', name: 'Tag1' };
      mockPrisma.tag.findUnique.mockResolvedValue(mockTag);

      const result = await repository.getById('1');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.tag.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockTag);
    });

    it('should return null when tag not found', async () => {
      mockPrisma.tag.findUnique.mockResolvedValue(null);

      const result = await repository.getById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getByName', () => {
    it('should return a tag by name', async () => {
      const mockTag = { id: '1', name: 'Test' };
      mockPrisma.tag.findFirst.mockResolvedValue(mockTag);

      const result = await repository.getByName('Test');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.tag.findFirst).toHaveBeenCalledWith({
        where: { name: 'Test' },
      });
      expect(result).toEqual(mockTag);
    });
  });

  describe('create', () => {
    it('should create a new tag', async () => {
      const mockTag = { id: '1', name: 'NewTag' };
      mockPrisma.tag.create.mockResolvedValue(mockTag);

      const result = await repository.create('NewTag');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.tag.create).toHaveBeenCalledWith({
        data: { name: 'NewTag' },
      });
      expect(result).toEqual(mockTag);
    });
  });

  describe('update', () => {
    it('should update a tag', async () => {
      const mockTag = { id: '1', name: 'Updated' };
      mockPrisma.tag.update.mockResolvedValue(mockTag);

      const result = await repository.update('1', { name: 'Updated' });

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.tag.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated' },
      });
      expect(result).toEqual(mockTag);
    });
  });

  describe('delete', () => {
    it('should delete a tag', async () => {
      const mockTag = { id: '1', name: 'Deleted' };
      mockPrisma.tag.delete.mockResolvedValue(mockTag);

      const result = await repository.delete('1');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.tag.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockTag);
    });
  });

  describe('addToTask', () => {
    it('should add a tag to a task', async () => {
      const mockTaskTag = { taskId: 'task1', tagId: 'tag1' };
      mockPrisma.taskTag.create.mockResolvedValue(mockTaskTag);

      const result = await repository.addToTask('task1', 'tag1');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.taskTag.create).toHaveBeenCalledWith({
        data: { taskId: 'task1', tagId: 'tag1' },
      });
      expect(result).toEqual(mockTaskTag);
    });
  });

  describe('removeFromTask', () => {
    it('should remove a tag from a task', async () => {
      const mockTaskTag = { taskId: 'task1', tagId: 'tag1' };
      mockPrisma.taskTag.delete.mockResolvedValue(mockTaskTag);

      const result = await repository.removeFromTask('task1', 'tag1');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.taskTag.delete).toHaveBeenCalledWith({
        where: {
          taskId_tagId: { taskId: 'task1', tagId: 'tag1' },
        },
      });
      expect(result).toEqual(mockTaskTag);
    });
  });

  describe('getByTaskId', () => {
    it('should return tags for a task', async () => {
      const mockTaskTags = [
        { taskId: 'task1', tagId: 'tag1', tag: { id: 'tag1', name: 'Tag1' } },
        { taskId: 'task1', tagId: 'tag2', tag: { id: 'tag2', name: 'Tag2' } },
      ];
      mockPrisma.taskTag.findMany.mockResolvedValue(mockTaskTags);

      const result = await repository.getByTaskId('task1');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.taskTag.findMany).toHaveBeenCalledWith({
        where: { taskId: 'task1' },
        include: { tag: true },
      });
      expect(result).toEqual([
        { id: 'tag1', name: 'Tag1' },
        { id: 'tag2', name: 'Tag2' },
      ]);
    });

    it('should return empty array when no tags', async () => {
      mockPrisma.taskTag.findMany.mockResolvedValue([]);

      const result = await repository.getByTaskId('task1');

      expect(result).toEqual([]);
    });
  });
});
