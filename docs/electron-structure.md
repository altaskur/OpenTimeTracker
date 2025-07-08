# Estructura de Electron - Guía Completa

Documentación de la nueva estructura organizada y escalable de Electron.

## 🏗️ Estructura Profesional

```text
electron/
├── src/                        # Código fuente TypeScript
│   ├── main/                   # Proceso principal de Electron
│   │   ├── main.ts            # Entry point y configuración de la app
│   │   └── window.ts          # Gestión de ventanas y UI
│   ├── services/              # Servicios y lógica de negocio
│   │   ├── database/          # Todo relacionado con base de datos
│   │   │   └── database.ts    # DatabaseManager con métodos CRUD
│   │   ├── ipc/              # Comunicación Inter-Process
│   │   │   ├── index.ts       # Configurador principal de IPC
│   │   │   └── database-handlers.ts # Handlers específicos de BD
│   │   └── navigation/        # Navegación y routing
│   │       └── navigation-handler.ts # Manejo de reload y rutas
│   ├── preload/              # Scripts de preload para seguridad
│   │   └── preload.ts        # Exposición segura de API a renderer
├── build/                    # Configuración de build
│   └── tsconfig.json        # Configuración TypeScript
└── dist/                    # Archivos compilados (auto-generado)
```

## 🎯 Beneficios de la Nueva Estructura

### ✅ **Organización por Responsabilidad**
- **`main/`**: Lógica de inicialización y ventanas
- **`services/`**: Lógica de negocio separada por dominio
- **`preload/`**: Seguridad e interfaz con renderer
- **`utils/`**: Herramientas reutilizables

### ✅ **Escalabilidad**
- Fácil agregar nuevos servicios
- Handlers IPC organizados por dominio
- Separación clara de responsabilidades
- Código modular y testeable

### ✅ **Mantenibilidad**
- Archivos pequeños y enfocados
- Imports claros y organizados
- Fácil localización de código
- Estructura predecible

## 📂 Descripción de Archivos

### `main/main.ts`
- **Propósito**: Entry point principal de Electron
- **Responsabilidades**: 
  - Inicialización de la aplicación
  - Configuración de eventos del ciclo de vida
  - Coordinación entre servicios

### `main/window.ts`
- **Propósito**: Gestión de ventanas de la aplicación
- **Responsabilidades**:
  - Creación y configuración de BrowserWindow
  - Carga de la aplicación Angular
  - Configuración de DevTools
  - Manejo de eventos de ventana

### `services/database/database.ts`
- **Propósito**: Gestión de base de datos SQLite
- **Responsabilidades**:
  - Conexión y configuración de BD
  - Operaciones CRUD
  - Migraciones y esquemas

### `services/ipc/index.ts`
- **Propósito**: Configuración centralizada de IPC
- **Responsabilidades**:
  - Registro de todos los handlers
  - Organización por dominios
  - Punto de entrada único para IPC

### `services/ipc/database-handlers.ts`
- **Propósito**: Handlers específicos para operaciones de BD
- **Responsabilidades**:
  - Comandos de base de datos
  - Validación de parámetros
  - Manejo de errores específicos

### `services/navigation/navigation-handler.ts`
- **Propósito**: Gestión de navegación y reload
- **Responsabilidades**:
  - Interceptación de navegación
  - Manejo de reload en SPA
  - Gestión de errores de carga

### `preload/preload.ts`
- **Propósito**: Exposición segura de API a renderer
- **Responsabilidades**:
  - Context bridge para IPC
  - API tipada para Angular
  - Seguridad entre procesos

## 🔄 Flujo de Datos

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Angular App   │◄──►│   Preload API    │◄──►│  IPC Handlers   │
│  (Renderer)     │    │ (Context Bridge) │    │ (Main Process)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │    Services     │
                                               │  (Database,     │
                                               │  Navigation)    │
                                               └─────────────────┘
```

## 🚀 Comandos de Build

Los comandos se han actualizado para usar la nueva estructura:

```bash
# Build completo
npm run build  # ng build && tsc --project electron/build/tsconfig.json

# Desarrollo
npm run dev    # build + electron

# Solo Electron
npm run electron
```

## 📈 Escalabilidad Futura

Esta estructura permite fácilmente:

- ✅ Agregar nuevos servicios en `services/`
- ✅ Crear nuevos handlers IPC por dominio
- ✅ Implementar middlewares y validaciones
- ✅ Agregar tests unitarios por módulo
- ✅ Implementar logging avanzado
- ✅ Agregar configuración por entorno
