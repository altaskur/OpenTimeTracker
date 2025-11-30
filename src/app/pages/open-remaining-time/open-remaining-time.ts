import { Component, OnInit, inject, signal } from '@angular/core';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TranslateModule } from '@ngx-translate/core';
import { DatabaseService } from '../../services/database.service';
import { TimeEntry } from '../../../types/electron';
import { OpenLayoutComponent } from '../../components/open-layout/open-layout';

/**
 * Remaining time page component displaying time entries and total hours
 */
@Component({
  selector: 'app-open-remaining-time',
  imports: [CardModule, TableModule, OpenLayoutComponent, TranslateModule],
  templateUrl: './open-remaining-time.html',
  styleUrl: './open-remaining-time.scss',
})
export class OpenRemainingTime implements OnInit {
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
    } finally {
      this.loading.set(false);
    }
  }
}
