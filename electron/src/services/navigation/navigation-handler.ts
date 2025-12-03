import { BrowserWindow } from 'electron';
import { getIndexPath } from '../../utils/paths';

export class NavigationHandler {
  private readonly mainWindow: BrowserWindow;
  private readonly indexUrl: string;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    const indexPath = getIndexPath();
    this.indexUrl = `file://${indexPath.replace(/\\/g, '/')}`;
    console.log('Navigation handler index URL:', this.indexUrl);
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
      if (
        navigationUrl.startsWith('file://') &&
        !navigationUrl.endsWith('index.html')
      ) {
        event.preventDefault();
        this.loadIndex();
      }
    });
  }

  /**
   * Handles load errors (when reload fails)
   */
  private setupFailedLoadHandler(): void {
    this.mainWindow.webContents.on(
      'did-fail-load',
      (event, errorCode, errorDescription, validatedURL) => {
        if (validatedURL.startsWith('file://') && errorCode === -6) {
          this.loadIndex();
        }
      },
    );
  }

  /**
   * Intercepts reload keys to always load index.html
   */
  private setupReloadInterceptor(): void {
    this.mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.type === 'keyDown' && input.key === 'F5') {
        event.preventDefault();
        this.loadIndex();
      }
      if (input.type === 'keyDown' && input.control && input.key === 'r') {
        event.preventDefault();
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
