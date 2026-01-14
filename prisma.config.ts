import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: path.join(import.meta.dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: env('DATABASE_URL') ?? 'file:./dist/data/timetracker.db',
  },
});
