import { Component, input, output } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Reusable delete confirmation dialog component
 * Provides accessible and consistent delete confirmation UI
 */
@Component({
  selector: 'app-open-confirm-delete',
  imports: [ButtonModule, DialogModule, TranslateModule],
  templateUrl: './open-confirm-delete.html',
  styleUrl: './open-confirm-delete.scss',
})
export class OpenConfirmDeleteComponent {
  /** Whether the dialog is visible */
  visible = input.required<boolean>();

  /** The confirmation message to display */
  message = input.required<string>();

  /** Event emitted when confirmed */
  confirmed = output<void>();

  /** Event emitted when cancelled or dialog closed */
  cancelled = output<void>();

  /**
   * Handles the confirm action
   */
  onConfirm(): void {
    this.confirmed.emit();
  }

  /**
   * Handles the cancel action
   */
  onCancel(): void {
    this.cancelled.emit();
  }
}
