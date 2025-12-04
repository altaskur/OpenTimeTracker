import { PrismaClient } from '../../../../generated/prisma/client.js';
import { BaseRepository } from '../base.repository.js';

/**
 * Repository for day override database operations.
 */
export class DayOverrideRepository extends BaseRepository {
  constructor(prisma: PrismaClient, ensureInitialized: () => Promise<void>) {
    super(prisma, ensureInitialized);
  }

  /**
   * Gets all day overrides.
   */
  async getAll() {
    await this.ensureInitialized();
    return this.prisma.dayOverride.findMany({
      include: { dayType: true },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Gets day overrides within a date range.
   */
  async getByDateRange(startDate: string, endDate: string) {
    await this.ensureInitialized();
    return this.prisma.dayOverride.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { dayType: true },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Gets a day override for a specific date.
   */
  async getByDate(date: string) {
    await this.ensureInitialized();
    return this.prisma.dayOverride.findUnique({
      where: { date },
      include: { dayType: true },
    });
  }

  /**
   * Creates a new day override.
   */
  async create(data: {
    date: string;
    dayTypeId?: string;
    note?: string;
    minutes?: number;
  }) {
    await this.ensureInitialized();
    return this.prisma.dayOverride.create({
      data: {
        date: data.date,
        dayTypeId: data.dayTypeId,
        note: data.note,
        minutes: data.minutes,
      },
      include: { dayType: true },
    });
  }

  /**
   * Updates an existing day override.
   */
  async update(
    id: string,
    data: {
      dayTypeId?: string;
      note?: string;
      minutes?: number;
    },
  ) {
    await this.ensureInitialized();
    return this.prisma.dayOverride.update({
      where: { id },
      data,
      include: { dayType: true },
    });
  }

  /**
   * Creates or updates a day override.
   */
  async upsert(data: {
    date: string;
    dayTypeId?: string;
    note?: string;
    minutes?: number;
  }) {
    await this.ensureInitialized();
    return this.prisma.dayOverride.upsert({
      where: { date: data.date },
      update: {
        dayTypeId: data.dayTypeId,
        note: data.note,
        minutes: data.minutes,
      },
      create: {
        date: data.date,
        dayTypeId: data.dayTypeId,
        note: data.note,
        minutes: data.minutes,
      },
      include: { dayType: true },
    });
  }

  /**
   * Deletes a day override.
   */
  async delete(id: string) {
    await this.ensureInitialized();
    return this.prisma.dayOverride.delete({
      where: { id },
    });
  }

  /**
   * Deletes a day override by date.
   */
  async deleteByDate(date: string) {
    await this.ensureInitialized();
    return this.prisma.dayOverride.delete({
      where: { date },
    });
  }
}
