import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';

import { OpenLayoutComponent } from '../../components/open-layout/open-layout';
import { DatabaseService } from '../../services';
import { ActionHistoryService } from '../../services/action-history.service';
import { ActionHistory, Task } from '../../../types/electron';

/**
 * History page component displaying the last 10 actions with undo/redo capabilities.
 * Accessible only from Electron menu.
 */
@Component({
  selector: 'app-open-history',
  imports: [
    OpenLayoutComponent,
    ToastModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    DialogModule,
    DividerModule,
    TranslateModule,
    DatePipe,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './open-history.html',
  styleUrl: './open-history.scss',
})
export class OpenHistory implements OnInit {
  private readonly dbService = inject(DatabaseService);
  private readonly historyService = inject(ActionHistoryService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translate = inject(TranslateService);

  /** History records from database */
  historyRecords = signal<ActionHistory[]>([]);

  /** Loading state */
  loading = signal(false);

  /** Whether undo is available */
  readonly canUndo = this.historyService.canUndo;

  /** Whether redo is available */
  readonly canRedo = this.historyService.canRedo;

  /** Number of records */
  readonly recordCount = computed(() => this.historyRecords().length);

  /** Selected record for detail view */
  selectedRecord = signal<ActionHistory | null>(null);

  /** Whether detail dialog is visible */
  showDetailDialog = signal(false);

  /** Map of task IDs to task objects for lookup */
  private readonly tasksMap = signal<Map<string, Task>>(new Map());

  /** Parsed previous data for selected record */
  readonly selectedPreviousData = computed(() => {
    const record = this.selectedRecord();
    if (!record?.previousData) return null;
    try {
      return JSON.parse(record.previousData);
    } catch {
      return record.previousData;
    }
  });

  /** Parsed new data for selected record */
  readonly selectedNewData = computed(() => {
    const record = this.selectedRecord();
    if (!record?.newData) return null;
    try {
      return JSON.parse(record.newData);
    } catch {
      return record.newData;
    }
  });

  constructor() {
    effect(() => {
      const change = this.historyService.dataChanged();
      if (change.timestamp > 0) {
        void this.loadHistory();
      }
    });
  }

  ngOnInit(): void {
    void this.loadHistory();
  }

  /**
   * Loads the last 10 history records from database
   */
  async loadHistory(): Promise<void> {
    this.loading.set(true);
    try {
      const [records, tasks] = await Promise.all([
        this.dbService.getActionHistory(10),
        this.dbService.getTasks(),
      ]);
      this.historyRecords.set(records);

      const taskMap = new Map<string, Task>();
      for (const task of tasks) {
        taskMap.set(task.id, task);
      }
      this.tasksMap.set(taskMap);
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('common.error'),
        detail: this.translate.instant('history.loadError'),
      });
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Executes undo action
   */
  async onUndo(): Promise<void> {
    const action = await this.historyService.undo();
    if (action) {
      this.messageService.add({
        severity: 'info',
        summary: this.translate.instant('history.undone'),
        detail: action.description,
        life: 2000,
      });
      await this.loadHistory();
    }
  }

  /**
   * Executes redo action
   */
  async onRedo(): Promise<void> {
    const action = await this.historyService.redo();
    if (action) {
      this.messageService.add({
        severity: 'info',
        summary: this.translate.instant('history.redone'),
        detail: action.description,
        life: 2000,
      });
      await this.loadHistory();
    }
  }

  /**
   * Clears all history with confirmation
   */
  onClearHistory(): void {
    this.confirmationService.confirm({
      message: this.translate.instant('history.clearConfirmMessage'),
      header: this.translate.instant('history.clearConfirmTitle'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('common.delete'),
      rejectLabel: this.translate.instant('common.cancel'),
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        try {
          await this.dbService.clearActionHistory();
          this.historyService.clear();
          this.historyRecords.set([]);
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('common.success'),
            detail: this.translate.instant('history.cleared'),
          });
        } catch {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('common.error'),
            detail: this.translate.instant('history.clearError'),
          });
        }
      },
    });
  }

  /**
   * Gets icon for action type
   */
  getActionIcon(actionType: string): string {
    switch (actionType) {
      case 'create':
        return 'pi pi-plus';
      case 'update':
        return 'pi pi-pencil';
      case 'delete':
        return 'pi pi-trash';
      default:
        return 'pi pi-circle';
    }
  }

  /**
   * Gets severity for action type tag
   */
  getActionSeverity(
    actionType: string,
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (actionType) {
      case 'create':
        return 'success';
      case 'update':
        return 'info';
      case 'delete':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  /**
   * Gets icon for entity type
   */
  getEntityIcon(entityType: string): string {
    switch (entityType) {
      case 'Project':
        return 'pi pi-folder';
      case 'Task':
        return 'pi pi-check-square';
      case 'TimeEntry':
        return 'pi pi-clock';
      case 'DayOverride':
        return 'pi pi-calendar';
      case 'MonthConfig':
        return 'pi pi-cog';
      case 'Tag':
        return 'pi pi-tag';
      default:
        return 'pi pi-circle';
    }
  }

  /**
   * Gets translated action type label
   */
  getActionLabel(actionType: string): string {
    return this.translate.instant(`history.actionTypes.${actionType}`);
  }

  /**
   * Gets translated entity type label
   */
  getEntityLabel(entityType: string): string {
    return this.translate.instant(`history.entityTypes.${entityType}`);
  }

  /**
   * Opens detail dialog for a record
   */
  onViewDetail(record: ActionHistory): void {
    this.selectedRecord.set(record);
    this.showDetailDialog.set(true);
  }

  /**
   * Closes detail dialog
   */
  onCloseDetail(): void {
    this.showDetailDialog.set(false);
    this.selectedRecord.set(null);
  }

  /**
   * Formats data for display in a user-friendly way
   */
  formatJson(data: unknown): string {
    if (!data) return '-';

    const record = this.selectedRecord();
    if (!record) return JSON.stringify(data, null, 2);

    const formatted = this.formatDataForEntity(
      record.entityType,
      data as Record<string, unknown>,
    );
    return JSON.stringify(formatted, null, 2);
  }

  /**
   * Transforms raw data into user-friendly format based on entity type
   */
  private formatDataForEntity(
    entityType: string,
    data: Record<string, unknown>,
  ): Record<string, unknown> {
    if (!data) return {};

    const formatters: Record<
      string,
      (data: Record<string, unknown>) => Record<string, unknown>
    > = {
      Project: (d) => this.formatProjectData(d),
      Task: (d) => this.formatTaskData(d),
      TimeEntry: (d) => this.formatTimeEntryData(d),
      DayOverride: (d) => this.formatDayOverrideData(d),
      DayType: (d) => this.formatDayTypeData(d),
    };

    const formatter = formatters[entityType];
    return formatter ? formatter(data) : data;
  }

  /**
   * Formats Project entity data
   */
  private formatProjectData(
    data: Record<string, unknown>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (data['name'] !== undefined) {
      result[this.translate.instant('history.fields.name')] = data['name'];
    }
    if (data['description'] !== undefined) {
      result[this.translate.instant('history.fields.description')] =
        data['description'] || '-';
    }
    if (data['isClosed'] !== undefined) {
      result[this.translate.instant('history.fields.status')] = data['isClosed']
        ? this.translate.instant('history.fields.closed')
        : this.translate.instant('history.fields.open');
    }

    return result;
  }

  /**
   * Formats Task entity data
   */
  private formatTaskData(
    data: Record<string, unknown>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (data['name'] !== undefined) {
      result[this.translate.instant('history.fields.name')] = data['name'];
    }
    if (data['description'] !== undefined) {
      result[this.translate.instant('history.fields.description')] =
        data['description'] || '-';
    }
    if (data['estimatedHours'] !== undefined) {
      const hours = data['estimatedHours'] as number | null;
      result[this.translate.instant('history.fields.estimatedHours')] = hours
        ? `${String(hours)} h`
        : '-';
    }

    return result;
  }

  /**
   * Formats TimeEntry entity data
   */
  private formatTimeEntryData(
    data: Record<string, unknown>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (data['taskId'] !== undefined) {
      const taskId = data['taskId'] as string;
      const task = this.tasksMap().get(taskId);
      if (task) {
        const projectPrefix = task.project
          ? `[${task.project.name.substring(0, 3).toUpperCase()}] `
          : '';
        result[this.translate.instant('history.fields.task')] =
          `${projectPrefix}${task.name}`;
      }
    }
    if (data['date'] !== undefined) {
      result[this.translate.instant('history.fields.date')] = data['date'];
    }
    if (data['minutes'] !== undefined) {
      result[this.translate.instant('history.fields.duration')] =
        this.formatMinutes(data['minutes'] as number);
    }
    if (data['notes'] !== undefined) {
      result[this.translate.instant('history.fields.notes')] =
        data['notes'] || '-';
    }

    return result;
  }

  /**
   * Formats DayOverride entity data
   */
  private formatDayOverrideData(
    data: Record<string, unknown>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (data['date'] !== undefined) {
      result[this.translate.instant('history.fields.date')] = data['date'];
    }
    if (data['minutes'] !== undefined) {
      result[this.translate.instant('history.fields.workMinutes')] =
        this.formatMinutes(data['minutes'] as number);
    }
    if (data['note'] !== undefined) {
      result[this.translate.instant('history.fields.notes')] =
        data['note'] || '-';
    }

    return result;
  }

  /**
   * Formats DayType entity data
   */
  private formatDayTypeData(
    data: Record<string, unknown>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (data['name'] !== undefined) {
      result[this.translate.instant('history.fields.name')] = data['name'];
    }
    if (data['color'] !== undefined) {
      result[this.translate.instant('history.fields.color')] = data['color'];
    }
    if (data['defaultMinutes'] !== undefined) {
      result[this.translate.instant('history.fields.defaultHours')] =
        this.formatMinutes(data['defaultMinutes'] as number);
    }

    return result;
  }

  /**
   * Formats minutes to hours and minutes string
   */
  private formatMinutes(minutes: number): string {
    if (!minutes && minutes !== 0) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}min`;
    }
  }
}
