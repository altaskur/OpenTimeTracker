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
import { Task } from '../../../types/electron';

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
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

/**
 * Calendar component displaying tasks in a monthly view
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
  taskClicked = output<Task>();
  dayClicked = output<Date>();

  currentDate = signal(new Date());
  weekDays = signal<string[]>([]);
  monthYearLabel = signal<string>('');

  /**
   * Generates the calendar grid with days and tasks
   */
  calendarDays = computed(() => {
    const date = this.currentDate();
    const tasks = this.tasks();
    return this.generateCalendarDays(date, tasks);
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
   * Generates calendar days for the given month
   */
  private generateCalendarDays(date: Date, tasks: Task[]): CalendarDay[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const daysInMonth = lastDayOfMonth.getDate();
    const days: CalendarDay[] = [];

    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();

    for (let i = startDay - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const dayDate = new Date(year, month - 1, dayNum);
      days.push({
        date: dayDate,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: this.isSameDay(dayDate, today),
        tasks: this.getTasksForDate(dayDate, tasks),
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      days.push({
        date: dayDate,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: this.isSameDay(dayDate, today),
        tasks: this.getTasksForDate(dayDate, tasks),
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const dayDate = new Date(year, month + 1, i);
      days.push({
        date: dayDate,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: this.isSameDay(dayDate, today),
        tasks: this.getTasksForDate(dayDate, tasks),
      });
    }

    return days;
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
   * Gets tasks for a specific date based on createdAt
   */
  private getTasksForDate(date: Date, tasks: Task[]): Task[] {
    return tasks.filter((task) => {
      if (!task.createdAt) return false;
      const taskDate = new Date(task.createdAt);
      return this.isSameDay(taskDate, date);
    });
  }

  /**
   * Navigates to previous month
   */
  previousMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(
      new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
    this.updateMonthYearLabel();
  }

  /**
   * Navigates to next month
   */
  nextMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(
      new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
    this.updateMonthYearLabel();
  }

  /**
   * Navigates to today
   */
  goToToday(): void {
    this.currentDate.set(new Date());
    this.updateMonthYearLabel();
  }

  /**
   * Handles task click event
   */
  onTaskClick(task: Task, event: Event): void {
    event.stopPropagation();
    this.taskClicked.emit(task);
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
}
