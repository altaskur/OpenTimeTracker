# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm install && npm run prisma:generate   # Initial setup
npm run dev                              # Run Angular + Electron in dev mode (recommended)
npm start                                # Electron preview (post-build)

# Testing
npm test                                 # Angular tests (Karma/Jasmine)
npm run test:electron                    # Electron/Node tests (Vitest)
npm run test:electron:watch              # Electron tests in watch mode
npm run test:coverage                    # Angular tests with coverage (headless)
npm run test:electron:coverage           # Electron tests with coverage

# Linting & Formatting
npm run lint                             # ESLint
npm run lint:fix                         # ESLint with auto-fix
npm run format                           # Prettier on src/**/*.{ts,html,scss}

# Building & Distribution
npm run build                            # Build Angular + Electron via electron-vite
npm run dist                             # Build + package for current platform
npm run dist:win / dist:linux / dist:mac # Platform-specific packaging

# Database
npm run prisma:generate                  # Regenerate Prisma client
npm run prisma:migrate                   # Create a new migration (prompts for name)
npm run prisma:push                      # Push schema changes without a migration file
npm run prisma:template                  # Update prisma/template.db after migrations
npm run prisma:studio                    # Open Prisma Studio

# Quality (requires SonarQube running: docker-compose up -d)
npm run sonar                            # Run SonarQube analysis only
npm run sonar:check                      # Full check: tests + coverage + SonarQube analysis

# Storybook
npm run storybook                        # Component explorer at http://localhost:6006
npm run build-storybook                  # Static Storybook build
```

## Architecture

OpenTimeTracker is an **Angular + Electron** desktop app with a strict **process separation** enforced by the Electron security model.

### Process Boundary (Critical)

The app is split into three Electron processes:

- **Main process** (`electron/src/main/`) — Node.js, has filesystem/database access. Handles IPC requests, manages the SQLite database via Prisma, handles backups, updates, and the native menu.
- **Preload** (`electron/src/preload/preload.ts`) — Bridge: exposes a typed `window.electronAPI` object to the renderer using `contextBridge`. **All** Angular-to-Electron communication goes through this API.
- **Renderer** (`src/`) — Angular 21 SPA, runs in a sandboxed browser context. Cannot use Node.js APIs directly; must call `window.electronAPI.*` for all data operations.

### Angular Frontend (`src/app/`)

- **Pages** (`src/app/pages/`) — Lazy-loaded route components: `open-home`, `open-calendar-page`, `open-projects`, `open-tasks`, `open-history`, `open-settings-*`
- **Services** (`src/app/services/`) — Angular services that wrap `window.electronAPI` calls. Database services live in `src/app/services/database/`. Also contains `navigation`, `theme`, `translation`, and `update` services.
- **Components** (`src/app/components/`) — Reusable UI components, each may have a `.stories.ts` for Storybook
- **UI Stack**: PrimeNG components + PrimeFlex utilities, dark theme (Aura Black) by default
- **i18n**: `@ngx-translate`, language files at `src/assets/i18n/en.json` and `src/assets/i18n/es.json`

### Electron Main (`electron/src/main/`)

- `main.ts` / `window.ts` — App entry, BrowserWindow creation
- `ipc/` — IPC handler registration (maps channel names to service calls)
- `database/` — Prisma client initialization and database management
- `backup/`, `update/`, `menu/`, `navigation/` — Feature-specific main-process logic

### Database

- **Prisma** with **SQLite** (`better-sqlite3` adapter)
- Schema at `prisma/schema.prisma`; generated client outputs to `electron/src/generated/prisma/`
- `prisma/template.db` — clean DB shipped with releases; user data goes to `dist/data/timetracker.db`
- After any schema change: run migration, then `npm run prisma:template` to update the template

### Build System

- **electron-vite** orchestrates all three Electron targets (main, preload, renderer)
- The renderer uses `@analogjs/vite-plugin-angular` for Angular compilation
- Output: `dist/main/`, `dist/preload/`, `dist/renderer/`
- `src` alias resolves to the `src/` directory for imports

### Testing

- **Angular tests**: Karma + Jasmine, configured in `karma.conf.cjs` and `tsconfig.spec.json`
- **Electron/main tests**: Vitest, root at `./electron`, mocks the `electron` module from `electron/src/__mocks__/electron.ts`

## Branching & Commits

- Default branch: `main`. Active development on `develop`. Branch from `develop` using `feat/`, `fix/`, or `chore/` prefixes.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (enforced by commitlint).
- Pre-push hook runs `sonar:check`; requires a running local SonarQube instance (`docker-compose up -d`).
