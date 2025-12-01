import { TestBed } from '@angular/core/testing';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let originalElectronAPI: typeof window.electronAPI;
  let mockElectronAPI: Partial<typeof window.electronAPI>;

  beforeEach(() => {
    // Mock electronAPI
    mockElectronAPI = {
      getProjects: jasmine
        .createSpy('getProjects')
        .and.returnValue(Promise.resolve([])),
      createProject: jasmine
        .createSpy('createProject')
        .and.returnValue(Promise.resolve({ changes: 1 })),
      updateProject: jasmine
        .createSpy('updateProject')
        .and.returnValue(Promise.resolve({ changes: 1 })),
      deleteProject: jasmine
        .createSpy('deleteProject')
        .and.returnValue(Promise.resolve({ changes: 1 })),
      getTasks: jasmine
        .createSpy('getTasks')
        .and.returnValue(Promise.resolve([])),
      createTask: jasmine
        .createSpy('createTask')
        .and.returnValue(Promise.resolve({ changes: 1 })),
      updateTask: jasmine
        .createSpy('updateTask')
        .and.returnValue(Promise.resolve({ changes: 1 })),
      deleteTask: jasmine
        .createSpy('deleteTask')
        .and.returnValue(Promise.resolve({ changes: 1 })),
      getTaskStatuses: jasmine
        .createSpy('getTaskStatuses')
        .and.returnValue(Promise.resolve([])),
      getTimeEntries: jasmine
        .createSpy('getTimeEntries')
        .and.returnValue(Promise.resolve([])),
      createTimeEntry: jasmine
        .createSpy('createTimeEntry')
        .and.returnValue(Promise.resolve({ changes: 1 })),
      updateTimeEntry: jasmine
        .createSpy('updateTimeEntry')
        .and.returnValue(Promise.resolve({ changes: 1 })),
      deleteTimeEntry: jasmine
        .createSpy('deleteTimeEntry')
        .and.returnValue(Promise.resolve({ changes: 1 })),
      getWorkPeriods: jasmine
        .createSpy('getWorkPeriods')
        .and.returnValue(Promise.resolve([])),
      createWorkPeriod: jasmine
        .createSpy('createWorkPeriod')
        .and.returnValue(Promise.resolve({ changes: 1 })),
      getPendingTimeEntries: jasmine
        .createSpy('getPendingTimeEntries')
        .and.returnValue(Promise.resolve([])),
      onNavigate: jasmine.createSpy('onNavigate'),
      getTheme: jasmine
        .createSpy('getTheme')
        .and.returnValue(Promise.resolve(false)),
      toggleTheme: jasmine.createSpy('toggleTheme'),
      onThemeChange: jasmine.createSpy('onThemeChange'),
      getLanguage: jasmine
        .createSpy('getLanguage')
        .and.returnValue(Promise.resolve('es')),
      setLanguage: jasmine.createSpy('setLanguage'),
      onLanguageChange: jasmine.createSpy('onLanguageChange'),
      canCloseProject: jasmine
        .createSpy('canCloseProject')
        .and.returnValue(Promise.resolve(true)),
      closeProject: jasmine
        .createSpy('closeProject')
        .and.returnValue(Promise.resolve({ id: '1', isClosed: true })),
      reopenProject: jasmine
        .createSpy('reopenProject')
        .and.returnValue(Promise.resolve({ id: '1', isClosed: false })),
      getTags: jasmine
        .createSpy('getTags')
        .and.returnValue(Promise.resolve([])),
      createTag: jasmine
        .createSpy('createTag')
        .and.returnValue(Promise.resolve({ id: '1', name: 'Test' })),
      deleteTag: jasmine
        .createSpy('deleteTag')
        .and.returnValue(Promise.resolve({ changes: 1 })),
      addTagToTask: jasmine
        .createSpy('addTagToTask')
        .and.returnValue(Promise.resolve()),
      removeTagFromTask: jasmine
        .createSpy('removeTagFromTask')
        .and.returnValue(Promise.resolve()),
      getAuditLogs: jasmine
        .createSpy('getAuditLogs')
        .and.returnValue(Promise.resolve([])),
    };

    // Save original and set up global window mock
    originalElectronAPI = window.electronAPI;
    Object.defineProperty(window, 'electronAPI', {
      writable: true,
      configurable: true,
      value: mockElectronAPI,
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(DatabaseService);
  });

  afterEach(() => {
    // Restore original electronAPI
    if (originalElectronAPI) {
      Object.defineProperty(window, 'electronAPI', {
        writable: true,
        configurable: true,
        value: originalElectronAPI,
      });
    } else {
      delete (window as { electronAPI?: typeof window.electronAPI })
        .electronAPI;
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Projects', () => {
    it('should get projects', async () => {
      const result = await service.getProjects();
      expect(mockElectronAPI.getProjects).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should create project', async () => {
      await service.createProject('Test Project', 'Description');
      expect(mockElectronAPI.createProject).toHaveBeenCalledWith(
        'Test Project',
        'Description',
      );
    });

    it('should update project', async () => {
      await service.updateProject('1', 'Updated', 'New desc');
      expect(mockElectronAPI.updateProject).toHaveBeenCalledWith(
        '1',
        'Updated',
        'New desc',
      );
    });

    it('should delete project', async () => {
      await service.deleteProject('1');
      expect(mockElectronAPI.deleteProject).toHaveBeenCalledWith('1');
    });

    it('should check if project can close', async () => {
      const result = await service.canCloseProject('1');
      expect(mockElectronAPI.canCloseProject).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });

    it('should close project', async () => {
      const result = await service.closeProject('1');
      expect(mockElectronAPI.closeProject).toHaveBeenCalledWith('1');
      expect(result.isClosed).toBe(true);
    });

    it('should reopen project', async () => {
      const result = await service.reopenProject('1');
      expect(mockElectronAPI.reopenProject).toHaveBeenCalledWith('1');
      expect(result.isClosed).toBe(false);
    });
  });

  describe('Tasks', () => {
    it('should get tasks', async () => {
      const result = await service.getTasks();
      expect(mockElectronAPI.getTasks).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([]);
    });

    it('should get tasks by project', async () => {
      const result = await service.getTasks('project1');
      expect(mockElectronAPI.getTasks).toHaveBeenCalledWith('project1');
      expect(result).toEqual([]);
    });

    it('should create task', async () => {
      await service.createTask('p1', 'Task', 'Desc', 5, 's1');
      expect(mockElectronAPI.createTask).toHaveBeenCalledWith(
        'p1',
        'Task',
        'Desc',
        5,
        's1',
        undefined,
      );
    });

    it('should create task with tags', async () => {
      await service.createTask('p1', 'Task', 'Desc', 5, 's1', ['t1', 't2']);
      expect(mockElectronAPI.createTask).toHaveBeenCalledWith(
        'p1',
        'Task',
        'Desc',
        5,
        's1',
        ['t1', 't2'],
      );
    });

    it('should update task', async () => {
      const taskData = { name: 'Updated', description: 'Desc' };
      await service.updateTask('t1', taskData);
      expect(mockElectronAPI.updateTask).toHaveBeenCalledWith('t1', taskData);
    });

    it('should delete task', async () => {
      await service.deleteTask('t1');
      expect(mockElectronAPI.deleteTask).toHaveBeenCalledWith('t1');
    });

    it('should get task statuses', async () => {
      const result = await service.getTaskStatuses();
      expect(mockElectronAPI.getTaskStatuses).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('Time Entries', () => {
    it('should get time entries', async () => {
      const result = await service.getTimeEntries();
      expect(mockElectronAPI.getTimeEntries).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([]);
    });

    it('should get time entries by task', async () => {
      const result = await service.getTimeEntries('task1');
      expect(mockElectronAPI.getTimeEntries).toHaveBeenCalledWith('task1');
      expect(result).toEqual([]);
    });

    it('should get pending time entries', async () => {
      mockElectronAPI.getPendingTimeEntries = jasmine
        .createSpy('getPendingTimeEntries')
        .and.returnValue(Promise.resolve([]));
      const result = await service.getPendingTimeEntries();
      expect(mockElectronAPI.getPendingTimeEntries).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should create time entry', async () => {
      await service.createTimeEntry('2025-01-01', 60, 't1', 'Notes');
      expect(mockElectronAPI.createTimeEntry).toHaveBeenCalledWith(
        '2025-01-01',
        60,
        't1',
        'Notes',
      );
    });

    it('should update time entry', async () => {
      const entryData = { hours: 120, notes: 'Updated' };
      await service.updateTimeEntry('e1', entryData);
      expect(mockElectronAPI.updateTimeEntry).toHaveBeenCalledWith(
        'e1',
        entryData,
      );
    });

    it('should delete time entry', async () => {
      await service.deleteTimeEntry('e1');
      expect(mockElectronAPI.deleteTimeEntry).toHaveBeenCalledWith('e1');
    });
  });

  describe('Work Periods', () => {
    it('should get work periods', async () => {
      const result = await service.getWorkPeriods();
      expect(mockElectronAPI.getWorkPeriods).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should create work period', async () => {
      mockElectronAPI.createWorkPeriod = jasmine
        .createSpy('createWorkPeriod')
        .and.returnValue(Promise.resolve({ changes: 1 }));
      await service.createWorkPeriod(2025, 11, 160, 'November');
      expect(mockElectronAPI.createWorkPeriod).toHaveBeenCalledWith(
        2025,
        11,
        160,
        'November',
      );
    });
  });

  describe('Tags', () => {
    it('should get tags', async () => {
      const result = await service.getTags();
      expect(mockElectronAPI.getTags).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should create tag', async () => {
      const result = await service.createTag('Bug');
      expect(mockElectronAPI.createTag).toHaveBeenCalledWith('Bug');
      expect(result.name).toBe('Test');
    });

    it('should delete tag', async () => {
      await service.deleteTag('t1');
      expect(mockElectronAPI.deleteTag).toHaveBeenCalledWith('t1');
    });

    it('should add tag to task', async () => {
      await service.addTagToTask('task1', 'tag1');
      expect(mockElectronAPI.addTagToTask).toHaveBeenCalledWith(
        'task1',
        'tag1',
      );
    });

    it('should remove tag from task', async () => {
      await service.removeTagFromTask('task1', 'tag1');
      expect(mockElectronAPI.removeTagFromTask).toHaveBeenCalledWith(
        'task1',
        'tag1',
      );
    });
  });

  describe('Audit Logs', () => {
    it('should get all audit logs', async () => {
      const result = await service.getAuditLogs();
      expect(mockElectronAPI.getAuditLogs).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
      expect(result).toEqual([]);
    });

    it('should get audit logs by entity type', async () => {
      const result = await service.getAuditLogs('Project');
      expect(mockElectronAPI.getAuditLogs).toHaveBeenCalledWith(
        'Project',
        undefined,
      );
      expect(result).toEqual([]);
    });

    it('should get audit logs by entity type and id', async () => {
      const result = await service.getAuditLogs('Project', 'p1');
      expect(mockElectronAPI.getAuditLogs).toHaveBeenCalledWith(
        'Project',
        'p1',
      );
      expect(result).toEqual([]);
    });
  });

  describe('Error handling when electronAPI is not available', () => {
    beforeEach(() => {
      // Remove electronAPI to test error paths
      delete (window as { electronAPI?: typeof window.electronAPI })
        .electronAPI;
    });

    it('should throw ElectronApiError when getProjects and electronAPI is undefined', async () => {
      await expectAsync(service.getProjects()).toBeRejectedWithError(
        /Electron API not available/,
      );
    });

    it('should throw ElectronApiError when getTasks and electronAPI is undefined', async () => {
      await expectAsync(service.getTasks()).toBeRejectedWithError(
        /Electron API not available/,
      );
    });

    it('should throw ElectronApiError when getTaskStatuses and electronAPI is undefined', async () => {
      await expectAsync(service.getTaskStatuses()).toBeRejectedWithError(
        /Electron API not available/,
      );
    });

    it('should throw ElectronApiError when getTimeEntries and electronAPI is undefined', async () => {
      await expectAsync(service.getTimeEntries()).toBeRejectedWithError(
        /Electron API not available/,
      );
    });

    it('should throw ElectronApiError when getPendingTimeEntries and electronAPI is undefined', async () => {
      await expectAsync(service.getPendingTimeEntries()).toBeRejectedWithError(
        /Electron API not available/,
      );
    });

    it('should throw ElectronApiError when getWorkPeriods and electronAPI is undefined', async () => {
      await expectAsync(service.getWorkPeriods()).toBeRejectedWithError(
        /Electron API not available/,
      );
    });

    it('should throw ElectronApiError when createProject and electronAPI is undefined', async () => {
      await expectAsync(
        service.createProject('Test', 'Desc'),
      ).toBeRejectedWithError(/Electron API not available/);
    });

    it('should throw ElectronApiError when updateProject and electronAPI is undefined', async () => {
      await expectAsync(
        service.updateProject('1', 'Test', 'Desc'),
      ).toBeRejectedWithError(/Electron API not available/);
    });

    it('should throw ElectronApiError when deleteProject and electronAPI is undefined', async () => {
      await expectAsync(service.deleteProject('1')).toBeRejectedWithError(
        /Electron API not available/,
      );
    });

    it('should throw ElectronApiError when createTask and electronAPI is undefined', async () => {
      await expectAsync(
        service.createTask('p1', 'Task', 'Desc', 5, 's1'),
      ).toBeRejectedWithError(/Electron API not available/);
    });

    it('should throw ElectronApiError when updateTask and electronAPI is undefined', async () => {
      await expectAsync(
        service.updateTask('t1', { name: 'Updated' }),
      ).toBeRejectedWithError(/Electron API not available/);
    });

    it('should throw ElectronApiError when deleteTask and electronAPI is undefined', async () => {
      await expectAsync(service.deleteTask('t1')).toBeRejectedWithError(
        /Electron API not available/,
      );
    });

    it('should throw ElectronApiError when createTimeEntry and electronAPI is undefined', async () => {
      await expectAsync(
        service.createTimeEntry('2025-01-01', 60, 't1', 'Notes'),
      ).toBeRejectedWithError(/Electron API not available/);
    });

    it('should throw ElectronApiError when updateTimeEntry and electronAPI is undefined', async () => {
      await expectAsync(
        service.updateTimeEntry('e1', { hours: 120 }),
      ).toBeRejectedWithError(/Electron API not available/);
    });

    it('should throw ElectronApiError when deleteTimeEntry and electronAPI is undefined', async () => {
      await expectAsync(service.deleteTimeEntry('e1')).toBeRejectedWithError(
        /Electron API not available/,
      );
    });

    it('should throw ElectronApiError when createWorkPeriod and electronAPI is undefined', async () => {
      await expectAsync(
        service.createWorkPeriod(2025, 11, 160, 'November'),
      ).toBeRejectedWithError(/Electron API not available/);
    });

    it('should throw ElectronApiError when canCloseProject and electronAPI is undefined', async () => {
      await expectAsync(service.canCloseProject('1')).toBeRejectedWithError(
        /Electron API not available/,
      );
    });

    it('should throw ElectronApiError when closeProject and electronAPI is undefined', async () => {
      await expectAsync(service.closeProject('1')).toBeRejectedWithError(
        /Electron API not available/,
      );
    });

    it('should throw ElectronApiError when reopenProject and electronAPI is undefined', async () => {
      await expectAsync(service.reopenProject('1')).toBeRejectedWithError(
        /Electron API not available/,
      );
    });

    it('should throw ElectronApiError when getTags and electronAPI is undefined', async () => {
      await expectAsync(service.getTags()).toBeRejectedWithError(
        /Electron API not available/,
      );
    });

    it('should throw ElectronApiError when createTag and electronAPI is undefined', async () => {
      await expectAsync(service.createTag('Bug')).toBeRejectedWithError(
        /Electron API not available/,
      );
    });

    it('should throw ElectronApiError when deleteTag and electronAPI is undefined', async () => {
      await expectAsync(service.deleteTag('t1')).toBeRejectedWithError(
        /Electron API not available/,
      );
    });

    it('should throw ElectronApiError when addTagToTask and electronAPI is undefined', async () => {
      await expectAsync(
        service.addTagToTask('task1', 'tag1'),
      ).toBeRejectedWithError(/Electron API not available/);
    });

    it('should throw ElectronApiError when removeTagFromTask and electronAPI is undefined', async () => {
      await expectAsync(
        service.removeTagFromTask('task1', 'tag1'),
      ).toBeRejectedWithError(/Electron API not available/);
    });

    it('should throw ElectronApiError when getAuditLogs and electronAPI is undefined', async () => {
      await expectAsync(service.getAuditLogs()).toBeRejectedWithError(
        /Electron API not available/,
      );
    });
  });
});
