import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

// Singleton para testing
let prismaInstance: PrismaClient | null = null;

export class DatabaseManager {
  private readonly prisma: PrismaClient;
  private initialized: Promise<void> | null = null;

  constructor(prismaClient?: PrismaClient) {
    // Permitir inyección de dependencias para testing
    if (prismaClient) {
      this.prisma = prismaClient;
    } else {
      if (!prismaInstance) {
        this.init();
        prismaInstance = new PrismaClient({
          datasources: {
            db: {
              url: `file:${path.join(
                __dirname,
                '..',
                '..',
                '..',
                '..',
                'dist',
                'data',
                'timetracker.db',
              )}`,
            },
          },
        });
      }
      this.prisma = prismaInstance;
    }
  }

  /**
   * Initializes the database asynchronously (lazy initialization)
   */
  private initializeAsync(): Promise<void> {
    if (!this.initialized) {
      this.initialized = (async () => {
        await this.prisma.$connect();
        await this.seedDefaultData();
      })();
    }
    return this.initialized;
  }

  /**
   * Initializes the database directory
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
        'timetracker.db',
      );
      const dataDir = path.dirname(dbPath);

      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      console.log('Initializing database at:', dbPath);
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  /**
   * Seeds default data (task statuses)
   */
  private async seedDefaultData(): Promise<void> {
    try {
      const count = await this.prisma.taskStatus.count();
      if (count === 0) {
        await this.prisma.taskStatus.createMany({
          data: [
            { name: 'Pendiente' },
            { name: 'En progreso' },
            { name: 'Completada' },
            { name: 'Bloqueada' },
          ],
        });
      }
    } catch (error) {
      console.error('Error seeding default data:', error);
    }
  }

  /**
   * Ensures database is initialized before operations
   */
  private async ensureInitialized(): Promise<void> {
    await this.initializeAsync();
  }

  // ==================== PROJECTS ====================

  public async getProjects() {
    await this.ensureInitialized();
    return this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  public async createProject(name: string, description?: string) {
    await this.ensureInitialized();
    return this.prisma.project.create({
      data: { name, description },
    });
  }

  public async updateProject(id: string, name: string, description?: string) {
    await this.ensureInitialized();
    return this.prisma.project.update({
      where: { id },
      data: { name, description },
    });
  }

  public async deleteProject(id: string) {
    await this.ensureInitialized();
    return this.prisma.project.delete({
      where: { id },
    });
  }

  // ==================== TASKS ====================

  public async getTasks(projectId?: string) {
    await this.ensureInitialized();
    return this.prisma.task.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        status: true,
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async createTask(
    projectId: string,
    name: string,
    description?: string,
    estimatedHours?: number,
    statusId?: string,
  ) {
    await this.ensureInitialized();
    return this.prisma.task.create({
      data: {
        projectId,
        name,
        description,
        estimatedHours,
        statusId,
      },
    });
  }

  public async updateTask(
    id: string,
    dataOrName?:
      | string
      | {
          name?: string;
          description?: string;
          estimatedHours?: number;
          statusId?: string;
        },
    description?: string,
    estimatedHours?: number,
    statusId?: string,
  ) {
    await this.ensureInitialized();
    // Soportar ambas formas: objeto o parámetros individuales
    const data =
      typeof dataOrName === 'string'
        ? {
            name: dataOrName,
            description,
            estimatedHours,
            statusId,
          }
        : dataOrName || {};

    return this.prisma.task.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.estimatedHours !== undefined && {
          estimatedHours: data.estimatedHours,
        }),
        ...(data.statusId !== undefined && { statusId: data.statusId }),
      },
    });
  }

  public async deleteTask(id: string) {
    await this.ensureInitialized();
    return this.prisma.task.delete({
      where: { id },
    });
  }

  // ==================== TASK STATUSES ====================

  public async getTaskStatuses() {
    await this.ensureInitialized();
    return this.prisma.taskStatus.findMany();
  }

  // ==================== TIME ENTRIES ====================

  public async getTimeEntries(taskId?: string) {
    await this.ensureInitialized();
    return this.prisma.timeEntry.findMany({
      where: taskId ? { taskId } : undefined,
      orderBy: { date: 'desc' },
    });
  }

  public async getPendingTimeEntries() {
    await this.ensureInitialized();
    return this.prisma.timeEntry.findMany({
      where: { taskId: null },
      orderBy: { date: 'desc' },
    });
  }

  public async createTimeEntry(
    date: string,
    hours: number,
    taskId?: string,
    notes?: string,
  ) {
    await this.ensureInitialized();
    return this.prisma.timeEntry.create({
      data: {
        date,
        hours,
        taskId,
        notes,
      },
    });
  }

  public async updateTimeEntry(
    id: string,
    dataOrDate:
      | string
      | {
          taskId?: string;
          date?: string;
          hours?: number;
          notes?: string;
        },
    hours?: number,
    notes?: string,
  ) {
    await this.ensureInitialized();
    // Soportar ambas formas: objeto o parámetros individuales
    const data =
      typeof dataOrDate === 'string'
        ? {
            date: dataOrDate,
            hours,
            notes,
          }
        : dataOrDate;

    return this.prisma.timeEntry.update({
      where: { id },
      data: {
        ...(data.taskId !== undefined && { taskId: data.taskId }),
        ...(data.date !== undefined && { date: data.date }),
        ...(data.hours !== undefined && { hours: data.hours }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });
  }

  public async deleteTimeEntry(id: string) {
    await this.ensureInitialized();
    return this.prisma.timeEntry.delete({
      where: { id },
    });
  }

  // ==================== WORK PERIODS ====================

  public async getWorkPeriods() {
    await this.ensureInitialized();
    return this.prisma.workPeriod.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  public async createWorkPeriod(
    year: number,
    month: number,
    plannedHours: number,
    note?: string,
  ) {
    await this.ensureInitialized();
    return this.prisma.workPeriod.create({
      data: {
        year,
        month,
        plannedHours,
        note,
      },
    });
  }

  // ==================== CLEANUP ====================

  public async close() {
    await this.prisma.$disconnect();
  }

  /**
   * Gets the Prisma client instance for direct access.
   * Use with caution - prefer using DatabaseManager methods.
   */
  public getPrisma(): PrismaClient {
    return this.prisma;
  }
}

// Reset singleton para testing
export function resetDatabaseInstance() {
  prismaInstance = null;
}
