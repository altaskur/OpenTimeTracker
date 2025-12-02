import {
  Component,
  OnInit,
  signal,
  computed,
  input,
  output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  Task,
  TimeEntry,
  MonthConfig,
  DayOverride,
  DayType,
  DaySchedule,
} from '../../../types/electron';
import { formatMinutes } from '../../utils/time.utils';

/**
 * Month key mapping for translations
 */
const MONTH_KEYS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];

/**
 * Weekday keys for translations
 */
const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/**
 * Represents a day in the calendar grid
 */
interface CalendarDay {
  date: Date;
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWorkDay: boolean;
  isLastWorkDayOfWeek: boolean;
  weekNumber: number;
  tasks: Task[];
  timeEntries: TimeEntry[];
  workedMinutes: number;
  plannedMinutes: number;
  dayOverride?: DayOverride;
}

/**
 * Represents a week summary
 */
interface WeekSummary {
  weekNumber: number;
  workedMinutes: number;
  plannedMinutes: number;
}

/**
 * Calendar component displaying tasks and work hours in a monthly view
 */
@Component({
  selector: 'app-open-calendar',
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    ChipModule,
    TooltipModule,
    TranslateModule,
  ],
  templateUrl: './open-calendar.html',
  styleUrl: './open-calendar.scss',
})
export class OpenCalendar implements OnInit {
  private readonly translate = inject(TranslateService);

  tasks = input<Task[]>([]);
  timeEntries = input<TimeEntry[]>([]);
  monthConfig = input<MonthConfig | null>(null);
  dayOverrides = input<DayOverride[]>([]);
  dayTypes = input<DayType[]>([]);

  timeEntryClicked = output<string>();
  dayClicked = output<Date>();
  settingsClicked = output<void>();
  addTimeClicked = output<Date>();
  monthChanged = output<Date>();

  currentDate = signal(new Date());
  weekDays = signal<string[]>([]);
  monthYearLabel = signal<string>('');

  /**
   * Computes total worked minutes for the current month
   */
  monthWorkedMinutes = computed(() => {
    const days = this.calendarDays();
    return days
      .filter((d) => d.isCurrentMonth)
      .reduce((sum, d) => sum + d.workedMinutes, 0);
  });

  /**
   * Computes total planned minutes for the current month
   */
  monthPlannedMinutes = computed(() => {
    const days = this.calendarDays();
    return days
      .filter((d) => d.isCurrentMonth)
      .reduce((sum, d) => sum + d.plannedMinutes, 0);
  });

  /**
   * Computes balance (worked - planned) for the current month
   */
  monthBalance = computed(() => {
    return this.monthWorkedMinutes() - this.monthPlannedMinutes();
  });

  /**
   * Computes weekly summaries for the calendar indexed by week number
   */
  weekSummaries = computed(() => {
    const days = this.calendarDays();
    const summaries: Record<number, WeekSummary> = {};

    for (const day of days) {
      if (!summaries[day.weekNumber]) {
        summaries[day.weekNumber] = {
          weekNumber: day.weekNumber,
          workedMinutes: 0,
          plannedMinutes: 0,
        };
      }
      summaries[day.weekNumber].workedMinutes += day.workedMinutes;
      summaries[day.weekNumber].plannedMinutes += day.plannedMinutes;
    }

    return summaries;
  });

  /**
   * Generates the calendar grid with days and tasks
   */
  calendarDays = computed(() => {
    const date = this.currentDate();
    const tasks = this.tasks();
    const entries = this.timeEntries();
    const config = this.monthConfig();
    const overrides = this.dayOverrides();
    return this.generateCalendarDays(date, tasks, entries, config, overrides);
  });

  ngOnInit(): void {
    this.initializeWeekDays();
    this.updateMonthYearLabel();
    this.translate.onLangChange.subscribe(() => {
      this.initializeWeekDays();
      this.updateMonthYearLabel();
    });
  }

