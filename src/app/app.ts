import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import {
  ElectronNavigationService,
  ThemeService,
  TranslationService,
} from './services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = 'OpenTimeTracker';

  private readonly navigationService = inject(ElectronNavigationService);
  private readonly themeService = inject(ThemeService);
  private readonly translationService = inject(TranslationService);
}
