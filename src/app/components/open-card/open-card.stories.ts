import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { OpenCard } from './open-card';

/**
 * Extended type for story args including theme and locale controls
 */
interface StoryArgs {
  variant?: 'project' | 'task' | 'stats-time' | 'stats-count';
  statsModifier?: 'today' | 'week' | 'tasks';
  icon?: string;
  iconLabel?: string;
  title?: string;
  subtitle?: string;
  status?: string;
  statusSeverity?: 'success' | 'info' | 'warn' | 'danger' | 'secondary';
  tags?: string[];
  progress?: number;
  worked?: string;
  target?: string;
  remaining?: string;
  bigNumber?: number;
  theme?: 'light' | 'dark';
  locale?: 'es' | 'en';
}

/**
 * Translation records for story content
 * Maps prop names to locale-specific values
 */
type I18nKeys = Record<string, { es: string; en: string }>;

/**
 * Helper function to create i18n-reactive stories
 * Creates a render function that updates props when locale changes in toolbar
 */
function createI18nStory(
  baseArgs: Record<string, unknown>,
  i18nKeys: I18nKeys = {},
): StoryObj<StoryArgs> {
  return {
    render: (args) => {
      const locale = (args.locale || 'es') as 'es' | 'en';
      const translatedProps: Record<string, unknown> = {};

      /* Apply explicit translations based on current locale */
      Object.entries(i18nKeys).forEach(([key, values]) => {
        translatedProps[key] = values[locale];
      });

      /*
       * Auto-translate iconLabel based on statsModifier
       * Each story manages its own translations inline
       */
      const statsModifier = baseArgs['statsModifier'] as string | undefined;
      if (statsModifier && !i18nKeys['iconLabel']) {
        const iconLabelTranslations: Record<
          string,
          { es: string; en: string }
        > = {
          today: { es: 'Hoy', en: 'Today' },
          week: { es: 'Esta semana', en: 'This week' },
          tasks: { es: 'Tareas hoy', en: 'Tasks today' },
        };

        if (iconLabelTranslations[statsModifier]) {
          translatedProps['iconLabel'] =
            iconLabelTranslations[statsModifier][locale];
        }
      }

      /*
       * Auto-calculate progress from worked/target if both are provided
       * Parses time strings like "4h 30m" and "8h" to calculate percentage
       */
      const worked = baseArgs['worked'] as string | undefined;
      const target = baseArgs['target'] as string | undefined;
      if (worked && target && !baseArgs['progress']) {
        const parseTime = (timeStr: string): number => {
          const hourRegex = /(\d+)h/;
          const minuteRegex = /(\d+)m/;
          const hoursMatch = hourRegex.exec(timeStr);
          const minutesMatch = minuteRegex.exec(timeStr);
          return (
            (hoursMatch ? parseInt(hoursMatch[1]) * 60 : 0) +
            (minutesMatch ? parseInt(minutesMatch[1]) : 0)
          );
        };

        const workedMinutes = parseTime(worked);
        const targetMinutes = parseTime(target);

        if (targetMinutes > 0) {
          translatedProps['progress'] = Math.round(
            (workedMinutes / targetMinutes) * 100,
          );
        }
      }

      /*
       * Auto-translate remaining prefix (Restante: / Remaining:)
       * Story manages the full translated string
       */
      const remaining = baseArgs['remaining'] as string | undefined;
      if (remaining && !i18nKeys['remaining']) {
        const prefix = locale === 'es' ? 'Restante' : 'Remaining';
        translatedProps['remaining'] = `${prefix}: ${remaining}`;
      }

      return {
        props: {
          ...args,
          ...translatedProps,
        },
      };
    },
    args: baseArgs,
  };
}

