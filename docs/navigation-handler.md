# Navigation Handler

Este módulo maneja toda la lógica de navegación y reload para la aplicación Electron con Angular.

## Características

- **🔄 Interceptor de navegación**: Redirige navegaciones locales al `index.html`
- **⚡ Manejador de errores**: Captura errores `ERR_FILE_NOT_FOUND` y redirige automáticamente
- **⌨️ Interceptor de teclas**: Maneja `F5` y `Ctrl+R` para reload correcto
- **🎯 SPA Support**: Soporte completo para Single Page Applications con Angular Router

## Uso

```typescript
// En main.ts
import { NavigationHandler } from './navigation-handler';

// Crear el manejador
const navigationHandler = new NavigationHandler(mainWindow);

// Configurar todos los manejadores
navigationHandler.setupNavigationHandlers();

// Cargar la página inicial
navigationHandler.loadIndex();
```

## Métodos Públicos

### `setupNavigationHandlers()`

Configura todos los event listeners necesarios para manejar la navegación.

### `loadIndex()`

Carga la página principal (`index.html`).

### `getIndexUrl()`

Retorna la URL completa del archivo `index.html`.

## Eventos Manejados

1. **`will-navigate`**: Intercepta navegaciones para redirigir al index.html
2. **`did-fail-load`**: Maneja errores de carga y redirige automáticamente
3. **`before-input-event`**: Intercepta teclas de reload (F5, Ctrl+R)

## Beneficios

- ✅ Código más limpio y modular
- ✅ Fácil mantenimiento
- ✅ Reutilizable en otros proyectos
- ✅ Separación clara de responsabilidades
- ✅ Manejo robusto de errores
