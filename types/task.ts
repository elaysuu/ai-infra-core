import { ExecutionPath } from './router';

// ============================================================================
// TASK STATUS
// ============================================================================

export enum TaskStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  DONE = 'DONE',
  FAILED = 'FAILED',
}

// ============================================================================
// EXECUTION STATUS
// ============================================================================

export enum ExecutionStatus {
  COMPLETED = 'COMPLETED',
  ESCALATED = 'ESCALATED',
}

// ============================================================================
// LOCAL EXECUTION OUTPUT
// ============================================================================

export interface LocalExecutionOutput {
  readonly response: string;
  readonly fromModel: string;
  readonly tokenCount: number;
}

// ============================================================================
// EXECUTION RESULT
// ============================================================================

export interface ExecutionResult {
  readonly status: ExecutionStatus;
  readonly path: ExecutionPath;
  readonly ruleId: string;
  readonly output: LocalExecutionOutput | null;
}

// ============================================================================
// AGENT TASK
// ============================================================================

export interface AgentTask {
  readonly id: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly createdAt: number;
  status: TaskStatus;
  result: ExecutionResult | null;
  failureReason: string | null;
}
