# Development Setup

This guide will help you set up your development environment for contributing to OpenTimeTracker.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Node.js**: Version 20 or higher
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify: `node --version`
- **npm**: Version 10 or higher (comes with Node.js)
  - Verify: `npm --version`
- **Git**: For version control
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify: `git --version`

### Recommended

- **Docker & Docker Compose**: For SonarQube analysis
  - Download from [docker.com](https://www.docker.com/)
  - Verify: `docker --version` and `docker-compose --version`
- **VS Code**: Recommended IDE with extensions:
  - Angular Language Service
  - Prettier - Code formatter
  - ESLint
  - Prisma

---

## Initial Setup

### 1. Fork and Clone

1. **Fork the repository** on GitHub
   - Go to https://github.com/altaskur/OpenTimeTracker
   - Click "Fork" button

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/OpenTimeTracker.git
   cd OpenTimeTracker
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/altaskur/OpenTimeTracker.git
   git remote -v
   ```

### 2. Install Dependencies

```bash
npm install
```

This will:
- Install all npm dependencies
- Set up Git hooks via Husky
- Run `electron-rebuild` for native modules

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

This generates the Prisma client in `electron/src/generated/prisma/`.

### 4. Verify Setup

Test that everything works:

```bash
npm run dev
```

This should:
1. Build the Angular application
2. Compile Electron TypeScript files
3. Launch the application in Electron

---

## Development Workflow

### Branch Strategy

The project uses the following branches:

- **`main`**: Production-ready code
- **`develop`**: Integration branch for features
- **Feature branches**: `feat/your-feature-name`
- **Bug fix branches**: `fix/bug-description`
- **Chore branches**: `chore/task-description`

### Creating a Feature Branch

Always branch from `develop`:

```bash
# Make sure develop is up to date
git checkout develop
git pull upstream develop

# Create your feature branch
git checkout -b feat/your-feature-name
```

### Making Changes

1. **Make your changes** in your feature branch
2. **Test locally** (see Testing section)
3. **Commit with conventional commits** (see below)
4. **Push to your fork**
5. **Create a Pull Request** to `develop`

---

## Running the Application

### Development Mode (Recommended)

```bash
npm run dev
```

**What it does**:
1. Builds Angular in development mode (`ng build --configuration=development`)
2. Compiles Electron main process TypeScript
3. Compiles Electron preload TypeScript
4. Launches Electron with the built application

**Features**:
- Fast builds
- Source maps enabled
- Development-optimized bundles

### Angular Dev Server Only

```bash
npm start
# or
ng serve
```

Runs Angular on `http://localhost:4200` (without Electron).

**When to use**:
- Quick UI development and testing
- Component development
- Style adjustments

**Note**: Database operations won't work without Electron.

### Production Build

```bash
npm run build
```

Builds for production (optimized bundles, no source maps).

### Electron Only (After Build)

```bash
npm run electron
```

Launches Electron with previously built files.

---

## Project Structure

```
OpenTimeTracker/
├── .github/               # GitHub workflows and config
├── .husky/                # Git hooks
├── .vscode/               # VS Code settings
├── electron/              # Electron main process
│   ├── build/             # TypeScript configs for Electron
│   └── src/
│       ├── main/          # Main process code
│       │   ├── main.ts    # Entry point
│       │   └── database.ts
│       └── preload/       # Preload scripts
│           └── preload.ts # IPC bridge
├── prisma/                # Database schema and migrations
│   ├── migrations/        # Database migrations
│   ├── schema.prisma      # Prisma schema definition
│   └── template.db        # Template database for new installs
├── public/                # Static assets
├── scripts/               # Build and utility scripts
├── src/                   # Angular application
│   ├── app/
│   │   ├── components/    # Shared components
│   │   ├── interfaces/    # TypeScript interfaces
│   │   ├── pages/         # Page components (routes)
│   │   ├── services/      # Angular services
│   │   └── utils/         # Utility functions
│   ├── assets/
│   │   └── i18n/          # Translation files
│   │       ├── en.json
│   │       └── es.json
│   ├── index.html         # HTML entry point
│   ├── main.ts            # Angular bootstrap
│   └── styles.scss        # Global styles
├── wiki/                  # Project wiki (documentation)
├── angular.json           # Angular configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── vitest.config.ts       # Vitest test configuration
```

---

## Development Commands

### Building

| Command | Description |
|---------|-------------|
| `npm run dev` | Build and run in development mode |
| `npm run build` | Production build (Angular + Electron) |
| `npm start` | Start Angular dev server only |

### Testing

| Command | Description |
|---------|-------------|
| `npm test` | Run Angular tests (Karma + Jasmine) |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:electron` | Run Electron tests (Vitest) |
| `npm run test:electron:watch` | Run Electron tests in watch mode |
| `npm run test:electron:coverage` | Electron tests with coverage |

### Linting & Formatting

| Command | Description |
|---------|-------------|
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `prettier --write .` | Format all files with Prettier |

### Database

| Command | Description |
|---------|-------------|
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:push` | Push schema changes to database |
| `npm run prisma:studio` | Open Prisma Studio (database GUI) |
| `npm run prisma:migrate` | Create and apply migration |
| `npm run prisma:template` | Update template.db |

### Packaging

| Command | Description |
|---------|-------------|
| `npm run dist` | Build and package for all platforms |
| `npm run dist:win` | Package for Windows |
| `npm run dist:mac` | Package for macOS |
| `npm run dist:linux` | Package for Linux |
| `npm run pack` | Create unpacked distribution |

### Quality Analysis

| Command | Description |
|---------|-------------|
| `npm run sonar` | Run SonarQube analysis |
| `npm run sonar:check` | Full quality check (tests + Sonar) |

---

## Testing

### Unit Tests (Angular)

**Framework**: Karma + Jasmine

**Run tests**:
```bash
npm test
```

**Run with coverage**:
```bash
npm run test:coverage
```

**Writing tests**:

```typescript
// Example: src/app/services/project.service.spec.ts
describe('ProjectService', () => {
  let service: ProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get projects', async () => {
    const projects = await service.getProjects();
    expect(projects).toBeDefined();
  });
});
```

### Unit Tests (Electron)

**Framework**: Vitest

**Run tests**:
```bash
npm run test:electron
```

**Run in watch mode**:
```bash
npm run test:electron:watch
```

**Writing tests**:

```typescript
// Example: electron/src/main/database.spec.ts
import { describe, it, expect } from 'vitest';

describe('Database Operations', () => {
  it('should create a project', async () => {
    // Test implementation
  });
});
```

### Manual Testing

1. **Run the app**: `npm run dev`
2. **Test your changes**:
   - Create projects and tasks
   - Add time entries
   - Test UI interactions
   - Verify data persistence
3. **Check console** for errors (DevTools: `Ctrl/Cmd + Shift + I`)

---

## Code Quality

### ESLint

**Configuration**: `eslint.config.mjs`

**Rules**:
- Angular ESLint rules
- TypeScript best practices
- Code style enforcement

**Run linter**:
```bash
npm run lint
```

**Auto-fix issues**:
```bash
npm run lint:fix
```

### Prettier

**Configuration**: `.prettierrc.json`

**Format code**:
```bash
npx prettier --write .
```

**Pre-commit hook**: Automatically formats staged files

### SonarQube

**Setup** (first time):

1. **Start SonarQube**:
   ```bash
   docker-compose up -d
   ```

2. **Access SonarQube**: http://localhost:9000
   - Default credentials: `admin` / `admin`
   - Change password on first login

3. **Create project**:
   - Click "Create a local project"
   - Project name: `OpenTimeTracker`
   - Project key: `altaskur_OpenTimeTracker`
   - Main branch: `develop`

4. **Generate token**:
   - Go to My Account → Security → Generate Tokens
   - Create token with name `local-analysis`
   - Copy the token

5. **Create `.env` file**:
   ```
   SONAR_TOKEN=your_token_here
   ```

6. **Run analysis**:
   ```bash
   npm run sonar:check
   ```

7. **Stop SonarQube**:
   ```bash
   docker-compose down
   ```

**Quality Gates**:
- Code coverage > 80%
- No critical issues
- No security hotspots
- Maintainability rating A

---

## Database Development

### Prisma Studio

**Start Prisma Studio**:
```bash
npm run prisma:studio
```

Opens a GUI at http://localhost:5555 to:
- View data
- Edit records
- Test queries

### Creating Migrations

When you modify `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name description_of_change
```

**Example**:
```bash
npx prisma migrate dev --name add_task_priority
```

This:
1. Creates a migration file in `prisma/migrations/`
2. Applies the migration to your local database
3. Regenerates Prisma client

### Updating Template Database

After creating migrations:

```bash
npm run prisma:template
```

This updates `prisma/template.db` used for new installations.

---

## Git Workflow

### Commit Messages

We use **Conventional Commits**:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process or tooling changes

**Examples**:
```bash
git commit -m "feat(projects): add project archiving functionality"
git commit -m "fix(calendar): correct date calculation in week view"
git commit -m "docs(readme): update installation instructions"
git commit -m "chore(deps): update dependencies"
```

**Commitlint**: Pre-commit hook enforces this format.

### Pre-commit Hooks

Automatically run on `git commit`:

1. **Lint-staged**: Formats and lints staged files
2. **Commitlint**: Validates commit message format

### Pre-push Hooks

Automatically run on `git push` for feature branches:

1. **SonarQube check**: Runs full quality analysis

**Note**: Push will be blocked if SonarQube analysis fails.

---

## Debugging

### Angular DevTools

**Open DevTools**: `Ctrl/Cmd + Shift + I`

**Useful tabs**:
- **Console**: View logs and errors
- **Sources**: Set breakpoints
- **Network**: Monitor API calls (if any)
- **Application**: View localStorage, etc.

### Electron Main Process

**Enable DevTools**:

In `electron/src/main/main.ts`:

```typescript
mainWindow.webContents.openDevTools();
```

**Logging**:

```typescript
console.log('Debug info:', data);
```

Logs appear in the terminal where you ran `npm run dev`.

### VS Code Debugging

**Launch configuration** (`.vscode/launch.json`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Electron Main",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
      "windows": {
        "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron.cmd"
      },
      "args": ["."],
      "outputCapture": "std"
    }
  ]
}
```

---

## Troubleshooting

### Common Issues

**Issue**: `npm install` fails with native module errors

**Solution**:
```bash
npm run postinstall
# or
npx electron-rebuild
```

---

**Issue**: Prisma client not found

**Solution**:
```bash
npm run prisma:generate
```

---

**Issue**: Database locked error

**Solution**: Close all OpenTimeTracker instances

---

**Issue**: Port 4200 already in use

**Solution**:
```bash
# Linux/macOS
killall -9 node
# Or use a different port
ng serve --port 4300
```

---

**Issue**: SonarQube analysis fails

**Solutions**:
1. Ensure SonarQube is running: `docker ps`
2. Check `.env` has valid `SONAR_TOKEN`
3. Verify project key matches `sonar-project.properties`

---

## Best Practices

### Code Style

- Follow existing code patterns
- Use TypeScript types (avoid `any`)
- Write self-documenting code
- Add comments for complex logic
- Keep functions small and focused

### Component Design

- Use standalone components
- Keep components focused (single responsibility)
- Use services for business logic
- Use interfaces for type safety

### State Management

- Use Angular services for state
- Use RxJS observables for reactive state
- Avoid global state when possible

### Performance

- Lazy load modules when possible
- Use `OnPush` change detection for performance-critical components
- Avoid unnecessary subscriptions
- Unsubscribe from observables in `ngOnDestroy`

---

## Resources

### Documentation

- [Angular Documentation](https://angular.io/docs)
- [Electron Documentation](https://www.electronjs.org/docs/latest)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PrimeNG Components](https://primeng.org/)

### Project Documentation

- [Architecture](Architecture.md)
- [Database Schema](Database-Schema.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Code of Conduct](../CODE_OF_CONDUCT.md)

---

## Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Code Review**: Ask maintainers for feedback

---

# Configuración de Desarrollo (Español)

Esta guía te ayudará a configurar tu entorno de desarrollo para contribuir a OpenTimeTracker.

## Requisitos Previos

### Requeridos

- **Node.js**: Versión 20 o superior
- **npm**: Versión 10 o superior
- **Git**: Para control de versiones

### Recomendados

- **Docker & Docker Compose**: Para análisis SonarQube
- **VS Code**: IDE recomendado

---

## Configuración Inicial

### 1. Fork y Clonar

```bash
# Haz fork en GitHub, luego clona
git clone https://github.com/TU_USUARIO/OpenTimeTracker.git
cd OpenTimeTracker

# Agrega remote upstream
git remote add upstream https://github.com/altaskur/OpenTimeTracker.git
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Generar Cliente Prisma

```bash
npm run prisma:generate
```

### 4. Verificar Configuración

```bash
npm run dev
```

---

## Comandos de Desarrollo

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Compilar y ejecutar en modo desarrollo |
| `npm test` | Ejecutar pruebas |
| `npm run lint` | Ejecutar linter |
| `npm run build` | Compilación de producción |

---

## Flujo de Trabajo

1. **Crear rama** desde `develop`: `git checkout -b feat/tu-caracteristica`
2. **Hacer cambios** y probar localmente
3. **Commit** con formato convencional
4. **Push** a tu fork
5. **Crear Pull Request** a `develop`

---

Para más detalles, consulta las secciones anteriores en inglés.
