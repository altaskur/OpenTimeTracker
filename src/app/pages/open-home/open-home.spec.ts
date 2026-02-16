import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { OpenHome } from './open-home';
import { Router } from '@angular/router';
import { DatabaseService } from '../../services';
import {
  Task,
  Project,
  TimeEntry,
  MonthConfig,
  DayOverride,
} from '../../../types/electron';

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
      status: {
        id: 's1',
        name: 'Pendiente',
        color: '#f59e0b',
        isDefault: true,
      },
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
      status: {
        id: 's2',
        name: 'En progreso',
        color: '#3b82f6',
        isDefault: true,
      },
      tags: [],
    },
    {
      id: '3',
      name: 'Completed Task',
      projectId: 'p1',
      statusId: 's3',
      description: null,
      estimatedHours: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: {
        id: 's3',
        name: 'status.completed',
        color: '#22c55e',
        isDefault: true,
      },
      tags: [],
    },
  ];

  const mockProjects: Project[] = [
    {
      id: 'p1',
      name: 'Open Project',
      description: null,
      isClosed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'p2',
      name: 'Closed Project',
      description: null,
      isClosed: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockTimeEntries: TimeEntry[] = [
    {
      id: 'e1',
      date: new Date().toISOString().split('T')[0],
      minutes: 120,
      taskId: '1',
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockMonthConfig: MonthConfig = {
    id: '1',
    year: 2025,
    month: 12,
    weeklyMinutes: 2400,
    workDays: '[1,2,3,4,5]',
    daySchedule: '{"1":480,"2":480,"3":480,"4":480,"5":480}',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDbService = jasmine.createSpyObj('DatabaseService', [
      'getTasks',
      'getProjects',
      'getTimeEntriesByDate',
      'getTimeEntriesByDateRange',
      'getMonthConfig',
      'getDayOverrides',
    ]);

    mockDbService.getTasks.and.returnValue(Promise.resolve([]));
    mockDbService.getProjects.and.returnValue(Promise.resolve([]));
    mockDbService.getTimeEntriesByDate.and.returnValue(Promise.resolve([]));
    mockDbService.getTimeEntriesByDateRange.and.returnValue(
      Promise.resolve([]),
    );
    mockDbService.getMonthConfig.and.returnValue(
      Promise.resolve(mockMonthConfig),
    );
    mockDbService.getDayOverrides.and.returnValue(Promise.resolve([]));

    await TestBed.configureTestingModule({
      imports: [OpenHome, TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: DatabaseService, useValue: mockDbService },
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

    it('should filter out completed tasks', async () => {
      mockDbService.getTasks.and.returnValue(Promise.resolve(mockTasks));

      await component.loadPendingTasks();

      const pending = component.pendingTasks();
      expect(pending.length).toBe(2);
      expect(
        pending.find((t) => t.status?.name === 'status.completed'),
      ).toBeUndefined();
    });
  });

  describe('loadOpenProjects', () => {
    it('should load only open projects', async () => {
      mockDbService.getProjects.and.returnValue(Promise.resolve(mockProjects));

      await component.loadOpenProjects();

      const open = component.openProjects();
      expect(open.length).toBe(1);
      expect(open[0].name).toBe('Open Project');
    });

    it('should handle errors gracefully', async () => {
      mockDbService.getProjects.and.returnValue(
        Promise.reject(new Error('fail')),
      );

      await component.loadOpenProjects();

      expect(component.openProjects()).toEqual([]);
    });
  });

  describe('loadStats', () => {
    it('should load time statistics', async () => {
      mockDbService.getTimeEntriesByDate.and.returnValue(
        Promise.resolve(mockTimeEntries),
      );
      mockDbService.getTimeEntriesByDateRange.and.returnValue(
        Promise.resolve(mockTimeEntries),
      );
      mockDbService.getMonthConfig.and.returnValue(
        Promise.resolve(mockMonthConfig),
      );
      mockDbService.getDayOverrides.and.returnValue(Promise.resolve([]));

      await component.loadStats();

      const stats = component.stats();
      expect(stats.todayWorked).toBe(120);
      expect(stats.weekWorked).toBe(120);
    });

    it('should handle day overrides', async () => {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const mockOverride: DayOverride = {
        id: 'o1',
        date: todayStr,
        dayTypeId: 'dt1',
        minutes: 0,
        note: 'Holiday',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDbService.getTimeEntriesByDate.and.returnValue(Promise.resolve([]));
      mockDbService.getTimeEntriesByDateRange.and.returnValue(
        Promise.resolve([]),
      );
      mockDbService.getMonthConfig.and.returnValue(
        Promise.resolve(mockMonthConfig),
      );
      mockDbService.getDayOverrides.and.returnValue(
        Promise.resolve([mockOverride]),
      );

      await component.loadStats();

      expect(component.stats().todayTarget).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      mockDbService.getTimeEntriesByDate.and.returnValue(
        Promise.reject(new Error('fail')),
      );

      await component.loadStats();

      expect(component.stats().todayWorked).toBe(0);
    });

    it('should count unique tasks worked today', async () => {
      const entries: TimeEntry[] = [
        { ...mockTimeEntries[0], id: 'e1', taskId: 't1' },
        { ...mockTimeEntries[0], id: 'e2', taskId: 't1' },
        { ...mockTimeEntries[0], id: 'e3', taskId: 't2' },
      ];
      mockDbService.getTimeEntriesByDate.and.returnValue(
        Promise.resolve(entries),
      );
      mockDbService.getTimeEntriesByDateRange.and.returnValue(
        Promise.resolve(entries),
      );

      await component.loadStats();

      expect(component.stats().tasksWorkedToday).toBe(2);
    });
  });

  describe('computed properties', () => {
    it('should calculate todayProgress correctly', async () => {
      component.stats.set({
        todayWorked: 240,
        todayTarget: 480,
        todayRemaining: 240,
        weekWorked: 0,
        weekTarget: 0,
        weekRemaining: 0,
        tasksWorkedToday: 0,
      });

      expect(component.todayProgress()).toBe(50);
    });

    it('should cap todayProgress at 100', async () => {
      component.stats.set({
        todayWorked: 600,
        todayTarget: 480,
        todayRemaining: 0,
        weekWorked: 0,
        weekTarget: 0,
        weekRemaining: 0,
        tasksWorkedToday: 0,
      });

      expect(component.todayProgress()).toBe(100);
    });

    it('should return 0 for todayProgress when target is 0', async () => {
      component.stats.set({
        todayWorked: 100,
        todayTarget: 0,
        todayRemaining: 0,
        weekWorked: 0,
        weekTarget: 0,
        weekRemaining: 0,
        tasksWorkedToday: 0,
      });

      expect(component.todayProgress()).toBe(0);
    });

    it('should calculate weekProgress correctly', async () => {
      component.stats.set({
        todayWorked: 0,
        todayTarget: 0,
        todayRemaining: 0,
        weekWorked: 1200,
        weekTarget: 2400,
        weekRemaining: 1200,
        tasksWorkedToday: 0,
      });

      expect(component.weekProgress()).toBe(50);
    });

    it('should return 0 for weekProgress when target is 0', async () => {
      component.stats.set({
        todayWorked: 0,
        todayTarget: 0,
        todayRemaining: 0,
        weekWorked: 100,
        weekTarget: 0,
        weekRemaining: 0,
        tasksWorkedToday: 0,
      });

      expect(component.weekProgress()).toBe(0);
    });
  });

  describe('formatTime', () => {
    it('should format hours and minutes', () => {
      expect(component.formatTime(90)).toBe('1h 30m');
    });

    it('should format hours only', () => {
      expect(component.formatTime(60)).toBe('1h');
    });

    it('should format minutes only', () => {
      expect(component.formatTime(30)).toBe('30m');
    });

    it('should format zero minutes', () => {
      expect(component.formatTime(0)).toBe('0m');
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

    it('should navigate to calendar', () => {
      component.goToCalendar();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/calendar']);
    });
  });

  describe('loadStats additional scenarios', () => {
    it('should calculate remaining as 0 when worked exceeds target', async () => {
      const entries = [{ ...mockTimeEntries[0], minutes: 600 }];
      mockDbService.getTimeEntriesByDate.and.returnValue(
        Promise.resolve(entries),
      );
      mockDbService.getTimeEntriesByDateRange.and.returnValue(
        Promise.resolve(entries),
      );

      await component.loadStats();

      expect(component.stats().todayRemaining).toBe(0);
    });

    it('should handle invalid workDays format in config', async () => {
      const invalidConfig = { ...mockMonthConfig, workDays: 'invalid' };
      mockDbService.getTimeEntriesByDate.and.returnValue(Promise.resolve([]));
      mockDbService.getTimeEntriesByDateRange.and.returnValue(
        Promise.resolve([]),
      );
      mockDbService.getMonthConfig.and.returnValue(
        Promise.resolve(invalidConfig),
      );
      mockDbService.getDayOverrides.and.returnValue(Promise.resolve([]));

      await component.loadStats();

      expect(component.stats()).toBeTruthy();
    });

    it('should handle empty workDays array', async () => {
      const emptyConfig = { ...mockMonthConfig, workDays: '[]' };
      mockDbService.getTimeEntriesByDate.and.returnValue(Promise.resolve([]));
      mockDbService.getTimeEntriesByDateRange.and.returnValue(
        Promise.resolve([]),
      );
      mockDbService.getMonthConfig.and.returnValue(
        Promise.resolve(emptyConfig),
      );
      mockDbService.getDayOverrides.and.returnValue(Promise.resolve([]));

      await component.loadStats();

      expect(component.stats().todayTarget).toBe(0);
    });

    it('should handle weekend days', async () => {
      const weekdayConfig = { ...mockMonthConfig, workDays: '[1,2,3,4,5]' };
      mockDbService.getTimeEntriesByDate.and.returnValue(Promise.resolve([]));
      mockDbService.getTimeEntriesByDateRange.and.returnValue(
        Promise.resolve([]),
      );
      mockDbService.getMonthConfig.and.returnValue(
        Promise.resolve(weekdayConfig),
      );
      mockDbService.getDayOverrides.and.returnValue(Promise.resolve([]));

      await component.loadStats();

      expect(component.stats()).toBeTruthy();
    });
  });

  describe('cap weekProgress at 100', () => {
    it('should cap weekProgress at 100 when exceeded', () => {
      component.stats.set({
        todayWorked: 0,
        todayTarget: 0,
        todayRemaining: 0,
        weekWorked: 3000,
        weekTarget: 2400,
        weekRemaining: 0,
        tasksWorkedToday: 0,
      });

      expect(component.weekProgress()).toBe(100);
    });
  });

  describe('loadPendingTasks status filtering', () => {
    it('should filter out Completada status', async () => {
      const tasksWithCompletada: Task[] = [
        ...mockTasks.filter((t) => t.status?.name !== 'status.completed'),
        {
          ...mockTasks[0],
          id: 'completed1',
          status: {
            id: 's4',
            name: 'Completada',
            color: '#22c55e',
            isDefault: true,
          },
        },
      ];
      mockDbService.getTasks.and.returnValue(
        Promise.resolve(tasksWithCompletada),
      );

      await component.loadPendingTasks();

      const pending = component.pendingTasks();
      expect(
        pending.find((t) => t.status?.name === 'Completada'),
      ).toBeUndefined();
    });

    it('should filter out Completed status', async () => {
      const tasksWithCompleted: Task[] = [
        ...mockTasks.filter((t) => t.status?.name !== 'status.completed'),
        {
          ...mockTasks[0],
          id: 'completed2',
          status: {
            id: 's5',
            name: 'Completed',
            color: '#22c55e',
            isDefault: true,
          },
        },
      ];
      mockDbService.getTasks.and.returnValue(
        Promise.resolve(tasksWithCompleted),
      );

      await component.loadPendingTasks();

      const pending = component.pendingTasks();
      expect(
        pending.find((t) => t.status?.name === 'Completed'),
      ).toBeUndefined();
    });
  });

  describe('status and tags helpers', () => {
    it('should translate pending status when status is undefined', () => {
      expect(component.getStatusDisplayName(undefined)).toBe('status.pending');
    });

    it('should translate provided status key', () => {
      expect(component.getStatusDisplayName('status.completed')).toBe(
        'status.completed',
      );
    });

    it('should return success severity', () => {
      expect(component.getStatusSeverity('Completed')).toBe('success');
      expect(component.getStatusSeverity('Completada')).toBe('success');
      expect(component.getStatusSeverity('Done')).toBe('success');
    });

    it('should return info severity', () => {
      expect(component.getStatusSeverity('In Progress')).toBe('info');
      expect(component.getStatusSeverity('En curso')).toBe('info');
      expect(component.getStatusSeverity('Working')).toBe('info');
    });

    it('should return danger severity', () => {
      expect(component.getStatusSeverity('Blocked')).toBe('danger');
      expect(component.getStatusSeverity('Bloqueada')).toBe('danger');
      expect(component.getStatusSeverity('Error')).toBe('danger');
    });

    it('should return warn severity', () => {
      expect(component.getStatusSeverity('Pending')).toBe('warn');
      expect(component.getStatusSeverity('Pendiente')).toBe('warn');
      expect(component.getStatusSeverity('Todo')).toBe('warn');
    });

    it('should return secondary for unknown severity', () => {
      expect(component.getStatusSeverity('Unknown')).toBe('secondary');
      expect(component.getStatusSeverity(undefined)).toBe('secondary');
    });

    it('should extract task tags', () => {
      const taskWithTags = {
        ...mockTasks[0],
        tags: [
          { tag: { id: 't1', name: 'Bug' } },
          { tag: { id: 't2', name: 'UI' } },
        ],
      } as Task;

      expect(component.getTaskTags(taskWithTags)).toEqual(['Bug', 'UI']);
    });

    it('should return empty array when task has no tags', () => {
      const taskWithoutTags = { ...mockTasks[0], tags: [] } as Task;
      expect(component.getTaskTags(taskWithoutTags)).toEqual([]);
    });
  });
});
