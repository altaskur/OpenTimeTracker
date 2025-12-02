import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';

import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';

import { AuraBlack } from './themes/aura-black.preset';
import {
  GlobalErrorHandler,
  ThemeService,
  TranslationService,
} from './services';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    TranslateModule.forRoot({
      defaultLanguage: 'es',
    }).providers!,
    provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json',
    }),
    providePrimeNG({
      theme: {
        preset: AuraBlack,
        options: {
          darkModeSelector: '.my-app-dark',
        },
      },
      inputVariant: 'outlined',
      ripple: true,
    }),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideAppInitializer(() => inject(ThemeService).init()),
    provideAppInitializer(() => inject(TranslationService).init()),
    MessageService,
  ],
};
