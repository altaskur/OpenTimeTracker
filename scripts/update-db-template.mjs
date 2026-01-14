/**
 * Script to regenerate the database template after schema changes.
 * Run this after modifying prisma/schema.prisma and running migrations.
 *
 * Usage: npm run prisma:template
 */

import { execSync } from "node:child_process";
import { existsSync, copyFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDbPath = join(__dirname, "..", "dist", "data", "timetracker.db");
const templatePath = join(__dirname, "..", "prisma", "template.db");

console.log("Regenerating database template...\n");

try {
  console.log("1. Resetting database with schema...");
  execSync(
    "cross-env DATABASE_URL=file:./dist/data/timetracker.db npx prisma db push --force-reset --accept-data-loss",
    {
      stdio: "inherit",
      cwd: join(__dirname, ".."),
    },
  );

  console.log("\n2. Copying database to template...");
  if (existsSync(distDbPath)) {
    copyFileSync(distDbPath, templatePath);
    const stats = statSync(templatePath);
    console.log(
      `   ✅ Template created: prisma/template.db (${(stats.size / 1024).toFixed(1)} KB)`,
    );
  } else {
    console.error("   ❌ Error: Database not found at", distDbPath);
    process.exit(1);
  }

  console.log("\n🎁 Database template updated successfully!\n");
} catch (error) {
  console.error("\n❌ Error updating template:", error.message);
  process.exit(1);
}
