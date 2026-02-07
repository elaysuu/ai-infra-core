# @ai-infra/core Architecture

## Module Dependency Graph

```
┌──────────────┐
│   types/     │  Root module. Pure types. No logic. No external imports.
│              │
│  router.ts   │  ExecutionPath, UserTier, TaskType, RouterInput, RouterDecision
│  signals.ts  │  Signal types, validation interfaces, thresholds
│  local.ts    │  TaskCategory, Intent, RiskLevel, Tier, classifier results
│  task.ts     │  TaskStatus, AgentTask, ExecutionResult
└──────┬───────┘
       │
       │ imported by
       │
┌──────▼───────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ classifiers/ │  │ governance/  │  │    queue/     │  │   memory/    │
│              │  │              │  │              │  │              │
│ imports:     │  │ imports:     │  │ imports:     │  │ imports:     │
│  types/local │  │  types/router│  │  types/task  │  │  (own types) │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

No circular dependencies exist. No module imports from another non-types module.
The `memory/` module is fully self-contained with its own internal type definitions.

## Design Decisions

### Generic Payloads

`AgentTask.payload` is typed as `Readonly<Record<string, unknown>>`.

This is intentional. The library does not know what tasks contain.
Consumer applications assign domain-specific meaning to the payload.
This prevents coupling between the queue infrastructure and any
particular application's data model.

### Embedder as Interface

The `Embedder` type is a function signature, not a class:

```typescript
type Embedder = (texts: string[]) => Promise<Embedding[]>;
```

Consumers provide their own embedding implementation. This could be
a local model, an API call, or a mock for testing. The library never
makes network calls.

### In-Memory Defaults

`InMemoryTaskQueue`, `InMemoryTaskStore`, and `InMemoryVectorStore` are
reference implementations. They are correct and usable but not persistent.

Consumer applications are expected to implement the corresponding
interfaces (`TaskQueue`, `TaskStore`, `VectorStore`) with their own
persistence backends when durability is required.

### Deterministic Classification

`classifyRisk()` uses regex pattern matching and arithmetic scoring.
No randomness. No model inference. Given the same input, it always
produces the same output. This makes it fully testable and auditable.

## Architecture Lock

The following constraints are permanent and non-negotiable.
Any change that violates them is an architectural defect.

### One-Way Dependency Flow

```
Consumer Application  ──imports──►  @ai-infra/core

@ai-infra/core       ──imports──►  (nothing external)
```

This library is a leaf dependency. It depends on nothing outside its
own source tree. Consumer applications depend on it. The reverse is
forbidden. There is no bidirectional coupling.

### No Runtime Coupling

This library contains no:
- HTTP servers or clients
- WebSocket connections
- Child process spawning
- Worker threads or polling loops
- Timers, intervals, or scheduling
- File system reads or writes
- Database connections
- Environment variable access

All state is created by the consumer through explicit constructors.
Importing any module produces zero side effects.

### No Provider Knowledge

This library references no AI provider by implementation:
- No Claude SDK, Anthropic client, or Claude-specific types
- No OpenAI SDK, GPT types, or completion interfaces
- No Ollama client, local model binaries, or inference APIs
- No embedding service clients (the `Embedder` type is a function
  signature — the consumer provides the implementation)

The enum value `ExecutionPath.CLAUDE_ONLY` is a routing label.
It describes a decision category, not an API call.

## Boundary Rules

1. This library compiles with `tsc --noEmit` and zero errors.
2. This library has zero `dependencies` in package.json.
3. This library imports nothing from outside its own source tree.
4. This library produces no side effects at import time.
5. This library accesses no global state, environment variables, or filesystem.
6. This library contains no reference to any specific consumer application.
7. This library contains no AI provider SDK import or dependency.
