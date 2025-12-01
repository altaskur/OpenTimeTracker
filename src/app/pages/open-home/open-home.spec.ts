import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenHome } from './open-home';
import { Router } from '@angular/router';
import { provideTranslateTestingModule } from '../../testing/test-utils';
import { DatabaseService } from '../../services';
import { Task } from '../../../types/electron';

describe('OpenHome', () => {
  let component: OpenHome;
  let fixture: ComponentFixture<OpenHome>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockDbService: jasmine.SpyObj<DatabaseService>;

  const mockTasks: Task[] = [
    {
      id: '1',
      name: 'Task 1',
      projectId: 'p1',
      statusId: 's1',
      description: null,
      estimatedHours: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: { id: 's1', name: 'Pendiente' },
      tags: [{ tag: { id: 't1', name: 'Bug' } }],
    },
    {
      id: '2',
      name: 'Task 2',
      projectId: 'p1',
      statusId: 's2',
      description: 'Description',
      estimatedHours: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: { id: 's2', name: 'En progreso' },
      tags: [],
    },
  ];

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDbService = jasmine.createSpyObj('DatabaseService', ['getTasks']);

    mockDbService.getTasks.and.returnValue(Promise.resolve([]));

    await TestBed.configureTestingModule({
      imports: [OpenHome],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: DatabaseService, useValue: mockDbService },
        ...provideTranslateTestingModule(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenHome);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load pending tasks on init', async () => {
      mockDbService.getTasks.and.returnValue(Promise.resolve(mockTasks));

      component.ngOnInit();
      await component.loadPendingTasks();

      expect(mockDbService.getTasks).toHaveBeenCalled();
      expect(component.pendingTasks()).toEqual(mockTasks);
    });

    it('should set loading to false after tasks loaded', async () => {
      mockDbService.getTasks.and.returnValue(Promise.resolve([]));

      await component.loadPendingTasks();

      expect(component.loading()).toBe(false);
    });
  });

  describe('loadPendingTasks', () => {
    it('should set loading to true while loading', async () => {
      let resolvePromise: (value: Task[]) => void;
      const pendingPromise = new Promise<Task[]>((resolve) => {
        resolvePromise = resolve;
      });
      mockDbService.getTasks.and.returnValue(pendingPromise);

      const loadPromise = component.loadPendingTasks();
      expect(component.loading()).toBe(true);

      resolvePromise!(mockTasks);
      await loadPromise;

      expect(component.loading()).toBe(false);
    });

    it('should set loading to false even on error', async () => {
      mockDbService.getTasks.and.returnValue(
        Promise.reject(new Error('DB Error')),
      );

      try {
        await component.loadPendingTasks();
      } catch {
        // Expected error
      }

      expect(component.loading()).toBe(false);
    });

    it('should populate pendingTasks signal with data', async () => {
      mockDbService.getTasks.and.returnValue(Promise.resolve(mockTasks));

      await component.loadPendingTasks();

      expect(component.pendingTasks()).toEqual(mockTasks);
    });
  });

  describe('navigation', () => {
    it('should navigate to tasks', () => {
      component.goToTasks();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/tasks']);
    });

    it('should navigate to projects', () => {
      component.goToProjects();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects']);
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
});
