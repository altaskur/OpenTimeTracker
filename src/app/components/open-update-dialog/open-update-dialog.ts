import { Component, input, output, computed } from '@angular/core';
import { DatePipe } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TranslateModule } from '@ngx-translate/core';
import { UpdateInfo } from '../../../types/electron';

/**
 * Update notification dialog component.
 * Displays information about available updates and allows downloading/installing them.
 */
@Component({
  selector: 'app-open-update-dialog',
  imports: [
    DatePipe,
    ButtonModule,
    DialogModule,
    ProgressBarModule,
    TranslateModule,
  ],
  templateUrl: './open-update-dialog.html',
  styleUrl: './open-update-dialog.scss',
})
export class OpenUpdateDialogComponent {
  /** Whether the dialog is visible */
  visible = input.required<boolean>();

  /** Information about the available update */
  updateInfo = input<UpdateInfo | null>(null);

  /** Download progress percentage (0-100) */
  downloadProgress = input<number>(0);

  /** Whether update is currently being downloaded */
  isDownloading = input<boolean>(false);

  /** Whether update has been downloaded and ready to install */
  isDownloaded = input<boolean>(false);

  /** Event emitted when user wants to download the update */
  download = output<void>();

  /** Event emitted when user wants to install the update */
  install = output<void>();

  /** Event emitted when dialog is closed */
  closed = output<void>();

  /**
   * Computed property for dialog header based on state.
   */
  readonly dialogHeader = computed(() => {
    if (this.isDownloading()) {
      return 'update.downloadingTitle';
    }
    if (this.isDownloaded()) {
      return 'update.readyToInstallTitle';
    }
    return 'update.availableTitle';
  });

  /**
   * Handles the download action.
   */
  onDownload(): void {
    this.download.emit();
  }

  /**
   * Handles the install and restart action.
   */
  onInstall(): void {
    this.install.emit();
  }

  /**
   * Handles the cancel/close action.
   */
  onClose(): void {
    this.closed.emit();
  }
}
