import { Injectable, signal } from '@angular/core';

interface UpdateCheckResult {
    updateAvailable: boolean;
    version: string;
    url: string;
    releaseNotes?: string;
}

@Injectable({
    providedIn: 'root',
})
export class UpdateService {
    updateAvailable = signal<UpdateCheckResult | null>(null);
    checking = signal<boolean>(false);
    autoCheck = signal<boolean>(true);

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
        try {
            const result = await window.electronAPI.checkForUpdates();
            if (result.updateAvailable) {
                this.updateAvailable.set(result);
            } else if (manual) {
                // Clear previous update if any, or just leave it?
                // For manual check, we want to know the result regardless.
            }
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
            window.electronAPI.openExternal(update.url);
        }
    }

    async getReleaseByTag(tag: string): Promise<{ body: string } | null> {
        try {
            return await window.electronAPI.getReleaseByTag(tag);
        } catch (error) {
            console.error('Error fetching release by tag:', error);
            return null;
        }
    }
}
