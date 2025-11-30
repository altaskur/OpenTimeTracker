import { Injectable, signal } from '@angular/core';

/**
 * Service for managing application theme (dark/light mode).
 * Integrates with Electron IPC for synchronized theme changes.
 * Theme preference is persisted in the database.
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly isDarkMode = signal(true);

  constructor() {
    void this.initializeTheme();
    this.listenToElectronThemeChanges();
  }

  private async initializeTheme(): Promise<void> {
    if (globalThis.window?.electronAPI?.getTheme) {
      try {
        const isDark = await globalThis.window.electronAPI.getTheme();
        this.applyTheme(isDark);
      } catch {
        this.applyTheme(true);
      }
    } else {
      const savedTheme = localStorage.getItem('theme');
      this.applyTheme(savedTheme !== 'light');
    }
  }

  private listenToElectronThemeChanges(): void {
    if (globalThis.window?.electronAPI?.onThemeChange) {
      globalThis.window.electronAPI.onThemeChange((isDark: boolean) => {
        this.applyTheme(isDark);
      });
    }
  }

  /**
   * Toggles between dark and light mode.
   * Uses Electron IPC if available, otherwise toggles directly.
   */
  toggleTheme(): void {
    if (globalThis.window?.electronAPI?.toggleTheme) {
      globalThis.window.electronAPI.toggleTheme();
    } else {
      this.applyTheme(!this.isDarkMode());
    }
  }

  /**
   * Gets the theme label for UI display.
   */
  getThemeLabel(): string {
    return this.isDarkMode() ? 'Modo Claro' : 'Modo Oscuro';
  }

  /**
   * Gets the theme icon for UI display.
   */
  getThemeIcon(): string {
    return this.isDarkMode() ? 'pi pi-sun' : 'pi pi-moon';
  }

  private applyTheme(isDark: boolean): void {
    this.isDarkMode.set(isDark);
    const html = document.querySelector('html');

    if (isDark) {
      html?.classList.add('my-app-dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html?.classList.remove('my-app-dark');
      localStorage.setItem('theme', 'light');
    }
  }
}
