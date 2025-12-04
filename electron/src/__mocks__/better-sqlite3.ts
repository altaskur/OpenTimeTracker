import { vi } from 'vitest';

const mockStatement = {
  get: vi.fn(),
  run: vi.fn(),
  all: vi.fn().mockReturnValue([]),
};

const mockDatabase = {
  prepare: vi.fn().mockReturnValue(mockStatement),
  exec: vi.fn(),
  transaction: vi.fn((fn: () => void) => fn),
  close: vi.fn(),
};

export default vi.fn().mockImplementation(() => mockDatabase);
export { mockDatabase, mockStatement };
