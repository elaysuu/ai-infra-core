/**
 * BizMate AI Router - Governance Definitions
 *
 * This file defines audit, metrics, and governance hook interfaces.
 * NO logging implementation - types and interfaces only.
 */

import type { RouterInput, RouterDecision, ExecutionPath } from '../types/router.js';

// ============================================================================
// AUDIT EVENT
// ============================================================================

export interface AuditEvent {
  readonly eventId: string;
  readonly timestamp: number;

  // Request context
  readonly userId: string;
  readonly taskId: string;
  readonly requestSource: string;

  // Decision details
  readonly path: ExecutionPath;
  readonly ruleId: string;
  readonly priority: number;

  // Input snapshot (for post-mortem)
  readonly inputSnapshot: RouterInput;

  // Outcome (filled after execution)
  readonly outcome?: AuditOutcome;
}

export interface AuditOutcome {
  readonly success: boolean;
  readonly executionTimeMs: number;
  readonly tokensUsed: number;
  readonly actualCostUSD: number;
  readonly errorCode?: string;
  readonly errorMessage?: string;
}

// ============================================================================
// COST METRIC
// ============================================================================

export interface CostMetric {
  readonly metricId: string;
  readonly timestamp: number;

  // User context
  readonly userId: string;
  readonly userTier: string;

  // Cost details
  readonly estimatedCostUSD: number;
  readonly actualCostUSD: number | null;
  readonly tokensEstimated: number;
  readonly tokensActual: number | null;

  // Path taken
  readonly path: ExecutionPath;
  readonly ruleId: string;
}

// ============================================================================
// AGGREGATED METRICS
// ============================================================================

export interface RouterMetrics {
  // Volume
  readonly totalRequests: number;
  readonly requestsByPath: Record<ExecutionPath, number>;
  readonly requestsByRule: Record<string, number>;

  // Cost
  readonly totalEstimatedCostUSD: number;
  readonly totalActualCostUSD: number;
  readonly costByPath: Record<ExecutionPath, number>;

  // Performance
  readonly avgDecisionTimeMs: number;
  readonly p95DecisionTimeMs: number;
  readonly p99DecisionTimeMs: number;

  // Errors
  readonly blockedRequests: number;
  readonly errorCount: number;

  // Period
  readonly periodStart: number;
  readonly periodEnd: number;
}

// ============================================================================
// GOVERNANCE HOOKS INTERFACE
// ============================================================================

export interface GovernanceHooks {
  /**
   * Called before routing decision is made.
   * Can be used for pre-validation or logging.
   */
  onBeforeRoute(input: RouterInput): void;

  /**
   * Called after routing decision is made.
   * Used for audit logging and metrics collection.
   */
  onAfterRoute(input: RouterInput, decision: RouterDecision): void;

  /**
   * Called when a request is blocked.
   * Used for alerting and compliance tracking.
   */
  onBlocked(input: RouterInput, decision: RouterDecision): void;

  /**
   * Called when execution completes.
   * Used for cost tracking and outcome analysis.
   */
  onExecutionComplete(
    event: AuditEvent,
    outcome: AuditOutcome
  ): void;

  /**
   * Called when an error occurs during routing.
   */
  onError(input: RouterInput, error: Error): void;
}

// ============================================================================
// GOVERNANCE REGISTRY
// ============================================================================

export interface GovernanceRegistry {
  /**
   * Register governance hooks.
   */
  registerHooks(hooks: Partial<GovernanceHooks>): void;

  /**
   * Get current metrics for a time period.
   */
  getMetrics(periodStart: number, periodEnd: number): RouterMetrics;

  /**
   * Get audit events for a user.
   */
  getAuditEvents(userId: string, limit: number): ReadonlyArray<AuditEvent>;
}
