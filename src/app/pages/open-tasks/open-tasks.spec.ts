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
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      name: 'Project 2',
      description: 'Desc 2',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  const mockStatuses = [
    { id: 's1', name: 'Pendiente' },
    { id: 's2', name: 'En progreso' },
    { id: 's3', name: 'Completada' },
    { id: 's4', name: 'Bloqueada' },
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
      status: { id: 's1', name: 'Pendiente' },
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
      status: { id: 's2', name: 'En progreso' },
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

  describe('filteredTasks', () => {
    it('should return all tasks when no filter is set', async () => {
      await component.loadData();
      component.selectedProjectFilter.set(null);

      expect(component.filteredTasks().length).toBe(2);
    });

    it('should filter tasks by project', async () => {
      await component.loadData();
      component.selectedProjectFilter.set('1');

      const filtered = component.filteredTasks();
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
});
