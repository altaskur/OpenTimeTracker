import { BrowserWindow } from 'electron';
import * as path from 'path';

export class NavigationHandler {
  private mainWindow: BrowserWindow;
  private indexUrl: string;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    
    const indexPath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'dist',
      'OpenTimeTracker',
      'browser',
      'index.html'
    );
    this.indexUrl = `file://${indexPath.replace(/\\/g, '/')}`;
  }

  /**
   * Sets up all navigation and reload handlers
   */
  public setupNavigationHandlers(): void {
    this.setupNavigationInterceptor();
    this.setupFailedLoadHandler();
    this.setupReloadInterceptor();
  }

  /**
   * Intercepts navigation to handle Angular routes
   */
  private setupNavigationInterceptor(): void {
    this.mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      if (navigationUrl.startsWith('file://') && !navigationUrl.endsWith('index.html')) {
        event.preventDefault();
        console.log('Redirecting navigation to index.html:', navigationUrl);
        this.loadIndex();
      }
    });
  }

  /**
   * Handles load errors (when reload fails)
   */
  private setupFailedLoadHandler(): void {
    this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      if (validatedURL.startsWith('file://') && errorCode === -6) {
        console.log('Failed to load URL, redirecting to index.html:', validatedURL);
        this.loadIndex();
      }
    });
  }

  /**
   * Intercepts reload keys to always load index.html
   */
  private setupReloadInterceptor(): void {
    this.mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.type === 'keyDown' && input.key === 'F5') {
        event.preventDefault();
        console.log('F5 reload intercepted, loading index.html');
        this.loadIndex();
      }
      if (input.type === 'keyDown' && input.control && input.key === 'r') {
        event.preventDefault();
        console.log('Ctrl+R reload intercepted, loading index.html');
        this.loadIndex();
      }
    });
  }

  /**
   * Loads the main page (index.html)
   */
  public loadIndex(): void {
    this.mainWindow.loadURL(this.indexUrl);
  }

  /**
   * Gets the index.html URL
   */
  public getIndexUrl(): string {
    return this.indexUrl;
  }
}
