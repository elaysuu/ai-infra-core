/**
 * BizMate AI Router - Signal Definitions
 *
 * This file defines signal types and validation interfaces.
 * NO signal generation logic - types and interfaces only.
 */

// ============================================================================
// SIGNAL SOURCE
// ============================================================================

export enum SignalSource {
  LOCAL_MODEL = 'LOCAL_MODEL',
  LOCAL_DECISION = 'LOCAL_DECISION',
  RAG_SYSTEM = 'RAG_SYSTEM',
  USER_CONTEXT = 'USER_CONTEXT',
  TASK_ANALYZER = 'TASK_ANALYZER',
  BUDGET_TRACKER = 'BUDGET_TRACKER',
  FEATURE_FLAGS = 'FEATURE_FLAGS',
}

// ============================================================================
// BASE SIGNAL
// ============================================================================

export interface BaseSignal {
  readonly source: SignalSource;
  readonly timestamp: number;
  readonly reliable: boolean;
}

// ============================================================================
// CONFIDENCE SIGNAL
// ============================================================================

export interface ConfidenceSignal extends BaseSignal {
  readonly source: SignalSource.LOCAL_MODEL;
  readonly confidence: number;  // 0.0 to 1.0
  readonly modelId: string;
}

// ============================================================================
// RAG SIGNAL
// ============================================================================

export interface RAGSignal extends BaseSignal {
  readonly source: SignalSource.RAG_SYSTEM;
  readonly available: boolean;
  readonly relevanceScore: number;  // 0.0 to 1.0
  readonly documentsFound: number;
}

// ============================================================================
// BUDGET SIGNAL
// ============================================================================

export interface BudgetSignal extends BaseSignal {
  readonly source: SignalSource.BUDGET_TRACKER;
  readonly remainingPercent: number;  // 0 to 100
  readonly periodResetAt: number;     // Unix timestamp
}

// ============================================================================
// TASK SIGNAL
// ============================================================================

export interface TaskSignal extends BaseSignal {
  readonly source: SignalSource.TASK_ANALYZER;
  readonly complexity: 'SIMPLE' | 'COMPLEX' | 'CRITICAL';
  readonly requiredTools: string[];
  readonly estimatedTokens: number;
}

// ============================================================================
// LOCAL DECISION SIGNAL KIND
// ============================================================================

export enum LocalSignalKind {
  LOCAL_ALLOWED = 'LOCAL_ALLOWED',
  LOCAL_BLOCKED = 'LOCAL_BLOCKED',
  LOCAL_RECOMMENDATION = 'LOCAL_RECOMMENDATION',
  LOCAL_RISK_LEVEL = 'LOCAL_RISK_LEVEL',
  LOCAL_CONFIDENCE_LOW = 'LOCAL_CONFIDENCE_LOW',
}

// ============================================================================
// LOCAL DECISION SIGNALS
// ============================================================================

export interface LocalAllowedSignal extends BaseSignal {
  readonly source: SignalSource.LOCAL_DECISION;
  readonly kind: LocalSignalKind.LOCAL_ALLOWED;
  readonly allowed: true;
}

export interface LocalBlockedSignal extends BaseSignal {
  readonly source: SignalSource.LOCAL_DECISION;
  readonly kind: LocalSignalKind.LOCAL_BLOCKED;
  readonly allowed: false;
  readonly reason: string;
}

export interface LocalRecommendationSignal extends BaseSignal {
  readonly source: SignalSource.LOCAL_DECISION;
  readonly kind: LocalSignalKind.LOCAL_RECOMMENDATION;
  readonly recommendation: 'LOCAL' | 'CLAUDE' | 'HYBRID';
}

export interface LocalRiskLevelSignal extends BaseSignal {
  readonly source: SignalSource.LOCAL_DECISION;
  readonly kind: LocalSignalKind.LOCAL_RISK_LEVEL;
  readonly riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly triggers: readonly string[];
}

export interface LocalConfidenceLowSignal extends BaseSignal {
  readonly source: SignalSource.LOCAL_DECISION;
  readonly kind: LocalSignalKind.LOCAL_CONFIDENCE_LOW;
  readonly lowConfidence: true;
}

export type LocalDecisionSignal =
  | LocalAllowedSignal
  | LocalBlockedSignal
  | LocalRecommendationSignal
  | LocalRiskLevelSignal
  | LocalConfidenceLowSignal;

// ============================================================================
// UNION TYPE
// ============================================================================

export type Signal =
  | ConfidenceSignal
  | RAGSignal
  | BudgetSignal
  | TaskSignal
  | LocalDecisionSignal;

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

export interface SignalValidator {
  /**
   * Validate a signal's structure and value ranges.
   */
  validate(signal: Signal): ValidationResult;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: ReadonlyArray<ValidationError>;
}

export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly value: unknown;
}

// ============================================================================
// SIGNAL THRESHOLDS
// ============================================================================

export const SIGNAL_THRESHOLDS = {
  HIGH_CONFIDENCE: 0.85,
  MEDIUM_CONFIDENCE: 0.60,
  LOW_CONFIDENCE: 0.40,
  BUDGET_WARNING: 20,
  BUDGET_CRITICAL: 5,
  RAG_RELEVANCE_MIN: 0.50,
} as const;
