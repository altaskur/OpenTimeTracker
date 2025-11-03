import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DatabaseService } from '../../services/database.service';
import { TimeEntry } from '../../../types/electron';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, CardModule, TableModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  timeEntries = signal<TimeEntry[]>([]);
  loading = signal(false);
  totalHours = signal(0);

  constructor(private readonly dbService: DatabaseService) {}

  ngOnInit() {
    void this.loadTimeEntries();
  }

  async loadTimeEntries() {
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
