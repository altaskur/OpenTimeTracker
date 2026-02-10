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

  constructor() {
    // Load auto-check preference
    const savedAutoCheck = localStorage.getItem('autoCheckUpdates');
    if (savedAutoCheck !== null) {
      this.autoCheck.set(JSON.parse(savedAutoCheck));
    }
  }

  init(): void {
    if (this.autoCheck()) {
      this.checkForUpdates();
    }
  }

  toggleAutoCheck(value: boolean): void {
    this.autoCheck.set(value);
    localStorage.setItem('autoCheckUpdates', JSON.stringify(value));
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
