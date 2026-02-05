# Frequently Asked Questions (FAQ)

Common questions about OpenTimeTracker.

## General Questions

### What is OpenTimeTracker?

OpenTimeTracker is a free, open-source desktop application for tracking time spent on projects and tasks. It's designed for developers and small teams who want full control over their data without relying on cloud services.

### Is OpenTimeTracker really free?

Yes! OpenTimeTracker is licensed under GPL-3.0, which means:
- ✅ Free to use
- ✅ Free to modify
- ✅ Free to distribute
- ✅ No subscriptions or hidden costs

### What platforms are supported?

- **Windows**: 10 and later (x64)
- **macOS**: 10.13 (High Sierra) and later (Intel & Apple Silicon)
- **Linux**: Most distributions (x64)

### Does it work offline?

Yes! OpenTimeTracker is fully offline. All data is stored locally on your computer. You don't need an internet connection to use the app.

### Is my data private?

Absolutely. Your data never leaves your computer unless you explicitly copy or export it. There is no telemetry, analytics, or cloud sync.

---

## Features

### Can I track time without assigning it to a task?

Yes! Time entries can be created without associating them with a task. This is useful for general time tracking.

### Can I organize tasks across multiple projects?

Tasks belong to a single project, but you can use **tags** to categorize tasks across different projects.

### Does it support multiple users?

OpenTimeTracker is designed as a single-user application. Each instance has its own local database.

### Can I customize task statuses?

Yes! Go to Settings → Statuses to:
- Create custom statuses
- Choose colors
- Set a default status

### Can I set different work schedules?

Yes! In Settings → Work Configuration:
- Set daily/weekly work hours
- Configure work days
- Set different schedules per day
- Override specific months

### Can I mark holidays and vacation days?

Yes! Use Settings → Day Types to:
- Create day types (Holiday, Vacation, Sick Leave, etc.)
- Assign colors
- Set default work minutes
- Override specific dates in the Calendar view

---

## Data & Backups

### Where is my data stored?

- **Windows**: `%APPDATA%\OpenTimeTracker\data\timetracker.db`
- **macOS**: `~/Library/Application Support/OpenTimeTracker/data/timetracker.db`
- **Linux**: `~/.config/OpenTimeTracker/data/timetracker.db`

### Are backups automatic?

Yes! OpenTimeTracker automatically creates a backup of your database when you close the application. Backups are saved in:
- `{app-data}/backups/timetracker-backup-YYYY-MM-DD-HH-mm-ss.db`

### How do I manually backup my data?

Simply copy the database file to a safe location:
```bash
# Example (macOS/Linux)
cp ~/Library/Application\ Support/OpenTimeTracker/data/timetracker.db ~/my-backup.db
```

### How do I restore from a backup?

1. Close OpenTimeTracker
2. Replace `timetracker.db` with your backup file
3. Restart the application

### Can I export my data?

Currently, manual export is available by:
- Copying the SQLite database file
- Using SQLite tools to export to CSV/JSON
- Feature request: Built-in export is planned

### Can I sync data across devices?

Not currently. OpenTimeTracker is local-first by design. However:
- You can manually copy the database file between devices
- Cloud sync via third-party tools (Dropbox, etc.) is possible but not officially supported
- Self-hosted sync may be added in the future

---

## Usage

### How do I close a project?

1. Go to Projects view
2. Click on the project
3. Click "Close Project" or edit and check "Is Closed"
4. Closed projects are hidden by default (use filter to show them)

### Can I reopen a closed project?

Yes! 
1. Show closed projects (filter)
2. Edit the project
3. Uncheck "Is Closed"

### Can I delete a project?

Yes, but **be careful**:
- Deleting a project also deletes all its tasks
- Time entries are kept but lose their task association
- This action cannot be undone (unless you restore from backup)

### How do I undo an action?

OpenTimeTracker tracks actions in the History view:
1. Go to History
2. Find the action
3. Click "Undo" (if available)

Note: Not all actions are undoable yet. This feature is being improved.

### Can I import time entries?

Not built-in yet, but you can:
- Manually insert via SQLite (advanced)
- Feature request: Import functionality is planned

---

## Technical

### What database does it use?

SQLite - a lightweight, file-based database. No server required.

### Can I view/edit the database directly?

Yes, using SQLite tools:
- **DB Browser for SQLite**: https://sqlitebrowser.org/
- **Prisma Studio**: `npm run prisma:studio` (for developers)

**Warning**: Direct database editing can corrupt data. Always backup first!

### How large can my database get?

SQLite can handle very large databases (terabytes), but for best performance:
- Typical usage: < 50MB
- Heavy usage: < 500MB
- Consider archiving old data if it grows beyond 1GB

