import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ElectronNavigationService {
  constructor(private readonly router: Router) {
    this.setupNavigationListener();
  }

  /**
   * Listens for navigation events from Electron menu
   */
  private setupNavigationListener(): void {
    if (globalThis.window?.electronAPI?.onNavigate) {
      globalThis.window.electronAPI.onNavigate((route: string) => {
        console.log('Navigation event received from Electron:', route);
        this.router.navigate([route]);
      });
    }
  }
}
