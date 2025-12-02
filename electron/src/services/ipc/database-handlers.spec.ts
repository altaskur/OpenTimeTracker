import { ipcMain } from 'electron';
import { setupDatabaseHandlers } from './database-handlers';
import { DatabaseManager } from '../database/database';

jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn(),
  },
}));

/**
 * Database Handlers Test Suite
 */
describe('Database Handlers', () => {
  let mockDbManager: jest.Mocked<DatabaseManager>;
  let handleSpy: jest.SpyInstance;

  beforeEach(() => {
    mockDbManager = {
      getProjects: jest.fn(),
      createProject: jest.fn(),
      updateProject: jest.fn(),
      deleteProject: jest.fn(),
      getTasks: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      getTaskStatuses: jest.fn(),
      getTimeEntries: jest.fn(),
      getPendingTimeEntries: jest.fn(),
      createTimeEntry: jest.fn(),
      updateTimeEntry: jest.fn(),
      deleteTimeEntry: jest.fn(),
      getWorkPeriods: jest.fn(),
      createWorkPeriod: jest.fn(),
      getTags: jest.fn(),
      createTag: jest.fn(),
      deleteTag: jest.fn(),
      addTagToTask: jest.fn(),
      removeTagFromTask: jest.fn(),
    } as unknown as jest.Mocked<DatabaseManager>;

    handleSpy = jest.spyOn(ipcMain, 'handle');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Setup', () => {
    it('should register all IPC handlers', () => {
      setupDatabaseHandlers(mockDbManager);

      const registeredHandlers = handleSpy.mock.calls.map(
        (call: unknown[]) => call[0],
      );

      expect(registeredHandlers).toContain('get-projects');
      expect(registeredHandlers).toContain('create-project');
      expect(registeredHandlers).toContain('update-project');
      expect(registeredHandlers).toContain('delete-project');
      expect(registeredHandlers).toContain('get-tasks');
      expect(registeredHandlers).toContain('create-task');
      expect(registeredHandlers).toContain('update-task');
      expect(registeredHandlers).toContain('delete-task');
      expect(registeredHandlers).toContain('get-task-statuses');
      expect(registeredHandlers).toContain('get-time-entries');
      expect(registeredHandlers).toContain('get-pending-time-entries');
      expect(registeredHandlers).toContain('create-time-entry');
      expect(registeredHandlers).toContain('update-time-entry');
      expect(registeredHandlers).toContain('delete-time-entry');
      expect(registeredHandlers).toContain('get-work-periods');
      expect(registeredHandlers).toContain('create-work-period');
      expect(registeredHandlers).toContain('get-tags');
      expect(registeredHandlers).toContain('create-tag');
      expect(registeredHandlers).toContain('delete-tag');
      expect(registeredHandlers).toContain('add-tag-to-task');
      expect(registeredHandlers).toContain('remove-tag-from-task');
    });
  });

  describe('Projects Handlers', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle get-projects', async () => {
      const mockProjects = [
        {
          id: '1',
          name: 'Project 1',
          description: 'Description 1',
          isClosed: false,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
        },
      ];
      mockDbManager.getProjects.mockResolvedValue(mockProjects);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-projects',
      )?.[1] as () => Promise<unknown>;
      const result = await handler();

      expect(mockDbManager.getProjects).toHaveBeenCalled();
      expect(result).toEqual(mockProjects);
    });

    it('should handle get-projects error', async () => {
      const error = new Error('Database error');
      mockDbManager.getProjects.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-projects',
      )?.[1] as () => Promise<unknown>;

      await expect(handler()).rejects.toThrow('Database error');
    });

    it('should handle create-project', async () => {
      const mockProject = {
        id: '1',
        name: 'New Project',
        description: 'New Description',
        isClosed: false,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };
      mockDbManager.createProject.mockResolvedValue(mockProject);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'create-project',
      )?.[1] as (
        event: unknown,
        name: string,
        description?: string,
      ) => Promise<unknown>;
      const result = await handler({}, 'New Project', 'New Description');

      expect(mockDbManager.createProject).toHaveBeenCalledWith(
        'New Project',
        'New Description',
      );
      expect(result).toEqual(mockProject);
    });

    it('should handle create-project without description', async () => {
      const mockProject = {
        id: '1',
        name: 'New Project',
        description: null,
        isClosed: false,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };
      mockDbManager.createProject.mockResolvedValue(mockProject);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'create-project',
      )?.[1] as (
        event: unknown,
        name: string,
        description?: string,
      ) => Promise<unknown>;
      const result = await handler({}, 'New Project');

      expect(mockDbManager.createProject).toHaveBeenCalledWith(
        'New Project',
        undefined,
      );
      expect(result).toEqual(mockProject);
    });

    it('should handle update-project', async () => {
      const mockProject = {
        id: '1',
        name: 'Updated Project',
        description: 'Updated Description',
        isClosed: false,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };
      mockDbManager.updateProject.mockResolvedValue(mockProject);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'update-project',
      )?.[1] as (
        event: unknown,
        id: string,
        name: string,
        description?: string,
      ) => Promise<unknown>;
      const result = await handler(
        {},
        '1',
        'Updated Project',
        'Updated Description',
      );

      expect(mockDbManager.updateProject).toHaveBeenCalledWith(
        '1',
        'Updated Project',
        'Updated Description',
      );
      expect(result).toEqual(mockProject);
    });

    it('should handle delete-project', async () => {
      const mockProject = {
        id: '1',
        name: 'Deleted Project',
        description: null,
        isClosed: false,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };
      mockDbManager.deleteProject.mockResolvedValue(mockProject);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'delete-project',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;
      const result = await handler({}, '1');

      expect(mockDbManager.deleteProject).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockProject);
    });
  });

  describe('Tasks Handlers', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle get-tasks without projectId', async () => {
      const mockTasks = [
        {
          id: '1',
          name: 'Task 1',
          projectId: 'p1',
          description: null,
          estimatedHours: null,
          statusId: 's1',
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          project: {
            id: 'p1',
            name: 'Project 1',
            description: null,
            isClosed: false,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
          },
          status: {
            id: 's1',
            name: 'status.pending',
            color: '#f59e0b',
            isDefault: true,
          },
          tags: [],
        },
      ];
      mockDbManager.getTasks.mockResolvedValue(mockTasks);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-tasks',
      )?.[1] as (event: unknown, projectId?: string) => Promise<unknown>;
      const result = await handler({});

      expect(mockDbManager.getTasks).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockTasks);
    });

    it('should handle get-tasks with projectId', async () => {
      const mockTasks = [
        {
          id: '1',
          name: 'Task 1',
          projectId: 'p1',
          description: null,
          estimatedHours: null,
          statusId: 's1',
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          project: {
            id: 'p1',
            name: 'Project 1',
            description: null,
            isClosed: false,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
          },
          status: {
            id: 's1',
            name: 'status.pending',
            color: '#f59e0b',
            isDefault: true,
          },
          tags: [],
        },
      ];
      mockDbManager.getTasks.mockResolvedValue(mockTasks);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-tasks',
      )?.[1] as (event: unknown, projectId?: string) => Promise<unknown>;
      const result = await handler({}, 'p1');

      expect(mockDbManager.getTasks).toHaveBeenCalledWith('p1');
      expect(result).toEqual(mockTasks);
    });

    it('should handle create-task', async () => {
      const mockTask = {
        id: '1',
        name: 'New Task',
        projectId: 'p1',
        description: 'Description',
        estimatedHours: 5,
        statusId: 's1',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        tags: [],
      };
      mockDbManager.createTask.mockResolvedValue(mockTask);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'create-task',
      )?.[1] as (
        event: unknown,
        projectId: string,
        name: string,
        description?: string,
        estimatedHours?: number,
        statusId?: string,
        tagIds?: string[],
      ) => Promise<unknown>;
      const result = await handler(
        {},
        'p1',
        'New Task',
        'Description',
        5,
        's1',
        ['t1', 't2'],
      );

      expect(mockDbManager.createTask).toHaveBeenCalledWith(
        'p1',
        'New Task',
        'Description',
        5,
        's1',
        ['t1', 't2'],
      );
      expect(result).toEqual(mockTask);
    });

    it('should handle update-task', async () => {
      const mockTask = {
        id: '1',
        name: 'Updated Task',
        projectId: 'p1',
        description: null,
        estimatedHours: null,
        statusId: 's1',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        tags: [],
      };
      mockDbManager.updateTask.mockResolvedValue(mockTask);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'update-task',
      )?.[1] as (
        event: unknown,
        id: string,
        data: { name?: string; description?: string },
      ) => Promise<unknown>;
      const data = { name: 'Updated Task', description: 'New description' };
      const result = await handler({}, '1', data);

      expect(mockDbManager.updateTask).toHaveBeenCalledWith('1', data);
      expect(result).toEqual(mockTask);
    });

    it('should handle delete-task', async () => {
      const mockTask = {
        id: '1',
        name: 'Deleted Task',
        projectId: 'p1',
        description: null,
        estimatedHours: null,
        statusId: 's1',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };
      mockDbManager.deleteTask.mockResolvedValue(mockTask);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'delete-task',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;
      const result = await handler({}, '1');

      expect(mockDbManager.deleteTask).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockTask);
    });
  });

  describe('Task Status Handlers', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle get-task-statuses', async () => {
      const mockStatuses = [
        { id: '1', name: 'status.pending', color: '#f59e0b', isDefault: true },
        { id: '2', name: 'En progreso', color: '#3b82f6', isDefault: true },
        { id: '3', name: 'Completada', color: '#6b7280', isDefault: true },
      ];
      mockDbManager.getTaskStatuses.mockResolvedValue(mockStatuses);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-task-statuses',
      )?.[1] as () => Promise<unknown>;
      const result = await handler();

      expect(mockDbManager.getTaskStatuses).toHaveBeenCalled();
      expect(result).toEqual(mockStatuses);
    });
  });

  describe('Time Entries Handlers', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle get-time-entries without taskId', async () => {
      const mockEntries = [
        {
          id: '1',
          date: '2025-01-01',
          minutes: 480,
          taskId: null,
          notes: null,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          task: null,
        },
      ];
      mockDbManager.getTimeEntries.mockResolvedValue(mockEntries);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-time-entries',
      )?.[1] as (event: unknown, taskId?: string) => Promise<unknown>;
      const result = await handler({});

      expect(mockDbManager.getTimeEntries).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockEntries);
    });

    it('should handle get-time-entries with taskId', async () => {
      const mockEntries = [
        {
          id: '1',
          date: '2025-01-01',
          minutes: 480,
          taskId: 't1',
          notes: null,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          task: {
            id: 't1',
            name: 'Test Task',
            projectId: 'p1',
            description: null,
            estimatedHours: null,
            statusId: null,
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
            project: {
              id: 'p1',
              name: 'Test Project',
              description: null,
              isClosed: false,
              createdAt: new Date('2025-01-01'),
              updatedAt: new Date('2025-01-01'),
            },
            status: null,
          },
        },
      ];
      mockDbManager.getTimeEntries.mockResolvedValue(mockEntries);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-time-entries',
      )?.[1] as (event: unknown, taskId?: string) => Promise<unknown>;
      const result = await handler({}, 't1');

      expect(mockDbManager.getTimeEntries).toHaveBeenCalledWith('t1');
      expect(result).toEqual(mockEntries);
    });

    it('should handle get-pending-time-entries', async () => {
      const mockEntries = [
        {
          id: '1',
          date: '2025-01-01',
          minutes: 480,
          taskId: null,
          notes: null,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
        },
      ];
      mockDbManager.getPendingTimeEntries.mockResolvedValue(mockEntries);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-pending-time-entries',
      )?.[1] as () => Promise<unknown>;
      const result = await handler();

      expect(mockDbManager.getPendingTimeEntries).toHaveBeenCalled();
      expect(result).toEqual(mockEntries);
    });

    it('should handle create-time-entry', async () => {
      const mockEntry = {
        id: '1',
        date: '2025-01-01',
        minutes: 480,
        taskId: 't1',
        notes: 'Work notes',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        task: {
          id: 't1',
          name: 'Test Task',
          description: null,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          projectId: 'p1',
          estimatedHours: null,
          statusId: null,
        },
      };
      mockDbManager.createTimeEntry.mockResolvedValue(mockEntry);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'create-time-entry',
      )?.[1] as (
        event: unknown,
        date: string,
        minutes: number,
        taskId?: string,
        notes?: string,
      ) => Promise<unknown>;
      const result = await handler({}, '2025-01-01', 480, 't1', 'Work notes');

      expect(mockDbManager.createTimeEntry).toHaveBeenCalledWith(
        '2025-01-01',
        480,
        't1',
        'Work notes',
      );
      expect(result).toEqual(mockEntry);
    });

    it('should handle update-time-entry', async () => {
      const mockEntry = {
        id: '1',
        date: '2025-01-01',
        minutes: 600,
        taskId: null,
        notes: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        task: null,
      };
      mockDbManager.updateTimeEntry.mockResolvedValue(mockEntry);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'update-time-entry',
      )?.[1] as (
        event: unknown,
        id: string,
        data: { minutes?: number },
      ) => Promise<unknown>;
      const data = { minutes: 600 };
      const result = await handler({}, '1', data);

      expect(mockDbManager.updateTimeEntry).toHaveBeenCalledWith('1', data);
      expect(result).toEqual(mockEntry);
    });

    it('should handle delete-time-entry', async () => {
      const mockEntry = {
        id: '1',
        date: '2025-01-01',
        minutes: 480,
        taskId: null,
        notes: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };
      mockDbManager.deleteTimeEntry.mockResolvedValue(mockEntry);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'delete-time-entry',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;
      const result = await handler({}, '1');

      expect(mockDbManager.deleteTimeEntry).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockEntry);
    });
  });

  describe('Work Periods Handlers', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle get-work-periods', async () => {
      const mockPeriods = [
        {
          id: '1',
          year: 2025,
          month: 1,
          plannedHours: 160,
          note: null,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
        },
      ];
      mockDbManager.getWorkPeriods.mockResolvedValue(mockPeriods);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-work-periods',
      )?.[1] as () => Promise<unknown>;
      const result = await handler();

      expect(mockDbManager.getWorkPeriods).toHaveBeenCalled();
      expect(result).toEqual(mockPeriods);
    });

    it('should handle create-work-period', async () => {
      const mockPeriod = {
        id: '1',
        year: 2025,
        month: 1,
        plannedHours: 160,
        note: 'January period',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };
      mockDbManager.createWorkPeriod.mockResolvedValue(mockPeriod);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'create-work-period',
      )?.[1] as (
        event: unknown,
        year: number,
        month: number,
        plannedHours: number,
        note?: string,
      ) => Promise<unknown>;
      const result = await handler({}, 2025, 1, 160, 'January period');

      expect(mockDbManager.createWorkPeriod).toHaveBeenCalledWith(
        2025,
        1,
        160,
        'January period',
      );
      expect(result).toEqual(mockPeriod);
    });
  });

  describe('Tags Handlers', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle get-tags', async () => {
      const mockTags = [
        { id: '1', name: 'Bug' },
        { id: '2', name: 'Feature' },
      ];
      mockDbManager.getTags.mockResolvedValue(mockTags);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-tags',
      )?.[1] as () => Promise<unknown>;
      const result = await handler();

      expect(mockDbManager.getTags).toHaveBeenCalled();
      expect(result).toEqual(mockTags);
    });

    it('should handle create-tag', async () => {
      const mockTag = { id: '1', name: 'New Tag' };
      mockDbManager.createTag.mockResolvedValue(mockTag);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'create-tag',
      )?.[1] as (event: unknown, name: string) => Promise<unknown>;
      const result = await handler({}, 'New Tag');

      expect(mockDbManager.createTag).toHaveBeenCalledWith('New Tag');
      expect(result).toEqual(mockTag);
    });

    it('should handle delete-tag', async () => {
      const mockTag = { id: '1', name: 'Deleted Tag' };
      mockDbManager.deleteTag.mockResolvedValue(mockTag);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'delete-tag',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;
      const result = await handler({}, '1');

      expect(mockDbManager.deleteTag).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockTag);
    });

    it('should handle add-tag-to-task', async () => {
      const mockTaskTag = { taskId: 'task1', tagId: 'tag1' };
      mockDbManager.addTagToTask.mockResolvedValue(mockTaskTag);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'add-tag-to-task',
      )?.[1] as (
        event: unknown,
        taskId: string,
        tagId: string,
      ) => Promise<unknown>;
      await handler({}, 'task1', 'tag1');

      expect(mockDbManager.addTagToTask).toHaveBeenCalledWith('task1', 'tag1');
    });

    it('should handle remove-tag-from-task', async () => {
      const mockTaskTag = { taskId: 'task1', tagId: 'tag1' };
      mockDbManager.removeTagFromTask.mockResolvedValue(mockTaskTag);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'remove-tag-from-task',
      )?.[1] as (
        event: unknown,
        taskId: string,
        tagId: string,
      ) => Promise<unknown>;
      await handler({}, 'task1', 'tag1');

      expect(mockDbManager.removeTagFromTask).toHaveBeenCalledWith(
        'task1',
        'tag1',
      );
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should log and throw errors for get-projects', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');
      mockDbManager.getProjects.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-projects',
      )?.[1] as () => Promise<unknown>;

      await expect(handler()).rejects.toThrow('Test error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting projects:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and throw errors for create-project', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Create error');
      mockDbManager.createProject.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'create-project',
      )?.[1] as (
        event: unknown,
        name: string,
        description?: string,
      ) => Promise<unknown>;

      await expect(handler({}, 'Test Project')).rejects.toThrow('Create error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating project:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and throw errors for update-project', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Update project error');
      mockDbManager.updateProject.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'update-project',
      )?.[1] as (
        event: unknown,
        id: string,
        name: string,
        description?: string,
      ) => Promise<unknown>;

      await expect(
        handler({}, '1', 'Updated Project', 'Description'),
      ).rejects.toThrow('Update project error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error updating project:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and throw errors for delete-project', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Delete project error');
      mockDbManager.deleteProject.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'delete-project',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;

      await expect(handler({}, '1')).rejects.toThrow('Delete project error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error deleting project:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and throw errors for get-tasks', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Get tasks error');
      mockDbManager.getTasks.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-tasks',
      )?.[1] as (event: unknown, projectId?: string) => Promise<unknown>;

      await expect(handler({}, 'p1')).rejects.toThrow('Get tasks error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting tasks:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and throw errors for create-task', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Create task error');
      mockDbManager.createTask.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'create-task',
      )?.[1] as (
        event: unknown,
        projectId: string,
        name: string,
      ) => Promise<unknown>;

      await expect(handler({}, 'p1', 'New Task')).rejects.toThrow(
        'Create task error',
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating task:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and throw errors for update-task', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Update error');
      mockDbManager.updateTask.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'update-task',
      )?.[1] as (
        event: unknown,
        id: string,
        data: { name?: string },
      ) => Promise<unknown>;

      await expect(handler({}, '1', { name: 'Updated' })).rejects.toThrow(
        'Update error',
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error updating task:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and throw errors for delete-task', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Delete task error');
      mockDbManager.deleteTask.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'delete-task',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;

      await expect(handler({}, '1')).rejects.toThrow('Delete task error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error deleting task:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and throw errors for get-task-statuses', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Get statuses error');
      mockDbManager.getTaskStatuses.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-task-statuses',
      )?.[1] as () => Promise<unknown>;

      await expect(handler()).rejects.toThrow('Get statuses error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting task statuses:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and throw errors for get-time-entries', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Get time entries error');
      mockDbManager.getTimeEntries.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-time-entries',
      )?.[1] as (event: unknown, taskId?: string) => Promise<unknown>;

      await expect(handler({}, 't1')).rejects.toThrow('Get time entries error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting time entries:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and throw errors for get-pending-time-entries', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Get pending entries error');
      mockDbManager.getPendingTimeEntries.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-pending-time-entries',
      )?.[1] as () => Promise<unknown>;

      await expect(handler()).rejects.toThrow('Get pending entries error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting pending time entries:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and throw errors for create-time-entry', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Create time entry error');
      mockDbManager.createTimeEntry.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'create-time-entry',
      )?.[1] as (
        event: unknown,
        date: string,
        hours: number,
      ) => Promise<unknown>;

      await expect(handler({}, '2025-01-01', 8)).rejects.toThrow(
        'Create time entry error',
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating time entry:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and throw errors for update-time-entry', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Update time entry error');
      mockDbManager.updateTimeEntry.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'update-time-entry',
      )?.[1] as (
        event: unknown,
        id: string,
        data: { hours?: number },
      ) => Promise<unknown>;

      await expect(handler({}, '1', { hours: 10 })).rejects.toThrow(
        'Update time entry error',
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error updating time entry:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and throw errors for delete-time-entry', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Delete error');
      mockDbManager.deleteTimeEntry.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'delete-time-entry',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;

      await expect(handler({}, '1')).rejects.toThrow('Delete error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error deleting time entry:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and throw errors for get-work-periods', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Get work periods error');
      mockDbManager.getWorkPeriods.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-work-periods',
      )?.[1] as () => Promise<unknown>;

      await expect(handler()).rejects.toThrow('Get work periods error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting work periods:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and throw errors for create-work-period', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Create work period error');
      mockDbManager.createWorkPeriod.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'create-work-period',
      )?.[1] as (
        event: unknown,
        year: number,
        month: number,
        plannedHours: number,
      ) => Promise<unknown>;

      await expect(handler({}, 2025, 1, 160)).rejects.toThrow(
        'Create work period error',
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating work period:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and throw errors for get-tags', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Get tags error');
      mockDbManager.getTags.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-tags',
      )?.[1] as () => Promise<unknown>;

      await expect(handler()).rejects.toThrow('Get tags error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting tags:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and throw errors for create-tag', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Create tag error');
      mockDbManager.createTag.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'create-tag',
      )?.[1] as (event: unknown, name: string) => Promise<unknown>;

      await expect(handler({}, 'New Tag')).rejects.toThrow('Create tag error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating tag:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and throw errors for delete-tag', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Delete tag error');
      mockDbManager.deleteTag.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'delete-tag',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;

      await expect(handler({}, '1')).rejects.toThrow('Delete tag error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error deleting tag:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and throw errors for add-tag-to-task', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Add tag error');
      mockDbManager.addTagToTask.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'add-tag-to-task',
      )?.[1] as (
        event: unknown,
        taskId: string,
        tagId: string,
      ) => Promise<unknown>;

      await expect(handler({}, 'task1', 'tag1')).rejects.toThrow(
        'Add tag error',
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error adding tag to task:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log and throw errors for remove-tag-from-task', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Remove tag error');
      mockDbManager.removeTagFromTask.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'remove-tag-from-task',
      )?.[1] as (
        event: unknown,
        taskId: string,
        tagId: string,
      ) => Promise<unknown>;

      await expect(handler({}, 'task1', 'tag1')).rejects.toThrow(
        'Remove tag error',
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error removing tag from task:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
