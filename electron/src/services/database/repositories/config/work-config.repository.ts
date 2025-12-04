import { PrismaClient } from '../../../../generated/prisma/client.js';
import { BaseRepository } from '../base.repository.js';

/**
 * Repository for work configuration database operations.
 */
export class WorkConfigRepository extends BaseRepository {
  constructor(prisma: PrismaClient, ensureInitialized: () => Promise<void>) {
    super(prisma, ensureInitialized);
  }

  /**
   * Gets the current work configuration.
   */
  async get() {
    await this.ensureInitialized();
    let config = await this.prisma.workConfig.findUnique({
      where: { id: 'work_config' },
    });
    config ??= await this.prisma.workConfig.create({
      data: { id: 'work_config' },
    });
    return config;
  }

  /**
   * Updates the work configuration.
   */
  async update(data: {
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

  /**
   * Gets the month configuration for a specific year and month.
   */
  async getMonthConfig(year: number, month: number) {
    await this.ensureInitialized();

    let monthConfig = await this.prisma.monthConfig.findUnique({
      where: {
        year_month: { year, month },
      },
    });

    if (!monthConfig) {
      const workConfig = await this.get();
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
   * Updates or creates the month configuration.
   */
  async updateMonthConfig(
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

    const workConfig = await this.get();
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

  /**
   * Deletes a month configuration.
   */
  async deleteMonthConfig(year: number, month: number) {
    await this.ensureInitialized();
    return this.prisma.monthConfig.delete({
      where: {
        year_month: { year, month },
      },
    });
  }

  /**
   * Gets all month configurations.
   */
  async getAllMonthConfigs() {
    await this.ensureInitialized();
    return this.prisma.monthConfig.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }
}
