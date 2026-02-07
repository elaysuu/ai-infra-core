# @ai-infra/core

Type-safe infrastructure for multi-model AI orchestration.

Contracts, deterministic classifiers, in-memory data structures, and governance
interfaces for systems that route tasks between local and remote AI models.

Zero runtime dependencies. Zero AI provider coupling. Zero side effects at import.

---

## The Problem

Applications that orchestrate multiple AI models need shared vocabulary:
routing decisions, task lifecycles, risk classification, policy enforcement,
audit trails, and retrieval-augmented generation. Without a shared contract
layer, this vocabulary gets duplicated across services, diverges silently,
and becomes impossible to govern.

## The Solution

@ai-infra/core provides the shared contract layer as a standalone TypeScript
library. It defines what routing decisions look like, how tasks move through
their lifecycle, what risk levels mean, and how governance hooks are structured —
without knowing which models exist, which application consumes it, or where
it runs.

Consumer applications implement the execution. This library defines the language.

---

## Modules

| Module | What it provides |
|--------|-----------------|
| **types/** | Canonical vocabulary: execution paths, user tiers, task types, signals, local decision types, task status and lifecycle |
| **classifiers/** | Deterministic risk classifier — regex-based scoring, no model calls, fully reproducible |
| **governance/** | Policy evaluation interfaces, audit event shapes, cost metrics, governance lifecycle hooks |
| **memory/** | Embedder-agnostic RAG: in-memory vector store with cosine similarity, batch indexer, ranked retriever |
| **queue/** | Task queue (FIFO with status transitions), task store (CRUD), read-only query service |

## Quick Start

```typescript
import {
  classifyRisk,
  RiskLevel,
  InMemoryTaskQueue,
  TaskStatus,
  InMemoryVectorStore,
  DefaultRagIndexer,
  DefaultRagRetriever,
} from '@ai-infra/core';
```

### Classify Risk (Deterministic)

```typescript
const result = classifyRisk('delete all user records from production database');

result.level;     // RiskLevel.HIGH
result.triggers;  // ['data_destruction', 'production_access']
result.score;     // 2.34
```

No model calls. No randomness. Same input always produces the same output.

### Manage Task Lifecycle

```typescript
const queue = new InMemoryTaskQueue();

queue.enqueue({
  id: 'task-001',
  payload: { userId: 'u-42', text: 'summarize quarterly report' },
  createdAt: Date.now(),
  status: TaskStatus.PENDING,
  result: null,
  failureReason: null,
});

const task = queue.dequeue();
// task.status is now TaskStatus.RUNNING

queue.markDone('task-001');
// task.status is now TaskStatus.DONE
```

### RAG: Index and Retrieve

```typescript
// You provide the embedder — any function that returns vectors
const embedder = async (texts: string[]) => { /* your implementation */ };

const store = new InMemoryVectorStore();
const indexer = new DefaultRagIndexer(store, embedder);
const retriever = new DefaultRagRetriever(store, embedder);

// Index documents
await indexer.index([
  { id: 'doc-1', content: 'Revenue grew 12% in Q3...', metadata: {} },
]);

// Retrieve by semantic similarity
const results = await retriever.retrieve({ text: 'quarterly growth', topK: 5 });
```

### Define Governance Policies

```typescript
import type { Policy, PolicyResult } from '@ai-infra/core';
import { PolicyPriority, ExecutionPath, RULE_IDS } from '@ai-infra/core';

const budgetPolicy: Policy = {
  id: 'budget-block',
  priority: PolicyPriority.BUDGET,
  name: 'Budget Exhaustion Block',
  description: 'Block requests when budget falls below 5%',
  evaluate(input): PolicyResult {
    if (input.budgetRemainingPercent < 5) {
      return { matched: true, path: ExecutionPath.BLOCKED, ruleId: RULE_IDS.BLOCK_BUDGET, reason: 'Budget exhausted' };
    }
    return { matched: false, path: null, ruleId: RULE_IDS.BLOCK_BUDGET, reason: '' };
  },
};
```

---

## Architecture

```
┌──────────────┐
│   types/     │  Root. Pure types. No logic. No imports.
└──────┬───────┘
       │ imported by
       ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ classifiers/ │  │ governance/  │  │    queue/     │  │   memory/    │
│              │  │              │  │              │  │              │
│ types/local  │  │ types/router │  │ types/task   │  │ (own types)  │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

- No circular dependencies.
- `types/` is the root. All modules depend downward into it.
- `memory/` is fully self-contained with its own internal type definitions.
- No module depends on another non-types module.

## Design Principles

1. **Zero provider coupling.** No AI SDK appears anywhere. The library describes
   `ExecutionPath.CLAUDE_ONLY` as a routing decision — it does not import or
   depend on any Claude SDK. The same applies to all providers.

2. **Contracts over implementations.** Governance and policy modules define
   interfaces. Queue and memory modules provide in-memory reference
   implementations. Consumers swap in persistent backends as needed.

3. **Deterministic where possible.** The risk classifier uses regex patterns
   and arithmetic. No randomness. No inference. Fully testable.

4. **Generic payloads.** `AgentTask.payload` is `Record<string, unknown>`.
   The library does not know what tasks contain. Consumer applications
   add domain meaning.

5. **No side effects at import.** Importing any module triggers no network
   calls, no file reads, no process spawning. All state is created explicitly.

6. **Strict TypeScript.** Compiled with `strict: true`. Readonly interfaces
   where mutation is not required. Enums for closed sets. Discriminated
   unions for signal types.

## Explicit Non-Goals

This library does not and will not:

- Run an HTTP server or manage network connections
- Wrap any AI model SDK (Claude, OpenAI, Ollama, or otherwise)
- Execute tasks, poll queues, or run agent loops
- Read environment variables, configuration files, or secrets
- Access databases, filesystems, or external storage

These are the consumer application's responsibility.

---

## Installation

```bash
# As a local file dependency
npm install file:/path/to/ai-infra

# As a registry package (when published)
npm install @ai-infra/core
```

## Verification

```bash
npx tsc --noEmit   # Must pass with zero errors
```

## Documentation

| Document | Purpose |
|----------|---------|
| `docs/ARCHITECTURE.md` | Module dependency graph, design decisions, boundary rules |
| `docs/PUBLIC_API.md` | Complete public API surface with every export listed |

## Requirements

- TypeScript >= 5.4
- Node.js >= 18 (ES2022 target)
- Zero runtime dependencies

## Version

**0.1.0** — Initial release. All modules present. Standalone compilation verified.
