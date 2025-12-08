import {
  PrismaClient,
  WorkPeriod,
} from '../../../../generated/prisma/client.js';
import { BaseRepository } from '../base.repository.js';

/**
 * Repository for work period database operations.
 */
export class WorkPeriodRepository extends BaseRepository {
  constructor(prisma: PrismaClient, ensureInitialized: () => Promise<void>) {
    super(prisma, ensureInitialized);
  }

  /**
   * Gets all work periods ordered by year and month descending.
   */
  async getAll(): Promise<WorkPeriod[]> {
    await this.ensureInitialized();
    return this.prisma.workPeriod.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  /**
   * Gets a specific work period by year and month.
   */
  async get(year: number, month: number): Promise<WorkPeriod | null> {
    await this.ensureInitialized();
    return this.prisma.workPeriod.findUnique({
      where: { year_month: { year, month } },
    });
  }

  /**
   * Creates a new work period.
   */
  async create(
    year: number,
    month: number,
    plannedHours: number,
    note?: string,
  ): Promise<WorkPeriod> {
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

  /**
   * Updates an existing work period.
   */
  async update(
    year: number,
    month: number,
    data: { plannedHours?: number; note?: string },
  ): Promise<WorkPeriod> {
    await this.ensureInitialized();
    return this.prisma.workPeriod.update({
      where: { year_month: { year, month } },
      data,
    });
  }

  /**
   * Creates or updates a work period.
   */
  async upsert(
    year: number,
    month: number,
    plannedHours: number,
    note?: string,
  ): Promise<WorkPeriod> {
    await this.ensureInitialized();
    return this.prisma.workPeriod.upsert({
      where: { year_month: { year, month } },
      update: { plannedHours, note },
      create: { year, month, plannedHours, note },
    });
  }
}
