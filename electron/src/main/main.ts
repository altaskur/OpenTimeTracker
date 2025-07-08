import { app, BrowserWindow } from 'electron';
import { WindowManager } from './window';
import { DatabaseManager } from '../services/database/database';
import { setupIpcHandlers } from '../services/ipc';

let windowManager: WindowManager | null = null;
let dbManager: DatabaseManager | null = null;

const initializeApp = async (): Promise<void> => {
  dbManager = new DatabaseManager();
  setupIpcHandlers(dbManager);
  windowManager = new WindowManager();
  await windowManager.createMainWindow();
};

app.whenReady().then(initializeApp);

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await windowManager?.createMainWindow();
  }
});

app.on('window-all-closed', () => {
  if (dbManager) {
    dbManager.close();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (dbManager) {
    dbManager.close();
  }
});
