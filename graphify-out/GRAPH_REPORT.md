# Graph Report - .  (2026-07-19)

## Corpus Check
- 250 files · ~121,068 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1439 nodes · 2274 edges · 142 communities (48 shown, 94 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- DatabaseManager
- BackupService
- DatabaseService
- OpenTasks
- paths
- scripts
- OpenCalendar
- OpenHome
- build
- language-handlers
- ActionHistoryService
- OpenProjects
- OpenCalendarPage
- compilerOptions
- OpenHistory
- electron.d
- database.interfaces
- OpenTimeTracker
- options
- preload
- WorkPeriodRepository
- tsconfig
- dependencies
- base.repository
- OpenDayTypesDialogComponent
- OpenWorkConfigDialogComponent
- UpdateService
- TimeEntryService
- OpenLayoutComponent
- TagRepository
- DayOverrideRepository
- .prettierrc
- open-calendar-page
- database.service
- options
- ProjectRepository
- app
- index
- DayService
- ThemeService
- devDependencies
- TimeEntryRepository
- app.config
- OpenSettingsTagsComponent
- WorkConfigRepository
- DayTypeRepository
- ErrorBoundaryComponent
- OpenTimeEntryDialogComponent
- OpenSettingsStatusesComponent
- OpenSettingsUpdatesComponent
- TaskService
- development
- architect
- SafeMarkdownPipe
- AuditLogRepository
- TaskRepository
- TaskStatusRepository
- open-settings-day-types
- ProjectService
- production
- OpenSettingsDayTypesComponent
- TagService
- ElectronNavigationService
- TranslationService
- BaseRepository
- UpdateDialogComponent
- lint
- App
- ConfigService
- AuditService
- update-db-template.mjs
- better-sqlite3
- test-utils
- vite-plugin-angular
- build
- cdk
- common
- compiler
- compiler-cli
- architect
- build-angular
- core
- angular-eslint
- forms
- platform-browser
- platform-browser-dynamic
- router
- better-sqlite3
- config-conventional
- compodoc
- dotenv
- electron
- electron-builder
- rebuild
- electron-vite
- eslint
- inter
- manrope
- husky
- pre-push
- jasmine-core
- jest-mock-extended
- karma
- karma-chrome-launcher
- karma-coverage
- karma-jasmine
- karma-jasmine-html-reporter
- lint-staged
- marked
- core
- http-loader
- primeng
- themes
- adapter-better-sqlite3
- rxjs
- zone
- cli
- prettier
- prisma
- storybook
- addon-a11y
- addon-onboarding
- angular
- better-sqlite3
- jasmine
- node
- typescript
- typescript-eslint
- vitest
- coverage-v8
- main
- typings.d
- vitest.config

## God Nodes (most connected - your core abstractions)
1. `DatabaseManager` - 88 edges
2. `DatabaseService` - 71 edges
3. `OpenTasks` - 36 edges
4. `ActionHistoryService` - 36 edges
5. `OpenCalendar` - 35 edges
6. `BaseRepository` - 30 edges
7. `OpenCalendarPage` - 28 edges
8. `scripts` - 27 edges
9. `OpenHistory` - 24 edges
10. `BackupService` - 22 edges

## Surprising Connections (you probably didn't know these)
- `initializeApp()` --calls--> `setupIpcHandlers()`  [EXTRACTED]
  electron/src/main/main.ts → electron/src/services/ipc/index.ts
- `WindowManager` --references--> `MenuManager`  [EXTRACTED]
  electron/src/main/window.ts → electron/src/services/menu/menu-manager.ts
- `ActionHistoryRepository` --inherits--> `BaseRepository`  [EXTRACTED]
  electron/src/services/database/repositories/audit/action-history.repository.ts → electron/src/services/database/repositories/base.repository.ts
- `AuditLogRepository` --inherits--> `BaseRepository`  [EXTRACTED]
  electron/src/services/database/repositories/audit/audit-log.repository.ts → electron/src/services/database/repositories/base.repository.ts
- `MonthConfigRepository` --inherits--> `BaseRepository`  [EXTRACTED]
  electron/src/services/database/repositories/config/month-config.repository.ts → electron/src/services/database/repositories/base.repository.ts

## Import Cycles
- None detected.

## Communities (142 total, 94 thin omitted)

### Community 0 - "DatabaseManager"
Cohesion: 0.06
Nodes (16): DatabaseManager, setupDatabaseHandlers(), setupAuditHandlers(), setupConfigHandlers(), WorkConfigUpdateData, DayOverrideUpdateData, DayTypeUpdateData, setupDayHandlers() (+8 more)

### Community 1 - "BackupService"
Cohesion: 0.07
Nodes (20): initializeApp(), BackupConfig, BackupInfo, BackupResult, BackupService, __dirname, __filename, TEST_BACKUP_DIR (+12 more)

### Community 2 - "DatabaseService"
Cohesion: 0.07
Nodes (3): DatabaseService, GlobalWithElectronAPI, Injectable

### Community 3 - "OpenTasks"
Cohesion: 0.08
Nodes (6): TaskForm, TaskWithTags, TaskTableComponent, Component, OpenTasks, Component

### Community 4 - "paths"
Cohesion: 0.08
Nodes (17): WindowManager, Migration, migrations, MigrationRunner, NavigationHandler, MockBrowserWindow, WebContentsCall, __dirname (+9 more)

### Community 5 - "scripts"
Cohesion: 0.04
Nodes (48): author, description, license, lint-staged, *.html, *.{json,md}, *.{ts,js}, main (+40 more)

### Community 6 - "OpenCalendar"
Cohesion: 0.06
Nodes (10): CalendarDay, MONTH_KEYS, OpenCalendar, Component, WEEKDAY_KEYS, WeekSummary, formatMinutes(), hoursToMinutes() (+2 more)

### Community 7 - "OpenHome"
Cohesion: 0.06
Nodes (17): Directive, CardVariant, OpenCard, OpenCardProgressbarAriaFixDirective, I18nKeys, Project, StatsTask, StatsToday (+9 more)

### Community 8 - "build"
Cohesion: 0.05
Nodes (44): build, appId, artifactName, asar, asarUnpack, copyright, directories, dmg (+36 more)

### Community 9 - "language-handlers"
Cohesion: 0.10
Nodes (25): app, BrowserWindow, contextBridge, dialog, ipcMain, ipcRenderer, Menu, nativeTheme (+17 more)

### Community 10 - "ActionHistoryService"
Cohesion: 0.10
Nodes (6): ActionHistoryService, ActionType, EntityType, ExecuteActionParams, Injectable, UndoableAction

### Community 11 - "OpenProjects"
Cohesion: 0.10
Nodes (6): OpenConfirmDeleteComponent, Component, ProjectTableComponent, Component, OpenProjects, Component

### Community 13 - "compilerOptions"
Cohesion: 0.08
Nodes (25): compilerOptions, baseUrl, composite, declaration, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, lib (+17 more)

### Community 15 - "electron.d"
Cohesion: 0.10
Nodes (20): ActionHistory, AuditLog, BackupInfo, BackupResult, DayOverride, DaySchedule, DayType, DeleteResult (+12 more)

### Community 16 - "database.interfaces"
Cohesion: 0.13
Nodes (17): ActionHistory, AuditLog, DayOverride, DayType, DeleteResult, MonthConfig, Project, Tag (+9 more)

### Community 17 - "OpenTimeTracker"
Cohesion: 0.11
Nodes (16): analytics, schematicCollections, cli, newProjectRoot, prefix, projectType, root, schematics (+8 more)

### Community 18 - "options"
Cohesion: 0.15
Nodes (17): options, assets, baseHref, browser, codeCoverageExclude, inlineStyleLanguage, karmaConfig, polyfills (+9 more)

### Community 19 - "preload"
Cohesion: 0.12
Nodes (16): ActionHistory, AuditLog, BackupInfo, BackupResult, DayOverride, DayType, DeleteResult, GitHubRelease (+8 more)

### Community 21 - "tsconfig"
Cohesion: 0.12
Nodes (15): ./preview.ts, ../src/**/*.stories.*, ../src/test.ts, ../tsconfig.app.json, ./typings.d.ts, compilerOptions, allowSyntheticDefaultImports, resolveJsonModule (+7 more)

### Community 22 - "dependencies"
Cohesion: 0.13
Nodes (15): @angular/animations, @angular/core, dependencies, @angular/animations, @angular/core, primeflex, primeicons, @prisma/client (+7 more)

### Community 25 - "OpenWorkConfigDialogComponent"
Cohesion: 0.17
Nodes (3): DayConfig, OpenWorkConfigDialogComponent, Component

### Community 26 - "UpdateService"
Cohesion: 0.21
Nodes (3): Injectable, UpdateCheckResult, UpdateService

### Community 28 - "OpenLayoutComponent"
Cohesion: 0.21
Nodes (8): ContentChild, OpenLayoutComponent, TestHostComponent, TestHostNoHeaderComponent, TestHostWithPrimeTemplateComponent, Component, Component, ViewChild

### Community 31 - ".prettierrc"
Cohesion: 0.15
Nodes (12): arrowParens, bracketSameLine, bracketSpacing, endOfLine, htmlWhitespaceSensitivity, printWidth, semi, singleAttributePerLine (+4 more)

### Community 34 - "options"
Cohesion: 0.21
Nodes (12): options, browserTarget, compodoc, compodocArgs, configDir, outputDir, port, options (+4 more)

### Community 36 - "app"
Cohesion: 0.21
Nodes (7): OpenNavComponent, OpenNavTab, StubPageComponent, Component, Component, Component, UpdateBannerComponent

### Community 37 - "index"
Cohesion: 0.23
Nodes (3): ElectronApiError, GlobalErrorHandler, Injectable

### Community 40 - "devDependencies"
Cohesion: 0.18
Nodes (11): @commitlint/cli, cross-env, devDependencies, @commitlint/cli, cross-env, sonarqube-scanner, @storybook/addon-docs, vite (+3 more)

### Community 42 - "app.config"
Cohesion: 0.25
Nodes (5): appConfig, routes, AuraOpen, preview, StoryTranslateLoader

### Community 46 - "ErrorBoundaryComponent"
Cohesion: 0.24
Nodes (4): ErrorBoundaryComponent, TestHostComponent, Component, Component

### Community 51 - "development"
Cohesion: 0.22
Nodes (9): build, builder, configurations, defaultConfiguration, development, buildTarget, extractLicenses, optimization (+1 more)

### Community 52 - "architect"
Cohesion: 0.22
Nodes (9): build-storybook, extract-i18n, storybook, test, builder, builder, architect, builder (+1 more)

### Community 53 - "SafeMarkdownPipe"
Cohesion: 0.28
Nodes (4): dompurify, dompurify, Pipe, SafeMarkdownPipe

### Community 57 - "open-settings-day-types"
Cohesion: 0.28
Nodes (5): OpenSettingsTabsComponent, SettingsTab, StubPageComponent, Component, Component

### Community 59 - "production"
Cohesion: 0.25
Nodes (8): serve, production, budgets, buildTarget, outputHashing, builder, configurations, defaultConfiguration

### Community 62 - "ElectronNavigationService"
Cohesion: 0.32
Nodes (4): ElectronNavigationService, MockElectronAPI, WindowWithOptionalElectronAPI, Injectable

### Community 65 - "UpdateDialogComponent"
Cohesion: 0.33
Nodes (4): Input, Output, Component, UpdateDialogComponent

### Community 66 - "lint"
Cohesion: 0.33
Nodes (6): lint, src/**/*.ts, builder, options, lintFilePatterns, src/**/*.html

### Community 70 - "update-db-template.mjs"
Cohesion: 0.50
Nodes (3): __dirname, distDbPath, templatePath

## Knowledge Gaps
- **326 isolated node(s):** `printWidth`, `tabWidth`, `useTabs`, `semi`, `singleQuote` (+321 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **94 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `scripts`, `SafeMarkdownPipe`, `cdk`, `common`, `compiler`, `forms`, `platform-browser`, `router`, `better-sqlite3`, `inter`, `manrope`, `marked`, `core`, `http-loader`, `primeng`, `themes`, `adapter-better-sqlite3`, `rxjs`, `zone`?**
  _High betweenness centrality (0.148) - this node is a cross-community bridge._
- **Why does `dompurify` connect `SafeMarkdownPipe` to `dependencies`?**
  _High betweenness centrality (0.145) - this node is a cross-community bridge._
- **What connects `printWidth`, `tabWidth`, `useTabs` to the rest of the system?**
  _326 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `DatabaseManager` be split into smaller, more focused modules?**
  _Cohesion score 0.060087719298245613 - nodes in this community are weakly interconnected._
- **Should `BackupService` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `DatabaseService` be split into smaller, more focused modules?**
  _Cohesion score 0.07003367003367003 - nodes in this community are weakly interconnected._
- **Should `OpenTasks` be split into smaller, more focused modules?**
  _Cohesion score 0.07510204081632653 - nodes in this community are weakly interconnected._