const meta: Meta<StoryArgs> = {
  title: 'Components/OpenCard',
  component: OpenCard,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Generic card component for displaying projects, tasks, and statistics.
This component replaces the previous ProjectCard, TaskCard, and StatsCard components
with a unified implementation using 4 variants.

### Variants
- **project**: Displays a project card with icon and title
- **task**: Displays a task card with title, subtitle, status, and tags
- **stats-time**: Displays time statistics with progress bars (today/week)
- **stats-count**: Displays count statistics with a large number (tasks)

### Features
- **Themeable**: Supports light and dark modes (use the theme toolbar)
- **i18n Ready**: Supports Spanish and English (use the locale toolbar)
- **Responsive**: Adapts to different screen sizes
- **Accessible**: ARIA labels and semantic HTML
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['project', 'task', 'stats-time', 'stats-count'],
      description: 'Card variant type',
    },
    statsModifier: {
      control: 'select',
      options: ['today', 'week', 'tasks'],
      description: 'Modifier for stats variant (today/week/tasks colors)',
    },
    icon: {
      control: 'text',
      description: 'PrimeIcons class name',
    },
    progress: {
      control: false,
      description: 'Progress percentage (auto-calculated from worked/target)',
    },
    theme: {
      control: { type: 'select' },
      options: ['light', 'dark'],
      description: 'Theme mode',
      table: { category: 'Story' },
    },
    locale: {
      control: { type: 'select' },
      options: ['es', 'en'],
      description: 'Language',
      table: { category: 'Story' },
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

/**
 * Today's time statistics
 * Displays worked time vs target with auto-calculated progress
 */
export const StatsToday: Story = {
  args: {
    theme: 'light',
  },

  ...createI18nStory({
    variant: 'stats-time',
    statsModifier: 'today',
    icon: 'pi-sun',
    worked: '4h 30m',
    target: '8h',
    remaining: '3h 30m',
    theme: 'dark',
    locale: 'es',
  }),

  argTypes: {
    // Show only stats-time relevant controls
    worked: { control: 'text' },
    target: { control: 'text' },
    remaining: { control: 'text' },
    // Hide other variant controls
    title: { table: { disable: true } },
    subtitle: { table: { disable: true } },
    status: { table: { disable: true } },
    statusSeverity: { table: { disable: true } },
    tags: { table: { disable: true } },
    bigNumber: { table: { disable: true } },
  },
};

/**
 * Weekly time statistics
 * Displays worked time vs target with auto-calculated progress
 */
export const StatsWeek: Story = {
  ...createI18nStory({
    variant: 'stats-time',
    statsModifier: 'week',
    icon: 'pi-calendar-clock',
    worked: '22h 15m',
    target: '40h',
    remaining: '17h 45m',
    theme: 'dark',
    locale: 'es',
  }),
  argTypes: {
    // Show only stats-time relevant controls
    worked: { control: 'text' },
    target: { control: 'text' },
    remaining: { control: 'text' },
    // Hide other variant controls
    title: { table: { disable: true } },
    subtitle: { table: { disable: true } },
    status: { table: { disable: true } },
    statusSeverity: { table: { disable: true } },
    tags: { table: { disable: true } },
    bigNumber: { table: { disable: true } },
  },
};

/**
 * Task count statistics
 * Displays total number of tasks completed today
 */
export const StatsTask: Story = {
  ...createI18nStory({
    variant: 'stats-count',
    statsModifier: 'tasks',
    icon: 'pi-check-square',
    bigNumber: 12,
    theme: 'dark',
    locale: 'es',
  }),
  argTypes: {
    // Show only stats-count relevant controls
    bigNumber: { control: 'number' },
    // Hide other variant controls
    title: { table: { disable: true } },
    subtitle: { table: { disable: true } },
    status: { table: { disable: true } },
    statusSeverity: { table: { disable: true } },
    tags: { table: { disable: true } },
    worked: { table: { disable: true } },
    target: { table: { disable: true } },
    remaining: { table: { disable: true } },
  },
};

/**
 * Task card example
 * Displays a task with title, description, status, and tags
 */
export const Task: Story = {
  ...createI18nStory(
    {
      variant: 'task',
      statusSeverity: 'info',
      tags: ['feature', 'ui', 'calendar'],
      theme: 'dark',
      locale: 'es',
    },
    {
      title: {
        es: 'Añadir vista de calendario',
        en: 'Add calendar view',
      },
      subtitle: {
        es: 'Desarrollar componente de calendario para seguimiento de entradas de tiempo',
        en: 'Develop calendar component for tracking time entries',
      },
      status: {
        es: 'En progreso',
        en: 'In Progress',
      },
    },
  ),
  argTypes: {
    // Show only task relevant controls
    title: { control: 'text' },
    subtitle: { control: 'text' },
    status: { control: 'text' },
    statusSeverity: {
      control: 'select',
      options: ['success', 'info', 'warn', 'danger', 'secondary'],
    },
    tags: { control: 'object' },
    // Hide other variant controls
    worked: { table: { disable: true } },
    target: { table: { disable: true } },
    remaining: { table: { disable: true } },
    bigNumber: { table: { disable: true } },
  },
};

/**
 * Project card example
 * Displays a project with icon and name
 */
export const Project: Story = {
  ...createI18nStory({
    variant: 'project',
    icon: 'pi-folder',
    title: 'OpenTimeTracker',
    theme: 'dark',
    locale: 'es',
  }),
  argTypes: {
    // Show only project relevant controls
    title: { control: 'text' },
    // Hide other variant controls
    subtitle: { table: { disable: true } },
    status: { table: { disable: true } },
    statusSeverity: { table: { disable: true } },
    tags: { table: { disable: true } },
    worked: { table: { disable: true } },
    target: { table: { disable: true } },
    remaining: { table: { disable: true } },
    bigNumber: { table: { disable: true } },
  },
};
