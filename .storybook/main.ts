import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: [
    './*.mdx',
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  staticDirs: ['../public'],
  /* Explicitly include global styles from Angular project */
  previewHead: (head) => `
    ${head}
    <link rel="stylesheet" href="https://unpkg.com/primeicons@7.0.0/primeicons.css">
  `,
};
export default config;
