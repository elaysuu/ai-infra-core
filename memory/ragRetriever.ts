import type { Embedder, RetrievalQuery, RetrievalResult } from './types.js';
import type { VectorStore } from './vectorStore.js';

// ============================================================================
// RETRIEVER ERRORS
// ============================================================================

export class RetrieverError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RetrieverError';
  }
}

// ============================================================================
// RAG RETRIEVER INTERFACE
// ============================================================================

export interface RagRetriever {
  retrieve(query: RetrievalQuery): readonly RetrievalResult[];
  retrieveAsText(query: RetrievalQuery): readonly string[];
}

// ============================================================================
// IMPLEMENTATION
// ============================================================================

export class DefaultRagRetriever implements RagRetriever {
  private readonly store: VectorStore;
  private readonly embedder: Embedder;
  private readonly minScore: number;

  constructor(store: VectorStore, embedder: Embedder, minScore: number) {
    this.store = store;
    this.embedder = embedder;
    this.minScore = minScore;
  }

  retrieve(query: RetrievalQuery): readonly RetrievalResult[] {
    if (query.queryText.trim().length === 0) {
      return [];
    }

    if (query.limit <= 0) {
      return [];
    }

    const queryEmbedding = this.embedder.embed(query.queryText);

    const similarities = this.store.querySimilar({
      embedding: queryEmbedding,
      scopes: query.scopes,
      userId: query.userId,
      limit: query.limit,
    });

    const results: RetrievalResult[] = [];

    for (const entry of similarities) {
      if (entry.score < this.minScore) {
        continue;
      }

      results.push({
        id: entry.record.id,
        text: entry.record.text,
        score: entry.score,
        scope: entry.record.scope,
        metadata: entry.record.metadata,
      });
    }

    return results;
  }

  retrieveAsText(query: RetrievalQuery): readonly string[] {
    const results = this.retrieve(query);
    return results.map((r) => r.text);
  }
}
