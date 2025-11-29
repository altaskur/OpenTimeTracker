import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ElectronNavigationService } from './services/electron-navigation.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = 'OpenTimeTracker';

  private readonly navigationService = inject(ElectronNavigationService);
}
