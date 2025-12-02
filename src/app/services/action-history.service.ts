import {
  Injectable,
  signal,
  computed,
  OnDestroy,
  NgZone,
  inject,
} from '@angular/core';
import { ActionHistory } from '../../types/electron';

/**
 * Types of entities that can have undoable actions
 */
export type EntityType =
  | 'Project'
  | 'Task'
  | 'TimeEntry'
  | 'DayOverride'
  | 'DayType'
  | 'MonthConfig'
  | 'Tag';

/**
 * Types of actions that can be undone
 */
export type ActionType = 'create' | 'update' | 'delete';

/**
 * Represents an undoable action
 */
export interface UndoableAction {
  /** Unique identifier */
  id: string;
  /** Type of entity affected */
  entityType: EntityType;
  /** Type of action performed */
  actionType: ActionType;
  /** Entity ID affected */
  entityId: string;
  /** Human-readable description */
  description: string;
  /** Data before the action (for undo) */
  previousData: unknown;
  /** Data after the action (for redo) */
  newData: unknown;
  /** Function to execute the action */
  execute: () => Promise<void>;
  /** Function to undo the action */
  undo: () => Promise<void>;
  /** Timestamp when action was performed */
  timestamp: Date;
  /** Whether the action has been undone */
  undone?: boolean;
}

/**
 * Parameters for executing an undoable action
 */
export interface ExecuteActionParams {
  entityType: EntityType;
  actionType: ActionType;
  entityId: string;
  description: string;
  previousData: unknown;
  newData: unknown;
  execute: () => Promise<void>;
  undo: () => Promise<void>;
}

/**
 * Service to manage action history for undo/redo functionality.
 * Listens to Electron menu events and maintains action stacks.
 * Supports persistence to database and restoration on app restart.
 */
@Injectable({
  providedIn: 'root',
})
export class ActionHistoryService implements OnDestroy {
  /** Maximum number of actions to keep in history */
  private readonly MAX_HISTORY_SIZE = 50;

  /** Injected NgZone for running code inside Angular zone */
  private readonly ngZone = inject(NgZone);

  /** Stack of actions that can be undone */
  private readonly undoStack = signal<UndoableAction[]>([]);

  /** Stack of actions that can be redone */
  private readonly redoStack = signal<UndoableAction[]>([]);

  /** Whether an undo/redo operation is in progress */
  private readonly isProcessing = signal<boolean>(false);

  /** Whether history has been loaded from database */
  private readonly isLoaded = signal<boolean>(false);

  /** Signal to notify components that data has changed */
  readonly dataChanged = signal<{ entityType: EntityType; timestamp: number }>({
    entityType: 'Project',
    timestamp: 0,
  });

  /** All actions in undo stack (most recent first) */
  readonly actions = computed(() => [...this.undoStack()].reverse());

  /** Whether there are actions that can be undone */
  readonly canUndo = computed(
    () => this.undoStack().length > 0 && !this.isProcessing(),
  );

  /** Whether there are actions that can be redone */
  readonly canRedo = computed(
    () => this.redoStack().length > 0 && !this.isProcessing(),
  );

  /** Number of actions in history */
  readonly actionCount = computed(() => this.undoStack().length);

  /** Last action performed */
  readonly lastAction = computed(() => {
    const stack = this.undoStack();
    return stack.length > 0 ? stack[stack.length - 1] : null;
  });

  constructor() {
    this.setupElectronListeners();
    this.initializeFromDatabase();
  }

  ngOnDestroy(): void {
    this.clear();
  }

  /**
   * Initializes the service by loading history from database
   */
  private initializeFromDatabase(): void {
    // Using setTimeout to move async operation out of constructor
    setTimeout(() => {
      void this.loadFromDatabase();
    }, 0);
  }

