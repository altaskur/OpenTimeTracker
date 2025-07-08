# Scripts NPM - Referencia Completa

Documentación de todos los scripts disponibles en el proyecto.

## 📋 Scripts Disponibles

### 🚀 `npm start`
**Desarrollo Angular en navegador**

```bash
npm start
```

- **Ejecuta**: `ng serve`
- **Puerto**: http://localhost:4200
- **Propósito**: Desarrollo de UI sin Electron
- **Características**: Hot reload automático, DevTools Angular
- **Uso**: Ideal para desarrollo de componentes y estilos

---

### ⚡ `npm run dev`
**Desarrollo completo con Electron (RECOMENDADO)**

```bash
npm run dev
```

- **Ejecuta**: `ng build --development && tsc --project electron/tsconfig.json && electron .`
- **Propósito**: Desarrollo principal de la aplicación completa
- **Incluye**: 
  - Build rápido de Angular (desarrollo)
  - Compilación de TypeScript de Electron
  - Ejecución automática de Electron
- **Uso**: Comando principal para desarrollo diario

---

### 🏗️ `npm run build`
**Build completo de producción**

```bash
npm run build
```

- **Ejecuta**: `ng build && tsc --project electron/tsconfig.json`
- **Propósito**: Preparar la aplicación para distribución
- **Optimizaciones**: 
  - Minificación de código
  - Tree shaking
  - Optimización de assets
- **Salida**: `dist/OpenTimeTracker/` y `dist/electron/`
- **Uso**: Antes de crear instaladores o distribuir la app

---

### 🖥️ `npm run electron`
**Ejecutar Electron únicamente**

```bash
npm run electron
```

- **Ejecuta**: `electron .`
- **Requisito**: Debe haberse ejecutado `npm run build` previamente
- **Propósito**: Testing de build de producción
- **Uso**: Verificar el comportamiento en producción

---

### 🧪 `npm test`
**Ejecutar tests unitarios**

```bash
npm test
```

- **Ejecuta**: `ng test`
- **Framework**: Jasmine + Karma
- **Navegador**: Chrome (por defecto)
- **Modo**: Watch mode automático
- **Uso**: Validación de componentes Angular

## 🔄 Flujo de Trabajo Recomendado

### Desarrollo Diario
```bash
# 1. Iniciar desarrollo
npm run dev

# 2. Para desarrollo solo de UI
npm start

# 3. Ejecutar tests
npm test
```

### Preparar Release
```bash
# 1. Build completo
npm run build

# 2. Verificar en Electron
npm run electron

# 3. Todo listo para distribución
```

## ⚙️ Scripts Eliminados

Para simplicidad, se eliminaron estos scripts redundantes:

- ❌ `ng` - Usar Angular CLI directamente si es necesario
- ❌ `build:dev` - Integrado en `npm run dev`
- ❌ `build:electron` - Integrado en `npm run build` y `npm run dev`
- ❌ `watch` - Usar `npm start` para desarrollo
- ❌ `electron:dev` - Renombrado a `npm run dev`
- ❌ `lint` - Se puede ejecutar directamente con `ng lint` si es necesario
- ❌ `serve:dist` - Innecesario para workflow normal

## 💡 Tips

1. **Desarrollo rápido**: Usa `npm run dev` para desarrollo completo
2. **Solo UI**: Usa `npm start` cuando trabajas solo en componentes
3. **Testing**: Mantén `npm test` corriendo en otra terminal
4. **Producción**: Siempre usa `npm run build` antes de distribuir
