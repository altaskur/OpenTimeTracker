# Build and Deployment Guide

This guide covers building, packaging, and deploying OpenTimeTracker for production.

## Build Process Overview

OpenTimeTracker uses a multi-stage build process:

1. **Angular Build**: Compiles Angular app to optimized JavaScript
2. **Electron TypeScript Compilation**: Compiles main and preload processes
3. **Electron Builder**: Packages application with Electron for each platform

---

## Production Build

### Full Production Build

```bash
npm run build
```

**What it does**:
1. Runs `ng build` (production configuration)
   - Optimized bundles
   - Tree shaking
   - Minification
   - AOT compilation
2. Compiles Electron main process: `tsc --project electron/build/tsconfig.json`
3. Compiles Electron preload: `tsc --project electron/build/tsconfig.preload.json`

**Output**:
- Angular app: `dist/browser/`
- Electron main: `dist/electron/main/`
- Electron preload: `dist/electron/preload/`

---

## Packaging

### Package for All Platforms

```bash
npm run dist
```

Builds and packages for:
- Windows (x64)
- macOS (Intel & Apple Silicon)
- Linux (x64)

**Output directory**: `release/`

### Platform-Specific Packaging

**Windows**:
```bash
npm run dist:win
```

**macOS**:
```bash
npm run dist:mac
```

**Linux**:
```bash
npm run dist:linux
```

### Unpacked Distribution

```bash
npm run pack
```

Creates an unpacked distribution (useful for testing without installing).

---

## Build Configuration

### Electron Builder Config

Located in `package.json` → `build` section:

```json
{
  "build": {
    "appId": "com.altaskur.opentimetracker",
    "productName": "OpenTimeTracker",
    "icon": "public/icon.png",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "node_modules/@prisma/client/**/*",
      "node_modules/@prisma/adapter-better-sqlite3/**/*",
      "node_modules/better-sqlite3/**/*",
      "prisma/template.db",
      "prisma/schema.prisma"
    ],
    "asarUnpack": [
      "node_modules/.prisma/**/*",
      "node_modules/@prisma/client/**/*",
      "node_modules/@prisma/adapter-better-sqlite3/**/*",
      "node_modules/better-sqlite3/**/*",
      "dist/electron/generated/**/*",
      "prisma/template.db"
    ]
  }
}
```

**Key settings**:
- `appId`: Unique application identifier
- `productName`: Display name
- `files`: Files to include in the package
- `asarUnpack`: Files excluded from ASAR archive (needed for native modules)

---

## Platform-Specific Builds

### Windows

**Configuration**:
```json
{
  "win": {
    "target": [{
      "target": "nsis",
      "arch": ["x64"]
    }]
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "perMachine": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "OpenTimeTracker",
    "license": "LICENSE"
  }
}
```

**Output**:
- `OpenTimeTracker-{version}-win-x64.exe` - NSIS installer

**Build on**:
- Windows (native)
- Linux/macOS with Wine (not recommended)

**Installer features**:
- Custom installation directory
- Desktop shortcut
- Start menu entry
- Uninstaller

---

### macOS

**Configuration**:
```json
{
  "mac": {
    "target": [{
      "target": "dmg",
      "arch": ["x64", "arm64"]
    }],
    "icon": "public/icon-512.png",
    "category": "public.app-category.productivity"
  },
  "dmg": {
    "title": "${productName} ${version}",
    "contents": [
      { "x": 130, "y": 220 },
      { "x": 410, "y": 220, "type": "link", "path": "/Applications" }
    ]
  }
}
```

**Output**:
- `OpenTimeTracker-{version}-mac-x64.dmg` - Intel
- `OpenTimeTracker-{version}-mac-arm64.dmg` - Apple Silicon

