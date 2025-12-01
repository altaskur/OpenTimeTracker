import { DatabaseManager } from './database';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { Project, WorkPeriod, TaskStatus } from '../../interfaces';

const TEST_DB_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'dist',
  'data',
  'test-timetracker.db',
);

describe('DatabaseManager', () => {
  let dbManager: DatabaseManager;
  let testPrisma: PrismaClient;

  beforeAll(async () => {
    // Asegurar que existe el directorio
    const dir = path.dirname(TEST_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Eliminar DB de test si existe
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }

    // Crear cliente Prisma para tests
    testPrisma = new PrismaClient({
      datasources: {
        db: {
          url: `file:${TEST_DB_PATH}`,
        },
      },
    });

    await testPrisma.$connect();

    // Crear el schema de la base de datos
    await testPrisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "projects" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL
      );
    `);

    await testPrisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "task_status" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE
      );
    `);

    await testPrisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "tasks" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "project_id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "estimated_hours" REAL,
        "status_id" TEXT,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL,
        FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE,
        FOREIGN KEY ("status_id") REFERENCES "task_status"("id") ON DELETE SET NULL
      );
    `);

    await testPrisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "time_entries" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "task_id" TEXT,
        "date" TEXT NOT NULL,
        "hours" REAL NOT NULL,
        "notes" TEXT,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL,
        FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL
      );
    `);

    await testPrisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "work_periods" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "year" INTEGER NOT NULL,
        "month" INTEGER NOT NULL,
        "planned_hours" REAL NOT NULL,
        "note" TEXT,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL,
        UNIQUE ("year", "month")
      );
    `);

    await testPrisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "tags" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "color" TEXT
      );
    `);

    await testPrisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "task_tags" (
        "task_id" TEXT NOT NULL,
        "tag_id" TEXT NOT NULL,
        PRIMARY KEY ("task_id", "tag_id"),
        FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE,
        FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE
      );
    `);

    // Seed default task statuses
    await testPrisma.taskStatus.create({
      data: { id: '1', name: 'Pendiente' },
    });
    await testPrisma.taskStatus.create({
      data: { id: '2', name: 'En progreso' },
    });
    await testPrisma.taskStatus.create({
      data: { id: '3', name: 'Completada' },
    });
    await testPrisma.taskStatus.create({
      data: { id: '4', name: 'Cancelada' },
    });
  });

  afterAll(async () => {
    await testPrisma.$disconnect();

    // Limpiar archivo de test
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  beforeEach(async () => {
    dbManager = new DatabaseManager(testPrisma);
    await dbManager['initialized']; // Esperar inicialización
  });

  afterEach(async () => {
    // Limpiar datos entre tests (excepto task_status que son datos seed)
    try {
      await testPrisma.timeEntry.deleteMany();
      await testPrisma.task.deleteMany();
      await testPrisma.project.deleteMany();
      await testPrisma.workPeriod.deleteMany();
    } catch (error) {
      // Ignorar errores si la DB ya está cerrada
      if (!(error as Error).message.includes('Engine was empty')) {
        throw error;
      }
    }
  });

  describe('Initialization', () => {
    it('should create DatabaseManager instance', () => {
      expect(dbManager).toBeDefined();
      expect(dbManager).toBeInstanceOf(DatabaseManager);
    });
  });

  describe('Projects', () => {
    it('should get empty projects list initially', async () => {
      const projects = await dbManager.getProjects();
      expect(Array.isArray(projects)).toBe(true);
    });

    it('should create a new project', async () => {
      const result = await dbManager.createProject(
        'Test Project',
        'Test Description',
      );
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Test Project');
      expect(result.description).toBe('Test Description');
    });

    it('should create a project without description', async () => {
      const result = await dbManager.createProject('Simple Project');
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Simple Project');
    });

    it('should get created project', async () => {
      await dbManager.createProject('My Project', 'My Description');
      const projects = await dbManager.getProjects();
      expect(projects.length).toBeGreaterThan(0);
      const project = projects.find((p: Project) => p.name === 'My Project');
      expect(project).toBeDefined();
      expect(project?.description).toBe('My Description');
    });

    it('should update an existing project', async () => {
      const created = await dbManager.createProject(
        'Original Name',
        'Original Desc',
      );
      const projectId = created.id;

      const result = await dbManager.updateProject(
        projectId,
        'Updated Name',
        'Updated Desc',
      );
      expect(result.name).toBe('Updated Name');
      expect(result.description).toBe('Updated Desc');

      const projects = await dbManager.getProjects();
      const updated = projects.find((p: Project) => p.id === projectId);
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.description).toBe('Updated Desc');
    });

    it('should delete a project', async () => {
      const created = await dbManager.createProject('To Delete');
      const projectId = created.id;

      const result = await dbManager.deleteProject(projectId);
      expect(result.id).toBe(projectId);

      const remaining = await dbManager.getProjects();
      const deleted: Project | undefined = remaining.find(
        (p: Project) => p.id === projectId,
      );
      expect(deleted).toBeUndefined();
    });
  });

  describe('Tasks', () => {
    let projectId: string;
    let statusId: string;

    beforeEach(async () => {
      const project = await dbManager.createProject('Task Project');
      projectId = project.id;

      const statuses = await dbManager.getTaskStatuses();
      statusId = statuses[0].id;
    });

    it('should get empty tasks list initially', async () => {
      const tasks = await dbManager.getTasks();
      expect(Array.isArray(tasks)).toBe(true);
    });

    it('should create a new task', async () => {
      const result = await dbManager.createTask(
        projectId,
        'Test Task',
        'Description',
        5,
        statusId,
      );
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Test Task');
      expect(result.description).toBe('Description');
      expect(result.estimatedHours).toBe(5);
    });

    it('should create a task without optional fields', async () => {
      const result = await dbManager.createTask(projectId, 'Simple Task');
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Simple Task');
    });

    it('should get tasks by project', async () => {
      await dbManager.createTask(projectId, 'Project Task');
      const tasks = await dbManager.getTasks(projectId);
      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks[0].projectId).toBe(projectId);
    });

    it('should get all tasks', async () => {
      await dbManager.createTask(projectId, 'Task 1');
      await dbManager.createTask(projectId, 'Task 2');
      const tasks = await dbManager.getTasks();
      expect(tasks.length).toBeGreaterThan(1);
    });

    it('should update a task', async () => {
      const created = await dbManager.createTask(projectId, 'Original Task');
      const taskId = created.id;

      const result = await dbManager.updateTask(taskId, {
        name: 'Updated Task',
        description: 'New description',
        estimatedHours: 10,
      });
      expect(result.name).toBe('Updated Task');
      expect(result.description).toBe('New description');
      expect(result.estimatedHours).toBe(10);
    });

    it('should update task with partial data', async () => {
      const created = await dbManager.createTask(projectId, 'Task');
      const taskId = created.id;

      const result = await dbManager.updateTask(taskId, {
        name: 'Only Name Changed',
      });
      expect(result.name).toBe('Only Name Changed');
    });

    it('should update task using string parameters (legacy format)', async () => {
      const created = await dbManager.createTask(projectId, 'Original Task');
      const taskId = created.id;

      const result = await dbManager.updateTask(
        taskId,
        'Updated Name',
        'Updated Description',
        15,
        statusId,
      );
      expect(result.name).toBe('Updated Name');
      expect(result.description).toBe('Updated Description');
      expect(result.estimatedHours).toBe(15);
    });

    it('should update task with undefined dataOrName', async () => {
      const created = await dbManager.createTask(projectId, 'Task');
      const taskId = created.id;

      const result = await dbManager.updateTask(taskId, undefined);
      expect(result.id).toBe(taskId);
    });

    it('should delete a task', async () => {
      const created = await dbManager.createTask(projectId, 'To Delete Task');
      const taskId = created.id;

      const result = await dbManager.deleteTask(taskId);
      expect(result.id).toBe(taskId);
    });
  });

  describe('Task Statuses', () => {
    it('should get task statuses', async () => {
      const statuses = await dbManager.getTaskStatuses();
      expect(Array.isArray(statuses)).toBe(true);
      expect(statuses.length).toBeGreaterThan(0);
    });

    it('should have default statuses', async () => {
      const statuses = await dbManager.getTaskStatuses();
      const statusNames = statuses.map((s: TaskStatus) => s.name);
      expect(statusNames).toContain('Pendiente');
      expect(statusNames).toContain('En progreso');
      expect(statusNames).toContain('Completada');
    });
  });

  describe('Time Entries', () => {
    it('should get empty time entries list initially', async () => {
      const entries = await dbManager.getTimeEntries();
      expect(Array.isArray(entries)).toBe(true);
    });

    it('should create a time entry without task', async () => {
      const result = await dbManager.createTimeEntry('2025-11-04', 8);
      expect(result.id).toBeDefined();
      expect(result.hours).toBe(8);
      expect(result.date).toBe('2025-11-04');
    });

    it('should create a time entry with task and notes', async () => {
      const project = await dbManager.createProject('Project');
      const projectId = project.id;
      const task = await dbManager.createTask(projectId, 'Task');
      const taskId = task.id;

      const result = await dbManager.createTimeEntry(
        '2025-11-04',
        5,
        taskId,
        'Work notes',
      );
      expect(result.id).toBeDefined();
      expect(result.taskId).toBe(taskId);
      expect(result.notes).toBe('Work notes');
    });

    it('should get all time entries', async () => {
      await dbManager.createTimeEntry('2025-11-04', 8);
      const entries = await dbManager.getTimeEntries();
      expect(entries.length).toBeGreaterThan(0);
    });

    it('should get time entries by task', async () => {
      const project = await dbManager.createProject('Project');
      const projectId = project.id;
      const task = await dbManager.createTask(projectId, 'Task');
      const taskId = task.id;

      await dbManager.createTimeEntry('2025-11-04', 5, taskId);
      const entries = await dbManager.getTimeEntries(taskId);
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].taskId).toBe(taskId);
    });

    it('should get pending time entries', async () => {
      await dbManager.createTimeEntry('2025-11-04', 8);
      const pending = await dbManager.getPendingTimeEntries();
      expect(pending.length).toBeGreaterThan(0);
    });

    it('should update a time entry', async () => {
      const created = await dbManager.createTimeEntry('2025-11-04', 8);
      const entryId = created.id;

      const result = await dbManager.updateTimeEntry(entryId, {
        hours: 6,
        notes: 'Updated notes',
      });
      expect(result.hours).toBe(6);
      expect(result.notes).toBe('Updated notes');
    });

    it('should update time entry with partial data', async () => {
      const created = await dbManager.createTimeEntry('2025-11-04', 8);
      const entryId = created.id;

      const result = await dbManager.updateTimeEntry(entryId, { hours: 7 });
      expect(result.hours).toBe(7);
    });

    it('should update time entry using string parameters (legacy format)', async () => {
      const created = await dbManager.createTimeEntry('2025-11-04', 8);
      const entryId = created.id;

      const result = await dbManager.updateTimeEntry(
        entryId,
        '2025-11-05',
        6,
        'Legacy notes',
      );
      expect(result.date).toBe('2025-11-05');
      expect(result.hours).toBe(6);
      expect(result.notes).toBe('Legacy notes');
    });

    it('should update time entry taskId', async () => {
      const project = await dbManager.createProject('Project');
      const projectId = project.id;
      const task = await dbManager.createTask(projectId, 'Task');
      const taskId = task.id;

      const created = await dbManager.createTimeEntry('2025-11-04', 8);
      const entryId = created.id;

      const result = await dbManager.updateTimeEntry(entryId, { taskId });
      expect(result.taskId).toBe(taskId);
    });

    it('should delete a time entry', async () => {
      const created = await dbManager.createTimeEntry('2025-11-04', 8);
      const entryId = created.id;

      const result = await dbManager.deleteTimeEntry(entryId);
      expect(result.id).toBe(entryId);
    });
  });

  describe('Work Periods', () => {
    it('should get empty work periods list initially', async () => {
      const periods = await dbManager.getWorkPeriods();
      expect(Array.isArray(periods)).toBe(true);
    });

    it('should create a work period', async () => {
      const result = await dbManager.createWorkPeriod(
        2025,
        11,
        160,
        'November period',
      );
      expect(result.id).toBeDefined();
      expect(result.year).toBe(2025);
      expect(result.month).toBe(11);
      expect(result.plannedHours).toBe(160);
      expect(result.note).toBe('November period');
    });

    it('should create a work period without note', async () => {
      const result = await dbManager.createWorkPeriod(2025, 12, 176);
      expect(result.id).toBeDefined();
      expect(result.year).toBe(2025);
      expect(result.month).toBe(12);
    });

    it('should get created work periods', async () => {
      await dbManager.createWorkPeriod(2025, 10, 160);
      const periods = await dbManager.getWorkPeriods();
      expect(periods.length).toBeGreaterThan(0);
      const period = periods.find(
        (p: WorkPeriod) => p.year === 2025 && p.month === 10,
      );
      expect(period).toBeDefined();
      expect(period?.plannedHours).toBe(160);
    });
  });

  describe('Database Connection', () => {
    it('should get prisma client via getPrisma', () => {
      const prisma = dbManager.getPrisma();
      expect(prisma).toBeDefined();
    });

    it('should close database connection', async () => {
      await expect(async () => {
        await dbManager.close();
      }).not.toThrow();
    });
  });
});
