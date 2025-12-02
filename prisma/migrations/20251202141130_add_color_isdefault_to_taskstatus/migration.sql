-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_task_status" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "is_default" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_task_status" ("id", "name") SELECT "id", "name" FROM "task_status";
DROP TABLE "task_status";
ALTER TABLE "new_task_status" RENAME TO "task_status";
CREATE UNIQUE INDEX "task_status_name_key" ON "task_status"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
