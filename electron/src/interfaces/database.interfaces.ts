/**
 * Database model interfaces for type-safe IPC communication.
 * These types mirror the Prisma schema and are shared with the renderer process.
 */

export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
}

export interface TaskStatus {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  estimated_hours: number | null;
  status_id: string;
  created_at: Date;
  status_name?: string;
  project_name?: string;
}

export interface TimeEntry {
  id: string;
  task_id: string | null;
  date: Date;
  hours: number;
  notes: string | null;
  created_at: Date;
  task_name?: string;
  project_name?: string;
}

export interface WorkPeriod {
  id: string;
  year: number;
  month: number;
  planned_hours: number;
  note: string | null;
  created_at: Date;
}

export interface DeleteResult {
  success: boolean;
}
