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

  /**
   * Initializes language from Electron preferences
   */
  async init(): Promise<void> {
    this.translate.addLangs(['es', 'en']);
    this.translate.setFallbackLang('es');

    if (globalThis.window?.electronAPI) {
      try {
        const savedLang = await globalThis.window.electronAPI.getLanguage();
        this.translate.use(savedLang);

        globalThis.window.electronAPI.onLanguageChange((lang: string) => {
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
    return this.translate.getCurrentLang() || 'es';
  }

  /**
   * Changes the current language
   */
  setLanguage(lang: string): void {
    this.translate.use(lang);
    if (globalThis.window?.electronAPI) {
      globalThis.window.electronAPI.setLanguage(lang);
    }
  }

  /**
   * Gets translation for a key
   */
  instant(key: string): string {
    return this.translate.instant(key);
  }
}
