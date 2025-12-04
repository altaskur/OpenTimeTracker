import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type Mock,
  type Mocked,
  type MockInstance,
} from 'vitest';
import { ipcMain } from 'electron';
import { setupDatabaseHandlers } from './database-handlers.js';
import { DatabaseManager } from '../database/database.js';

/**
 * Database Handlers Test Suite
 */
describe('Database Handlers', () => {
  let mockDbManager: Mocked<DatabaseManager>;
  let handleSpy: MockInstance;

  beforeEach(() => {
    mockDbManager = {
      getProjects: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      deleteProject: vi.fn(),
      canCloseProject: vi.fn(),
      closeProject: vi.fn(),
      reopenProject: vi.fn(),
      getTasks: vi.fn(),
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      getTaskStatuses: vi.fn(),
      createTaskStatus: vi.fn(),
      updateTaskStatus: vi.fn(),
      deleteTaskStatus: vi.fn(),
      getTimeEntries: vi.fn(),
      getTimeEntriesByDateRange: vi.fn(),
      getTimeEntriesByDate: vi.fn(),
      getPendingTimeEntries: vi.fn(),
      createTimeEntry: vi.fn(),
      updateTimeEntry: vi.fn(),
      deleteTimeEntry: vi.fn(),
      getWorkPeriods: vi.fn(),
      getWorkPeriod: vi.fn(),
      createWorkPeriod: vi.fn(),
      updateWorkPeriod: vi.fn(),
      upsertWorkPeriod: vi.fn(),
      getTags: vi.fn(),
      createTag: vi.fn(),
      updateTag: vi.fn(),
      deleteTag: vi.fn(),
      addTagToTask: vi.fn(),
      removeTagFromTask: vi.fn(),
      createActionHistory: vi.fn(),
      getActionHistory: vi.fn(),
      getLastUndoableAction: vi.fn(),
      getLastRedoableAction: vi.fn(),
      markActionUndone: vi.fn(),
      markActionRedone: vi.fn(),
      clearActionHistory: vi.fn(),
      getDayTypes: vi.fn(),
      createDayType: vi.fn(),
      updateDayType: vi.fn(),
      deleteDayType: vi.fn(),
      getDayOverrides: vi.fn(),
      getDayOverride: vi.fn(),
      createDayOverride: vi.fn(),
      updateDayOverride: vi.fn(),
      upsertDayOverride: vi.fn(),
      deleteDayOverride: vi.fn(),
      getAuditLogs: vi.fn(),
      getWorkConfig: vi.fn(),
      updateWorkConfig: vi.fn(),
      getMonthConfig: vi.fn(),
      updateMonthConfig: vi.fn(),
    } as unknown as Mocked<DatabaseManager>;

    handleSpy = vi.spyOn(ipcMain, 'handle');
  });

  afterEach(() => {
    vi.clearAllMocks();
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
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
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
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
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
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
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
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
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
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
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
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
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
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
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
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
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
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
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
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
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
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
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
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
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
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
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
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
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
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
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
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
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
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
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
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
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
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
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
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
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
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
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

  describe('Action History Handlers', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle create-action-history', async () => {
      const mockAction = {
        id: '1',
        entityType: 'task',
        entityId: '1',
        actionType: 'create',
        description: 'Created task',
      } as unknown;
      (mockDbManager.createActionHistory as Mock).mockResolvedValue(mockAction);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'create-action-history',
      )?.[1] as (
        event: unknown,
        entityType: string,
        entityId: string,
        actionType: string,
        description: string,
        previousData?: string,
        newData?: string,
      ) => Promise<unknown>;
      const result = await handler(
        {},
        'task',
        '1',
        'create',
        'Created task',
        undefined,
        undefined,
      );

      expect(mockDbManager.createActionHistory).toHaveBeenCalled();
      expect(result).toEqual(mockAction);
    });

    it('should handle get-action-history', async () => {
      const mockHistory = [{ id: '1', entityType: 'task' }] as unknown;
      (mockDbManager.getActionHistory as Mock).mockResolvedValue(mockHistory);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-action-history',
      )?.[1] as (event: unknown, limit?: number) => Promise<unknown>;
      const result = await handler({}, 10);

      expect(mockDbManager.getActionHistory).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockHistory);
    });

    it('should handle get-last-undoable-action', async () => {
      const mockAction = { id: '1', entityType: 'task' } as unknown;
      (mockDbManager.getLastUndoableAction as Mock).mockResolvedValue(
        mockAction,
      );

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-last-undoable-action',
      )?.[1] as () => Promise<unknown>;
      const result = await handler();

      expect(mockDbManager.getLastUndoableAction).toHaveBeenCalled();
      expect(result).toEqual(mockAction);
    });

    it('should handle get-last-redoable-action', async () => {
      const mockAction = { id: '1', entityType: 'task' } as unknown;
      (mockDbManager.getLastRedoableAction as Mock).mockResolvedValue(
        mockAction,
      );

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-last-redoable-action',
      )?.[1] as () => Promise<unknown>;
      const result = await handler();

      expect(mockDbManager.getLastRedoableAction).toHaveBeenCalled();
      expect(result).toEqual(mockAction);
    });

    it('should handle mark-action-undone', async () => {
      const mockResult = { id: '1' } as unknown;
      (mockDbManager.markActionUndone as Mock).mockResolvedValue(mockResult);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'mark-action-undone',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;
      const result = await handler({}, '1');

      expect(mockDbManager.markActionUndone).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockResult);
    });

    it('should handle mark-action-redone', async () => {
      const mockResult = { id: '1' } as unknown;
      (mockDbManager.markActionRedone as Mock).mockResolvedValue(mockResult);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'mark-action-redone',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;
      const result = await handler({}, '1');

      expect(mockDbManager.markActionRedone).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockResult);
    });

    it('should handle clear-action-history', async () => {
      const mockResult = { count: 5 } as unknown;
      (mockDbManager.clearActionHistory as Mock).mockResolvedValue(mockResult);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'clear-action-history',
      )?.[1] as () => Promise<unknown>;
      const result = await handler();

      expect(mockDbManager.clearActionHistory).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe('Day Types Handlers', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle get-day-types', async () => {
      const mockDayTypes = [
        { id: '1', name: 'Holiday', color: '#ff0000' },
      ] as unknown;
      (mockDbManager.getDayTypes as Mock).mockResolvedValue(mockDayTypes);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-day-types',
      )?.[1] as () => Promise<unknown>;
      const result = await handler();

      expect(mockDbManager.getDayTypes).toHaveBeenCalled();
      expect(result).toEqual(mockDayTypes);
    });

    it('should handle create-day-type', async () => {
      const mockDayType = {
        id: '1',
        name: 'Holiday',
        color: '#ff0000',
        defaultMinutes: 0,
      } as unknown;
      (mockDbManager.createDayType as Mock).mockResolvedValue(mockDayType);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'create-day-type',
      )?.[1] as (
        event: unknown,
        name: string,
        color: string,
        defaultMinutes?: number,
      ) => Promise<unknown>;
      const result = await handler({}, 'Holiday', '#ff0000', 0);

      expect(mockDbManager.createDayType).toHaveBeenCalledWith(
        'Holiday',
        '#ff0000',
        0,
      );
      expect(result).toEqual(mockDayType);
    });

    it('should handle update-day-type', async () => {
      const mockDayType = {
        id: '1',
        name: 'Updated',
        color: '#00ff00',
      } as unknown;
      (mockDbManager.updateDayType as Mock).mockResolvedValue(mockDayType);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'update-day-type',
      )?.[1] as (event: unknown, id: string, data: unknown) => Promise<unknown>;
      const result = await handler({}, '1', { name: 'Updated' });

      expect(mockDbManager.updateDayType).toHaveBeenCalledWith('1', {
        name: 'Updated',
      });
      expect(result).toEqual(mockDayType);
    });

    it('should handle delete-day-type', async () => {
      const mockResult = { id: '1' } as unknown;
      (mockDbManager.deleteDayType as Mock).mockResolvedValue(mockResult);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'delete-day-type',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;
      const result = await handler({}, '1');

      expect(mockDbManager.deleteDayType).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockResult);
    });
  });

  describe('Day Overrides Handlers', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle get-day-overrides', async () => {
      const mockOverrides = [{ id: '1', date: '2025-01-01' }] as unknown;
      (mockDbManager.getDayOverrides as Mock).mockResolvedValue(mockOverrides);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-day-overrides',
      )?.[1] as (
        event: unknown,
        startDate?: string,
        endDate?: string,
      ) => Promise<unknown>;
      const result = await handler({}, '2025-01-01', '2025-01-31');

      expect(mockDbManager.getDayOverrides).toHaveBeenCalledWith(
        '2025-01-01',
        '2025-01-31',
      );
      expect(result).toEqual(mockOverrides);
    });

    it('should handle get-day-override', async () => {
      const mockOverride = { id: '1', date: '2025-01-01' } as unknown;
      (mockDbManager.getDayOverride as Mock).mockResolvedValue(mockOverride);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-day-override',
      )?.[1] as (event: unknown, date: string) => Promise<unknown>;
      const result = await handler({}, '2025-01-01');

      expect(mockDbManager.getDayOverride).toHaveBeenCalledWith('2025-01-01');
      expect(result).toEqual(mockOverride);
    });

    it('should handle create-day-override', async () => {
      const mockOverride = {
        id: '1',
        date: '2025-01-01',
        dayTypeId: '1',
        minutes: 0,
      } as unknown;
      (mockDbManager.createDayOverride as Mock).mockResolvedValue(mockOverride);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'create-day-override',
      )?.[1] as (
        event: unknown,
        date: string,
        dayTypeId?: string,
        minutes?: number,
        note?: string,
      ) => Promise<unknown>;
      const result = await handler({}, '2025-01-01', '1', 0, 'Holiday');

      expect(mockDbManager.createDayOverride).toHaveBeenCalledWith(
        '2025-01-01',
        '1',
        0,
        'Holiday',
      );
      expect(result).toEqual(mockOverride);
    });

    it('should handle update-day-override', async () => {
      const mockOverride = {
        id: '1',
        date: '2025-01-01',
        minutes: 240,
      } as unknown;
      (mockDbManager.updateDayOverride as Mock).mockResolvedValue(mockOverride);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'update-day-override',
      )?.[1] as (event: unknown, id: string, data: unknown) => Promise<unknown>;
      const result = await handler({}, '1', { minutes: 240 });

      expect(mockDbManager.updateDayOverride).toHaveBeenCalledWith('1', {
        minutes: 240,
      });
      expect(result).toEqual(mockOverride);
    });

    it('should handle upsert-day-override', async () => {
      const mockOverride = { id: '1', date: '2025-01-01' } as unknown;
      (mockDbManager.upsertDayOverride as Mock).mockResolvedValue(mockOverride);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'upsert-day-override',
      )?.[1] as (
        event: unknown,
        date: string,
        dayTypeId?: string,
        minutes?: number,
        note?: string,
      ) => Promise<unknown>;
      const result = await handler({}, '2025-01-01', '1', 0, 'Note');

      expect(mockDbManager.upsertDayOverride).toHaveBeenCalledWith(
        '2025-01-01',
        '1',
        0,
        'Note',
      );
      expect(result).toEqual(mockOverride);
    });

    it('should handle delete-day-override', async () => {
      const mockResult = { id: '1' } as unknown;
      (mockDbManager.deleteDayOverride as Mock).mockResolvedValue(mockResult);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'delete-day-override',
      )?.[1] as (event: unknown, date: string) => Promise<unknown>;
      const result = await handler({}, '2025-01-01');

      expect(mockDbManager.deleteDayOverride).toHaveBeenCalledWith(
        '2025-01-01',
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('Audit Logs Handlers', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle get-audit-logs', async () => {
      const mockLogs = [
        { id: '1', entityType: 'task', action: 'create' },
      ] as unknown;
      (mockDbManager.getAuditLogs as Mock).mockResolvedValue(mockLogs);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-audit-logs',
      )?.[1] as (
        event: unknown,
        entityType?: string,
        entityId?: string,
        taskId?: string,
      ) => Promise<unknown>;
      const result = await handler({}, 'task', '1', undefined);

      expect(mockDbManager.getAuditLogs).toHaveBeenCalledWith(
        'task',
        '1',
        undefined,
      );
      expect(result).toEqual(mockLogs);
    });
  });

  describe('Work Config Handlers', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle get-work-config', async () => {
      const mockConfig = { id: '1', weeklyMinutes: 2400 } as unknown;
      (mockDbManager.getWorkConfig as Mock).mockResolvedValue(mockConfig);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-work-config',
      )?.[1] as () => Promise<unknown>;
      const result = await handler();

      expect(mockDbManager.getWorkConfig).toHaveBeenCalled();
      expect(result).toEqual(mockConfig);
    });

    it('should handle update-work-config', async () => {
      const mockConfig = { id: '1', weeklyMinutes: 2000 } as unknown;
      (mockDbManager.updateWorkConfig as Mock).mockResolvedValue(mockConfig);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'update-work-config',
      )?.[1] as (event: unknown, data: unknown) => Promise<unknown>;
      const result = await handler({}, { weeklyMinutes: 2000 });

      expect(mockDbManager.updateWorkConfig).toHaveBeenCalledWith({
        weeklyMinutes: 2000,
      });
      expect(result).toEqual(mockConfig);
    });
  });

  describe('Month Config Handlers', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle get-month-config', async () => {
      const mockConfig = { id: '1', year: 2025, month: 1 } as unknown;
      (mockDbManager.getMonthConfig as Mock).mockResolvedValue(mockConfig);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-month-config',
      )?.[1] as (
        event: unknown,
        year: number,
        month: number,
      ) => Promise<unknown>;
      const result = await handler({}, 2025, 1);

      expect(mockDbManager.getMonthConfig).toHaveBeenCalledWith(2025, 1);
      expect(result).toEqual(mockConfig);
    });

    it('should handle update-month-config', async () => {
      const mockConfig = { id: '1', year: 2025, month: 1 } as unknown;
      (mockDbManager.updateMonthConfig as Mock).mockResolvedValue(mockConfig);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'update-month-config',
      )?.[1] as (
        event: unknown,
        year: number,
        month: number,
        data: unknown,
      ) => Promise<unknown>;
      const result = await handler({}, 2025, 1, { weeklyMinutes: 2000 });

      expect(mockDbManager.updateMonthConfig).toHaveBeenCalledWith(2025, 1, {
        weeklyMinutes: 2000,
      });
      expect(result).toEqual(mockConfig);
    });
  });

  describe('Work Period Handlers - Additional', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle update-work-period', async () => {
      const mockPeriod = { id: '1', year: 2025, month: 1 } as unknown;
      (mockDbManager.updateWorkPeriod as Mock).mockResolvedValue(mockPeriod);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'update-work-period',
      )?.[1] as (
        event: unknown,
        year: number,
        month: number,
        data: unknown,
      ) => Promise<unknown>;
      const result = await handler({}, 2025, 1, { plannedHours: 160 });

      expect(mockDbManager.updateWorkPeriod).toHaveBeenCalledWith(2025, 1, {
        plannedHours: 160,
      });
      expect(result).toEqual(mockPeriod);
    });

    it('should handle upsert-work-period', async () => {
      const mockPeriod = { id: '1', year: 2025, month: 1 } as unknown;
      (mockDbManager.upsertWorkPeriod as Mock).mockResolvedValue(mockPeriod);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'upsert-work-period',
      )?.[1] as (
        event: unknown,
        year: number,
        month: number,
        plannedHours: number,
        note?: string,
      ) => Promise<unknown>;
      const result = await handler({}, 2025, 1, 160, 'Note');

      expect(mockDbManager.upsertWorkPeriod).toHaveBeenCalledWith(
        2025,
        1,
        160,
        'Note',
      );
      expect(result).toEqual(mockPeriod);
    });
  });

  describe('Tag Handlers - Additional', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle update-tag', async () => {
      const mockTag = { id: '1', name: 'Updated Tag' } as unknown;
      (mockDbManager.updateTag as Mock).mockResolvedValue(mockTag);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'update-tag',
      )?.[1] as (event: unknown, id: string, name: string) => Promise<unknown>;
      const result = await handler({}, '1', 'Updated Tag');

      expect(mockDbManager.updateTag).toHaveBeenCalledWith('1', 'Updated Tag');
      expect(result).toEqual(mockTag);
    });
  });

  describe('Error Handling - Time Entries', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle error in get-time-entries-by-date-range', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Date range error');
      (
        mockDbManager as unknown as { getTimeEntriesByDateRange: Mock }
      ).getTimeEntriesByDateRange = vi.fn().mockRejectedValue(error);
      setupDatabaseHandlers(mockDbManager);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-time-entries-by-date-range',
      )?.[1] as (
        event: unknown,
        startDate: string,
        endDate: string,
      ) => Promise<unknown>;

      await expect(handler({}, '2025-01-01', '2025-01-31')).rejects.toThrow(
        'Date range error',
      );
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in get-time-entries-by-date', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Date error');
      (
        mockDbManager as unknown as { getTimeEntriesByDate: Mock }
      ).getTimeEntriesByDate = vi.fn().mockRejectedValue(error);
      setupDatabaseHandlers(mockDbManager);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-time-entries-by-date',
      )?.[1] as (event: unknown, date: string) => Promise<unknown>;

      await expect(handler({}, '2025-01-01')).rejects.toThrow('Date error');
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in get-pending-time-entries', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Pending entries error');
      mockDbManager.getPendingTimeEntries.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-pending-time-entries',
      )?.[1] as () => Promise<unknown>;

      await expect(handler()).rejects.toThrow('Pending entries error');
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in create-time-entry', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Create time entry error');
      mockDbManager.createTimeEntry.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'create-time-entry',
      )?.[1] as (
        event: unknown,
        date: string,
        minutes: number,
        taskId?: string,
        notes?: string,
      ) => Promise<unknown>;

      await expect(
        handler({}, '2025-01-01', 60, 'task1', 'note'),
      ).rejects.toThrow('Create time entry error');
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in update-time-entry', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Update time entry error');
      mockDbManager.updateTimeEntry.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'update-time-entry',
      )?.[1] as (event: unknown, id: string, data: unknown) => Promise<unknown>;

      await expect(handler({}, '1', { minutes: 120 })).rejects.toThrow(
        'Update time entry error',
      );
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in delete-time-entry', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Delete time entry error');
      mockDbManager.deleteTimeEntry.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'delete-time-entry',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;

      await expect(handler({}, '1')).rejects.toThrow('Delete time entry error');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Error Handling - Work Periods', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle error in get-work-periods', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Get work periods error');
      mockDbManager.getWorkPeriods.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-work-periods',
      )?.[1] as () => Promise<unknown>;

      await expect(handler()).rejects.toThrow('Get work periods error');
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in get-work-period', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Get work period error');
      (mockDbManager as unknown as { getWorkPeriod: Mock }).getWorkPeriod = vi
        .fn()
        .mockRejectedValue(error);
      setupDatabaseHandlers(mockDbManager);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-work-period',
      )?.[1] as (
        event: unknown,
        year: number,
        month: number,
      ) => Promise<unknown>;

      await expect(handler({}, 2025, 1)).rejects.toThrow(
        'Get work period error',
      );
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in create-work-period', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Create work period error');
      mockDbManager.createWorkPeriod.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'create-work-period',
      )?.[1] as (
        event: unknown,
        year: number,
        month: number,
        plannedHours: number,
        note?: string,
      ) => Promise<unknown>;

      await expect(handler({}, 2025, 1, 160, 'note')).rejects.toThrow(
        'Create work period error',
      );
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in update-work-period', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Update work period error');
      mockDbManager.updateWorkPeriod.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'update-work-period',
      )?.[1] as (
        event: unknown,
        year: number,
        month: number,
        data: unknown,
      ) => Promise<unknown>;

      await expect(handler({}, 2025, 1, { plannedHours: 160 })).rejects.toThrow(
        'Update work period error',
      );
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in upsert-work-period', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Upsert work period error');
      mockDbManager.upsertWorkPeriod.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'upsert-work-period',
      )?.[1] as (
        event: unknown,
        year: number,
        month: number,
        plannedHours: number,
        note?: string,
      ) => Promise<unknown>;

      await expect(handler({}, 2025, 1, 160, 'note')).rejects.toThrow(
        'Upsert work period error',
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Error Handling - Tags', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle error in get-tags', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Get tags error');
      mockDbManager.getTags.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-tags',
      )?.[1] as () => Promise<unknown>;

      await expect(handler()).rejects.toThrow('Get tags error');
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in create-tag', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Create tag error');
      mockDbManager.createTag.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'create-tag',
      )?.[1] as (event: unknown, name: string) => Promise<unknown>;

      await expect(handler({}, 'New Tag')).rejects.toThrow('Create tag error');
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in update-tag', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Update tag error');
      mockDbManager.updateTag.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'update-tag',
      )?.[1] as (event: unknown, id: string, name: string) => Promise<unknown>;

      await expect(handler({}, '1', 'Updated Tag')).rejects.toThrow(
        'Update tag error',
      );
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in delete-tag', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Delete tag error');
      mockDbManager.deleteTag.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'delete-tag',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;

      await expect(handler({}, '1')).rejects.toThrow('Delete tag error');
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in add-tag-to-task', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Add tag to task error');
      mockDbManager.addTagToTask.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'add-tag-to-task',
      )?.[1] as (
        event: unknown,
        taskId: string,
        tagId: string,
      ) => Promise<unknown>;

      await expect(handler({}, 'task1', 'tag1')).rejects.toThrow(
        'Add tag to task error',
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Error Handling - Work Config', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle error in get-work-config', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Get work config error');
      mockDbManager.getWorkConfig.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-work-config',
      )?.[1] as () => Promise<unknown>;

      await expect(handler()).rejects.toThrow('Get work config error');
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in update-work-config', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Update work config error');
      mockDbManager.updateWorkConfig.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'update-work-config',
      )?.[1] as (event: unknown, data: unknown) => Promise<unknown>;

      await expect(handler({}, { weeklyMinutes: 2400 })).rejects.toThrow(
        'Update work config error',
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Error Handling - Month Config', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle error in get-month-config', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Get month config error');
      mockDbManager.getMonthConfig.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-month-config',
      )?.[1] as (
        event: unknown,
        year: number,
        month: number,
      ) => Promise<unknown>;

      await expect(handler({}, 2025, 1)).rejects.toThrow(
        'Get month config error',
      );
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in update-month-config', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Update month config error');
      mockDbManager.updateMonthConfig.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'update-month-config',
      )?.[1] as (
        event: unknown,
        year: number,
        month: number,
        data: unknown,
      ) => Promise<unknown>;

      await expect(
        handler({}, 2025, 1, { weeklyMinutes: 2400 }),
      ).rejects.toThrow('Update month config error');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Error Handling - Day Types', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle error in get-day-types', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Get day types error');
      mockDbManager.getDayTypes.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-day-types',
      )?.[1] as () => Promise<unknown>;

      await expect(handler()).rejects.toThrow('Get day types error');
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in create-day-type', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Create day type error');
      mockDbManager.createDayType.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'create-day-type',
      )?.[1] as (
        event: unknown,
        name: string,
        color: string,
        defaultMinutes?: number,
      ) => Promise<unknown>;

      await expect(handler({}, 'Holiday', '#ff0000', 0)).rejects.toThrow(
        'Create day type error',
      );
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in update-day-type', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Update day type error');
      mockDbManager.updateDayType.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'update-day-type',
      )?.[1] as (event: unknown, id: string, data: unknown) => Promise<unknown>;

      await expect(handler({}, '1', { name: 'Updated' })).rejects.toThrow(
        'Update day type error',
      );
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in delete-day-type', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Delete day type error');
      mockDbManager.deleteDayType.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'delete-day-type',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;

      await expect(handler({}, '1')).rejects.toThrow('Delete day type error');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Error Handling - Day Overrides', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle error in get-day-overrides', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Get day overrides error');
      mockDbManager.getDayOverrides.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-day-overrides',
      )?.[1] as (
        event: unknown,
        startDate?: string,
        endDate?: string,
      ) => Promise<unknown>;

      await expect(handler({}, '2025-01-01', '2025-01-31')).rejects.toThrow(
        'Get day overrides error',
      );
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in get-day-override', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Get day override error');
      mockDbManager.getDayOverride.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-day-override',
      )?.[1] as (event: unknown, date: string) => Promise<unknown>;

      await expect(handler({}, '2025-01-01')).rejects.toThrow(
        'Get day override error',
      );
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in create-day-override', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Create day override error');
      mockDbManager.createDayOverride.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'create-day-override',
      )?.[1] as (
        event: unknown,
        date: string,
        dayTypeId?: string,
        minutes?: number,
        note?: string,
      ) => Promise<unknown>;

      await expect(handler({}, '2025-01-01', '1', 0, 'note')).rejects.toThrow(
        'Create day override error',
      );
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in update-day-override', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Update day override error');
      mockDbManager.updateDayOverride.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'update-day-override',
      )?.[1] as (event: unknown, id: string, data: unknown) => Promise<unknown>;

      await expect(handler({}, '1', { minutes: 240 })).rejects.toThrow(
        'Update day override error',
      );
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in upsert-day-override', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Upsert day override error');
      mockDbManager.upsertDayOverride.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'upsert-day-override',
      )?.[1] as (
        event: unknown,
        date: string,
        dayTypeId?: string,
        minutes?: number,
        note?: string,
      ) => Promise<unknown>;

      await expect(handler({}, '2025-01-01', '1', 0, 'note')).rejects.toThrow(
        'Upsert day override error',
      );
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in delete-day-override', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Delete day override error');
      mockDbManager.deleteDayOverride.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'delete-day-override',
      )?.[1] as (event: unknown, date: string) => Promise<unknown>;

      await expect(handler({}, '2025-01-01')).rejects.toThrow(
        'Delete day override error',
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Error Handling - Audit Logs', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle error in get-audit-logs', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Get audit logs error');
      mockDbManager.getAuditLogs.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-audit-logs',
      )?.[1] as (
        event: unknown,
        entityType?: string,
        entityId?: string,
        taskId?: string,
      ) => Promise<unknown>;

      await expect(handler({}, 'task', '1', undefined)).rejects.toThrow(
        'Get audit logs error',
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Error Handling - Action History', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle error in create-action-history', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Create action history error');
      mockDbManager.createActionHistory.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'create-action-history',
      )?.[1] as (
        event: unknown,
        entityType: string,
        entityId: string,
        actionType: string,
        description: string,
        previousData?: string,
        newData?: string,
      ) => Promise<unknown>;

      await expect(
        handler(
          {},
          'task',
          '1',
          'create',
          'Created task',
          undefined,
          undefined,
        ),
      ).rejects.toThrow('Create action history error');
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in get-action-history', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Get action history error');
      mockDbManager.getActionHistory.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-action-history',
      )?.[1] as (event: unknown, limit?: number) => Promise<unknown>;

      await expect(handler({}, 10)).rejects.toThrow('Get action history error');
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in get-last-undoable-action', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Get last undoable action error');
      mockDbManager.getLastUndoableAction.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-last-undoable-action',
      )?.[1] as () => Promise<unknown>;

      await expect(handler()).rejects.toThrow('Get last undoable action error');
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in get-last-redoable-action', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Get last redoable action error');
      mockDbManager.getLastRedoableAction.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'get-last-redoable-action',
      )?.[1] as () => Promise<unknown>;

      await expect(handler()).rejects.toThrow('Get last redoable action error');
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in mark-action-undone', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Mark action undone error');
      mockDbManager.markActionUndone.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'mark-action-undone',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;

      await expect(handler({}, '1')).rejects.toThrow(
        'Mark action undone error',
      );
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in mark-action-redone', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Mark action redone error');
      mockDbManager.markActionRedone.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'mark-action-redone',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;

      await expect(handler({}, '1')).rejects.toThrow(
        'Mark action redone error',
      );
      consoleErrorSpy.mockRestore();
    });

    it('should handle error in clear-action-history', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Clear action history error');
      mockDbManager.clearActionHistory.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'clear-action-history',
      )?.[1] as () => Promise<unknown>;

      await expect(handler()).rejects.toThrow('Clear action history error');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Project Close/Reopen Handlers', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle can-close-project', async () => {
      mockDbManager.canCloseProject.mockResolvedValue(true);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'can-close-project',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;

      const result = await handler({}, '1');
      expect(result).toBe(true);
      expect(mockDbManager.canCloseProject).toHaveBeenCalledWith('1');
    });

    it('should handle can-close-project returning false', async () => {
      mockDbManager.canCloseProject.mockResolvedValue(false);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'can-close-project',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;

      const result = await handler({}, '2');
      expect(result).toBe(false);
      expect(mockDbManager.canCloseProject).toHaveBeenCalledWith('2');
    });

    it('should handle error in can-close-project', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Can close project error');
      mockDbManager.canCloseProject.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'can-close-project',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;

      await expect(handler({}, '1')).rejects.toThrow('Can close project error');
      consoleErrorSpy.mockRestore();
    });

    it('should handle close-project', async () => {
      const closedProject = {
        id: '1',
        name: 'Test',
        description: null,
        isClosed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDbManager.closeProject.mockResolvedValue(closedProject);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'close-project',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;

      const result = await handler({}, '1');
      expect(result).toEqual(closedProject);
      expect(mockDbManager.closeProject).toHaveBeenCalledWith('1');
    });

    it('should handle error in close-project', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Close project error');
      mockDbManager.closeProject.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'close-project',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;

      await expect(handler({}, '1')).rejects.toThrow('Close project error');
      consoleErrorSpy.mockRestore();
    });

    it('should handle reopen-project', async () => {
      const reopenedProject = {
        id: '1',
        name: 'Test',
        description: null,
        isClosed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDbManager.reopenProject.mockResolvedValue(reopenedProject);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'reopen-project',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;

      const result = await handler({}, '1');
      expect(result).toEqual(reopenedProject);
      expect(mockDbManager.reopenProject).toHaveBeenCalledWith('1');
    });

    it('should handle error in reopen-project', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Reopen project error');
      mockDbManager.reopenProject.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'reopen-project',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;

      await expect(handler({}, '1')).rejects.toThrow('Reopen project error');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Task Status Handlers', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle create-task-status', async () => {
      const newStatus = {
        id: '1',
        name: 'In Progress',
        color: '#FF5733',
        isDefault: false,
      };
      mockDbManager.createTaskStatus.mockResolvedValue(newStatus);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'create-task-status',
      )?.[1] as (
        event: unknown,
        name: string,
        color: string,
      ) => Promise<unknown>;

      const result = await handler({}, 'In Progress', '#FF5733');
      expect(result).toEqual(newStatus);
      expect(mockDbManager.createTaskStatus).toHaveBeenCalledWith(
        'In Progress',
        '#FF5733',
      );
    });

    it('should handle error in create-task-status', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Create task status error');
      mockDbManager.createTaskStatus.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'create-task-status',
      )?.[1] as (
        event: unknown,
        name: string,
        color: string,
      ) => Promise<unknown>;

      await expect(handler({}, 'Status', '#000')).rejects.toThrow(
        'Create task status error',
      );
      consoleErrorSpy.mockRestore();
    });

    it('should handle update-task-status', async () => {
      const updatedStatus = {
        id: '1',
        name: 'Done',
        color: '#00FF00',
        isDefault: false,
      };
      mockDbManager.updateTaskStatus.mockResolvedValue(updatedStatus);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'update-task-status',
      )?.[1] as (
        event: unknown,
        id: string,
        name: string,
        color: string,
      ) => Promise<unknown>;

      const result = await handler({}, '1', 'Done', '#00FF00');
      expect(result).toEqual(updatedStatus);
      expect(mockDbManager.updateTaskStatus).toHaveBeenCalledWith(
        '1',
        'Done',
        '#00FF00',
      );
    });

    it('should handle error in update-task-status', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Update task status error');
      mockDbManager.updateTaskStatus.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'update-task-status',
      )?.[1] as (
        event: unknown,
        id: string,
        name: string,
        color: string,
      ) => Promise<unknown>;

      await expect(handler({}, '1', 'Status', '#000')).rejects.toThrow(
        'Update task status error',
      );
      consoleErrorSpy.mockRestore();
    });

    it('should handle delete-task-status', async () => {
      mockDbManager.deleteTaskStatus.mockResolvedValue(null);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'delete-task-status',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;

      await handler({}, '1');
      expect(mockDbManager.deleteTaskStatus).toHaveBeenCalledWith('1');
    });

    it('should handle error in delete-task-status', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const error = new Error('Delete task status error');
      mockDbManager.deleteTaskStatus.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call: unknown[]) => call[0] === 'delete-task-status',
      )?.[1] as (event: unknown, id: string) => Promise<unknown>;

      await expect(handler({}, '1')).rejects.toThrow(
        'Delete task status error',
      );
      consoleErrorSpy.mockRestore();
    });
  });
});
