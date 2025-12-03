import { PrismaClient } from '@prisma/client';
import { ProjectRepository } from './project.repository';

describe('ProjectRepository', () => {
  let repository: ProjectRepository;
  let mockPrisma: {
    project: {
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    task: {
      count: jest.Mock;
    };
  };
  let mockEnsureInitialized: jest.Mock;

  beforeEach(() => {
    mockPrisma = {
      project: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      task: {
        count: jest.fn(),
      },
    };
    mockEnsureInitialized = jest.fn().mockResolvedValue(undefined);
    repository = new ProjectRepository(
      mockPrisma as unknown as PrismaClient,
      mockEnsureInitialized,
    );
  });

  describe('getAll', () => {
    it('should ensure initialization and return all projects ordered by createdAt desc', async () => {
      const mockProjects = [
        { id: '1', name: 'Project 1', createdAt: new Date() },
        { id: '2', name: 'Project 2', createdAt: new Date() },
      ];
      mockPrisma.project.findMany.mockResolvedValue(mockProjects);

      const result = await repository.getAll();

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockProjects);
    });
  });

  describe('create', () => {
    it('should create a project with name and description', async () => {
      const mockProject = {
        id: '1',
        name: 'New Project',
        description: 'Description',
      };
      mockPrisma.project.create.mockResolvedValue(mockProject);

      const result = await repository.create('New Project', 'Description');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.project.create).toHaveBeenCalledWith({
        data: { name: 'New Project', description: 'Description' },
      });
      expect(result).toEqual(mockProject);
    });

    it('should create a project without description', async () => {
      const mockProject = { id: '1', name: 'New Project' };
      mockPrisma.project.create.mockResolvedValue(mockProject);

      const result = await repository.create('New Project');

      expect(mockPrisma.project.create).toHaveBeenCalledWith({
        data: { name: 'New Project', description: undefined },
      });
      expect(result).toEqual(mockProject);
    });
  });

  describe('update', () => {
    it('should update a project with name and description', async () => {
      const mockProject = {
        id: '1',
        name: 'Updated',
        description: 'New desc',
      };
      mockPrisma.project.update.mockResolvedValue(mockProject);

      const result = await repository.update('1', 'Updated', 'New desc');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated', description: 'New desc' },
      });
      expect(result).toEqual(mockProject);
    });
  });

  describe('delete', () => {
    it('should delete a project by id', async () => {
      const mockProject = { id: '1', name: 'Deleted' };
      mockPrisma.project.delete.mockResolvedValue(mockProject);

      const result = await repository.delete('1');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.project.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockProject);
    });
  });

  describe('canClose', () => {
    it('should return true when no incomplete tasks', async () => {
      mockPrisma.task.count.mockResolvedValue(0);

      const result = await repository.canClose('1');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.task.count).toHaveBeenCalledWith({
        where: {
          projectId: '1',
          status: {
            name: { not: 'Completada' },
          },
        },
      });
      expect(result).toBe(true);
    });

    it('should return false when there are incomplete tasks', async () => {
      mockPrisma.task.count.mockResolvedValue(3);

      const result = await repository.canClose('1');

      expect(result).toBe(false);
    });
  });

  describe('close', () => {
    it('should set isClosed to true', async () => {
      const mockProject = { id: '1', isClosed: true };
      mockPrisma.project.update.mockResolvedValue(mockProject);

      const result = await repository.close('1');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isClosed: true },
      });
      expect(result).toEqual(mockProject);
    });
  });

  describe('reopen', () => {
    it('should set isClosed to false', async () => {
      const mockProject = { id: '1', isClosed: false };
      mockPrisma.project.update.mockResolvedValue(mockProject);

      const result = await repository.reopen('1');

      expect(mockEnsureInitialized).toHaveBeenCalled();
      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isClosed: false },
      });
      expect(result).toEqual(mockProject);
    });
  });
});
