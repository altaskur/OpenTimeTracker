import { Component, inject, input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Task } from '../../../../../types/electron';

/**
 * Task card component for displaying a pending task
 */
@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CardModule, TagModule, ChipModule, TranslateModule],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
})
export class TaskCard {
  private readonly translate = inject(TranslateService);

  /**
   * Task to display
   */
  task = input.required<Task>();

  /**
   * Gets translated display name for status
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
}
