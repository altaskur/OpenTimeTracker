import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { DatePipe } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupModule } from 'primeng/inputgroup';
import { MultiSelectModule } from 'primeng/multiselect';
import { ChipModule } from 'primeng/chip';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { DatabaseService } from '../../services';
import { ActionHistoryService } from '../../services/action-history.service';
import {
  Task,
  Project,
  TaskStatus,
  Tag,
  AuditLog,
} from '../../../types/electron';
import { OpenLayoutComponent } from '../../components/open-layout/open-layout';
import { OpenConfirmDeleteComponent } from '../../components/open-confirm-delete/open-confirm-delete';
import { TaskTableComponent } from './components';
import { TaskWithTags, TaskForm } from '../../interfaces';

/**
 * Tasks management page component
 */
@Component({
  selector: 'app-open-tasks',
  imports: [
    CardModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    InputNumberModule,
    InputGroupModule,
    MultiSelectModule,
    ChipModule,
    ToastModule,
    TooltipModule,
    FormsModule,
    OpenLayoutComponent,
    OpenConfirmDeleteComponent,
    TaskTableComponent,
    TranslateModule,
    TableModule,
    TagModule,
    DatePipe,
  ],
  providers: [MessageService],
  templateUrl: './open-tasks.html',
  styleUrl: './open-tasks.scss',
})
export class OpenTasks implements OnInit {
  private readonly dbService = inject(DatabaseService);
  private readonly historyService = inject(ActionHistoryService);
  private readonly translateService = inject(TranslateService);
  private readonly messageService = inject(MessageService);

  constructor() {
    effect(() => {
      const change = this.historyService.dataChanged();
      if (change.timestamp > 0 && ['Task', 'Tag'].includes(change.entityType)) {
        void this.loadData();
      }
    });
  }

  /** All tasks from database */
  tasks = signal<TaskWithTags[]>([]);

  /** Available projects for dropdown */
  projects = signal<Project[]>([]);

  /** Available task statuses */
  statuses = signal<TaskStatus[]>([]);

  /**
   * Statuses with translated display names
   */
  translatedStatuses = computed(() => {
    return this.statuses().map((status) => ({
      ...status,
      displayName: status.name.startsWith('status.')
        ? this.translateService.instant(status.name)
        : status.name,
    }));
  });

  /** Available tags */
  tags = signal<Tag[]>([]);

  /** Loading state */
  loading = signal(false);

  /** Dialog visibility */
  dialogVisible = signal(false);

  /** Delete task confirmation dialog state */
  deleteTaskDialogVisible = signal(false);
  taskToDelete = signal<Task | null>(null);

  /** Delete tag confirmation dialog state */
  deleteTagDialogVisible = signal(false);
  tagToDelete = signal<Tag | null>(null);

  /** Task details dialog state */
  detailsDialogVisible = signal(false);
  selectedTask = signal<TaskWithTags | null>(null);
  taskHistory = signal<AuditLog[]>([]);
  historyLoading = signal(false);

  /** New tag name for creation */
  newTagName = signal('');

  /** Show new tag input */
  showNewTagInput = signal(false);

  /** Selected project filter (null = all) */
  selectedProjectFilter = signal<string | null>(null);

  /** Filtered pending tasks based on selected project */
  filteredPendingTasks = computed(() => {
    const filter = this.selectedProjectFilter();
    const allTasks = this.tasks();
    const pending = allTasks.filter(
      (task) =>
        task.status?.name !== 'status.completed' &&
        task.status?.name !== 'Completada' &&
        task.status?.name !== 'Completed',
    );
    if (!filter) {
      return pending;
    }
    return pending.filter((task) => task.projectId === filter);
  });

  /** Filtered completed tasks based on selected project */
  filteredCompletedTasks = computed(() => {
    const filter = this.selectedProjectFilter();
    const allTasks = this.tasks();
    const completed = allTasks.filter(
      (task) =>
        task.status?.name === 'status.completed' ||
        task.status?.name === 'Completada' ||
        task.status?.name === 'Completed',
    );
    if (!filter) {
      return completed;
    }
    return completed.filter((task) => task.projectId === filter);
  });

  /** Task form for create/edit */
  taskForm: TaskForm = this.getEmptyForm();

  ngOnInit(): void {
    void this.loadData();
  }

