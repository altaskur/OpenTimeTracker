-- Remove unused updated_at column from day_types table
-- This column was created but never used in the application

-- SQLite doesn't support DROP COLUMN directly, so we need to recreate the table
CREATE TABLE "new_day_types" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "default_minutes" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from old table
INSERT INTO "new_day_types" ("id", "name", "color", "default_minutes", "created_at")
SELECT "id", "name", "color", "default_minutes", "created_at" FROM "day_types";

-- Drop old table
DROP TABLE "day_types";

-- Rename new table
ALTER TABLE "new_day_types" RENAME TO "day_types";

-- Recreate unique index
CREATE UNIQUE INDEX "day_types_name_key" ON "day_types"("name");
