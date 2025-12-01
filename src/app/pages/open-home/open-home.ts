import { Component, OnInit, inject, signal } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OpenLayoutComponent } from '../../components/open-layout/open-layout';
import { DatabaseService } from '../../services';
import { Task } from '../../../types/electron';

/**
 * Main home page component displaying pending tasks
 */
@Component({
  selector: 'app-open-home',
  imports: [
    CardModule,
    ButtonModule,
    TagModule,
    ChipModule,
    OpenLayoutComponent,
    TranslateModule,
  ],
  templateUrl: './open-home.html',
  styleUrl: './open-home.scss',
})
export class OpenHome implements OnInit {
  private readonly router = inject(Router);
  private readonly dbService = inject(DatabaseService);

  pendingTasks = signal<Task[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    void this.loadPendingTasks();
  }

  async loadPendingTasks(): Promise<void> {
    this.loading.set(true);
    try {
      const tasks = await this.dbService.getTasks();
      const pendingOnly = tasks.filter(
        (task) =>
          task.status?.name !== 'Completada' &&
          task.status?.name !== 'Completed',
      );
      this.pendingTasks.set(pendingOnly);
    } finally {
      this.loading.set(false);
    }
  }

  goToTasks(): void {
    this.router.navigate(['/tasks']);
  }

  goToProjects(): void {
    this.router.navigate(['/projects']);
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
}
