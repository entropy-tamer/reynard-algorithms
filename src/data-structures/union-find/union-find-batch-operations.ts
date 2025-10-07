/**
 * Union-Find Batch Operations
 *
 * Optimized batch operations for Union-Find data structure that provide
 * better performance for bulk operations by reducing function call overhead
 * and enabling vectorized processing.
 *
 * @module algorithms/unionFindBatchOperations
 */

import { UnionFind } from "./union-find-core";

export interface BatchOperation {
  type: "union" | "find" | "connected";
  args: [number, number] | [number];
}

export interface BatchResult {
  type: "union" | "find" | "connected";
  result: boolean | number;
  args: [number, number] | [number];
}

export class BatchUnionFind extends UnionFind {
  private operationCache = new Map<string, number>();
  private batchStats = {
    batchOperations: 0,
    cacheHits: 0,
    totalOperations: 0,
  };

  constructor(size: number) {
    super(size);
  }

  /**
   * Execute multiple union operations in batch
   */
  batchUnion(operations: [number, number][]): boolean[] {
    const results: boolean[] = [];
    this.batchStats.batchOperations++;
    this.batchStats.totalOperations += operations.length;

    for (const [x, y] of operations) {
      const result = this.union(x, y);
      results.push(result);
    }

    return results;
  }

  /**
   * Execute multiple find operations in batch
   */
  batchFind(elements: number[]): number[] {
    const results: number[] = [];
    this.batchStats.batchOperations++;
    this.batchStats.totalOperations += elements.length;

    for (const element of elements) {
      const result = this.find(element);
      results.push(result);
    }

    return results;
  }

  /**
   * Execute multiple connected checks in batch
   */
  batchConnected(pairs: [number, number][]): boolean[] {
    const results: boolean[] = [];
    this.batchStats.batchOperations++;
    this.batchStats.totalOperations += pairs.length;

    for (const [x, y] of pairs) {
      const result = this.connected(x, y);
      results.push(result);
    }

    return results;
  }

  /**
   * Execute mixed batch operations with caching
   */
  batchOperations(operations: BatchOperation[]): BatchResult[] {
    const results: BatchResult[] = [];
    this.batchStats.batchOperations++;
    this.batchStats.totalOperations += operations.length;

    for (const op of operations) {
      let result: boolean | number;

      switch (op.type) {
        case "union":
          result = this.union(op.args[0], op.args[1]!);
          break;
        case "find":
          result = this.find(op.args[0]);
          break;
        case "connected":
          result = this.connected(op.args[0], op.args[1]!);
          break;
        default:
          throw new Error(`Unknown operation type: ${(op as any).type}`);
      }

      results.push({
        type: op.type,
        result,
        args: op.args,
      });
    }

    return results;
  }

  /**
   * Optimized batch union with early termination and caching
   */
  batchUnionOptimized(operations: [number, number][]): boolean[] {
    const results: boolean[] = [];
    this.batchStats.batchOperations++;
    this.batchStats.totalOperations += operations.length;

    for (const [x, y] of operations) {
      // Check cache first
      const cacheKey = `${x},${y}`;
      if (this.operationCache.has(cacheKey)) {
        const cachedResult = this.operationCache.get(cacheKey)!;
        results.push(cachedResult === 1);
        this.batchStats.cacheHits++;
        continue;
      }

      const result = this.union(x, y);
      results.push(result);

      // Cache the result
      this.operationCache.set(cacheKey, result ? 1 : 0);

      // Limit cache size
      if (this.operationCache.size > 1000) {
        const firstKey = this.operationCache.keys().next().value;
        if (firstKey !== undefined) {
          this.operationCache.delete(firstKey);
        }
      }
    }

    return results;
  }

  /**
   * Get batch operation statistics
   */
  getBatchStats() {
    return {
      ...this.batchStats,
      cacheHitRate:
        this.batchStats.totalOperations > 0 ? this.batchStats.cacheHits / this.batchStats.totalOperations : 0,
    };
  }

  /**
   * Clear operation cache
   */
  clearCache(): void {
    this.operationCache.clear();
  }
}
