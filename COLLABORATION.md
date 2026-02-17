# Collaboration in OpenTimeTracker

Brief guide to contribute consistently. English first, Spanish version below.

## Summary

- Stack: Angular 21 + Electron 37 + Prisma/SQLite.
- Default branch: main. Working branch: develop (use develop-to-main in this session if needed).
- License: GPL-3.0.

## Getting Ready

1. Requirements: Node 20+, npm 10+, Docker + Docker Compose (for SonarQube).
2. Install deps:

   ```bash
   npm install
   npm run prisma:generate
   ```

3. Run the app:

   ```bash
   npm start            # Angular dev server on 4200
   npm run dev          # build + Electron dev mode
   npm run storybook    # UI component explorer
   ```

## Workflow

- Branch from develop with prefixes `feat/`, `fix/`, `chore/`.
- Conventional Commits (commitlint enforced).
- Before opening a PR:

  ```bash
  npm run lint
  npm test
  npm run test:electron
  npm run sonar:check   # tests + coverage + SonarQube
  ```

- In the PR: goal, key changes, DB/backup impact, UI screenshots if any, test steps.
- Flag breaking changes and link issues.

## Quality and SonarQube

- Pre-push hook runs `sonar:check`; failures block the push.
- Quick local Sonar:

  ```bash
  docker-compose up -d      # first start ~2min
  # create SONAR_TOKEN at http://localhost:9000
  echo "SONAR_TOKEN=..." > .env
  npm run sonar:check
  docker-compose down
  ```

## Database

- Prisma with local SQLite. For schema changes:

  ```bash
  npx prisma migrate dev --name description
  npm run prisma:template   # update production template.db
  ```

- Do not commit real data to backups or seeds. Review prisma/template.db and migrations.

## UI and i18n

- Uses PrimeNG/PrimeFlex, dark theme by default.
- Use Storybook to develop components in isolation.
- Add strings in src/assets/i18n/en.json and src/assets/i18n/es.json.
- Mind accessibility: labels, visible focus, contrast.

## Security and Secrets

- Do not commit .env or tokens. Keep secrets local.

## Issues and Support

- For issues/PRs include: repro steps, expected/actual, relevant logs, version (commit/branch), platform.

## Resources

- Overview and shortcuts: README.md.
- Commands and scripts: package.json.

Happy hacking 🚀

---

## Colaboración en OpenTimeTracker (Español)

Guía breve para contribuir de forma consistente.

### Resumen

- Stack: Angular 21 + Electron 37 + Prisma/SQLite.
- Rama por defecto: main. Rama de trabajo habitual: develop (usa develop-to-main en esta sesión si aplica).
- Licencia: GPL-3.0.

### Preparación

1. Requisitos: Node 20+, npm 10+, Docker + Docker Compose (para SonarQube).
2. Instala dependencias:

   ```bash
   npm install
   npm run prisma:generate
   ```

3. Ejecuta la app:

   ```bash
   npm start            # servidor Angular en 4200
   npm run dev          # build + Electron en modo desarrollo
   npm run storybook    # explorador de componentes UI
   ```

### Flujo de trabajo

- Crea ramas desde develop con prefijos `feat/`, `fix/`, `chore/`.
- Commits con Conventional Commits (commitlint activo).
- Antes de abrir PR:

  ```bash
  npm run lint
  npm test
  npm run test:electron
  npm run sonar:check   # corre tests + cobertura + SonarQube
  ```

- Incluye en el PR: objetivo, cambios clave, impacto en DB/backup, capturas si hay UI, pasos de prueba.
- Marca breaking changes y enlaza issues.

### Calidad y SonarQube

- Hook pre-push ejecuta `sonar:check`; fallos bloquean el push.
- Sonar local rápido:

  ```bash
  docker-compose up -d      # primer arranque puede tardar ~2min
  # generar SONAR_TOKEN en http://localhost:9000
  echo "SONAR_TOKEN=..." > .env
  npm run sonar:check
  docker-compose down
  ```

### Base de datos

- Prisma con SQLite local. Para cambios de modelo:

  ```bash
  npx prisma migrate dev --name descripcion
  npm run prisma:template   # actualiza template.db de producción
  ```

- No subas datos reales a backups ni seeds. Revisa cambios en prisma/template.db y migrations.

### UI e i18n

- Componentes con PrimeNG/PrimeFlex, tema oscuro por defecto.
- Usa Storybook para desarrollar componentes de forma aislada.
- Añade cadenas en src/assets/i18n/en.json y src/assets/i18n/es.json.
- Cuida accesibilidad: labels, focus visible, contrastes.

### Seguridad y secretos

- No commitees .env ni tokens. Usa variables locales.

### Issues y soporte

- Al crear un issue o PR, incluye: pasos reproducibles, resultado esperado/obtenido, logs relevantes, versión (commit/branch), plataforma.

### Recursos

- Vista general y atajos: README.md.
- Comandos y scripts: package.json.

Happy hacking 🚀
