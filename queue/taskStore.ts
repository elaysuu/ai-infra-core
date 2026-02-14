import { TaskStatus, type AgentTask, type ExecutionResult } from '../types/task.js';

// ============================================================================
// STORED TASK RECORD
// ============================================================================

export interface StoredTask {
  readonly id: string;
  readonly payload: AgentTask['payload'];
  readonly createdAt: number;
  readonly status: TaskStatus;
  readonly result: ExecutionResult | null;
  readonly failureReason: string | null;
  readonly updatedAt: number;
}

// ============================================================================
// TASK STORE INTERFACE
// ============================================================================

export interface TaskStore {
  save(task: AgentTask): void;
  load(taskId: string): StoredTask | null;
  updateStatus(taskId: string, status: TaskStatus, updatedAt: number): void;
  updateResult(taskId: string, result: ExecutionResult, updatedAt: number): void;
  updateFailure(taskId: string, reason: string, updatedAt: number): void;
  listByStatus(status: TaskStatus): readonly StoredTask[];
  listByUser(userId: string): readonly StoredTask[];
}

// ============================================================================
// IN-MEMORY IMPLEMENTATION
// ============================================================================

export class InMemoryTaskStore implements TaskStore {
  private readonly store: Map<string, StoredTask> = new Map();

  save(task: AgentTask): void {
    const record: StoredTask = {
      id: task.id,
      payload: task.payload,
      createdAt: task.createdAt,
      status: task.status,
      result: task.result,
      failureReason: task.failureReason,
      updatedAt: task.createdAt,
    };
    this.store.set(task.id, record);
  }

  load(taskId: string): StoredTask | null {
    return this.store.get(taskId) ?? null;
  }

  updateStatus(taskId: string, status: TaskStatus, updatedAt: number): void {
    const existing = this.store.get(taskId);
    if (existing === undefined) {
      return;
    }
    this.store.set(taskId, { ...existing, status, updatedAt });
  }

  updateResult(taskId: string, result: ExecutionResult, updatedAt: number): void {
    const existing = this.store.get(taskId);
    if (existing === undefined) {
      return;
    }
    this.store.set(taskId, {
      ...existing,
      status: TaskStatus.DONE,
      result,
      updatedAt,
    });
  }

  updateFailure(taskId: string, reason: string, updatedAt: number): void {
    const existing = this.store.get(taskId);
    if (existing === undefined) {
      return;
    }
    this.store.set(taskId, {
      ...existing,
      status: TaskStatus.FAILED,
      failureReason: reason,
      updatedAt,
    });
  }

  listByStatus(status: TaskStatus): readonly StoredTask[] {
    const results: StoredTask[] = [];
    for (const task of this.store.values()) {
      if (task.status === status) {
        results.push(task);
      }
    }
    return results;
  }

  listByUser(userId: string): readonly StoredTask[] {
    const results: StoredTask[] = [];
    for (const task of this.store.values()) {
      if (task.payload.userId === userId) {
        results.push(task);
      }
    }
    return results;
  }
}
