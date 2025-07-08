# Arquitectura del Proyecto

Documentación de la arquitectura y estructura del proyecto OpenTimeTracker.

## Stack Tecnológico

- **Frontend**: Angular 20 con componentes standalone
- **Desktop**: Electron
- **UI Library**: PrimeNG 20 con tema Aura Black personalizado
- **Styling**: SCSS con design tokens
- **Base de datos**: SQLite (para desarrollo local)
- **Build**: Angular CLI + TypeScript

## Estructura del Proyecto

```text
OpenTimeTracker/
├── docs/                           # Documentación del proyecto
├── electron/                       # Código de Electron
│   ├── src/                        # Código fuente
│   │   ├── main/                   # Proceso principal
│   │   │   ├── main.ts             # Entry point principal
│   │   │   └── window.ts           # Gestor de ventanas
│   │   ├── services/               # Servicios y lógica de negocio
│   │   │   ├── database/           # Gestor de base de datos
│   │   │   │   └── database.ts     # Clase DatabaseManager
│   │   │   ├── ipc/               # Handlers IPC organizados
│   │   │   │   ├── index.ts        # Configurador principal IPC
│   │   │   │   └── database-handlers.ts # Handlers de BD
│   │   │   └── navigation/         # Navegación y routing
│   │   │       └── navigation-handler.ts # Manejador de navegación
│   │   ├── preload/               # Scripts de preload
│   │   │   └── preload.ts         # Script principal de preload
│   ├── build/                     # Configuración de build
│   │   └── tsconfig.json          # Config TypeScript para Electron
│   └── dist/                      # Archivos compilados (auto-generado)
├── src/                           # Código fuente Angular
│   ├── app/                       # Aplicación Angular
│   │   ├── pages/                 # Páginas de la aplicación
│   │   │   ├── home/              # Página principal
│   │   │   └── examples/          # Página de ejemplos
│   │   ├── themes/                # Temas personalizados
│   │   │   └── aura-black.preset.ts # Preset del tema Aura Black
│   │   ├── app.config.ts          # Configuración principal de Angular
│   │   ├── app.routes.ts          # Configuración de rutas
│   │   └── app.ts                 # Componente raíz
│   ├── types/                     # Definiciones de tipos TypeScript
│   │   └── electron.d.ts          # Tipos para la API de Electron
│   ├── main.ts                    # Bootstrap de Angular
│   └── styles.scss                # Estilos globales
├── dist/                          # Archivos compilados
└── public/                        # Recursos estáticos
```

## Flujo de Datos

### Angular ↔ Electron Communication (IPC)

```typescript
// En Angular (renderer process)
const result = await window.electronAPI.ping();
const examples = await window.electronAPI.getExamples();

// En Electron (main process)
ipcMain.handle('ping', async () => 'pong');
ipcMain.handle('get-examples', async () => dbManager.getExamples());
```

### Base de Datos

- **SQLite** para almacenamiento local
- **Patrón Repository** en `DatabaseManager`
- **Operaciones CRUD** básicas implementadas

## Patrones Utilizados

- **Standalone Components**: Componentes Angular independientes
- **Modular Architecture**: Separación clara de responsabilidades
- **Design Tokens**: Variables CSS para consistencia visual
- **IPC Pattern**: Comunicación Inter-Process para Electron
