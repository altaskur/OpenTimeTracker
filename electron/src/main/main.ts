import { app, BrowserWindow } from 'electron';
import { WindowManager } from './window.js';
import { DatabaseManager } from '../services/database/database.js';
import { setupIpcHandlers } from '../services/ipc/index.js';
import { BackupService } from '../services/backup/index.js';
import { UpdateService } from '../services/update/update.service.js';
import * as path from 'node:path';
import * as os from 'node:os';

/**
 * Configure Prisma paths for production (packaged app)
 * Ensures Prisma can find query engine binaries in app.asar.unpacked
 */
if (app.isPackaged) {
  const platform = os.platform();
  const arch = os.arch();

  let queryEngineFileName: string;
  if (platform === 'win32') {
    queryEngineFileName = 'query_engine-windows.dll.node';
  } else if (platform === 'darwin') {
    queryEngineFileName =
      arch === 'arm64'
        ? 'libquery_engine-darwin-arm64.dylib.node'
        : 'libquery_engine-darwin.dylib.node';
  } else {
    queryEngineFileName = 'libquery_engine-debian-openssl-3.0.x.so.node';
  }

  const prismaPath = path.join(
    process.resourcesPath,
    'app.asar.unpacked',
    'node_modules',
    '.prisma',
    'client',
  );
  const queryEnginePath = path.join(prismaPath, queryEngineFileName);

  process.env.PRISMA_QUERY_ENGINE_LIBRARY = queryEnginePath;
  process.env.PRISMA_QUERY_ENGINE_BINARY = queryEnginePath;
}

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

  setupIpcHandlers(dbManager, backupService, new UpdateService());
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
