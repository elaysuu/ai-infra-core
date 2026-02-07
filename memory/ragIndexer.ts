import type { Embedder, IndexerInput, VectorRecord } from './types';
import type { VectorStore } from './vectorStore';

// ============================================================================
// INDEXER ERRORS
// ============================================================================

export class IndexerError extends Error {
  readonly recordId: string;

  constructor(recordId: string, message: string) {
    super(message);
    this.name = 'IndexerError';
    this.recordId = recordId;
  }
}

// ============================================================================
// RAG INDEXER
// ============================================================================

export interface RagIndexer {
  index(input: IndexerInput): void;
  indexBatch(inputs: readonly IndexerInput[]): IndexBatchResult;
  remove(id: string): void;
}

export interface IndexBatchResult {
  readonly indexed: number;
  readonly failed: readonly IndexerError[];
}

// ============================================================================
// IMPLEMENTATION
// ============================================================================

export class DefaultRagIndexer implements RagIndexer {
  private readonly store: VectorStore;
  private readonly embedder: Embedder;

  constructor(store: VectorStore, embedder: Embedder) {
    this.store = store;
    this.embedder = embedder;
  }

  index(input: IndexerInput): void {
    if (input.summarizedText.trim().length === 0) {
      throw new IndexerError(input.id, 'Cannot index empty text');
    }

    const embedding = this.embedder.embed(input.summarizedText);

    const record: VectorRecord = {
      id: input.id,
      embedding,
      text: input.summarizedText,
      scope: input.scope,
      metadata: input.metadata,
      createdAt: Date.now(),
    };

    this.store.upsertEmbedding(record);
  }

  indexBatch(inputs: readonly IndexerInput[]): IndexBatchResult {
    let indexed = 0;
    const failed: IndexerError[] = [];

    for (const input of inputs) {
      try {
        this.index(input);
        indexed++;
      } catch (error: unknown) {
        if (error instanceof IndexerError) {
          failed.push(error);
        } else {
          failed.push(new IndexerError(
            input.id,
            error instanceof Error ? error.message : String(error),
          ));
        }
      }
    }

    return { indexed, failed };
  }

  remove(id: string): void {
    this.store.delete(id);
  }
}
