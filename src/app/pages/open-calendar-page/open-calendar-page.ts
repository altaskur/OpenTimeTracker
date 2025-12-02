import { Component, OnInit, inject, signal, effect } from '@angular/core';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { OpenLayoutComponent } from '../../components/open-layout/open-layout';
import { OpenCalendar } from '../../components/open-calendar/open-calendar';
import { OpenWorkConfigDialogComponent } from '../../components/open-work-config-dialog/open-work-config-dialog';
import { OpenTimeEntryDialogComponent } from '../../components/open-time-entry-dialog/open-time-entry-dialog';
import { OpenDayOverrideDialogComponent } from '../../components/open-day-override-dialog/open-day-override-dialog';
import { OpenDayTypesDialogComponent } from '../../components/open-day-types-dialog/open-day-types-dialog';
import { OpenConfirmDeleteComponent } from '../../components/open-confirm-delete/open-confirm-delete';
import { DatabaseService } from '../../services';
import { ActionHistoryService } from '../../services/action-history.service';
import {
  Task,
  TimeEntry,
  MonthConfig,
  DayOverride,
  DayType,
} from '../../../types/electron';

/**
 * Calendar page component displaying monthly calendar with tasks
 */
@Component({
  selector: 'app-open-calendar-page',
  imports: [
    OpenLayoutComponent,
    OpenCalendar,
    OpenWorkConfigDialogComponent,
    OpenTimeEntryDialogComponent,
    OpenDayOverrideDialogComponent,
    OpenDayTypesDialogComponent,
    OpenConfirmDeleteComponent,
    ToastModule,
    TranslateModule,
  ],
  providers: [MessageService],
  templateUrl: './open-calendar-page.html',
  styleUrl: './open-calendar-page.scss',
})
export class OpenCalendarPage implements OnInit {
  private readonly dbService = inject(DatabaseService);
  private readonly historyService = inject(ActionHistoryService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  constructor() {
    effect(() => {
      const change = this.historyService.dataChanged();
      if (
        change.timestamp > 0 &&
        ['TimeEntry', 'DayOverride', 'MonthConfig', 'DayType'].includes(
          change.entityType,
        )
      ) {
        void this.loadData();
      }
    });
  }

  tasks = signal<Task[]>([]);
  timeEntries = signal<TimeEntry[]>([]);
  monthConfig = signal<MonthConfig | null>(null);
  dayOverrides = signal<DayOverride[]>([]);
  dayTypes = signal<DayType[]>([]);
  loading = signal(false);
  currentMonth = signal(new Date());

  showConfigDialog = signal(false);
  showTimeEntryDialog = signal(false);
  showDayOverrideDialog = signal(false);
  showDayTypesDialog = signal(false);
  showDeleteConfirm = signal(false);
  selectedDate = signal<Date>(new Date());
  editingTimeEntry = signal<TimeEntry | null>(null);
  editingDayOverride = signal<DayOverride | null>(null);

  ngOnInit(): void {
    void this.loadData();
  }

  /**
   * Loads all data from database
   */
  async loadData(): Promise<void> {
    this.loading.set(true);
    try {
      const month = this.currentMonth();
      const [tasks, timeEntries, monthConfig, dayOverrides, dayTypes] =
        await Promise.all([
          this.dbService.getTasks(),
          this.dbService.getTimeEntries(),
          this.dbService.getMonthConfig(
            month.getFullYear(),
            month.getMonth() + 1,
          ),
          this.dbService.getDayOverrides(),
          this.dbService.getDayTypes(),
        ]);

      this.tasks.set(tasks);
      this.timeEntries.set(timeEntries);
      this.monthConfig.set(monthConfig);
      this.dayOverrides.set(dayOverrides);
      this.dayTypes.set(dayTypes);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Handles month change from calendar
   */
  onMonthChanged(date: Date): void {
    this.currentMonth.set(date);
    void this.loadMonthConfig(date.getFullYear(), date.getMonth() + 1);
  }

  /**
   * Loads month config for specific year/month
   */
  async loadMonthConfig(year: number, month: number): Promise<void> {
    const config = await this.dbService.getMonthConfig(year, month);
    this.monthConfig.set(config);
  }

  /**
   * Handles time entry click from calendar - opens edit dialog
   */
  onTimeEntryClicked(timeEntryId: string): void {
    const entry = this.timeEntries().find((e) => e.id === timeEntryId);
    if (entry) {
      this.editingTimeEntry.set(entry);
      this.selectedDate.set(new Date(entry.date));
      this.showTimeEntryDialog.set(true);
    }
  }

  /**
   * Handles day click from calendar - opens day override dialog
   */
  onDayClicked(date: Date): void {
    this.selectedDate.set(date);
    const dateString = this.formatDateString(date);
    const existingOverride = this.dayOverrides().find(
      (o) => o.date === dateString,
    );
    this.editingDayOverride.set(existingOverride || null);
    this.showDayOverrideDialog.set(true);
  }

  /**
   * Handles settings button click
   */
  onSettingsClicked(): void {
    this.showConfigDialog.set(true);
  }

  /**
   * Handles add time button click
   */
  onAddTimeClicked(date: Date): void {
    this.editingTimeEntry.set(null);
    this.selectedDate.set(date);
    this.showTimeEntryDialog.set(true);
  }

  /**
   * Handles work config save
   */
  async onConfigSaved(data: {
    weeklyMinutes: number;
    workDays: string;
    daySchedule: string;
  }): Promise<void> {
    try {
      const month = this.currentMonth();
      const config = await this.dbService.updateMonthConfig(
        month.getFullYear(),
        month.getMonth() + 1,
        {
          weeklyMinutes: data.weeklyMinutes,
          workDays: data.workDays,
          daySchedule: data.daySchedule,
        },
      );
      this.monthConfig.set(config);
      this.showConfigDialog.set(false);
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('common.success'),
        detail: this.translate.instant('toast.configSaved'),
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('common.error'),
        detail: this.translate.instant('toast.configError'),
      });
    }
  }

  /**
   * Handles config dialog cancel
   */
  onConfigCancelled(): void {
    this.showConfigDialog.set(false);
  }

  /**
   * Handles time entry save (create or update)
   */
  async onTimeEntrySaved(data: {
    taskId: string | null;
    date: Date;
    minutes: number;
    notes: string | null;
  }): Promise<void> {
    try {
      const year = data.date.getFullYear();
      const month = String(data.date.getMonth() + 1).padStart(2, '0');
      const day = String(data.date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const existingEntry = this.editingTimeEntry();
      if (existingEntry) {
        const previousData = { ...existingEntry };
        await this.historyService.execute({
          entityType: 'TimeEntry',
          actionType: 'update',
          entityId: existingEntry.id,
          description: this.translate.instant(
            'history.actions.updateTimeEntry',
          ),
          previousData,
          newData: {
            date: dateString,
            minutes: data.minutes,
            taskId: data.taskId,
            notes: data.notes,
          },
          execute: async () => {
            await this.dbService.updateTimeEntry(existingEntry.id, {
              date: dateString,
              minutes: data.minutes,
              taskId: data.taskId,
              notes: data.notes,
            });
          },
          undo: async () => {
            await this.dbService.updateTimeEntry(existingEntry.id, {
              date: previousData.date,
              minutes: previousData.minutes,
              taskId: previousData.taskId,
              notes: previousData.notes,
            });
            await this.loadData();
          },
        });
      } else {
        let createdId: string | null = null;
        await this.historyService.execute({
          entityType: 'TimeEntry',
          actionType: 'create',
          entityId: '',
          description: this.translate.instant(
            'history.actions.createTimeEntry',
          ),
          previousData: null,
          newData: {
            date: dateString,
            minutes: data.minutes,
            taskId: data.taskId,
            notes: data.notes,
          },
          execute: async () => {
            const created = await this.dbService.createTimeEntry(
              dateString,
              data.minutes,
              data.taskId ?? undefined,
              data.notes ?? undefined,
            );
            createdId = created.id;
          },
          undo: async () => {
            if (createdId) {
              await this.dbService.deleteTimeEntry(createdId);
              await this.loadData();
            }
          },
        });
      }

      await this.loadData();
      this.showTimeEntryDialog.set(false);
      this.editingTimeEntry.set(null);
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('common.success'),
        detail: this.translate.instant('toast.timeEntrySaved'),
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('common.error'),
        detail: this.translate.instant('toast.timeEntryError'),
      });
    }
  }