**Build on**:
- macOS (native) - **Required for signing**
- Linux with [electron-builder Docker image](https://www.electron.build/multi-platform-build#docker)

**DMG features**:
- Drag-to-Applications folder
- Custom background (can be added)
- Retina-ready

---

### Linux

**Configuration**:
```json
{
  "linux": {
    "target": [
      { "target": "AppImage", "arch": ["x64"] },
      { "target": "deb", "arch": ["x64"] }
    ],
    "icon": "public/icon.png",
    "category": "Office",
    "maintainer": "altaskur",
    "synopsis": "Time tracking application",
    "description": "Free and open source time tracking application"
  }
}
```

**Output**:
- `OpenTimeTracker-{version}-linux-x64.AppImage` - Portable
- `OpenTimeTracker-{version}-linux-x64.deb` - Debian/Ubuntu package

**Build on**:
- Linux (native)
- macOS/Windows with Docker

**AppImage features**:
- No installation required
- Portable
- Desktop integration

**Deb package features**:
- System integration
- apt package manager support
- Menu entries

---

## Code Signing

### Why Sign Your Code?

- **Windows**: Avoids SmartScreen warnings
- **macOS**: Required for Gatekeeper
- **Linux**: Not required

### Windows Code Signing

**Requirements**:
- Code signing certificate (.pfx or .p12)
- Certificate password

**Configuration**:

1. **Store certificate** securely
2. **Set environment variables**:
   ```bash
   # Windows
   set CSC_LINK=C:\path\to\certificate.pfx
   set CSC_KEY_PASSWORD=your_password
   
   # Linux/macOS
   export CSC_LINK=/path/to/certificate.pfx
   export CSC_KEY_PASSWORD=your_password
   ```

3. **Build**:
   ```bash
   npm run dist:win
   ```

Electron Builder will automatically sign the executable.

---

### macOS Code Signing & Notarization

**Requirements**:
- Apple Developer Account ($99/year)
- Developer ID Application certificate
- App-specific password

**Steps**:

1. **Install certificate** in Keychain

2. **Set environment variables**:
   ```bash
   export APPLE_ID=your@email.com
   export APPLE_ID_PASSWORD=app-specific-password
   export APPLE_TEAM_ID=your-team-id
   ```

3. **Add to electron-builder config**:
   ```json
   {
     "mac": {
       "hardenedRuntime": true,
       "gatekeeperAssess": false,
       "entitlements": "build/entitlements.mac.plist",
       "entitlementsInherit": "build/entitlements.mac.plist"
     },
     "afterSign": "scripts/notarize.js"
   }
   ```

4. **Build**:
   ```bash
   npm run dist:mac
   ```

---

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/build.yml`:

```yaml
name: Build

on:
  push:
    branches: [main]
    tags: ['v*']
  pull_request:

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate Prisma client
        run: npm run prisma:generate
      
      - name: Build
        run: npm run build
      
      - name: Package
        run: npm run dist
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: release/*
```

### Release Workflow

```yaml
name: Release

on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]

    steps:
      # ... (same as build workflow) ...
      
      - name: Release
        uses: softprops/action-gh-release@v1
        with:
          files: release/*
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Release Process

### 1. Prepare Release

1. **Update version** in `package.json`:
   ```json
   {
     "version": "1.0.0"
   }
   ```

2. **Update CHANGELOG** (if exists)

3. **Run tests**:
   ```bash
   npm test
   npm run test:electron
   npm run lint
   ```

4. **Build locally**:
   ```bash
   npm run dist
   ```

5. **Test the build** on target platforms

### 2. Create Git Tag

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### 3. Create GitHub Release

1. Go to GitHub Releases
2. Click "Create a new release"
3. Select the tag
4. Add release notes
5. Upload build artifacts from `release/`
6. Publish release

---

## Build Optimization

### Reduce Bundle Size

1. **Enable tree shaking** (enabled by default in production)
2. **Analyze bundle**:
   ```bash
   ng build --stats-json
   npx webpack-bundle-analyzer dist/browser/stats.json
   ```
3. **Lazy load modules** where possible
4. **Remove unused dependencies**

### Improve Build Speed

1. **Use incremental builds** in development
2. **Enable caching** in CI/CD
3. **Use multi-stage Docker builds** for CI
4. **Parallelize builds** across platforms

---

## Troubleshooting

### Build Failures

**Issue**: Native module compilation fails

**Solution**:
```bash
npx electron-rebuild
```

---

**Issue**: Prisma client not found in production build

**Solution**: Ensure `asarUnpack` includes Prisma files

---

**Issue**: Application won't start after packaging

**Solutions**:
1. Check DevTools console for errors
2. Verify all dependencies are included
3. Test with unpacked build: `npm run pack`

---

### Platform-Specific Issues

**Windows**: SmartScreen warning

**Solution**: Code sign your application

---

**macOS**: "App is damaged" error

**Solution**: Sign and notarize your application

---

**Linux**: AppImage won't run

**Solution**: Make it executable: `chmod +x *.AppImage`

---

## Distribution

### GitHub Releases

**Pros**:
- Free
- Integrated with repository
- Version management

**Usage**:
1. Create release with tag
2. Upload build artifacts
3. Users download from releases page

### Auto-Update

To implement auto-updates with `electron-updater`:

1. **Install dependency**:
   ```bash
   npm install electron-updater
   ```

2. **Configure** in `main.ts`:
   ```typescript
   import { autoUpdater } from 'electron-updater';
   
   autoUpdater.checkForUpdatesAndNotify();
   ```

3. **Publish updates** to GitHub Releases

4. **Users get notified** of new versions

---

## Best Practices

1. **Version consistently**: Use semantic versioning (SemVer)
2. **Test before release**: Test on all target platforms
3. **Sign your code**: Prevents security warnings
4. **Provide changelogs**: Help users understand updates
5. **Use CI/CD**: Automate builds and releases
6. **Monitor bundle size**: Keep downloads manageable
7. **Back up signing certificates**: Critical for updates

---

## Related Documentation

- [Electron Builder Documentation](https://www.electron.build/)
- [Semantic Versioning](https://semver.org/)
- [Development Setup](Development-Setup.md)
- [Architecture](Architecture.md)

---

# Compilación y Despliegue (Español)

Esta guía cubre la compilación, empaquetado y despliegue de OpenTimeTracker para producción.

## Compilación de Producción

### Compilación Completa

```bash
npm run build
```

**Qué hace**:
1. Ejecuta `ng build` (configuración de producción)
2. Compila proceso main de Electron
3. Compila preload de Electron

**Salida**: `dist/`

---

## Empaquetado

### Empaquetar para Todas las Plataformas

```bash
npm run dist
```

**Salida**: `release/`

### Empaquetado Específico por Plataforma

**Windows**:
```bash
npm run dist:win
```

**macOS**:
```bash
npm run dist:mac
```

**Linux**:
```bash
npm run dist:linux
```

---

## Proceso de Liberación

1. **Actualizar versión** en `package.json`
2. **Ejecutar pruebas**: `npm test`
3. **Compilar**: `npm run dist`
4. **Probar** en plataformas objetivo
5. **Crear tag de Git**: `git tag -a v1.0.0 -m "Release 1.0.0"`
6. **Push tag**: `git push origin v1.0.0`
7. **Crear release en GitHub** y subir archivos

---

Para más detalles, consulta las secciones anteriores en inglés.
