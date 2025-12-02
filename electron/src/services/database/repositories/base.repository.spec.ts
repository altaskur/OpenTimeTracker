import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './base.repository';

/**
 * Concrete implementation for testing the abstract BaseRepository
 */
class TestRepository extends BaseRepository {
  /**
   * Exposes ensureInitialized for testing
   */
  async testEnsureInitialized(): Promise<void> {
    await this.ensureInitialized();
  }

  /**
   * Exposes prisma client for testing
   */
  getPrisma(): PrismaClient {
    return this.prisma;
  }
}

describe('BaseRepository', () => {
  let repository: TestRepository;
  let mockPrisma: PrismaClient;
  let mockEnsureInitialized: jest.Mock;

  beforeEach(() => {
    mockPrisma = {} as PrismaClient;
    mockEnsureInitialized = jest.fn().mockResolvedValue(undefined);
    repository = new TestRepository(mockPrisma, mockEnsureInitialized);
  });

  describe('constructor', () => {
    it('should store prisma client', () => {
      expect(repository.getPrisma()).toBe(mockPrisma);
    });
  });

  describe('ensureInitialized', () => {
    it('should call the provided initialization function', async () => {
      await repository.testEnsureInitialized();
      expect(mockEnsureInitialized).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from initialization function', async () => {
      const error = new Error('Init failed');
      mockEnsureInitialized.mockRejectedValue(error);

      await expect(repository.testEnsureInitialized()).rejects.toThrow(
        'Init failed',
      );
    });
  });
});
