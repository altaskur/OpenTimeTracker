<p align="center">
  <img src="public/icon.png" alt="OpenTimeTracker Logo" width="80" height="80">
</p>

<h1 align="center">OpenTimeTracker</h1>

<p align="center">
  <strong>Free and open source time tracking application for developers and teams</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#development">Development</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <a href="https://sonarcloud.io/summary/new_code?id=altaskur_OpenTimeTracker">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=altaskur_OpenTimeTracker&metric=alert_status" alt="Quality Gate Status">
  </a>
  <a href="https://sonarcloud.io/summary/new_code?id=altaskur_OpenTimeTracker">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=altaskur_OpenTimeTracker&metric=coverage" alt="Coverage">
  </a>
  <a href="https://sonarcloud.io/summary/new_code?id=altaskur_OpenTimeTracker">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=altaskur_OpenTimeTracker&metric=bugs" alt="Bugs">
  </a>
  <a href="https://sonarcloud.io/summary/new_code?id=altaskur_OpenTimeTracker">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=altaskur_OpenTimeTracker&metric=vulnerabilities" alt="Vulnerabilities">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-21-DD0031?logo=angular" alt="Angular 21">
  <img src="https://img.shields.io/badge/Electron-37-47848F?logo=electron" alt="Electron 37">
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite" alt="SQLite">
  <img src="https://img.shields.io/badge/License-GPL%20v3-blue.svg" alt="License: GPL v3">
</p>

---

## ✨ Features

- 📊 **Project Management** - Create and organize projects with full CRUD operations
- ✅ **Task Tracking** - Manage tasks with statuses, tags, and time estimates
- ⏱️ **Time Entries** - Log work time with notes and date tracking
- 📅 **Calendar View** - Visual calendar to see your time entries
- 🏷️ **Tags & Categories** - Organize tasks with customizable tags
- 🌙 **Dark Mode** - Beautiful dark theme with Aura Black preset
- 🌐 **Multi-language** - Support for English and Spanish
- 💾 **Local Database** - All data stored locally with SQLite
- 🔄 **Backup System** - Automatic backup on shutdown

## 📥 Installation

### Windows

Download the latest installer from the [Releases](https://github.com/altaskur/OpenTimeTracker/releases) page.

### Build from Source

```bash
# Clone the repository
git clone https://github.com/altaskur/OpenTimeTracker.git
cd OpenTimeTracker

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Build and run
npm run dev
```

## 🛠️ Development

### Prerequisites

- Node.js 20+
- npm 10+

### Commands

| Command                 | Description                          |
| ----------------------- | ------------------------------------ |
| `npm start`             | Start Angular dev server (port 4200) |
| `npm run dev`           | Build and run Electron app           |
| `npm run build`         | Production build                     |
| `npm run dist:win`      | Generate Windows installer           |
| `npm test`              | Run Angular tests                    |
| `npm run test:electron` | Run Electron tests                   |
| `npm run lint`          | Run ESLint                           |
| `npm run sonar:check`   | Run tests + SonarQube analysis       |

### Database

The app uses **SQLite with Prisma ORM**. After modifying the schema:

```bash
# Create migration
npx prisma migrate dev --name your_migration_name

# Update production template
npm run prisma:template
```

### Project Structure

```text
OpenTimeTracker/
├── electron/src/           # Electron main process
│   ├── main/               # Window management
│   ├── preload/            # IPC bridge
│   └── services/           # Database & handlers
├── src/app/                # Angular application
│   ├── components/         # Shared components
│   ├── pages/              # Route pages
│   └── services/           # Angular services
├── prisma/                 # Database schema & migrations
└── scripts/                # Build scripts
```

## ⌨️ Keyboard Shortcuts

| Shortcut       | Action            |
| -------------- | ----------------- |
| `Ctrl+1`       | Go to Home        |
| `Ctrl+2`       | Go to Calendar    |
| `Ctrl+3`       | Go to Projects    |
| `Ctrl+N`       | New time entry    |
| `Ctrl+Shift+N` | New project       |
| `Ctrl+T`       | Toggle dark mode  |
| `F11`          | Toggle fullscreen |

## 🔍 Code Quality

This project uses **SonarQube** for static code analysis. Before contributing to `develop`, you must pass the local SonarQube analysis.

### Prerequisites for Development

- Docker & Docker Compose

### Local SonarQube Setup

1. **Start SonarQube** (first time takes ~2 minutes):

   ```bash
   docker-compose up -d
   ```

2. **Access SonarQube** at <http://localhost:9000>
   - Default credentials: `admin` / `admin`
   - You'll be prompted to change the password on first login

3. **Generate a token**:
   - Go to: My Account → Security → Generate Tokens
   - Create a token and copy it

4. **Create a `.env` file** in the project root:

   ```
   SONAR_TOKEN=your_generated_token_here
   ```

5. **Run the full analysis** (tests + coverage + SonarQube):

   ```bash
   npm run sonar:check
   ```

6. **Stop SonarQube** when done:

   ```bash
   docker-compose down
   ```

> ⚠️ **Important**: The pre-push hook automatically runs `sonar:check` for all feature branches (`feat/*`, `fix/*`, `chore/*`, etc.). Your push will be blocked if the analysis fails.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

This means:

- ✅ You can use, modify, and distribute this software
- ✅ You must keep it open source
- ✅ You must include the original copyright and license
- ✅ Any derivative work must use the same license

## 👤 Author

**altaskur**

- GitHub: [@altaskur](https://github.com/altaskur)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/altaskur">altaskur</a>
</p>
