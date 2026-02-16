# Getting Started with OpenTimeTracker

This guide will help you install and start using OpenTimeTracker.

## Installation

### Download Pre-built Releases (Recommended)

The easiest way to get started is to download a pre-built release for your platform:

👉 **[Download from Releases](https://github.com/altaskur/OpenTimeTracker/releases)**

#### Supported Platforms

| Platform | File Type | Notes |
|----------|-----------|-------|
| **Windows** | `.exe` | NSIS installer for x64 |
| **macOS** | `.dmg` | Universal binary (Intel & Apple Silicon) |
| **Linux** | `.AppImage` | Portable, no installation required |
| **Linux** | `.deb` | Debian/Ubuntu package |

#### Installation Steps

**Windows:**
1. Download `OpenTimeTracker-{version}-win-x64.exe`
2. Run the installer
3. Follow the installation wizard
4. Launch OpenTimeTracker from Start Menu or Desktop

**macOS:**
1. Download `OpenTimeTracker-{version}-mac-{arch}.dmg`
2. Open the DMG file
3. Drag OpenTimeTracker to Applications folder
4. Launch from Applications
5. If you see a security warning, go to System Preferences → Security & Privacy → Allow

**Linux (AppImage):**
1. Download `OpenTimeTracker-{version}-linux-x64.AppImage`
2. Make it executable: `chmod +x OpenTimeTracker-*.AppImage`
3. Run: `./OpenTimeTracker-*.AppImage`

**Linux (Debian/Ubuntu):**
1. Download `OpenTimeTracker-{version}-linux-x64.deb`
2. Install: `sudo dpkg -i OpenTimeTracker-*.deb`
3. Launch: `opentimetracker` or find it in your application menu

---

### Run from Source (Advanced)

If you want to run the latest development version or contribute to the project:

#### Prerequisites

- Node.js 20 or higher
- npm 10 or higher
- Git

#### Steps

```bash
# Clone the repository
git clone https://github.com/altaskur/OpenTimeTracker.git
cd OpenTimeTracker

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run in development mode
npm run dev
```

The application will build and launch in Electron.

---

## First Launch

### Initial Setup

When you first launch OpenTimeTracker:

1. **Language Selection**: Choose your preferred language (English or Spanish)
2. **Dark Mode**: The app uses dark theme by default (can be changed in settings)
3. **Database**: A local SQLite database is automatically created at:
   - Windows: `%APPDATA%\OpenTimeTracker\data\timetracker.db`
   - macOS: `~/Library/Application Support/OpenTimeTracker/data/timetracker.db`
   - Linux: `~/.config/OpenTimeTracker/data/timetracker.db`

### Creating Your First Project

1. Click **"Projects"** in the sidebar
2. Click **"New Project"** button
3. Fill in the project details:
   - **Name**: Enter a project name
   - **Description**: Optional project description
4. Click **"Save"**

### Creating Your First Task

1. From the project view, click **"Add Task"**
2. Or navigate to **"Tasks"** and click **"New Task"**
3. Fill in task details:
   - **Project**: Select the project
   - **Task Name**: Enter a descriptive name
   - **Description**: Optional details
   - **Estimated Hours**: Optional time estimate
   - **Status**: Choose from available statuses
   - **Tags**: Add tags for categorization
4. Click **"Save"**

### Tracking Time

1. Navigate to **"Calendar"** view
2. Click on a date to add a time entry
3. Fill in:
   - **Task**: Select the task (optional)
   - **Time**: Enter hours and minutes
   - **Notes**: Optional notes about what you worked on
4. Click **"Save"**

---

## Quick Tour

### Main Navigation

The sidebar provides access to all main features:

- **🏠 Home** - Dashboard with statistics and recent activity
- **📋 Projects** - Manage your projects
- **✅ Tasks** - View and manage all tasks
- **📅 Calendar** - Time tracking calendar view
- **📊 History** - View action history and audit logs
- **⚙️ Settings** - Configure app settings, statuses, tags, and day types

### Key Features Overview

#### Projects & Tasks
- Organize work into projects
- Create tasks within projects
- Track task status (To Do, In Progress, Done, etc.)
- Add tags for better organization
- Close projects when completed

#### Time Tracking
- Calendar-based time entry
- Add time with notes
- View daily, weekly, and monthly summaries
- Track time with or without tasks

#### Work Configuration
- Set daily/weekly work hours
- Configure work days
- Set different schedules per day
- Override specific months
- Define day types (holidays, vacation, etc.)

#### Backup & Data
- Automatic backups on shutdown
- All data stored locally in SQLite
- Full control over your data
- No cloud sync or external dependencies

---

## Basic Workflow

Here's a typical workflow:

1. **Create Projects** for your different work areas
2. **Add Tasks** to each project
3. **Track Time** in the calendar view
4. **Review Progress** in the Home dashboard
5. **Adjust Statuses** as tasks progress
6. **Close Projects** when completed

---

## Tips for New Users

- ⭐ Use **tags** to categorize tasks across projects
- 📊 Check the **Home** dashboard for quick stats
- 🎨 Customize **statuses** to match your workflow
- 📅 Use **day types** to mark holidays and special days
- 💾 Your data is backed up automatically on exit
- 🌙 Dark mode is enabled by default for comfort

---

## Next Steps

- Read the **[User Guide](User-Guide.md)** for detailed feature documentation
- Learn about **[Work Configuration](User-Guide.md#work-configuration)** to set up your schedule
- Explore **[Calendar Features](User-Guide.md#calendar-time-tracking)** for time tracking
- Check **[Settings](User-Guide.md#settings)** for customization options

---

## Need Help?

- Check the **[FAQ](FAQ.md)** for common questions
- Visit **[Troubleshooting](Troubleshooting.md)** if you encounter issues
- Open an issue on [GitHub](https://github.com/altaskur/OpenTimeTracker/issues)

---

# Guía de Inicio (Español)

Esta guía te ayudará a instalar y comenzar a usar OpenTimeTracker.

## Instalación

### Descargar Versiones Pre-compiladas (Recomendado)

La forma más fácil de comenzar es descargar una versión pre-compilada para tu plataforma:

👉 **[Descargar desde Releases](https://github.com/altaskur/OpenTimeTracker/releases)**

#### Plataformas Soportadas

| Plataforma | Tipo de Archivo | Notas |
|------------|-----------------|-------|
| **Windows** | `.exe` | Instalador NSIS para x64 |
| **macOS** | `.dmg` | Binario universal (Intel y Apple Silicon) |
| **Linux** | `.AppImage` | Portable, no requiere instalación |
| **Linux** | `.deb` | Paquete Debian/Ubuntu |

#### Pasos de Instalación

**Windows:**
1. Descarga `OpenTimeTracker-{version}-win-x64.exe`
2. Ejecuta el instalador
3. Sigue el asistente de instalación
4. Inicia OpenTimeTracker desde el Menú Inicio o Escritorio

**macOS:**
1. Descarga `OpenTimeTracker-{version}-mac-{arch}.dmg`
2. Abre el archivo DMG
3. Arrastra OpenTimeTracker a la carpeta Aplicaciones
4. Inicia desde Aplicaciones
5. Si ves una advertencia de seguridad, ve a Preferencias del Sistema → Seguridad y Privacidad → Permitir

**Linux (AppImage):**
1. Descarga `OpenTimeTracker-{version}-linux-x64.AppImage`
2. Hazlo ejecutable: `chmod +x OpenTimeTracker-*.AppImage`
3. Ejecuta: `./OpenTimeTracker-*.AppImage`

**Linux (Debian/Ubuntu):**
1. Descarga `OpenTimeTracker-{version}-linux-x64.deb`
2. Instala: `sudo dpkg -i OpenTimeTracker-*.deb`
3. Inicia: `opentimetracker` o búscalo en tu menú de aplicaciones

---

### Ejecutar desde Código Fuente (Avanzado)

Si deseas ejecutar la última versión de desarrollo o contribuir al proyecto:

#### Requisitos Previos

- Node.js 20 o superior
- npm 10 o superior
- Git

#### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/altaskur/OpenTimeTracker.git
cd OpenTimeTracker

# Instalar dependencias
npm install

# Generar cliente Prisma
npm run prisma:generate

# Ejecutar en modo desarrollo
npm run dev
```

La aplicación se compilará e iniciará en Electron.

---

## Primer Inicio

### Configuración Inicial

Cuando inicies OpenTimeTracker por primera vez:

1. **Selección de Idioma**: Elige tu idioma preferido (Inglés o Español)
2. **Modo Oscuro**: La aplicación usa tema oscuro por defecto (se puede cambiar en configuración)
3. **Base de Datos**: Se crea automáticamente una base de datos SQLite local en:
   - Windows: `%APPDATA%\OpenTimeTracker\data\timetracker.db`
   - macOS: `~/Library/Application Support/OpenTimeTracker/data/timetracker.db`
   - Linux: `~/.config/OpenTimeTracker/data/timetracker.db`

### Crear tu Primer Proyecto

1. Haz clic en **"Proyectos"** en la barra lateral
2. Haz clic en el botón **"Nuevo Proyecto"**
3. Completa los detalles del proyecto:
   - **Nombre**: Ingresa un nombre para el proyecto
   - **Descripción**: Descripción opcional del proyecto
4. Haz clic en **"Guardar"**

### Crear tu Primera Tarea

1. Desde la vista de proyecto, haz clic en **"Agregar Tarea"**
2. O navega a **"Tareas"** y haz clic en **"Nueva Tarea"**
3. Completa los detalles de la tarea:
   - **Proyecto**: Selecciona el proyecto
   - **Nombre de Tarea**: Ingresa un nombre descriptivo
   - **Descripción**: Detalles opcionales
   - **Horas Estimadas**: Estimación de tiempo opcional
   - **Estado**: Elige entre los estados disponibles
   - **Etiquetas**: Agrega etiquetas para categorización
4. Haz clic en **"Guardar"**

### Rastrear Tiempo

1. Navega a la vista de **"Calendario"**
2. Haz clic en una fecha para agregar una entrada de tiempo
3. Completa:
   - **Tarea**: Selecciona la tarea (opcional)
   - **Tiempo**: Ingresa horas y minutos
   - **Notas**: Notas opcionales sobre en qué trabajaste
4. Haz clic en **"Guardar"**

---

## Recorrido Rápido

### Navegación Principal

La barra lateral proporciona acceso a todas las funciones principales:

- **🏠 Inicio** - Panel con estadísticas y actividad reciente
- **📋 Proyectos** - Gestiona tus proyectos
- **✅ Tareas** - Ver y gestionar todas las tareas
- **📅 Calendario** - Vista de calendario para rastreo de tiempo
- **📊 Historial** - Ver historial de acciones y registros de auditoría
- **⚙️ Configuración** - Configurar ajustes de la app, estados, etiquetas y tipos de día

### Resumen de Funciones Clave

#### Proyectos y Tareas
- Organiza el trabajo en proyectos
- Crea tareas dentro de proyectos
- Rastrea el estado de tareas (Por Hacer, En Progreso, Hecho, etc.)
- Agrega etiquetas para mejor organización
- Cierra proyectos cuando se completen

#### Rastreo de Tiempo
- Entrada de tiempo basada en calendario
- Agrega tiempo con notas
- Ver resúmenes diarios, semanales y mensuales
- Rastrea tiempo con o sin tareas

#### Configuración de Trabajo
- Establece horas de trabajo diarias/semanales
- Configura días laborables
- Establece diferentes horarios por día
- Anula meses específicos
- Define tipos de día (vacaciones, días festivos, etc.)

#### Backup y Datos
- Backups automáticos al cerrar
- Todos los datos almacenados localmente en SQLite
- Control total sobre tus datos
- Sin sincronización en la nube o dependencias externas

---

## Flujo de Trabajo Básico

Aquí hay un flujo de trabajo típico:

1. **Crear Proyectos** para tus diferentes áreas de trabajo
2. **Agregar Tareas** a cada proyecto
3. **Rastrear Tiempo** en la vista de calendario
4. **Revisar Progreso** en el panel de Inicio
5. **Ajustar Estados** a medida que las tareas progresan
6. **Cerrar Proyectos** cuando se completen

---

## Consejos para Nuevos Usuarios

- ⭐ Usa **etiquetas** para categorizar tareas entre proyectos
- 📊 Revisa el panel de **Inicio** para estadísticas rápidas
- 🎨 Personaliza **estados** para que coincidan con tu flujo de trabajo
- 📅 Usa **tipos de día** para marcar vacaciones y días especiales
- 💾 Tus datos se respaldan automáticamente al salir
- 🌙 El modo oscuro está habilitado por defecto para comodidad

---

## Próximos Pasos

- Lee la **[Guía de Usuario](User-Guide.md#guía-de-usuario-español)** para documentación detallada de características
- Aprende sobre **[Configuración de Trabajo](User-Guide.md#configuración-de-trabajo-español)** para configurar tu horario
- Explora **[Funciones de Calendario](User-Guide.md#calendario-español)** para rastreo de tiempo
- Revisa **[Configuración](User-Guide.md#configuración-español)** para opciones de personalización

---

## ¿Necesitas Ayuda?

- Revisa las **[Preguntas Frecuentes](FAQ.md#preguntas-frecuentes-español)** para preguntas comunes
- Visita **[Solución de Problemas](Troubleshooting.md#solución-de-problemas-español)** si encuentras problemas
- Abre un issue en [GitHub](https://github.com/altaskur/OpenTimeTracker/issues)
