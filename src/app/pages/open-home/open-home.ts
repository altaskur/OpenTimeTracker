import { Component, OnInit, inject, signal, computed } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OpenLayoutComponent } from '../../components/open-layout/open-layout';
import { DatabaseService } from '../../services/database.service';
import { Task } from '../../../types/electron';
import { ThemeService } from '../../services/theme.service';

/**
 * Main home page component displaying pending tasks
 */
@Component({
  selector: 'app-open-home',
  imports: [CardModule, ButtonModule, OpenLayoutComponent, TranslateModule],
  templateUrl: './open-home.html',
  styleUrl: './open-home.scss',
})
export class OpenHome implements OnInit {
  private readonly router = inject(Router);
  private readonly dbService = inject(DatabaseService);
  private readonly themeService = inject(ThemeService);

  pendingTasks = signal<Task[]>([]);
  loading = signal(false);

  themeLabel = computed(() => this.themeService.getThemeLabel());
  themeIcon = computed(() => this.themeService.getThemeIcon());

  ngOnInit(): void {
    void this.loadPendingTasks();
  }

  async loadPendingTasks(): Promise<void> {
    this.loading.set(true);
    try {
      const tasks = await this.dbService.getTasks();
      this.pendingTasks.set(tasks);
    } finally {
      this.loading.set(false);
    }
  }

  goToRemainingTime(): void {
    this.router.navigate(['/remaining-time']);
  }

  goToProjects(): void {
    this.router.navigate(['/projects']);
  }

  toggleDarkMode(): void {
    this.themeService.toggleTheme();
  }
}
