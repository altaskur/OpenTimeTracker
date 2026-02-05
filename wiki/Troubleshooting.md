# Troubleshooting Guide

This guide helps you resolve common issues with OpenTimeTracker.

## Quick Diagnostics

### Check Application Version

**Windows**: Help → About OpenTimeTracker
**macOS**: OpenTimeTracker → About OpenTimeTracker
**Linux**: Help → About OpenTimeTracker

### Check Database Location

Default locations:
- **Windows**: `%APPDATA%\OpenTimeTracker\data\timetracker.db`
- **macOS**: `~/Library/Application Support/OpenTimeTracker/data/timetracker.db`
- **Linux**: `~/.config/OpenTimeTracker/data/timetracker.db`

### Check Logs

Logs are written to:
- **Windows**: `%APPDATA%\OpenTimeTracker\logs\`
- **macOS**: `~/Library/Logs/OpenTimeTracker/`
- **Linux**: `~/.config/OpenTimeTracker/logs/`

---

## Installation Issues

### Windows

#### Issue: "Windows protected your PC" warning

**Cause**: Application is not code-signed

**Solutions**:
1. Click "More info"
2. Click "Run anyway"
3. Or: Download from official releases only

---

#### Issue: Installation fails with error

**Solutions**:
1. Run installer as Administrator
2. Disable antivirus temporarily
3. Check available disk space
4. Close all OpenTimeTracker instances

---

### macOS

#### Issue: "App is damaged and can't be opened"

**Cause**: macOS Gatekeeper security

**Solutions**:

**Option 1**: Remove quarantine attribute
```bash
xattr -cr /Applications/OpenTimeTracker.app
```

**Option 2**: Allow in Security & Privacy
1. Open System Preferences → Security & Privacy
2. Click "Open Anyway"

---

#### Issue: Application won't launch

**Solutions**:
1. Check Console.app for errors
2. Verify macOS version compatibility (10.13+)
3. Reinstall application
4. Try running from terminal:
   ```bash
   open -a OpenTimeTracker
   ```

---

### Linux

#### Issue: AppImage won't run

**Cause**: Missing execute permission or FUSE

**Solutions**:

**Option 1**: Make executable
```bash
chmod +x OpenTimeTracker-*.AppImage
./OpenTimeTracker-*.AppImage
```

**Option 2**: Install FUSE (if missing)
```bash
# Ubuntu/Debian
sudo apt install fuse libfuse2

# Fedora
sudo dnf install fuse fuse-libs

# Arch
sudo pacman -S fuse2
```

---

#### Issue: Icon not showing in menu

**Solution**: Create desktop entry manually:

```bash
cat > ~/.local/share/applications/opentimetracker.desktop << EOF
[Desktop Entry]
Name=OpenTimeTracker
Exec=/path/to/OpenTimeTracker.AppImage
Icon=opentimetracker
Type=Application
Categories=Office;
EOF
```

---

## Application Issues

### Startup Problems

#### Issue: Application doesn't start

**Diagnosis**:
1. Check if process is running:
   - Windows: Task Manager
   - macOS: Activity Monitor
   - Linux: `ps aux | grep OpenTimeTracker`

**Solutions**:
1. Kill existing processes
2. Delete lock file (if exists): `{app-data}/SingletonLock`
3. Check system resources (RAM, disk space)
4. Reinstall application

---

#### Issue: Application crashes on startup

**Diagnosis**:
- Check logs for error messages
- Look for stack traces

**Common causes**:
1. **Corrupted database**: Restore from backup
2. **Missing dependencies**: Reinstall
3. **Permission issues**: Check file permissions

**Solutions**:
```bash
# Backup and reset data directory (CAUTION: Will lose data)
# Windows
move "%APPDATA%\OpenTimeTracker" "%APPDATA%\OpenTimeTracker.backup"

# macOS
mv "~/Library/Application Support/OpenTimeTracker" "~/Library/Application Support/OpenTimeTracker.backup"

# Linux
mv ~/.config/OpenTimeTracker ~/.config/OpenTimeTracker.backup
```

---

### Database Issues

#### Issue: "Database is locked" error

**Cause**: Multiple instances accessing database simultaneously

**Solutions**:
1. Close all OpenTimeTracker instances
2. Check for zombie processes and kill them
3. Restart application

---

#### Issue: Data not saving

**Diagnosis**:
1. Check disk space
2. Verify write permissions on data directory
3. Check database file size

**Solutions**:
1. Free up disk space
2. Fix permissions:
   ```bash
   # Linux/macOS
   chmod 755 ~/.config/OpenTimeTracker/data
   chmod 644 ~/.config/OpenTimeTracker/data/timetracker.db
   ```
3. Check if database is corrupted (see below)

---

#### Issue: Database corruption

**Symptoms**:
- Application crashes when opening certain views
- "Database disk image is malformed" error
- Missing or incorrect data

**Solutions**:

**Option 1**: Restore from backup
```bash
# Navigate to backup directory
cd {app-data}/backups/

