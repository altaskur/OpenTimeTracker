import {
  Component,
  input,
  output,
  signal,
  effect,
  untracked,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ColorPickerModule } from 'primeng/colorpicker';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DayType } from '../../../types/electron';

/**
 * Dialog component for managing day types (holidays, sick leave, etc.)
 */
@Component({
  selector: 'app-open-day-types-dialog',
  imports: [
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    ColorPickerModule,
    TableModule,
    TooltipModule,
    TranslateModule,
  ],
  templateUrl: './open-day-types-dialog.html',
  styleUrl: './open-day-types-dialog.scss',
})
export class OpenDayTypesDialogComponent {
  private readonly translate = inject(TranslateService);

  /** Whether the dialog is visible */
  visible = input.required<boolean>();

  /** Available day types */
  dayTypes = input<DayType[]>([]);

  /** Event emitted when a day type is created */
  created = output<{ name: string; color: string; defaultMinutes: number }>();

  /** Event emitted when a day type is updated */
  updated = output<{
    id: string;
    name: string;
    color: string;
    defaultMinutes: number;
  }>();

  /** Event emitted when a day type is deleted */
  deleted = output<string>();

  /** Event emitted when dialog is closed */
  closed = output<void>();

  /** New day type name */
  newName = signal('');

  /** New day type color */
  newColor = signal('#3B82F6');

  /** New day type hours */
  newHours = signal(0);

  /** Editing state */
  editingId = signal<string | null>(null);
  editName = signal('');
  editColor = signal('');
  editHours = signal(0);

  constructor() {
    effect(() => {
      const isVisible = this.visible();
      if (isVisible) {
        untracked(() => this.resetForm());
      }
    });
  }

  /**
   * Resets the new day type form
   */
  private resetForm(): void {
    this.newName.set('');
    this.newColor.set('#3B82F6');
    this.newHours.set(0);
    this.editingId.set(null);
  }

  /**
   * Handles visible change from dialog
   */
  onVisibleChange(visible: boolean): void {
    if (!visible) {
      this.closed.emit();
    }
  }

  /**
   * Handles creating a new day type
   */
  onCreate(): void {
    const name = this.newName().trim();
    if (!name) return;

    this.created.emit({
      name,
      color: this.newColor(),
      defaultMinutes: this.newHours() * 60,
    });

    this.resetForm();
  }

  /**
   * Starts editing a day type
   */
  startEdit(dayType: DayType): void {
    this.editingId.set(dayType.id);
    this.editName.set(dayType.name);
    this.editColor.set(dayType.color);
    this.editHours.set(dayType.defaultMinutes / 60);
  }

  /**
   * Cancels editing
   */
  cancelEdit(): void {
    this.editingId.set(null);
  }

  /**
   * Saves the edited day type
   */
  saveEdit(): void {
    const id = this.editingId();
    if (!id) return;

    const name = this.editName().trim();
    if (!name) return;

    this.updated.emit({
      id,
      name,
      color: this.editColor(),
      defaultMinutes: this.editHours() * 60,
    });

    this.editingId.set(null);
  }

  /**
   * Deletes a day type
   */
  onDelete(id: string): void {
    this.deleted.emit(id);
  }

  /**
   * Closes the dialog
   */
  onClose(): void {
    this.closed.emit();
  }

  /**
   * Checks if new form is valid
   */
  isNewFormValid(): boolean {
    return this.newName().trim().length > 0;
  }

  /**
   * Checks if edit form is valid
   */
  isEditFormValid(): boolean {
    return this.editName().trim().length > 0;
  }
}
