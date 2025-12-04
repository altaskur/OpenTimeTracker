import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: './electron',
    include: ['**/*.spec.ts', '**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    alias: {
      electron: path.resolve(__dirname, 'electron/src/__mocks__/electron.ts'),
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/types.ts',
        'src/**/index.ts',
        'src/generated/**/*',
      ],
      reportsDirectory: '../coverage/electron',
      reporter: ['text', 'lcov', 'html'],
    },
  },
});