  /**
   * Sets up listeners for Electron menu events
   */
  private setupElectronListeners(): void {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.onUndoAction(() => {
        this.ngZone.run(() => {
          void this.undo();
        });
      });

      window.electronAPI.onRedoAction(() => {
        this.ngZone.run(() => {
          void this.redo();
        });
      });
    }
  }

  /**
   * Executes an action and adds it to the undo stack
   */
  async execute(params: ExecuteActionParams): Promise<void> {
    const action: UndoableAction = {
      id: '', // Will be set after persisting
      ...params,
      timestamp: new Date(),
    };

    await action.execute();

    // Persist and get the database-generated ID
    const dbId = await this.persistAction(action);
    action.id = dbId;

    const currentStack = this.undoStack();
    const newStack = [...currentStack, action];

    if (newStack.length > this.MAX_HISTORY_SIZE) {
      newStack.shift();
    }

    this.undoStack.set(newStack);
    this.redoStack.set([]);
  }

  /**
   * Persists action to database and returns the generated ID
   */
  private async persistAction(action: UndoableAction): Promise<string> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        const record = await window.electronAPI.createActionHistory(
          action.entityType,
          action.entityId,
          action.actionType,
          action.description,
          JSON.stringify(action.previousData),
          JSON.stringify(action.newData),
        );
        return record.id;
      } catch (error) {
        console.error('Failed to persist action:', error);
      }
    }
    // Use crypto.randomUUID for generating local fallback IDs
    return `local_${crypto.randomUUID()}`;
  }

  /**
   * Loads action history from database and reconstructs the stacks
   */
  async loadFromDatabase(): Promise<void> {
    if (
      this.isLoaded() ||
      typeof window === 'undefined' ||
      !window.electronAPI
    ) {
      return;
    }

    try {
      const records = await window.electronAPI.getActionHistory(
        this.MAX_HISTORY_SIZE,
      );

      const undoActions: UndoableAction[] = [];
      const redoActions: UndoableAction[] = [];

      const reversedRecords = [...records].reverse();
      for (const record of reversedRecords) {
        const action = this.recordToAction(record);
        if (record.undone) {
          redoActions.push(action);
        } else {
          undoActions.push(action);
        }
      }

      this.undoStack.set(undoActions);
      this.redoStack.set(redoActions);
      this.isLoaded.set(true);
    } catch (error) {
      console.error('Failed to load action history from database:', error);
    }
  }

  /**
   * Converts a database record to an UndoableAction
   */
  private recordToAction(record: ActionHistory): UndoableAction {
    const previousData = record.previousData
      ? JSON.parse(record.previousData)
      : null;
    const newData = record.newData ? JSON.parse(record.newData) : null;
    const entityType = record.entityType as EntityType;
    const actionType = record.actionType as ActionType;

    return {
      id: record.id,
      entityType,
      actionType,
      entityId: record.entityId,
      description: record.description,
      previousData,
      newData,
      timestamp: new Date(record.createdAt),
      undone: record.undone,
      execute: () =>
        this.executeAction(
          entityType,
          actionType,
          record.entityId,
          newData,
          previousData,
        ),
      undo: () =>
        this.undoAction(
          entityType,
          actionType,
          record.entityId,
          previousData,
          newData,
        ),
    };
  }

  /**
   * Executes an action based on entity type and action type (for redo)
   */
  private async executeAction(
    entityType: EntityType,
    actionType: ActionType,
    entityId: string,
    newData: unknown,
    previousData: unknown,
  ): Promise<void> {
    if (typeof window === 'undefined' || !window.electronAPI) return;

    const api = window.electronAPI;
    const data = newData as Record<string, unknown>;
    const prev = previousData as Record<string, unknown>;

    const handlers: Record<EntityType, () => Promise<void>> = {
      Project: () => this.executeProjectAction(api, actionType, entityId, data),
      Task: () => this.executeTaskAction(api, actionType, entityId, data),
      TimeEntry: () =>
        this.executeTimeEntryAction(api, actionType, entityId, data),
      DayOverride: () =>
        this.executeDayOverrideAction(api, actionType, data, prev),
      DayType: () => this.executeDayTypeAction(api, actionType, entityId, data),
      MonthConfig: () => Promise.resolve(),
      Tag: () => Promise.resolve(),
    };

    await handlers[entityType]();
  }

  private async executeProjectAction(
    api: typeof window.electronAPI,
    actionType: ActionType,
    entityId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    if (actionType === 'create') {
      await api.createProject(
        data['name'] as string,
        data['description'] as string,
      );
    } else if (actionType === 'update') {
      await api.updateProject(
        entityId,
        data['name'] as string,
        data['description'] as string,
      );
    } else if (actionType === 'delete') {
      await api.deleteProject(entityId);
    }
  }

  private async executeTaskAction(
    api: typeof window.electronAPI,
    actionType: ActionType,
    entityId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    if (actionType === 'create') {
      await api.createTask(
        data['projectId'] as string,
        data['name'] as string,
        data['description'] as string,
        data['estimatedHours'] as number,
        data['statusId'] as string,
        data['tagIds'] as string[],
      );
    } else if (actionType === 'update') {
      await api.updateTask(
        entityId,
        data as Partial<{ name: string; description: string }>,
      );
    } else if (actionType === 'delete') {
      await api.deleteTask(entityId);
    }
  }

  private async executeTimeEntryAction(
    api: typeof window.electronAPI,
    actionType: ActionType,
    entityId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    if (actionType === 'create') {
      await api.createTimeEntry(
        data['date'] as string,
        data['minutes'] as number,
        data['taskId'] as string,
        data['notes'] as string,
      );
    } else if (actionType === 'update') {
      await api.updateTimeEntry(
        entityId,
        data as Partial<{ date: string; minutes: number }>,
      );
    } else if (actionType === 'delete') {
      await api.deleteTimeEntry(entityId);
    }
  }

  private async executeDayOverrideAction(
    api: typeof window.electronAPI,
    actionType: ActionType,
    data: Record<string, unknown>,
    prev: Record<string, unknown>,
  ): Promise<void> {
    if (actionType === 'create' || actionType === 'update') {
      await api.upsertDayOverride(
        data['date'] as string,
        data['dayTypeId'] as string,
        data['minutes'] as number,
        data['note'] as string,
      );
    } else if (actionType === 'delete') {
      await api.deleteDayOverride(prev['date'] as string);
    }
  }

  private async executeDayTypeAction(
    api: typeof window.electronAPI,
    actionType: ActionType,
    entityId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    if (actionType === 'create') {
      await api.createDayType(
        data['name'] as string,
        data['color'] as string,
        data['defaultMinutes'] as number,
      );
    } else if (actionType === 'update') {
      await api.updateDayType(
        entityId,
        data as Partial<{ name: string; color: string }>,
      );
    } else if (actionType === 'delete') {
      await api.deleteDayType(entityId);
    }
  }

  /**
   * Undoes an action based on entity type and action type
   */
  private async undoAction(
    entityType: EntityType,
    actionType: ActionType,
    entityId: string,
    previousData: unknown,
    newData: unknown,
  ): Promise<void> {
    if (typeof window === 'undefined' || !window.electronAPI) return;

    const api = window.electronAPI;
    const prev = previousData as Record<string, unknown>;
    const data = newData as Record<string, unknown>;

    const handlers: Record<EntityType, () => Promise<void>> = {
      Project: () => this.undoProjectAction(api, actionType, entityId, prev),
      Task: () => this.undoTaskAction(api, actionType, entityId, prev),
      TimeEntry: () =>
        this.undoTimeEntryAction(api, actionType, entityId, prev),
      DayOverride: () =>
        this.undoDayOverrideAction(api, actionType, prev, data),
      DayType: () => this.undoDayTypeAction(api, actionType, entityId, prev),
      MonthConfig: () => Promise.resolve(),
      Tag: () => Promise.resolve(),
    };

    await handlers[entityType]();
  }

  private async undoProjectAction(
    api: typeof window.electronAPI,
    actionType: ActionType,
    entityId: string,
    prev: Record<string, unknown>,
  ): Promise<void> {
    if (actionType === 'create') {
      await api.deleteProject(entityId);
    } else if (actionType === 'update') {
      await api.updateProject(
        entityId,
        prev['name'] as string,
        prev['description'] as string,
      );
    } else if (actionType === 'delete') {
      await api.createProject(
        prev['name'] as string,
        prev['description'] as string,
      );
    }
  }

  private async undoTaskAction(
    api: typeof window.electronAPI,
    actionType: ActionType,
    entityId: string,
    prev: Record<string, unknown>,
  ): Promise<void> {
    if (actionType === 'create') {
      await api.deleteTask(entityId);
    } else if (actionType === 'update') {
      await api.updateTask(
        entityId,
        prev as Partial<{ name: string; description: string }>,
      );
    } else if (actionType === 'delete') {
      await api.createTask(
        prev['projectId'] as string,
        prev['name'] as string,
        prev['description'] as string,
        prev['estimatedHours'] as number,
        prev['statusId'] as string,
        prev['tagIds'] as string[],
      );
    }
  }

  private async undoTimeEntryAction(
    api: typeof window.electronAPI,
    actionType: ActionType,
    entityId: string,
    prev: Record<string, unknown>,
  ): Promise<void> {
    if (actionType === 'create') {
      await api.deleteTimeEntry(entityId);
    } else if (actionType === 'update') {
      await api.updateTimeEntry(
        entityId,
        prev as Partial<{ date: string; minutes: number }>,
      );
    } else if (actionType === 'delete') {
      await api.createTimeEntry(
        prev['date'] as string,
        prev['minutes'] as number,
        prev['taskId'] as string,
        prev['notes'] as string,
      );
    }
  }

  private async undoDayOverrideAction(
    api: typeof window.electronAPI,
    actionType: ActionType,
    prev: Record<string, unknown>,
    data: Record<string, unknown>,
  ): Promise<void> {
    if (actionType === 'create') {
      await api.deleteDayOverride(data['date'] as string);
    } else if (actionType === 'update' || actionType === 'delete') {
      await api.upsertDayOverride(
        prev['date'] as string,
        prev['dayTypeId'] as string,
        prev['minutes'] as number,
        prev['note'] as string,
      );
    }
  }

  private async undoDayTypeAction(
    api: typeof window.electronAPI,
    actionType: ActionType,
    entityId: string,
    prev: Record<string, unknown>,
  ): Promise<void> {
    if (actionType === 'create') {
      await api.deleteDayType(entityId);
    } else if (actionType === 'update') {
      await api.updateDayType(
        entityId,
        prev as Partial<{ name: string; color: string }>,
      );
    } else if (actionType === 'delete') {
      await api.createDayType(
        prev['name'] as string,
        prev['color'] as string,
        prev['defaultMinutes'] as number,
      );
    }
  }

  /**
   * Undoes the last action
   */
  async undo(): Promise<UndoableAction | null> {
    if (!this.canUndo()) {
      return null;
    }

    this.isProcessing.set(true);

    try {
      const currentStack = this.undoStack();
      const action = currentStack[currentStack.length - 1];

      await action.undo();

      // Mark action as undone in database
      if (typeof window !== 'undefined' && window.electronAPI) {
        try {
          await window.electronAPI.markActionUndone(action.id);
        } catch (error) {
          console.error('Failed to mark action as undone in DB:', error);
        }
      }

      this.undoStack.set(currentStack.slice(0, -1));
      this.redoStack.update((stack) => [...stack, action]);

      this.dataChanged.set({
        entityType: action.entityType,
        timestamp: Date.now(),
      });

      return action;
    } finally {
      this.isProcessing.set(false);
    }
  }

  /**
   * Redoes the last undone action
   */
  async redo(): Promise<UndoableAction | null> {
    if (!this.canRedo()) {
      return null;
    }

    this.isProcessing.set(true);

    try {
      const currentStack = this.redoStack();
      const action = currentStack[currentStack.length - 1];

      await action.execute();

      // Mark action as redone in database
      if (typeof window !== 'undefined' && window.electronAPI) {
        try {
          await window.electronAPI.markActionRedone(action.id);
        } catch (error) {
          console.error('Failed to mark action as redone in DB:', error);
        }
      }

      this.redoStack.set(currentStack.slice(0, -1));
      this.undoStack.update((stack) => [...stack, action]);

      this.dataChanged.set({
        entityType: action.entityType,
        timestamp: Date.now(),
      });

      return action;
    } finally {
      this.isProcessing.set(false);
    }
  }

  /**
   * Undoes a specific action by ID (and all actions after it)
   */
  async undoTo(actionId: string): Promise<number> {
    const stack = this.undoStack();
    const index = stack.findIndex((a) => a.id === actionId);

    if (index === -1) {
      return 0;
    }

    let count = 0;
    const actionsToUndo = stack.length - index;

    for (let i = 0; i < actionsToUndo; i++) {
      const result = await this.undo();
      if (result) count++;
    }

    return count;
  }

  /**
   * Clears all history
   */
  clear(): void {
    this.undoStack.set([]);
    this.redoStack.set([]);
  }

  /**
   * Gets icon for action type
   */
  getActionIcon(actionType: ActionType): string {
    switch (actionType) {
      case 'create':
        return 'pi pi-plus';
      case 'update':
        return 'pi pi-pencil';
      case 'delete':
        return 'pi pi-trash';
      default:
        return 'pi pi-circle';
    }
  }

  /**
   * Gets icon for entity type
   */
  getEntityIcon(entityType: EntityType): string {
    switch (entityType) {
      case 'Project':
        return 'pi pi-folder';
      case 'Task':
        return 'pi pi-check-square';
      case 'TimeEntry':
        return 'pi pi-clock';
      case 'DayOverride':
        return 'pi pi-calendar';
      case 'MonthConfig':
        return 'pi pi-cog';
      case 'Tag':
        return 'pi pi-tag';
      default:
        return 'pi pi-circle';
    }
  }
}
