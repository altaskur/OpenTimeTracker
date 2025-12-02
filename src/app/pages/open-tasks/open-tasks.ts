import { Component, OnInit, inject, signal, computed } from '@angular/core';

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
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { DatabaseService } from '../../services';
import { Task, Project, TaskStatus, Tag } from '../../../types/electron';
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
  ],
  providers: [MessageService],
  templateUrl: './open-tasks.html',
  styleUrl: './open-tasks.scss',
})
export class OpenTasks implements OnInit {
  private readonly dbService = inject(DatabaseService);
  private readonly translateService = inject(TranslateService);
  private readonly messageService = inject(MessageService);

  /** All tasks from database */
  tasks = signal<TaskWithTags[]>([]);

  /** Available projects for dropdown */
  projects = signal<Project[]>([]);

  /** Available task statuses */
  statuses = signal<TaskStatus[]>([]);

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
        task.status?.name !== 'Completada' && task.status?.name !== 'Completed',
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
        task.status?.name === 'Completada' || task.status?.name === 'Completed',
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
        await this.dbService.updateTask(this.taskForm.id, {
          name: this.taskForm.name,
          description: this.taskForm.description || undefined,
          estimatedHours: this.taskForm.estimatedHours ?? undefined,
          statusId: this.taskForm.statusId || undefined,
          tagIds: tagIds,
        });
        this.showSuccess('toast.taskUpdated');
      } else {
        await this.dbService.createTask(
          this.taskForm.projectId,
          this.taskForm.name,
          this.taskForm.description || undefined,
          this.taskForm.estimatedHours ?? undefined,
          this.taskForm.statusId || undefined,
          tagIds,
        );
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
      await this.dbService.deleteTask(id);
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
