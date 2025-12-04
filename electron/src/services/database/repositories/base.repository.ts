import { PrismaClient } from '../../../generated/prisma/client.js';

/**
 * Base repository providing common functionality for all repositories.
 * All repositories should extend this class.
 */
export abstract class BaseRepository {
  protected readonly prisma: PrismaClient;
  private readonly ensureInit: () => Promise<void>;

  constructor(prisma: PrismaClient, ensureInitialized: () => Promise<void>) {
    this.prisma = prisma;
    this.ensureInit = ensureInitialized;
  }

  /**
   * Ensures database is initialized before operations.
   */
  protected async ensureInitialized(): Promise<void> {
    await this.ensureInit();
  }
}
