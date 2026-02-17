import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { resolve } from 'path';
import { existsSync, cpSync, createReadStream } from 'fs';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'electron/src/main/main.ts'),
        },
        output: {
          entryFileNames: '[name].js',
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/preload',
      rollupOptions: {
        input: {
          preload: resolve(__dirname, 'electron/src/preload/preload.ts'),
        },
        output: {
          format: 'cjs',
          entryFileNames: '[name].js',
        },
      },
    },
  },
  renderer: {
    root: '.',
    publicDir: false,
    plugins: [
      angular({
        jit: false,
        workspaceRoot: process.cwd(),
      }),
      // Serve src/assets at /assets/ in dev, copy on build
      {
        name: 'serve-and-copy-assets',
        configureServer(server) {
          server.middlewares.use('/assets', (req, res, next) => {
            const filePath = resolve(
              __dirname,
              'src/assets',
              req.url!.replace(/^\//, ''),
            );
            if (existsSync(filePath)) {
              const ext = filePath.split('.').pop();
              const mimeTypes: Record<string, string> = {
                json: 'application/json',
                png: 'image/png',
                svg: 'image/svg+xml',
                ico: 'image/x-icon',
              };
              res.setHeader(
                'Content-Type',
                mimeTypes[ext || ''] || 'application/octet-stream',
              );
              createReadStream(filePath).pipe(res);
            } else {
              next();
            }
          });
        },
        closeBundle() {
          const src = resolve(__dirname, 'src/assets');
          const dest = resolve(__dirname, 'dist/renderer/assets');
          if (existsSync(src)) {
            cpSync(src, dest, { recursive: true });
          }
        },
      },
    ],
    base: './',
    build: {
      outDir: 'dist/renderer',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html'),
        },
      },
    },
    server: {
      fs: {
        allow: [resolve(__dirname, '.'), resolve(__dirname, 'src')],
      },
    },
    resolve: {
      alias: {
        src: resolve(__dirname, 'src'),
        '/assets': resolve(__dirname, 'src/assets'),
      },
    },
  },
});
