import { ipcMain } from 'electron';
import { setupDatabaseHandlers } from './database-handlers';
import { DatabaseManager } from '../database/database';

jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn(),
  },
}));

describe('Database Handlers', () => {
  let mockDbManager: jest.Mocked<DatabaseManager>;
  let handleSpy: jest.SpyInstance;

  beforeEach(() => {
    // Create mock database manager
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
    } as any;

    handleSpy = jest.spyOn(ipcMain, 'handle');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Setup', () => {
    it('should register all IPC handlers', () => {
      setupDatabaseHandlers(mockDbManager);

      const registeredHandlers = handleSpy.mock.calls.map((call) => call[0]);

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
    });
  });

  describe('Projects Handlers', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should handle get-projects', async () => {
      const mockProjects = [
        { id: '1', name: 'Project 1', description: 'Description 1' },
        { id: '2', name: 'Project 2', description: 'Description 2' },
      ];
      mockDbManager.getProjects.mockResolvedValue(mockProjects as any);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'get-projects',
      )[1];
      const result = await handler();

      expect(mockDbManager.getProjects).toHaveBeenCalled();
      expect(result).toEqual(mockProjects);
    });

    it('should handle get-projects error', async () => {
      const error = new Error('Database error');
      mockDbManager.getProjects.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'get-projects',
      )[1];

      try {
        await handler();
        fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.message).toBe('Database error');
      }
    });

    it('should handle create-project', async () => {
      const mockProject = {
        id: '1',
        name: 'New Project',
        description: 'New Description',
      };
      mockDbManager.createProject.mockResolvedValue(mockProject as any);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'create-project',
      )[1];
      const result = await handler({}, 'New Project', 'New Description');

      expect(mockDbManager.createProject).toHaveBeenCalledWith(
        'New Project',
        'New Description',
      );
      expect(result).toEqual(mockProject);
    });

    it('should handle create-project without description', async () => {
      const mockProject = { id: '1', name: 'New Project', description: null };
      mockDbManager.createProject.mockResolvedValue(mockProject as any);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'create-project',
      )[1];
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
      };
      mockDbManager.updateProject.mockResolvedValue(mockProject as any);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'update-project',
      )[1];
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
      const mockProject = { id: '1', name: 'Deleted Project' };
      mockDbManager.deleteProject.mockResolvedValue(mockProject as any);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'delete-project',
      )[1];
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
        { id: '1', name: 'Task 1', projectId: 'p1' },
        { id: '2', name: 'Task 2', projectId: 'p2' },
      ];
      mockDbManager.getTasks.mockResolvedValue(mockTasks as any);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'get-tasks',
      )[1];
      const result = await handler({});

      expect(mockDbManager.getTasks).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockTasks);
    });

    it('should handle get-tasks with projectId', async () => {
      const mockTasks = [{ id: '1', name: 'Task 1', projectId: 'p1' }];
      mockDbManager.getTasks.mockResolvedValue(mockTasks as any);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'get-tasks',
      )[1];
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
      };
      mockDbManager.createTask.mockResolvedValue(mockTask as any);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'create-task',
      )[1];
      const result = await handler(
        {},
        'p1',
        'New Task',
        'Description',
        5,
        's1',
      );

      expect(mockDbManager.createTask).toHaveBeenCalledWith(
        'p1',
        'New Task',
        'Description',
        5,
        's1',
      );
      expect(result).toEqual(mockTask);
    });

    it('should handle create-task with minimal data', async () => {
      const mockTask = {
        id: '1',
        name: 'New Task',
        projectId: 'p1',
      };
      mockDbManager.createTask.mockResolvedValue(mockTask as any);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'create-task',
      )[1];
      const result = await handler({}, 'p1', 'New Task');

      expect(mockDbManager.createTask).toHaveBeenCalledWith(
        'p1',
        'New Task',
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual(mockTask);
    });

    it('should handle update-task', async () => {
      const mockTask = { id: '1', name: 'Updated Task' };
      mockDbManager.updateTask.mockResolvedValue(mockTask as any);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'update-task',
      )[1];
      const data = { name: 'Updated Task', description: 'New description' };
      const result = await handler({}, '1', data);

      expect(mockDbManager.updateTask).toHaveBeenCalledWith('1', data);
      expect(result).toEqual(mockTask);
    });

    it('should handle delete-task', async () => {
      const mockTask = { id: '1', name: 'Deleted Task' };
      mockDbManager.deleteTask.mockResolvedValue(mockTask as any);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'delete-task',
      )[1];
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
        { id: '1', name: 'Pendiente' },
        { id: '2', name: 'En progreso' },
        { id: '3', name: 'Completada' },
      ];
      mockDbManager.getTaskStatuses.mockResolvedValue(mockStatuses as any);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'get-task-statuses',
      )[1];
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
        { id: '1', date: '2025-01-01', hours: 8 },
        { id: '2', date: '2025-01-02', hours: 6 },
      ];
      mockDbManager.getTimeEntries.mockResolvedValue(mockEntries as any);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'get-time-entries',
      )[1];
      const result = await handler({});

      expect(mockDbManager.getTimeEntries).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockEntries);
    });

    it('should handle get-time-entries with taskId', async () => {
      const mockEntries = [
        { id: '1', date: '2025-01-01', hours: 8, taskId: 't1' },
      ];
      mockDbManager.getTimeEntries.mockResolvedValue(mockEntries as any);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'get-time-entries',
      )[1];
      const result = await handler({}, 't1');

      expect(mockDbManager.getTimeEntries).toHaveBeenCalledWith('t1');
      expect(result).toEqual(mockEntries);
    });

    it('should handle get-pending-time-entries', async () => {
      const mockEntries = [
        { id: '1', date: '2025-01-01', hours: 8, taskId: null },
      ];
      mockDbManager.getPendingTimeEntries.mockResolvedValue(mockEntries as any);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'get-pending-time-entries',
      )[1];
      const result = await handler();

      expect(mockDbManager.getPendingTimeEntries).toHaveBeenCalled();
      expect(result).toEqual(mockEntries);
    });

    it('should handle create-time-entry', async () => {
      const mockEntry = {
        id: '1',
        date: '2025-01-01',
        hours: 8,
        taskId: 't1',
        notes: 'Work notes',
      };
      mockDbManager.createTimeEntry.mockResolvedValue(mockEntry as any);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'create-time-entry',
      )[1];
      const result = await handler({}, '2025-01-01', 8, 't1', 'Work notes');

      expect(mockDbManager.createTimeEntry).toHaveBeenCalledWith(
        '2025-01-01',
        8,
        't1',
        'Work notes',
      );
      expect(result).toEqual(mockEntry);
    });

    it('should handle create-time-entry without taskId', async () => {
      const mockEntry = {
        id: '1',
        date: '2025-01-01',
        hours: 8,
        taskId: null,
      };
      mockDbManager.createTimeEntry.mockResolvedValue(mockEntry as any);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'create-time-entry',
      )[1];
      const result = await handler({}, '2025-01-01', 8);

      expect(mockDbManager.createTimeEntry).toHaveBeenCalledWith(
        '2025-01-01',
        8,
        undefined,
        undefined,
      );
      expect(result).toEqual(mockEntry);
    });

    it('should handle update-time-entry', async () => {
      const mockEntry = { id: '1', date: '2025-01-01', hours: 10 };
      mockDbManager.updateTimeEntry.mockResolvedValue(mockEntry as any);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'update-time-entry',
      )[1];
      const data = { hours: 10 };
      const result = await handler({}, '1', data);

      expect(mockDbManager.updateTimeEntry).toHaveBeenCalledWith('1', data);
      expect(result).toEqual(mockEntry);
    });

    it('should handle delete-time-entry', async () => {
      const mockEntry = { id: '1', date: '2025-01-01', hours: 8 };
      mockDbManager.deleteTimeEntry.mockResolvedValue(mockEntry as any);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'delete-time-entry',
      )[1];
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
        { id: '1', year: 2025, month: 1, plannedHours: 160 },
        { id: '2', year: 2025, month: 2, plannedHours: 152 },
      ];
      mockDbManager.getWorkPeriods.mockResolvedValue(mockPeriods as any);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'get-work-periods',
      )[1];
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
      };
      mockDbManager.createWorkPeriod.mockResolvedValue(mockPeriod as any);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'create-work-period',
      )[1];
      const result = await handler({}, 2025, 1, 160, 'January period');

      expect(mockDbManager.createWorkPeriod).toHaveBeenCalledWith(
        2025,
        1,
        160,
        'January period',
      );
      expect(result).toEqual(mockPeriod);
    });

    it('should handle create-work-period without note', async () => {
      const mockPeriod = {
        id: '1',
        year: 2025,
        month: 1,
        plannedHours: 160,
      };
      mockDbManager.createWorkPeriod.mockResolvedValue(mockPeriod as any);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'create-work-period',
      )[1];
      const result = await handler({}, 2025, 1, 160);

      expect(mockDbManager.createWorkPeriod).toHaveBeenCalledWith(
        2025,
        1,
        160,
        undefined,
      );
      expect(result).toEqual(mockPeriod);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      setupDatabaseHandlers(mockDbManager);
    });

    it('should log and throw errors in handlers', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');
      mockDbManager.getProjects.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'get-projects',
      )[1];

      try {
        await handler();
        fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.message).toBe('Test error');
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting projects:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle create-project errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Create error');
      mockDbManager.createProject.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'create-project',
      )[1];

      try {
        await handler({}, 'Test Project');
        fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.message).toBe('Create error');
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating project:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle update-task errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Update error');
      mockDbManager.updateTask.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'update-task',
      )[1];

      try {
        await handler({}, '1', { name: 'Updated' });
        fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.message).toBe('Update error');
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error updating task:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle delete-time-entry errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Delete error');
      mockDbManager.deleteTimeEntry.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'delete-time-entry',
      )[1];

      try {
        await handler({}, '1');
        fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.message).toBe('Delete error');
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error deleting time entry:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle update-project errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Update project error');
      mockDbManager.updateProject.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'update-project',
      )[1];

      try {
        await handler({}, '1', 'Updated Project', 'Description');
        fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.message).toBe('Update project error');
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error updating project:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle delete-project errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Delete project error');
      mockDbManager.deleteProject.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'delete-project',
      )[1];

      try {
        await handler({}, '1');
        fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.message).toBe('Delete project error');
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error deleting project:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle get-tasks errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Get tasks error');
      mockDbManager.getTasks.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'get-tasks',
      )[1];

      try {
        await handler({}, 'p1');
        fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.message).toBe('Get tasks error');
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting tasks:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle create-task errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Create task error');
      mockDbManager.createTask.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'create-task',
      )[1];

      try {
        await handler({}, 'p1', 'New Task', 'Description', 5, 's1');
        fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.message).toBe('Create task error');
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating task:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle delete-task errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Delete task error');
      mockDbManager.deleteTask.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'delete-task',
      )[1];

      try {
        await handler({}, '1');
        fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.message).toBe('Delete task error');
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error deleting task:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle get-task-statuses errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Get statuses error');
      mockDbManager.getTaskStatuses.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'get-task-statuses',
      )[1];

      try {
        await handler();
        fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.message).toBe('Get statuses error');
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting task statuses:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle get-time-entries errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Get time entries error');
      mockDbManager.getTimeEntries.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'get-time-entries',
      )[1];

      try {
        await handler({}, 't1');
        fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.message).toBe('Get time entries error');
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting time entries:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle get-pending-time-entries errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Get pending entries error');
      mockDbManager.getPendingTimeEntries.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'get-pending-time-entries',
      )[1];

      try {
        await handler();
        fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.message).toBe('Get pending entries error');
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting pending time entries:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle create-time-entry errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Create time entry error');
      mockDbManager.createTimeEntry.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'create-time-entry',
      )[1];

      try {
        await handler({}, '2025-01-01', 8, 't1', 'Notes');
        fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.message).toBe('Create time entry error');
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating time entry:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle update-time-entry errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Update time entry error');
      mockDbManager.updateTimeEntry.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'update-time-entry',
      )[1];

      try {
        await handler({}, '1', { hours: 10 });
        fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.message).toBe('Update time entry error');
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error updating time entry:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle get-work-periods errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Get work periods error');
      mockDbManager.getWorkPeriods.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'get-work-periods',
      )[1];

      try {
        await handler();
        fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.message).toBe('Get work periods error');
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting work periods:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle create-work-period errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Create work period error');
      mockDbManager.createWorkPeriod.mockRejectedValue(error);

      const handler = handleSpy.mock.calls.find(
        (call) => call[0] === 'create-work-period',
      )[1];

      try {
        await handler({}, 2025, 1, 160, 'Note');
        fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.message).toBe('Create work period error');
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating work period:',
        error,
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