  /**
   * Updates the month/year label with translated month name
   */
  private updateMonthYearLabel(): void {
    const date = this.currentDate();
    const monthKey = MONTH_KEYS[date.getMonth()];
    const year = date.getFullYear();
    const monthName = this.translate.instant(`calendar.months.${monthKey}`);
    this.monthYearLabel.set(`${monthName} ${year}`);
  }

  /**
   * Initializes week day names based on current language
   */
  private initializeWeekDays(): void {
    const days = WEEKDAY_KEYS.map((key) =>
      this.translate.instant(`calendar.weekdays.${key}`),
    );
    this.weekDays.set(days);
  }

  /**
   * Generates calendar days for the given month with weekly auto-adjustment
   */
  private generateCalendarDays(
    date: Date,
    tasks: Task[],
    entries: TimeEntry[],
    config: MonthConfig | null,
    overrides: DayOverride[],
  ): CalendarDay[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();

    const workDaysArray = config?.workDays
      ?.split(',')
      .map((d) => parseInt(d, 10)) || [1, 2, 3, 4, 5];
    const weeklyMinutes = config?.weeklyMinutes || 2400;
    const daySchedule: DaySchedule = config?.daySchedule
      ? JSON.parse(config.daySchedule)
      : { '1': 480, '2': 480, '3': 480, '4': 480, '5': 480 };

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const daysInMonth = lastDayOfMonth.getDate();
    const days: CalendarDay[] = [];

    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();

    // Generate all days first without planned minutes
    const allDays: {
      dayDate: Date;
      dateString: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      dayOfWeek: number;
      override?: DayOverride;
      isWorkDay: boolean;
    }[] = [];

    // Previous month days
    for (let i = startDay - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const dayDate = new Date(year, month - 1, dayNum);
      const dateString = this.formatDateString(dayDate);
      const dayOfWeek = dayDate.getDay() === 0 ? 7 : dayDate.getDay();
      const override = overrides.find((o) => o.date === dateString);
      const isWorkDay =
        workDaysArray.includes(dayOfWeek) && !override?.dayTypeId;

      allDays.push({
        dayDate,
        dateString,
        dayNumber: dayNum,
        isCurrentMonth: false,
        dayOfWeek,
        override,
        isWorkDay,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      const dateString = this.formatDateString(dayDate);
      const dayOfWeek = dayDate.getDay() === 0 ? 7 : dayDate.getDay();
      const override = overrides.find((o) => o.date === dateString);
      const isWorkDay =
        workDaysArray.includes(dayOfWeek) && !override?.dayTypeId;

      allDays.push({
        dayDate,
        dateString,
        dayNumber: i,
        isCurrentMonth: true,
        dayOfWeek,
        override,
        isWorkDay,
      });
    }

    // Next month days
    const remainingDays = 42 - allDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      const dayDate = new Date(year, month + 1, i);
      const dateString = this.formatDateString(dayDate);
      const dayOfWeek = dayDate.getDay() === 0 ? 7 : dayDate.getDay();
      const override = overrides.find((o) => o.date === dateString);
      const isWorkDay =
        workDaysArray.includes(dayOfWeek) && !override?.dayTypeId;

      allDays.push({
        dayDate,
        dateString,
        dayNumber: i,
        isCurrentMonth: false,
        dayOfWeek,
        override,
        isWorkDay,
      });
    }

    // Process days in weekly chunks with auto-adjustment
    for (let weekStart = 0; weekStart < allDays.length; weekStart += 7) {
      const weekDays = allDays.slice(weekStart, weekStart + 7);
      const weekNumber = Math.floor(weekStart / 7);

      // Find work days and last work day in this week

      const lastWorkDayIndex = this.findLastWorkDayIndex(weekDays);

      // Calculate effective weekly target (subtract day override minutes)
      let effectiveWeeklyMinutes = weeklyMinutes;
      for (const day of weekDays) {
        if (
          !day.isWorkDay &&
          day.override?.dayType?.defaultMinutes !== undefined
        ) {
          effectiveWeeklyMinutes -= day.override.dayType.defaultMinutes;
        } else if (
          !day.isWorkDay &&
          day.override?.minutes !== null &&
          day.override?.minutes !== undefined
        ) {
          effectiveWeeklyMinutes -= day.override.minutes;
        }
      }

      // Calculate minutes already allocated (excluding last work day)
      let allocatedMinutes = 0;
      for (let i = 0; i < weekDays.length; i++) {
        const day = weekDays[i];
        if (day.isWorkDay && i !== lastWorkDayIndex) {
          if (
            day.override?.minutes !== null &&
            day.override?.minutes !== undefined
          ) {
            allocatedMinutes += day.override.minutes;
          } else if (day.override?.dayType?.defaultMinutes !== undefined) {
            allocatedMinutes += day.override.dayType.defaultMinutes;
          } else {
            allocatedMinutes += daySchedule[String(day.dayOfWeek)] || 480;
          }
        }
      }

      // Build CalendarDay objects
      for (let i = 0; i < weekDays.length; i++) {
        const day = weekDays[i];
        const isLastWorkDay = i === lastWorkDayIndex;

        let plannedMinutes = 0;
        if (
          day.override?.minutes !== null &&
          day.override?.minutes !== undefined
        ) {
          plannedMinutes = day.override.minutes;
        } else if (day.override?.dayType?.defaultMinutes !== undefined) {
          plannedMinutes = day.override.dayType.defaultMinutes;
        } else if (day.isWorkDay) {
          if (isLastWorkDay) {
            // Auto-adjust last work day to complete effective weekly target
            plannedMinutes = Math.max(
              0,
              effectiveWeeklyMinutes - allocatedMinutes,
            );
          } else {
            plannedMinutes = daySchedule[String(day.dayOfWeek)] || 480;
          }
        }

        days.push({
          date: day.dayDate,
          dateString: day.dateString,
          dayNumber: day.dayNumber,
          isCurrentMonth: day.isCurrentMonth,
          isToday: this.isSameDay(day.dayDate, today),
          isWorkDay: day.isWorkDay,
          isLastWorkDayOfWeek: isLastWorkDay,
          weekNumber,
          tasks: this.getTasksForDate(day.dateString, tasks, entries),
          timeEntries: this.getTimeEntriesForDate(day.dateString, entries),
          workedMinutes: this.getWorkedMinutesForDate(day.dateString, entries),
          plannedMinutes,
          dayOverride: day.override,
        });
      }
    }

    return days;
  }

  /**
   * Finds the index of the last work day in a week
   */
  private findLastWorkDayIndex(
    weekDays: { dayOfWeek: number; isWorkDay: boolean }[],
  ): number {
    // Find the highest day number that is a work day in this week
    let lastIndex = -1;
    for (let i = weekDays.length - 1; i >= 0; i--) {
      if (weekDays[i].isWorkDay) {
        lastIndex = i;
        break;
      }
    }
    return lastIndex;
  }

  /**
   * Formats a date to YYYY-MM-DD string
   */
  private formatDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Gets worked minutes for a specific date
   */
  private getWorkedMinutesForDate(
    dateString: string,
    entries: TimeEntry[],
  ): number {
    return entries
      .filter((e) => e.date === dateString)
      .reduce((sum, e) => sum + e.minutes, 0);
  }

  /**
   * Checks if two dates are the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Gets tasks that have time entries for a specific date
   */
  private getTasksForDate(
    dateString: string,
    tasks: Task[],
    entries: TimeEntry[],
  ): Task[] {
    const taskIdsWithEntries = entries
      .filter((e) => e.date === dateString && e.taskId)
      .map((e) => e.taskId);

    const uniqueTaskIds = [...new Set(taskIdsWithEntries)];

    return tasks.filter((task) => uniqueTaskIds.includes(task.id));
  }

  /**
   * Gets time entries for a specific date
   */
  private getTimeEntriesForDate(
    dateString: string,
    entries: TimeEntry[],
  ): TimeEntry[] {
    return entries.filter((e) => e.date === dateString);
  }

  /**
   * Navigates to previous month
   */
  previousMonth(): void {
    const current = this.currentDate();
    const newDate = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    this.currentDate.set(newDate);
    this.updateMonthYearLabel();
    this.monthChanged.emit(newDate);
  }

  /**
   * Navigates to next month
   */
  nextMonth(): void {
    const current = this.currentDate();
    const newDate = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    this.currentDate.set(newDate);
    this.updateMonthYearLabel();
    this.monthChanged.emit(newDate);
  }

  /**
   * Navigates to today
   */
  goToToday(): void {
    const newDate = new Date();
    this.currentDate.set(newDate);
    this.updateMonthYearLabel();
    this.monthChanged.emit(newDate);
  }

  /**
   * Handles time entry click event
   */
  onTimeEntryClick(timeEntryId: string, event: Event): void {
    event.stopPropagation();
    this.timeEntryClicked.emit(timeEntryId);
  }

  /**
   * Handles day click event
   */
  onDayClick(day: CalendarDay): void {
    this.dayClicked.emit(day.date);
  }

  /**
   * Gets severity color for task status
   */
  getStatusSeverity(
    statusName?: string,
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (statusName) {
      case 'Completada':
      case 'Completed':
        return 'success';
      case 'En progreso':
      case 'In Progress':
        return 'info';
      case 'Pendiente':
      case 'Pending':
        return 'warn';
      case 'Bloqueada':
      case 'Blocked':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  /**
   * Gets status color class for task
   */
  getStatusColor(statusName?: string): string {
    switch (statusName) {
      case 'Completada':
      case 'Completed':
        return 'status-completed';
      case 'En progreso':
      case 'In Progress':
        return 'status-progress';
      case 'Pendiente':
      case 'Pending':
        return 'status-pending';
      case 'Bloqueada':
      case 'Blocked':
        return 'status-blocked';
      default:
        return 'status-default';
    }
  }

  /**
   * Formats minutes to human readable string
   */
  formatTime(minutes: number): string {
    return formatMinutes(minutes);
  }

  /**
   * Gets worked minutes for a specific week
   */
  getWeekWorked(weekNumber: number): number {
    return this.weekSummaries()[weekNumber]?.workedMinutes || 0;
  }

  /**
   * Gets planned minutes for a specific week
   */
  getWeekPlanned(weekNumber: number): number {
    return this.weekSummaries()[weekNumber]?.plannedMinutes || 0;
  }

  /**
   * Checks if week is complete (worked >= planned)
   */
  isWeekComplete(weekNumber: number): boolean {
    const summary = this.weekSummaries()[weekNumber];
    if (!summary) return false;
    return (
      summary.workedMinutes >= summary.plannedMinutes &&
      summary.plannedMinutes > 0
    );
  }

  /**
   * Checks if week is over (worked > planned)
   */
  isWeekOver(weekNumber: number): boolean {
    const summary = this.weekSummaries()[weekNumber];
    if (!summary) return false;
    return (
      summary.workedMinutes > summary.plannedMinutes &&
      summary.plannedMinutes > 0
    );
  }

  /**
   * Gets balance class based on positive/negative value
   */
  getBalanceClass(balance: number): string {
    if (balance > 0) return 'balance-positive';
    if (balance < 0) return 'balance-negative';
    return 'balance-neutral';
  }

  /**
   * Gets day type color for a day override
   */
  getDayTypeColor(day: CalendarDay): string | null {
    return day.dayOverride?.dayType?.color || null;
  }

  /**
   * Handles settings button click
   */
  onSettingsClick(event: Event): void {
    event.stopPropagation();
    this.settingsClicked.emit();
  }

  /**
   * Handles add time button click for a specific day
   */
  onAddTimeClick(day: CalendarDay, event: Event): void {
    event.stopPropagation();
    this.addTimeClicked.emit(day.date);
  }
}
