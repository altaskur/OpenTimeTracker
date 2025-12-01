import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenHome } from './open-home';
import { Router } from '@angular/router';
import { provideTranslateTestingModule } from '../../testing/test-utils';
import { ThemeService } from '../../services/theme.service';
import { DatabaseService } from '../../services/database.service';
import { Task } from '../../../types/electron';

describe('OpenHome', () => {
  let component: OpenHome;
  let fixture: ComponentFixture<OpenHome>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;
  let mockDbService: jasmine.SpyObj<DatabaseService>;

  const mockTasks: Task[] = [
    {
      id: '1',
      name: 'Task 1',
      project_id: 'p1',
      status_id: 's1',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Task 2',
      project_id: 'p1',
      status_id: 's1',
      created_at: new Date().toISOString(),
    },
  ];

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockThemeService = jasmine.createSpyObj('ThemeService', [
      'toggleTheme',
      'getThemeLabel',
      'getThemeIcon',
    ]);
    mockDbService = jasmine.createSpyObj('DatabaseService', ['getTasks']);

    mockThemeService.getThemeLabel.and.returnValue('Light Mode');
    mockThemeService.getThemeIcon.and.returnValue('pi pi-sun');
    mockDbService.getTasks.and.returnValue(Promise.resolve([]));

    await TestBed.configureTestingModule({
      imports: [OpenHome],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ThemeService, useValue: mockThemeService },
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
    it('should navigate to remaining time', () => {
      component.goToRemainingTime();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/remaining-time']);
    });

    it('should navigate to projects', () => {
      component.goToProjects();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects']);
    });
  });

  describe('theme', () => {
    it('should toggle dark mode via ThemeService', () => {
      component.toggleDarkMode();
      expect(mockThemeService.toggleTheme).toHaveBeenCalled();
    });

    it('should call toggleTheme multiple times', () => {
      component.toggleDarkMode();
      component.toggleDarkMode();
      expect(mockThemeService.toggleTheme).toHaveBeenCalledTimes(2);
    });

    it('should return theme label from computed', () => {
      expect(component.themeLabel()).toBe('Light Mode');
    });

    it('should return theme icon from computed', () => {
      expect(component.themeIcon()).toBe('pi pi-sun');
    });
  });
});
