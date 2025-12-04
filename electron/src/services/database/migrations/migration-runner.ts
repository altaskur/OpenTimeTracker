import Database from 'better-sqlite3';
import { migrations } from './index.js';
import { getDatabasePath, getBackupPath } from '../../../utils/paths.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Runs pending database migrations automatically.
 * Creates a backup before applying any changes.
 */
export class MigrationRunner {
  private db: Database.Database;

  constructor(dbPath?: string) {
    this.db = new Database(dbPath ?? getDatabasePath());
  }

  /**
   * Gets the current schema version from the database.
   * @returns The current schema version number, or 0 if not set.
   */
  getSchemaVersion(): number {
    try {
      const result = this.db
        .prepare("SELECT value FROM schema_version WHERE key = 'version'")
        .get() as { value: string } | undefined;
      return result ? parseInt(result.value, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Creates the schema_version table if it doesn't exist.
   */
  private ensureVersionTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_version (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    const existing = this.db
      .prepare("SELECT 1 FROM schema_version WHERE key = 'version'")
      .get();

    if (!existing) {
      this.db
        .prepare(
          "INSERT INTO schema_version (key, value) VALUES ('version', '1')",
        )
        .run();
    }
  }

  /**
   * Creates a backup before running migrations.
   * @returns The path to the backup file.
   */
  private createBackup(): string {
    const dbPath = getDatabasePath();
    const backupDir = getBackupPath();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `pre-migration-${timestamp}.db`);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    fs.copyFileSync(dbPath, backupPath);
    console.log(`Migration backup created: ${backupPath}`);
    return backupPath;
  }

  /**
   * Runs all pending migrations.
   * @returns Object with number of applied migrations and backup path if any were applied.
   */
  runMigrations(): { applied: number; backupPath?: string } {
    this.ensureVersionTable();
    const currentVersion = this.getSchemaVersion();

    const pendingMigrations = migrations.filter(
      (m) => m.version > currentVersion,
    );

    if (pendingMigrations.length === 0) {
      console.log('Database schema is up to date');
      return { applied: 0 };
    }

    const backupPath = this.createBackup();

    console.log(`Running ${pendingMigrations.length} migration(s)...`);

    for (const migration of pendingMigrations) {
      console.log(`Applying migration ${migration.version}: ${migration.name}`);

      const transaction = this.db.transaction(() => {
        for (const sql of migration.up) {
          this.db.exec(sql);
        }
        this.db
          .prepare("UPDATE schema_version SET value = ? WHERE key = 'version'")
          .run(migration.version.toString());
      });

      transaction();
      console.log(`Migration ${migration.version} applied successfully`);
    }

    return { applied: pendingMigrations.length, backupPath };
  }

  /**
   * Closes the database connection.
   */
  close(): void {
    this.db.close();
  }
}
