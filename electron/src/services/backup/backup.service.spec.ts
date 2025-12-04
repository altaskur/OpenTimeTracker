import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { BackupService, BackupInfo } from './backup.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_BACKUP_DIR = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'dist',
  'test-backups',
);
const TEST_DB_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'dist',
  'data',
  'test-backup.db',
);

describe('BackupService', () => {
  let backupService: BackupService;

  beforeAll(() => {
    if (!fs.existsSync(path.dirname(TEST_DB_PATH))) {
      fs.mkdirSync(path.dirname(TEST_DB_PATH), { recursive: true });
    }
    fs.writeFileSync(TEST_DB_PATH, 'test database content');
  });

  afterAll(() => {
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    if (fs.existsSync(TEST_BACKUP_DIR)) {
      fs.rmSync(TEST_BACKUP_DIR, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    backupService = new BackupService({
      maxBackups: 3,
      backupDir: TEST_BACKUP_DIR,
      dbPath: TEST_DB_PATH,
    });
  });

  afterEach(() => {
    if (fs.existsSync(TEST_BACKUP_DIR)) {
      const files = fs.readdirSync(TEST_BACKUP_DIR);
      for (const file of files) {
        fs.unlinkSync(path.join(TEST_BACKUP_DIR, file));
      }
    }
  });

  describe('constructor', () => {
    it('should create backup directory if it does not exist', () => {
      expect(fs.existsSync(TEST_BACKUP_DIR)).toBe(true);
    });

    it('should use provided configuration', () => {
      expect(backupService.getBackupDir()).toBe(TEST_BACKUP_DIR);
      expect(backupService.getDbPath()).toBe(TEST_DB_PATH);
    });
  });

  describe('createBackup', () => {
    it('should create a manual backup successfully', async () => {
      const result = await backupService.createBackup('manual');

      expect(result.success).toBe(true);
      expect(result.backup).toBeDefined();
      expect(result.backup?.type).toBe('manual');
      expect(result.backup?.filename).toContain('timetracker_manual_');
      expect(fs.existsSync(result.backup!.path)).toBe(true);
    });

    it('should create a startup backup successfully', async () => {
      const result = await backupService.createBackup('startup');

      expect(result.success).toBe(true);
      expect(result.backup?.type).toBe('startup');
      expect(result.backup?.filename).toContain('timetracker_startup_');
    });

    it('should create a shutdown backup successfully', async () => {
      const result = await backupService.createBackup('shutdown');

      expect(result.success).toBe(true);
      expect(result.backup?.type).toBe('shutdown');
    });

    it('should return error if database file not found', async () => {
      const service = new BackupService({
        backupDir: TEST_BACKUP_DIR,
        dbPath: '/nonexistent/path/db.db',
      });

      const result = await service.createBackup();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database file not found');
    });

    it('should copy WAL files if they exist', async () => {
      const walPath = TEST_DB_PATH + '-wal';
      fs.writeFileSync(walPath, 'wal content');

      const result = await backupService.createBackup('manual');

      expect(result.success).toBe(true);
      expect(fs.existsSync(result.backup!.path + '-wal')).toBe(true);

      fs.unlinkSync(walPath);
      fs.unlinkSync(result.backup!.path + '-wal');
    });
  });

  describe('listBackups', () => {
    it('should return empty array when no backups exist', async () => {
      const backups = await backupService.listBackups();
      expect(backups).toEqual([]);
    });

    it('should list created backups sorted by date descending', async () => {
      await backupService.createBackup('manual');
      await new Promise((resolve) => setTimeout(resolve, 100));
      await backupService.createBackup('startup');

      const backups = await backupService.listBackups();

      expect(backups.length).toBe(2);
      expect(backups[0].createdAt.getTime()).toBeGreaterThanOrEqual(
        backups[1].createdAt.getTime(),
      );
    });

    it('should not include WAL or SHM files in the list', async () => {
      await backupService.createBackup('manual');

      const backupPath = (await backupService.listBackups())[0].path;
      fs.writeFileSync(backupPath + '-wal', 'wal');
      fs.writeFileSync(backupPath + '-shm', 'shm');

      const backups = await backupService.listBackups();

      expect(backups.length).toBe(1);
      expect(
        backups.every((b: BackupInfo) => !b.filename.includes('-wal')),
      ).toBe(true);
      expect(
        backups.every((b: BackupInfo) => !b.filename.includes('-shm')),
      ).toBe(true);
    });
  });

  describe('deleteBackup', () => {
    it('should delete a backup successfully', async () => {
      const createResult = await backupService.createBackup('manual');
      const backupPath = createResult.backup!.path;

      const deleteResult = await backupService.deleteBackup(backupPath);

      expect(deleteResult.success).toBe(true);
      expect(fs.existsSync(backupPath)).toBe(false);
    });

    it('should delete associated WAL and SHM files', async () => {
      const createResult = await backupService.createBackup('manual');
      const backupPath = createResult.backup!.path;

      fs.writeFileSync(backupPath + '-wal', 'wal');
      fs.writeFileSync(backupPath + '-shm', 'shm');

      const deleteResult = await backupService.deleteBackup(backupPath);

      expect(deleteResult.success).toBe(true);
      expect(fs.existsSync(backupPath + '-wal')).toBe(false);
      expect(fs.existsSync(backupPath + '-shm')).toBe(false);
    });

    it('should return error if backup not found', async () => {
      const result = await backupService.deleteBackup('/nonexistent/backup.db');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Backup file not found');
    });
  });

  describe('restoreBackup', () => {
    it('should restore a backup successfully', async () => {
      const createResult = await backupService.createBackup('manual');
      const backupPath = createResult.backup!.path;

      fs.writeFileSync(TEST_DB_PATH, 'modified content');

      let disconnectCalled = false;
      let reconnectCalled = false;

      backupService.setDatabaseCallbacks(
        async () => {
          disconnectCalled = true;
        },
        async () => {
          reconnectCalled = true;
        },
      );

      const restoreResult = await backupService.restoreBackup(backupPath);

      expect(restoreResult.success).toBe(true);
      expect(disconnectCalled).toBe(true);
      expect(reconnectCalled).toBe(true);

      const restoredContent = fs.readFileSync(TEST_DB_PATH, 'utf-8');
      expect(restoredContent).toBe('test database content');
    });

    it('should create before-restore backup', async () => {
      const createResult = await backupService.createBackup('manual');

      await backupService.restoreBackup(createResult.backup!.path);

      const backups = await backupService.listBackups();
      const beforeRestoreBackup = backups.find(
        (b: BackupInfo) => b.type === 'before-restore',
      );

      expect(beforeRestoreBackup).toBeDefined();
    });

    it('should return error if backup not found', async () => {
      const result = await backupService.restoreBackup(
        '/nonexistent/backup.db',
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Backup file not found');
    });

    it('should reconnect even if restore fails', async () => {
      let reconnectCalled = false;

      backupService.setDatabaseCallbacks(
        async () => {
          // Disconnect callback - intentionally empty for test
        },
        async () => {
          reconnectCalled = true;
        },
      );

      await backupService.restoreBackup('/nonexistent/backup.db');

      expect(reconnectCalled).toBe(false);
    });
  });

  describe('exportBackup', () => {
    it('should export database to destination path', async () => {
      const exportPath = path.join(TEST_BACKUP_DIR, 'exported.db');

      const result = await backupService.exportBackup(exportPath);

      expect(result.success).toBe(true);
      expect(fs.existsSync(exportPath)).toBe(true);
      expect(result.backup?.path).toBe(exportPath);
    });

    it('should export specific backup if provided', async () => {
      const createResult = await backupService.createBackup('manual');
      const exportPath = path.join(TEST_BACKUP_DIR, 'exported-backup.db');

      const result = await backupService.exportBackup(
        exportPath,
        createResult.backup!.path,
      );

      expect(result.success).toBe(true);
      expect(fs.existsSync(exportPath)).toBe(true);
    });

    it('should return error if source not found', async () => {
      const result = await backupService.exportBackup(
        '/dest/path.db',
        '/nonexistent/source.db',
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Source file not found');
    });
  });

  describe('importBackup', () => {
    it('should import backup (alias for restoreBackup)', async () => {
      const createResult = await backupService.createBackup('manual');

      const result = await backupService.importBackup(
        createResult.backup!.path,
      );

      expect(result.success).toBe(true);
    });
  });

  describe('rotation', () => {
    it('should keep only maxBackups number of backups', async () => {
      await backupService.createBackup('manual');
      await new Promise((resolve) => setTimeout(resolve, 50));
      await backupService.createBackup('manual');
      await new Promise((resolve) => setTimeout(resolve, 50));
      await backupService.createBackup('manual');
      await new Promise((resolve) => setTimeout(resolve, 50));
      await backupService.createBackup('manual');

      const backups = await backupService.listBackups();

      expect(backups.length).toBe(3);
    });
  });
});
