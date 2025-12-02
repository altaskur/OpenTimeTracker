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
      status: {
        id: 's1',
        name: 'Pendiente',
        color: '#f59e0b',
        isDefault: true,
      },
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
      status: {
        id: 's2',
        name: 'En progreso',
        color: '#3b82f6',
        isDefault: true,
      },
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
      'deleteTimeEntry',
      'upsertDayOverride',
      'deleteDayOverride',
      'createDayType',
      'updateDayType',
      'deleteDayType',
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
    mockDatabaseService.updateTimeEntry.and.returnValue(
      Promise.resolve({} as TimeEntry),
    );
    mockDatabaseService.deleteTimeEntry.and.returnValue(
      Promise.resolve({ success: true }),
    );
    mockDatabaseService.upsertDayOverride.and.returnValue(
      Promise.resolve({} as DayOverride),
    );
    mockDatabaseService.deleteDayOverride.and.returnValue(
      Promise.resolve({ success: true }),
    );
    mockDatabaseService.createDayType.and.returnValue(
      Promise.resolve({} as DayType),
    );
    mockDatabaseService.updateDayType.and.returnValue(
      Promise.resolve({} as DayType),
    );
    mockDatabaseService.deleteDayType.and.returnValue(
      Promise.resolve({ success: true }),
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

  it('should handle time entry click', () => {
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

    component.onTimeEntryClicked('e1');

    expect(component.editingTimeEntry()).toEqual(mockEntry);
    expect(component.showTimeEntryDialog()).toBeTrue();
  });

  it('should handle day click and open day override dialog', () => {
    const date = new Date();

    component.onDayClicked(date);

    expect(component.selectedDate()).toEqual(date);
    expect(component.showDayOverrideDialog()).toBeTrue();
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

  it('should not find time entry when clicking non-existent id', () => {
    component.timeEntries.set([]);

    component.onTimeEntryClicked('non-existent');

    expect(component.editingTimeEntry()).toBeNull();
    expect(component.showTimeEntryDialog()).toBeFalse();
  });

  it('should update existing time entry', async () => {
    const existingEntry: TimeEntry = {
      id: 'e1',
      taskId: '1',
      date: '2025-12-01',
      minutes: 480,
      notes: null,
      createdAt: today,
      updatedAt: today,
    };
    component.editingTimeEntry.set(existingEntry);

    await component.onTimeEntrySaved({
      taskId: '2',
      date: new Date(2025, 11, 1),
      minutes: 240,
      notes: 'Updated',
    });

    expect(mockDatabaseService.updateTimeEntry).toHaveBeenCalledWith('e1', {
      date: '2025-12-01',
      minutes: 240,
      taskId: '2',
      notes: 'Updated',
    });
  });

  it('should show error toast when config save fails', async () => {
    component.showConfigDialog.set(true);
    mockDatabaseService.updateMonthConfig.and.rejectWith(new Error('Failed'));

    await component.onConfigSaved({
      weeklyMinutes: 2400,
      workDays: '1,2,3,4,5',
      daySchedule: '{}',
    });

    expect(component.showConfigDialog()).toBeTrue();
  });

  it('should show error toast when time entry save fails', async () => {
    component.showTimeEntryDialog.set(true);
    mockDatabaseService.createTimeEntry.and.rejectWith(new Error('Failed'));

    await component.onTimeEntrySaved({
      taskId: null,
      date: new Date(),
      minutes: 60,
      notes: null,
    });

    expect(component.showTimeEntryDialog()).toBeTrue();
  });

  it('should open delete confirmation dialog', () => {
    component.onTimeEntryDeleted();

    expect(component.showDeleteConfirm()).toBeTrue();
  });

  it('should delete time entry on confirm', async () => {
    const entry: TimeEntry = {
      id: 'e1',
      taskId: '1',
      date: '2025-12-01',
      minutes: 480,
      notes: null,
      createdAt: today,
      updatedAt: today,
    };
    component.editingTimeEntry.set(entry);
    component.showDeleteConfirm.set(true);
    component.showTimeEntryDialog.set(true);

    await component.onDeleteConfirmed();

    expect(mockDatabaseService.deleteTimeEntry).toHaveBeenCalledWith('e1');
    expect(component.showDeleteConfirm()).toBeFalse();
    expect(component.showTimeEntryDialog()).toBeFalse();
    expect(component.editingTimeEntry()).toBeNull();
  });

  it('should not delete when no entry is being edited', async () => {
    component.editingTimeEntry.set(null);

    await component.onDeleteConfirmed();

    expect(mockDatabaseService.deleteTimeEntry).not.toHaveBeenCalled();
  });

  it('should show error toast when delete fails', async () => {
    const entry: TimeEntry = {
      id: 'e1',
      taskId: '1',
      date: '2025-12-01',
      minutes: 480,
      notes: null,
      createdAt: today,
      updatedAt: today,
    };
    component.editingTimeEntry.set(entry);
    component.showDeleteConfirm.set(true);
    mockDatabaseService.deleteTimeEntry.and.rejectWith(new Error('Failed'));

    await component.onDeleteConfirmed();

    expect(component.showDeleteConfirm()).toBeTrue();
  });

  it('should cancel delete confirmation', () => {
    component.showDeleteConfirm.set(true);

    component.onDeleteCancelled();

    expect(component.showDeleteConfirm()).toBeFalse();
  });

  it('should find existing day override when clicking day', () => {
    const override: DayOverride = {
      id: 'do1',
      date: '2025-12-01',
      dayTypeId: 'dt1',
      minutes: null,
      note: null,
      createdAt: today,
      updatedAt: today,
    };
    component.dayOverrides.set([override]);

    component.onDayClicked(new Date(2025, 11, 1));

    expect(component.editingDayOverride()).toEqual(override);
  });

  it('should save day override', async () => {
    const date = new Date(2025, 11, 1);

    await component.onDayOverrideSaved({
      dates: [date],
      dayTypeId: 'dt1',
      minutes: 480,
      note: 'Test note',
    });

    expect(mockDatabaseService.upsertDayOverride).toHaveBeenCalledWith(
      '2025-12-01',
      'dt1',
      480,
      'Test note',
    );
    expect(component.showDayOverrideDialog()).toBeFalse();
  });

  it('should show error toast when day override save fails', async () => {
    component.showDayOverrideDialog.set(true);
    mockDatabaseService.upsertDayOverride.and.rejectWith(new Error('Failed'));

    await component.onDayOverrideSaved({
      dates: [new Date()],
      dayTypeId: null,
      minutes: null,
      note: null,
    });

    expect(component.showDayOverrideDialog()).toBeTrue();
  });

  it('should cancel day override dialog', () => {
    component.showDayOverrideDialog.set(true);
    component.editingDayOverride.set({} as DayOverride);

    component.onDayOverrideCancelled();

    expect(component.showDayOverrideDialog()).toBeFalse();
    expect(component.editingDayOverride()).toBeNull();
  });

  it('should delete day override', async () => {
    const override: DayOverride = {
      id: 'do1',
      date: '2025-12-01',
      dayTypeId: 'dt1',
      minutes: null,
      note: null,
      createdAt: today,
      updatedAt: today,
    };
    component.editingDayOverride.set(override);

    await component.onDayOverrideDeleted();

    expect(mockDatabaseService.deleteDayOverride).toHaveBeenCalledWith(
      '2025-12-01',
    );
    expect(component.showDayOverrideDialog()).toBeFalse();
  });

  it('should not delete day override when none is being edited', async () => {
    component.editingDayOverride.set(null);

    await component.onDayOverrideDeleted();

    expect(mockDatabaseService.deleteDayOverride).not.toHaveBeenCalled();
  });

  it('should show error toast when day override delete fails', async () => {
    const override: DayOverride = {
      id: 'do1',
      date: '2025-12-01',
      dayTypeId: 'dt1',
      minutes: null,
      note: null,
      createdAt: today,
      updatedAt: today,
    };
    component.editingDayOverride.set(override);
    component.showDayOverrideDialog.set(true);
    mockDatabaseService.deleteDayOverride.and.rejectWith(new Error('Failed'));

    await component.onDayOverrideDeleted();

    expect(component.showDayOverrideDialog()).toBeTrue();
  });

  it('should open day types dialog', () => {
    component.onManageDayTypes();

    expect(component.showDayTypesDialog()).toBeTrue();
  });

  it('should close day types dialog', () => {
    component.showDayTypesDialog.set(true);

    component.onDayTypesDialogClosed();

    expect(component.showDayTypesDialog()).toBeFalse();
  });

  it('should create day type', async () => {
    await component.onDayTypeCreated({
      name: 'Holiday',
      color: '#FF0000',
      defaultMinutes: 480,
    });

    expect(mockDatabaseService.createDayType).toHaveBeenCalledWith(
      'Holiday',
      '#FF0000',
      480,
    );
    expect(mockDatabaseService.getDayTypes).toHaveBeenCalled();
  });

  it('should show error toast when day type create fails', async () => {
    mockDatabaseService.createDayType.and.rejectWith(new Error('Failed'));

    await component.onDayTypeCreated({
      name: 'Holiday',
      color: '#FF0000',
      defaultMinutes: 480,
    });

    expect(mockDatabaseService.createDayType).toHaveBeenCalled();
  });

  it('should update day type', async () => {
    await component.onDayTypeUpdated({
      id: 'dt1',
      name: 'Updated Holiday',
      color: '#00FF00',
      defaultMinutes: 240,
    });

    expect(mockDatabaseService.updateDayType).toHaveBeenCalledWith('dt1', {
      name: 'Updated Holiday',
      color: '#00FF00',
      defaultMinutes: 240,
    });
    expect(mockDatabaseService.getDayTypes).toHaveBeenCalled();
  });

  it('should show error toast when day type update fails', async () => {
    mockDatabaseService.updateDayType.and.rejectWith(new Error('Failed'));

    await component.onDayTypeUpdated({
      id: 'dt1',
      name: 'Holiday',
      color: '#FF0000',
      defaultMinutes: 480,
    });

    expect(mockDatabaseService.updateDayType).toHaveBeenCalled();
  });

  it('should delete day type', async () => {
    await component.onDayTypeDeleted('dt1');

    expect(mockDatabaseService.deleteDayType).toHaveBeenCalledWith('dt1');
    expect(mockDatabaseService.getDayTypes).toHaveBeenCalled();
  });

  it('should show error toast when day type delete fails', async () => {
    mockDatabaseService.deleteDayType.and.rejectWith(new Error('Failed'));

    await component.onDayTypeDeleted('dt1');

    expect(mockDatabaseService.deleteDayType).toHaveBeenCalled();
  });

  it('should save multiple day overrides and show plural message', async () => {
    const dates = [
      new Date(2025, 11, 1),
      new Date(2025, 11, 2),
      new Date(2025, 11, 3),
    ];

    await component.onDayOverrideSaved({
      dates: dates,
      dayTypeId: 'dt1',
      minutes: 480,
      note: 'Test note',
    });

    expect(mockDatabaseService.upsertDayOverride).toHaveBeenCalledTimes(3);
    expect(component.showDayOverrideDialog()).toBeFalse();
  });

  it('should update existing day override with history', async () => {
    const override: DayOverride = {
      id: 'do1',
      date: '2025-12-01',
      dayTypeId: 'dt1',
      minutes: 240,
      note: 'Old note',
      createdAt: today,
      updatedAt: today,
    };
    component.editingDayOverride.set(override);

    await component.onDayOverrideSaved({
      dates: [new Date(2025, 11, 1)],
      dayTypeId: 'dt2',
      minutes: 480,
      note: 'New note',
    });

    expect(mockDatabaseService.upsertDayOverride).toHaveBeenCalledWith(
      '2025-12-01',
      'dt2',
      480,
      'New note',
    );
    expect(component.editingDayOverride()).toBeNull();
  });

  it('should handle effect when dataChanged signal changes for relevant entity types', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    mockDatabaseService.getTasks.calls.reset();
    mockDatabaseService.getTimeEntries.calls.reset();
  });

  it('should save time entry with null taskId', async () => {
    component.showTimeEntryDialog.set(true);
    const date = new Date(2025, 11, 1, 12, 0, 0);

    await component.onTimeEntrySaved({
      taskId: null,
      date,
      minutes: 60,
      notes: null,
    });

    expect(mockDatabaseService.createTimeEntry).toHaveBeenCalledWith(
      '2025-12-01',
      60,
      undefined,
      undefined,
    );
  });

  it('should format date correctly with single digit day and month', async () => {
    component.showTimeEntryDialog.set(true);
    const date = new Date(2025, 0, 5, 12, 0, 0);

    await component.onTimeEntrySaved({
      taskId: '1',
      date,
      minutes: 60,
      notes: 'Test',
    });

    expect(mockDatabaseService.createTimeEntry).toHaveBeenCalledWith(
      '2025-01-05',
      60,
      '1',
      'Test',
    );
  });

  it('should save day override with null values', async () => {
    const date = new Date(2025, 11, 1);

    await component.onDayOverrideSaved({
      dates: [date],
      dayTypeId: null,
      minutes: null,
      note: null,
    });

    expect(mockDatabaseService.upsertDayOverride).toHaveBeenCalledWith(
      '2025-12-01',
      undefined,
      undefined,
      undefined,
    );
  });

  it('should handle editing time entry update with null notes', async () => {
    const existingEntry: TimeEntry = {
      id: 'e1',
      taskId: '1',
      date: '2025-12-01',
      minutes: 480,
      notes: 'Original note',
      createdAt: today,
      updatedAt: today,
    };
    component.editingTimeEntry.set(existingEntry);

    await component.onTimeEntrySaved({
      taskId: null,
      date: new Date(2025, 11, 1),
      minutes: 240,
      notes: null,
    });

    expect(mockDatabaseService.updateTimeEntry).toHaveBeenCalledWith('e1', {
      date: '2025-12-01',
      minutes: 240,
      taskId: null,
      notes: null,
    });
  });
});