# Copy backup to main location
# Replace timetracker.db with your backup file
```

**Option 2**: Attempt SQLite repair (advanced)
```bash
# Make a backup first!
sqlite3 timetracker.db ".dump" | sqlite3 timetracker-repaired.db
```

**Option 3**: Start fresh (LAST RESORT - Will lose data)
```bash
# Backup first!
mv timetracker.db timetracker.db.corrupt
# Application will create new database on next start
```

---

### UI Issues

#### Issue: Blank/white screen

**Causes**:
- GPU acceleration issues
- Corrupted cache

**Solutions**:

1. **Disable hardware acceleration**:
   - Add `--disable-gpu` flag to launch command
   - Or edit shortcut properties

2. **Clear cache**:
   ```bash
   # Close app first, then delete cache
   # Windows
   rmdir /s "%APPDATA%\OpenTimeTracker\Cache"
   
   # macOS
   rm -rf ~/Library/Application\ Support/OpenTimeTracker/Cache
   
   # Linux
   rm -rf ~/.config/OpenTimeTracker/Cache
   ```

3. **Reset window state**:
   ```bash
   # Delete window state file
   # Windows
   del "%APPDATA%\OpenTimeTracker\window-state.json"
   ```

---

#### Issue: UI elements not responsive

**Solutions**:
1. Restart application
2. Check for JavaScript errors (DevTools: Ctrl/Cmd+Shift+I)
3. Update to latest version
4. Clear cache and restart

---

#### Issue: Dark mode not working / UI theme issues

**Solutions**:
1. Go to Settings
2. Toggle Dark Mode off and on
3. Restart application
4. Check Settings database entry:
   ```sql
   SELECT * FROM app_settings;
   ```

---

### Performance Issues

#### Issue: Slow application performance

**Causes**:
- Large database
- Memory leaks
- Insufficient resources

**Solutions**:

1. **Check database size**:
   ```bash
   # Should be < 100MB typically
   ls -lh {app-data}/data/timetracker.db
   ```

2. **Vacuum database** (reduces file size):
   ```bash
   sqlite3 timetracker.db "VACUUM;"
   ```

3. **Archive old data**:
   - Export old time entries
   - Delete from database
   - Keep backups

4. **Increase available RAM**:
   - Close other applications
   - Restart computer

---

#### Issue: High CPU usage

**Diagnosis**:
1. Open Activity Monitor/Task Manager
2. Check CPU usage

**Common causes**:
- Infinite render loop
- Background processes

**Solutions**:
1. Restart application
2. Check for updates
3. Report issue with logs

---

## Data Issues

### Missing Data

#### Issue: Projects/tasks disappeared

**Possible causes**:
1. Data not saved before crash
2. Database corruption
3. Accidental deletion

**Solutions**:
1. Check if project is "closed" (filter in Projects view)
2. Restore from automatic backup
3. Check action history for deletions

---

#### Issue: Time entries missing

**Solutions**:
1. Check date filters in Calendar view
2. Verify correct month/year selected
3. Check if associated task was deleted
4. Restore from backup if needed

---

### Data Integrity

#### Issue: Incorrect totals/calculations

**Causes**:
- Orphaned time entries
- Incorrect work configuration

**Solutions**:
1. Verify work configuration settings
2. Check for orphaned time entries:
   ```sql
   SELECT * FROM time_entries WHERE taskId NOT IN (SELECT id FROM tasks);
   ```
3. Recalculate totals (restart app)

---

## Import/Export Issues

### Backup Issues

#### Issue: Automatic backups not created

**Check**:
1. Verify backup directory exists
2. Check disk space
3. Check write permissions

**Solutions**:
1. Create backup directory manually:
   ```bash
   mkdir -p {app-data}/backups
   ```
2. Fix permissions
3. Manual backup: Copy `timetracker.db` file

---

#### Issue: Cannot restore backup

**Solutions**:
1. Verify backup file is valid SQLite database:
   ```bash
   sqlite3 backup-file.db ".schema"
   ```
2. Check file integrity
3. Try opening in SQLite browser/viewer

---

## Network/Update Issues

#### Issue: Cannot check for updates

**Cause**: Network connectivity or firewall

**Solutions**:
1. Check internet connection
2. Check firewall settings
3. Manually check GitHub releases

---

## Development Issues

### Build Issues

#### Issue: `npm install` fails

**Solutions**:
1. Clear npm cache: `npm cache clean --force`
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install` again
4. Check Node.js version (requires 20+)

---

#### Issue: Prisma client not found

**Solution**:
```bash
npm run prisma:generate
```

---

#### Issue: `electron-rebuild` fails

