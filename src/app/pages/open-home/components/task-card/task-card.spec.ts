import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskCard } from './task-card';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Task } from '../../../../../types/electron';

describe('TaskCard', () => {
  let component: TaskCard;
  let fixture: ComponentFixture<TaskCard>;
  let translateService: TranslateService;

  const mockTask: Task = {
    id: '1',
    name: 'Test Task',
    projectId: 'p1',
    statusId: 's1',
    description: 'Test description',
    estimatedHours: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: {
      id: 's1',
      name: 'status.pending',
      color: '#f59e0b',
      isDefault: true,
    },
    project: {
      id: 'p1',
      name: 'Test Project',
      description: null,
      isClosed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    tags: [{ tag: { id: 't1', name: 'Bug' } }],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCard, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCard);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    fixture.componentRef.setInput('task', mockTask);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getStatusDisplayName', () => {
    it('should return empty string for undefined status', () => {
      expect(component.getStatusDisplayName(undefined)).toBe('');
    });

    it('should return empty string for empty status', () => {
      expect(component.getStatusDisplayName('')).toBe('');
    });

    it('should translate status keys starting with status.', () => {
      spyOn(translateService, 'instant').and.returnValue('Pendiente');
      const result = component.getStatusDisplayName('status.pending');
      expect(translateService.instant).toHaveBeenCalledWith('status.pending');
      expect(result).toBe('Pendiente');
    });

    it('should return original name for non-translation keys', () => {
      const result = component.getStatusDisplayName('Custom Status');
      expect(result).toBe('Custom Status');
    });
  });

  describe('getStatusSeverity', () => {
    it('should return success for completed statuses', () => {
      expect(component.getStatusSeverity('status.completed')).toBe('success');
      expect(component.getStatusSeverity('Completada')).toBe('success');
      expect(component.getStatusSeverity('Completed')).toBe('success');
    });

    it('should return info for in-progress statuses', () => {
      expect(component.getStatusSeverity('status.inProgress')).toBe('info');
      expect(component.getStatusSeverity('En progreso')).toBe('info');
      expect(component.getStatusSeverity('In Progress')).toBe('info');
    });

    it('should return warn for pending statuses', () => {
      expect(component.getStatusSeverity('status.pending')).toBe('warn');
      expect(component.getStatusSeverity('Pendiente')).toBe('warn');
      expect(component.getStatusSeverity('Pending')).toBe('warn');
    });

    it('should return danger for blocked statuses', () => {
      expect(component.getStatusSeverity('status.blocked')).toBe('danger');
      expect(component.getStatusSeverity('Bloqueada')).toBe('danger');
      expect(component.getStatusSeverity('Blocked')).toBe('danger');
    });

    it('should return secondary for unknown statuses', () => {
      expect(component.getStatusSeverity('Unknown')).toBe('secondary');
      expect(component.getStatusSeverity(undefined)).toBe('secondary');
      expect(component.getStatusSeverity('')).toBe('secondary');
    });
  });
});
