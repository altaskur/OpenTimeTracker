import * as fs from 'fs';
import * as path from 'path';
import { getDatabasePath, getBackupPath } from '../../utils/paths';

/**
 * Backup information structure.
 */
export interface BackupInfo {
  filename: string;
  path: string;
  size: number;
  createdAt: Date;
  type: 'auto' | 'manual' | 'startup' | 'shutdown' | 'before-restore';
}

/**
 * Backup operation result.
 */
export interface BackupResult {
  success: boolean;
  backup?: BackupInfo;
  error?: string;
}

/**
 * Backup service configuration.
 */
export interface BackupConfig {
  maxBackups: number;
  backupDir: string;
  dbPath: string;
}

/**
 * Service for managing database backups.
 * Provides functionality for creating, restoring, and managing database backups.
 */
export class BackupService {
  private readonly config: BackupConfig;
  private disconnectCallback: (() => Promise<void>) | null = null;
  private reconnectCallback: (() => Promise<void>) | null = null;

  constructor(config?: Partial<BackupConfig>) {
    this.config = {
      maxBackups: config?.maxBackups ?? 10,
      backupDir: config?.backupDir ?? getBackupPath(),
      dbPath: config?.dbPath ?? getDatabasePath(),
    };

    this.ensureBackupDir();
  }

  /**
   * Sets callbacks for database disconnect/reconnect during restore operations.
   */
  setDatabaseCallbacks(
    disconnect: () => Promise<void>,
    reconnect: () => Promise<void>,
  ): void {
    this.disconnectCallback = disconnect;
    this.reconnectCallback = reconnect;
  }

  /**
   * Ensures the backup directory exists.
   */
  private ensureBackupDir(): void {
    if (!fs.existsSync(this.config.backupDir)) {
      fs.mkdirSync(this.config.backupDir, { recursive: true });
    }
  }

  /**
   * Generates a backup filename with timestamp.
   */
  private generateFilename(type: BackupInfo['type']): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    return `timetracker_${type}_${timestamp}.db`;
  }

  /**
   * Creates a backup of the database.
   */
  async createBackup(
    type: BackupInfo['type'] = 'manual',
  ): Promise<BackupResult> {
    try {
      if (!fs.existsSync(this.config.dbPath)) {
        return {
          success: false,
          error: 'Database file not found',
        };
      }

      const filename = this.generateFilename(type);
      const backupPath = path.join(this.config.backupDir, filename);

      fs.copyFileSync(this.config.dbPath, backupPath);

      const walPath = this.config.dbPath + '-wal';
      const shmPath = this.config.dbPath + '-shm';

      if (fs.existsSync(walPath)) {
        fs.copyFileSync(walPath, backupPath + '-wal');
      }
      if (fs.existsSync(shmPath)) {
        fs.copyFileSync(shmPath, backupPath + '-shm');
      }

      const stats = fs.statSync(backupPath);

      const backup: BackupInfo = {
        filename,
        path: backupPath,
        size: stats.size,
        createdAt: new Date(),
        type,
      };

      await this.rotateBackups();

      return { success: true, backup };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Lists all available backups.
   */
  async listBackups(): Promise<BackupInfo[]> {
    try {
      if (!fs.existsSync(this.config.backupDir)) {
        return [];
      }

      const files = fs.readdirSync(this.config.backupDir);
      const backups: BackupInfo[] = [];

      for (const file of files) {
        if (
          !file.endsWith('.db') ||
          file.endsWith('-wal') ||
          file.endsWith('-shm')
        ) {
          continue;
        }

        const filePath = path.join(this.config.backupDir, file);
        const stats = fs.statSync(filePath);

        const typeRegex = /timetracker_([\w-]+)_/;
        const typeMatch = typeRegex.exec(file);
        const type = (typeMatch?.[1] as BackupInfo['type']) || 'manual';

        backups.push({
          filename: file,
          path: filePath,
          size: stats.size,
          createdAt: stats.mtime,
          type,
        });
      }

      return backups.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  }

  /**
   * Copies a WAL/SHM file or removes the target if source doesn't exist.
   */
  private copyOrRemoveJournalFile(
    sourcePath: string,
    targetPath: string,
  ): void {
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
    } else if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
  }

  /**
   * Copies the backup database and its journal files.
   */
  private copyBackupFiles(backupPath: string): void {
    fs.copyFileSync(backupPath, this.config.dbPath);
    this.copyOrRemoveJournalFile(
      backupPath + '-wal',
      this.config.dbPath + '-wal',
    );
    this.copyOrRemoveJournalFile(
      backupPath + '-shm',
      this.config.dbPath + '-shm',
    );
  }

  /**
   * Restores the database from a backup.
   */
  async restoreBackup(backupPath: string): Promise<BackupResult> {
    try {
      if (!fs.existsSync(backupPath)) {
        return { success: false, error: 'Backup file not found' };
      }

      const preRestoreBackup = await this.createBackup('before-restore');
      if (!preRestoreBackup.success) {
        console.warn(
          'Could not create pre-restore backup:',
          preRestoreBackup.error,
        );
      }

      if (this.disconnectCallback) {
        await this.disconnectCallback();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      this.copyBackupFiles(backupPath);

      if (this.reconnectCallback) {
        await this.reconnectCallback();
      }

      return { success: true };
    } catch (error) {
      if (this.reconnectCallback) {
        try {
          await this.reconnectCallback();
        } catch {
          console.error('Failed to reconnect after restore error');
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Deletes a specific backup.
   */
  async deleteBackup(backupPath: string): Promise<BackupResult> {
    try {
      if (!fs.existsSync(backupPath)) {
        return {
          success: false,
          error: 'Backup file not found',
        };
      }

      fs.unlinkSync(backupPath);

      const walPath = backupPath + '-wal';
      const shmPath = backupPath + '-shm';

      if (fs.existsSync(walPath)) {
        fs.unlinkSync(walPath);
      }
      if (fs.existsSync(shmPath)) {
        fs.unlinkSync(shmPath);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Rotates backups to keep only the configured maximum.
   */
  private async rotateBackups(): Promise<void> {
    try {
      const backups = await this.listBackups();

      if (backups.length > this.config.maxBackups) {
        const toDelete = backups.slice(this.config.maxBackups);

        for (const backup of toDelete) {
          await this.deleteBackup(backup.path);
        }
      }
    } catch (error) {
      console.error('Error rotating backups:', error);
    }
  }

  /**
   * Exports a backup to a user-specified location.
   */
  async exportBackup(
    destinationPath: string,
    backupPath?: string,
  ): Promise<BackupResult> {
    try {
      const sourcePath = backupPath ?? this.config.dbPath;

      if (!fs.existsSync(sourcePath)) {
        return {
          success: false,
          error: 'Source file not found',
        };
      }

      fs.copyFileSync(sourcePath, destinationPath);

      const stats = fs.statSync(destinationPath);

      return {
        success: true,
        backup: {
          filename: path.basename(destinationPath),
          path: destinationPath,
          size: stats.size,
          createdAt: new Date(),
          type: 'manual',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Imports a backup from a user-specified location.
   */
  async importBackup(sourcePath: string): Promise<BackupResult> {
    return this.restoreBackup(sourcePath);
  }

  /**
   * Gets the backup directory path.
   */
  getBackupDir(): string {
    return this.config.backupDir;
  }

  /**
   * Gets the database path.
   */
  getDbPath(): string {
    return this.config.dbPath;
  }
}
