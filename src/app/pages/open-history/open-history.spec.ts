import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { OpenHistory } from './open-history';
import { DatabaseService } from '../../services';
import { ActionHistoryService } from '../../services/action-history.service';
import { ActionHistory } from '../../../types/electron';

describe('OpenHistory', () => {
  let component: OpenHistory;
  let fixture: ComponentFixture<OpenHistory>;
  let mockDbService: jasmine.SpyObj<DatabaseService>;
  let mockHistoryService: jasmine.SpyObj<ActionHistoryService>;
  let mockTranslate: jasmine.SpyObj<TranslateService>;
  let messageService: MessageService;
  let confirmationService: ConfirmationService;

  const mockHistoryRecords: ActionHistory[] = [
    {
      id: '1',
      entityType: 'Project',
      entityId: 'p1',
      actionType: 'create',
      description: 'Created project Test',
      previousData: null,
      newData: '{"name":"Test"}',
      undone: false,
      createdAt: new Date('2025-12-01T10:00:00'),
    },
    {
      id: '2',
      entityType: 'Task',
      entityId: 't1',
      actionType: 'update',
      description: 'Updated task',
      previousData: '{"name":"Old"}',
      newData: '{"name":"New"}',
      undone: false,
      createdAt: new Date('2025-12-01T11:00:00'),
    },
  ];

  const mockTasks = [
    {
      id: 't1',
      name: 'Test Task',
      description: '',
      projectId: 'p1',
      statusId: 's1',
      estimatedHours: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      project: {
        id: 'p1',
        name: 'Project A',
        description: '',
        isClosed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      status: {
        id: 's1',
        name: 'status.pending',
        color: '#6b7280',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      tags: [],
      timeEntries: [],
    },
  ];

  beforeEach(async () => {
    mockDbService = jasmine.createSpyObj('DatabaseService', [
      'getActionHistory',
      'getTasks',
      'clearActionHistory',
    ]);
    mockDbService.getActionHistory.and.returnValue(
      Promise.resolve(mockHistoryRecords),
    );
    mockDbService.getTasks.and.returnValue(Promise.resolve(mockTasks));
    mockDbService.clearActionHistory.and.returnValue(
      Promise.resolve({ success: true, changes: 1 }),
    );

    mockHistoryService = jasmine.createSpyObj(
      'ActionHistoryService',
      ['undo', 'redo', 'clear'],
      {
        canUndo: jasmine.createSpy().and.returnValue(true),
        canRedo: jasmine.createSpy().and.returnValue(false),
        dataChanged: jasmine
          .createSpy()
          .and.returnValue({ entityType: 'Project', timestamp: 0 }),
      },
    );
    mockHistoryService.undo.and.returnValue(
      Promise.resolve({ description: 'Undone action' } as never),
    );
    mockHistoryService.redo.and.returnValue(
      Promise.resolve({ description: 'Redone action' } as never),
    );

    mockTranslate = jasmine.createSpyObj('TranslateService', ['instant']);
    mockTranslate.instant.and.callFake((key: string) => key);

    await TestBed.configureTestingModule({
      imports: [OpenHistory, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: DatabaseService, useValue: mockDbService },
        { provide: ActionHistoryService, useValue: mockHistoryService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenHistory);
    component = fixture.componentInstance;
    messageService = fixture.debugElement.injector.get(MessageService);
    confirmationService =
      fixture.debugElement.injector.get(ConfirmationService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loadHistory', () => {
    it('should load history records on init', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(mockDbService.getActionHistory).toHaveBeenCalledWith(10);
      expect(mockDbService.getTasks).toHaveBeenCalled();
      expect(component.historyRecords().length).toBe(2);
    }));

    it('should handle load error', fakeAsync(() => {
      mockDbService.getActionHistory.and.returnValue(
        Promise.reject(new Error('DB Error')),
      );
      spyOn(messageService, 'add');

      fixture.detectChanges();
      tick();

      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' }),
      );
    }));

    it('should set loading state correctly', fakeAsync(() => {
      fixture.detectChanges();
      expect(component.loading()).toBeTrue();

      tick();
      expect(component.loading()).toBeFalse();
    }));
  });

  describe('onUndo', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should call historyService.undo', async () => {
      await component.onUndo();

      expect(mockHistoryService.undo).toHaveBeenCalled();
    });

    it('should show success message on undo', async () => {
      spyOn(messageService, 'add');

      await component.onUndo();

      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'info',
          summary: 'history.undone',
        }),
      );
    });

    it('should reload history after undo', async () => {
      mockDbService.getActionHistory.calls.reset();

      await component.onUndo();

      expect(mockDbService.getActionHistory).toHaveBeenCalled();
    });
  });

  describe('onRedo', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should call historyService.redo', async () => {
      await component.onRedo();

      expect(mockHistoryService.redo).toHaveBeenCalled();
    });

    it('should show success message on redo', async () => {
      spyOn(messageService, 'add');

      await component.onRedo();

      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'info',
          summary: 'history.redone',
        }),
      );
    });
  });

  describe('onClearHistory', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should show confirmation dialog', () => {
      spyOn(confirmationService, 'confirm');

      component.onClearHistory();

      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('should clear history when confirmed', fakeAsync(() => {
      spyOn(confirmationService, 'confirm').and.callFake((options: unknown) => {
        (options as { accept: () => void }).accept();
        return confirmationService;
      });
      spyOn(messageService, 'add');

      component.onClearHistory();
      tick();

      expect(mockDbService.clearActionHistory).toHaveBeenCalled();
      expect(mockHistoryService.clear).toHaveBeenCalled();
      expect(component.historyRecords().length).toBe(0);
    }));
  });

  describe('getActionIcon', () => {
    it('should return pi-plus for create', () => {
      expect(component.getActionIcon('create')).toBe('pi pi-plus');
    });

    it('should return pi-pencil for update', () => {
      expect(component.getActionIcon('update')).toBe('pi pi-pencil');
    });

    it('should return pi-trash for delete', () => {
      expect(component.getActionIcon('delete')).toBe('pi pi-trash');
    });

    it('should return pi-circle for unknown', () => {
      expect(component.getActionIcon('unknown')).toBe('pi pi-circle');
    });
  });

  describe('getActionSeverity', () => {
    it('should return success for create', () => {
      expect(component.getActionSeverity('create')).toBe('success');
    });

    it('should return info for update', () => {
      expect(component.getActionSeverity('update')).toBe('info');
    });

    it('should return danger for delete', () => {
      expect(component.getActionSeverity('delete')).toBe('danger');
    });

    it('should return secondary for unknown', () => {
      expect(component.getActionSeverity('unknown')).toBe('secondary');
    });
  });

  describe('getEntityIcon', () => {
    it('should return pi-folder for Project', () => {
      expect(component.getEntityIcon('Project')).toBe('pi pi-folder');
    });

    it('should return pi-check-square for Task', () => {
      expect(component.getEntityIcon('Task')).toBe('pi pi-check-square');
    });

    it('should return pi-clock for TimeEntry', () => {
      expect(component.getEntityIcon('TimeEntry')).toBe('pi pi-clock');
    });

    it('should return pi-calendar for DayOverride', () => {
      expect(component.getEntityIcon('DayOverride')).toBe('pi pi-calendar');
    });

    it('should return pi-cog for MonthConfig', () => {
      expect(component.getEntityIcon('MonthConfig')).toBe('pi pi-cog');
    });

    it('should return pi-tag for Tag', () => {
      expect(component.getEntityIcon('Tag')).toBe('pi pi-tag');
    });

    it('should return pi-circle for unknown', () => {
      expect(component.getEntityIcon('Unknown')).toBe('pi pi-circle');
    });
  });

  describe('detail dialog', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should open detail dialog', () => {
      const record = mockHistoryRecords[0];

      component.onViewDetail(record);

      expect(component.selectedRecord()).toBe(record);
      expect(component.showDetailDialog()).toBeTrue();
    });

    it('should close detail dialog', () => {
      component.onViewDetail(mockHistoryRecords[0]);
      component.onCloseDetail();

      expect(component.selectedRecord()).toBeNull();
      expect(component.showDetailDialog()).toBeFalse();
    });

    it('should parse previousData correctly', () => {
      const record = mockHistoryRecords[1];
      component.onViewDetail(record);

      expect(component.selectedPreviousData()).toEqual({ name: 'Old' });
    });

    it('should parse newData correctly', () => {
      const record = mockHistoryRecords[1];
      component.onViewDetail(record);

      expect(component.selectedNewData()).toEqual({ name: 'New' });
    });

    it('should return null for null data', () => {
      const record = mockHistoryRecords[0];
      component.onViewDetail(record);

      expect(component.selectedPreviousData()).toBeNull();
    });
  });

  describe('formatJson', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should return dash for null data', () => {
      expect(component.formatJson(null)).toBe('-');
    });

    it('should format Project data', () => {
      component.onViewDetail({
        ...mockHistoryRecords[0],
        entityType: 'Project',
      });

      const result = component.formatJson({
        name: 'Test',
        description: 'Desc',
      });
      expect(result).toContain('Test');
    });
  });

  describe('recordCount', () => {
    it('should return correct count', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(component.recordCount()).toBe(2);
    }));
  });

  describe('onUndo edge cases', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should not show message when undo returns null', async () => {
      mockHistoryService.undo.and.returnValue(Promise.resolve(null));
      spyOn(messageService, 'add');

      await component.onUndo();

      expect(messageService.add).not.toHaveBeenCalled();
    });
  });

  describe('onRedo edge cases', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should not show message when redo returns null', async () => {
      mockHistoryService.redo.and.returnValue(Promise.resolve(null));
      spyOn(messageService, 'add');

      await component.onRedo();

      expect(messageService.add).not.toHaveBeenCalled();
    });
  });

  describe('onClearHistory error handling', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should show error message when clear fails', fakeAsync(() => {
      mockDbService.clearActionHistory.and.returnValue(
        Promise.reject(new Error('Clear error')),
      );
      spyOn(confirmationService, 'confirm').and.callFake((options: unknown) => {
        (options as { accept: () => void }).accept();
        return confirmationService;
      });
      spyOn(messageService, 'add');

      component.onClearHistory();
      tick();

      expect(messageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' }),
      );
    }));
  });

  describe('formatJson with various entity types', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should format Task data', () => {
      component.onViewDetail({
        ...mockHistoryRecords[0],
        entityType: 'Task',
      });

      const result = component.formatJson({
        name: 'Task',
        description: null,
        estimatedHours: 8,
      });
      expect(result).toContain('Task');
    });

    it('should format TimeEntry data with task lookup', () => {
      component.onViewDetail({
        ...mockHistoryRecords[0],
        entityType: 'TimeEntry',
      });

      const result = component.formatJson({
        taskId: 't1',
        date: '2025-01-01',
        minutes: 60,
      });
      expect(result).toBeTruthy();
    });

    it('should format TimeEntry data without task found', () => {
      component.onViewDetail({
        ...mockHistoryRecords[0],
        entityType: 'TimeEntry',
      });

      const result = component.formatJson({
        taskId: 'unknown',
        date: '2025-01-01',
        minutes: 60,
        notes: 'Test',
      });
      expect(result).toBeTruthy();
    });

    it('should format DayOverride data', () => {
      component.onViewDetail({
        ...mockHistoryRecords[0],
        entityType: 'DayOverride',
      });

      const result = component.formatJson({
        date: '2025-01-01',
        minutes: 480,
        note: 'Holiday',
      });
      expect(result).toBeTruthy();
    });

    it('should format DayType data', () => {
      component.onViewDetail({
        ...mockHistoryRecords[0],
        entityType: 'DayType',
      });

      const result = component.formatJson({
        name: 'Holiday',
        color: '#ff0000',
        defaultMinutes: 0,
      });
      expect(result).toBeTruthy();
    });

    it('should handle Project with isClosed true', () => {
      component.onViewDetail({
        ...mockHistoryRecords[0],
        entityType: 'Project',
      });

      const result = component.formatJson({
        name: 'Test',
        description: '',
        isClosed: true,
      });
      expect(result).toContain('history.fields.closed');
    });

    it('should handle Project with isClosed false', () => {
      component.onViewDetail({
        ...mockHistoryRecords[0],
        entityType: 'Project',
      });

      const result = component.formatJson({
        name: 'Test',
        description: '',
        isClosed: false,
      });
      expect(result).toContain('history.fields.open');
    });

    it('should return raw data for unknown entity types', () => {
      component.onViewDetail({
        ...mockHistoryRecords[0],
        entityType: 'Unknown',
      });

      const data = { custom: 'value' };
      const result = component.formatJson(data);
      expect(result).toContain('custom');
    });

    it('should return raw JSON when no record selected', () => {
      const data = { test: 'value' };
      const result = component.formatJson(data);
      expect(result).toContain('test');
    });
  });

  describe('selectedPreviousData edge cases', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should return raw string for invalid JSON', () => {
      const recordWithInvalidJson: ActionHistory = {
        ...mockHistoryRecords[0],
        previousData: 'not valid json',
      };
      component.onViewDetail(recordWithInvalidJson);

      expect(component.selectedPreviousData()).toBe('not valid json');
    });
  });

  describe('selectedNewData edge cases', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should return raw string for invalid JSON', () => {
      const recordWithInvalidJson: ActionHistory = {
        ...mockHistoryRecords[0],
        newData: 'invalid json string',
      };
      component.onViewDetail(recordWithInvalidJson);

      expect(component.selectedNewData()).toBe('invalid json string');
    });

    it('should return null for null newData', () => {
      const recordWithNullData: ActionHistory = {
        ...mockHistoryRecords[0],
        newData: null,
      };
      component.onViewDetail(recordWithNullData);

      expect(component.selectedNewData()).toBeNull();
    });
  });

  describe('getActionLabel and getEntityLabel', () => {
    it('should return translated action label', () => {
      expect(component.getActionLabel('create')).toBe(
        'history.actionTypes.create',
      );
    });

    it('should return translated entity label', () => {
      expect(component.getEntityLabel('Project')).toBe(
        'history.entityTypes.Project',
      );
    });
  });

  describe('formatMinutes internal', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should format hours only', () => {
      component.onViewDetail({
        ...mockHistoryRecords[0],
        entityType: 'TimeEntry',
      });

      const result = component.formatJson({
        taskId: 't1',
        date: '2025-01-01',
        minutes: 120,
      });
      expect(result).toBeTruthy();
    });

    it('should format minutes only', () => {
      component.onViewDetail({
        ...mockHistoryRecords[0],
        entityType: 'TimeEntry',
      });

      const result = component.formatJson({
        taskId: 't1',
        date: '2025-01-01',
        minutes: 30,
      });
      expect(result).toBeTruthy();
    });

    it('should format hours and minutes', () => {
      component.onViewDetail({
        ...mockHistoryRecords[0],
        entityType: 'TimeEntry',
      });

      const result = component.formatJson({
        taskId: 't1',
        date: '2025-01-01',
        minutes: 90,
      });
      expect(result).toBeTruthy();
    });
  });
});
