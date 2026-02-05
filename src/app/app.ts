import {
  Component,
  inject,
  OnInit,
  NgZone,
  OnDestroy,
  signal,
  effect,
} from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import {
  ElectronNavigationService,
  ThemeService,
  TranslationService,
} from './services';
import { ActionHistoryService } from './services/action-history.service';
import { UpdateService } from './services/update/update.service';
import { OpenUpdateDialogComponent } from './components/open-update-dialog/open-update-dialog';

/**
 * Root component of the application.
 * Handles theme, navigation, and action history notifications.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, OpenUpdateDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  title = 'OpenTimeTracker';

  private readonly navigationService = inject(ElectronNavigationService);
  private readonly themeService = inject(ThemeService);
  private readonly translationService = inject(TranslationService);
  private readonly historyService = inject(ActionHistoryService);
  readonly updateService = inject(UpdateService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly ngZone = inject(NgZone);
  private readonly router = inject(Router);

  readonly updateDialogVisible = signal(false);

  constructor() {
    // Setup effect for update notifications
    // Must be in constructor to run in injection context
    effect(() => {
      const updateInfo = this.updateService.updateAvailable();
      if (updateInfo) {
        this.ngZone.run(() => {
          this.messageService.add({
            severity: 'info',
            summary: this.translate.instant('update.availableTitle'),
            detail: `${this.translate.instant('update.newVersion')}: ${updateInfo.version}`,
            sticky: true,
            closable: true,
            data: { action: 'viewUpdate' },
          });
        });
      }
    });
  }

  ngOnInit(): void {
    this.setupHistoryListeners();
  }

  ngOnDestroy(): void {
    // Intentionally empty - cleanup handled by services via Angular DI
    return;
  }

  /**
   * Sets up listeners for history service notifications
   */
  private setupHistoryListeners(): void {
    if (globalThis.window?.electronAPI) {
      globalThis.window.electronAPI.onUndoAction(() => {
        this.ngZone.run(async () => {
          const action = await this.historyService.undo();
          if (action) {
            this.messageService.add({
              severity: 'info',
              summary: this.translate.instant('history.undone'),
              detail: action.description,
              life: 2000,
            });
          }
        });
      });

      globalThis.window.electronAPI.onRedoAction(() => {
        this.ngZone.run(async () => {
          const action = await this.historyService.redo();
          if (action) {
            this.messageService.add({
              severity: 'info',
              summary: this.translate.instant('history.redone'),
              detail: action.description,
              life: 2000,
            });
          }
        });
      });
    }
  }

  /**
   * Handles download update action
   */
  async onDownloadUpdate(): Promise<void> {
    await this.updateService.downloadUpdate();
  }

  /**
   * Handles install update action
   */
  async onInstallUpdate(): Promise<void> {
    await this.updateService.installUpdate();
  }

  /**
   * Closes update dialog
   */
  onCloseUpdateDialog(): void {
    this.updateDialogVisible.set(false);
  }
}
