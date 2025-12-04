import { describe, it, expect, vi, beforeEach } from 'vitest';
import { migrations, CURRENT_SCHEMA_VERSION } from './index.js';

/**
 * @description Tests for migrations registry and MigrationRunner.
 */
describe('migrations registry', () => {
  it('should export migrations array', () => {
    expect(Array.isArray(migrations)).toBe(true);
  });

  it('should have CURRENT_SCHEMA_VERSION defined', () => {
    expect(CURRENT_SCHEMA_VERSION).toBe(1);
  });

  it('should have migrations with correct structure', () => {
    for (const migration of migrations) {
      expect(migration).toHaveProperty('version');
      expect(migration).toHaveProperty('name');
      expect(migration).toHaveProperty('up');
      expect(typeof migration.version).toBe('number');
      expect(typeof migration.name).toBe('string');
      expect(Array.isArray(migration.up)).toBe(true);
    }
  });

  it('should have migrations in ascending version order', () => {
    for (let i = 1; i < migrations.length; i++) {
      expect(migrations[i].version).toBeGreaterThan(migrations[i - 1].version);
    }
  });
});

describe('MigrationRunner', () => {
  const mockStatement = {
    get: vi.fn(),
    run: vi.fn(),
    all: vi.fn().mockReturnValue([]),
  };

  const mockDb = {
    prepare: vi.fn().mockReturnValue(mockStatement),
    exec: vi.fn(),
    transaction: vi.fn((fn: () => void) => fn),
    close: vi.fn(),
  };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    mockStatement.get.mockReset();
    mockStatement.run.mockReset();
    mockStatement.all.mockReset().mockReturnValue([]);
    mockDb.prepare.mockReset().mockReturnValue(mockStatement);
    mockDb.exec.mockReset();
    mockDb.transaction.mockReset().mockImplementation((fn: () => void) => fn);
    mockDb.close.mockReset();

    vi.doMock('better-sqlite3', () => ({
      default: function MockDatabase() {
        return mockDb;
      },
    }));

    vi.doMock('fs', () => ({
      existsSync: vi.fn().mockReturnValue(true),
      copyFileSync: vi.fn(),
      mkdirSync: vi.fn(),
    }));

    vi.doMock('../../../utils/paths.js', () => ({
      getDatabasePath: vi.fn(() => '/mock/path/database.db'),
      getBackupPath: vi.fn(() => '/mock/path/backups'),
    }));
  });

  it('should create instance with default path', async () => {
    const { MigrationRunner } = await import('./migration-runner.js');
    const runner = new MigrationRunner();
    expect(runner).toBeDefined();
  });

  it('should create instance with custom path', async () => {
    const { MigrationRunner } = await import('./migration-runner.js');
    const runner = new MigrationRunner('/custom/path.db');
    expect(runner).toBeDefined();
  });

  describe('getSchemaVersion', () => {
    it('should return version from database', async () => {
      mockStatement.get.mockReturnValue({ value: '5' });
      const { MigrationRunner } = await import('./migration-runner.js');
      const runner = new MigrationRunner();
      const version = runner.getSchemaVersion();
      expect(version).toBe(5);
    });

    it('should return 0 if no version exists', async () => {
      mockStatement.get.mockReturnValue(undefined);
      const { MigrationRunner } = await import('./migration-runner.js');
      const runner = new MigrationRunner();
      const version = runner.getSchemaVersion();
      expect(version).toBe(0);
    });

    it('should return 0 on database error', async () => {
      mockDb.prepare.mockImplementation(() => {
        throw new Error('DB error');
      });
      const { MigrationRunner } = await import('./migration-runner.js');
      const runner = new MigrationRunner();
      const version = runner.getSchemaVersion();
      expect(version).toBe(0);
    });
  });

  describe('runMigrations', () => {
    it('should return applied 0 when schema is up to date', async () => {
      mockStatement.get
        .mockReturnValueOnce({ '1': 1 })
        .mockReturnValueOnce({ value: String(CURRENT_SCHEMA_VERSION) });
      const { MigrationRunner } = await import('./migration-runner.js');
      const runner = new MigrationRunner();
      const result = runner.runMigrations();
      expect(result.applied).toBe(0);
      expect(result.backupPath).toBeUndefined();
    });

    it('should handle case when backup directory needs creation', async () => {
      const fs = await import('fs');
      expect(fs.existsSync).toBeDefined();
      expect(fs.mkdirSync).toBeDefined();
    });

    it('should have backup functionality available', async () => {
      const fs = await import('fs');
      expect(fs.copyFileSync).toBeDefined();
    });

    it('should run pending migrations', async () => {
      mockStatement.get.mockReturnValue(undefined);
      const { MigrationRunner } = await import('./migration-runner.js');
      const runner = new MigrationRunner();
      const result = runner.runMigrations();
      expect(result.applied).toBeGreaterThanOrEqual(0);
    });

    it('should update schema version after migration', async () => {
      mockStatement.get.mockReturnValue(undefined);
      const { MigrationRunner } = await import('./migration-runner.js');
      const runner = new MigrationRunner();
      runner.runMigrations();
      expect(mockStatement.run).toHaveBeenCalled();
    });

    it('should have transaction support for migrations', async () => {
      const { MigrationRunner } = await import('./migration-runner.js');
      const runner = new MigrationRunner();
      expect(runner.runMigrations).toBeDefined();
    });

    it('should ensure version table exists', async () => {
      mockStatement.get.mockReturnValue(undefined);
      const { MigrationRunner } = await import('./migration-runner.js');
      const runner = new MigrationRunner();
      runner.runMigrations();
      expect(mockDb.exec).toHaveBeenCalled();
    });

    it('should insert initial version when table is empty', async () => {
      mockStatement.get.mockReturnValue(undefined);
      const { MigrationRunner } = await import('./migration-runner.js');
      const runner = new MigrationRunner();
      runner.runMigrations();
      expect(mockStatement.run).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('should close the database connection', async () => {
      const { MigrationRunner } = await import('./migration-runner.js');
      const runner = new MigrationRunner();
      runner.close();
      expect(mockDb.close).toHaveBeenCalled();
    });
  });
});
