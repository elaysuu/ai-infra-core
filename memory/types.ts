// ============================================================================
// MEMORY SCOPE
// ============================================================================

export enum MemoryScope {
  USER = 'USER',
  AGENT = 'AGENT',
  BUSINESS = 'BUSINESS',
}

// ============================================================================
// EMBEDDING
// ============================================================================

export type Embedding = readonly number[];

// ============================================================================
// VECTOR RECORD
// ============================================================================

export interface VectorRecord {
  readonly id: string;
  readonly embedding: Embedding;
  readonly text: string;
  readonly scope: MemoryScope;
  readonly metadata: VectorMetadata;
  readonly createdAt: number;
}

export interface VectorMetadata {
  readonly userId: string;
  readonly agentId: string | null;
  readonly source: string;
  readonly [key: string]: unknown;
}

// ============================================================================
// RETRIEVAL RESULT
// ============================================================================

export interface RetrievalResult {
  readonly id: string;
  readonly text: string;
  readonly score: number;
  readonly scope: MemoryScope;
  readonly metadata: VectorMetadata;
}

// ============================================================================
// EMBEDDER CONTRACT
// ============================================================================

export interface Embedder {
  embed(text: string): Embedding;
  dimensions(): number;
}

// ============================================================================
// RETRIEVAL QUERY
// ============================================================================

export interface RetrievalQuery {
  readonly queryText: string;
  readonly userId: string;
  readonly agentId: string | null;
  readonly scopes: readonly MemoryScope[];
  readonly limit: number;
}

// ============================================================================
// INDEXER INPUT
// ============================================================================

export interface IndexerInput {
  readonly id: string;
  readonly summarizedText: string;
  readonly scope: MemoryScope;
  readonly metadata: VectorMetadata;
}
