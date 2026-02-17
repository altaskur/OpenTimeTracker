import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Custom PrimeNG Aura preset for OpenTimeTracker with teal/cyan primary palette.
 *
 * Color Palette:
 * - Light Mode: Teal primary (#0D9488), Slate surface, Dark text
 * - Dark Mode: Teal primary (#14B8A6), Slate surface, Light text
 *
 * This preset uses ONLY the specified color palette without introducing
 * additional semantic colors. Green, red, blue, etc. are inherited from
 * the Aura base theme.
 */
export const AuraOpen = definePreset(Aura, {
  semantic: {
    // Primary palette based on teal/cyan colors
    primary: {
      50: '{teal.50}',
      100: '{teal.100}',
      200: '{teal.200}',
      300: '{teal.300}',
      400: '{teal.400}',
      500: '{teal.500}',
      600: '{teal.600}',
      700: '{teal.700}',
      800: '{teal.800}',
      900: '{teal.900}',
      950: '{teal.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{teal.600}', // #0D9488
          contrastColor: '#ffffff',
          hoverColor: '{teal.700}', // #0F766E
          activeColor: '{teal.800}',
        },
        highlight: {
          background: '{teal.600}',
          focusBackground: '{teal.700}',
          color: '#ffffff',
          focusColor: '#ffffff',
        },
        surface: {
          0: '#ffffff',
          50: '{slate.50}', // #f8fafc - Background
          100: '{slate.100}',
          200: '{slate.200}', // #e2e8f0 - Surface
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}', // #0f172a - Text Primary
          950: '{slate.950}',
          ground: '{slate.50}', // #F8FAFC - Background
          card: '{surface.0}',
          border: '{slate.300}',
          hover: '{slate.100}',
        },
        text: {
          color: '{slate.900}', // #0F172A - Text Primary
          hoverColor: '{slate.950}',
          mutedColor: '{slate.600}', // #475569 - Text Secondary
          hoverMutedColor: '{slate.700}',
        },
      },
      dark: {
        primary: {
          color: '{teal.500}', // #14B8A6
          contrastColor: '{slate.900}',
          hoverColor: '{teal.600}', // #0D9488
          activeColor: '{teal.700}',
        },
        highlight: {
          background: 'color-mix(in srgb, {teal.500} 16%, transparent)',
          focusBackground: 'color-mix(in srgb, {teal.500} 24%, transparent)',
          color: '{teal.200}',
          focusColor: '{teal.100}',
        },
        surface: {
          0: '#ffffff',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}', // #1E293B - Surface
          900: '{slate.900}', // #0F172A - Background
          950: '{slate.950}',
          ground: '{slate.900}', // #0F172A - Background
          card: '{slate.800}',
          border: '{slate.700}',
          hover: '{slate.800}',
        },
        text: {
          color: '{slate.200}', // #E2E8F0 - Text Primary
          hoverColor: '{slate.100}',
          mutedColor: '{slate.400}', // #94A3B8 - Text Secondary
          hoverMutedColor: '{slate.300}',
        },
      },
    },
    focusRing: {
      width: '2px',
      style: 'solid',
      color: '{primary.color}',
      offset: '2px',
    },
  },
});
