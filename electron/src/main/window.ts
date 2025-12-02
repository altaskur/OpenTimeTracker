import { BrowserWindow } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { NavigationHandler } from '../services/navigation/navigation-handler';
import { MenuManager } from '../services/menu/menu-manager';

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private navigationHandler: NavigationHandler | null = null;
  private menuManager: MenuManager | null = null;

  /**
   * Creates the main application window
   */
  public async createMainWindow(): Promise<void> {
    const preloadPath = path.join(__dirname, '..', 'preload', 'preload.js');

    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      title: 'OpenTimeTracker',
      resizable: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: preloadPath,
      },
    });

    await this.loadApplication();
    await this.setupMenu();
    this.setupDevTools();
    this.setupEventListeners();
  }

  /**
   * Loads the Angular application
   */
  private async loadApplication(): Promise<void> {
    const indexPath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'dist',
      'OpenTimeTracker',
      'browser',
      'index.html',
    );

    if (fs.existsSync(indexPath)) {
      this.navigationHandler = new NavigationHandler(this.mainWindow!);
      this.navigationHandler.setupNavigationHandlers();
      this.navigationHandler.loadIndex();
    } else {
      console.error('index.html not found at:', indexPath);
    }
  }

  /**
   * Sets up the application menu
   */
  private async setupMenu(): Promise<void> {
    if (this.mainWindow) {
      this.menuManager = new MenuManager(this.mainWindow);
      await this.menuManager.setupMenu();
    }
  }

  /**
   * Sets up development tools
   */
  private setupDevTools(): void {
    // DevTools can be opened manually from the menu (Ctrl+Shift+I)
    // this.mainWindow?.webContents.openDevTools();
  }

  /**
   * Sets up window event listeners
   */
  private setupEventListeners(): void {
    this.mainWindow?.on('closed', () => {
      this.mainWindow = null;
      this.navigationHandler = null;
      this.menuManager = null;
    });
  }

  /**
   * Gets the main window instance
   */
  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }
}
