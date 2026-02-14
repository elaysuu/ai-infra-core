import { TaskStatus } from '../types/task.js';
import type { TaskStore, StoredTask } from './taskStore.js';

// ============================================================================
// QUERY ERRORS
// ============================================================================

export class TaskNotFoundError extends Error {
  readonly taskId: string;

  constructor(taskId: string) {
    super(`Task not found: ${taskId}`);
    this.name = 'TaskNotFoundError';
    this.taskId = taskId;
  }
}

// ============================================================================
// QUERY SERVICE INTERFACE
// ============================================================================

export interface TaskQueryService {
  getTaskById(taskId: string): StoredTask;
  listTasksByUser(userId: string): readonly StoredTask[];
  listTasksByStatus(status: TaskStatus): readonly StoredTask[];
}

// ============================================================================
// IMPLEMENTATION
// ============================================================================

export class DefaultTaskQueryService implements TaskQueryService {
  private readonly store: TaskStore;

  constructor(store: TaskStore) {
    this.store = store;
  }

  getTaskById(taskId: string): StoredTask {
    const task = this.store.load(taskId);
    if (task === null) {
      throw new TaskNotFoundError(taskId);
    }
    return task;
  }

  listTasksByUser(userId: string): readonly StoredTask[] {
    return this.store.listByUser(userId);
  }

  listTasksByStatus(status: TaskStatus): readonly StoredTask[] {
    return this.store.listByStatus(status);
  }
}
