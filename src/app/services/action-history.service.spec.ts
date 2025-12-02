import { TestBed } from '@angular/core/testing';

import {
  ActionHistoryService,
  ExecuteActionParams,
} from './action-history.service';

describe('ActionHistoryService', () => {
  let service: ActionHistoryService;
  let mockElectronAPI: jasmine.SpyObj<typeof window.electronAPI>;

  beforeEach(() => {
    mockElectronAPI = jasmine.createSpyObj('electronAPI', [
      'createActionHistory',
      'getActionHistory',
      'markActionUndone',
      'markActionRedone',
      'onUndoAction',
      'onRedoAction',
      'createProject',
      'updateProject',
      'deleteProject',
      'createTask',
      'updateTask',
      'deleteTask',
      'createTimeEntry',
      'updateTimeEntry',
      'deleteTimeEntry',
      'upsertDayOverride',
      'deleteDayOverride',
      'createDayType',
      'updateDayType',
      'deleteDayType',
    ]);

    mockElectronAPI.getActionHistory.and.returnValue(Promise.resolve([]));
    mockElectronAPI.createActionHistory.and.returnValue(
      Promise.resolve({
        id: 'test-id-123',
        entityType: 'Project',
        entityId: 'entity-1',
        actionType: 'create',
        description: 'Test action',
        previousData: null,
        newData: '{}',
        undone: false,
        createdAt: new Date(),
      }),
    );

    (window as unknown as { electronAPI: typeof mockElectronAPI }).electronAPI =
      mockElectronAPI;

    TestBed.configureTestingModule({
      providers: [ActionHistoryService],
    });

    service = TestBed.inject(ActionHistoryService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have canUndo as false initially', () => {
      expect(service.canUndo()).toBeFalse();
    });

    it('should have canRedo as false initially', () => {
      expect(service.canRedo()).toBeFalse();
    });

    it('should have actionCount as 0 initially', () => {
      expect(service.actionCount()).toBe(0);
    });

    it('should have lastAction as null initially', () => {
      expect(service.lastAction()).toBeNull();
    });

    it('should have empty actions array', () => {
      expect(service.actions()).toEqual([]);
    });
  });

  describe('execute', () => {
    it('should execute an action and add to undo stack', async () => {
      const executeFn = jasmine
        .createSpy('execute')
        .and.returnValue(Promise.resolve());
      const undoFn = jasmine
        .createSpy('undo')
        .and.returnValue(Promise.resolve());

      const params: ExecuteActionParams = {
        entityType: 'Project',
        actionType: 'create',
        entityId: 'project-1',
        description: 'Created project',
        previousData: null,
        newData: { name: 'Test Project' },
        execute: executeFn,
        undo: undoFn,
      };

      await service.execute(params);

      expect(executeFn).toHaveBeenCalled();
      expect(service.actionCount()).toBe(1);
      expect(service.canUndo()).toBeTrue();
    });

    it('should persist action to database', async () => {
      const params: ExecuteActionParams = {
        entityType: 'Task',
        actionType: 'update',
        entityId: 'task-1',
        description: 'Updated task',
        previousData: { name: 'Old' },
        newData: { name: 'New' },
        execute: () => Promise.resolve(),
        undo: () => Promise.resolve(),
      };

      await service.execute(params);

      expect(mockElectronAPI.createActionHistory).toHaveBeenCalledWith(
        'Task',
        'task-1',
        'update',
        'Updated task',
        JSON.stringify({ name: 'Old' }),
        JSON.stringify({ name: 'New' }),
      );
    });

    it('should clear redo stack when new action is executed', async () => {
      const params: ExecuteActionParams = {
        entityType: 'Project',
        actionType: 'create',
        entityId: 'p1',
        description: 'Test',
        previousData: null,
        newData: {},
        execute: () => Promise.resolve(),
        undo: () => Promise.resolve(),
      };

      await service.execute(params);
      await service.undo();
      expect(service.canRedo()).toBeTrue();

      await service.execute(params);
      expect(service.canRedo()).toBeFalse();
    });
  });

  describe('undo', () => {
    beforeEach(async () => {
      const params: ExecuteActionParams = {
        entityType: 'Project',
        actionType: 'create',
        entityId: 'project-1',
        description: 'Created project',
        previousData: null,
        newData: { name: 'Test' },
        execute: () => Promise.resolve(),
        undo: () => Promise.resolve(),
      };

      await service.execute(params);
    });

    it('should undo the last action', async () => {
      const result = await service.undo();

      expect(result).toBeTruthy();
      expect(result?.description).toBe('Created project');
      expect(service.canUndo()).toBeFalse();
    });

    it('should add undone action to redo stack', async () => {
      await service.undo();

      expect(service.canRedo()).toBeTrue();
    });

    it('should return null when nothing to undo', async () => {
      await service.undo();
      const result = await service.undo();

      expect(result).toBeNull();
    });

    it('should mark action as undone in database', async () => {
      mockElectronAPI.markActionUndone.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.undo();

      expect(mockElectronAPI.markActionUndone).toHaveBeenCalledWith(
        'test-id-123',
      );
    });

    it('should update dataChanged signal', async () => {
      const initialTimestamp = service.dataChanged().timestamp;

      await service.undo();

      expect(service.dataChanged().timestamp).toBeGreaterThan(initialTimestamp);
      expect(service.dataChanged().entityType).toBe('Project');
    });
  });

  describe('redo', () => {
    beforeEach(async () => {
      const params: ExecuteActionParams = {
        entityType: 'Task',
        actionType: 'delete',
        entityId: 'task-1',
        description: 'Deleted task',
        previousData: { name: 'Task to delete' },
        newData: null,
        execute: () => Promise.resolve(),
        undo: () => Promise.resolve(),
      };

      await service.execute(params);
      await service.undo();
    });

    it('should redo the last undone action', async () => {
      const result = await service.redo();

      expect(result).toBeTruthy();
      expect(result?.description).toBe('Deleted task');
    });

    it('should move action back to undo stack', async () => {
      await service.redo();

      expect(service.canUndo()).toBeTrue();
      expect(service.canRedo()).toBeFalse();
    });

    it('should return null when nothing to redo', async () => {
      await service.redo();
      const result = await service.redo();

      expect(result).toBeNull();
    });

    it('should mark action as redone in database', async () => {
      mockElectronAPI.markActionRedone.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.redo();

      expect(mockElectronAPI.markActionRedone).toHaveBeenCalled();
    });
  });

  describe('undoTo', () => {
    beforeEach(async () => {
      for (let i = 1; i <= 3; i++) {
        mockElectronAPI.createActionHistory.and.returnValue(
          Promise.resolve({
            id: `action-${i}`,
            entityType: 'Project',
            entityId: `entity-${i}`,
            actionType: 'create',
            description: `Action ${i}`,
            previousData: null,
            newData: '{}',
            undone: false,
            createdAt: new Date(),
          }),
        );

        await service.execute({
          entityType: 'Project',
          actionType: 'create',
          entityId: `entity-${i}`,
          description: `Action ${i}`,
          previousData: null,
          newData: {},
          execute: () => Promise.resolve(),
          undo: () => Promise.resolve(),
        });
      }
    });

    it('should undo multiple actions to reach target', async () => {
      const count = await service.undoTo('action-1');

      expect(count).toBe(3);
      expect(service.canUndo()).toBeFalse();
    });

    it('should return 0 when action not found', async () => {
      const count = await service.undoTo('non-existent');

      expect(count).toBe(0);
    });
  });

  describe('clear', () => {
    beforeEach(async () => {
      await service.execute({
        entityType: 'Project',
        actionType: 'create',
        entityId: 'p1',
        description: 'Test',
        previousData: null,
        newData: {},
        execute: () => Promise.resolve(),
        undo: () => Promise.resolve(),
      });
    });

    it('should clear all history', () => {
      service.clear();

      expect(service.actionCount()).toBe(0);
      expect(service.canUndo()).toBeFalse();
      expect(service.canRedo()).toBeFalse();
    });
  });

  describe('getActionIcon', () => {
    it('should return plus icon for create', () => {
      expect(service.getActionIcon('create')).toBe('pi pi-plus');
    });

    it('should return pencil icon for update', () => {
      expect(service.getActionIcon('update')).toBe('pi pi-pencil');
    });

    it('should return trash icon for delete', () => {
      expect(service.getActionIcon('delete')).toBe('pi pi-trash');
    });

    it('should return circle icon for unknown action', () => {
      expect(service.getActionIcon('unknown' as never)).toBe('pi pi-circle');
    });
  });

  describe('getEntityIcon', () => {
    it('should return folder icon for Project', () => {
      expect(service.getEntityIcon('Project')).toBe('pi pi-folder');
    });

    it('should return check-square icon for Task', () => {
      expect(service.getEntityIcon('Task')).toBe('pi pi-check-square');
    });

    it('should return clock icon for TimeEntry', () => {
      expect(service.getEntityIcon('TimeEntry')).toBe('pi pi-clock');
    });

    it('should return calendar icon for DayOverride', () => {
      expect(service.getEntityIcon('DayOverride')).toBe('pi pi-calendar');
    });

    it('should return cog icon for MonthConfig', () => {
      expect(service.getEntityIcon('MonthConfig')).toBe('pi pi-cog');
    });

    it('should return tag icon for Tag', () => {
      expect(service.getEntityIcon('Tag')).toBe('pi pi-tag');
    });

    it('should return circle icon for unknown entity', () => {
      expect(service.getEntityIcon('Unknown' as never)).toBe('pi pi-circle');
    });
  });

  describe('loadFromDatabase', () => {
    it('should load history from database on init', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'Project',
          entityId: 'p1',
          actionType: 'create',
          description: 'Created project',
          previousData: null,
          newData: '{"name":"Test"}',
          undone: false,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockElectronAPI.getActionHistory).toHaveBeenCalled();
    });
  });

  describe('Electron listeners', () => {
    it('should register undo listener', () => {
      expect(mockElectronAPI.onUndoAction).toHaveBeenCalled();
    });

    it('should register redo listener', () => {
      expect(mockElectronAPI.onRedoAction).toHaveBeenCalled();
    });
  });

  describe('persistAction error handling', () => {
    it('should generate local id when persist fails', async () => {
      mockElectronAPI.createActionHistory.and.returnValue(
        Promise.reject(new Error('DB error')),
      );

      const params: ExecuteActionParams = {
        entityType: 'Project',
        actionType: 'create',
        entityId: 'p1',
        description: 'Test',
        previousData: null,
        newData: {},
        execute: () => Promise.resolve(),
        undo: () => Promise.resolve(),
      };

      await service.execute(params);

      expect(service.actionCount()).toBe(1);
      const lastAction = service.lastAction();
      expect(lastAction?.id).toContain('local_');
    });
  });

  describe('loadFromDatabase', () => {
    it('should load and reconstruct undo and redo stacks', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'Project',
          entityId: 'p1',
          actionType: 'create',
          description: 'Created project 1',
          previousData: null,
          newData: '{"name":"Test1"}',
          undone: false,
          createdAt: new Date(),
        },
        {
          id: 'db-2',
          entityType: 'Task',
          entityId: 't1',
          actionType: 'update',
          description: 'Updated task',
          previousData: '{"name":"Old"}',
          newData: '{"name":"New"}',
          undone: true,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );

      await service.loadFromDatabase();

      expect(service.canUndo()).toBeTrue();
      expect(service.canRedo()).toBeTrue();
    });

    it('should handle load error gracefully', async () => {
      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.reject(new Error('Load error')),
      );
      spyOn(console, 'error');

      await service.loadFromDatabase();

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('MAX_HISTORY_SIZE limit', () => {
    it('should remove oldest action when stack exceeds limit', async () => {
      for (let i = 0; i < 55; i++) {
        mockElectronAPI.createActionHistory.and.returnValue(
          Promise.resolve({
            id: `action-${i}`,
            entityType: 'Project',
            entityId: `entity-${i}`,
            actionType: 'create',
            description: `Action ${i}`,
            previousData: null,
            newData: '{}',
            undone: false,
            createdAt: new Date(),
          }),
        );

        await service.execute({
          entityType: 'Project',
          actionType: 'create',
          entityId: `entity-${i}`,
          description: `Action ${i}`,
          previousData: null,
          newData: {},
          execute: () => Promise.resolve(),
          undo: () => Promise.resolve(),
        });
      }

      expect(service.actionCount()).toBe(50);
    });
  });

  describe('undo error handling', () => {
    it('should continue even when markActionUndone fails', async () => {
      mockElectronAPI.markActionUndone.and.returnValue(
        Promise.reject(new Error('DB error')),
      );
      spyOn(console, 'error');

      const params: ExecuteActionParams = {
        entityType: 'Project',
        actionType: 'create',
        entityId: 'p1',
        description: 'Test',
        previousData: null,
        newData: {},
        execute: () => Promise.resolve(),
        undo: () => Promise.resolve(),
      };

      await service.execute(params);
      const result = await service.undo();

      expect(result).toBeTruthy();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('redo error handling', () => {
    it('should continue even when markActionRedone fails', async () => {
      mockElectronAPI.markActionRedone.and.returnValue(
        Promise.reject(new Error('DB error')),
      );
      spyOn(console, 'error');

      const params: ExecuteActionParams = {
        entityType: 'Project',
        actionType: 'create',
        entityId: 'p1',
        description: 'Test',
        previousData: null,
        newData: {},
        execute: () => Promise.resolve(),
        undo: () => Promise.resolve(),
      };

      await service.execute(params);
      await service.undo();
      const result = await service.redo();

      expect(result).toBeTruthy();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('action execution paths', () => {
    it('should handle TimeEntry entity type for create', async () => {
      const params: ExecuteActionParams = {
        entityType: 'TimeEntry',
        actionType: 'create',
        entityId: 'te1',
        description: 'Created time entry',
        previousData: null,
        newData: {
          date: '2025-01-01',
          minutes: 60,
          taskId: 't1',
          notes: 'Test',
        },
        execute: () => Promise.resolve(),
        undo: () => Promise.resolve(),
      };

      await service.execute(params);
      expect(service.actionCount()).toBe(1);
    });

    it('should handle DayOverride entity type', async () => {
      const params: ExecuteActionParams = {
        entityType: 'DayOverride',
        actionType: 'create',
        entityId: 'do1',
        description: 'Created day override',
        previousData: null,
        newData: {
          date: '2025-01-01',
          dayTypeId: 'dt1',
          minutes: 0,
          note: 'Holiday',
        },
        execute: () => Promise.resolve(),
        undo: () => Promise.resolve(),
      };

      await service.execute(params);
      expect(service.actionCount()).toBe(1);
    });

    it('should handle DayType entity type', async () => {
      const params: ExecuteActionParams = {
        entityType: 'DayType',
        actionType: 'create',
        entityId: 'dt1',
        description: 'Created day type',
        previousData: null,
        newData: { name: 'Holiday', color: '#ff0000', defaultMinutes: 0 },
        execute: () => Promise.resolve(),
        undo: () => Promise.resolve(),
      };

      await service.execute(params);
      expect(service.actionCount()).toBe(1);
    });

    it('should handle Tag entity type', async () => {
      const params: ExecuteActionParams = {
        entityType: 'Tag',
        actionType: 'create',
        entityId: 'tag1',
        description: 'Created tag',
        previousData: null,
        newData: { name: 'Bug' },
        execute: () => Promise.resolve(),
        undo: () => Promise.resolve(),
      };

      await service.execute(params);
      expect(service.actionCount()).toBe(1);
    });

    it('should handle MonthConfig entity type', async () => {
      const params: ExecuteActionParams = {
        entityType: 'MonthConfig',
        actionType: 'update',
        entityId: 'mc1',
        description: 'Updated month config',
        previousData: { workDays: '1,2,3,4,5' },
        newData: { workDays: '1,2,3,4' },
        execute: () => Promise.resolve(),
        undo: () => Promise.resolve(),
      };

      await service.execute(params);
      expect(service.actionCount()).toBe(1);
    });
  });

  describe('action types coverage', () => {
    it('should handle update action type for Project', async () => {
      const params: ExecuteActionParams = {
        entityType: 'Project',
        actionType: 'update',
        entityId: 'p1',
        description: 'Updated project',
        previousData: { name: 'Old' },
        newData: { name: 'New' },
        execute: () => Promise.resolve(),
        undo: () => Promise.resolve(),
      };

      await service.execute(params);
      expect(service.actionCount()).toBe(1);
      expect(service.lastAction()?.actionType).toBe('update');
    });

    it('should handle delete action type for Task', async () => {
      const params: ExecuteActionParams = {
        entityType: 'Task',
        actionType: 'delete',
        entityId: 't1',
        description: 'Deleted task',
        previousData: { name: 'Task 1', projectId: 'p1' },
        newData: null,
        execute: () => Promise.resolve(),
        undo: () => Promise.resolve(),
      };

      await service.execute(params);
      expect(service.actionCount()).toBe(1);
      expect(service.lastAction()?.actionType).toBe('delete');
    });
  });

  describe('undoTo edge cases', () => {
    it('should handle undoTo with single action', async () => {
      mockElectronAPI.createActionHistory.and.returnValue(
        Promise.resolve({
          id: 'action-1',
          entityType: 'Project',
          entityId: 'p1',
          actionType: 'create',
          description: 'Action 1',
          previousData: null,
          newData: '{}',
          undone: false,
          createdAt: new Date(),
        }),
      );

      await service.execute({
        entityType: 'Project',
        actionType: 'create',
        entityId: 'p1',
        description: 'Action 1',
        previousData: null,
        newData: {},
        execute: () => Promise.resolve(),
        undo: () => Promise.resolve(),
      });

      const count = await service.undoTo('action-1');
      expect(count).toBe(1);
      expect(service.canUndo()).toBeFalse();
    });
  });

  describe('recordToAction executeAction paths', () => {
    it('should execute Project create action from database record', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'Project',
          entityId: 'p1',
          actionType: 'create',
          description: 'Created project',
          previousData: null,
          newData: '{"name":"Test","description":"Desc"}',
          undone: true,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.createProject.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.redo();

      expect(mockElectronAPI.createProject).toHaveBeenCalledWith(
        'Test',
        'Desc',
      );
    });

    it('should execute Project update action from database record', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'Project',
          entityId: 'p1',
          actionType: 'update',
          description: 'Updated project',
          previousData: '{"name":"Old","description":"OldDesc"}',
          newData: '{"name":"New","description":"NewDesc"}',
          undone: true,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.updateProject.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.redo();

      expect(mockElectronAPI.updateProject).toHaveBeenCalledWith(
        'p1',
        'New',
        'NewDesc',
      );
    });

    it('should execute Project delete action from database record', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'Project',
          entityId: 'p1',
          actionType: 'delete',
          description: 'Deleted project',
          previousData: '{"name":"Test"}',
          newData: null,
          undone: true,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.deleteProject.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.redo();

      expect(mockElectronAPI.deleteProject).toHaveBeenCalledWith('p1');
    });

    it('should execute Task create action from database record', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'Task',
          entityId: 't1',
          actionType: 'create',
          description: 'Created task',
          previousData: null,
          newData:
            '{"projectId":"p1","name":"Task","description":"Desc","estimatedHours":8,"statusId":"s1","tagIds":["tag1"]}',
          undone: true,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.createTask.and.returnValue(Promise.resolve({} as never));

      await service.loadFromDatabase();
      await service.redo();

      expect(mockElectronAPI.createTask).toHaveBeenCalledWith(
        'p1',
        'Task',
        'Desc',
        8,
        's1',
        ['tag1'],
      );
    });

    it('should execute Task update action from database record', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'Task',
          entityId: 't1',
          actionType: 'update',
          description: 'Updated task',
          previousData: '{"name":"Old"}',
          newData: '{"name":"New","description":"NewDesc"}',
          undone: true,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.updateTask.and.returnValue(Promise.resolve({} as never));

      await service.loadFromDatabase();
      await service.redo();

      expect(mockElectronAPI.updateTask).toHaveBeenCalledWith('t1', {
        name: 'New',
        description: 'NewDesc',
      });
    });

    it('should execute Task delete action from database record', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'Task',
          entityId: 't1',
          actionType: 'delete',
          description: 'Deleted task',
          previousData: '{"name":"Task"}',
          newData: null,
          undone: true,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.deleteTask.and.returnValue(Promise.resolve({} as never));

      await service.loadFromDatabase();
      await service.redo();

      expect(mockElectronAPI.deleteTask).toHaveBeenCalledWith('t1');
    });

    it('should execute TimeEntry create action from database record', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'TimeEntry',
          entityId: 'te1',
          actionType: 'create',
          description: 'Created time entry',
          previousData: null,
          newData:
            '{"date":"2025-01-01","minutes":60,"taskId":"t1","notes":"Note"}',
          undone: true,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.createTimeEntry.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.redo();

      expect(mockElectronAPI.createTimeEntry).toHaveBeenCalledWith(
        '2025-01-01',
        60,
        't1',
        'Note',
      );
    });

    it('should execute TimeEntry update action from database record', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'TimeEntry',
          entityId: 'te1',
          actionType: 'update',
          description: 'Updated time entry',
          previousData: '{"minutes":30}',
          newData: '{"date":"2025-01-01","minutes":60}',
          undone: true,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.updateTimeEntry.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.redo();

      expect(mockElectronAPI.updateTimeEntry).toHaveBeenCalledWith('te1', {
        date: '2025-01-01',
        minutes: 60,
      });
    });

    it('should execute TimeEntry delete action from database record', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'TimeEntry',
          entityId: 'te1',
          actionType: 'delete',
          description: 'Deleted time entry',
          previousData: '{"date":"2025-01-01"}',
          newData: null,
          undone: true,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.deleteTimeEntry.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.redo();

      expect(mockElectronAPI.deleteTimeEntry).toHaveBeenCalledWith('te1');
    });

    it('should execute DayOverride create action from database record', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'DayOverride',
          entityId: 'do1',
          actionType: 'create',
          description: 'Created day override',
          previousData: null,
          newData:
            '{"date":"2025-01-01","dayTypeId":"dt1","minutes":0,"note":"Holiday"}',
          undone: true,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.upsertDayOverride.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.redo();

      expect(mockElectronAPI.upsertDayOverride).toHaveBeenCalledWith(
        '2025-01-01',
        'dt1',
        0,
        'Holiday',
      );
    });

    it('should execute DayOverride update action from database record', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'DayOverride',
          entityId: 'do1',
          actionType: 'update',
          description: 'Updated day override',
          previousData: '{"date":"2025-01-01","minutes":240}',
          newData:
            '{"date":"2025-01-01","dayTypeId":"dt1","minutes":480,"note":"Updated"}',
          undone: true,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.upsertDayOverride.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.redo();

      expect(mockElectronAPI.upsertDayOverride).toHaveBeenCalledWith(
        '2025-01-01',
        'dt1',
        480,
        'Updated',
      );
    });

    it('should execute DayOverride delete action from database record', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'DayOverride',
          entityId: 'do1',
          actionType: 'delete',
          description: 'Deleted day override',
          previousData: '{"date":"2025-01-01"}',
          newData: null,
          undone: true,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.deleteDayOverride.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.redo();

      expect(mockElectronAPI.deleteDayOverride).toHaveBeenCalledWith(
        '2025-01-01',
      );
    });

    it('should execute DayType create action from database record', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'DayType',
          entityId: 'dt1',
          actionType: 'create',
          description: 'Created day type',
          previousData: null,
          newData: '{"name":"Holiday","color":"#ff0000","defaultMinutes":0}',
          undone: true,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.createDayType.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.redo();

      expect(mockElectronAPI.createDayType).toHaveBeenCalledWith(
        'Holiday',
        '#ff0000',
        0,
      );
    });

    it('should execute DayType update action from database record', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'DayType',
          entityId: 'dt1',
          actionType: 'update',
          description: 'Updated day type',
          previousData: '{"name":"Old"}',
          newData: '{"name":"New","color":"#00ff00"}',
          undone: true,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.updateDayType.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.redo();

      expect(mockElectronAPI.updateDayType).toHaveBeenCalledWith('dt1', {
        name: 'New',
        color: '#00ff00',
      });
    });

    it('should execute DayType delete action from database record', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'DayType',
          entityId: 'dt1',
          actionType: 'delete',
          description: 'Deleted day type',
          previousData:
            '{"name":"Holiday","color":"#ff0000","defaultMinutes":0}',
          newData: null,
          undone: true,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.deleteDayType.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.redo();

      expect(mockElectronAPI.deleteDayType).toHaveBeenCalledWith('dt1');
    });
  });

  describe('recordToAction undoAction paths', () => {
    it('should undo Project create by deleting', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'Project',
          entityId: 'p1',
          actionType: 'create',
          description: 'Created project',
          previousData: null,
          newData: '{"name":"Test"}',
          undone: false,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.deleteProject.and.returnValue(
        Promise.resolve({} as never),
      );
      mockElectronAPI.markActionUndone.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.undo();

      expect(mockElectronAPI.deleteProject).toHaveBeenCalledWith('p1');
    });

    it('should undo Project update by restoring previous data', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'Project',
          entityId: 'p1',
          actionType: 'update',
          description: 'Updated project',
          previousData: '{"name":"Old","description":"OldDesc"}',
          newData: '{"name":"New"}',
          undone: false,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.updateProject.and.returnValue(
        Promise.resolve({} as never),
      );
      mockElectronAPI.markActionUndone.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.undo();

      expect(mockElectronAPI.updateProject).toHaveBeenCalledWith(
        'p1',
        'Old',
        'OldDesc',
      );
    });

    it('should undo Project delete by recreating', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'Project',
          entityId: 'p1',
          actionType: 'delete',
          description: 'Deleted project',
          previousData: '{"name":"Test","description":"Desc"}',
          newData: null,
          undone: false,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.createProject.and.returnValue(
        Promise.resolve({} as never),
      );
      mockElectronAPI.markActionUndone.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.undo();

      expect(mockElectronAPI.createProject).toHaveBeenCalledWith(
        'Test',
        'Desc',
      );
    });

    it('should undo Task create by deleting', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'Task',
          entityId: 't1',
          actionType: 'create',
          description: 'Created task',
          previousData: null,
          newData: '{"name":"Task"}',
          undone: false,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.deleteTask.and.returnValue(Promise.resolve({} as never));
      mockElectronAPI.markActionUndone.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.undo();

      expect(mockElectronAPI.deleteTask).toHaveBeenCalledWith('t1');
    });

    it('should undo Task update by restoring previous data', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'Task',
          entityId: 't1',
          actionType: 'update',
          description: 'Updated task',
          previousData: '{"name":"Old","description":"OldDesc"}',
          newData: '{"name":"New"}',
          undone: false,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.updateTask.and.returnValue(Promise.resolve({} as never));
      mockElectronAPI.markActionUndone.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.undo();

      expect(mockElectronAPI.updateTask).toHaveBeenCalledWith('t1', {
        name: 'Old',
        description: 'OldDesc',
      });
    });

    it('should undo Task delete by recreating', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'Task',
          entityId: 't1',
          actionType: 'delete',
          description: 'Deleted task',
          previousData:
            '{"projectId":"p1","name":"Task","description":"Desc","estimatedHours":8,"statusId":"s1","tagIds":["tag1"]}',
          newData: null,
          undone: false,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.createTask.and.returnValue(Promise.resolve({} as never));
      mockElectronAPI.markActionUndone.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.undo();

      expect(mockElectronAPI.createTask).toHaveBeenCalledWith(
        'p1',
        'Task',
        'Desc',
        8,
        's1',
        ['tag1'],
      );
    });

    it('should undo TimeEntry create by deleting', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'TimeEntry',
          entityId: 'te1',
          actionType: 'create',
          description: 'Created time entry',
          previousData: null,
          newData: '{"date":"2025-01-01"}',
          undone: false,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.deleteTimeEntry.and.returnValue(
        Promise.resolve({} as never),
      );
      mockElectronAPI.markActionUndone.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.undo();

      expect(mockElectronAPI.deleteTimeEntry).toHaveBeenCalledWith('te1');
    });

    it('should undo TimeEntry update by restoring previous data', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'TimeEntry',
          entityId: 'te1',
          actionType: 'update',
          description: 'Updated time entry',
          previousData: '{"date":"2025-01-01","minutes":30}',
          newData: '{"minutes":60}',
          undone: false,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.updateTimeEntry.and.returnValue(
        Promise.resolve({} as never),
      );
      mockElectronAPI.markActionUndone.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.undo();

      expect(mockElectronAPI.updateTimeEntry).toHaveBeenCalledWith('te1', {
        date: '2025-01-01',
        minutes: 30,
      });
    });

    it('should undo TimeEntry delete by recreating', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'TimeEntry',
          entityId: 'te1',
          actionType: 'delete',
          description: 'Deleted time entry',
          previousData:
            '{"date":"2025-01-01","minutes":60,"taskId":"t1","notes":"Note"}',
          newData: null,
          undone: false,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.createTimeEntry.and.returnValue(
        Promise.resolve({} as never),
      );
      mockElectronAPI.markActionUndone.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.undo();

      expect(mockElectronAPI.createTimeEntry).toHaveBeenCalledWith(
        '2025-01-01',
        60,
        't1',
        'Note',
      );
    });

    it('should undo DayOverride create by deleting', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'DayOverride',
          entityId: 'do1',
          actionType: 'create',
          description: 'Created day override',
          previousData: null,
          newData: '{"date":"2025-01-01","dayTypeId":"dt1"}',
          undone: false,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.deleteDayOverride.and.returnValue(
        Promise.resolve({} as never),
      );
      mockElectronAPI.markActionUndone.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.undo();

      expect(mockElectronAPI.deleteDayOverride).toHaveBeenCalledWith(
        '2025-01-01',
      );
    });

    it('should undo DayOverride update by restoring previous data', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'DayOverride',
          entityId: 'do1',
          actionType: 'update',
          description: 'Updated day override',
          previousData:
            '{"date":"2025-01-01","dayTypeId":"dt1","minutes":240,"note":"Old"}',
          newData: '{"minutes":480}',
          undone: false,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.upsertDayOverride.and.returnValue(
        Promise.resolve({} as never),
      );
      mockElectronAPI.markActionUndone.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.undo();

      expect(mockElectronAPI.upsertDayOverride).toHaveBeenCalledWith(
        '2025-01-01',
        'dt1',
        240,
        'Old',
      );
    });

    it('should undo DayOverride delete by recreating', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'DayOverride',
          entityId: 'do1',
          actionType: 'delete',
          description: 'Deleted day override',
          previousData:
            '{"date":"2025-01-01","dayTypeId":"dt1","minutes":0,"note":"Holiday"}',
          newData: null,
          undone: false,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.upsertDayOverride.and.returnValue(
        Promise.resolve({} as never),
      );
      mockElectronAPI.markActionUndone.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.undo();

      expect(mockElectronAPI.upsertDayOverride).toHaveBeenCalledWith(
        '2025-01-01',
        'dt1',
        0,
        'Holiday',
      );
    });

    it('should undo DayType create by deleting', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'DayType',
          entityId: 'dt1',
          actionType: 'create',
          description: 'Created day type',
          previousData: null,
          newData: '{"name":"Holiday"}',
          undone: false,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.deleteDayType.and.returnValue(
        Promise.resolve({} as never),
      );
      mockElectronAPI.markActionUndone.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.undo();

      expect(mockElectronAPI.deleteDayType).toHaveBeenCalledWith('dt1');
    });

    it('should undo DayType update by restoring previous data', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'DayType',
          entityId: 'dt1',
          actionType: 'update',
          description: 'Updated day type',
          previousData: '{"name":"Old","color":"#ff0000"}',
          newData: '{"name":"New"}',
          undone: false,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.updateDayType.and.returnValue(
        Promise.resolve({} as never),
      );
      mockElectronAPI.markActionUndone.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.undo();

      expect(mockElectronAPI.updateDayType).toHaveBeenCalledWith('dt1', {
        name: 'Old',
        color: '#ff0000',
      });
    });

    it('should undo DayType delete by recreating', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'DayType',
          entityId: 'dt1',
          actionType: 'delete',
          description: 'Deleted day type',
          previousData:
            '{"name":"Holiday","color":"#ff0000","defaultMinutes":0}',
          newData: null,
          undone: false,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );
      mockElectronAPI.createDayType.and.returnValue(
        Promise.resolve({} as never),
      );
      mockElectronAPI.markActionUndone.and.returnValue(
        Promise.resolve({} as never),
      );

      await service.loadFromDatabase();
      await service.undo();

      expect(mockElectronAPI.createDayType).toHaveBeenCalledWith(
        'Holiday',
        '#ff0000',
        0,
      );
    });
  });

  describe('loadFromDatabase already loaded', () => {
    it('should not load if already loaded', async () => {
      mockElectronAPI.getActionHistory.and.returnValue(Promise.resolve([]));
      await service.loadFromDatabase();
      mockElectronAPI.getActionHistory.calls.reset();

      await service.loadFromDatabase();

      expect(mockElectronAPI.getActionHistory).not.toHaveBeenCalled();
    });
  });

  describe('recordToAction with null data', () => {
    it('should handle null previousData in record', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'Project',
          entityId: 'p1',
          actionType: 'create',
          description: 'Created project',
          previousData: null,
          newData: '{"name":"Test"}',
          undone: false,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );

      await service.loadFromDatabase();

      expect(service.actionCount()).toBe(1);
      const action = service.lastAction();
      expect(action?.previousData).toBeNull();
    });

    it('should handle null newData in record', async () => {
      const records = [
        {
          id: 'db-1',
          entityType: 'Project',
          entityId: 'p1',
          actionType: 'delete',
          description: 'Deleted project',
          previousData: '{"name":"Test"}',
          newData: null,
          undone: false,
          createdAt: new Date(),
        },
      ];

      mockElectronAPI.getActionHistory.and.returnValue(
        Promise.resolve(records),
      );

      await service.loadFromDatabase();

      expect(service.actionCount()).toBe(1);
      const action = service.lastAction();
      expect(action?.newData).toBeNull();
    });
  });
});
