/**
 * BizMate AI Local Decision Engine — Risk Classifier
 *
 * Classifies: LOW | MEDIUM | HIGH
 * Based on keywords, action verbs, system access patterns.
 * Deterministic. No LLM calls.
 */

import { RiskLevel, type RiskClassification } from '../types/local.js';

// ============================================================================
// RISK TRIGGER DEFINITIONS
// ============================================================================

interface RiskTrigger {
  readonly pattern: RegExp;
  readonly label: string;
  readonly score: number;
}

/**
 * HIGH risk triggers (score >= 0.7 each)
 * Actions that can cause data loss, security breach, or system instability.
 */
const HIGH_RISK_TRIGGERS: ReadonlyArray<RiskTrigger> = [
  // Data destruction
  { pattern: /\b(delete\s+all|drop\s+table|truncate|wipe|purge|destroy)\b/i, label: 'data_destruction', score: 0.9 },
  { pattern: /\b(rm\s+-rf|format|erase)\b/i, label: 'filesystem_destruction', score: 0.9 },

  // System access
  { pattern: /\b(sudo|root|admin\s+access|superuser|privilege)\b/i, label: 'privilege_escalation', score: 0.8 },
  { pattern: /\b(ssh|shell|terminal|exec|eval|spawn)\b/i, label: 'system_shell', score: 0.7 },

  // Credential / secret handling
  { pattern: /\b(password|secret|token|api[_\s]?key|credential|private[_\s]?key)\b/i, label: 'credential_access', score: 0.8 },
  { pattern: /\b(env\s+var|\.env|environment\s+variable)\b/i, label: 'env_access', score: 0.7 },

  // Database mutation
  { pattern: /\b(migrate|rollback|seed|alter\s+table|drop\s+index)\b/i, label: 'schema_mutation', score: 0.7 },

  // External system interaction
  { pattern: /\b(production|prod\s+server|live\s+server|production\s+database)\b/i, label: 'production_access', score: 0.9 },

  // Financial / billing
  { pattern: /\b(charge|refund|payment|billing|invoice|transaction)\b/i, label: 'financial_action', score: 0.7 },
];

/**
 * MEDIUM risk triggers (score 0.3-0.6 each)
 * Actions that modify state but are recoverable.
 */
const MEDIUM_RISK_TRIGGERS: ReadonlyArray<RiskTrigger> = [
  // State modification
  { pattern: /\b(update|modify|change|edit|patch|overwrite)\b/i, label: 'state_modification', score: 0.4 },
  { pattern: /\b(create|insert|add|register|enroll)\b/i, label: 'state_creation', score: 0.3 },

  // Communication
  { pattern: /\b(send\s+(email|message|notification|sms|alert))\b/i, label: 'outbound_communication', score: 0.5 },
  { pattern: /\b(notify|broadcast|publish|announce)\b/i, label: 'broadcast', score: 0.4 },

  // User management
  { pattern: /\b(invite|remove\s+user|ban|suspend|deactivate\s+user)\b/i, label: 'user_management', score: 0.5 },
  { pattern: /\b(role|permission|access\s+level|grant|revoke)\b/i, label: 'permission_change', score: 0.5 },

  // Configuration
  { pattern: /\b(config|setting|preference|toggle|feature\s+flag)\b/i, label: 'config_change', score: 0.3 },

  // Deployment
  { pattern: /\b(deploy|release|ship|push\s+to)\b/i, label: 'deployment', score: 0.6 },

  // External API
  { pattern: /\b(webhook|callback|external\s+api|third[_\s]?party)\b/i, label: 'external_api', score: 0.4 },
];

// ============================================================================
// SCORING
// ============================================================================

function computeRiskScore(text: string): { score: number; triggers: string[] } {
  const normalized = text.toLowerCase();
  let totalScore = 0;
  const triggers: string[] = [];

  // Evaluate HIGH risk triggers
  for (const trigger of HIGH_RISK_TRIGGERS) {
    if (trigger.pattern.test(normalized)) {
      totalScore += trigger.score;
      triggers.push(trigger.label);
    }
  }

  // Evaluate MEDIUM risk triggers
  for (const trigger of MEDIUM_RISK_TRIGGERS) {
    if (trigger.pattern.test(normalized)) {
      totalScore += trigger.score;
      triggers.push(trigger.label);
    }
  }

  // Amplifier: multiple high-risk triggers compound
  const highTriggerCount = triggers.filter(t =>
    HIGH_RISK_TRIGGERS.some(hr => hr.label === t)
  ).length;

  if (highTriggerCount >= 2) {
    totalScore *= 1.3;
  }

  return { score: totalScore, triggers };
}

// ============================================================================
// THRESHOLDS
// ============================================================================

const HIGH_THRESHOLD = 1.2;
const MEDIUM_THRESHOLD = 0.4;

// ============================================================================
// CLASSIFIER
// ============================================================================

export function classifyRisk(text: string): RiskClassification {
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return {
      level: RiskLevel.LOW,
      triggers: [],
      score: 0,
    };
  }

  const { score, triggers } = computeRiskScore(trimmed);

  let level: RiskLevel;

  if (score >= HIGH_THRESHOLD) {
    level = RiskLevel.HIGH;
  } else if (score >= MEDIUM_THRESHOLD) {
    level = RiskLevel.MEDIUM;
  } else {
    level = RiskLevel.LOW;
  }

  return {
    level,
    triggers,
    score: Math.round(score * 100) / 100,
  };
}
