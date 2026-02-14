/**
 * BizMate AI Router - Policy Definitions
 *
 * This file defines policy interfaces and structures for routing decisions.
 * NO evaluation logic - interfaces and type definitions only.
 */

import type { RouterInput, ExecutionPath } from '../types/router.js';

// ============================================================================
// POLICY PRIORITY
// ============================================================================

export enum PolicyPriority {
  BUDGET = 1,    // Highest - cannot be overridden
  RISK = 2,
  TIER = 3,
  TIME = 4,
  FEATURE_FLAG = 5,  // Lowest
}

// ============================================================================
// POLICY RESULT
// ============================================================================

export interface PolicyResult {
  readonly matched: boolean;
  readonly path: ExecutionPath | null;
  readonly ruleId: string;
  readonly reason: string;
}

// ============================================================================
// POLICY INTERFACE
// ============================================================================

export interface Policy {
  readonly id: string;
  readonly priority: PolicyPriority;
  readonly name: string;
  readonly description: string;

  /**
   * Evaluate this policy against the given input.
   * Returns PolicyResult indicating if policy matched and what path to take.
   */
  evaluate(input: RouterInput): PolicyResult;
}

// ============================================================================
// POLICY RULE DEFINITION
// ============================================================================

export interface PolicyRuleDefinition {
  readonly ruleId: string;
  readonly priority: number;
  readonly path: ExecutionPath;
  readonly conditionDescription: string;
}

// ============================================================================
// POLICY REGISTRY
// ============================================================================

export interface PolicyRegistry {
  /**
   * All registered policies, ordered by priority (ascending).
   */
  readonly policies: ReadonlyArray<Policy>;

  /**
   * Get policy by ID.
   */
  getPolicy(id: string): Policy | undefined;

  /**
   * Register a new policy.
   */
  register(policy: Policy): void;

  /**
   * Remove a policy by ID.
   */
  unregister(id: string): void;
}

// ============================================================================
// DEFAULT RULE IDS
// ============================================================================

export const RULE_IDS = {
  BLOCK_BUDGET: 'BLOCK_BUDGET',
  BLOCK_RISK: 'BLOCK_RISK',
  FORCE_CLAUDE: 'FORCE_CLAUDE',
  FORCE_LOCAL: 'FORCE_LOCAL',
  LOCAL_HIGH_CONF: 'LOCAL_HIGH_CONF',
  HYBRID_RAG: 'HYBRID_RAG',
  CLAUDE_TOOLS: 'CLAUDE_TOOLS',
  CLAUDE_COMPLEX: 'CLAUDE_COMPLEX',
  HYBRID_INTERACTIVE: 'HYBRID_INTERACTIVE',
  LOCAL_BACKGROUND: 'LOCAL_BACKGROUND',
  PRO_CLAUDE: 'PRO_CLAUDE',
  ENT_HYBRID: 'ENT_HYBRID',
  DEFAULT_LOCAL: 'DEFAULT_LOCAL',
} as const;

export type RuleId = typeof RULE_IDS[keyof typeof RULE_IDS];
