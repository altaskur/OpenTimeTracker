import { Tag, Task, TaskTag } from '../../types/electron';

/**
 * Extended Task interface with computed fields for display
 */
export interface TaskWithTags extends Task {
  tags?: TaskTag[];
  /** Computed field for display */
  projectName?: string;
  statusName?: string;
}

/**
 * Task form interface for create/edit dialog
 */
export interface TaskForm {
  id: string;
  projectId: string;
  name: string;
  description: string;
  estimatedHours: number | null;
  statusId: string;
  tags: Tag[];
}
