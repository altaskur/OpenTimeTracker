import { Component, input, output } from '@angular/core';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';

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
  /** Tasks to display in the table */
  tasks = input.required<TaskWithTags[]>();

  /** Loading state */
  loading = input<boolean>(false);

  /** Empty message translation key */
  emptyMessage = input<string>('tasks.empty');

  /** Event emitted when edit button is clicked */
  editTask = output<TaskWithTags>();

  /** Event emitted when delete button is clicked */
  deleteTask = output<TaskWithTags>();

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

  onEdit(task: TaskWithTags): void {
    this.editTask.emit(task);
  }

  onDelete(task: TaskWithTags): void {
    this.deleteTask.emit(task);
  }
}
