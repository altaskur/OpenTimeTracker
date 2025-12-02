import { Component, input, output, inject } from '@angular/core';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TaskWithTags } from '../../../../interfaces';

/**
 * Reusable task table component for displaying tasks
 */
@Component({
  selector: 'app-task-table',
  imports: [
    TableModule,
    ButtonModule,
    TagModule,
    ChipModule,
    TooltipModule,
    TranslateModule,
  ],
  templateUrl: './task-table.html',
  styleUrl: './task-table.scss',
})
export class TaskTableComponent {
  private readonly translate = inject(TranslateService);

  /** Tasks to display in the table */
  tasks = input.required<TaskWithTags[]>();

  /** Loading state */
  loading = input<boolean>(false);

  /** Empty message translation key */
  emptyMessage = input<string>('tasks.empty');

  /** Event emitted when view button is clicked */
  viewTask = output<TaskWithTags>();

  /** Event emitted when edit button is clicked */
  editTask = output<TaskWithTags>();

  /** Event emitted when delete button is clicked */
  deleteTask = output<TaskWithTags>();

  /**
   * Emits view event for a task
   */
  onView(task: TaskWithTags): void {
    this.viewTask.emit(task);
  }

  /**
   * Gets display name for task status (translated if it's a default status key)
   */
  getStatusDisplayName(statusName?: string): string {
    if (!statusName) return '';
    if (statusName.startsWith('status.')) {
      return this.translate.instant(statusName);
    }
    return statusName;
  }

  /**
   * Gets severity color for task status
   */
  getStatusSeverity(
    statusName?: string,
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (statusName) {
      case 'status.completed':
      case 'Completada':
      case 'Completed':
        return 'success';
      case 'status.inProgress':
      case 'En progreso':
      case 'In Progress':
        return 'info';
      case 'status.pending':
      case 'Pendiente':
      case 'Pending':
        return 'warn';
      case 'status.blocked':
      case 'Bloqueada':
      case 'Blocked':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  onEdit(task: TaskWithTags): void {
    this.editTask.emit(task);
  }

  onDelete(task: TaskWithTags): void {
    this.deleteTask.emit(task);
  }
}
