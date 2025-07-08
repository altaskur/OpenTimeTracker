import { BrowserWindow } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { NavigationHandler } from '../services/navigation/navigation-handler';

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private navigationHandler: NavigationHandler | null = null;

  /**
   * Creates the main application window
   */
  public async createMainWindow(): Promise<void> {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      title: 'OpenTimeTracker',
      resizable: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      },
    });

    await this.loadApplication();
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
      'index.html'
    );
    
    console.log('Loading index.html from:', indexPath);

    if (fs.existsSync(indexPath)) {
      this.navigationHandler = new NavigationHandler(this.mainWindow!);
      this.navigationHandler.setupNavigationHandlers();
      
      console.log('Loading URL:', this.navigationHandler.getIndexUrl());
      this.navigationHandler.loadIndex();
    } else {
      console.error('index.html not found at:', indexPath);
    }
  }

  /**
   * Sets up development tools
   */
  private setupDevTools(): void {
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow?.webContents.openDevTools();
    }
  }

  /**
   * Sets up window event listeners
   */
  private setupEventListeners(): void {
    this.mainWindow?.on('closed', () => {
      this.mainWindow = null;
      this.navigationHandler = null;
    });
  }

  /**
   * Gets the main window instance
   */
  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }
}
