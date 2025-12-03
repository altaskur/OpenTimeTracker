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
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { TimeEntry, Task } from '../../../types/electron';

/**
 * Dialog component for adding or editing time entries
 */
@Component({
  selector: 'app-open-time-entry-dialog',
  imports: [
    FormsModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    TranslateModule,
  ],
  templateUrl: './open-time-entry-dialog.html',
  styleUrl: './open-time-entry-dialog.scss',
})
export class OpenTimeEntryDialogComponent {
  /** Whether the dialog is visible */
  visible = input.required<boolean>();

  /** Existing time entry for editing */
  timeEntry = input<TimeEntry | null>(null);

  /** Pre-selected date for new entries */
  selectedDate = input<Date | null>(null);

  /** Available tasks for selection */
  tasks = input<Task[]>([]);

  /** Event emitted when time entry is saved */
  saved = output<{
    taskId: string | null;
    date: Date;
    minutes: number;
    notes: string | null;
  }>();

  /** Event emitted when cancelled or dialog closed */
  cancelled = output<void>();

  /** Event emitted when time entry is deleted */
  deleted = output<void>();

  /** Whether we are editing an existing entry */
  isEditing = computed(() => this.timeEntry() !== null);

  /** Selected task ID */
  taskId = signal<string | null>(null);

  /** Entry date */
  date = signal<Date>(new Date());

  /** Hours worked */
  hours = signal<number>(0);

  /** Minutes worked */
  minutes = signal<number>(0);

  /** Notes */
  notes = signal<string>('');

  /** Dialog header computed */
  dialogHeader = computed(() =>
    this.timeEntry() ? 'timeEntry.editTitle' : 'timeEntry.addTitle',
  );

  /** Total minutes computed */
  totalMinutes = computed(() => this.hours() * 60 + this.minutes());

  /** Is form valid */
  isValid = computed(() => this.totalMinutes() > 0);

  /**
   * Tasks with project prefix for display in select.
   * Filters out completed tasks.
   */
  tasksWithPrefix = computed(() => {
    return this.tasks()
      .filter(
        (task) =>
          task.status?.name !== 'status.completed' &&
          task.status?.name !== 'Completed',
      )
      .map((task) => ({
        ...task,
        displayName: task.project
          ? `[${task.project.name.substring(0, 3).toUpperCase()}] ${task.name}`
          : task.name,
      }));
  });

  constructor() {
    effect(() => {
      const isVisible = this.visible();
      if (isVisible) {
        untracked(() => this.initializeForm());
      }
    });
  }

  /**
   * Initializes form values based on timeEntry or selectedDate
   */
  private initializeForm(): void {
    const entry = this.timeEntry();
    if (entry) {
      this.taskId.set(entry.taskId);
      this.date.set(new Date(entry.date));
      this.hours.set(Math.floor(entry.minutes / 60));
      this.minutes.set(entry.minutes % 60);
      this.notes.set(entry.notes || '');
    } else {
      const preselectedDate = this.selectedDate();
      if (preselectedDate) {
        this.date.set(new Date(preselectedDate));
      } else {
        this.date.set(new Date());
      }
      this.taskId.set(null);
      this.hours.set(0);
      this.minutes.set(0);
      this.notes.set('');
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
      taskId: this.taskId(),
      date: this.date(),
      minutes: this.totalMinutes(),
      notes: this.notes() || null,
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
}
