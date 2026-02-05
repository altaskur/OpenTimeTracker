# Contributing to OpenTimeTracker

This wiki page provides quick reference for contributors. For complete details, see the main [CONTRIBUTING.md](../CONTRIBUTING.md) file in the repository.

## Quick Start for Contributors

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/OpenTimeTracker.git
cd OpenTimeTracker
git remote add upstream https://github.com/altaskur/OpenTimeTracker.git
```

### 2. Install & Setup

```bash
npm install
npm run prisma:generate
npm run dev
```

### 3. Create Branch

```bash
git checkout develop
git checkout -b feat/your-feature-name
```

### 4. Make Changes

- Write code
- Add tests
- Update documentation
- Follow code style

### 5. Test & Lint

```bash
npm run lint
npm test
npm run test:electron
npm run sonar:check
```

### 6. Commit

Use Conventional Commits:

```bash
git commit -m "feat(projects): add project archiving"
git commit -m "fix(calendar): correct date calculation"
git commit -m "docs(readme): update installation steps"
```

### 7. Push & PR

```bash
git push origin feat/your-feature-name
```

Create Pull Request on GitHub to `develop` branch.

---

## Contribution Types

### 🐛 Bug Reports

Found a bug? [Open an issue](https://github.com/altaskur/OpenTimeTracker/issues/new).

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- System information
- Screenshots (if applicable)

### 💡 Feature Requests

Have an idea? [Open an issue](https://github.com/altaskur/OpenTimeTracker/issues/new) or [discussion](https://github.com/altaskur/OpenTimeTracker/discussions).

Describe:
- The problem you're solving
- Proposed solution
- Alternatives considered
- Additional context

### 🔧 Code Contributions

1. Check [existing issues](https://github.com/altaskur/OpenTimeTracker/issues) for "good first issue" labels
2. Comment on the issue to claim it
3. Follow the workflow above
4. Submit PR

### 📖 Documentation

Improve:
- README
- Wiki pages
- Code comments
- API documentation
- Examples

### 🌍 Translations

Add or improve translations:

1. Edit translation files:
   - `src/assets/i18n/en.json`
   - `src/assets/i18n/es.json`
2. Add new language files if needed
3. Test translations in the app
4. Submit PR

---

## Code Style

### TypeScript

- Use strict typing (avoid `any`)
- Prefer `const` over `let`
- Use descriptive variable names
- Add JSDoc for public APIs

### Angular

- Follow Angular style guide
- Use standalone components
- Inject services via constructor
- Use OnPush change detection when appropriate

### Formatting

- Prettier handles formatting automatically
- Pre-commit hooks enforce style
- Run `npm run lint:fix` to auto-fix issues

---

## Testing

### Unit Tests (Angular)

```typescript
// project.service.spec.ts
describe('ProjectService', () => {
  it('should get projects', async () => {
    const projects = await service.getProjects();
    expect(projects).toBeDefined();
  });
});
```

Run: `npm test`

### Unit Tests (Electron)

```typescript
// database.spec.ts
import { describe, it, expect } from 'vitest';

describe('Database', () => {
  it('should create project', async () => {
    // test
  });
});
```

Run: `npm run test:electron`

### Manual Testing

Always test your changes manually:
1. Build: `npm run dev`
2. Test functionality
3. Check for console errors
4. Test edge cases

---

## Pull Request Checklist

Before submitting PR:

- [ ] Code follows project style
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] Linting passes
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] PR description is clear
- [ ] Linked to related issue (if any)

---

## Pull Request Template

```markdown
## Description
[Describe what this PR does]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- [List key changes]

## Testing
- [Describe testing performed]

## Screenshots
[If applicable]

## Checklist
- [ ] Tests pass
- [ ] Linting passes
- [ ] Documentation updated
```

---

## Development Resources

- [Development Setup](Development-Setup.md) - Complete setup guide
- [Architecture](Architecture.md) - System architecture
- [Database Schema](Database-Schema.md) - Data model
- [Main CONTRIBUTING.md](../CONTRIBUTING.md) - Full contribution guide

---

## Code of Conduct

All contributors must follow the [Code of Conduct](../CODE_OF_CONDUCT.md).

In summary:
- Be respectful
- Be collaborative
- Be constructive
- Be patient

---

## Questions?

- Check [FAQ](FAQ.md)
- Ask in [Discussions](https://github.com/altaskur/OpenTimeTracker/discussions)
- Open an issue

---

## Recognition

Contributors are listed in:
- GitHub contributors page
- Release notes (for significant contributions)
- Special thanks in major releases

Thank you for contributing! 🎉

---

# Contribuyendo (Español)

Esta página wiki proporciona referencia rápida para contribuyentes. Para detalles completos, consulta el archivo principal [CONTRIBUTING.md](../CONTRIBUTING.md) en el repositorio.

## Inicio Rápido

### 1. Fork y Clonar

```bash
git clone https://github.com/TU_USUARIO/OpenTimeTracker.git
cd OpenTimeTracker
git remote add upstream https://github.com/altaskur/OpenTimeTracker.git
```

### 2. Instalar

```bash
npm install
npm run prisma:generate
npm run dev
```

### 3. Crear Rama

```bash
git checkout develop
git checkout -b feat/tu-caracteristica
```

### 4. Hacer Cambios

- Escribir código
- Agregar pruebas
- Actualizar documentación

### 5. Probar

```bash
npm run lint
npm test
npm run test:electron
```

### 6. Commit

Usar Conventional Commits:

```bash
git commit -m "feat(proyectos): agregar archivo de proyectos"
git commit -m "fix(calendario): corregir cálculo de fecha"
```

### 7. Push y PR

```bash
git push origin feat/tu-caracteristica
```

Crear Pull Request en GitHub a la rama `develop`.

---

## Tipos de Contribución

### 🐛 Reportes de Errores

¿Encontraste un bug? [Abre un issue](https://github.com/altaskur/OpenTimeTracker/issues/new).

### 💡 Solicitudes de Características

¿Tienes una idea? [Abre un issue](https://github.com/altaskur/OpenTimeTracker/issues/new) o [discusión](https://github.com/altaskur/OpenTimeTracker/discussions).

### 🔧 Contribuciones de Código

1. Revisa [issues existentes](https://github.com/altaskur/OpenTimeTracker/issues)
2. Comenta en el issue para reclamarlo
3. Sigue el flujo de trabajo anterior
4. Envía PR

### 📖 Documentación

Mejora:
- README
- Páginas wiki
- Comentarios de código

### 🌍 Traducciones

Agrega o mejora traducciones en:
- `src/assets/i18n/en.json`
- `src/assets/i18n/es.json`

---

## Recursos

- [Configuración de Desarrollo](Development-Setup.md#configuración-de-desarrollo-español)
- [Arquitectura](Architecture.md#arquitectura-español)
- [CONTRIBUTING.md principal](../CONTRIBUTING.md)

---

¡Gracias por contribuir! 🎉
