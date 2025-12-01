import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenCalendarPage } from './open-calendar-page';
import { TranslateModule } from '@ngx-translate/core';
import { DatabaseService } from '../../services';
import { Task } from '../../../types/electron';

describe('OpenCalendarPage', () => {
  let component: OpenCalendarPage;
  let fixture: ComponentFixture<OpenCalendarPage>;
  let mockDatabaseService: jasmine.SpyObj<DatabaseService>;

  const today = new Date();
  const mockTasks: Task[] = [
    {
      id: '1',
      name: 'Task 1',
      projectId: 'p1',
      statusId: 's1',
      description: null,
      estimatedHours: 3,
      createdAt: today,
      updatedAt: today,
      status: { id: 's1', name: 'Pendiente' },
      tags: [],
    },
    {
      id: '2',
      name: 'Task 2',
      projectId: 'p1',
      statusId: 's2',
      description: 'Description',
      estimatedHours: 5,
      createdAt: today,
      updatedAt: today,
      status: { id: 's2', name: 'En progreso' },
      tags: [],
    },
  ];

  beforeEach(async () => {
    mockDatabaseService = jasmine.createSpyObj('DatabaseService', ['getTasks']);
    mockDatabaseService.getTasks.and.returnValue(Promise.resolve(mockTasks));

    await TestBed.configureTestingModule({
      imports: [OpenCalendarPage, TranslateModule.forRoot()],
      providers: [{ provide: DatabaseService, useValue: mockDatabaseService }],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenCalendarPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tasks on init', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockDatabaseService.getTasks).toHaveBeenCalled();
    expect(component.tasks()).toEqual(mockTasks);
  });

  it('should set loading state while fetching tasks', async () => {
    expect(component.loading()).toBeFalse();

    const loadPromise = component.loadTasks();
    expect(component.loading()).toBeTrue();

    await loadPromise;
    expect(component.loading()).toBeFalse();
  });

  it('should handle task click', () => {
    spyOn(console, 'log');
    const task = mockTasks[0];

    component.onTaskClicked(task);

    expect(console.log).toHaveBeenCalledWith('Task clicked:', task);
  });

  it('should handle day click', () => {
    spyOn(console, 'log');
    const date = new Date();

    component.onDayClicked(date);

    expect(console.log).toHaveBeenCalledWith('Day clicked:', date);
  });

  it('should show loading text while loading', () => {
    component.loading.set(true);
    fixture.detectChanges();

    const loadingElement = fixture.nativeElement.querySelector('.loading-text');
    expect(loadingElement).toBeTruthy();
  });

  it('should show calendar when not loading', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const calendar = fixture.nativeElement.querySelector('app-open-calendar');
    expect(calendar).toBeTruthy();
  });
});