  /**
   * Loads all required data from database
   */
  async loadData(): Promise<void> {
    this.loading.set(true);
    try {
      const [tasks, projects, statuses, tags] = await Promise.all([
        this.dbService.getTasks(),
        this.dbService.getProjects(),
        this.dbService.getTaskStatuses(),
        this.dbService.getTags(),
      ]);
      this.tasks.set(tasks as TaskWithTags[]);
      this.projects.set(projects);
      this.statuses.set(statuses);
      this.tags.set(tags);
    } catch (error) {
      console.error('Error loading tasks data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Opens dialog for creating a new task
   */
  openNewDialog(): void {
    this.taskForm = this.getEmptyForm();
    this.dialogVisible.set(true);
  }

  /**
   * Opens dialog for editing an existing task
   */
  openEditDialog(task: TaskWithTags): void {
    this.taskForm = {
      id: task.id,
      projectId: task.projectId,
      name: task.name,
      description: task.description ?? '',
      estimatedHours: task.estimatedHours ?? null,
      statusId: task.statusId ?? '',
      tags: task.tags?.map((t) => t.tag) ?? [],
    };
    this.dialogVisible.set(true);
  }

  /**
   * Saves the task (create or update)
   */
  async saveTask(): Promise<void> {
    try {
      const tagIds = this.taskForm.tags.map((tag) => tag.id);

      if (this.taskForm.id) {
        const existingTask = this.tasks().find(
          (t) => t.id === this.taskForm.id,
        );
        const previousData = existingTask ? { ...existingTask } : null;

        await this.historyService.execute({
          entityType: 'Task',
          actionType: 'update',
          entityId: this.taskForm.id,
          description: this.translateService.instant(
            'history.actions.updateTask',
          ),
          previousData,
          newData: {
            name: this.taskForm.name,
            description: this.taskForm.description,
            estimatedHours: this.taskForm.estimatedHours,
            statusId: this.taskForm.statusId,
            tagIds,
          },
          execute: async () => {
            await this.dbService.updateTask(this.taskForm.id, {
              name: this.taskForm.name,
              description: this.taskForm.description || undefined,
              estimatedHours: this.taskForm.estimatedHours ?? undefined,
              statusId: this.taskForm.statusId || undefined,
              tagIds: tagIds,
            });
          },
          undo: async () => {
            if (previousData) {
              await this.dbService.updateTask(previousData.id, {
                name: previousData.name,
                description: previousData.description ?? undefined,
                estimatedHours: previousData.estimatedHours ?? undefined,
                statusId: previousData.statusId ?? undefined,
                tagIds: previousData.tags?.map((t) => t.tag.id) ?? [],
              });
              await this.loadData();
            }
          },
        });
        this.showSuccess('toast.taskUpdated');
      } else {
        let createdId: string | null = null;
        await this.historyService.execute({
          entityType: 'Task',
          actionType: 'create',
          entityId: '',
          description: this.translateService.instant(
            'history.actions.createTask',
          ),
          previousData: null,
          newData: {
            projectId: this.taskForm.projectId,
            name: this.taskForm.name,
            description: this.taskForm.description,
            estimatedHours: this.taskForm.estimatedHours,
            statusId: this.taskForm.statusId,
            tagIds,
          },
          execute: async () => {
            const created = await this.dbService.createTask(
              this.taskForm.projectId,
              this.taskForm.name,
              this.taskForm.description || undefined,
              this.taskForm.estimatedHours ?? undefined,
              this.taskForm.statusId || undefined,
              tagIds,
            );
            createdId = created.id;
          },
          undo: async () => {
            if (createdId) {
              await this.dbService.deleteTask(createdId);
              await this.loadData();
            }
          },
        });
        this.showSuccess('toast.taskCreated');
      }
      this.dialogVisible.set(false);
      await this.loadData();
    } catch {
      this.showError('toast.error');
    }
  }

  /**
   * Opens delete task confirmation dialog
   */
  confirmDeleteTask(task: Task): void {
    this.taskToDelete.set(task);
    this.deleteTaskDialogVisible.set(true);
  }

  /**
   * Handles task delete confirmation
   */
  async onDeleteTaskConfirmed(): Promise<void> {
    const task = this.taskToDelete();
    if (task) {
      await this.deleteTask(task.id);
    }
    this.deleteTaskDialogVisible.set(false);
    this.taskToDelete.set(null);
  }

  /**
   * Handles task delete cancellation
   */
  onDeleteTaskCancelled(): void {
    this.deleteTaskDialogVisible.set(false);
    this.taskToDelete.set(null);
  }

  /**
   * Deletes a task by id
   */
  private async deleteTask(id: string): Promise<void> {
    try {
      const existingTask = this.tasks().find((t) => t.id === id);
      const previousData = existingTask ? { ...existingTask } : null;

      await this.historyService.execute({
        entityType: 'Task',
        actionType: 'delete',
        entityId: id,
        description: this.translateService.instant(
          'history.actions.deleteTask',
        ),
        previousData,
        newData: null,
        execute: async () => {
          await this.dbService.deleteTask(id);
        },
        undo: async () => {
          if (previousData) {
            await this.dbService.createTask(
              previousData.projectId,
              previousData.name,
              previousData.description ?? undefined,
              previousData.estimatedHours ?? undefined,
              previousData.statusId ?? undefined,
              previousData.tags?.map((t) => t.tag.id) ?? [],
            );
            await this.loadData();
          }
        },
      });
      this.showSuccess('toast.taskDeleted');
      await this.loadData();
    } catch {
      this.showError('toast.error');
    }
  }

  /**
   * Creates a new tag from the input field
   */
  async createTag(): Promise<void> {
    const name = this.newTagName().trim();
    if (!name) {
      return;
    }

    try {
      await this.dbService.createTag(name);
      this.newTagName.set('');
      this.showNewTagInput.set(false);
      this.tags.set(await this.dbService.getTags());
      this.showSuccess('toast.tagCreated');
    } catch {
      this.showError('toast.error');
    }
  }

  /**
   * Opens delete tag confirmation dialog
   */
  confirmDeleteTag(event: Event, tag: Tag): void {
    event.stopPropagation();
    this.tagToDelete.set(tag);
    this.deleteTagDialogVisible.set(true);
  }

  /**
   * Handles tag delete confirmation
   */
  async onDeleteTagConfirmed(): Promise<void> {
    const tag = this.tagToDelete();
    if (tag) {
      await this.deleteTagById(tag.id);
    }
    this.deleteTagDialogVisible.set(false);
    this.tagToDelete.set(null);
  }

  /**
   * Handles tag delete cancellation
   */
  onDeleteTagCancelled(): void {
    this.deleteTagDialogVisible.set(false);
    this.tagToDelete.set(null);
  }

  /**
   * Deletes a tag by id
   */
  private async deleteTagById(id: string): Promise<void> {
    try {
      await this.dbService.deleteTag(id);
      this.tags.set(await this.dbService.getTags());
      this.taskForm.tags = this.taskForm.tags.filter((t) => t.id !== id);
      this.showSuccess('toast.tagDeleted');
    } catch {
      this.showError('toast.error');
    }
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
   * Creates an empty task form
   */
  private getEmptyForm(): TaskForm {
    return {
      id: '',
      projectId: '',
      name: '',
      description: '',
      estimatedHours: null,
      statusId: '',
      tags: [],
    };
  }

  /**
   * Opens the task details dialog with history
   */
  async openDetailsDialog(task: TaskWithTags): Promise<void> {
    this.selectedTask.set(task);
    this.detailsDialogVisible.set(true);
    await this.loadTaskHistory(task.id);
  }

  /**
   * Loads audit history for a specific task
   */
  private async loadTaskHistory(taskId: string): Promise<void> {
    this.historyLoading.set(true);
    try {
      const history = await this.dbService.getAuditLogs(
        undefined,
        undefined,
        taskId,
      );
      this.taskHistory.set(history);
    } catch (error) {
      console.error('Error loading task history:', error);
      this.taskHistory.set([]);
    } finally {
      this.historyLoading.set(false);
    }
  }

  /**
   * Gets severity color for audit action type
   */
  getActionSeverity(
    action: string,
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (action.toLowerCase()) {
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
   * Gets action label for display
   */
  getActionLabel(action: string): string {
    const key = `history.actionTypes.${action.toLowerCase()}`;
    const translated = this.translateService.instant(key);
    return translated === key ? action : translated;
  }

  /**
   * Gets action icon
   */
  getActionIcon(action: string): string {
    switch (action.toLowerCase()) {
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
   * Gets entity type icon
   */
  getEntityIcon(entityType: string): string {
    switch (entityType) {
      case 'Task':
        return 'pi pi-check-square';
      case 'TimeEntry':
        return 'pi pi-clock';
      case 'Project':
        return 'pi pi-folder';
      default:
        return 'pi pi-circle';
    }
  }

  /**
   * Gets entity type label
   */
  getEntityLabel(entityType: string): string {
    const key = `history.entityTypes.${entityType}`;
    const translated = this.translateService.instant(key);
    return translated === key ? entityType : translated;
  }

  /**
   * Formats changes description for display
   */
  formatChangesDescription(log: AuditLog): string {
    if (!log.changes) return '-';

    try {
      const changes = JSON.parse(log.changes);

      if (log.entityType === 'TimeEntry') {
        return this.formatTimeEntryChanges(log.action, changes);
      }

      if (log.entityType === 'Task') {
        return this.formatTaskChanges(log.action, changes);
      }

      return '-';
    } catch {
      return '-';
    }
  }

  /**
   * Safely converts a value to string, returning fallback for objects
   */
  private safeString(value: unknown, fallback = '-'): string {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'object') return fallback;
    return String(value);
  }

  /**
   * Formats time entry changes
   */
  private formatTimeEntryChanges(
    action: string,
    changes: Record<string, unknown>,
  ): string {
    if (action.toLowerCase() === 'update' && changes['previous']) {
      return this.formatTimeEntryUpdateChanges(changes);
    }

    const hours = this.safeString(changes['hours']);
    const date = this.safeString(changes['date']);
    const notes =
      this.safeString(changes['notes'], '') !== ''
        ? ` - "${this.safeString(changes['notes'])}"`
        : '';
    return `${date}: ${hours}h${notes}`;
  }

  /**
   * Formats time entry update changes
   */
  private formatTimeEntryUpdateChanges(
    changes: Record<string, unknown>,
  ): string {
    const prev = changes['previous'] as Record<string, unknown>;
    const curr = changes['current'] as Record<string, unknown>;
    const parts: string[] = [];

    if (prev['hours'] !== curr['hours']) {
      parts.push(
        `${this.safeString(prev['hours'])}h → ${this.safeString(curr['hours'])}h`,
      );
    }
    if (prev['date'] !== curr['date']) {
      parts.push(
        `${this.safeString(prev['date'])} → ${this.safeString(curr['date'])}`,
      );
    }
    const currNotes = this.safeString(curr['notes'], '');
    if (prev['notes'] !== curr['notes'] && currNotes !== '') {
      parts.push(`"${currNotes}"`);
    }

    return parts.length > 0 ? parts.join(', ') : '-';
  }

  /**
   * Formats task changes
   */
  private formatTaskChanges(
    action: string,
    changes: Record<string, unknown>,
  ): string {
    const actionLower = action.toLowerCase();

    if (actionLower === 'create' || actionLower === 'delete') {
      const name = this.safeString(changes['name'], '');
      return name !== '' ? `"${name}"` : '-';
    }

    if (actionLower === 'update' && changes['previous']) {
      return this.formatTaskUpdateChanges(changes);
    }

    return '-';
  }

  /**
   * Formats task update changes
   */
  private formatTaskUpdateChanges(changes: Record<string, unknown>): string {
    const prev = changes['previous'] as Record<string, unknown>;
    const curr = changes['current'] as Record<string, unknown>;
    const parts: string[] = [];

    const prevName = this.safeString(prev['name'], '');
    const currName = this.safeString(curr['name'], '');
    if (currName !== '' && prevName !== currName && prevName !== '') {
      parts.push(
        `${this.translateService.instant('history.fields.name')}: "${prevName}" → "${currName}"`,
      );
    }
    if (curr['description'] !== undefined) {
      parts.push(this.translateService.instant('history.fields.description'));
    }
    if (curr['statusId'] !== undefined) {
      parts.push(this.translateService.instant('history.fields.status'));
    }
    if (curr['estimatedHours'] !== undefined) {
      parts.push(
        this.translateService.instant('history.fields.estimatedHours'),
      );
    }

    return parts.length > 0 ? parts.join(', ') : '-';
  }

  /**
   * Shows a success toast message
   */
  private showSuccess(key: string): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('common.success'),
      detail: this.translateService.instant(key),
    });
  }

  /**
   * Shows an error toast message
   */
  private showError(key: string): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('common.error'),
      detail: this.translateService.instant(key),
    });
  }
}
