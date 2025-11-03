# OpenTimeTracker

Sistema de seguimiento de tiempo para proyectos y tareas construido con **Angular 20 + Electron + SQLite**.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Desarrollo (Angular en navegador)
npm start

# Desarrollo con Electron
npm run dev

# Build para producción
npm run build
npm run electron
```

## 📁 Estructura del Proyecto

```bash
OpenTimeTracker/
├── electron/src/
│   ├── main/              # Proceso principal de Electron
│   ├── preload/           # Bridge Angular-Electron
│   └── services/
│       ├── database/      # DatabaseManager con SQLite
│       └── ipc/           # Handlers IPC para comunicación
├── src/app/
│   ├── pages/
│   │   ├── home/          # Página inicial
│   │   ├── dashboard/     # Dashboard con estadísticas
│   │   └── projects/      # Gestión de proyectos (CRUD)
│   ├── services/
│   │   └── database.service.ts  # Servicio Angular para DB
│   └── themes/            # Tema Aura Black
└── src/types/
    └── electron.d.ts      # Tipos TypeScript para modelos
```

## 🗄️ Modelo de Datos (SQLite)

### Tablas Principales

- **`projects`** - Proyectos
- **`tasks`** - Tareas vinculadas a proyectos
- **`task_status`** - Estados: Pendiente, En progreso, Completada, Bloqueada
- **`time_entries`** - Registros de tiempo trabajado
- **`work_periods`** - Horas planificadas por mes
- **`tags`** - Etiquetas para organizar tareas
- **`task_tags`** - Relación muchos-a-muchos entre tareas y tags

## ✨ Funcionalidades Implementadas

### ✅ Backend (Electron + SQLite)

- Base de datos SQLite con esquema completo
- DatabaseManager con métodos CRUD para todas las entidades
- IPC Handlers para comunicación segura
- Persistencia automática en `dist/data/timetracker.db`

### ✅ Frontend (Angular)

- **Home**: Navegación principal
- **Projects**: Tabla con CRUD completo (crear, editar, eliminar)
- **Dashboard**: Vista de entradas de tiempo y estadísticas
- DatabaseService para consumir IPC API
- Componentes standalone con signals

### 🔄 Flujo de Datos

```bash
Angular Component → DatabaseService → ElectronAPI (preload) 
→ IPC Handler → DatabaseManager → SQLite
```

## 📊 Funcionalidades Disponibles

| Entidad | Get | Create | Update | Delete |
|---------|-----|--------|--------|--------|
| Projects | ✅ | ✅ | ✅ | ✅ |
| Tasks | ✅ | ✅ | ✅ | ✅ |
| Time Entries | ✅ | ✅ | ✅ | ✅ |
| Work Periods | ✅ | ✅ | - | - |
| Task Statuses | ✅ | - | - | - |

## � Stack Tecnológico

- **Angular 20** - Framework frontend (componentes standalone)
- **Electron 37** - Aplicación de escritorio
- **PrimeNG 20** - Librería de componentes UI
- **SQLite** (better-sqlite3) - Base de datos local
- **TypeScript** - Tipado estático end-to-end

## ⌨️ Atajos de Teclado

El menú de Electron incluye atajos completos para gestión de tiempo:

### Navegación

- `Ctrl/Cmd + 1` - Ir a Inicio
- `Ctrl/Cmd + 2` - Ir a Dashboard
- `Ctrl/Cmd + 3` - Ir a Proyectos
- `Alt + ←` - Página anterior
- `Alt + →` - Página siguiente

### Acciones Rápidas

- `Ctrl/Cmd + N` - Nueva entrada de tiempo
- `Ctrl/Cmd + Shift + N` - Nuevo proyecto
- `Ctrl/Cmd + E` - Exportar datos

### Archivo

- `Ctrl/Cmd + R` - Recargar aplicación
- `Alt + F4` / `Cmd + Q` - Salir

### Vista

- `Ctrl/Cmd + T` - Alternar modo oscuro
- `Ctrl/Cmd + Shift + I` - Abrir DevTools
- `F11` / `Ctrl + Cmd + F` - Pantalla completa
- `Ctrl/Cmd + +` - Aumentar zoom
- `Ctrl/Cmd + -` - Reducir zoom
- `Ctrl/Cmd + 0` - Zoom normal

### Ayuda

- `Ctrl/Cmd + /` - Ver todos los atajos

## 🛠️ Comandos

| Comando | Descripción |
|---------|-------------|
| `npm start` | Servidor Angular en puerto 4200 |
| `npm run build` | Compilar completo (Angular + Electron) |
| `npm run dev` | Build + ejecutar Electron |
| `npm run electron` | Ejecutar Electron (requiere build previo) |
| `npm test` | Ejecutar tests |

## 📝 Próximos Pasos Sugeridos

1. **Formularios de Tareas**: Agregar gestión de tareas en la página Projects
2. **Registro de Tiempo**: Formulario para crear time entries desde Dashboard
3. **Filtros y Búsqueda**: Añadir filtros por fechas, proyectos, etc.
4. **Reportes**: Generar reportes de horas por proyecto/mes
5. **Tags System**: Implementar sistema de etiquetas
6. **Exportación**: CSV/Excel de datos
7. **Validaciones**: Formularios con validación completa
8. **Dark Mode Toggle**: Persistir preferencia de tema

---

**Isaac Julián** · OpenTimeTracker v1.0
