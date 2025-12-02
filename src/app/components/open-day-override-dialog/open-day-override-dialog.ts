import {
  Component,
  input,
  output,
  computed,
  signal,
  effect,
  untracked,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { DayOverride, DayType } from '../../../types/electron';

/**
 * Dialog component for managing day overrides (holidays, sick leave, etc.)
 */
@Component({
  selector: 'app-open-day-override-dialog',
  imports: [
    FormsModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TooltipModule,
    TranslateModule,
  ],
  templateUrl: './open-day-override-dialog.html',
  styleUrl: './open-day-override-dialog.scss',
})
export class OpenDayOverrideDialogComponent {
  /** Whether the dialog is visible */
  visible = input.required<boolean>();

  /** Selected date for the override */
  selectedDate = input.required<Date>();

  /** Existing day override for editing */
  dayOverride = input<DayOverride | null>(null);

  /** Available day types */
  dayTypes = input<DayType[]>([]);

  /** Event emitted when day override is saved */
  saved = output<{
    date: Date;
    dayTypeId: string | null;
    minutes: number | null;
    note: string | null;
  }>();

  /** Event emitted when cancelled or dialog closed */
  cancelled = output<void>();

  /** Event emitted when day override is deleted */
  deleted = output<void>();

  /** Event emitted when user wants to manage day types */
  manageDayTypes = output<void>();

  /** Whether we are editing an existing override */
  isEditing = computed(() => this.dayOverride() !== null);

  /** Selected day type ID */
  dayTypeId = signal<string | null>(null);

  /** Custom minutes (optional override) */
  customMinutes = signal<number | null>(null);

  /** Use custom minutes checkbox */
  useCustomMinutes = signal(false);

  /** Note for the override */
  note = signal<string>('');

  /** Dialog header computed */
  dialogHeader = computed(() =>
    this.isEditing() ? 'dayOverride.editTitle' : 'dayOverride.addTitle',
  );

  /** Formatted date for display */
  formattedDate = computed(() => {
    const date = this.selectedDate();
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  });

  /** Selected day type object */
  selectedDayType = computed(() => {
    const typeId = this.dayTypeId();
    if (!typeId) return null;
    return this.dayTypes().find((t) => t.id === typeId) || null;
  });

  /** Effective minutes (custom or from day type) */
  effectiveMinutes = computed(() => {
    if (this.useCustomMinutes() && this.customMinutes() !== null) {
      return this.customMinutes();
    }
    const dayType = this.selectedDayType();
    return dayType?.defaultMinutes ?? null;
  });

  /** Is form valid */
  isValid = computed(() => this.dayTypeId() !== null);

  constructor() {
    effect(() => {
      const isVisible = this.visible();
      if (isVisible) {
        untracked(() => this.initializeForm());
      }
    });
  }

  /**
   * Initializes form values based on existing dayOverride
   */
  private initializeForm(): void {
    const override = this.dayOverride();
    if (override) {
      this.dayTypeId.set(override.dayTypeId || null);
      this.note.set(override.note || '');
      if (override.minutes !== null && override.minutes !== undefined) {
        this.useCustomMinutes.set(true);
        this.customMinutes.set(override.minutes);
      } else {
        this.useCustomMinutes.set(false);
        this.customMinutes.set(null);
      }
    } else {
      this.dayTypeId.set(null);
      this.note.set('');
      this.useCustomMinutes.set(false);
      this.customMinutes.set(null);
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
   * Handles the save action
   */
  onSave(): void {
    if (!this.isValid()) return;

    this.saved.emit({
      date: this.selectedDate(),
      dayTypeId: this.dayTypeId(),
      minutes: this.useCustomMinutes() ? this.customMinutes() : null,
      note: this.note() || null,
    });
  }

  /**
   * Handles the cancel action
   */
  onCancel(): void {
    this.cancelled.emit();
  }

  /**
   * Handles the delete action
   */
  onDelete(): void {
    this.deleted.emit();
  }

  /**
   * Opens the day types management dialog
   */
  onManageDayTypes(): void {
    this.manageDayTypes.emit();
  }

  /**
   * Handles custom minutes checkbox change
   */
  onUseCustomMinutesChange(): void {
    if (this.useCustomMinutes()) {
      const dayType = this.selectedDayType();
      if (dayType && this.customMinutes() === null) {
        this.customMinutes.set(dayType.defaultMinutes);
      }
    }
  }
}
