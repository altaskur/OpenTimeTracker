import { vi } from 'vitest';

/**
 * @description Mock for better-sqlite3 database module.
 */
export const mockStatement = {
  get: vi.fn(),
  run: vi.fn(),
  all: vi.fn().mockReturnValue([]),
};

export const mockDatabase = {
  prepare: vi.fn().mockReturnValue(mockStatement),
  exec: vi.fn(),
  transaction: vi.fn((fn: () => void) => fn),
  close: vi.fn(),
};

function MockDatabase() {
  return mockDatabase;
}

export default MockDatabase;
