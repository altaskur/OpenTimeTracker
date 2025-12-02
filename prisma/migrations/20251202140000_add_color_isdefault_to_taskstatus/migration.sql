-- AlterTable
ALTER TABLE "task_status" ADD COLUMN "color" TEXT NOT NULL DEFAULT '#6b7280';
ALTER TABLE "task_status" ADD COLUMN "is_default" BOOLEAN NOT NULL DEFAULT false;