  /**
   * Handles time entry dialog cancel
   */
  onTimeEntryCancelled(): void {
    this.showTimeEntryDialog.set(false);
    this.editingTimeEntry.set(null);
  }

  /**
   * Handles time entry delete request from dialog
   */
  onTimeEntryDeleted(): void {
    this.showDeleteConfirm.set(true);
  }

  /**
   * Handles delete confirmation
   */
  async onDeleteConfirmed(): Promise<void> {
    const entry = this.editingTimeEntry();
    if (!entry) return;

    try {
      const previousData = { ...entry };
      await this.historyService.execute({
        entityType: 'TimeEntry',
        actionType: 'delete',
        entityId: entry.id,
        description: this.translate.instant('history.actions.deleteTimeEntry'),
        previousData,
        newData: null,
        execute: async () => {
          await this.dbService.deleteTimeEntry(entry.id);
        },
        undo: async () => {
          await this.dbService.createTimeEntry(
            previousData.date,
            previousData.minutes,
            previousData.taskId ?? undefined,
            previousData.notes ?? undefined,
          );
          await this.loadData();
        },
      });
      await this.loadData();
      this.showDeleteConfirm.set(false);
      this.showTimeEntryDialog.set(false);
      this.editingTimeEntry.set(null);
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('common.success'),
        detail: this.translate.instant('toast.timeEntryDeleted'),
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('common.error'),
        detail: this.translate.instant('toast.timeEntryDeleteError'),
      });
    }
  }

  /**
   * Handles delete cancellation
   */
  onDeleteCancelled(): void {
    this.showDeleteConfirm.set(false);
  }

  /**
   * Handles day override save
   */
  async onDayOverrideSaved(data: {
    dates: Date[];
    dayTypeId: string | null;
    minutes: number | null;
    note: string | null;
  }): Promise<void> {
    try {
      const existingOverride = this.editingDayOverride();
      const dateStrings = data.dates.map((d) => this.formatDateString(d));

      if (existingOverride) {
        const previousData = { ...existingOverride };
        await this.historyService.execute({
          entityType: 'DayOverride',
          actionType: 'update',
          entityId: existingOverride.date,
          description: this.translate.instant(
            'history.actions.updateDayOverride',
          ),
          previousData,
          newData: {
            dayTypeId: data.dayTypeId,
            minutes: data.minutes,
            note: data.note,
          },
          execute: async () => {
            await this.dbService.upsertDayOverride(
              existingOverride.date,
              data.dayTypeId ?? undefined,
              data.minutes ?? undefined,
              data.note ?? undefined,
            );
          },
          undo: async () => {
            await this.dbService.upsertDayOverride(
              previousData.date,
              previousData.dayTypeId ?? undefined,
              previousData.minutes ?? undefined,
              previousData.note ?? undefined,
            );
            await this.loadData();
          },
        });
      } else {
        await this.historyService.execute({
          entityType: 'DayOverride',
          actionType: 'create',
          entityId: dateStrings.join(','),
          description: this.translate.instant(
            'history.actions.createDayOverride',
          ),
          previousData: null,
          newData: {
            dates: dateStrings,
            dayTypeId: data.dayTypeId,
            minutes: data.minutes,
            note: data.note,
          },
          execute: async () => {
            for (const dateString of dateStrings) {
              await this.dbService.upsertDayOverride(
                dateString,
                data.dayTypeId ?? undefined,
                data.minutes ?? undefined,
                data.note ?? undefined,
              );
            }
          },
          undo: async () => {
            for (const dateString of dateStrings) {
              await this.dbService.deleteDayOverride(dateString);
            }
            await this.loadData();
          },
        });
      }

      await this.loadData();
      this.showDayOverrideDialog.set(false);
      this.editingDayOverride.set(null);
      const messageKey =
        data.dates.length > 1
          ? 'toast.dayOverridesSaved'
          : 'toast.dayOverrideSaved';
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('common.success'),
        detail: this.translate.instant(messageKey),
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('common.error'),
        detail: this.translate.instant('toast.dayOverrideError'),
      });
    }
  }

  /**
   * Handles day override cancel
   */
  onDayOverrideCancelled(): void {
    this.showDayOverrideDialog.set(false);
    this.editingDayOverride.set(null);
  }

  /**
   * Handles day override delete
   */
  async onDayOverrideDeleted(): Promise<void> {
    const override = this.editingDayOverride();
    if (!override) return;

    try {
      const previousData = { ...override };
      await this.historyService.execute({
        entityType: 'DayOverride',
        actionType: 'delete',
        entityId: override.date,
        description: this.translate.instant(
          'history.actions.deleteDayOverride',
        ),
        previousData,
        newData: null,
        execute: async () => {
          await this.dbService.deleteDayOverride(override.date);
        },
        undo: async () => {
          await this.dbService.upsertDayOverride(
            previousData.date,
            previousData.dayTypeId ?? undefined,
            previousData.minutes ?? undefined,
            previousData.note ?? undefined,
          );
          await this.loadData();
        },
      });
      await this.loadData();
      this.showDayOverrideDialog.set(false);
      this.editingDayOverride.set(null);
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('common.success'),
        detail: this.translate.instant('toast.dayOverrideDeleted'),
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('common.error'),
        detail: this.translate.instant('toast.dayOverrideDeleteError'),
      });
    }
  }

  /**
   * Formats a Date to YYYY-MM-DD string
   */
  private formatDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ==================== DAY TYPES CRUD ====================

  /**
   * Opens the day types management dialog
   */
  onManageDayTypes(): void {
    this.showDayTypesDialog.set(true);
  }

  /**
   * Closes the day types dialog
   */
  onDayTypesDialogClosed(): void {
    this.showDayTypesDialog.set(false);
  }

  /**
   * Creates a new day type
   */
  async onDayTypeCreated(data: {
    name: string;
    color: string;
    defaultMinutes: number;
  }): Promise<void> {
    try {
      await this.dbService.createDayType(
        data.name,
        data.color,
        data.defaultMinutes,
      );
      const dayTypes = await this.dbService.getDayTypes();
      this.dayTypes.set(dayTypes);
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('common.success'),
        detail: this.translate.instant('toast.dayTypeCreated'),
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('common.error'),
        detail: this.translate.instant('toast.dayTypeError'),
      });
    }
  }

  /**
   * Updates an existing day type
   */
  async onDayTypeUpdated(data: {
    id: string;
    name: string;
    color: string;
    defaultMinutes: number;
  }): Promise<void> {
    try {
      await this.dbService.updateDayType(data.id, {
        name: data.name,
        color: data.color,
        defaultMinutes: data.defaultMinutes,
      });
      const dayTypes = await this.dbService.getDayTypes();
      this.dayTypes.set(dayTypes);
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('common.success'),
        detail: this.translate.instant('toast.dayTypeUpdated'),
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('common.error'),
        detail: this.translate.instant('toast.dayTypeError'),
      });
    }
  }

  /**
   * Deletes a day type
   */
  async onDayTypeDeleted(id: string): Promise<void> {
    try {
      await this.dbService.deleteDayType(id);
      const dayTypes = await this.dbService.getDayTypes();
      this.dayTypes.set(dayTypes);
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('common.success'),
        detail: this.translate.instant('toast.dayTypeDeleted'),
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('common.error'),
        detail: this.translate.instant('toast.dayTypeDeleteError'),
      });
    }
  }
}
