# Architecture & Technical Design

This document describes the architecture, design patterns, and technical decisions in OpenTimeTracker.

## System Overview

OpenTimeTracker is a **desktop application** built with modern web technologies:

```
┌─────────────────────────────────────────────┐
│           Electron Application              │
├─────────────────────────────────────────────┤
│  ┌────────────────┐    ┌─────────────────┐ │
│  │   Renderer     │◄──►│  Main Process   │ │
│  │  (Angular 21)  │IPC │   (Node.js)     │ │
│  └────────────────┘    └─────────────────┘ │
│         │                      │            │
│         ▼                      ▼            │
│  ┌────────────────┐    ┌─────────────────┐ │
│  │   PrimeNG UI   │    │  Prisma Client  │ │
│  └────────────────┘    └─────────────────┘ │
│                               │             │
│                               ▼             │
│                        ┌─────────────────┐  │
│                        │ SQLite Database │  │
│                        └─────────────────┘  │
└─────────────────────────────────────────────┘
```

## Architecture Layers

### 1. Presentation Layer (Angular Frontend)

**Technology**: Angular 21 with standalone components

**Responsibilities**:
- User interface rendering
- User interaction handling
- State management (services)
- Form validation
- Internationalization (i18n)

**Key Components**:
- `src/app/pages/*` - Page components (routing targets)
- `src/app/components/*` - Reusable UI components
- `src/app/services/*` - Business logic and state
- `src/app/interfaces/*` - TypeScript interfaces

**UI Framework**: PrimeNG + PrimeFlex
- Component library: PrimeNG
- Utility classes: PrimeFlex
- Default theme: Aura Black (dark mode)

### 2. IPC Communication Layer

**Technology**: Electron IPC (Inter-Process Communication)

**Pattern**: Request-Response with type safety

The renderer process communicates with the main process through a secure IPC bridge:

```typescript
// Renderer side (Angular)
window.electronAPI.database.createProject(projectData)

// Preload script (Bridge)
contextBridge.exposeInMainWorld('electronAPI', {
  database: {
    createProject: (data) => ipcRenderer.invoke('db:createProject', data)
  }
})

// Main process (Electron)
ipcMain.handle('db:createProject', async (event, data) => {
  return await prisma.project.create({ data })
})
```

**Security**:
- Context isolation enabled
- Node integration disabled in renderer
- Preload script as secure bridge

### 3. Business Logic Layer (Electron Main Process)

**Technology**: Node.js (Electron Main Process)

**Responsibilities**:
- Database operations via Prisma
- File system operations
- Application lifecycle management
- Automatic backups
- Window management

**Key Files**:
- `electron/src/main/main.ts` - Application entry point
- `electron/src/main/database.ts` - Database operations
- `electron/src/preload/preload.ts` - IPC bridge

### 4. Data Layer (Prisma + SQLite)

**Technology**: Prisma ORM + SQLite

**Responsibilities**:
- Data persistence
- Schema management
- Migrations
- Type-safe database access

**Database Location**:
- Development: `./dist/data/timetracker.db`
- Production: 
  - Windows: `%APPDATA%/OpenTimeTracker/data/timetracker.db`
  - macOS: `~/Library/Application Support/OpenTimeTracker/data/timetracker.db`
  - Linux: `~/.config/OpenTimeTracker/data/timetracker.db`

---

## Data Model

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Project    │──1:N──│     Task     │──N:M──│     Tag      │
└──────────────┘       └──────────────┘       └──────────────┘
       │                      │
       │                      │
       │1:N                   │1:N
       │                      │
       ▼                      ▼
┌──────────────┐       ┌──────────────┐
│  AuditLog    │       │  TimeEntry   │
└──────────────┘       └──────────────┘
                              
                       ┌──────────────┐
                       │  TaskStatus  │
                       └──────────────┘
                              │1:N
                              ▼
                       ┌──────────────┐
                       │     Task     │
                       └──────────────┘
