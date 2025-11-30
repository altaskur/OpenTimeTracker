import {
  Menu,
  BrowserWindow,
  MenuItemConstructorOptions,
  app,
  dialog,
  shell,
} from 'electron';
import { getIsDarkMode, setDarkMode } from '../ipc/theme-handlers';

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

      // Inicio
      {
        label: 'Inicio',
        submenu: [
          {
            label: 'Principal',
            accelerator: 'CmdOrCtrl+1',
            click: () => {
              this.navigateTo('/');
            },
          },
          {
            label: 'Tiempo Restante',
            accelerator: 'CmdOrCtrl+2',
            click: () => {
              this.navigateTo('/remaining-time');
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
            label: 'Modo Claro/Oscuro',
            accelerator: 'CmdOrCtrl+T',
            click: () => {
              void this.toggleTheme();
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

      // Ayuda
      {
        label: 'Ayuda',
        submenu: [
          {
            label: 'Documentación',
            click: () => {
              void shell.openExternal(
                'https://github.com/altaskur/OpenTimeTracker',
              );
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
              void shell.openExternal(
                'https://github.com/altaskur/OpenTimeTracker/issues',
              );
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
    this.window.webContents.send('navigate-to', route);
  }

  /**
   * Toggles dark mode and notifies renderer process
   */
  private async toggleTheme(): Promise<void> {
    const newDarkMode = !getIsDarkMode();
    await setDarkMode(this.window, newDarkMode);
  }

  /**
   * Shows about dialog
   */
  private showAboutDialog(): void {
    dialog.showMessageBox(this.window, {
      type: 'info',
      title: 'Acerca de OpenTimeTracker',
      message: 'OpenTimeTracker',
      detail: `Versión: 1.0.0\n\nSistema de seguimiento de tiempo para proyectos y tareas.\n\nDesarrollado con Angular 21 + Electron + Prisma\n\n© 2025 Isaac Julián`,
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
${mod}+1 - Ir a Principal
${mod}+2 - Ir a Tiempo Restante
${mod}+3 - Ir a Proyectos
${mod}+T - Modo Claro/Oscuro`,
      buttons: ['OK'],
    });
  }
}
