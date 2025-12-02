import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenCalendarPage } from './open-calendar-page';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DatabaseService } from '../../services';
import {
  Task,
  TimeEntry,
  MonthConfig,
  DayOverride,
  DayType,
} from '../../../types/electron';

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

  const mockTimeEntries: TimeEntry[] = [];
  const mockMonthConfig: MonthConfig = {
    id: '1',
    year: 2025,
    month: 12,
    weeklyMinutes: 2400,
    workDays: '1,2,3,4,5',
    daySchedule: '{"1":480,"2":480,"3":480,"4":480,"5":480}',
    createdAt: today,
    updatedAt: today,
  };
  const mockDayOverrides: DayOverride[] = [];
  const mockDayTypes: DayType[] = [];

  beforeEach(async () => {
    mockDatabaseService = jasmine.createSpyObj('DatabaseService', [
      'getTasks',
      'getTimeEntries',
      'getMonthConfig',
      'getDayOverrides',
      'getDayTypes',
      'updateMonthConfig',
      'createTimeEntry',
      'updateTimeEntry',
    ]);
    mockDatabaseService.getTasks.and.returnValue(Promise.resolve(mockTasks));
    mockDatabaseService.getTimeEntries.and.returnValue(
      Promise.resolve(mockTimeEntries),
    );
    mockDatabaseService.getMonthConfig.and.returnValue(
      Promise.resolve(mockMonthConfig),
    );
    mockDatabaseService.getDayOverrides.and.returnValue(
      Promise.resolve(mockDayOverrides),
    );
    mockDatabaseService.getDayTypes.and.returnValue(
      Promise.resolve(mockDayTypes),
    );
    mockDatabaseService.updateMonthConfig.and.returnValue(
      Promise.resolve(mockMonthConfig),
    );
    mockDatabaseService.createTimeEntry.and.returnValue(
      Promise.resolve({} as TimeEntry),
    );

    await TestBed.configureTestingModule({
      imports: [OpenCalendarPage, TranslateModule.forRoot()],
      providers: [
        { provide: DatabaseService, useValue: mockDatabaseService },
        MessageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenCalendarPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all data on init', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockDatabaseService.getTasks).toHaveBeenCalled();
    expect(mockDatabaseService.getTimeEntries).toHaveBeenCalled();
    expect(mockDatabaseService.getMonthConfig).toHaveBeenCalled();
    expect(mockDatabaseService.getDayOverrides).toHaveBeenCalled();
    expect(mockDatabaseService.getDayTypes).toHaveBeenCalled();
    expect(component.tasks()).toEqual(mockTasks);
    expect(component.monthConfig()).toEqual(mockMonthConfig);
  });

  it('should set loading state while fetching data', async () => {
    expect(component.loading()).toBeFalse();

    const loadPromise = component.loadData();
    expect(component.loading()).toBeTrue();

    await loadPromise;
    expect(component.loading()).toBeFalse();
  });

  it('should handle task click with time entry', () => {
    const mockEntry: TimeEntry = {
      id: 'e1',
      taskId: '1',
      date: '2025-12-01',
      minutes: 480,
      notes: null,
      createdAt: today,
      updatedAt: today,
    };
    component.timeEntries.set([mockEntry]);

    expect(component.editingTimeEntry()).toEqual(mockEntry);
    expect(component.showTimeEntryDialog()).toBeTrue();
  });

  it('should handle day click', () => {
    spyOn(console, 'log');
    const date = new Date();

    component.onDayClicked(date);

    expect(console.log).toHaveBeenCalledWith('Day clicked:', date);
  });

  it('should open settings dialog on settings click', () => {
    component.onSettingsClicked();

    expect(component.showConfigDialog()).toBeTrue();
  });

  it('should open time entry dialog on add time click', () => {
    const date = new Date();

    component.onAddTimeClicked(date);

    expect(component.showTimeEntryDialog()).toBeTrue();
    expect(component.selectedDate()).toEqual(date);
  });

  it('should close config dialog on cancel', () => {
    component.showConfigDialog.set(true);

    component.onConfigCancelled();

    expect(component.showConfigDialog()).toBeFalse();
  });

  it('should close time entry dialog on cancel', () => {
    component.showTimeEntryDialog.set(true);

    component.onTimeEntryCancelled();

    expect(component.showTimeEntryDialog()).toBeFalse();
  });

  it('should save config and close dialog', async () => {
    component.showConfigDialog.set(true);

    await component.onConfigSaved({
      weeklyMinutes: 2400,
      workDays: '1,2,3,4,5',
      daySchedule: '{"1":480,"2":480,"3":480,"4":480,"5":480}',
    });

    expect(mockDatabaseService.updateMonthConfig).toHaveBeenCalled();
    expect(component.showConfigDialog()).toBeFalse();
  });

  it('should save time entry and reload data', async () => {
    component.showTimeEntryDialog.set(true);
    const date = new Date(2025, 11, 1, 12, 0, 0);
    const expectedDateString = '2025-12-01';

    await component.onTimeEntrySaved({
      taskId: '1',
      date,
      minutes: 480,
      notes: 'Test',
    });

    expect(mockDatabaseService.createTimeEntry).toHaveBeenCalledWith(
      expectedDateString,
      480,
      '1',
      'Test',
    );
    expect(component.showTimeEntryDialog()).toBeFalse();
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

  it('should handle month change', async () => {
    const newDate = new Date(2025, 10, 1);

    component.onMonthChanged(newDate);

    expect(component.currentMonth()).toEqual(newDate);
    expect(mockDatabaseService.getMonthConfig).toHaveBeenCalledWith(2025, 11);
  });
});
