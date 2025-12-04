/**
 * Database migrations registry.
 * Each migration has a version number and SQL statements to execute.
 */
export interface Migration {
  version: number;
  name: string;
  up: string[];
}

/**
 * All database migrations in order.
 * Add new migrations at the end with incrementing version numbers.
 */
export const migrations: Migration[] = [
  // Version 1 is the initial schema from template.db
  // Add future migrations here:
  // {
  //   version: 2,
  //   name: 'add_new_column',
  //   up: [
  //     'ALTER TABLE projects ADD COLUMN new_field TEXT;',
  //   ],
  // },
];

/**
 * Current schema version (matches the latest migration version).
 * Start at 1 for the initial template.db schema.
 */
export const CURRENT_SCHEMA_VERSION = 1;
