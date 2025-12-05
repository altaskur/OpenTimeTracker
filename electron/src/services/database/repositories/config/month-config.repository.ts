import {
  PrismaClient,
  MonthConfig,
} from '../../../../generated/prisma/client.js';
import { BaseRepository } from '../base.repository.js';

/**
 * Repository for month configuration database operations.
 */
export class MonthConfigRepository extends BaseRepository {
  constructor(prisma: PrismaClient, ensureInitialized: () => Promise<void>) {
    super(prisma, ensureInitialized);
  }

  /**
   * Gets month config by year and month.
   */
  async get(year: number, month: number): Promise<MonthConfig | null> {
    await this.ensureInitialized();
    return this.prisma.monthConfig.findUnique({
      where: { year_month: { year, month } },
    });
  }

  /**
   * Creates a new month config.
   */
  async create(
    year: number,
    month: number,
    data: {
      weeklyMinutes: number;
      workDays: string;
      daySchedule: string;
    },
  ): Promise<MonthConfig> {
    await this.ensureInitialized();
    return this.prisma.monthConfig.create({
      data: {
        year,
        month,
        ...data,
      },
    });
  }

  /**
   * Updates an existing month config.
   */
  async update(
    year: number,
    month: number,
    data: {
      weeklyMinutes?: number;
      workDays?: string;
      daySchedule?: string;
    },
  ): Promise<MonthConfig> {
    await this.ensureInitialized();
    return this.prisma.monthConfig.update({
      where: { year_month: { year, month } },
      data,
    });
  }
}