```

### Core Entities

#### Project
- Container for related tasks
- Can be closed when completed
- Tracks creation/update timestamps
- Related to audit logs

#### Task
- Belongs to a project
- Has a status (optional)
- Can have multiple tags
- Tracks time entries
- Stores estimated hours

#### Tag
- Reusable labels for tasks
- Many-to-many relationship with tasks
- Global across all projects

#### TaskStatus
- Customizable workflow states
- Default status can be set
- Color-coded for UI
- Examples: "To Do", "In Progress", "Done"

#### TimeEntry
- Records time worked
- Optional task association
- Date-based
- Stores minutes and notes

#### WorkConfig (Singleton)
- Global work configuration template
- Daily/weekly minute targets
- Work days configuration
- Per-day schedule

#### MonthConfig
- Overrides WorkConfig for specific months
- Month-specific work days and schedules

#### DayType
- Types of special days (holidays, vacation, etc.)
- Color-coded
- Default minutes configuration

#### DayOverride
- Specific day overrides
- Associates with DayType
- Custom minutes and notes

#### AppSettings (Singleton)
- Application-wide settings
- Dark mode preference
- Language selection

#### AuditLog
- Tracks entity changes
- Records action type and changes
- Associates with projects/tasks

#### ActionHistory
- Undo/redo functionality
- Stores previous and new data
- Tracks undone status

---

## Design Patterns

### 1. Service Layer Pattern

Angular services encapsulate business logic and state:

```typescript
@Injectable({ providedIn: 'root' })
export class ProjectService {
  async getProjects(): Promise<Project[]> {
    return window.electronAPI.database.getProjects()
  }
}
```

**Benefits**:
- Separation of concerns
- Reusable business logic
- Easy testing with mocks

### 2. Repository Pattern

Database operations abstracted through Prisma:

```typescript
// Main process
const project = await prisma.project.create({
  data: { name, description },
  include: { tasks: true }
})
```

### 3. Observer Pattern

Angular's RxJS for reactive state management:

```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private isDarkMode$ = new BehaviorSubject<boolean>(true)
  
  get isDarkMode() {
    return this.isDarkMode$.asObservable()
  }
}
```

### 4. Strategy Pattern

Translation strategy for i18n:

```typescript
@Injectable({ providedIn: 'root' })
export class TranslationService {
  setLanguage(lang: 'en' | 'es') {
    this.translate.use(lang)
  }
}
```

---

## Key Technical Decisions

### Why Electron?

✅ **Pros**:
- Cross-platform (Windows, macOS, Linux)
- Single codebase
- Native OS integration
- Access to Node.js APIs
- Large ecosystem

❌ **Cons**:
- Larger bundle size
- Memory footprint
- Requires distributing Chromium

**Conclusion**: Best choice for local-first desktop app with web technologies.

### Why SQLite?

✅ **Pros**:
- File-based (no server needed)
- Fast for local operations
- ACID compliant
- Zero configuration
- Easy backups

❌ **Cons**:
- No built-in sync
- Single-user by design

**Conclusion**: Perfect for local-first, privacy-focused application.

### Why Prisma?

✅ **Pros**:
- Type-safe database access
- Auto-generated client
- Migration system
- Great DX (Developer Experience)
- Works well with SQLite

❌ **Cons**:
- Client generation step
- Limited advanced SQL features

**Conclusion**: Best ORM for TypeScript + SQLite + Electron.

### Why Angular?

✅ **Pros**:
- Full framework (batteries included)
- Strong TypeScript support
- Dependency injection
- RxJS integration
- Large ecosystem

❌ **Cons**:
- Steeper learning curve
- Bundle size
- Opinionated structure

**Conclusion**: Excellent choice for complex, maintainable applications.

### Why PrimeNG?

✅ **Pros**:
- Comprehensive component library
- Angular-native
- Themeable
- Professional appearance
- Good documentation

**Conclusion**: Accelerates UI development with consistent design.

---

## Build & Packaging Process

### Development Build

```bash
npm run dev
```

**Steps**:
1. `ng build --configuration=development` - Build Angular app
2. `tsc` (Electron main) - Compile TypeScript
3. `tsc` (Electron preload) - Compile preload script
4. `electron .` - Launch application

### Production Build

```bash
npm run dist
```

**Steps**:
1. `ng build` - Build Angular for production
2. `tsc` (Electron) - Compile TypeScript
3. `electron-builder` - Package application

**Output**:
- Windows: NSIS installer (`.exe`)
- macOS: DMG image (`.dmg`)
- Linux: AppImage (`.AppImage`) and Deb package (`.deb`)

### Build Configuration

File: `package.json` → `build` section

**Key settings**:
- `appId`: Application identifier
- `icon`: Application icon
- `files`: Files to include
- `asarUnpack`: Files to exclude from ASAR archive (Prisma, SQLite)

---

## Security Considerations

### Electron Security

✅ **Implemented**:
- Context isolation enabled
- Node integration disabled in renderer
- Secure IPC bridge via preload script
- Content Security Policy (CSP)

### Data Security

✅ **Implemented**:
- Local-only data storage
- No network requests (except updates)
- User controls backups
- SQLite file encryption possible (user-managed)

❌ **Not Implemented** (by design):
- Cloud sync (privacy-first approach)
- User authentication (single-user app)
- Encryption at rest (user can encrypt filesystem)

---

## Testing Strategy

### Unit Tests

**Angular (Karma + Jasmine)**:
```bash
npm test
```

- Service tests
- Component tests
- Utility function tests

**Electron (Vitest)**:
```bash
npm run test:electron
```

- Main process logic
- Database operations (mocked)

### Code Quality

**ESLint**:
```bash
npm run lint
```

**SonarQube**:
```bash
npm run sonar:check
```

- Code coverage
- Code smells
- Security vulnerabilities
- Maintainability rating

---

## Performance Considerations

### Database Optimization

- Indexes on frequently queried fields
- Cascade deletes for data integrity
- Efficient queries with Prisma

### Bundle Optimization

- Tree shaking in production builds
- Lazy loading of Angular routes (when applicable)
- ASAR packaging for faster startup

### Memory Management

- Proper cleanup of subscriptions
- Efficient Angular change detection
- Prisma connection pooling (not needed for SQLite)

---

## Internationalization (i18n)

**Library**: `@ngx-translate/core`

**Languages**: English (en), Spanish (es)

**Translation Files**:
- `src/assets/i18n/en.json`
- `src/assets/i18n/es.json`

**Usage**:
```html
<h1>{{ 'home.title' | translate }}</h1>
```

---

## Backup Strategy

### Automatic Backups

**Trigger**: Application shutdown

**Location**: `{app-data}/backups/`

**Format**: `timetracker-backup-YYYY-MM-DD-HH-mm-ss.db`

**Retention**: User-managed (no automatic cleanup)

### Manual Backups

Users can manually copy the SQLite database file.

---

## Future Architecture Considerations

### Potential Enhancements

1. **Plugin System**: Allow custom integrations
2. **Export/Import**: JSON, CSV formats
3. **Reporting Engine**: Advanced analytics
4. **Optional Sync**: Self-hosted sync server
5. **API**: REST API for integrations

### Scalability

Current architecture handles:
- Thousands of projects
- Tens of thousands of tasks
- Years of time entries

For larger datasets, consider:
- Database indexing optimization
- Virtual scrolling for large lists
- Pagination for API responses

---

# Arquitectura (Español)

Este documento describe la arquitectura, patrones de diseño y decisiones técnicas en OpenTimeTracker.

## Resumen del Sistema

OpenTimeTracker es una **aplicación de escritorio** construida con tecnologías web modernas:

```
┌─────────────────────────────────────────────┐
│         Aplicación Electron                 │
├─────────────────────────────────────────────┤
│  ┌────────────────┐    ┌─────────────────┐ │
│  │   Renderer     │◄──►│  Main Process   │ │
│  │  (Angular 21)  │IPC │   (Node.js)     │ │
│  └────────────────┘    └─────────────────┘ │
│         │                      │            │
│         ▼                      ▼            │
│  ┌────────────────┐    ┌─────────────────┐ │
│  │   PrimeNG UI   │    │  Cliente Prisma │ │
│  └────────────────┘    └─────────────────┘ │
│                               │             │
│                               ▼             │
│                        ┌─────────────────┐  │
│                        │ Base de Datos   │  │
│                        │     SQLite      │  │
│                        └─────────────────┘  │
└─────────────────────────────────────────────┘
```

## Capas de Arquitectura

### 1. Capa de Presentación (Frontend Angular)

**Tecnología**: Angular 21 con componentes standalone

**Responsabilidades**:
- Renderizado de interfaz de usuario
- Manejo de interacciones del usuario
- Gestión de estado (servicios)
- Validación de formularios
- Internacionalización (i18n)

**Componentes Clave**:
- `src/app/pages/*` - Componentes de página (destinos de enrutamiento)
- `src/app/components/*` - Componentes UI reutilizables
- `src/app/services/*` - Lógica de negocio y estado
- `src/app/interfaces/*` - Interfaces TypeScript

**Framework UI**: PrimeNG + PrimeFlex
- Biblioteca de componentes: PrimeNG
- Clases de utilidad: PrimeFlex
- Tema por defecto: Aura Black (modo oscuro)

### 2. Capa de Comunicación IPC

**Tecnología**: Electron IPC (Comunicación Inter-Proceso)

**Patrón**: Petición-Respuesta con seguridad de tipos

El proceso renderer se comunica con el proceso main a través de un puente IPC seguro:

```typescript
// Lado del Renderer (Angular)
window.electronAPI.database.createProject(projectData)

// Script Preload (Puente)
contextBridge.exposeInMainWorld('electronAPI', {
  database: {
    createProject: (data) => ipcRenderer.invoke('db:createProject', data)
  }
})

// Proceso Main (Electron)
ipcMain.handle('db:createProject', async (event, data) => {
  return await prisma.project.create({ data })
})
```

**Seguridad**:
- Aislamiento de contexto habilitado
- Integración de Node deshabilitada en renderer
- Script preload como puente seguro

### 3. Capa de Lógica de Negocio (Proceso Main de Electron)

**Tecnología**: Node.js (Proceso Main de Electron)

**Responsabilidades**:
- Operaciones de base de datos vía Prisma
- Operaciones del sistema de archivos
- Gestión del ciclo de vida de la aplicación
- Backups automáticos
- Gestión de ventanas

**Archivos Clave**:
- `electron/src/main/main.ts` - Punto de entrada de la aplicación
- `electron/src/main/database.ts` - Operaciones de base de datos
- `electron/src/preload/preload.ts` - Puente IPC

### 4. Capa de Datos (Prisma + SQLite)

**Tecnología**: Prisma ORM + SQLite

**Responsabilidades**:
- Persistencia de datos
- Gestión de esquema
- Migraciones
- Acceso a base de datos con seguridad de tipos

**Ubicación de Base de Datos**:
- Desarrollo: `./dist/data/timetracker.db`
- Producción:
  - Windows: `%APPDATA%/OpenTimeTracker/data/timetracker.db`
  - macOS: `~/Library/Application Support/OpenTimeTracker/data/timetracker.db`
  - Linux: `~/.config/OpenTimeTracker/data/timetracker.db`

---

## Decisiones Técnicas Clave

### ¿Por qué Electron?

✅ **Pros**:
- Multiplataforma (Windows, macOS, Linux)
- Base de código única
- Integración nativa con el SO
- Acceso a APIs de Node.js
- Ecosistema grande

**Conclusión**: Mejor opción para aplicación de escritorio local-first con tecnologías web.

### ¿Por qué SQLite?

✅ **Pros**:
- Basado en archivos (no necesita servidor)
- Rápido para operaciones locales
- Conforme con ACID
- Configuración cero
- Backups fáciles

**Conclusión**: Perfecto para aplicación local-first enfocada en privacidad.

### ¿Por qué Prisma?

✅ **Pros**:
- Acceso a base de datos con seguridad de tipos
- Cliente auto-generado
- Sistema de migraciones
- Excelente DX (Experiencia del Desarrollador)
- Funciona bien con SQLite

**Conclusión**: Mejor ORM para TypeScript + SQLite + Electron.

---

Para más detalles técnicos, consulta las secciones anteriores en inglés.
