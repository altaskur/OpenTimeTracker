import { Component, OnInit, inject, signal } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { OpenLayoutComponent } from '../../components/open-layout/open-layout';
import { OpenCalendar } from '../../components/open-calendar/open-calendar';
import { DatabaseService } from '../../services';
import { Task } from '../../../types/electron';

/**
 * Calendar page component displaying monthly calendar with tasks
 */
@Component({
  selector: 'app-open-calendar-page',
  imports: [OpenLayoutComponent, OpenCalendar, TranslateModule],
  templateUrl: './open-calendar-page.html',
  styleUrl: './open-calendar-page.scss',
})
export class OpenCalendarPage implements OnInit {
  private readonly dbService = inject(DatabaseService);

  tasks = signal<Task[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    void this.loadTasks();
  }

  /**
   * Loads all tasks from database
   */
  async loadTasks(): Promise<void> {
    this.loading.set(true);
    try {
      const tasks = await this.dbService.getTasks();
      this.tasks.set(tasks);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Handles task click from calendar
   */
  onTaskClicked(task: Task): void {
    console.log('Task clicked:', task);
  }

  /**
   * Handles day click from calendar
   */
  onDayClicked(date: Date): void {
    console.log('Day clicked:', date);
  }
}
