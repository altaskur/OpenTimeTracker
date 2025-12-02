import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './base.repository';

/**
 * Repository for day type database operations.
 */
export class DayTypeRepository extends BaseRepository {
  constructor(prisma: PrismaClient, ensureInitialized: () => Promise<void>) {
    super(prisma, ensureInitialized);
  }

  /**
   * Gets all day types.
   */
  async getAll() {
    await this.ensureInitialized();
    return this.prisma.dayType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Gets a day type by ID.
   */
  async getById(id: string) {
    await this.ensureInitialized();
    return this.prisma.dayType.findUnique({
      where: { id },
    });
  }

  /**
   * Creates a new day type.
   */
  async create(data: { name: string; color: string; defaultMinutes?: number }) {
    await this.ensureInitialized();
    return this.prisma.dayType.create({
      data: {
        name: data.name,
        color: data.color,
        defaultMinutes: data.defaultMinutes ?? 0,
      },
    });
  }

  /**
   * Updates an existing day type.
   */
  async update(
    id: string,
    data: {
      name?: string;
      color?: string;
      defaultMinutes?: number;
    },
  ) {
    await this.ensureInitialized();
    return this.prisma.dayType.update({
      where: { id },
      data,
    });
  }

  /**
   * Deletes a day type.
   */
  async delete(id: string) {
    await this.ensureInitialized();
    return this.prisma.dayType.delete({
      where: { id },
    });
  }

  /**
   * Seeds default day types.
   * @internal This method is called during initialization and should NOT call ensureInitialized.
   */
  async seedDefaults() {
    const defaultDayTypes = [
      { name: 'Festivo', color: '#ef4444', defaultMinutes: 0 },
      { name: 'Vacaciones', color: '#22c55e', defaultMinutes: 0 },
      { name: 'Baja médica', color: '#f97316', defaultMinutes: 0 },
      { name: 'Permiso', color: '#3b82f6', defaultMinutes: 0 },
      { name: 'Media jornada', color: '#eab308', defaultMinutes: 240 },
    ];

    for (const dayType of defaultDayTypes) {
      const existing = await this.prisma.dayType.findUnique({
        where: { name: dayType.name },
      });

      if (!existing) {
        await this.prisma.dayType.create({
          data: dayType,
        });
      }
    }
  }
}
