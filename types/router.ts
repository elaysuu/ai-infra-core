/**
 * BizMate AI Router - Core Type Definitions
 *
 * This file defines the fundamental types for the AI routing system.
 * NO implementation logic - types and interfaces only.
 */

// ============================================================================
// EXECUTION PATH
// ============================================================================

export enum ExecutionPath {
  LOCAL_ONLY = 'LOCAL_ONLY',
  CLAUDE_ONLY = 'CLAUDE_ONLY',
  HYBRID = 'HYBRID',
  BLOCKED = 'BLOCKED',
}

// ============================================================================
// USER TIER
// ============================================================================

export enum UserTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

// ============================================================================
// TASK CLASSIFICATION
// ============================================================================

export enum TaskType {
  SIMPLE = 'SIMPLE',
  COMPLEX = 'COMPLEX',
  CRITICAL = 'CRITICAL',
}

export enum TaskContext {
  INTERACTIVE = 'INTERACTIVE',
  BACKGROUND = 'BACKGROUND',
}

// ============================================================================
// COST EXPECTATION
// ============================================================================

export interface CostExpectation {
  readonly minTokens: number;
  readonly maxTokens: number;
  readonly estimatedCostUSD: number;
}

// ============================================================================
// ROUTER INPUT
// ============================================================================

export interface RouterInput {
  // User context
  readonly userId: string;
  readonly userTier: UserTier;
  readonly budgetRemainingPercent: number;

  // Task context
  readonly taskType: TaskType;
  readonly taskContext: TaskContext;
  readonly taskId: string;

  // Signal inputs
  readonly localModelConfidence: number;
  readonly ragAvailable: boolean;
  readonly toolsRequired: string[];

  // Feature flags
  readonly forceEscalation: boolean;
  readonly featureFlags: Record<string, boolean>;

  // Metadata
  readonly timestamp: number;
  readonly requestSource: string;
}

// ============================================================================
// ROUTER DECISION
// ============================================================================

export interface RouterDecision {
  // Core decision
  readonly path: ExecutionPath;
  readonly ruleId: string;
  readonly priority: number;

  // Cost estimation
  readonly costExpectation: CostExpectation;

  // Execution hints
  readonly useRAG: boolean;
  readonly toolsAllowed: string[];
  readonly maxRetries: number;
  readonly timeoutMs: number;

  // Governance
  readonly auditRequired: boolean;
  readonly blockReason: string | null;

  // Metadata
  readonly decidedAt: number;
  readonly inputHash: string;
}