### What's the tech stack?

- **Frontend**: Angular 21
- **Desktop**: Electron 37
- **Database**: Prisma + SQLite
- **UI**: PrimeNG + PrimeFlex
- **License**: GPL-3.0

See [Architecture](Architecture.md) for details.

---

## Internationalization

### What languages are supported?

Currently:
- English (en)
- Spanish (es)

### How do I change the language?

Settings → Language → Select language → Restart app

### Can I contribute translations?

Yes! See [Contributing Guide](../CONTRIBUTING.md). Translation files are in:
- `src/assets/i18n/en.json`
- `src/assets/i18n/es.json`

---

## Troubleshooting

### The app won't start. What should I do?

See [Troubleshooting Guide](Troubleshooting.md) for detailed solutions.

Quick checks:
1. Check if another instance is running
2. Check disk space
3. Try restarting your computer
4. Reinstall the application

### I lost my data. Can I recover it?

If you have backups:
1. Check `{app-data}/backups/` folder
2. Restore most recent backup

If no backups:
- Data may be unrecoverable
- **Prevention**: Always keep regular backups

### The database is corrupted. What now?

1. Restore from backup (recommended)
2. Try SQLite repair: `sqlite3 db.db ".recover" | sqlite3 new.db`
3. Last resort: Start fresh (data loss)

See [Troubleshooting Guide](Troubleshooting.md) for details.

### How do I report a bug?

