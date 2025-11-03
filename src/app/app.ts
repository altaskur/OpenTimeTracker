import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ElectronNavigationService } from './services/electron-navigation.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = 'OpenTimeTracker';

  constructor(private readonly navigationService: ElectronNavigationService) {
    // Navigation service is initialized through constructor injection
  }
}
