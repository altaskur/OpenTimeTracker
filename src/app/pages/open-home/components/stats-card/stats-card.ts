import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Type of stats card to display
 */
export type StatsCardType = 'today' | 'week' | 'tasks';

/**
 * Stats card component for displaying time tracking statistics
 */
@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, CardModule, ProgressBarModule, TranslateModule],
  templateUrl: './stats-card.html',
  styleUrl: './stats-card.scss',
})
export class StatsCard {
  /**
   * Type of card (today, week, or tasks)
   */
  type = input.required<StatsCardType>();

  /**
   * Icon to display in header
   */
  icon = input.required<string>();

  /**
   * Translation key for header label
   */
  labelKey = input.required<string>();

  /**
   * Worked time formatted string
   */
  worked = input<string>('');

  /**
   * Target time formatted string
   */
  target = input<string>('');

  /**
   * Remaining time formatted string
   */
  remaining = input<string>('');

  /**
   * Progress percentage (0-100)
   */
  progress = input<number>(0);

  /**
   * Big number to display (for tasks card)
   */
  bigNumber = input<number>(0);
}