1. Check [existing issues](https://github.com/altaskur/OpenTimeTracker/issues)
2. If not found, create a new issue with:
   - Description
   - Steps to reproduce
   - Expected vs actual behavior
   - System information
   - Screenshots (if applicable)

---

## Development

### How do I build from source?

See [Development Setup](Development-Setup.md).

Quick start:
```bash
git clone https://github.com/altaskur/OpenTimeTracker.git
cd OpenTimeTracker
npm install
npm run prisma:generate
npm run dev
```

### How can I contribute?

See [Contributing Guide](../CONTRIBUTING.md).

Ways to contribute:
- Report bugs
- Request features
- Submit pull requests
- Improve documentation
- Add translations

### What's the development workflow?

1. Fork the repository
2. Create a feature branch from `develop`
3. Make changes
4. Run tests and linting
5. Submit pull request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.

---

## Roadmap & Future

### What features are planned?

See [Roadmap](Roadmap.md) (if available) or check:
- [GitHub Issues](https://github.com/altaskur/OpenTimeTracker/issues)
- [GitHub Discussions](https://github.com/altaskur/OpenTimeTracker/discussions)

Commonly requested:
- CSV/JSON export
- Reports and analytics
- Pomodoro timer
- Integrations (Git, Jira, etc.)
- Optional self-hosted sync

### Is there a mobile app?

Not currently. OpenTimeTracker is a desktop application. A mobile app may be considered in the future.

### Will there be a cloud/SaaS version?

No. OpenTimeTracker is local-first by design. However:
- You can self-host a sync server (future feature)
- Third-party cloud sync (at your own risk)

### Is this actively maintained?

Yes! OpenTimeTracker is under active development. Check [commit history](https://github.com/altaskur/OpenTimeTracker/commits) and [releases](https://github.com/altaskur/OpenTimeTracker/releases) for activity.

---

## Security & Privacy

### Is my data secure?

Your data is as secure as your computer:
- Data is stored locally
- No cloud transmission
- No analytics or telemetry
- You control backups

**Best practices**:
- Use full-disk encryption (OS feature)
- Regular backups to secure location
- Keep OS and app updated

### Does it collect any data?

No. OpenTimeTracker:
- ❌ No telemetry
- ❌ No analytics
- ❌ No cloud sync
- ❌ No external network requests (except update checks)

### How do I report security vulnerabilities?

See [SECURITY.md](../SECURITY.md).

**Do NOT** report security issues publicly. Use:
- GitHub Security Advisories
- Direct contact with maintainer

---

## Licensing

### What does GPL-3.0 mean?

GPL-3.0 (GNU General Public License v3.0) means:
- ✅ Free to use for any purpose
- ✅ Free to study and modify the source code
- ✅ Free to share (redistribute)
- ✅ Any modifications must also be GPL-3.0
- ✅ Source code must be made available

### Can I use this commercially?

Yes! You can use OpenTimeTracker for commercial purposes.

### Can I sell this software?

You can sell OpenTimeTracker, but you must:
- Provide source code
- Keep GPL-3.0 license
- Clearly indicate it's free software

In practice, it's easier to just give it away (since source is freely available).

### Can I fork this project?

Yes! You can create a fork, but:
- Must maintain GPL-3.0 license
- Must provide source code
- Must credit original project

---

## Support

### Where can I get help?

- **Documentation**: Start with [Getting Started](Getting-Started.md)
- **Troubleshooting**: Check [Troubleshooting Guide](Troubleshooting.md)
- **FAQ**: You're here!
- **Issues**: [GitHub Issues](https://github.com/altaskur/OpenTimeTracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/altaskur/OpenTimeTracker/discussions)

### Is there community support?

Yes! 
- GitHub Discussions for questions
- GitHub Issues for bugs
- Community contributions welcome

### Is there paid support?

Currently no. OpenTimeTracker is a community-driven project. Support is provided by maintainers and community on a best-effort basis.

---

## Credits

### Who created OpenTimeTracker?

Created and maintained by [@altaskur](https://github.com/altaskur).

### How can I support the project?

- ⭐ Star the repository
- 🐛 Report bugs
- 💡 Suggest features
- 🤝 Contribute code
- 📖 Improve documentation
- 🌍 Add translations
- 💬 Help others in discussions

---

# Preguntas Frecuentes (Español)

Preguntas comunes sobre OpenTimeTracker.

## Preguntas Generales

### ¿Qué es OpenTimeTracker?

OpenTimeTracker es una aplicación de escritorio gratuita y de código abierto para rastrear tiempo dedicado a proyectos y tareas. Está diseñada para desarrolladores y equipos pequeños que desean control total sobre sus datos sin depender de servicios en la nube.

### ¿Es realmente gratis?

¡Sí! OpenTimeTracker está licenciado bajo GPL-3.0, lo que significa:
- ✅ Gratis para usar
- ✅ Gratis para modificar
- ✅ Gratis para distribuir
- ✅ Sin suscripciones ni costos ocultos

### ¿Qué plataformas son compatibles?

- **Windows**: 10 y posterior (x64)
- **macOS**: 10.13 (High Sierra) y posterior (Intel y Apple Silicon)
- **Linux**: La mayoría de distribuciones (x64)

### ¿Funciona sin conexión?

¡Sí! OpenTimeTracker funciona completamente offline. Todos los datos se almacenan localmente en tu computadora.

### ¿Son privados mis datos?

Absolutamente. Tus datos nunca salen de tu computadora a menos que los copies o exportes explícitamente. No hay telemetría, analytics ni sincronización en la nube.

---

## Características

### ¿Puedo rastrear tiempo sin asignarlo a una tarea?

¡Sí! Las entradas de tiempo se pueden crear sin asociarlas con una tarea.

### ¿Puedo personalizar los estados de tareas?

¡Sí! Ve a Configuración → Estados para:
- Crear estados personalizados
- Elegir colores
- Establecer un estado predeterminado

### ¿Puedo establecer diferentes horarios de trabajo?

¡Sí! En Configuración → Configuración de Trabajo:
- Establecer horas de trabajo diarias/semanales
- Configurar días laborables
- Establecer diferentes horarios por día
- Anular meses específicos

---

## Datos y Backups

### ¿Dónde se almacenan mis datos?

- **Windows**: `%APPDATA%\OpenTimeTracker\data\timetracker.db`
- **macOS**: `~/Library/Application Support/OpenTimeTracker/data/timetracker.db`
- **Linux**: `~/.config/OpenTimeTracker/data/timetracker.db`

### ¿Los backups son automáticos?

¡Sí! OpenTimeTracker crea automáticamente un backup de tu base de datos cuando cierras la aplicación.

### ¿Cómo hago un backup manual?

Simplemente copia el archivo de base de datos a una ubicación segura.

### ¿Cómo restauro desde un backup?

1. Cierra OpenTimeTracker
2. Reemplaza `timetracker.db` con tu archivo de backup
3. Reinicia la aplicación

---

## Solución de Problemas

### La aplicación no inicia. ¿Qué hago?

Ver [Guía de Solución de Problemas](Troubleshooting.md#solución-de-problemas-español).

Verificaciones rápidas:
1. Verificar si hay otra instancia ejecutándose
2. Verificar espacio en disco
3. Reiniciar computadora
4. Reinstalar aplicación

---

## Desarrollo

### ¿Cómo compilo desde el código fuente?

Ver [Configuración de Desarrollo](Development-Setup.md#configuración-de-desarrollo-español).

---

## Soporte

### ¿Dónde puedo obtener ayuda?

- **Documentación**: Comienza con [Comenzar](Getting-Started.md#guía-de-inicio-español)
- **Solución de Problemas**: [Guía](Troubleshooting.md#solución-de-problemas-español)
- **Problemas**: [GitHub Issues](https://github.com/altaskur/OpenTimeTracker/issues)

---

Para más preguntas, consulta las secciones anteriores en inglés.
