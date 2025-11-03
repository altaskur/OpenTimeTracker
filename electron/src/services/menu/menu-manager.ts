import {
  Menu,
  BrowserWindow,
  MenuItemConstructorOptions,
  app,
  dialog,
} from 'electron';

export class MenuManager {
  private readonly window: BrowserWindow;

  constructor(window: BrowserWindow) {
    this.window = window;
  }

  /**
   * Creates and sets up the application menu
   */
  public setupMenu(): void {
    const isMac = process.platform === 'darwin';

    const template: MenuItemConstructorOptions[] = [
      // App Menu (solo macOS)
      ...(isMac
        ? [
            {
              label: app.name,
              submenu: [
                { role: 'about' as const },
                { type: 'separator' as const },
                { role: 'services' as const },
                { type: 'separator' as const },
                { role: 'hide' as const },
                { role: 'hideOthers' as const },
                { role: 'unhide' as const },
                { type: 'separator' as const },
                { role: 'quit' as const },
              ],
            },
          ]
        : []),

      // Archivo
      {
        label: 'Archivo',
        submenu: [
          {
            label: 'Nueva Entrada de Tiempo',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.navigateTo('/dashboard');
              // TODO: Abrir modal de nueva entrada
            },
          },
          {
            label: 'Nuevo Proyecto',
            accelerator: 'CmdOrCtrl+Shift+N',
            click: () => {
              this.navigateTo('/projects');
              // TODO: Abrir modal de nuevo proyecto
            },
          },
          { type: 'separator' },
          {
            label: 'Exportar Datos...',
            accelerator: 'CmdOrCtrl+E',
            click: () => {
              void this.exportData();
            },
          },
          { type: 'separator' },
          {
            label: 'Recargar',
            accelerator: 'CmdOrCtrl+R',
            click: () => {
              this.window.reload();
            },
          },
          ...(isMac
            ? []
            : [
                { type: 'separator' as const },
                {
                  label: 'Salir',
                  accelerator: 'Alt+F4',
                  role: 'quit' as const,
                },
              ]),
        ],
      },

      // Edición
      {
        label: 'Edición',
        submenu: [
          { role: 'undo' as const, label: 'Deshacer' },
          { role: 'redo' as const, label: 'Rehacer' },
          { type: 'separator' },
          { role: 'cut' as const, label: 'Cortar' },
          { role: 'copy' as const, label: 'Copiar' },
          { role: 'paste' as const, label: 'Pegar' },
          { role: 'delete' as const, label: 'Eliminar' },
          { type: 'separator' },
          { role: 'selectAll' as const, label: 'Seleccionar Todo' },
        ],
      },

      // Navegación
      {
        label: 'Navegación',
        submenu: [
          {
            label: 'Inicio',
            accelerator: 'CmdOrCtrl+1',
            click: () => {
              this.navigateTo('/');
            },
          },
          {
            label: 'Dashboard',
            accelerator: 'CmdOrCtrl+2',
            click: () => {
              this.navigateTo('/dashboard');
            },
          },
          {
            label: 'Proyectos',
            accelerator: 'CmdOrCtrl+3',
            click: () => {
              this.navigateTo('/projects');
            },
          },
          { type: 'separator' },
          {
            label: 'Atrás',
            accelerator: 'Alt+Left',
            enabled: false, // Se habilitará dinámicamente
            click: () => {
              if (this.window.webContents.navigationHistory.canGoBack()) {
                this.window.webContents.navigationHistory.goBack();
              }
            },
          },
          {
            label: 'Adelante',
            accelerator: 'Alt+Right',
            enabled: false, // Se habilitará dinámicamente
            click: () => {
              if (this.window.webContents.navigationHistory.canGoForward()) {
                this.window.webContents.navigationHistory.goForward();
              }
            },
          },
        ],
      },

      // Ver
      {
        label: 'Ver',
        submenu: [
          { role: 'reload' as const, label: 'Recargar' },
          { role: 'forceReload' as const, label: 'Forzar Recarga' },
          { type: 'separator' },
          {
            label: 'Modo Oscuro',
            accelerator: 'CmdOrCtrl+T',
            click: () => {
              this.window.webContents.executeJavaScript(`
                document.querySelector('html')?.classList.toggle('my-app-dark');
              `);
            },
          },
          { type: 'separator' },
          {
            label: 'Pantalla Completa',
            accelerator: isMac ? 'Ctrl+Cmd+F' : 'F11',
            role: 'togglefullscreen' as const,
          },
          { type: 'separator' },
          {
            label: 'Herramientas de Desarrollo',
            accelerator: isMac ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
            click: () => {
              this.window.webContents.toggleDevTools();
            },
          },
          { type: 'separator' },
          { role: 'zoomIn' as const, label: 'Aumentar Zoom' },
          { role: 'zoomOut' as const, label: 'Reducir Zoom' },
          { role: 'resetZoom' as const, label: 'Zoom Normal' },
        ],
      },

      // Ventana
      {
        label: 'Ventana',
        submenu: [
          { role: 'minimize' as const, label: 'Minimizar' },
          { role: 'close' as const, label: 'Cerrar' },
          ...(isMac
            ? [
                { type: 'separator' as const },
                { role: 'front' as const, label: 'Traer Todo al Frente' },
                { type: 'separator' as const },
                { role: 'window' as const, label: 'Ventana' },
              ]
            : []),
        ],
      },

      // Ayuda
      {
        label: 'Ayuda',
        submenu: [
          {
            label: 'Documentación',
            click: () => {
              // Abrir documentación
              console.log('Opening documentation...');
            },
          },
          {
            label: 'Atajos de Teclado',
            accelerator: 'CmdOrCtrl+/',
            click: () => {
              this.showKeyboardShortcuts();
            },
          },
          { type: 'separator' },
          {
            label: 'Reportar un Problema',
            click: () => {
              // Abrir GitHub issues
              console.log('Opening GitHub issues...');
            },
          },
          { type: 'separator' },
          {
            label: 'Acerca de OpenTimeTracker',
            click: () => {
              this.showAboutDialog();
            },
          },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  /**
   * Navigates to a specific route by sending IPC message to renderer
   */
  private navigateTo(route: string): void {
    console.log(`Sending navigation request to route: ${route}`);
    this.window.webContents.send('navigate-to', route);
  }

  /**
   * Shows about dialog
   */
  private showAboutDialog(): void {
    dialog.showMessageBox(this.window, {
      type: 'info',
      title: 'Acerca de OpenTimeTracker',
      message: 'OpenTimeTracker',
      detail: `Versión: 1.0.0\n\nSistema de seguimiento de tiempo para proyectos y tareas.\n\nDesarrollado con Angular 20 + Electron + SQLite\n\n© 2025 Isaac Julián`,
      buttons: ['OK'],
    });
  }

  /**
   * Shows keyboard shortcuts dialog
   */
  private showKeyboardShortcuts(): void {
    const isMac = process.platform === 'darwin';
    const mod = isMac ? 'Cmd' : 'Ctrl';

    dialog.showMessageBox(this.window, {
      type: 'info',
      title: 'Atajos de Teclado',
      message: 'Atajos de Teclado Disponibles',
      detail: `Navegación:
${mod}+1 - Ir a Inicio
${mod}+2 - Ir a Dashboard
${mod}+3 - Ir a Proyectos
Alt+← - Página anterior
Alt+→ - Página siguiente

Acciones:
${mod}+N - Nueva entrada de tiempo
${mod}+Shift+N - Nuevo proyecto
${mod}+E - Exportar datos

Vista:
${mod}+T - Alternar modo oscuro
${mod}+R - Recargar
${mod}+Shift+I - DevTools
${mod}++ - Aumentar zoom
${mod}+- - Reducir zoom
${mod}+0 - Zoom normal`,
      buttons: ['OK'],
    });
  }

  /**
   * Export data functionality
   */
  private async exportData(): Promise<void> {
    await dialog.showMessageBox(this.window, {
      type: 'info',
      title: 'Exportar Datos',
      message: 'Funcionalidad de exportación',
      detail:
        'Esta funcionalidad estará disponible próximamente.\n\nPodrás exportar tus datos a CSV, Excel o JSON.',
      buttons: ['OK'],
    });
  }
}
