/*
  Warnings:

  - You are about to drop the column `hours` on the `time_entries` table. All the data in the column will be lost.
  - Added the required column `minutes` to the `time_entries` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "work_config" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'work_config',
    "daily_minutes" INTEGER NOT NULL DEFAULT 480,
    "weekly_minutes" INTEGER NOT NULL DEFAULT 2400,
    "work_days" TEXT NOT NULL DEFAULT '1,2,3,4,5',
    "day_schedule" TEXT NOT NULL DEFAULT '{"1":480,"2":480,"3":480,"4":480,"5":480}',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "month_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "weekly_minutes" INTEGER NOT NULL DEFAULT 2400,
    "work_days" TEXT NOT NULL DEFAULT '1,2,3,4,5',
    "day_schedule" TEXT NOT NULL DEFAULT '{"1":480,"2":480,"3":480,"4":480,"5":480}',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "day_types" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "default_minutes" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "day_overrides" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "day_type_id" TEXT,
    "minutes" INTEGER,
    "note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "day_overrides_day_type_id_fkey" FOREIGN KEY ("day_type_id") REFERENCES "day_types" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "action_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "previous_data" TEXT,
    "new_data" TEXT,
    "undone" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_time_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "task_id" TEXT,
    "date" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "time_entries_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_time_entries" ("created_at", "date", "id", "notes", "task_id", "updated_at") SELECT "created_at", "date", "id", "notes", "task_id", "updated_at" FROM "time_entries";
DROP TABLE "time_entries";
ALTER TABLE "new_time_entries" RENAME TO "time_entries";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "month_configs_year_month_key" ON "month_configs"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "day_types_name_key" ON "day_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "day_overrides_date_key" ON "day_overrides"("date");
