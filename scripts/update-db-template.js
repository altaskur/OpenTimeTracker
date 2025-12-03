/**
 * Script to regenerate the database template after schema changes.
 * Run this after modifying prisma/schema.prisma and running migrations.
 *
 * Usage: npm run prisma:template
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const distDbPath = path.join(__dirname, "..", "dist", "data", "timetracker.db");
const templatePath = path.join(__dirname, "..", "prisma", "template.db");

console.log("Regenerating database template...\n");

try {
  console.log("1. Resetting database with migrations...");
  execSync("npx prisma migrate reset --force --skip-seed --skip-generate", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });

  console.log("\n2. Copying database to template...");
  if (fs.existsSync(distDbPath)) {
    fs.copyFileSync(distDbPath, templatePath);
    const stats = fs.statSync(templatePath);
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
