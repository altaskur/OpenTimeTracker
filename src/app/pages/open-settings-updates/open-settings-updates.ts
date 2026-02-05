import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { UpdateService } from '../../services/update/update.service';
import { OpenLayoutComponent } from '../../components/open-layout/open-layout';
import { OpenUpdateDialogComponent } from '../../components/open-update-dialog/open-update-dialog';

/**
 * Settings page for managing application updates.
 */
@Component({
  selector: 'app-open-settings-updates',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    ButtonModule,
    ToggleSwitch,
    DividerModule,
    TooltipModule,
    TranslateModule,
    ToastModule,
    OpenLayoutComponent,
    OpenUpdateDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './open-settings-updates.html',
  styleUrl: './open-settings-updates.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenSettingsUpdatesComponent implements OnInit {
  private readonly updateService = inject(UpdateService);
  private readonly messageService = inject(MessageService);

  readonly loading = signal(false);
  readonly dialogVisible = signal(false);
  readonly currentVersion = '1.0.0-alpha.3'; // TODO: Get from package.json or environment

  // Expose update service signals to template
  readonly updateAvailable = this.updateService.updateAvailable;
  readonly isChecking = this.updateService.isChecking;
  readonly isDownloading = this.updateService.isDownloading;
  readonly downloadProgress = this.updateService.downloadProgress;
  readonly updateDownloaded = this.updateService.updateDownloaded;
  readonly settings = this.updateService.settings;
  readonly errorMessage = this.updateService.errorMessage;

  ngOnInit(): void {
    void this.loadSettings();
  }

  async loadSettings(): Promise<void> {
    this.loading.set(true);
    try {
      await this.updateService.getSettings();
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: '',
        detail: 'Error loading update settings',
        life: 3000,
      });
    } finally {
      this.loading.set(false);
    }
  }

  async onAutoCheckToggle(enabled: boolean): Promise<void> {
    try {
      await this.updateService.setAutoCheck(enabled);
      this.messageService.add({
        severity: 'success',
        summary: '',
        detail: enabled ? 'Auto-check enabled' : 'Auto-check disabled',
        life: 3000,
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: '',
        detail: 'Error updating settings',
        life: 3000,
      });
    }
  }

  async checkForUpdates(): Promise<void> {
    try {
      await this.updateService.checkForUpdates();

      // Wait a moment for the update check to complete
      setTimeout(() => {
        if (this.updateAvailable()) {
          this.dialogVisible.set(true);
        } else if (!this.isChecking() && !this.errorMessage()) {
          this.messageService.add({
            severity: 'info',
            summary: '',
            detail: 'No updates available',
            life: 3000,
          });
        }
      }, 1000);
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: '',
        detail: 'Error checking for updates',
        life: 3000,
      });
    }
  }

  async onDownload(): Promise<void> {
    try {
      await this.updateService.downloadUpdate();
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: '',
        detail: 'Error downloading update',
        life: 3000,
      });
    }
  }

  async onInstall(): Promise<void> {
    try {
      await this.updateService.installUpdate();
      // App will restart, no need for toast
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: '',
        detail: 'Error installing update',
        life: 3000,
      });
    }
  }

  onDialogClosed(): void {
    this.dialogVisible.set(false);
  }

  openReleasesPage(): void {
    // Open GitHub releases page in system browser
    const url = 'https://github.com/altaskur/OpenTimeTracker/releases';
    if (globalThis.window?.electronAPI?.openExternal) {
      void globalThis.window.electronAPI.openExternal(url);
    } else {
      // Fallback for web or if API not available
      window.open(url, '_blank');
    }
  }
}
