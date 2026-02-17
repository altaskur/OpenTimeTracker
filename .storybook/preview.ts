import type { Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import { applicationConfig } from '@storybook/angular';
import docJson from '../documentation.json';

/* Import PrimeNG configuration */
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import { AuraOpen } from '../src/app/themes/aura-open.preset';

/* Import i18n configuration */
import { importProvidersFrom } from '@angular/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';

/*
 * Mock TranslateLoader for Storybook
 * Empty - all translations are handled in individual stories
 */
class StoryTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

setCompodocJson(docJson);

const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        providePrimeNG({
          theme: {
            preset: AuraOpen,
            options: {
              darkModeSelector: '.my-app-dark',
              cssLayer: false,
            },
          },
          inputVariant: 'outlined',
          ripple: true,
        }),
        importProvidersFrom(
          TranslateModule.forRoot({
            defaultLanguage: 'es',
            loader: {
              provide: TranslateLoader,
              useClass: StoryTranslateLoader,
            },
          }),
        ),
      ],
    }),
    (story, context) => {
      /* Handle theme switching from story args */
      const theme = context.args['theme'] || 'dark';
      if (theme === 'dark') {
        document.documentElement.classList.add('my-app-dark');
        document.documentElement.classList.remove('my-app-light');
      } else {
        document.documentElement.classList.remove('my-app-dark');
        document.documentElement.classList.add('my-app-light');
      }

      /*
       * Handle language switching from story args
       * Note: TranslateService is configured with the selected locale
       * Components using computed signals with translate.instant() will
       * need to use the locale from args in their render functions
       */
      const locale = context.args['locale'] || 'es';

      return story({ locale });
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#09090b',
        },
        {
          name: 'light',
          value: '#ffffff',
        },
      ],
    },
  },
};

export default preview;
