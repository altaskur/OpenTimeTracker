import { Injectable, signal } from '@angular/core';
import { GitHubRelease } from '../../types/electron';

interface UpdateCheckResult {
  updateAvailable: boolean;
  version: string;
  url: string;
  releaseNotes?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  updateAvailable = signal<UpdateCheckResult | null>(null);
  checking = signal<boolean>(false);
  autoCheck = signal<boolean>(true);
  lastChecked = signal<Date | null>(null);
  private initialized = false;

  constructor() {
    // Initialization is deferred to avoid async operations in constructor
  }

  /**
   * Loads auto-check preference from database via Electron IPC
   */
  private async loadAutoCheckPreference(): Promise<void> {
    if (!globalThis.window?.electronAPI) {
      return;
    }

    try {
      const value = await globalThis.window.electronAPI.getAutoCheckUpdates();
      this.autoCheck.set(value);
    } catch (error) {
      console.error('Error loading auto-check preference:', error);
      // Default to true on error
      this.autoCheck.set(true);
    }
    this.initialized = true;
  }

  async init(): Promise<void> {
    // Ensure we load preferences first
    if (!this.initialized) {
      await this.loadAutoCheckPreference();
    }

    if (this.autoCheck()) {
      this.checkForUpdates();
    }
  }

  async toggleAutoCheck(value: boolean): Promise<void> {
    this.autoCheck.set(value);

    if (!globalThis.window?.electronAPI) {
      return;
    }

    try {
      await globalThis.window.electronAPI.setAutoCheckUpdates(value);
    } catch (error) {
      console.error('Error saving auto-check preference:', error);
    }
  }

  async checkForUpdates(manual = false): Promise<UpdateCheckResult | null> {
    if (this.checking()) return null;

    this.checking.set(true);
    this.checking.set(true);
    try {
      if (!globalThis.window?.electronAPI) {
        console.warn('Electron API not available');
        return null;
      }
      const result = await globalThis.window.electronAPI.checkForUpdates();
      if (result.updateAvailable) {
        this.updateAvailable.set(result);
      } else if (manual) {
        // Clear previous update if any, or just leave it?
        // For manual check, we want to know the result regardless.
      }
      this.lastChecked.set(new Date());
      return result;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return null;
    } finally {
      this.checking.set(false);
    }
  }

  openDownloadPage(): void {
    const update = this.updateAvailable();
    if (update?.url) {
      if (globalThis.window?.electronAPI) {
        globalThis.window.electronAPI.openExternal(update.url);
      } else {
        window.open(update.url, '_blank');
      }
    }
  }

  async getReleaseByTag(tag: string): Promise<GitHubRelease | null> {
    try {
      if (!globalThis.window?.electronAPI) return null;
      return await globalThis.window.electronAPI.getReleaseByTag(tag);
    } catch (error) {
      console.error('Error fetching release by tag:', error);
      return null;
    }
  }
}
