import {
  Component,
  input,
  output,
  computed,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { MonthConfig, DaySchedule } from '../../../types/electron';

/**
 * Day configuration interface for work schedule
 */
interface DayConfig {
  id: number;
  label: string;
  selected: boolean;
  hours: number;
  minutes: number;
  isLastWorkDay: boolean;
}

/**
 * Dialog component for configuring work schedule settings
 */
@Component({
  selector: 'app-open-work-config-dialog',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    CheckboxModule,
    TranslateModule,
  ],
  templateUrl: './open-work-config-dialog.html',
  styleUrl: './open-work-config-dialog.scss',
})
export class OpenWorkConfigDialogComponent {
  /**
   * Whether the dialog is visible
   */
  visible = input.required<boolean>();

  /**
   * Current month configuration
   */
  config = input<MonthConfig | null>(null);

  /**
   * Event emitted when configuration is saved
   */
  saved = output<{
    weeklyMinutes: number;
    workDays: string;
    daySchedule: string;
  }>();

  /**
   * Event emitted when cancelled or dialog closed
   */
  cancelled = output<void>();

  /**
   * Weekly target hours
   */
  weeklyHours = signal<number>(40);

  /**
   * Week days configuration array
   */
  weekDays = signal<DayConfig[]>([
    {
      id: 1,
      label: 'workConfig.monday',
      selected: true,
      hours: 8,
      minutes: 0,
      isLastWorkDay: false,
    },
    {
      id: 2,
      label: 'workConfig.tuesday',
      selected: true,
      hours: 8,
      minutes: 0,
      isLastWorkDay: false,
    },
    {
      id: 3,
      label: 'workConfig.wednesday',
      selected: true,
      hours: 8,
      minutes: 0,
      isLastWorkDay: false,
    },
    {
      id: 4,
      label: 'workConfig.thursday',
      selected: true,
      hours: 8,
      minutes: 0,
      isLastWorkDay: false,
    },
    {
      id: 5,
      label: 'workConfig.friday',
      selected: true,
      hours: 8,
      minutes: 0,
      isLastWorkDay: true,
    },
    {
      id: 6,
      label: 'workConfig.saturday',
      selected: false,
      hours: 0,
      minutes: 0,
      isLastWorkDay: false,
    },
    {
      id: 0,
      label: 'workConfig.sunday',
      selected: false,
      hours: 0,
      minutes: 0,
      isLastWorkDay: false,
    },
  ]);

  /**
   * Computed total weekly minutes target
   */
  totalWeeklyMinutes = computed(() => this.weeklyHours() * 60);

  /**
   * Computed selected work days string
   */
  workDaysString = computed(() =>
    this.weekDays()
      .filter((d) => d.selected)
      .map((d) => d.id)
      .join(','),
  );

  /**
   * Computed day schedule JSON
   */
  dayScheduleJson = computed(() => {
    const schedule: DaySchedule = {};
    const days = this.weekDays();
    const selectedDays = days.filter((d) => d.selected);
    const lastWorkDay = this.findLastWorkDay(selectedDays);

    for (const day of days) {
      if (day.selected) {
        if (day.id === lastWorkDay?.id) {
          const otherMinutes = selectedDays
            .filter((d) => d.id !== lastWorkDay.id)
            .reduce((sum, d) => sum + d.hours * 60 + d.minutes, 0);
          schedule[String(day.id)] = Math.max(
            0,
            this.totalWeeklyMinutes() - otherMinutes,
          );
        } else {
          schedule[String(day.id)] = day.hours * 60 + day.minutes;
        }
      }
    }
    return JSON.stringify(schedule);
  });

  /**
   * Computed remaining minutes for last work day
   */
  lastDayMinutes = computed(() => {
    const days = this.weekDays();
    const selectedDays = days.filter((d) => d.selected);
    const lastWorkDay = this.findLastWorkDay(selectedDays);
    if (!lastWorkDay) return 0;

    const otherMinutes = selectedDays
      .filter((d) => d.id !== lastWorkDay.id)
      .reduce((sum, d) => sum + d.hours * 60 + d.minutes, 0);
    return Math.max(0, this.totalWeeklyMinutes() - otherMinutes);
  });

  constructor() {
    effect(() => {
      const isVisible = this.visible();
      if (isVisible) {
        this.initializeForm();
      }
    });
  }

  /**
   * Finds the last work day of the week
   */
  private findLastWorkDay(selectedDays: DayConfig[]): DayConfig | undefined {
    if (selectedDays.length === 0) return undefined;
    return selectedDays.reduce((last, current) => {
      const order = [1, 2, 3, 4, 5, 6, 0];
      return order.indexOf(current.id) > order.indexOf(last.id)
        ? current
        : last;
    });
  }

  /**
   * Initializes form values from config
   */
  private initializeForm(): void {
    const currentConfig = this.config();
    if (currentConfig) {
      this.weeklyHours.set(Math.floor(currentConfig.weeklyMinutes / 60));

      const workDaysArray = currentConfig.workDays
        .split(',')
        .map((d) => parseInt(d, 10));
      const daySchedule: DaySchedule = currentConfig.daySchedule
        ? JSON.parse(currentConfig.daySchedule)
        : {};

      this.weekDays.update((days) => {
        const updatedDays = days.map((day) => ({
          ...day,
          selected: workDaysArray.includes(day.id),
          hours: Math.floor((daySchedule[String(day.id)] || 0) / 60),
          minutes: (daySchedule[String(day.id)] || 0) % 60,
          isLastWorkDay: false,
        }));

        const selectedDays = updatedDays.filter((d) => d.selected);
        const lastWorkDay = this.findLastWorkDay(selectedDays);
        if (lastWorkDay) {
          const idx = updatedDays.findIndex((d) => d.id === lastWorkDay.id);
          if (idx >= 0) {
            updatedDays[idx].isLastWorkDay = true;
          }
        }
        return updatedDays;
      });
    }
  }

  /**
   * Handles visible change from dialog
   */
  onVisibleChange(visible: boolean): void {
    if (!visible) {
      this.cancelled.emit();
    }
  }

  /**
   * Toggles a day selection and updates last work day
   */
  toggleDay(dayId: number): void {
    this.weekDays.update((days) => {
      const updatedDays = days.map((day) =>
        day.id === dayId ? { ...day, selected: !day.selected } : day,
      );

      const selectedDays = updatedDays.filter((d) => d.selected);
      const lastWorkDay = this.findLastWorkDay(selectedDays);

      return updatedDays.map((day) => ({
        ...day,
        isLastWorkDay: day.id === lastWorkDay?.id,
      }));
    });
  }

  /**
   * Updates hours for a specific day
   */
  updateDayHours(dayId: number, hours: number): void {
    this.weekDays.update((days) =>
      days.map((day) => (day.id === dayId ? { ...day, hours } : day)),
    );
  }

  /**
   * Updates minutes for a specific day
   */
  updateDayMinutes(dayId: number, minutes: number): void {
    this.weekDays.update((days) =>
      days.map((day) => (day.id === dayId ? { ...day, minutes } : day)),
    );
  }

  /**
   * Formats minutes to display string
   */
  formatMinutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
  }

  /**
   * Handles the save action
   */
  onSave(): void {
    this.saved.emit({
      weeklyMinutes: this.totalWeeklyMinutes(),
      workDays: this.workDaysString(),
      daySchedule: this.dayScheduleJson(),
    });
  }

  /**
   * Handles the cancel action
   */
  onCancel(): void {
    this.cancelled.emit();
  }
}
