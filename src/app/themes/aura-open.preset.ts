import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Custom PrimeNG Aura preset for OpenTimeTracker — paleta "graphite + rose".
 *
 * Color Palette:
 * - Light Mode: Rose primary (#D98B8B), Graphite surface, Dark text
 * - Dark Mode: Rose primary (#D98B8B), Graphite surface, Light text
 *
 * Reemplaza la paleta teal/slate anterior. El acento es intercambiable:
 * alternativas ya probadas en el rediseño: amber #D9A15B, violet #A98BD9, teal #5FB8AC.
 */
export const AuraOpen = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fbf1f0',
      100: '#f5dcda',
      200: '#eebdb9',
      300: '#e29d97',
      400: '#d98b8b',
      500: '#d07571',
      600: '#c15f5a',
      700: '#a14b47',
      800: '#813c39',
      900: '#69312f',
      950: '#381917',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
        highlight: {
          background: '{primary.500}',
          focusBackground: '{primary.600}',
          color: '#ffffff',
          focusColor: '#ffffff',
        },
        surface: {
          0: '#ffffff',
          50: '#faf9f8',
          100: '#f0eeec',
          200: '#e2dfdc',
          300: '#c9c5c1',
          400: '#a8a29c',
          500: '#79746e',
          600: '#57524d',
          700: '#413d3a',
          800: '#2c2926',
          900: '#1c1a18',
          950: '#0f0d0c',
          ground: '#faf9f8',
          card: '{surface.0}',
          border: '#c9c5c1',
          hover: '#f0eeec',
        },
        text: {
          color: '#1c1a18',
          hoverColor: '#0f0d0c',
          mutedColor: '#57524d',
          hoverMutedColor: '#413d3a',
        },
      },
      dark: {
        primary: {
          color: '{primary.400}',
          contrastColor: '#241c12',
          hoverColor: '{primary.300}',
          activeColor: '{primary.200}',
        },
        highlight: {
          background: 'color-mix(in srgb, {primary.400} 16%, transparent)',
          focusBackground: 'color-mix(in srgb, {primary.400} 24%, transparent)',
          color: '{primary.200}',
          focusColor: '{primary.100}',
        },
        surface: {
          0: '#ffffff',
          50: '#faf9f8',
          100: '#f0eeec',
          200: '#e2dfdc',
          300: '#c9c5c1',
          400: '#a8a29c',
          500: '#79746e',
          600: '#57524d',
          700: '#413d3a',
          800: '#332f2c', // tarjetas
          900: '#211e1b', // fondo
          950: '#141211',
          ground: '#211e1b',
          card: '#332f2c',
          border: '#413d3a',
          hover: '#3d3936',
        },
        text: {
          color: '#f0eeec',
          hoverColor: '#faf9f8',
          mutedColor: '#a8a29c',
          hoverMutedColor: '#c9c5c1',
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
