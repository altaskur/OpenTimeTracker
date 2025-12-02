import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskTableComponent } from './task-table';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TaskWithTags } from '../../../../interfaces';

describe('TaskTableComponent', () => {
  let component: TaskTableComponent;
  let fixture: ComponentFixture<TaskTableComponent>;
  let translateService: TranslateService;

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
      project: {
        id: '1',
        name: 'Project 1',
        description: null,
        isClosed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [{ tag: { id: 't1', name: 'Bug' } }],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTableComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskTableComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    fixture.componentRef.setInput('tasks', mockTasks);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display tasks', () => {
    expect(component.tasks()).toEqual(mockTasks);
  });

  it('should emit editTask when edit button clicked', () => {
    const editSpy = spyOn(component.editTask, 'emit');
    component.onEdit(mockTasks[0]);
    expect(editSpy).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('should emit deleteTask when delete button clicked', () => {
    const deleteSpy = spyOn(component.deleteTask, 'emit');
    component.onDelete(mockTasks[0]);
    expect(deleteSpy).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('should return correct severity for status', () => {
    expect(component.getStatusSeverity('Completada')).toBe('success');
    expect(component.getStatusSeverity('En progreso')).toBe('info');
    expect(component.getStatusSeverity('Pendiente')).toBe('warn');
    expect(component.getStatusSeverity('Bloqueada')).toBe('danger');
    expect(component.getStatusSeverity('Unknown')).toBe('secondary');
  });

  it('should emit viewTask when view button clicked', () => {
    const viewSpy = spyOn(component.viewTask, 'emit');
    component.onView(mockTasks[0]);
    expect(viewSpy).toHaveBeenCalledWith(mockTasks[0]);
  });

  describe('getStatusSeverity with translation keys', () => {
    it('should return success for status.completed', () => {
      expect(component.getStatusSeverity('status.completed')).toBe('success');
    });

    it('should return info for status.inProgress', () => {
      expect(component.getStatusSeverity('status.inProgress')).toBe('info');
    });

    it('should return warn for status.pending', () => {
      expect(component.getStatusSeverity('status.pending')).toBe('warn');
    });

    it('should return danger for status.blocked', () => {
      expect(component.getStatusSeverity('status.blocked')).toBe('danger');
    });

    it('should return success for Completed', () => {
      expect(component.getStatusSeverity('Completed')).toBe('success');
    });

    it('should return info for In Progress', () => {
      expect(component.getStatusSeverity('In Progress')).toBe('info');
    });

    it('should return warn for Pending', () => {
      expect(component.getStatusSeverity('Pending')).toBe('warn');
    });

    it('should return danger for Blocked', () => {
      expect(component.getStatusSeverity('Blocked')).toBe('danger');
    });

    it('should return secondary for undefined', () => {
      expect(component.getStatusSeverity(undefined)).toBe('secondary');
    });
  });

  describe('getStatusDisplayName', () => {
    it('should return empty string for empty status', () => {
      expect(component.getStatusDisplayName('')).toBe('');
    });

    it('should return empty string for undefined status', () => {
      expect(component.getStatusDisplayName(undefined)).toBe('');
    });

    it('should translate status key starting with status.', () => {
      spyOn(translateService, 'instant').and.returnValue('Translated');
      const result = component.getStatusDisplayName('status.pending');
      expect(translateService.instant).toHaveBeenCalledWith('status.pending');
      expect(result).toBe('Translated');
    });

    it('should return status name as-is if not a translation key', () => {
      const result = component.getStatusDisplayName('Custom Status');
      expect(result).toBe('Custom Status');
    });
  });

  describe('loading state', () => {
    it('should have default loading as false', () => {
      expect(component.loading()).toBe(false);
    });

    it('should accept loading input', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      expect(component.loading()).toBe(true);
    });
  });

  describe('emptyMessage', () => {
    it('should have default empty message', () => {
      expect(component.emptyMessage()).toBe('tasks.empty');
    });

    it('should accept custom empty message', () => {
      fixture.componentRef.setInput('emptyMessage', 'custom.empty');
      fixture.detectChanges();
      expect(component.emptyMessage()).toBe('custom.empty');
    });
  });
});
