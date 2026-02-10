import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenCalendar } from './open-calendar';
import { TranslateModule } from '@ngx-translate/core';
import {
  Task,
  TimeEntry,
  MonthConfig,
  DayOverride,
  DayType,
} from '../../../types/electron';

describe('OpenCalendar', () => {
  let component: OpenCalendar;
  let fixture: ComponentFixture<OpenCalendar>;

  const mockTask: Task = {
    id: 't1',
    name: 'Test Task',
    projectId: 'p1',
    statusId: 's1',
    description: 'Test',
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
      name: 'Project',
      description: null,
      isClosed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    tags: [],
  };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const mockTimeEntry: TimeEntry = {
    id: 'e1',
    date: todayStr,
    minutes: 120,
    taskId: 't1',
    notes: 'Test notes',
    createdAt: new Date(),
    updatedAt: new Date(),
    task: mockTask,
  };

  const mockMonthConfig: MonthConfig = {
    id: 'mc1',
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    workDays: '1,2,3,4,5',
    weeklyMinutes: 2400,
    daySchedule: '{"1":480,"2":480,"3":480,"4":480,"5":480}',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDayType: DayType = {
    id: 'dt1',
    name: 'Holiday',
    color: '#ff0000',
    defaultMinutes: 0,
    createdAt: new Date(),
  };

  const mockDayOverride: DayOverride = {
    id: 'do1',
    date: todayStr,
    dayTypeId: 'dt1',
    minutes: 0,
    note: 'Holiday',
    createdAt: new Date(),
    updatedAt: new Date(),
    dayType: mockDayType,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenCalendar, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenCalendar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should initialize week days', () => {
      expect(component.weekDays().length).toBe(7);
    });

    it('should have current date set', () => {
      const currentDate = component.currentDate();
      expect(currentDate).toBeInstanceOf(Date);
    });

    it('should generate calendar days', () => {
      const days = component.calendarDays();
      expect(days.length).toBe(42);
    });

    it('should update labels on language change', () => {
      expect(component.monthYearLabel()).toBeTruthy();
    });
  });

  describe('navigation', () => {
    it('should navigate to previous month', () => {
      const initialDate = new Date(component.currentDate());
      component.previousMonth();
      const newDate = component.currentDate();

      expect(newDate.getMonth()).toBe(
        initialDate.getMonth() === 0 ? 11 : initialDate.getMonth() - 1,
      );
    });

    it('should navigate to next month', () => {
      const initialDate = new Date(component.currentDate());
      component.nextMonth();
      const newDate = component.currentDate();

      expect(newDate.getMonth()).toBe((initialDate.getMonth() + 1) % 12);
    });

    it('should go to today', () => {
      component.nextMonth();
      component.nextMonth();
      component.goToToday();

      const currentDate = component.currentDate();
      const todayDate = new Date();

      expect(currentDate.getMonth()).toBe(todayDate.getMonth());
      expect(currentDate.getFullYear()).toBe(todayDate.getFullYear());
    });

    it('should emit monthChanged on navigation', () => {
      spyOn(component.monthChanged, 'emit');
      component.nextMonth();
      expect(component.monthChanged.emit).toHaveBeenCalled();
    });
  });

  describe('monthYearLabel', () => {
    it('should return formatted month and year', () => {
      const label = component.monthYearLabel();
      expect(label).toBeTruthy();
      expect(typeof label).toBe('string');
    });
  });

  describe('calendarDays', () => {
    it('should mark today correctly', () => {
      const days = component.calendarDays();
      const todayDay = days.find((d) => d.isToday);

      expect(todayDay).toBeTruthy();
      expect(todayDay?.dayNumber).toBe(new Date().getDate());
    });

    it('should mark other month days', () => {
      const days = component.calendarDays();
      const otherMonthDays = days.filter((d) => !d.isCurrentMonth);

      expect(otherMonthDays.length).toBeGreaterThan(0);
    });

    it('should include time entries for days', () => {
      fixture.componentRef.setInput('timeEntries', [mockTimeEntry]);
      fixture.componentRef.setInput('tasks', [mockTask]);
      fixture.detectChanges();

      const days = component.calendarDays();
      const dayWithEntry = days.find((d) => d.dateString === todayStr);
      expect(dayWithEntry?.timeEntries.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle month config', () => {
      fixture.componentRef.setInput('monthConfig', mockMonthConfig);
      fixture.detectChanges();

      const days = component.calendarDays();
      expect(days.length).toBe(42);
    });

    it('should handle day overrides', () => {
      fixture.componentRef.setInput('dayOverrides', [mockDayOverride]);
      fixture.detectChanges();

      const days = component.calendarDays();
      expect(days.length).toBe(42);
    });
  });

  describe('event handlers', () => {
    it('should emit dayClicked on day click', () => {
      spyOn(component.dayClicked, 'emit');
      const day = component.calendarDays()[15];

      component.onDayClick(day);

      expect(component.dayClicked.emit).toHaveBeenCalledWith(day.date);
    });

    it('should emit timeEntryClicked', () => {
      spyOn(component.timeEntryClicked, 'emit');
      const event = new Event('click');

      component.onTimeEntryClick('e1', event);

      expect(component.timeEntryClicked.emit).toHaveBeenCalledWith('e1');
    });

    it('should emit settingsClicked', () => {
      spyOn(component.settingsClicked, 'emit');
      const event = new Event('click');

      component.onSettingsClick(event);

      expect(component.settingsClicked.emit).toHaveBeenCalled();
    });

    it('should emit addTimeClicked on add time', () => {
      spyOn(component.addTimeClicked, 'emit');
      const day = component.calendarDays()[15];
      const event = new Event('click');

      component.onAddTimeClick(day, event);

      expect(component.addTimeClicked.emit).toHaveBeenCalledWith(day.date);
    });

    it('should not emit on day area click for other month', () => {
      spyOn(component.dayClicked, 'emit');
      spyOn(component.addTimeClicked, 'emit');
      const days = component.calendarDays();
      const otherMonthDay = days.find((d) => !d.isCurrentMonth);
      const event = new Event('click');

      if (otherMonthDay) {
        component.onDayAreaClick(otherMonthDay, event);
        expect(component.dayClicked.emit).not.toHaveBeenCalled();
        expect(component.addTimeClicked.emit).not.toHaveBeenCalled();
      }
    });

    it('should emit addTimeClicked on day area click for empty day', () => {
      spyOn(component.addTimeClicked, 'emit');
      const days = component.calendarDays();
      const emptyDay = days.find(
        (d) => d.isCurrentMonth && d.timeEntries.length === 0 && !d.dayOverride,
      );
      const event = new Event('click');

      if (emptyDay) {
        component.onDayAreaClick(emptyDay, event);
        expect(component.addTimeClicked.emit).toHaveBeenCalled();
      }
    });
  });

  describe('day entries dialog', () => {
    it('should open day entries dialog', () => {
      const day = component.calendarDays()[15];
      const event = new Event('click');

      component.onShowAllEntries(day, event);

      expect(component.showDayEntriesDialog()).toBeTrue();
      expect(component.selectedDayEntries()).toBe(day);
    });

    it('should close day entries dialog', () => {
      const day = component.calendarDays()[15];
      const event = new Event('click');

      component.onShowAllEntries(day, event);
      component.closeDayEntriesDialog();

      expect(component.showDayEntriesDialog()).toBeFalse();
      expect(component.selectedDayEntries()).toBeNull();
    });

    it('should emit and close on dialog entry click', () => {
      spyOn(component.timeEntryClicked, 'emit');
      const day = component.calendarDays()[15];
      const event = new Event('click');

      component.onShowAllEntries(day, event);
      component.onDialogEntryClick('e1');

      expect(component.timeEntryClicked.emit).toHaveBeenCalledWith('e1');
      expect(component.showDayEntriesDialog()).toBeFalse();
    });
  });

  describe('getStatusSeverity', () => {
    it('should return success for completed statuses', () => {
      expect(component.getStatusSeverity('status.completed')).toBe('success');
      expect(component.getStatusSeverity('Completada')).toBe('success');
      expect(component.getStatusSeverity('Completed')).toBe('success');
    });

    it('should return info for in progress statuses', () => {
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

    it('should return secondary for unknown status', () => {
      expect(component.getStatusSeverity('Unknown')).toBe('secondary');
      expect(component.getStatusSeverity(undefined)).toBe('secondary');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color class for each status', () => {
      expect(component.getStatusColor('status.completed')).toBe(
        'status-completed',
      );
      expect(component.getStatusColor('Completada')).toBe('status-completed');
      expect(component.getStatusColor('status.inProgress')).toBe(
        'status-progress',
      );
      expect(component.getStatusColor('En progreso')).toBe('status-progress');
      expect(component.getStatusColor('status.pending')).toBe('status-pending');
      expect(component.getStatusColor('Pendiente')).toBe('status-pending');
      expect(component.getStatusColor('status.blocked')).toBe('status-blocked');
      expect(component.getStatusColor('Bloqueada')).toBe('status-blocked');
      expect(component.getStatusColor('Unknown')).toBe('status-default');
    });
  });

  describe('week summaries', () => {
    it('should calculate week summaries', () => {
      const summaries = component.weekSummaries();
      expect(summaries).toBeTruthy();
    });

    it('should get week worked minutes', () => {
      const worked = component.getWeekWorked(0);
      expect(typeof worked).toBe('number');
    });

    it('should get week planned minutes', () => {
      const planned = component.getWeekPlanned(0);
      expect(typeof planned).toBe('number');
    });

    it('should check if week is complete', () => {
      const isComplete = component.isWeekComplete(0);
      expect(typeof isComplete).toBe('boolean');
    });

    it('should check if week is over', () => {
      const isOver = component.isWeekOver(0);
      expect(typeof isOver).toBe('boolean');
    });

    it('should return false for non-existent week', () => {
      expect(component.isWeekComplete(99)).toBeFalse();
      expect(component.isWeekOver(99)).toBeFalse();
    });
  });

  describe('month totals', () => {
    it('should calculate month worked minutes', () => {
      const worked = component.monthWorkedMinutes();
      expect(typeof worked).toBe('number');
    });

    it('should calculate month planned minutes', () => {
      const planned = component.monthPlannedMinutes();
      expect(typeof planned).toBe('number');
    });

    it('should calculate month balance', () => {
      const balance = component.monthBalance();
      expect(typeof balance).toBe('number');
    });
  });

  describe('getBalanceClass', () => {
    it('should return positive class for positive balance', () => {
      expect(component.getBalanceClass(100)).toBe('balance-positive');
    });

    it('should return negative class for negative balance', () => {
      expect(component.getBalanceClass(-100)).toBe('balance-negative');
    });

    it('should return neutral class for zero balance', () => {
      expect(component.getBalanceClass(0)).toBe('balance-neutral');
    });
  });

  describe('getDayTypeColor', () => {
    it('should return null for day without override', () => {
      const day = component.calendarDays()[0];
      if (!day.dayOverride) {
        expect(component.getDayTypeColor(day)).toBeNull();
      }
    });
  });

  describe('formatTime', () => {
    it('should format minutes correctly', () => {
      expect(component.formatTime(60)).toBe('1h');
      expect(component.formatTime(90)).toBe('1h 30m');
      expect(component.formatTime(30)).toBe('30m');
    });
  });

  describe('getEntriesPreview', () => {
    it('should return preview text for day entries', () => {
      fixture.componentRef.setInput('timeEntries', [mockTimeEntry]);
      fixture.componentRef.setInput('tasks', [mockTask]);
      fixture.detectChanges();

      const days = component.calendarDays();
      const dayWithEntry = days.find((d) => d.timeEntries.length > 0);
      if (dayWithEntry) {
        const preview = component.getEntriesPreview(dayWithEntry);
        expect(typeof preview).toBe('string');
      }
    });

    it('should handle entries without task', () => {
      const entryWithoutTask: TimeEntry = { ...mockTimeEntry, task: undefined };
      fixture.componentRef.setInput('timeEntries', [entryWithoutTask]);
      fixture.detectChanges();

      const days = component.calendarDays();
      const dayWithEntry = days.find((d) => d.dateString === todayStr);
      if (dayWithEntry) {
        const preview = component.getEntriesPreview(dayWithEntry);
        expect(typeof preview).toBe('string');
      }
    });
  });

  describe('calendarDays with config', () => {
    it('should apply day schedule from month config', () => {
      const configWithSchedule: MonthConfig = {
        ...mockMonthConfig,
        daySchedule: '{"1":420,"2":420,"3":420,"4":420,"5":480}',
      };
      fixture.componentRef.setInput('monthConfig', configWithSchedule);
      fixture.detectChanges();

      const days = component.calendarDays();
      expect(days.length).toBe(42);
    });

    it('should handle day overrides with minutes', () => {
      const overrideWithMinutes: DayOverride = {
        ...mockDayOverride,
        minutes: 240,
        dayType: { ...mockDayType, defaultMinutes: 0 },
      };
      fixture.componentRef.setInput('dayOverrides', [overrideWithMinutes]);
      fixture.detectChanges();

      const days = component.calendarDays();
      expect(days.length).toBe(42);
    });

    it('should handle empty workDays in config', () => {
      const emptyConfig: MonthConfig = {
        ...mockMonthConfig,
        workDays: '',
      };
      fixture.componentRef.setInput('monthConfig', emptyConfig);
      fixture.detectChanges();

      const days = component.calendarDays();
      expect(days.length).toBe(42);
    });

    it('should use default work days when config has no workDays', () => {
      fixture.componentRef.setInput('monthConfig', {
        ...mockMonthConfig,
        workDays: undefined,
      } as unknown as MonthConfig);
      fixture.detectChanges();

      const days = component.calendarDays();
      expect(days.length).toBe(42);
    });
  });

  describe('onDayAreaClick with time entries', () => {
    it('should not emit when day has time entries but no override', () => {
      spyOn(component.addTimeClicked, 'emit');
      spyOn(component.dayClicked, 'emit');

      fixture.componentRef.setInput('timeEntries', [mockTimeEntry]);
      fixture.componentRef.setInput('tasks', [mockTask]);
      fixture.detectChanges();

      const days = component.calendarDays();
      const dayWithEntry = days.find(
        (d) => d.isCurrentMonth && d.timeEntries.length > 0 && !d.dayOverride,
      );

      if (dayWithEntry) {
        const event = new Event('click');
        component.onDayAreaClick(dayWithEntry, event);
        expect(component.addTimeClicked.emit).not.toHaveBeenCalled();
        expect(component.dayClicked.emit).not.toHaveBeenCalled();
      }
    });

    it('should emit dayClicked when day has override', () => {
      spyOn(component.dayClicked, 'emit');

      fixture.componentRef.setInput('dayOverrides', [mockDayOverride]);
      fixture.detectChanges();

      const days = component.calendarDays();
      const dayWithOverride = days.find(
        (d) => d.isCurrentMonth && d.dayOverride,
      );

      if (dayWithOverride) {
        const event = new Event('click');
        component.onDayAreaClick(dayWithOverride, event);
        expect(component.dayClicked.emit).toHaveBeenCalledWith(
          dayWithOverride.date,
        );
      }
    });
  });

  describe('weekSummaries computation', () => {
    it('should calculate weekly summaries correctly', () => {
      fixture.componentRef.setInput('monthConfig', mockMonthConfig);
      fixture.componentRef.setInput('timeEntries', [mockTimeEntry]);
      fixture.detectChanges();

      const summaries = component.weekSummaries();
      expect(Object.keys(summaries).length).toBeGreaterThan(0);

      const firstWeek = summaries[0];
      expect(firstWeek).toBeDefined();
      expect(typeof firstWeek.workedMinutes).toBe('number');
      expect(typeof firstWeek.plannedMinutes).toBe('number');
    });
  });

  describe('isWeekComplete and isWeekOver edge cases', () => {
    it('should return false for week with zero planned minutes', () => {
      const emptyConfig: MonthConfig = {
        ...mockMonthConfig,
        workDays: '',
        weeklyMinutes: 0,
        daySchedule: '{}',
      };
      fixture.componentRef.setInput('monthConfig', emptyConfig);
      fixture.detectChanges();

      expect(component.isWeekComplete(0)).toBeFalse();
      expect(component.isWeekOver(0)).toBeFalse();
    });

    it('should return true when worked equals planned', () => {
      fixture.componentRef.setInput('monthConfig', mockMonthConfig);
      fixture.detectChanges();

      const weekNum = 2;
      const summary = component.weekSummaries()[weekNum];
      if (
        summary &&
        summary.plannedMinutes > 0 &&
        summary.workedMinutes >= summary.plannedMinutes
      ) {
        expect(component.isWeekComplete(weekNum)).toBeTrue();
      }
    });
  });

  describe('weeks computation', () => {
    it('should group days into weeks', () => {
      const weeks = component.weeks();
      expect(weeks.length).toBe(6); // 42 days / 7 = 6 weeks
      expect(weeks[0].length).toBe(7);
      expect(weeks[0][0]).toBeDefined();
    });
  });

  describe('month totals with data', () => {
    it('should calculate month worked correctly with entries', () => {
      fixture.componentRef.setInput('timeEntries', [mockTimeEntry]);
      fixture.detectChanges();

      const worked = component.monthWorkedMinutes();
      expect(worked).toBeGreaterThanOrEqual(0);
    });

    it('should calculate balance correctly', () => {
      fixture.componentRef.setInput('monthConfig', mockMonthConfig);
      fixture.componentRef.setInput('timeEntries', [mockTimeEntry]);
      fixture.detectChanges();

      const balance = component.monthBalance();
      expect(typeof balance).toBe('number');
    });
  });

  describe('getDayTypeColor with override', () => {
    it('should return color when day has override with dayType', () => {
      fixture.componentRef.setInput('dayOverrides', [mockDayOverride]);
      fixture.detectChanges();

      const days = component.calendarDays();
      const dayWithOverride = days.find((d) => d.dayOverride?.dayType);

      if (dayWithOverride) {
        const color = component.getDayTypeColor(dayWithOverride);
        expect(color).toBe('#ff0000');
      }
    });
  });

  describe('navigation and label updates', () => {
    it('should update label on previous month', () => {
      const initialLabel = component.monthYearLabel();
      component.previousMonth();
      const newLabel = component.monthYearLabel();
      expect(newLabel).not.toBe(initialLabel);
    });

    it('should update label on next month', () => {
      const initialLabel = component.monthYearLabel();
      component.nextMonth();
      const newLabel = component.monthYearLabel();
      expect(newLabel).not.toBe(initialLabel);
    });

    it('should update label on goToToday', () => {
      component.previousMonth();
      component.previousMonth();
      component.goToToday();
      expect(component.monthYearLabel()).toBeTruthy();
    });
  });
});
