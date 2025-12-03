import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import {
  getDatabasePath,
  getDataPath,
  getTemplateDatabasePath,
} from '../../utils/paths';

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
        this.initDatabaseFromTemplate();
        prismaInstance = new PrismaClient({
          datasources: {
            db: {
              url: `file:${getDatabasePath()}`,
            },
          },
        });
      }
      this.prisma = prismaInstance;
    }
  }

  /**
   * Initializes the database from template if it doesn't exist.
   * Copies the pre-created template.db with all tables to the data directory.
   */
  private initDatabaseFromTemplate(): void {
    try {
      const dbPath = getDatabasePath();
      const templatePath = getTemplateDatabasePath();

      if (!fs.existsSync(dbPath)) {
        console.log('Database not found, copying from template...');
        console.log('Template path:', templatePath);
        console.log('Database path:', dbPath);

        if (fs.existsSync(templatePath)) {
          fs.copyFileSync(templatePath, dbPath);
          console.log('Database created from template successfully');
        } else {
          console.error('Template database not found at:', templatePath);
        }
      } else {
        console.log('Database already exists at:', dbPath);
      }
    } catch (error) {
      console.error('Error initializing database from template:', error);
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
      const dataDir = getDataPath();

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
    const defaultStatuses = [
      { name: 'status.pending', color: '#f59e0b', isDefault: true },
      { name: 'status.inProgress', color: '#3b82f6', isDefault: true },
      { name: 'status.completed', color: '#6b7280', isDefault: true },
      { name: 'status.blocked', color: '#ef4444', isDefault: true },
    ];

    for (const status of defaultStatuses) {
      const existing = await this.prisma.taskStatus.findUnique({
        where: { name: status.name },
      });
      if (!existing) {
        await this.prisma.taskStatus.create({ data: status });
      } else if (existing.color !== status.color) {
        await this.prisma.taskStatus.update({
          where: { name: status.name },
          data: { color: status.color, isDefault: status.isDefault },
        });
      }
    }

    /**
     * Migrate old status names to new translation keys
     */
    const oldToNewMapping: Record<string, { newName: string; color: string }> =
      {
        Pendiente: { newName: 'status.pending', color: '#f59e0b' },
        Pending: { newName: 'status.pending', color: '#f59e0b' },
        'En progreso': { newName: 'status.inProgress', color: '#3b82f6' },
        'In Progress': { newName: 'status.inProgress', color: '#3b82f6' },
        Completada: { newName: 'status.completed', color: '#6b7280' },
        Completed: { newName: 'status.completed', color: '#6b7280' },
        Bloqueada: { newName: 'status.blocked', color: '#ef4444' },
        Blocked: { newName: 'status.blocked', color: '#ef4444' },
      };

    for (const [oldName, { newName, color }] of Object.entries(
      oldToNewMapping,
    )) {
      const oldStatus = await this.prisma.taskStatus.findUnique({
        where: { name: oldName },
      });

      if (oldStatus) {
        const newStatus = await this.prisma.taskStatus.findUnique({
          where: { name: newName },
        });

        if (newStatus) {
          await this.prisma.task.updateMany({
            where: { statusId: oldStatus.id },
            data: { statusId: newStatus.id },
          });
          await this.prisma.taskStatus.delete({ where: { id: oldStatus.id } });
        } else {
          await this.prisma.taskStatus.update({
            where: { id: oldStatus.id },
            data: { name: newName, color, isDefault: true },
          });
        }
      }
    }

    /**
     * Assign pending status to tasks without any status
     */
    const pendingStatus = await this.prisma.taskStatus.findUnique({
      where: { name: 'status.pending' },
    });

    if (pendingStatus) {
      const result = await this.prisma.task.updateMany({
        where: { statusId: null },
        data: { statusId: pendingStatus.id },
      });
      if (result.count > 0) {
        console.log(
          `Migrated ${result.count} tasks to pending status (${pendingStatus.id})`,
        );
      }
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
          name: { notIn: ['status.completed', 'Completada', 'Completed'] },
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
    const task = await this.prisma.task.create({
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

    await this.createAuditLog({
      entityType: 'Task',
      entityId: task.id,
      action: 'CREATE',
      changes: JSON.stringify({ name, description, estimatedHours, statusId }),
      projectId,
      taskId: task.id,
    });

    return task;
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

    const previousTask = await this.prisma.task.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } } },
    });

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

    const task = await this.prisma.task.update({
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

    await this.createAuditLog({
      entityType: 'Task',
      entityId: id,
      action: 'UPDATE',
      changes: JSON.stringify({
        previous: previousTask,
        current: data,
      }),
      projectId: task.projectId,
      taskId: id,
    });

    return task;
  }

  public async deleteTask(id: string) {
    await this.ensureInitialized();

    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } } },
    });

    const deleted = await this.prisma.task.delete({
      where: { id },
    });

    if (task) {
      await this.createAuditLog({
        entityType: 'Task',
        entityId: id,
        action: 'DELETE',
        changes: JSON.stringify(task),
        projectId: task.projectId,
      });
    }

    return deleted;
  }

  // ==================== TASK STATUSES ====================

  public async getTaskStatuses() {
    await this.ensureInitialized();
    return this.prisma.taskStatus.findMany({
      orderBy: { name: 'asc' },
    });
  }

  public async createTaskStatus(name: string, color: string) {
    await this.ensureInitialized();
    return this.prisma.taskStatus.create({
      data: { name, color, isDefault: false },
    });
  }

  public async updateTaskStatus(id: string, name: string, color: string) {
    await this.ensureInitialized();
    return this.prisma.taskStatus.update({
      where: { id },
      data: { name, color },
    });
  }

  public async deleteTaskStatus(id: string) {
    await this.ensureInitialized();
    const status = await this.prisma.taskStatus.findUnique({
      where: { id },
    });

    if (!status) {
      return null;
    }

    if (status.isDefault) {
      throw new Error('Cannot delete default status');
    }

    return this.prisma.taskStatus.delete({
      where: { id },
    });
  }

  // ==================== TIME ENTRIES ====================

  public async getTimeEntries(taskId?: string) {
    await this.ensureInitialized();
    return this.prisma.timeEntry.findMany({
      where: taskId ? { taskId } : undefined,
      include: {
        task: {
          include: {
            project: true,
            status: true,
          },
        },
      },
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
      include: {
        task: {
          include: {
            project: true,
            status: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  public async getTimeEntriesByDate(date: string) {
    await this.ensureInitialized();
    return this.prisma.timeEntry.findMany({
      where: { date },
      include: {
        task: {
          include: {
            project: true,
            status: true,
          },
        },
      },
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
    const entry = await this.prisma.timeEntry.create({
      data: {
        date,
        minutes,
        taskId,
        notes,
      },
      include: {
        task: true,
      },
    });

    await this.createAuditLog({
      entityType: 'TimeEntry',
      entityId: entry.id,
      action: 'CREATE',
      changes: JSON.stringify({
        date,
        minutes,
        hours: (minutes / 60).toFixed(2),
        taskName: entry.task?.name,
        notes,
      }),
      taskId: taskId,
    });

    return entry;
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

    const previousEntry = await this.prisma.timeEntry.findUnique({
      where: { id },
      include: { task: true },
    });

    const data =
      typeof dataOrDate === 'string'
        ? {
            date: dataOrDate,
            minutes,
            notes,
          }
        : dataOrDate;

    const entry = await this.prisma.timeEntry.update({
      where: { id },
      data: {
        ...(data.taskId !== undefined && { taskId: data.taskId }),
        ...(data.date !== undefined && { date: data.date }),
        ...(data.minutes !== undefined && { minutes: data.minutes }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        task: true,
      },
    });

    await this.createAuditLog({
      entityType: 'TimeEntry',
      entityId: id,
      action: 'UPDATE',
      changes: JSON.stringify({
        previous: {
          date: previousEntry?.date,
          minutes: previousEntry?.minutes,
          hours: previousEntry ? (previousEntry.minutes / 60).toFixed(2) : null,
          taskName: previousEntry?.task?.name,
          notes: previousEntry?.notes,
        },
        current: {
          date: entry.date,
          minutes: entry.minutes,
          hours: (entry.minutes / 60).toFixed(2),
          taskName: entry.task?.name,
          notes: entry.notes,
        },
      }),
      taskId: entry.taskId ?? undefined,
    });

    return entry;
  }

  public async deleteTimeEntry(id: string) {
    await this.ensureInitialized();

    const entry = await this.prisma.timeEntry.findUnique({
      where: { id },
      include: { task: true },
    });

    if (!entry) {
      return null;
    }

    const deleted = await this.prisma.timeEntry.delete({
      where: { id },
    });

    if (deleted) {
      await this.createAuditLog({
        entityType: 'TimeEntry',
        entityId: id,
        action: 'DELETE',
        changes: JSON.stringify({
          date: entry.date,
          minutes: entry.minutes,
          hours: (entry.minutes / 60).toFixed(2),
          taskName: entry.task?.name,
          notes: entry.notes,
        }),
        taskId: entry.taskId ?? undefined,
      });
    }

    return deleted;
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

  public async updateTag(id: string, name: string) {
    await this.ensureInitialized();
    return this.prisma.tag.update({
      where: { id },
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
   * Gets audit logs filtered by entity type and/or entity id or task id
   */
  public async getAuditLogs(
    entityType?: string,
    entityId?: string,
    taskId?: string,
  ) {
    await this.ensureInitialized();
    return this.prisma.auditLog.findMany({
      where: {
        ...(entityType && !taskId && { entityType }),
        ...(entityId && !taskId && { entityId }),
        ...(taskId && {
          OR: [{ entityType: 'Task', entityId: taskId }, { taskId: taskId }],
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==================== ACTION HISTORY ====================

  /**
   * Creates a new action history entry
   */
  public async createActionHistory(data: {
    entityType: string;
    entityId: string;
    actionType: string;
    description: string;
    previousData?: string;
    newData?: string;
  }) {
    await this.ensureInitialized();
    return this.prisma.actionHistory.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        actionType: data.actionType,
        description: data.description,
        previousData: data.previousData,
        newData: data.newData,
        undone: false,
      },
    });
  }

  /**
   * Gets action history entries
   */
  public async getActionHistory(limit = 50) {
    await this.ensureInitialized();
    return this.prisma.actionHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Gets the last action that can be undone
   */
  public async getLastUndoableAction() {
    await this.ensureInitialized();
    return this.prisma.actionHistory.findFirst({
      where: { undone: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Gets the last action that can be redone
   */
  public async getLastRedoableAction() {
    await this.ensureInitialized();
    return this.prisma.actionHistory.findFirst({
      where: { undone: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Marks an action as undone
   */
  public async markActionUndone(id: string) {
    await this.ensureInitialized();
    return this.prisma.actionHistory.update({
      where: { id },
      data: { undone: true },
    });
  }

  /**
   * Marks an action as redone (not undone)
   */
  public async markActionRedone(id: string) {
    await this.ensureInitialized();
    return this.prisma.actionHistory.update({
      where: { id },
      data: { undone: false },
    });
  }

  /**
   * Clears all action history
   */
  public async clearActionHistory() {
    await this.ensureInitialized();
    return this.prisma.actionHistory.deleteMany();
  }

  /**
   * Clears actions older than specified days
   */
  public async cleanOldActionHistory(daysOld = 30) {
    await this.ensureInitialized();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    return this.prisma.actionHistory.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
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
