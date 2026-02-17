import { BrowserWindow } from 'electron';
import * as fs from 'fs';
import { NavigationHandler } from '../services/navigation/navigation-handler.js';
import { MenuManager } from '../services/menu/menu-manager.js';
import { getIndexPath, getPreloadPath } from '../utils/paths.js';

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private navigationHandler: NavigationHandler | null = null;
  private menuManager: MenuManager | null = null;

  /**
   * Creates the main application window
   */
  public async createMainWindow(): Promise<void> {
    const preloadPath = getPreloadPath();
    console.log('Preload path:', preloadPath);

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
    const rendererUrl = process.env['ELECTRON_RENDERER_URL'];

    if (rendererUrl) {
      console.log('Loading renderer from:', rendererUrl);
      await this.mainWindow?.loadURL(rendererUrl);
    } else {
      const indexPath = getIndexPath();
      console.log('Index path:', indexPath);

      if (fs.existsSync(indexPath)) {
        this.navigationHandler = new NavigationHandler(this.mainWindow!);
        this.navigationHandler.setupNavigationHandlers();
        this.navigationHandler.loadIndex();
      } else {
        console.error('index.html not found at:', indexPath);
        this.mainWindow?.loadURL(
          `data:text/html,<h1>Error: index.html not found</h1><p>Path: ${indexPath}</p>`,
        );
      }
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
