import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

export class DatabaseManager {
  private db: Database.Database | null = null;

  constructor() {
    this.init();
  }

  /**
   * Initializes the database connection
   */
  private init(): void {
    try {
      const dbPath = path.join(__dirname, '..', '..', '..', '..', 'dist', 'data', 'timetracker.db');
      const dataDir = path.dirname(dbPath);

      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      console.log('Initializing database at:', dbPath);
      this.db = new Database(dbPath);
      this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  /**
   * Creates necessary database tables
   */
  private createTables(): void {
    if (!this.db) return;

    const createExampleTable = `
      CREATE TABLE IF NOT EXISTS examples (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.exec(createExampleTable);
    console.log('Database tables created');
  }

  /**
   * Example method for ping-pong testing
   */
  public ping(): string {
    console.log('Database: ping received');
    return 'pong from database';
  }

  /**
   * Adds an example message to the database
   */
  public addExample(message: string): Database.RunResult {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('INSERT INTO examples (message) VALUES (?)');
    return stmt.run(message);
  }

  /**
   * Gets example messages from the database
   */
  public getExamples(): any[] {
    if (!this.db) return [];

    const stmt = this.db.prepare(
      'SELECT * FROM examples ORDER BY created_at DESC LIMIT 10'
    );
    return stmt.all();
  }

  /**
   * Closes the database connection
   */
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('Database connection closed');
    }
  }
}
