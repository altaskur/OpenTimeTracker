import { Component, OnInit, inject, signal, computed } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OpenLayoutComponent } from '../../components/open-layout/open-layout';
import { DatabaseService } from '../../services';
import { StatsCard } from './components/stats-card/stats-card';
import { TaskCard } from './components/task-card/task-card';
import { ProjectCard } from './components/project-card/project-card';
import {
  Task,
  Project,
  MonthConfig,
  DayOverride,
} from '../../../types/electron';

/**
 * Statistics for time tracking display
 */
interface TimeStats {
  /** Minutes worked today */
  todayWorked: number;
  /** Target minutes for today */
  todayTarget: number;
  /** Minutes remaining today */
  todayRemaining: number;
  /** Minutes worked this week */
  weekWorked: number;
  /** Target minutes for this week */
  weekTarget: number;
  /** Minutes remaining this week */
  weekRemaining: number;
  /** Number of unique tasks worked today */
  tasksWorkedToday: number;
}

/**
 * Main home page component displaying pending tasks and daily/weekly stats
 */
@Component({
  selector: 'app-open-home',
  imports: [
    CardModule,
    ButtonModule,
    OpenLayoutComponent,
    TranslateModule,
    StatsCard,
    TaskCard,
    ProjectCard,
  ],
  templateUrl: './open-home.html',
  styleUrl: './open-home.scss',
})
export class OpenHome implements OnInit {
  private readonly router = inject(Router);
  private readonly dbService = inject(DatabaseService);

  pendingTasks = signal<Task[]>([]);
  openProjects = signal<Project[]>([]);
  loading = signal(false);
  stats = signal<TimeStats>({
    todayWorked: 0,
    todayTarget: 0,
    todayRemaining: 0,
    weekWorked: 0,
    weekTarget: 0,
    weekRemaining: 0,
    tasksWorkedToday: 0,
  });

  /**
   * Progress percentage for today (capped at 100)
   */
  todayProgress = computed(() => {
    const s = this.stats();
    if (s.todayTarget === 0) return 0;
    return Math.min(100, Math.round((s.todayWorked / s.todayTarget) * 100));
  });

  /**
   * Progress percentage for the week (capped at 100)
   */
  weekProgress = computed(() => {
    const s = this.stats();
    if (s.weekTarget === 0) return 0;
    return Math.min(100, Math.round((s.weekWorked / s.weekTarget) * 100));
  });

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadPendingTasks(),
      this.loadOpenProjects(),
      this.loadStats(),
    ]);
  }

  /**
   * Loads open (not closed) projects
   */
  async loadOpenProjects(): Promise<void> {
    try {
      const projects = await this.dbService.getProjects();
      const openOnly = projects.filter((p) => !p.isClosed);
      this.openProjects.set(openOnly);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }

  async loadPendingTasks(): Promise<void> {
    this.loading.set(true);
    try {
      const tasks = await this.dbService.getTasks();
      const pendingOnly = tasks.filter(
        (task) =>
          task.status?.name !== 'status.completed' &&
          task.status?.name !== 'Completada' &&
          task.status?.name !== 'Completed',
      );
      this.pendingTasks.set(pendingOnly);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Loads time statistics for today and this week
   */
  async loadStats(): Promise<void> {
    try {
      const today = new Date();
      const todayStr = this.formatDate(today);

      const { weekStart, weekEnd } = this.getWeekBounds(today);
      const weekStartStr = this.formatDate(weekStart);
      const weekEndStr = this.formatDate(weekEnd);

      const [todayEntries, weekEntries, monthConfig, dayOverrides] =
        await Promise.all([
          this.dbService.getTimeEntriesByDate(todayStr),
          this.dbService.getTimeEntriesByDateRange(weekStartStr, weekEndStr),
          this.dbService.getMonthConfig(
            today.getFullYear(),
            today.getMonth() + 1,
          ),
          this.dbService.getDayOverrides(weekStartStr, weekEndStr),
        ]);

      const todayWorked = todayEntries.reduce((sum, e) => sum + e.minutes, 0);
      const weekWorked = weekEntries.reduce((sum, e) => sum + e.minutes, 0);

      const todayTarget = this.getDayTarget(today, monthConfig, dayOverrides);
      const weekTarget = this.getWeekTarget(
        weekStart,
        weekEnd,
        monthConfig,
        dayOverrides,
      );

      const uniqueTasksToday = new Set(
        todayEntries.filter((e) => e.taskId).map((e) => e.taskId),
      );

      this.stats.set({
        todayWorked,
        todayTarget,
        todayRemaining: Math.max(0, todayTarget - todayWorked),
        weekWorked,
        weekTarget,
        weekRemaining: Math.max(0, weekTarget - weekWorked),
        tasksWorkedToday: uniqueTasksToday.size,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  /**
   * Formats a Date to YYYY-MM-DD string
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Gets the start (Monday) and end (Sunday) of the week containing the date
   */
  private getWeekBounds(date: Date): { weekStart: Date; weekEnd: Date } {
    const d = new Date(date);
    const dayOfWeek = d.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() + diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return { weekStart, weekEnd };
  }

  /**
   * Counts work days in the week from config
   */
  private getWorkDaysCount(monthConfig: MonthConfig): number {
    try {
      const workDays = JSON.parse(monthConfig.workDays);
      return Array.isArray(workDays) ? workDays.length : 5;
    } catch {
      return 5;
    }
  }

  /**
   * Checks if a day of week is a work day
   */
  private isWorkDay(dayOfWeek: number, monthConfig: MonthConfig): boolean {
    try {
      const workDays = JSON.parse(monthConfig.workDays);
      return Array.isArray(workDays) && workDays.includes(dayOfWeek);
    } catch {
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    }
  }

  /**
   * Gets target minutes for a specific day
   */
  private getDayTarget(
    date: Date,
    monthConfig: MonthConfig,
    dayOverrides: DayOverride[],
  ): number {
    const dateStr = this.formatDate(date);
    const override = dayOverrides.find((o) => o.date === dateStr);

    if (override) {
      return override.minutes ?? 0;
    }

    const dayOfWeek = date.getDay();
    if (!this.isWorkDay(dayOfWeek, monthConfig)) {
      return 0;
    }

    const workDaysCount = this.getWorkDaysCount(monthConfig);
    return workDaysCount > 0
      ? Math.round(monthConfig.weeklyMinutes / workDaysCount)
      : 0;
  }

  /**
   * Gets total target minutes for a week range
   */
  private getWeekTarget(
    weekStart: Date,
    weekEnd: Date,
    monthConfig: MonthConfig,
    dayOverrides: DayOverride[],
  ): number {
    let total = 0;
    const current = new Date(weekStart);

    while (current <= weekEnd) {
      total += this.getDayTarget(current, monthConfig, dayOverrides);
      current.setDate(current.getDate() + 1);
    }

    return total;
  }

  /**
   * Formats minutes to hours and minutes string
   */
  formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  }

  goToTasks(): void {
    this.router.navigate(['/tasks']);
  }

  goToProjects(): void {
    this.router.navigate(['/projects']);
  }

  goToCalendar(): void {
    this.router.navigate(['/calendar']);
  }
}
