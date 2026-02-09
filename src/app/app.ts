import { Component, inject, OnInit, NgZone, OnDestroy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { UpdateBannerComponent } from './components/update-banner/update-banner.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import {
  ElectronNavigationService,
  ThemeService,
  TranslationService,
} from './services';
import { ActionHistoryService } from './services/action-history.service';
import { UpdateService } from './services/update.service';

/**
 * Root component of the application.
 * Handles theme, navigation, and action history notifications.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule, UpdateBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  title = 'OpenTimeTracker';

  private readonly navigationService = inject(ElectronNavigationService);
  private readonly themeService = inject(ThemeService);
  private readonly translationService = inject(TranslationService);
  private readonly historyService = inject(ActionHistoryService);
  private readonly messageService = inject(MessageService);
  private readonly updateService = inject(UpdateService);
  private readonly translate = inject(TranslateService);
  private readonly ngZone = inject(NgZone);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.setupHistoryListeners();
    this.updateService.init();
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
}
