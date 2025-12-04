import { describe, it, expect } from 'vitest';
import { migrations, CURRENT_SCHEMA_VERSION } from './index.js';

describe('migrations registry', () => {
  it('should export migrations array', () => {
    expect(Array.isArray(migrations)).toBe(true);
  });

  it('should have CURRENT_SCHEMA_VERSION defined', () => {
    expect(CURRENT_SCHEMA_VERSION).toBe(1);
  });

  it('should have migrations with correct structure', () => {
    for (const migration of migrations) {
      expect(migration).toHaveProperty('version');
      expect(migration).toHaveProperty('name');
      expect(migration).toHaveProperty('up');
      expect(typeof migration.version).toBe('number');
      expect(typeof migration.name).toBe('string');
      expect(Array.isArray(migration.up)).toBe(true);
    }
  });

  it('should have migrations in ascending version order', () => {
    for (let i = 1; i < migrations.length; i++) {
      expect(migrations[i].version).toBeGreaterThan(migrations[i - 1].version);
    }
  });
});
