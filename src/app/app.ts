import { Component, inject, OnInit, NgZone, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import {
  ElectronNavigationService,
  ThemeService,
  TranslationService,
} from './services';
import { ActionHistoryService } from './services/action-history.service';

/**
 * Root component of the application.
 * Handles theme, navigation, and action history notifications.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
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
  private readonly translate = inject(TranslateService);
  private readonly ngZone = inject(NgZone);

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
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.onUndoAction(() => {
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

      window.electronAPI.onRedoAction(() => {
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
