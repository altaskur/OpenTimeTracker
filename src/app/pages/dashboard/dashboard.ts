import { Component, OnInit, inject, signal } from '@angular/core';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DatabaseService } from '../../services/database.service';
import { TimeEntry } from '../../../types/electron';

@Component({
  selector: 'app-dashboard',
  imports: [CardModule, TableModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly dbService = inject(DatabaseService);

  timeEntries = signal<TimeEntry[]>([]);
  loading = signal(false);
  totalHours = signal(0);

  ngOnInit(): void {
    void this.loadTimeEntries();
  }

  async loadTimeEntries(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.dbService.getTimeEntries();
      this.timeEntries.set(data);

      const total = data.reduce((sum, entry) => sum + entry.hours, 0);
      this.totalHours.set(total);
    } catch (error) {
      console.error('Error loading time entries:', error);
    } finally {
      this.loading.set(false);
    }
  }
}
