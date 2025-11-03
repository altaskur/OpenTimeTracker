import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

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
      const dbPath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'dist',
        'data',
        'timetracker.db'
      );
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
   * Creates necessary database tables (SQLite adaptation)
   */
  private createTables(): void {
    if (!this.db) return;

    // 1. PROYECTOS
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // 2. ESTADOS DE TAREAS
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS task_status (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `);

    // Insertar estados por defecto si no existen
    const statusCount = this.db
      .prepare('SELECT COUNT(*) as count FROM task_status')
      .get() as { count: number };
    if (statusCount.count === 0) {
      const insertStatus = this.db.prepare(
        'INSERT INTO task_status (id, name) VALUES (?, ?)'
      );
      insertStatus.run(randomUUID(), 'Pendiente');
      insertStatus.run(randomUUID(), 'En progreso');
      insertStatus.run(randomUUID(), 'Completada');
      insertStatus.run(randomUUID(), 'Bloqueada');
    }

    // 3. TAREAS
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        estimated_hours REAL,
        status_id TEXT REFERENCES task_status(id),
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // 4. TAGS
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `);

    // 5. RELACIÓN TAREAS-TAGS
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS task_tags (
        task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
        tag_id TEXT REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (task_id, tag_id)
      )
    `);

    // 6. ENTRADAS DE TIEMPO
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS time_entries (
        id TEXT PRIMARY KEY,
        task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
        date TEXT NOT NULL,
        hours REAL NOT NULL CHECK (hours >= 0),
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // 7. PERIODOS LABORALES
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS work_periods (
        id TEXT PRIMARY KEY,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
        planned_hours REAL NOT NULL CHECK (planned_hours >= 0),
        note TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE (year, month)
      )
    `);

    // 8. INDICES
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
      CREATE INDEX IF NOT EXISTS idx_timeentries_task ON time_entries(task_id);
      CREATE INDEX IF NOT EXISTS idx_timeentries_date ON time_entries(date);
      CREATE INDEX IF NOT EXISTS idx_workperiods_yearmonth ON work_periods(year, month);
    `);

    console.log('Database tables created');
  }

  // ==================== PROJECTS ====================

  public getProjects(): any[] {
    if (!this.db) return [];
    return this.db
      .prepare('SELECT * FROM projects ORDER BY created_at DESC')
      .all();
  }

  public createProject(name: string, description?: string): Database.RunResult {
    if (!this.db) throw new Error('Database not initialized');
    const id = randomUUID();
    return this.db
      .prepare('INSERT INTO projects (id, name, description) VALUES (?, ?, ?)')
      .run(id, name, description);
  }

  public updateProject(
    id: string,
    name: string,
    description?: string
  ): Database.RunResult {
    if (!this.db) throw new Error('Database not initialized');
    return this.db
      .prepare('UPDATE projects SET name = ?, description = ? WHERE id = ?')
      .run(name, description, id);
  }

  public deleteProject(id: string): Database.RunResult {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  }

  // ==================== TASKS ====================

  public getTasks(projectId?: string): any[] {
    if (!this.db) return [];
    if (projectId) {
      return this.db
        .prepare(
          `
        SELECT t.*, ts.name as status_name, p.name as project_name
        FROM tasks t
        LEFT JOIN task_status ts ON t.status_id = ts.id
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE t.project_id = ?
        ORDER BY t.created_at DESC
      `
        )
        .all(projectId);
    }
    return this.db
      .prepare(
        `
      SELECT t.*, ts.name as status_name, p.name as project_name
      FROM tasks t
      LEFT JOIN task_status ts ON t.status_id = ts.id
      LEFT JOIN projects p ON t.project_id = p.id
      ORDER BY t.created_at DESC
    `
      )
      .all();
  }

  public createTask(
    projectId: string,
    name: string,
    description?: string,
    estimatedHours?: number,
    statusId?: string
  ): Database.RunResult {
    if (!this.db) throw new Error('Database not initialized');
    const id = randomUUID();
    return this.db
      .prepare(
        'INSERT INTO tasks (id, project_id, name, description, estimated_hours, status_id) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .run(id, projectId, name, description, estimatedHours, statusId);
  }

  public updateTask(
    id: string,
    data: {
      name?: string;
      description?: string;
      estimatedHours?: number;
      statusId?: string;
    }
  ): Database.RunResult {
    if (!this.db) throw new Error('Database not initialized');
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.estimatedHours !== undefined) {
      updates.push('estimated_hours = ?');
      values.push(data.estimatedHours);
    }
    if (data.statusId !== undefined) {
      updates.push('status_id = ?');
      values.push(data.statusId);
    }

    values.push(id);
    return this.db
      .prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`)
      .run(...values);
  }

  public deleteTask(id: string): Database.RunResult {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  }

  // ==================== TASK STATUS ====================

  public getTaskStatuses(): any[] {
    if (!this.db) return [];
    return this.db.prepare('SELECT * FROM task_status').all();
  }

  // ==================== TIME ENTRIES ====================

  public getTimeEntries(taskId?: string): any[] {
    if (!this.db) return [];
    if (taskId) {
      return this.db
        .prepare(
          'SELECT * FROM time_entries WHERE task_id = ? ORDER BY date DESC'
        )
        .all(taskId);
    }
    return this.db
      .prepare(
        `
      SELECT te.*, t.name as task_name, p.name as project_name
      FROM time_entries te
      LEFT JOIN tasks t ON te.task_id = t.id
      LEFT JOIN projects p ON t.project_id = p.id
      ORDER BY te.date DESC
    `
      )
      .all();
  }

  public getPendingTimeEntries(): any[] {
    if (!this.db) return [];
    return this.db
      .prepare(
        'SELECT * FROM time_entries WHERE task_id IS NULL ORDER BY date DESC'
      )
      .all();
  }

  public createTimeEntry(
    date: string,
    hours: number,
    taskId?: string,
    notes?: string
  ): Database.RunResult {
    if (!this.db) throw new Error('Database not initialized');
    const id = randomUUID();
    return this.db
      .prepare(
        'INSERT INTO time_entries (id, task_id, date, hours, notes) VALUES (?, ?, ?, ?, ?)'
      )
      .run(id, taskId, date, hours, notes);
  }

  public updateTimeEntry(
    id: string,
    data: { taskId?: string; date?: string; hours?: number; notes?: string }
  ): Database.RunResult {
    if (!this.db) throw new Error('Database not initialized');
    const updates: string[] = [];
    const values: any[] = [];

    if (data.taskId !== undefined) {
      updates.push('task_id = ?');
      values.push(data.taskId);
    }
    if (data.date !== undefined) {
      updates.push('date = ?');
      values.push(data.date);
    }
    if (data.hours !== undefined) {
      updates.push('hours = ?');
      values.push(data.hours);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(data.notes);
    }

    values.push(id);
    return this.db
      .prepare(`UPDATE time_entries SET ${updates.join(', ')} WHERE id = ?`)
      .run(...values);
  }

  public deleteTimeEntry(id: string): Database.RunResult {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.prepare('DELETE FROM time_entries WHERE id = ?').run(id);
  }

  // ==================== WORK PERIODS ====================

  public getWorkPeriods(): any[] {
    if (!this.db) return [];
    return this.db
      .prepare('SELECT * FROM work_periods ORDER BY year DESC, month DESC')
      .all();
  }

  public createWorkPeriod(
    year: number,
    month: number,
    plannedHours: number,
    note?: string
  ): Database.RunResult {
    if (!this.db) throw new Error('Database not initialized');
    const id = randomUUID();
    return this.db
      .prepare(
        'INSERT INTO work_periods (id, year, month, planned_hours, note) VALUES (?, ?, ?, ?, ?)'
      )
      .run(id, year, month, plannedHours, note);
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
