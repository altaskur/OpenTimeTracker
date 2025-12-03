import { app, BrowserWindow } from 'electron';
import { WindowManager } from './window';
import { DatabaseManager } from '../services/database/database';
import { setupIpcHandlers } from '../services/ipc';
import { BackupService } from '../services/backup';

let windowManager: WindowManager | null = null;
let dbManager: DatabaseManager | null = null;
let backupService: BackupService | null = null;

const initializeApp = async (): Promise<void> => {
  backupService = new BackupService();

  const startupBackup = await backupService.createBackup('startup');
  if (startupBackup.success) {
    console.log('Startup backup created:', startupBackup.backup?.filename);
  }

  dbManager = new DatabaseManager();

  backupService.setDatabaseCallbacks(
    async () => {
      if (dbManager) {
        await dbManager.close();
      }
    },
    async () => {
      dbManager = new DatabaseManager();
    },
  );

  setupIpcHandlers(dbManager, backupService);
  windowManager = new WindowManager();
  await windowManager.createMainWindow();
};

app.whenReady().then(initializeApp);

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await windowManager?.createMainWindow();
  }
});

app.on('window-all-closed', async () => {
  if (backupService) {
    const shutdownBackup = await backupService.createBackup('shutdown');
    if (shutdownBackup.success) {
      console.log('Shutdown backup created:', shutdownBackup.backup?.filename);
    }
  }

  if (dbManager) {
    dbManager.close();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  if (dbManager) {
    dbManager.close();
  }
});
