# Security

OpenTimeTracker Security Policy and Best Practices.

For the complete security policy, see [SECURITY.md](../SECURITY.md) in the repository.

## Quick Security Overview

### Data Security

✅ **What OpenTimeTracker Does**:
- Stores all data locally on your computer
- No cloud transmission
- No telemetry or analytics
- No external network requests (except update checks)
- Uses SQLite with ACID compliance

❌ **What OpenTimeTracker Doesn't Do**:
- No data collection
- No user tracking
- No cloud sync (by design)
- No remote access

---

## Your Responsibility

As a local-first application, **you** are responsible for:

### 1. Physical Security
- Secure your computer with password/PIN
- Lock your screen when away
- Control physical access to your device

### 2. File System Security
- Use full-disk encryption (BitLocker, FileVault, LUKS)
- Set appropriate file permissions
- Secure database backups

### 3. Backup Security
- Store backups in secure location
- Encrypt backups if needed
- Protect backup files like passwords

---

## Best Practices

### For Users

1. **Enable full-disk encryption** on your OS
2. **Use strong passwords/PINs** for your computer
3. **Regular backups** to secure, encrypted location
4. **Keep app updated** for security patches
5. **Don't share database files** over insecure channels

### For Developers

1. **Never commit** `.env` files or secrets
2. **Use environment variables** for sensitive config
3. **Follow secure coding practices**
4. **Review dependencies** for vulnerabilities
5. **Run security scans** (SonarQube, npm audit)

---

## Electron Security

OpenTimeTracker follows Electron security best practices:

✅ **Implemented**:
- Context isolation enabled
- Node integration disabled in renderer
- Secure IPC bridge via preload script
- Content Security Policy (CSP)
- No remote content loading

### Security Configuration

```javascript
// electron/src/main/main.ts
webPreferences: {
  contextIsolation: true,        // ✅ Enabled
  nodeIntegration: false,         // ✅ Disabled
  sandbox: true,                  // ✅ Enabled
  preload: path.join(__dirname, 'preload.js')
}
```

---

## Database Security

### SQLite Security

**File-based security**:
- Database file permissions
- Operating system access controls
- Full-disk encryption

**What SQLite provides**:
- ACID compliance
- Transaction safety
- Data integrity checks

**What SQLite doesn't provide**:
- Encryption at rest (use OS-level encryption)
- User authentication (single-user app)
- Network security (local-only)

### Securing Your Database

**Set proper permissions** (Linux/macOS):
```bash
chmod 600 ~/.config/OpenTimeTracker/data/timetracker.db
```

**Use OS-level encryption**:
- Windows: BitLocker
- macOS: FileVault
- Linux: LUKS

---

## Reporting Security Vulnerabilities

### ⚠️ Important: DO NOT Report Publicly

**Do NOT** open public GitHub issues for security vulnerabilities.

### How to Report

