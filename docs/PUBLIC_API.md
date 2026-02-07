# Public API Reference

This document defines the complete public API surface of @ai-infra/core.
Everything listed here is a supported export. Everything not listed is internal.

---

## Import Paths

```typescript
// Recommended: top-level barrel
import { ExecutionPath, classifyRisk, InMemoryTaskQueue } from '@ai-infra/core';

// Alternative: module-level barrels
import { InMemoryVectorStore } from '@ai-infra/core/memory';
import { classifyRisk } from '@ai-infra/core/classifiers';
import { InMemoryTaskQueue } from '@ai-infra/core/queue';
import { PolicyPriority } from '@ai-infra/core/governance';
import { ExecutionPath } from '@ai-infra/core/types';
```

---

## types/ — Type Contracts

### Enums

| Export | Source | Values |
|--------|--------|--------|
| `ExecutionPath` | router.ts | `LOCAL_ONLY`, `CLAUDE_ONLY`, `HYBRID`, `BLOCKED` |
| `UserTier` | router.ts | `FREE`, `PRO`, `ENTERPRISE` |
| `TaskType` | router.ts | `SIMPLE`, `COMPLEX`, `CRITICAL` |
| `TaskContext` | router.ts | `INTERACTIVE`, `BACKGROUND` |
| `SignalSource` | signals.ts | `LOCAL_MODEL`, `LOCAL_DECISION`, `RAG_SYSTEM`, `USER_CONTEXT`, `TASK_ANALYZER`, `BUDGET_TRACKER`, `FEATURE_FLAGS` |
| `LocalSignalKind` | signals.ts | `LOCAL_ALLOWED`, `LOCAL_BLOCKED`, `LOCAL_RECOMMENDATION`, `LOCAL_RISK_LEVEL`, `LOCAL_CONFIDENCE_LOW` |
| `TaskCategory` | local.ts | `CHAT`, `SUMMARIZE`, `ANALYZE`, `EXECUTE`, `UNKNOWN` |
| `Intent` | local.ts | `QUESTION`, `COMMAND`, `DEBUG`, `PLANNING`, `CASUAL` |
| `RiskLevel` | local.ts | `LOW`, `MEDIUM`, `HIGH` |
| `RecommendedPath` | local.ts | `LOCAL`, `CLAUDE`, `HYBRID` |
| `GateVerdict` | local.ts | `BLOCKED`, `LOCAL_ONLY`, `ESCALATE` |
| `Tier` | local.ts | `ALPHA`, `PRO`, `ENTERPRISE` |
| `TaskStatus` | task.ts | `PENDING`, `RUNNING`, `DONE`, `FAILED` |
| `ExecutionStatus` | task.ts | `COMPLETED`, `ESCALATED` |

### Interfaces

| Export | Source | Purpose |
|--------|--------|---------|
| `CostExpectation` | router.ts | Token and cost estimates for a routing decision |
| `RouterInput` | router.ts | All context needed to make a routing decision |
| `RouterDecision` | router.ts | Complete routing decision with path, cost, hints |
| `BaseSignal` | signals.ts | Common fields for all signal types |
| `ConfidenceSignal` | signals.ts | Local model confidence signal |
| `RAGSignal` | signals.ts | RAG availability and relevance signal |
| `BudgetSignal` | signals.ts | Budget remaining signal |
| `TaskSignal` | signals.ts | Task complexity and token estimate signal |
| `LocalAllowedSignal` | signals.ts | Local decision: allowed |
| `LocalBlockedSignal` | signals.ts | Local decision: blocked with reason |
| `LocalRecommendationSignal` | signals.ts | Local decision: path recommendation |
| `LocalRiskLevelSignal` | signals.ts | Local decision: risk assessment |
| `LocalConfidenceLowSignal` | signals.ts | Local decision: low confidence flag |
| `SignalValidator` | signals.ts | Interface for signal validation |
| `ValidationResult` | signals.ts | Validation outcome |
| `ValidationError` | signals.ts | Individual validation error |
| `TierCapabilities` | local.ts | What a user tier is allowed to do |
| `LocalDecisionInput` | local.ts | Input to the local decision engine |
| `LocalDecision` | local.ts | Output of the local decision engine |
| `TaskClassification` | local.ts | Result of task category classification |
| `IntentClassification` | local.ts | Result of intent classification |
| `RiskClassification` | local.ts | Result of risk classification |
| `GateResult` | local.ts | Result of gate evaluation |
| `LocalExecutionOutput` | task.ts | Output from local model execution |
| `ExecutionResult` | task.ts | Complete execution result |
| `AgentTask` | task.ts | Task lifecycle record |

### Union Types

| Export | Source | Composed of |
|--------|--------|-------------|
| `LocalDecisionSignal` | signals.ts | All `Local*Signal` types |
| `Signal` | signals.ts | All signal types |

