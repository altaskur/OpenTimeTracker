import { Component, Input } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-time-allocation-table',
  imports: [TableModule, ProgressBarModule],
  templateUrl: './time-allocation-table.html',
  styleUrl: './time-allocation-table.scss',
})
export class TimeAllocationTable {
  @Input() todayTimeAllocation: any[] = [];
}
