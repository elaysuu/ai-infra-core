import { TaskStatus, type AgentTask } from '../types/task.js';

// ============================================================================
// TASK QUEUE INTERFACE
// ============================================================================

export interface TaskQueue {
  enqueue(task: AgentTask): void;
  dequeue(): AgentTask | null;
  markDone(taskId: string): void;
  markFailed(taskId: string, reason: string): void;
  get(taskId: string): AgentTask | null;
  size(): number;
}

// ============================================================================
// IN-MEMORY IMPLEMENTATION
// ============================================================================

export class InMemoryTaskQueue implements TaskQueue {
  private readonly tasks: Map<string, AgentTask> = new Map();
  private readonly pending: string[] = [];

  enqueue(task: AgentTask): void {
    this.tasks.set(task.id, task);
    this.pending.push(task.id);
  }

  dequeue(): AgentTask | null {
    while (this.pending.length > 0) {
      const id = this.pending.shift()!;
      const task = this.tasks.get(id);
      if (task !== undefined && task.status === TaskStatus.PENDING) {
        task.status = TaskStatus.RUNNING;
        return task;
      }
    }
    return null;
  }

  markDone(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task !== undefined) {
      task.status = TaskStatus.DONE;
    }
  }

  markFailed(taskId: string, reason: string): void {
    const task = this.tasks.get(taskId);
    if (task !== undefined) {
      task.status = TaskStatus.FAILED;
      task.failureReason = reason;
    }
  }

  get(taskId: string): AgentTask | null {
    return this.tasks.get(taskId) ?? null;
  }

  size(): number {
    return this.pending.length;
  }
}