### Constants

| Export | Source | Purpose |
|--------|--------|---------|
| `SIGNAL_THRESHOLDS` | signals.ts | Numeric thresholds for confidence, budget, RAG relevance |

---

## classifiers/ — Deterministic Classification

| Export | Kind | Signature |
|--------|------|-----------|
| `classifyRisk` | Function | `(text: string) => RiskClassification` |

Deterministic. No model calls. No side effects. Same input always produces same output.

---

## governance/ — Policy and Audit Interfaces

### Enums

| Export | Source | Values |
|--------|--------|--------|
| `PolicyPriority` | policy.ts | `BUDGET` (1), `RISK` (2), `TIER` (3), `TIME` (4), `FEATURE_FLAG` (5) |

### Interfaces

| Export | Source | Purpose |
|--------|--------|---------|
| `PolicyResult` | policy.ts | Whether a policy matched and what path to take |
| `Policy` | policy.ts | Contract for implementing a routing policy |
| `PolicyRuleDefinition` | policy.ts | Static rule metadata |
| `PolicyRegistry` | policy.ts | Contract for managing policies |
| `AuditEvent` | governance.ts | Audit trail for a routing decision |
| `AuditOutcome` | governance.ts | Execution outcome for audit |
| `CostMetric` | governance.ts | Cost tracking record |
| `RouterMetrics` | governance.ts | Aggregated routing metrics |
| `GovernanceHooks` | governance.ts | Lifecycle hooks for governance |
| `GovernanceRegistry` | governance.ts | Contract for governance management |

### Constants

| Export | Source | Purpose |
|--------|--------|---------|
| `RULE_IDS` | policy.ts | Canonical policy rule identifiers |

### Types

| Export | Source | Purpose |
|--------|--------|---------|
| `RuleId` | policy.ts | Union type of all rule ID strings |

---

## memory/ — RAG Infrastructure

### Enums

| Export | Source |
|--------|--------|
| `MemoryScope` | types.ts |

### Interfaces and Types

| Export | Source | Purpose |
|--------|--------|---------|
| `Embedding` | types.ts | Vector embedding array type |
| `VectorRecord` | types.ts | Stored vector with metadata |
| `VectorMetadata` | types.ts | Metadata attached to vectors |
| `RetrievalResult` | types.ts | Ranked retrieval result |
| `Embedder` | types.ts | Function type for generating embeddings |
| `RetrievalQuery` | types.ts | Query parameters for retrieval |
| `IndexerInput` | types.ts | Input for the indexer |
| `VectorStore` | vectorStore.ts | Interface for vector storage backends |
| `SimilarityQuery` | vectorStore.ts | Cosine similarity query parameters |
| `SimilarityResult` | vectorStore.ts | Similarity search result |
| `RagIndexer` | ragIndexer.ts | Interface for RAG indexing |
| `IndexBatchResult` | ragIndexer.ts | Batch indexing result |
| `RagRetriever` | ragRetriever.ts | Interface for RAG retrieval |

### Classes

| Export | Source | Purpose |
|--------|--------|---------|
| `InMemoryVectorStore` | vectorStore.ts | In-memory cosine similarity vector store |
| `DefaultRagIndexer` | ragIndexer.ts | Reference indexer (requires consumer-provided `Embedder`) |
| `DefaultRagRetriever` | ragRetriever.ts | Reference retriever (requires consumer-provided `Embedder`) |
| `IndexerError` | ragIndexer.ts | Error class for indexing failures |
| `RetrieverError` | ragRetriever.ts | Error class for retrieval failures |

---

## queue/ — Task Lifecycle

### Interfaces

| Export | Source | Purpose |
|--------|--------|---------|
| `TaskQueue` | taskQueue.ts | Interface for task queue implementations |
| `TaskStore` | taskStore.ts | Interface for task persistence |
| `StoredTask` | taskStore.ts | Persisted task record shape |
| `TaskQueryService` | taskQueryService.ts | Read-only task query interface |

### Classes

| Export | Source | Purpose |
|--------|--------|---------|
| `InMemoryTaskQueue` | taskQueue.ts | FIFO queue with status transitions |
| `InMemoryTaskStore` | taskStore.ts | In-memory task persistence |
| `DefaultTaskQueryService` | taskQueryService.ts | Query facade over TaskStore |
| `TaskNotFoundError` | taskQueryService.ts | Error class for missing tasks |

---

## Internal (Not Part of Public API)

The following are implementation details and should not be relied upon:

- Internal regex patterns in `riskClassifier.ts` (`HIGH_RISK_TRIGGERS`, `MEDIUM_RISK_TRIGGERS`)
- Internal scoring function `computeRiskScore`
- Internal threshold constants `HIGH_THRESHOLD`, `MEDIUM_THRESHOLD`
- Private class fields and methods in all classes

These may change without notice in any release.
