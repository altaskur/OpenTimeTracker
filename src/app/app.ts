import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ElectronNavigationService } from './services/electron-navigation.service';
import { ThemeService } from './services/theme.service';

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
}
