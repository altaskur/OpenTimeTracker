import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

let prismaInstance: PrismaClient | null = null;

/**
 * Database manager that coordinates all database operations.
 * Uses repository pattern for separation of concerns.
 */
export class DatabaseManager {
  private readonly prisma: PrismaClient;
  private initialized: Promise<void> | null = null;

  constructor(prismaClient?: PrismaClient) {
    if (prismaClient) {
      this.prisma = prismaClient;
    } else {
      if (!prismaInstance) {
        this.initDirectory();
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
   * Initializes the database asynchronously (lazy initialization).
   * @internal Do not call ensureInitialized() from within this method.
   */
  private initializeAsync(): Promise<void> {
    if (!this.initialized) {
      this.initialized = (async () => {
        await this.prisma.$connect();
        await this.seedAllDefaults();
      })();
    }
    return this.initialized;
  }

  /**
   * Initializes the database directory.
   */
  private initDirectory(): void {
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
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  /**
   * Seeds all default data during initialization.
   * @internal NEVER call ensureInitialized() from this method - causes deadlock.
   */
  private async seedAllDefaults(): Promise<void> {
    try {
      await this.seedDefaultTaskStatuses();
      await this.seedDefaultDayTypesInternal();
    } catch (error) {
      console.error('Error seeding default data:', error);
    }
  }

  /**
   * Seeds default task statuses.
   * @internal Called during initialization - do not call ensureInitialized().
   */
  private async seedDefaultTaskStatuses(): Promise<void> {
    const statusCount = await this.prisma.taskStatus.count();
    if (statusCount === 0) {
      await this.prisma.taskStatus.createMany({
        data: [
          { name: 'Pendiente' },
          { name: 'En progreso' },
          { name: 'Completada' },
          { name: 'Bloqueada' },
        ],
      });
    }
  }

  /**
   * Seeds default day types.
   * @internal Called during initialization - do not call ensureInitialized().
   */
  private async seedDefaultDayTypesInternal(): Promise<void> {
    const defaultTypes = [
      { name: 'Festivo', color: '#ef4444', defaultMinutes: 0 },
      { name: 'Vacaciones', color: '#22c55e', defaultMinutes: 0 },
      { name: 'Baja médica', color: '#f97316', defaultMinutes: 0 },
      { name: 'Permiso', color: '#3b82f6', defaultMinutes: 0 },
      { name: 'Media jornada', color: '#eab308', defaultMinutes: 240 },
    ];

    for (const type of defaultTypes) {
      const existing = await this.prisma.dayType.findUnique({
        where: { name: type.name },
      });
      if (!existing) {
        await this.prisma.dayType.create({ data: type });
      }
    }
  }

  /**
   * Ensures database is initialized before operations.
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

  /**
   * Checks if a project can be closed.
   */
  public async canCloseProject(id: string): Promise<boolean> {
    await this.ensureInitialized();
    const incompleteTasks = await this.prisma.task.count({
      where: {
        projectId: id,
        status: {
          name: { not: 'Completada' },
        },
      },
    });
    return incompleteTasks === 0;
  }

  /**
   * Closes a project if all tasks are completed.
   */
  public async closeProject(id: string, userName?: string) {
    await this.ensureInitialized();
    const canClose = await this.canCloseProject(id);
    if (!canClose) {
      throw new Error('Cannot close project: some tasks are not completed');
    }

    const project = await this.prisma.project.update({
      where: { id },
      data: { isClosed: true },
    });

    await this.createAuditLog({
      entityType: 'Project',
      entityId: id,
      action: 'CLOSED',
      userName,
      projectId: id,
    });

    return project;
  }

  /**
   * Reopens a closed project
   */
  public async reopenProject(id: string, userName?: string) {
    await this.ensureInitialized();
    const project = await this.prisma.project.update({
      where: { id },
      data: { isClosed: false },
    });

    await this.createAuditLog({
      entityType: 'Project',
      entityId: id,
      action: 'REOPENED',
      userName,
      projectId: id,
    });

    return project;
  }

  // ==================== TASKS ====================

  public async getTasks(projectId?: string) {
    await this.ensureInitialized();
    return this.prisma.task.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        status: true,
        project: true,
        tags: {
          include: {
            tag: true,
          },
        },
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
    tagIds?: string[],
  ) {
    await this.ensureInitialized();
    return this.prisma.task.create({
      data: {
        projectId,
        name,
        description,
        estimatedHours,
        statusId,
        ...(tagIds &&
          tagIds.length > 0 && {
            tags: {
              create: tagIds.map((tagId) => ({ tagId })),
            },
          }),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
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
          tagIds?: string[];
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

    const tagIds =
      typeof dataOrName === 'object' ? dataOrName?.tagIds : undefined;

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
        ...(tagIds !== undefined && {
          tags: {
            deleteMany: {},
            create: tagIds.map((tagId) => ({ tagId })),
          },
        }),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
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

  public async getTimeEntriesByDateRange(startDate: string, endDate: string) {
    await this.ensureInitialized();
    return this.prisma.timeEntry.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { task: true },
      orderBy: { date: 'asc' },
    });
  }

  public async getTimeEntriesByDate(date: string) {
    await this.ensureInitialized();
    return this.prisma.timeEntry.findMany({
      where: { date },
      include: { task: true },
      orderBy: { createdAt: 'asc' },
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
    minutes: number,
    taskId?: string,
    notes?: string,
  ) {
    await this.ensureInitialized();
    return this.prisma.timeEntry.create({
      data: {
        date,
        minutes,
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
          minutes?: number;
          notes?: string;
        },
    minutes?: number,
    notes?: string,
  ) {
    await this.ensureInitialized();
    const data =
      typeof dataOrDate === 'string'
        ? {
            date: dataOrDate,
            minutes,
            notes,
          }
        : dataOrDate;

    return this.prisma.timeEntry.update({
      where: { id },
      data: {
        ...(data.taskId !== undefined && { taskId: data.taskId }),
        ...(data.date !== undefined && { date: data.date }),
        ...(data.minutes !== undefined && { minutes: data.minutes }),
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

  public async getWorkPeriod(year: number, month: number) {
    await this.ensureInitialized();
    return this.prisma.workPeriod.findUnique({
      where: { year_month: { year, month } },
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

  public async updateWorkPeriod(
    year: number,
    month: number,
    data: { plannedHours?: number; note?: string },
  ) {
    await this.ensureInitialized();
    return this.prisma.workPeriod.update({
      where: { year_month: { year, month } },
      data,
    });
  }

  public async upsertWorkPeriod(
    year: number,
    month: number,
    plannedHours: number,
    note?: string,
  ) {
    await this.ensureInitialized();
    return this.prisma.workPeriod.upsert({
      where: { year_month: { year, month } },
      update: { plannedHours, note },
      create: { year, month, plannedHours, note },
    });
  }

  // ==================== WORK CONFIG ====================

  public async getWorkConfig() {
    await this.ensureInitialized();
    let config = await this.prisma.workConfig.findUnique({
      where: { id: 'work_config' },
    });
    if (!config) {
      config = await this.prisma.workConfig.create({
        data: { id: 'work_config' },
      });
    }
    return config;
  }

  public async updateWorkConfig(data: {
    dailyMinutes?: number;
    weeklyMinutes?: number;
    workDays?: string;
    daySchedule?: string;
  }) {
    await this.ensureInitialized();
    return this.prisma.workConfig.upsert({
      where: { id: 'work_config' },
      update: data,
      create: { id: 'work_config', ...data },
    });
  }

  // ==================== MONTH CONFIG ====================

  /**
   * Gets month config, creating from WorkConfig template if not exists
   */
  public async getMonthConfig(year: number, month: number) {
    await this.ensureInitialized();

    let monthConfig = await this.prisma.monthConfig.findUnique({
      where: { year_month: { year, month } },
    });

    if (!monthConfig) {
      const workConfig = await this.getWorkConfig();
      monthConfig = await this.prisma.monthConfig.create({
        data: {
          year,
          month,
          weeklyMinutes: workConfig.weeklyMinutes,
          workDays: workConfig.workDays,
          daySchedule: workConfig.daySchedule,
        },
      });
    }

    return monthConfig;
  }

  /**
   * Updates month config, creating if not exists
   */
  public async updateMonthConfig(
    year: number,
    month: number,
    data: {
      weeklyMinutes?: number;
      workDays?: string;
      daySchedule?: string;
    },
  ) {
    await this.ensureInitialized();

    const existing = await this.prisma.monthConfig.findUnique({
      where: { year_month: { year, month } },
    });

    if (existing) {
      return this.prisma.monthConfig.update({
        where: { year_month: { year, month } },
        data,
      });
    }

    const workConfig = await this.getWorkConfig();
    return this.prisma.monthConfig.create({
      data: {
        year,
        month,
        weeklyMinutes: data.weeklyMinutes ?? workConfig.weeklyMinutes,
        workDays: data.workDays ?? workConfig.workDays,
        daySchedule: data.daySchedule ?? workConfig.daySchedule,
      },
    });
  }

  // ==================== DAY TYPES ====================

  /**
   * Seeds default day types if they don't exist.
   * Safe to call from outside - this is the public API.
   */
  public async seedDefaultDayTypes() {
    await this.ensureInitialized();
    await this.seedDefaultDayTypesInternal();
  }

  public async getDayTypes() {
    await this.ensureInitialized();
    return this.prisma.dayType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  public async createDayType(
    name: string,
    color = '#6b7280',
    defaultMinutes = 0,
  ) {
    await this.ensureInitialized();
    return this.prisma.dayType.create({
      data: { name, color, defaultMinutes },
    });
  }

  public async updateDayType(
    id: string,
    data: { name?: string; color?: string; defaultMinutes?: number },
  ) {
    await this.ensureInitialized();
    return this.prisma.dayType.update({
      where: { id },
      data,
    });
  }

  public async deleteDayType(id: string) {
    await this.ensureInitialized();
    return this.prisma.dayType.delete({
      where: { id },
    });
  }

  // ==================== DAY OVERRIDES ====================

  public async getDayOverrides(startDate?: string, endDate?: string) {
    await this.ensureInitialized();
    return this.prisma.dayOverride.findMany({
      where:
        startDate && endDate
          ? {
              date: { gte: startDate, lte: endDate },
            }
          : undefined,
      include: { dayType: true },
      orderBy: { date: 'asc' },
    });
  }

  public async getDayOverride(date: string) {
    await this.ensureInitialized();
    return this.prisma.dayOverride.findUnique({
      where: { date },
      include: { dayType: true },
    });
  }

  public async createDayOverride(
    date: string,
    dayTypeId?: string,
    minutes?: number,
    note?: string,
  ) {
    await this.ensureInitialized();
    return this.prisma.dayOverride.create({
      data: {
        date,
        ...(dayTypeId !== undefined && {
          dayType: { connect: { id: dayTypeId } },
        }),
        ...(minutes !== undefined && { minutes }),
        ...(note !== undefined && { note }),
      },
      include: { dayType: true },
    });
  }

  public async updateDayOverride(
    date: string,
    data: { dayTypeId?: string; minutes?: number; note?: string },
  ) {
    await this.ensureInitialized();
    return this.prisma.dayOverride.update({
      where: { date },
      data,
      include: { dayType: true },
    });
  }

  public async upsertDayOverride(
    date: string,
    dayTypeId?: string,
    minutes?: number,
    note?: string,
  ) {
    await this.ensureInitialized();
    const updateData: {
      dayTypeId?: string;
      minutes?: number;
      note?: string;
    } = {};
    if (dayTypeId !== undefined) updateData.dayTypeId = dayTypeId;
    if (minutes !== undefined) updateData.minutes = minutes;
    if (note !== undefined) updateData.note = note;

    const createData: {
      date: string;
      dayTypeId?: string;
      minutes?: number;
      note?: string;
    } = { date };
    if (dayTypeId !== undefined) createData.dayTypeId = dayTypeId;
    if (minutes !== undefined) createData.minutes = minutes;
    if (note !== undefined) createData.note = note;

    return this.prisma.dayOverride.upsert({
      where: { date },
      update: updateData,
      create: createData,
      include: { dayType: true },
    });
  }

  public async deleteDayOverride(date: string) {
    await this.ensureInitialized();
    return this.prisma.dayOverride.delete({
      where: { date },
    });
  }

  // ==================== TAGS ====================

  public async getTags() {
    await this.ensureInitialized();
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  public async createTag(name: string) {
    await this.ensureInitialized();
    return this.prisma.tag.create({
      data: { name },
    });
  }

  public async deleteTag(id: string) {
    await this.ensureInitialized();
    return this.prisma.tag.delete({
      where: { id },
    });
  }

  public async addTagToTask(taskId: string, tagId: string) {
    await this.ensureInitialized();
    return this.prisma.taskTag.create({
      data: { taskId, tagId },
    });
  }

  public async removeTagFromTask(taskId: string, tagId: string) {
    await this.ensureInitialized();
    return this.prisma.taskTag.delete({
      where: {
        taskId_tagId: { taskId, tagId },
      },
    });
  }

  // ==================== AUDIT LOGS ====================

  /**
   * Creates an audit log entry
   */
  public async createAuditLog(data: {
    entityType: string;
    entityId: string;
    action: string;
    changes?: string;
    userName?: string;
    projectId?: string;
    taskId?: string;
  }) {
    await this.ensureInitialized();
    return this.prisma.auditLog.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        changes: data.changes,
        userName: data.userName,
        projectId: data.projectId,
        taskId: data.taskId,
      },
    });
  }

  /**
   * Gets audit logs filtered by entity type and/or entity id
   */
  public async getAuditLogs(entityType?: string, entityId?: string) {
    await this.ensureInitialized();
    return this.prisma.auditLog.findMany({
      where: {
        ...(entityType && { entityType }),
        ...(entityId && { entityId }),
      },
      orderBy: { createdAt: 'desc' },
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
