-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_app_settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'app_settings',
    "dark_mode" BOOLEAN NOT NULL DEFAULT true,
    "language" TEXT NOT NULL DEFAULT 'es',
    "auto_check_updates" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_app_settings" ("created_at", "dark_mode", "id", "language", "updated_at") SELECT "created_at", "dark_mode", "id", "language", "updated_at" FROM "app_settings";
DROP TABLE "app_settings";
ALTER TABLE "new_app_settings" RENAME TO "app_settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
