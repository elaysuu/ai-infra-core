import type { Embedding, VectorRecord, MemoryScope } from './types';

// ============================================================================
// SIMILARITY QUERY
// ============================================================================

export interface SimilarityQuery {
  readonly embedding: Embedding;
  readonly scopes: readonly MemoryScope[];
  readonly userId: string;
  readonly limit: number;
}

// ============================================================================
// SIMILARITY RESULT
// ============================================================================

export interface SimilarityResult {
  readonly record: VectorRecord;
  readonly score: number;
}

// ============================================================================
// VECTOR STORE INTERFACE
// ============================================================================

export interface VectorStore {
  upsertEmbedding(record: VectorRecord): void;
  querySimilar(query: SimilarityQuery): readonly SimilarityResult[];
  delete(id: string): void;
  count(): number;
}

// ============================================================================
// COSINE SIMILARITY
// ============================================================================

function cosineSimilarity(a: Embedding, b: Embedding): number {
  if (a.length !== b.length || a.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

// ============================================================================
// IN-MEMORY IMPLEMENTATION
// ============================================================================

export class InMemoryVectorStore implements VectorStore {
  private readonly records: Map<string, VectorRecord> = new Map();

  upsertEmbedding(record: VectorRecord): void {
    this.records.set(record.id, record);
  }

  querySimilar(query: SimilarityQuery): readonly SimilarityResult[] {
    const scored: SimilarityResult[] = [];

    for (const record of this.records.values()) {
      if (!query.scopes.includes(record.scope)) {
        continue;
      }

      if (record.metadata.userId !== query.userId &&
          record.scope === 'USER') {
        continue;
      }

      const score = cosineSimilarity(query.embedding, record.embedding);
      scored.push({ record, score });
    }

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, query.limit);
  }

  delete(id: string): void {
    this.records.delete(id);
  }

  count(): number {
    return this.records.size;
  }
}