**Option 1: GitHub Security Advisory** (Preferred)
1. Go to [Security tab](https://github.com/altaskur/OpenTimeTracker/security/advisories)
2. Click "Report a vulnerability"
3. Fill in details

**Option 2: Direct Contact**
- Contact: [@altaskur](https://github.com/altaskur) on GitHub
- Subject: "SECURITY: [Brief description]"

### What to Include

1. **Type of vulnerability** (e.g., SQL injection, XSS, etc.)
2. **Affected files/components**
3. **Steps to reproduce**
4. **Proof of concept** (if possible)
5. **Impact assessment**
6. **Suggested fix** (if any)

---

## Response Timeline

- **Acknowledgment**: Within 3 business days
- **Assessment**: Within 7 days
- **Fix Development**: Depends on severity
  - Critical: 7-14 days
  - High: 14-30 days
  - Medium: 30-60 days
  - Low: Best effort

---

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest release (main) | ✅ Yes |
| Develop branch | ✅ Yes |
| Older releases | ❌ No |

**Recommendation**: Always use the latest stable release.

---

## Known Security Considerations

### Data at Rest

**Current State**:
- Data stored in plaintext SQLite file
- Protected by OS-level permissions
- No application-level encryption

**Recommendations**:
- Use full-disk encryption (mandatory)
- Set restrictive file permissions
- Secure backup storage

### Backups

**Automatic Backups**:
- Stored in `{app-data}/backups/`
- Same security as main database
- User-managed (no auto-cleanup)

**Best Practices**:
- Limit backup retention
- Secure backup location
- Encrypt external backups
- Don't store in cloud without encryption

### Update Mechanism

**Update Checks**:
- Checks GitHub releases API
- HTTPS connection
- No personal data transmitted

**Security**:
- Code signing (recommended for production)
- Verify download checksums
- Update via official channels only

---

## Security Updates

When a vulnerability is confirmed:

1. **Develop fix** privately
2. **Prepare security advisory**
3. **Release patched version**
4. **Publish advisory** with:
   - Description
   - Affected versions
   - Fixed version
   - Credit to reporter
5. **Notify users** via GitHub

---

## Dependency Security

### Regular Checks

```bash
# Check for vulnerable dependencies
npm audit

# Fix automatically
npm audit fix

# Force fix (may have breaking changes)
npm audit fix --force
```

### In CI/CD

Security scans run automatically:
- npm audit in workflows
- SonarQube security analysis
- Dependabot alerts

---

## Privacy

### No Data Collection

OpenTimeTracker **NEVER** collects:
- ❌ Personal information
- ❌ Usage statistics
- ❌ Error reports (unless you share them)
- ❌ IP addresses
- ❌ Device information

### What Data Stays Local

Everything:
- ✅ Projects and tasks
- ✅ Time entries
- ✅ Configuration
- ✅ Preferences
- ✅ Database

---

## Additional Resources

- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)
- [SQLite Security](https://www.sqlite.org/security.html)
- [Complete SECURITY.md](../SECURITY.md)

---

## Security Checklist

### For Users

- [ ] Enable full-disk encryption
- [ ] Use strong computer password
- [ ] Keep application updated
- [ ] Secure database backups
- [ ] Lock screen when away
- [ ] Don't share database files insecurely

### For Developers

- [ ] No secrets in code
- [ ] Context isolation enabled
- [ ] Node integration disabled
- [ ] Secure IPC communication
- [ ] Regular dependency updates
- [ ] Run security scans
- [ ] Review pull requests for security

---

## Questions?

For security-related questions (non-vulnerability):
- Open a regular GitHub issue
- Ask in GitHub Discussions
- Check [FAQ](FAQ.md)

For vulnerabilities:
- Follow reporting process above
- **DO NOT** discuss publicly

---

Thank you for helping keep OpenTimeTracker and its users safe! 🔒

---

# Seguridad (Español)

Política y mejores prácticas de seguridad de OpenTimeTracker.

Para la política de seguridad completa, consulta [SECURITY.md](../SECURITY.md) en el repositorio.

## Resumen Rápido de Seguridad

### Seguridad de Datos

✅ **Lo que hace OpenTimeTracker**:
- Almacena todos los datos localmente
- Sin transmisión a la nube
- Sin telemetría ni analytics
- Sin solicitudes de red externas (excepto verificación de actualizaciones)

❌ **Lo que NO hace OpenTimeTracker**:
- Sin recopilación de datos
- Sin seguimiento de usuario
- Sin sincronización en la nube
- Sin acceso remoto

---

## Tu Responsabilidad

Como aplicación local-first, **tú** eres responsable de:

### 1. Seguridad Física
- Asegurar tu computadora con contraseña/PIN
- Bloquear pantalla cuando no estés
- Controlar acceso físico a tu dispositivo

### 2. Seguridad del Sistema de Archivos
- Usar cifrado de disco completo (BitLocker, FileVault, LUKS)
- Establecer permisos de archivo apropiados
- Asegurar backups de base de datos

### 3. Seguridad de Backups
- Almacenar backups en ubicación segura
- Cifrar backups si es necesario
- Proteger archivos de backup como contraseñas

---

## Mejores Prácticas

### Para Usuarios

1. **Habilitar cifrado de disco completo** en tu SO
2. **Usar contraseñas fuertes** para tu computadora
3. **Backups regulares** a ubicación segura y cifrada
4. **Mantener app actualizada** para parches de seguridad
5. **No compartir archivos de base de datos** por canales inseguros

---

## Reportar Vulnerabilidades de Seguridad

### ⚠️ Importante: NO Reportar Públicamente

**NO** abras issues públicos en GitHub para vulnerabilidades de seguridad.

### Cómo Reportar

**Opción 1: GitHub Security Advisory** (Preferido)
1. Ve a [Security tab](https://github.com/altaskur/OpenTimeTracker/security/advisories)
2. Haz clic en "Report a vulnerability"
3. Completa detalles

**Opción 2: Contacto Directo**
- Contacto: [@altaskur](https://github.com/altaskur) en GitHub
- Asunto: "SECURITY: [Descripción breve]"

---

## Privacidad

### Sin Recopilación de Datos

OpenTimeTracker **NUNCA** recopila:
- ❌ Información personal
- ❌ Estadísticas de uso
- ❌ Reportes de errores
- ❌ Direcciones IP
- ❌ Información del dispositivo

---

Para más detalles, consulta las secciones anteriores en inglés o [SECURITY.md](../SECURITY.md).

---

¡Gracias por ayudar a mantener OpenTimeTracker y sus usuarios seguros! 🔒
