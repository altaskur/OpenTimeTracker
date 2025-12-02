/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';

import { OpenTasks } from './open-tasks';
import { DatabaseService } from '../../services';
import { provideTranslateTestingModule } from '../../testing/test-utils';
import { TaskWithTags } from '../../interfaces';

describe('OpenTasks', () => {
  let component: OpenTasks;
  let fixture: ComponentFixture<OpenTasks>;
  let mockDatabaseService: jasmine.SpyObj<DatabaseService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  const mockProjects = [
    {
      id: '1',
      name: 'Project 1',
      description: 'Desc 1',
      isClosed: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      name: 'Project 2',
      description: 'Desc 2',
      isClosed: false,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  const mockStatuses = [
    { id: 's1', name: 'Pendiente', color: '#f59e0b', isDefault: true },
    { id: 's2', name: 'En progreso', color: '#3b82f6', isDefault: true },
    { id: 's3', name: 'Completada', color: '#6b7280', isDefault: true },
    { id: 's4', name: 'Bloqueada', color: '#ef4444', isDefault: true },
  ];

  const mockTags = [
    { id: 't1', name: 'Bug' },
    { id: 't2', name: 'Feature' },
  ];

  const mockTasks: TaskWithTags[] = [
    {
      id: 'task1',
      projectId: '1',
      name: 'Task 1',
      description: 'Task description',
      estimatedHours: 5,
      statusId: 's1',
      status: {
        id: 's1',
        name: 'Pendiente',
        color: '#f59e0b',
        isDefault: true,
      },
      project: mockProjects[0],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      tags: [{ tag: { id: 't1', name: 'Bug' } }],
    },
    {
      id: 'task2',
      projectId: '2',
      name: 'Task 2',
      description: null,
      estimatedHours: null,
      statusId: 's2',
      status: {
        id: 's2',
        name: 'En progreso',
        color: '#3b82f6',
        isDefault: true,
      },
      project: mockProjects[1],
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      tags: [],
    },
  ];

  beforeEach(async () => {
    mockDatabaseService = jasmine.createSpyObj('DatabaseService', [
      'getTasks',
      'getProjects',
      'getTaskStatuses',
      'getTags',
      'createTask',
      'updateTask',
      'deleteTask',
      'createTag',
      'deleteTag',
    ]);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);

    mockDatabaseService.getTasks.and.returnValue(Promise.resolve(mockTasks));
    mockDatabaseService.getProjects.and.returnValue(
      Promise.resolve(mockProjects),
    );
    mockDatabaseService.getTaskStatuses.and.returnValue(
      Promise.resolve(mockStatuses),
    );
    mockDatabaseService.getTags.and.returnValue(Promise.resolve(mockTags));
    mockDatabaseService.createTask.and.returnValue(
      Promise.resolve(mockTasks[0]),
    );
    mockDatabaseService.updateTask.and.returnValue(
      Promise.resolve(mockTasks[0]),
    );
    mockDatabaseService.deleteTask.and.returnValue(
      Promise.resolve({ success: true }),
    );
    mockDatabaseService.createTag.and.returnValue(
      Promise.resolve({ id: 't3', name: 'New Tag' }),
    );
    mockDatabaseService.deleteTag.and.returnValue(
      Promise.resolve({ success: true }),
    );

    await TestBed.configureTestingModule({
      imports: [OpenTasks, FormsModule],
      providers: [
        { provide: DatabaseService, useValue: mockDatabaseService },
        MessageService,
        ...provideTranslateTestingModule(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenTasks);
    component = fixture.componentInstance;

    const messageService = fixture.debugElement.injector.get(MessageService);
    spyOn(messageService, 'add');
    mockMessageService =
      messageService as unknown as jasmine.SpyObj<MessageService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load data on init', async () => {
      await component.ngOnInit();

      expect(mockDatabaseService.getTasks).toHaveBeenCalled();
      expect(mockDatabaseService.getProjects).toHaveBeenCalled();
      expect(mockDatabaseService.getTaskStatuses).toHaveBeenCalled();
      expect(mockDatabaseService.getTags).toHaveBeenCalled();
    });
  });

  describe('loadData', () => {
    it('should set loading to true while loading', async () => {
      const loadPromise = component.loadData();
      expect(component.loading()).toBeTrue();
      await loadPromise;
      expect(component.loading()).toBeFalse();
    });

    it('should populate tasks, projects, statuses, and tags', async () => {
      await component.loadData();

      expect(component.tasks()).toEqual(mockTasks);
      expect(component.projects()).toEqual(mockProjects);
      expect(component.statuses()).toEqual(mockStatuses);
      expect(component.tags()).toEqual(mockTags);
    });
  });

  describe('filteredPendingTasks', () => {
    it('should return all pending tasks when no filter is set', async () => {
      await component.loadData();
      component.selectedProjectFilter.set(null);

      expect(component.filteredPendingTasks().length).toBe(2);
    });

    it('should filter pending tasks by project', async () => {
      await component.loadData();
      component.selectedProjectFilter.set('1');

      const filtered = component.filteredPendingTasks();
      expect(filtered.length).toBe(1);
      expect(filtered[0].projectId).toBe('1');
    });
  });

  describe('openNewDialog', () => {
    it('should reset form and open dialog', () => {
      component.taskForm.name = 'Existing';
      component.openNewDialog();

      expect(component.taskForm.id).toBe('');
      expect(component.taskForm.name).toBe('');
      expect(component.dialogVisible()).toBeTrue();
    });
  });

  describe('openEditDialog', () => {
    it('should populate form with task data and open dialog', () => {
      const task = mockTasks[0];
      component.openEditDialog(task);

      expect(component.taskForm.id).toBe(task.id);
      expect(component.taskForm.name).toBe(task.name);
      expect(component.taskForm.projectId).toBe(task.projectId);
      expect(component.taskForm.description).toBe(task.description ?? '');
      expect(component.taskForm.estimatedHours).toBe(
        task.estimatedHours ?? null,
      );
      expect(component.taskForm.statusId).toBe(task.statusId!);
      expect(component.dialogVisible()).toBeTrue();
    });

    it('should handle undefined description', () => {
      const task = mockTasks[1];
      component.openEditDialog(task);

      expect(component.taskForm.description).toBe('');
    });
  });

  describe('saveTask', () => {
    it('should create task when id is empty', async () => {
      await component.loadData();
      component.taskForm = {
        id: '',
        projectId: '1',
        name: 'New Task',
        description: 'Description',
        estimatedHours: 10,
        statusId: 's1',
        tags: [],
      };
      component.dialogVisible.set(true);

      await component.saveTask();

      expect(mockDatabaseService.createTask).toHaveBeenCalledWith(
        '1',
        'New Task',
        'Description',
        10,
        's1',
        [],
      );
      expect(component.dialogVisible()).toBeFalse();
      expect(mockMessageService.add).toHaveBeenCalled();
    });

    it('should create task with tags', async () => {
      await component.loadData();
      component.taskForm = {
        id: '',
        projectId: '1',
        name: 'New Task',
        description: 'Description',
        estimatedHours: 10,
        statusId: 's1',
        tags: [
          { id: 't1', name: 'Bug' },
          { id: 't2', name: 'Feature' },
        ],
      };
      component.dialogVisible.set(true);

      await component.saveTask();

      expect(mockDatabaseService.createTask).toHaveBeenCalledWith(
        '1',
        'New Task',
        'Description',
        10,
        's1',
        ['t1', 't2'],
      );
    });

    it('should update task when id exists', async () => {
      await component.loadData();
      component.taskForm = {
        id: 'task1',
        projectId: '1',
        name: 'Updated Task',
        description: 'Updated Description',
        estimatedHours: 20,
        statusId: 's2',
        tags: [],
      };
      component.dialogVisible.set(true);

      await component.saveTask();

      expect(mockDatabaseService.updateTask).toHaveBeenCalledWith('task1', {
        name: 'Updated Task',
        description: 'Updated Description',
        estimatedHours: 20,
        statusId: 's2',
        tagIds: [],
      });
      expect(component.dialogVisible()).toBeFalse();
    });

    it('should update task with tags', async () => {
      await component.loadData();
      component.taskForm = {
        id: 'task1',
        projectId: '1',
        name: 'Updated Task',
        description: 'Updated Description',
        estimatedHours: 20,
        statusId: 's2',
        tags: [{ id: 't1', name: 'Bug' }],
      };
      component.dialogVisible.set(true);

      await component.saveTask();

      expect(mockDatabaseService.updateTask).toHaveBeenCalledWith('task1', {
        name: 'Updated Task',
        description: 'Updated Description',
        estimatedHours: 20,
        statusId: 's2',
        tagIds: ['t1'],
      });
    });

    it('should handle empty optional fields', async () => {
      await component.loadData();
      component.taskForm = {
        id: '',
        projectId: '1',
        name: 'New Task',
        description: '',
        estimatedHours: null,
        statusId: '',
        tags: [],
      };

      await component.saveTask();

      expect(mockDatabaseService.createTask).toHaveBeenCalledWith(
        '1',
        'New Task',
        undefined,
        undefined,
        undefined,
        [],
      );
    });

    it('should show error on failure', async () => {
      mockDatabaseService.createTask.and.returnValue(
        Promise.reject(new Error('Failed')),
      );
      component.taskForm = {
        id: '',
        projectId: '1',
        name: 'New Task',
        description: '',
        estimatedHours: null,
        statusId: '',
        tags: [],
      };

      await component.saveTask();

      expect(mockMessageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' }),
      );
    });
  });

  describe('confirmDeleteTask', () => {
    it('should open delete confirmation dialog', () => {
      const task = mockTasks[0];
      component.confirmDeleteTask(task);

      expect(component.deleteTaskDialogVisible()).toBe(true);
      expect(component.taskToDelete()).toEqual(task);
    });

    it('should delete task when confirmed', async () => {
      const task = mockTasks[0];
      await component.loadData();
      component.taskToDelete.set(task);
      component.deleteTaskDialogVisible.set(true);

      await component.onDeleteTaskConfirmed();

      expect(mockDatabaseService.deleteTask).toHaveBeenCalledWith(task.id);
      expect(component.deleteTaskDialogVisible()).toBe(false);
      expect(component.taskToDelete()).toBeNull();
    });

    it('should close dialog on cancel', () => {
      const task = mockTasks[0];
      component.taskToDelete.set(task);
      component.deleteTaskDialogVisible.set(true);

      component.onDeleteTaskCancelled();

      expect(component.deleteTaskDialogVisible()).toBe(false);
      expect(component.taskToDelete()).toBeNull();
      expect(mockDatabaseService.deleteTask).not.toHaveBeenCalled();
    });
  });

  describe('getStatusSeverity', () => {
    it('should return success for Completada', () => {
      expect(component.getStatusSeverity('Completada')).toBe('success');
      expect(component.getStatusSeverity('Completed')).toBe('success');
    });

    it('should return info for En progreso', () => {
      expect(component.getStatusSeverity('En progreso')).toBe('info');
      expect(component.getStatusSeverity('In Progress')).toBe('info');
    });

    it('should return warn for Pendiente', () => {
      expect(component.getStatusSeverity('Pendiente')).toBe('warn');
      expect(component.getStatusSeverity('Pending')).toBe('warn');
    });

    it('should return danger for Bloqueada', () => {
      expect(component.getStatusSeverity('Bloqueada')).toBe('danger');
      expect(component.getStatusSeverity('Blocked')).toBe('danger');
    });

    it('should return secondary for unknown status', () => {
      expect(component.getStatusSeverity('Unknown')).toBe('secondary');
      expect(component.getStatusSeverity(undefined)).toBe('secondary');
    });
  });

  describe('createTag', () => {
    it('should create a new tag', async () => {
      await component.loadData();
      component.newTagName.set('New Tag');

      await component.createTag();

      expect(mockDatabaseService.createTag).toHaveBeenCalledWith('New Tag');
      expect(component.newTagName()).toBe('');
      expect(mockMessageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'success' }),
      );
    });

    it('should not create tag with empty name', async () => {
      component.newTagName.set('   ');

      await component.createTag();

      expect(mockDatabaseService.createTag).not.toHaveBeenCalled();
    });

    it('should show error on creation failure', async () => {
      mockDatabaseService.createTag.and.returnValue(
        Promise.reject(new Error('Failed')),
      );
      component.newTagName.set('New Tag');

      await component.createTag();

      expect(mockMessageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' }),
      );
    });
  });

  describe('confirmDeleteTag', () => {
    it('should open delete confirmation dialog and stop propagation', () => {
      const tag = mockTags[0];
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.confirmDeleteTag(event, tag);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.deleteTagDialogVisible()).toBe(true);
      expect(component.tagToDelete()).toEqual(tag);
    });

    it('should delete tag when confirmed', async () => {
      const tag = mockTags[0];
      await component.loadData();
      component.tagToDelete.set(tag);
      component.deleteTagDialogVisible.set(true);

      await component.onDeleteTagConfirmed();

      expect(mockDatabaseService.deleteTag).toHaveBeenCalledWith(tag.id);
      expect(component.deleteTagDialogVisible()).toBe(false);
      expect(component.tagToDelete()).toBeNull();
    });

    it('should close dialog on cancel', () => {
      const tag = mockTags[0];
      component.tagToDelete.set(tag);
      component.deleteTagDialogVisible.set(true);

      component.onDeleteTagCancelled();

      expect(component.deleteTagDialogVisible()).toBe(false);
      expect(component.tagToDelete()).toBeNull();
      expect(mockDatabaseService.deleteTag).not.toHaveBeenCalled();
    });
  });

  describe('filteredCompletedTasks', () => {
    it('should return completed tasks when no filter', async () => {
      const completedTask: TaskWithTags = {
        ...mockTasks[0],
        id: 'task3',
        status: {
          id: 's3',
          name: 'Completada',
          color: '#6b7280',
          isDefault: true,
        },
      };
      mockDatabaseService.getTasks.and.returnValue(
        Promise.resolve([...mockTasks, completedTask]),
      );
      await component.loadData();
      component.selectedProjectFilter.set(null);

      const filtered = component.filteredCompletedTasks();
      expect(filtered.length).toBe(1);
      expect(filtered[0].status?.name).toBe('Completada');
    });

    it('should filter completed tasks by project', async () => {
      const completedTask1: TaskWithTags = {
        ...mockTasks[0],
        id: 'task3',
        projectId: '1',
        status: {
          id: 's3',
          name: 'status.completed',
          color: '#6b7280',
          isDefault: true,
        },
      };
      const completedTask2: TaskWithTags = {
        ...mockTasks[0],
        id: 'task4',
        projectId: '2',
        status: {
          id: 's3',
          name: 'Completed',
          color: '#6b7280',
          isDefault: true,
        },
      };
      mockDatabaseService.getTasks.and.returnValue(
        Promise.resolve([...mockTasks, completedTask1, completedTask2]),
      );
      await component.loadData();
      component.selectedProjectFilter.set('1');

      const filtered = component.filteredCompletedTasks();
      expect(filtered.length).toBe(1);
      expect(filtered[0].projectId).toBe('1');
    });
  });

  describe('translatedStatuses', () => {
    it('should translate status names starting with status.', async () => {
      await component.loadData();

      const translated = component.translatedStatuses();
      expect(translated.length).toBe(4);
      expect(translated.every((s) => s.displayName)).toBeTrue();
    });

    it('should keep original name for non-translatable statuses', async () => {
      const customStatuses = [
        { id: 's5', name: 'Custom Status', color: '#123456', isDefault: false },
      ];
      mockDatabaseService.getTaskStatuses.and.returnValue(
        Promise.resolve(customStatuses),
      );
      await component.loadData();

      const translated = component.translatedStatuses();
      expect(translated[0].displayName).toBe('Custom Status');
    });
  });

  describe('loadData error handling', () => {
    it('should handle error gracefully', async () => {
      mockDatabaseService.getTasks.and.returnValue(
        Promise.reject(new Error('Load error')),
      );
      spyOn(console, 'error');

      await component.loadData();

      expect(console.error).toHaveBeenCalled();
      expect(component.loading()).toBeFalse();
    });
  });

  describe('delete task when no task selected', () => {
    it('should not call delete when no task to delete', async () => {
      component.taskToDelete.set(null);
      component.deleteTaskDialogVisible.set(true);

      await component.onDeleteTaskConfirmed();

      expect(mockDatabaseService.deleteTask).not.toHaveBeenCalled();
      expect(component.deleteTaskDialogVisible()).toBeFalse();
    });
  });

  describe('delete tag when no tag selected', () => {
    it('should not call delete when no tag to delete', async () => {
      component.tagToDelete.set(null);
      component.deleteTagDialogVisible.set(true);

      await component.onDeleteTagConfirmed();

      expect(mockDatabaseService.deleteTag).not.toHaveBeenCalled();
      expect(component.deleteTagDialogVisible()).toBeFalse();
    });
  });

  describe('showNewTagInput toggle', () => {
    it('should toggle new tag input visibility', () => {
      expect(component.showNewTagInput()).toBeFalse();
      component.showNewTagInput.set(true);
      expect(component.showNewTagInput()).toBeTrue();
    });
  });

  describe('task form tags handling', () => {
    it('should extract tag ids correctly', async () => {
      await component.loadData();
      component.taskForm = {
        id: 'task1',
        projectId: '1',
        name: 'Updated',
        description: 'Desc',
        estimatedHours: 5,
        statusId: 's1',
        tags: [
          { id: 't1', name: 'Bug' },
          { id: 't2', name: 'Feature' },
        ],
      };

      await component.saveTask();

      expect(mockDatabaseService.updateTask).toHaveBeenCalledWith('task1', {
        name: 'Updated',
        description: 'Desc',
        estimatedHours: 5,
        statusId: 's1',
        tagIds: ['t1', 't2'],
      });
    });
  });

  describe('getStatusSeverity additional cases', () => {
    it('should return correct severity for English names', () => {
      expect(component.getStatusSeverity('Completed')).toBe('success');
      expect(component.getStatusSeverity('In Progress')).toBe('info');
      expect(component.getStatusSeverity('Pending')).toBe('warn');
      expect(component.getStatusSeverity('Blocked')).toBe('danger');
    });
  });

  describe('getActionSeverity', () => {
    it('should return success for create action', () => {
      expect(component.getActionSeverity('create')).toBe('success');
      expect(component.getActionSeverity('CREATE')).toBe('success');
    });

    it('should return info for update action', () => {
      expect(component.getActionSeverity('update')).toBe('info');
      expect(component.getActionSeverity('UPDATE')).toBe('info');
    });

    it('should return danger for delete action', () => {
      expect(component.getActionSeverity('delete')).toBe('danger');
      expect(component.getActionSeverity('DELETE')).toBe('danger');
    });

    it('should return secondary for unknown action', () => {
      expect(component.getActionSeverity('unknown')).toBe('secondary');
    });
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

  describe('getEntityIcon', () => {
    it('should return pi-check-square for Task', () => {
      expect(component.getEntityIcon('Task')).toBe('pi pi-check-square');
    });

    it('should return pi-clock for TimeEntry', () => {
      expect(component.getEntityIcon('TimeEntry')).toBe('pi pi-clock');
    });

    it('should return pi-folder for Project', () => {
      expect(component.getEntityIcon('Project')).toBe('pi pi-folder');
    });

    it('should return pi-circle for unknown', () => {
      expect(component.getEntityIcon('Unknown')).toBe('pi pi-circle');
    });
  });

  describe('getEntityLabel', () => {
    it('should return translated label for known entity', () => {
      const result = component.getEntityLabel('Task');
      expect(result).toBeTruthy();
    });

    it('should return entity type when translation not found', () => {
      const result = component.getEntityLabel('UnknownEntity');
      expect(result).toBe('UnknownEntity');
    });
  });

  describe('getActionLabel', () => {
    it('should return translated label for known action', () => {
      const result = component.getActionLabel('create');
      expect(result).toBeTruthy();
    });
  });

  describe('openDetailsDialog', () => {
    beforeEach(async () => {
      mockDatabaseService.getAuditLogs = jasmine
        .createSpy('getAuditLogs')
        .and.returnValue(Promise.resolve([]));
      await component.loadData();
    });

    it('should open details dialog and load history', async () => {
      const task = mockTasks[0];

      await component.openDetailsDialog(task);

      expect(component.selectedTask()).toBe(task);
      expect(component.detailsDialogVisible()).toBeTrue();
      expect(mockDatabaseService.getAuditLogs).toHaveBeenCalled();
    });

    it('should handle error loading task history', async () => {
      mockDatabaseService.getAuditLogs = jasmine
        .createSpy('getAuditLogs')
        .and.returnValue(Promise.reject(new Error('Load error')));
      spyOn(console, 'error');
      const task = mockTasks[0];

      await component.openDetailsDialog(task);

      expect(console.error).toHaveBeenCalled();
      expect(component.taskHistory()).toEqual([]);
    });
  });

  describe('formatChangesDescription', () => {
    it('should return dash for null changes', () => {
      const log = { changes: null } as never;
      expect(component.formatChangesDescription(log)).toBe('-');
    });

    it('should return dash for invalid JSON', () => {
      const log = { changes: 'not valid json' } as never;
      expect(component.formatChangesDescription(log)).toBe('-');
    });

    it('should format TimeEntry create action', () => {
      const log = {
        entityType: 'TimeEntry',
        action: 'create',
        changes: JSON.stringify({
          date: '2025-01-01',
          hours: 8,
          notes: 'Work',
        }),
      } as never;
      const result = component.formatChangesDescription(log);
      expect(result).toContain('2025-01-01');
    });

    it('should format TimeEntry update action with previous', () => {
      const log = {
        entityType: 'TimeEntry',
        action: 'update',
        changes: JSON.stringify({
          previous: { hours: 4, date: '2025-01-01', notes: 'Old' },
          current: { hours: 8, date: '2025-01-02', notes: 'New' },
        }),
      } as never;
      const result = component.formatChangesDescription(log);
      expect(result).toContain('→');
    });

    it('should format Task create action', () => {
      const log = {
        entityType: 'Task',
        action: 'create',
        changes: JSON.stringify({ name: 'New Task' }),
      } as never;
      const result = component.formatChangesDescription(log);
      expect(result).toContain('New Task');
    });

    it('should format Task delete action', () => {
      const log = {
        entityType: 'Task',
        action: 'delete',
        changes: JSON.stringify({ name: 'Deleted Task' }),
      } as never;
      const result = component.formatChangesDescription(log);
      expect(result).toContain('Deleted Task');
    });

    it('should format Task update action with previous', () => {
      const log = {
        entityType: 'Task',
        action: 'update',
        changes: JSON.stringify({
          previous: { name: 'Old Name' },
          current: {
            name: 'New Name',
            description: 'updated',
            statusId: 's2',
            estimatedHours: 10,
          },
        }),
      } as never;
      const result = component.formatChangesDescription(log);
      expect(result).toBeTruthy();
    });

    it('should return dash for unknown entity types', () => {
      const log = {
        entityType: 'Unknown',
        action: 'create',
        changes: JSON.stringify({ foo: 'bar' }),
      } as never;
      const result = component.formatChangesDescription(log);
      expect(result).toBe('-');
    });

    it('should handle TimeEntry update without notes change', () => {
      const log = {
        entityType: 'TimeEntry',
        action: 'update',
        changes: JSON.stringify({
          previous: { hours: 4, date: '2025-01-01', notes: 'Same' },
          current: { hours: 8, date: '2025-01-01', notes: 'Same' },
        }),
      } as never;
      const result = component.formatChangesDescription(log);
      expect(result).toBeTruthy();
    });

    it('should return dash for Task update with no changes', () => {
      const log = {
        entityType: 'Task',
        action: 'update',
        changes: JSON.stringify({
          previous: { name: 'Same' },
          current: {},
        }),
      } as never;
      const result = component.formatChangesDescription(log);
      expect(result).toBe('-');
    });
  });

  describe('delete tag error handling', () => {
    it('should show error when delete tag fails', async () => {
      await component.loadData();
      mockDatabaseService.deleteTag.and.returnValue(
        Promise.reject(new Error('Delete error')),
      );
      const tag = mockTags[0];
      component.tagToDelete.set(tag);

      await component.onDeleteTagConfirmed();

      expect(mockMessageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' }),
      );
    });
  });

  describe('delete task error handling', () => {
    it('should show error when delete task fails', async () => {
      await component.loadData();
      mockDatabaseService.deleteTask.and.returnValue(
        Promise.reject(new Error('Delete error')),
      );
      const task = mockTasks[0];
      component.taskToDelete.set(task);

      await component.onDeleteTaskConfirmed();

      expect(mockMessageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' }),
      );
    });
  });
});
