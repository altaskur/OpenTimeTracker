import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { ProgressBarModule } from 'primeng/progressbar';
import { TranslateModule } from '@ngx-translate/core';
import { OpenCardProgressbarAriaFixDirective } from './open-card-progressbar-aria-fix.directive';

/**
 * Card variant type
 */
export type CardVariant = 'project' | 'task' | 'stats-time' | 'stats-count';

/**
 * Generic card component for displaying projects, tasks, and statistics
 *
 * @remarks
 * This component replaces the previous ProjectCard, TaskCard, and StatsCard
 * components with a unified implementation using 4 variants:
 * - **project**: Simple project card with icon and title
 * - **task**: Task card with title, subtitle, status, and tags
 * - **stats-time**: Statistics with time worked/target and progress bar
 * - **stats-count**: Statistics with a large number display
 *
 * @example Project variant
 * ```html
 * <app-open-card
 *   variant="project"
 *   icon="pi-folder"
 *   title="OpenTimeTracker"
 * />
 * ```
 *
 * @example Task variant
 * ```html
 * <app-open-card
 *   variant="task"
 *   title="Add calendar view"
 *   subtitle="Develop calendar component for tracking"
 *   status="In Progress"
 *   statusSeverity="info"
 *   [tags]="['feature', 'ui']"
 * />
 * ```
 *
 * @example Stats time variant
 * ```html
 * <app-open-card
 *   variant="stats-time"
 *   statsModifier="today"
 *   icon="pi-sun"
 *   worked="4:30"
 *   target="8:00"
 *   remaining="3:30"
 *   [progress]="56"
 * />
 * ```
 * Note: iconLabel is automatically derived from statsModifier using i18n.
 *
 * @example Statscount variant
 * ```html
 * <app-open-card
 *   variant="stats-count"
 *   statsModifier="tasks"
 *   icon="pi-check-square"
 *   [bigNumber]="12"
 * />
 * ```
 */
@Component({
  selector: 'app-open-card',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TagModule,
    ChipModule,
    ProgressBarModule,
    TranslateModule,
    OpenCardProgressbarAriaFixDirective,
  ],
  templateUrl: './open-card.html',
  styleUrl: './open-card.scss',
})
export class OpenCard {
  /**
   * Card variant type
   */
  variant = input.required<CardVariant>();

  /**
   * Icon class (PrimeIcons)
   */
  icon = input<string>();

  /**
   * Icon label (automatically translated in stories)
   */
  iconLabel = input<string>();

  /**
   * Title (project name or task title)
   */
  title = input<string>();

  /**
   * Subtitle (task description)
   */
  subtitle = input<string>();

  /**
   * Stats modifier for CSS classes (today/week/tasks)
   */
  statsModifier = input<'today' | 'week' | 'tasks'>();

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
   * Progress percentage 0-100
   */
  progress = input<number>(0);

  /**
   * Accessible label for progress bar
   */
  progressLabel = computed(() => {
    const worked = this.worked();
    const target = this.target();
    const progressValue = this.progress();

    if (worked && target) {
      return `Progress: ${worked} of ${target} (${progressValue}%)`;
    }
    return `Progress: ${progressValue}%`;
  });

  /**
   * Big number to display
   */
  bigNumber = input<number>(0);

  /**
   * Task status label
   */
  status = input<string>();

  /**
   * Task status severity
   */
  statusSeverity = input<'success' | 'info' | 'warn' | 'danger' | 'secondary'>(
    'secondary',
  );

  /**
   * Task tags
   */
  tags = input<string[]>([]);
}