**Solutions**:
1. Install build tools:
   ```bash
   # Windows
   npm install --global windows-build-tools
   
   # macOS
   xcode-select --install
   
   # Linux (Debian/Ubuntu)
   sudo apt install build-essential
   ```

2. Rebuild:
   ```bash
   npx electron-rebuild
   ```

---

### Runtime Issues

#### Issue: IPC errors (renderer ↔ main process)

**Symptoms**:
- "Cannot read property of undefined"
- Database operations fail

**Solutions**:
1. Rebuild application: `npm run dev`
2. Check preload script is loaded
3. Verify IPC handler names match

---

## Getting More Help

### Before Reporting Issues

Please collect:
1. **Application version**
2. **Operating system** and version
3. **Steps to reproduce** the issue
4. **Expected vs actual behavior**
5. **Error messages** from logs
6. **Screenshots** (if UI issue)

### Report Issues

**GitHub Issues**: https://github.com/altaskur/OpenTimeTracker/issues

**Include**:
- Clear description
- Reproduction steps
- System information
- Relevant logs/screenshots

### Community Support

**GitHub Discussions**: https://github.com/altaskur/OpenTimeTracker/discussions

---

## Emergency Recovery

### Complete Data Recovery

If application is unusable:

1. **Locate database**: See "Check Database Location" above
2. **Make backup copy**: `cp timetracker.db timetracker-backup.db`
3. **Extract data**:
   ```bash
   # Export all data to CSV
   sqlite3 timetracker.db
   .mode csv
   .output projects.csv
   SELECT * FROM projects;
   .output tasks.csv
   SELECT * FROM tasks;
   .output time_entries.csv
   SELECT * FROM time_entries;
   .quit
   ```
4. **Reinstall application**
5. **Import data** (if import feature available) or restore database file

---

## Prevention Best Practices

1. **Regular backups**: Copy database file weekly
2. **Keep updated**: Install latest versions
3. **Monitor disk space**: Keep at least 1GB free
4. **Proper shutdown**: Always close app normally (not force quit)
5. **Test backups**: Verify backups can be restored

---

# Solución de Problemas (Español)

Esta guía te ayuda a resolver problemas comunes con OpenTimeTracker.

## Diagnóstico Rápido

### Verificar Ubicación de Base de Datos

Ubicaciones predeterminadas:
- **Windows**: `%APPDATA%\OpenTimeTracker\data\timetracker.db`
- **macOS**: `~/Library/Application Support/OpenTimeTracker/data/timetracker.db`
- **Linux**: `~/.config/OpenTimeTracker/data/timetracker.db`

---

## Problemas de Instalación

### Windows

#### Problema: Advertencia "Windows protegió tu PC"

**Soluciones**:
1. Haz clic en "Más información"
2. Haz clic en "Ejecutar de todas formas"

---

### macOS

#### Problema: "La app está dañada"

**Solución**: Eliminar atributo de cuarentena
```bash
xattr -cr /Applications/OpenTimeTracker.app
```

---

### Linux

#### Problema: AppImage no se ejecuta

**Solución**: Hacer ejecutable
```bash
chmod +x OpenTimeTracker-*.AppImage
./OpenTimeTracker-*.AppImage
```

---

## Problemas de la Aplicación

### Problemas de Inicio

#### Problema: La aplicación no inicia

**Soluciones**:
1. Matar procesos existentes
2. Verificar espacio en disco
3. Reinstalar aplicación

---

### Problemas de Base de Datos

#### Problema: Error "Base de datos bloqueada"

**Soluciones**:
1. Cerrar todas las instancias
2. Matar procesos zombie
3. Reiniciar aplicación

---

#### Problema: Corrupción de base de datos

**Opción 1**: Restaurar desde backup
```bash
# Navegar al directorio de backups
cd {app-data}/backups/
# Copiar backup a ubicación principal
```

---

### Problemas de Rendimiento

#### Problema: Rendimiento lento

**Soluciones**:
1. Verificar tamaño de base de datos
2. Ejecutar VACUUM:
   ```bash
   sqlite3 timetracker.db "VACUUM;"
   ```
3. Archivar datos antiguos

---

## Recuperación de Emergencia

### Recuperación Completa de Datos

1. **Ubicar base de datos**
2. **Hacer copia de seguridad**
3. **Exportar datos**:
   ```bash
   sqlite3 timetracker.db
   .mode csv
   .output projects.csv
   SELECT * FROM projects;
   ```
4. **Reinstalar aplicación**
5. **Restaurar base de datos**

---

## Prevención

1. **Backups regulares**: Copiar archivo de base de datos semanalmente
2. **Mantener actualizado**: Instalar últimas versiones
3. **Cierre adecuado**: Siempre cerrar normalmente
4. **Probar backups**: Verificar que se pueden restaurar

---

Para más detalles, consulta las secciones anteriores en inglés.
