/**
 * BizMate AI Local Decision Engine — Core Types
 */

// ============================================================================
// TASK CATEGORY
// ============================================================================

export enum TaskCategory {
  CHAT = 'CHAT',
  SUMMARIZE = 'SUMMARIZE',
  ANALYZE = 'ANALYZE',
  EXECUTE = 'EXECUTE',
  UNKNOWN = 'UNKNOWN',
}

// ============================================================================
// INTENT
// ============================================================================

export enum Intent {
  QUESTION = 'QUESTION',
  COMMAND = 'COMMAND',
  DEBUG = 'DEBUG',
  PLANNING = 'PLANNING',
  CASUAL = 'CASUAL',
}

// ============================================================================
// RISK LEVEL
// ============================================================================

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

// ============================================================================
// RECOMMENDED PATH
// ============================================================================

export enum RecommendedPath {
  LOCAL = 'LOCAL',
  CLAUDE = 'CLAUDE',
  HYBRID = 'HYBRID',
}

// ============================================================================
// GATE VERDICT
// ============================================================================

export enum GateVerdict {
  BLOCKED = 'BLOCKED',
  LOCAL_ONLY = 'LOCAL_ONLY',
  ESCALATE = 'ESCALATE',
}

// ============================================================================
// USER TIER
// ============================================================================

export enum Tier {
  ALPHA = 'ALPHA',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

// ============================================================================
// TIER CAPABILITY MAP
// ============================================================================

export interface TierCapabilities {
  readonly allowClaude: boolean;
  readonly allowHybrid: boolean;
  readonly allowExecute: boolean;
  readonly allowAnalyze: boolean;
  readonly maxTokenBudget: number;
  readonly maxRequestsPerHour: number;
}

// ============================================================================
// LOCAL DECISION INPUT
// ============================================================================

export interface LocalDecisionInput {
  readonly text: string;
  readonly userId: string;
  readonly tier: Tier;
  readonly budgetRemainingPercent: number;
  readonly requestsUsedThisHour: number;
  readonly timestamp: number;
}

// ============================================================================
// LOCAL DECISION OUTPUT
// ============================================================================

export interface LocalDecision {
  readonly allowed: boolean;
  readonly reason: string;
  readonly recommendedPath: RecommendedPath;
  readonly flags: string[];
}

// ============================================================================
// CLASSIFIER RESULT TYPES
// ============================================================================

export interface TaskClassification {
  readonly category: TaskCategory;
  readonly confidence: number;
  readonly matchedPatterns: string[];
}

export interface IntentClassification {
  readonly intent: Intent;
  readonly confidence: number;
  readonly matchedPatterns: string[];
}

export interface RiskClassification {
  readonly level: RiskLevel;
  readonly triggers: string[];
  readonly score: number;
}

export interface GateResult {
  readonly verdict: GateVerdict;
  readonly reason: string;
}
