/**
 * Database model interfaces for type-safe IPC communication.
 * These types mirror the Prisma schema with camelCase naming convention.
 */

export interface Project {
  id: string;
  name: string;
  description: string | null;
  isClosed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskStatus {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  estimatedHours: number | null;
  statusId: string | null;
  createdAt: Date;
  updatedAt: Date;
  project?: Project;
  status?: TaskStatus | null;
  tags?: { tag: Tag }[];
}

export interface TimeEntry {
  id: string;
  taskId: string | null;
  date: string;
  hours: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  task?: Task;
}

export interface WorkPeriod {
  id: string;
  year: number;
  month: number;
  plannedHours: number;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
}

export interface TaskTag {
  taskId: string;
  tagId: string;
}

export interface DeleteResult {
  success: boolean;
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changes: string | null;
  userName: string | null;
  createdAt: Date;
  projectId: string | null;
  taskId: string | null;
}
