---
trigger: always_on
---

# AI Guidelines for OpenTimeTracker

This document provides context and rules for AI agents contributing to OpenTimeTracker. Follow these guidelines to ensure consistency, quality, and adherence to project standards.

## Project Overview

- **Name**: OpenTimeTracker
- **Purpose**: Free, open-source, local-first time tracking application.
- **Key Features**: Offline-first (SQLite), no subscriptions, cross-platform (Windows, macOS, Linux).

## Tech Stack

- **Frontend**: Angular 21 (Signals, Standalone Components, strict mode).
- **Desktop Wrapper**: Electron 37 (IPC for Node.js access).
- **Database**: SQLite via Prisma (local file `timetracker.db`).
- **UI Component Library**: PrimeNG 21 + PrimeFlex.
- **State Management**: Angular Signals + Services (avoid NgRx unless strictly necessary).
- **Internationalization**: `@ngx-translate/core`.

## Coding Standards

### TypeScript & Angular

- **Strict Typing**: No `any`. Define interfaces for all data structures.
- **Signals**: Use Angular Signals for state reactivity. Avoid `BehaviorSubject` where Signals suffice.
- **Standalone Components**: All new components must be `standalone: true`.
- **Control Flow**: Use modern Angular control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`.
- **Change Detection**: Use `OnPush` strategy where possible.

### Electron & IPC

- **Security**: Enable context isolation and sandbox.
- **IPC**: Use `ipcMain.handle` and `ipcRenderer.invoke` for bidirectional communication.
- **Preload Scripts**: Expose typed APIs via `contextBridge`.

### CSS & Styling

- **PrimeFlex**: Use PrimeFlex utility classes for layout and spacing (e.g., `flex`, `gap-2`, `p-3`).
- **SCSS**: Use component-specific SCSS for custom styles not covered by PrimeFlex.
- **Variables**: Use CSS variables for theming (e.g., `var(--primary-color)`).

### Git & Commits

- **Conventional Commits**: `type(scope): description`.
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
  - Example: `feat(calendar): add weekly view support`.

## Architecture

### Directory Structure

- `src/app`: Angular application code.
- `src/assets`: Static assets and i18n files.
- `electron/src`: Electron main process and preload scripts.
- `electron/src/services`: IPC handlers and Node.js logic.
- `prisma`: Database schema and migrations.

### Internationalization (i18n)

- All user-facing text must be translatable.
- Keys: `SECTION.FEATURE.KEY` (e.g., `SETTINGS.UPDATES.CHECK_NOW`).
- Files: `src/assets/i18n/en.json`, `src/assets/i18n/es.json`.
- Tools: `TranslateService`, `TranslatePipe`.

### Testing

- **Unit Tests**: Jasmine + Karma (Angular), Vitest (Electron).
- **Coverage**: Maintain high coverage (>80%).
- **SonarQube**: Respect quality gates. Run `npm run sonar:check` before pushing.

### UI Development (Storybook)

- Create stories for new dumb/presentational components.
- Path: `src/app/components/[name]/[name].stories.ts`.
- Run: `npm run storybook`.

## Workflows

### Database Changes

1. Modify `prisma/schema.prisma`.
2. Run `npx prisma migrate dev --name <migration_name>`.
3. Run `npm run prisma:template` to update production template.

### Adding a New Feature

1. Design component/service hierarchy.
2. Implement core logic and state.
3. Add UI with PrimeNG/PrimeFlex.
4. Add i18n keys to English and Spanish.
5. Add Unit Tests.
6. (Optional) Add Storybook story.
7. Verify with `npm run sonar:check`.

## Context for AI

- **Do not** suggest cloud-based solutions unless explicitly asked (Local-first philosophy).
- **Do not** introduce new heavy dependencies without approval.
- **Always** check `package.json` scripts (`dev`, `build`, `test`, `sonar:check`) for running tasks.
- **Always** favor modern Angular syntax (Signals, Control Flow).

## Essential Commands

- **Run Project**: `npm run dev` (Runs Angular + Electron in development mode).
- **Run Tests & Quality Checks**: `npm run sonar:check` (Runs Unit Tests, Coverage, and SonarQube analysis). Use this to verify your changes.
