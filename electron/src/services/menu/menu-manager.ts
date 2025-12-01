import {
  Menu,
  BrowserWindow,
  MenuItemConstructorOptions,
  app,
  dialog,
  shell,
} from 'electron';
import { getIsDarkMode, setDarkMode } from '../ipc/theme-handlers';
import {
  getCurrentLanguage,
  setLanguage,
  initializeLanguage,
} from '../ipc/language-handlers';

/**
 * Menu translations for supported languages
 */
const menuTranslations: Record<string, Record<string, string>> = {
  es: {
    home: 'Inicio',
    main: 'Principal',
    projects: 'Proyectos',
    tasks: 'Tareas',
    darkLightMode: 'Modo Claro/Oscuro',
    language: 'Idioma',
    spanish: 'Español',
    english: 'English',
    exit: 'Salir',
    help: 'Ayuda',
    documentation: 'Documentación',
    keyboardShortcuts: 'Atajos de Teclado',
    reportIssue: 'Reportar un Problema',
    about: 'Acerca de OpenTimeTracker',
    aboutTitle: 'Acerca de OpenTimeTracker',
    aboutDetail:
      'Versión: 1.0.0\n\nSistema de seguimiento de tiempo para proyectos y tareas.\n\nDesarrollado con Angular 21 + Electron + Prisma\n\n© 2025 Isaac Julián',
    shortcutsTitle: 'Atajos de Teclado',
    shortcutsMessage: 'Atajos de Teclado Disponibles',
    navShortcuts: 'Navegación:',
    goToMain: 'Ir a Principal',
    goToProjects: 'Ir a Proyectos',
    goToTasks: 'Ir a Tareas',
  },
  en: {
    home: 'Home',
    main: 'Main',
    projects: 'Projects',
    tasks: 'Tasks',
    darkLightMode: 'Dark/Light Mode',
    language: 'Language',
    spanish: 'Español',
    english: 'English',
    exit: 'Exit',
    help: 'Help',
    documentation: 'Documentation',
    keyboardShortcuts: 'Keyboard Shortcuts',
    reportIssue: 'Report an Issue',
    about: 'About OpenTimeTracker',
    aboutTitle: 'About OpenTimeTracker',
    aboutDetail:
      'Version: 1.0.0\n\nTime tracking system for projects and tasks.\n\nBuilt with Angular 21 + Electron + Prisma\n\n© 2025 Isaac Julián',
    shortcutsTitle: 'Keyboard Shortcuts',
    shortcutsMessage: 'Available Keyboard Shortcuts',
    navShortcuts: 'Navigation:',
    goToMain: 'Go to Main',
    goToProjects: 'Go to Projects',
    goToTasks: 'Go to Tasks',
  },
};

export class MenuManager {
  private readonly window: BrowserWindow;

  constructor(window: BrowserWindow) {
    this.window = window;
  }

  /**
   * Gets translation for current language
   */
  private t(key: string): string {
    const lang = getCurrentLanguage();
    return menuTranslations[lang]?.[key] || menuTranslations['es'][key] || key;
  }

  /**
   * Creates and sets up the application menu
   */
  public async setupMenu(): Promise<void> {
    await initializeLanguage();
    const isMac = process.platform === 'darwin';
    const currentLang = getCurrentLanguage();

    const template: MenuItemConstructorOptions[] = [
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

      {
        label: this.t('home'),
        submenu: [
          {
            label: this.t('main'),
            accelerator: 'CmdOrCtrl+1',
            click: (): void => {
              this.navigateTo('/');
            },
          },
          {
            label: this.t('projects'),
            accelerator: 'CmdOrCtrl+2',
            click: (): void => {
              this.navigateTo('/projects');
            },
          },
          {
            label: this.t('tasks'),
            accelerator: 'CmdOrCtrl+3',
            click: (): void => {
              this.navigateTo('/tasks');
            },
          },
          { type: 'separator' },
          {
            label: this.t('darkLightMode'),
            accelerator: 'CmdOrCtrl+T',
            click: (): void => {
              void this.toggleTheme();
            },
          },
          { type: 'separator' },
          {
            label: this.t('language'),
            submenu: [
              {
                label: this.t('spanish'),
                type: 'radio',
                checked: currentLang === 'es',
                click: (): void => {
                  void this.changeLanguage('es');
                },
              },
              {
                label: this.t('english'),
                type: 'radio',
                checked: currentLang === 'en',
                click: (): void => {
                  void this.changeLanguage('en');
                },
              },
            ],
          },
          ...(isMac
            ? []
            : [
                { type: 'separator' as const },
                {
                  label: this.t('exit'),
                  accelerator: 'Alt+F4',
                  role: 'quit' as const,
                },
              ]),
        ],
      },

      {
        label: this.t('help'),
        submenu: [
          {
            label: this.t('documentation'),
            click: (): void => {
              void shell.openExternal(
                'https://github.com/altaskur/OpenTimeTracker',
              );
            },
          },
          {
            label: this.t('keyboardShortcuts'),
            accelerator: 'CmdOrCtrl+/',
            click: (): void => {
              this.showKeyboardShortcuts();
            },
          },
          { type: 'separator' },
          {
            label: this.t('reportIssue'),
            click: (): void => {
              void shell.openExternal(
                'https://github.com/altaskur/OpenTimeTracker/issues',
              );
            },
          },
          { type: 'separator' },
          {
            label: this.t('about'),
            click: (): void => {
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
   * Changes language and rebuilds menu
   */
  private async changeLanguage(lang: string): Promise<void> {
    await setLanguage(this.window, lang);
    await this.setupMenu();
  }

  /**
   * Shows about dialog
   */
  private showAboutDialog(): void {
    dialog.showMessageBox(this.window, {
      type: 'info',
      title: this.t('aboutTitle'),
      message: 'OpenTimeTracker',
      detail: this.t('aboutDetail'),
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
      title: this.t('shortcutsTitle'),
      message: this.t('shortcutsMessage'),
      detail: `${this.t('navShortcuts')}
${mod}+1 - ${this.t('goToMain')}
${mod}+2 - ${this.t('goToProjects')}
${mod}+3 - ${this.t('goToTasks')}
${mod}+T - ${this.t('darkLightMode')}`,
      buttons: ['OK'],
    });
  }
}
