import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Service to manage translations and sync with Electron language preferences
 */
@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly translate = inject(TranslateService);

  constructor() {
    this.initializeLanguage();
  }

  /**
   * Initializes language from Electron preferences
   */
  private async initializeLanguage(): Promise<void> {
    this.translate.addLangs(['es', 'en']);
    this.translate.setDefaultLang('es');

    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        const savedLang = await window.electronAPI.getLanguage();
        this.translate.use(savedLang);

        window.electronAPI.onLanguageChange((lang: string) => {
          this.translate.use(lang);
        });
      } catch {
        this.translate.use('es');
      }
    } else {
      this.translate.use('es');
    }
  }

  /**
   * Gets the current language
   */
  getCurrentLanguage(): string {
    return this.translate.currentLang || 'es';
  }

  /**
   * Changes the current language
   */
  setLanguage(lang: string): void {
    this.translate.use(lang);
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.setLanguage(lang);
    }
  }

  /**
   * Gets translation for a key
   */
  instant(key: string): string {
    return this.translate.instant(key);
  }
}
