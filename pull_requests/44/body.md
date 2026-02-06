## Resumen de Cambios

Esta versión incluye la implementación de un sistema de actualizaciones automáticas y varias mejoras de estabilidad y estilo.

### ✨ Nuevas Características
- **Sistema de Actualizaciones Automáticas**: Integración de `electron-updater` para gestionar actualizaciones desde GitHub Releases.
  - Implementación de `UpdateManager` y manejadores IPC en el proceso principal.
  - Creación de `UpdateService` en Angular con señales para gestionar el estado.
  - Nueva interfaz de usuario para notificaciones de actualización y ajustes de preferencias.
  - Traducciones completas (ES/EN) para todo el sistema de actualizaciones.
- **Mejoras en CI/CD**: Guía de configuración de SonarQube completada y optimización de flujos.

### 🐛 Errores Solucionados
- **Estilos**: Se corrigió un problema donde los nombres de proyectos largos rompían el diseño de los modales y las tarjetas de la página de inicio (Ref #27).
- **Seguridad**: Se añadieron atributos `noopener` y `noreferrer` a las aperturas de enlaces externos para prevenir ataques de tabnabbing.

### 📝 Documentación
- Actualización del README con instrucciones de desarrollo más claras y definición del alcance del proyecto.

### ✅ Pruebas
- Cobertura de pruebas unitarias para el nuevo sistema de actualizaciones en Electron y Angular.