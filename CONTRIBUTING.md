# Contributing to OpenTimeTracker

Thank you for your interest in contributing to OpenTimeTracker! This guide will help you get started with contributing to the project.

*Versión en español más abajo / Spanish version below*

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Code Quality Standards](#code-quality-standards)
- [Database Changes](#database-changes)
- [UI and Internationalization](#ui-and-internationalization)
- [Security](#security)
- [Getting Help](#getting-help)

## Getting Started

OpenTimeTracker is built with:
- **Angular 21** for the UI
- **Electron 37** for the desktop application
- **Prisma/SQLite** for data persistence
- **License**: GPL-3.0

The main branch is `main`, and active development happens on the `develop` branch.

## Development Setup

### Prerequisites

- Node.js 20+
- npm 10+
- Docker & Docker Compose (for SonarQube analysis)

### Installation

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/OpenTimeTracker.git
   cd OpenTimeTracker
   ```

2. Install dependencies:
   ```bash
   npm install
   npm run prisma:generate
   ```

3. Run the application:
   ```bash
   npm start            # Angular dev server on port 4200
   npm run dev          # Build and run Electron in dev mode
   ```

## Development Workflow

### Creating a Branch

Always branch from `develop` with the appropriate prefix:
- `feat/` - New features
- `fix/` - Bug fixes
- `chore/` - Maintenance tasks

Example:
```bash
git checkout develop
git pull origin develop
git checkout -b feat/your-feature-name
```

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint:

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(projects): add project archiving functionality`
- `fix(calendar): correct date calculation in week view`
- `docs(readme): update installation instructions`

### Testing Your Changes

Before submitting a pull request, ensure all checks pass:

```bash
npm run lint              # ESLint
npm test                  # Angular tests
npm run test:electron     # Electron tests
npm run sonar:check       # Full quality check (tests + coverage + SonarQube)
```

**Note**: The pre-push hook automatically runs `sonar:check` for feature branches. Your push will be blocked if the analysis fails.

## Pull Request Guidelines

### Before Submitting

1. Ensure your branch is up to date with `develop`
2. Run all tests and quality checks
3. Test the application manually
4. Update documentation if needed

### PR Description

Your pull request should include:

- **Goal**: What problem does this solve?
- **Key Changes**: Summary of the implementation
- **Database Impact**: Any schema changes or migrations
- **Backup Impact**: Does this affect backup functionality?
- **UI Changes**: Screenshots or videos if applicable
- **Testing Steps**: How to verify the changes
- **Breaking Changes**: Flag any breaking changes
- **Related Issues**: Link to relevant issues

### Review Process

- Maintainers will review your PR as soon as possible
- Address feedback by pushing new commits to your branch
- Once approved, your PR will be merged into `develop`

## Code Quality Standards

### SonarQube

We use SonarQube for static code analysis. To run it locally:

1. Start SonarQube:
   ```bash
   docker-compose up -d  # First start takes ~2 minutes
   ```

2. Access SonarQube at http://localhost:9000
   - Default credentials: `admin` / `admin`
   - Change password on first login

3. Generate a token:
   - Go to: My Account → Security → Generate Tokens
   - Copy the token

4. Create a `.env` file:
   ```
   SONAR_TOKEN=your_generated_token_here
   ```

5. Run the analysis:
   ```bash
   npm run sonar:check
   ```

6. Stop SonarQube:
   ```bash
   docker-compose down
   ```

## Database Changes

When modifying the Prisma schema:

1. Create a migration:
   ```bash
   npx prisma migrate dev --name description_of_change
   ```

2. Update the production template:
   ```bash
   npm run prisma:template
   ```

3. Review changes to `prisma/template.db` and migrations
4. **Never commit real user data** to backups or seeds

## UI and Internationalization

### UI Framework

- Uses PrimeNG components and PrimeFlex utilities
- Dark theme (Aura Black) is the default
- Follow existing component patterns

### Adding Translations

Add new strings to both language files:
- `src/assets/i18n/en.json`
- `src/assets/i18n/es.json`

### Accessibility

Ensure your UI changes:
- Have proper labels for form controls
- Maintain visible focus indicators
- Meet color contrast requirements
- Work with keyboard navigation

## Security

- **Never commit** `.env` files or tokens to the repository
- Use environment variables for sensitive configuration
- Report security vulnerabilities privately (see [SECURITY.md](SECURITY.md))
- Follow secure coding practices

## Getting Help

- Check the [README.md](README.md) for project overview and commands
- Review [COLLABORATION.md](COLLABORATION.md) for additional workflow details
- Read the [Code of Conduct](CODE_OF_CONDUCT.md)
- Open an issue for questions or bug reports

---

## Colaboración en OpenTimeTracker (Español)

Gracias por tu interés en contribuir a OpenTimeTracker. Esta guía te ayudará a comenzar.

---

## Tabla de Contenidos

- [Comenzando](#comenzando)
- [Configuración del Entorno](#configuración-del-entorno)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Guía para Pull Requests](#guía-para-pull-requests)
- [Estándares de Calidad](#estándares-de-calidad)
- [Cambios en la Base de Datos](#cambios-en-la-base-de-datos)
- [UI e Internacionalización](#ui-e-internacionalización)
- [Seguridad](#seguridad-1)
- [Obtener Ayuda](#obtener-ayuda)

## Comenzando

OpenTimeTracker está construido con:
- **Angular 21** para la interfaz
- **Electron 37** para la aplicación de escritorio
- **Prisma/SQLite** para persistencia de datos
- **Licencia**: GPL-3.0

La rama principal es `main`, y el desarrollo activo ocurre en la rama `develop`.

## Configuración del Entorno

### Requisitos Previos

- Node.js 20+
- npm 10+
- Docker & Docker Compose (para análisis de SonarQube)

### Instalación

1. Haz fork y clona el repositorio:
   ```bash
   git clone https://github.com/TU_USUARIO/OpenTimeTracker.git
   cd OpenTimeTracker
   ```

2. Instala las dependencias:
   ```bash
   npm install
   npm run prisma:generate
   ```

3. Ejecuta la aplicación:
   ```bash
   npm start            # Servidor Angular en puerto 4200
   npm run dev          # Construye y ejecuta Electron en modo dev
   ```

## Flujo de Trabajo

### Crear una Rama

Siempre crea ramas desde `develop` con el prefijo apropiado:
- `feat/` - Nuevas características
- `fix/` - Corrección de errores
- `chore/` - Tareas de mantenimiento

Ejemplo:
```bash
git checkout develop
git pull origin develop
git checkout -b feat/nombre-de-tu-caracteristica
```

### Mensajes de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/) validados por commitlint:

```
tipo(alcance): descripción

[cuerpo opcional]

[pie opcional]
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Ejemplos:
- `feat(proyectos): añadir funcionalidad de archivo de proyectos`
- `fix(calendario): corregir cálculo de fecha en vista semanal`
- `docs(readme): actualizar instrucciones de instalación`

### Probar tus Cambios

Antes de enviar un pull request, asegúrate de que todas las pruebas pasen:

```bash
npm run lint              # ESLint
npm test                  # Pruebas de Angular
npm run test:electron     # Pruebas de Electron
npm run sonar:check       # Verificación completa (pruebas + cobertura + SonarQube)
```

**Nota**: El hook pre-push ejecuta automáticamente `sonar:check` para ramas de características. Tu push será bloqueado si el análisis falla.

## Guía para Pull Requests

### Antes de Enviar

1. Asegúrate de que tu rama esté actualizada con `develop`
2. Ejecuta todas las pruebas y verificaciones de calidad
3. Prueba la aplicación manualmente
4. Actualiza la documentación si es necesario

### Descripción del PR

Tu pull request debe incluir:

- **Objetivo**: ¿Qué problema resuelve esto?
- **Cambios Clave**: Resumen de la implementación
- **Impacto en la Base de Datos**: Cambios de esquema o migraciones
- **Impacto en Backups**: ¿Esto afecta la funcionalidad de backup?
- **Cambios de UI**: Capturas de pantalla o videos si aplica
- **Pasos de Prueba**: Cómo verificar los cambios
- **Cambios Incompatibles**: Marcar cambios que rompen compatibilidad
- **Issues Relacionados**: Enlazar a issues relevantes

### Proceso de Revisión

- Los mantenedores revisarán tu PR tan pronto como sea posible
- Aborda el feedback haciendo nuevos commits en tu rama
- Una vez aprobado, tu PR será fusionado en `develop`

## Estándares de Calidad

### SonarQube

Usamos SonarQube para análisis estático de código. Para ejecutarlo localmente:

1. Inicia SonarQube:
   ```bash
   docker-compose up -d  # El primer inicio tarda ~2 minutos
   ```

2. Accede a SonarQube en http://localhost:9000
   - Credenciales por defecto: `admin` / `admin`
   - Cambia la contraseña en el primer inicio

3. Genera un token:
   - Ve a: Mi Cuenta → Seguridad → Generar Tokens
   - Copia el token

4. Crea un archivo `.env`:
   ```
   SONAR_TOKEN=tu_token_generado_aqui
   ```

5. Ejecuta el análisis:
   ```bash
   npm run sonar:check
   ```

6. Detén SonarQube:
   ```bash
   docker-compose down
   ```

## Cambios en la Base de Datos

Al modificar el esquema de Prisma:

1. Crea una migración:
   ```bash
   npx prisma migrate dev --name descripcion_del_cambio
   ```

2. Actualiza la plantilla de producción:
   ```bash
   npm run prisma:template
   ```

3. Revisa los cambios en `prisma/template.db` y las migraciones
4. **Nunca commits datos reales de usuario** a backups o seeds

## UI e Internacionalización

### Framework de UI

- Usa componentes PrimeNG y utilidades PrimeFlex
- El tema oscuro (Aura Black) es el predeterminado
- Sigue los patrones de componentes existentes

### Añadir Traducciones

Añade nuevas cadenas a ambos archivos de idioma:
- `src/assets/i18n/en.json`
- `src/assets/i18n/es.json`

### Accesibilidad

Asegúrate de que tus cambios de UI:
- Tengan etiquetas apropiadas para controles de formulario
- Mantengan indicadores de foco visibles
- Cumplan requisitos de contraste de color
- Funcionen con navegación por teclado

## Seguridad

- **Nunca commits** archivos `.env` o tokens al repositorio
- Usa variables de entorno para configuración sensible
- Reporta vulnerabilidades de seguridad de forma privada (ver [SECURITY.md](SECURITY.md))
- Sigue prácticas de codificación segura

## Obtener Ayuda

- Consulta [README.md](README.md) para descripción general y comandos
- Revisa [COLLABORATION.md](COLLABORATION.md) para detalles adicionales del flujo de trabajo
- Lee el [Código de Conducta](CODE_OF_CONDUCT.md)
- Abre un issue para preguntas o reportes de errores

---

Thank you for contributing to OpenTimeTracker! 🚀
