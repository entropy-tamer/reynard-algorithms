/**
 * Union-Find Batch Operations Tests
 *
 * Tests for batch operations functionality
 */

import { describe, it, expect, beforeEach } from "vitest";
import { BatchUnionFind, BatchOperation } from "../../data-structures/union-find/data-structures/union-find-batch-operations";

describe("BatchUnionFind", () => {
  let uf: BatchUnionFind;

  beforeEach(() => {
    uf = new BatchUnionFind(10);
  });

  it("should perform batch union operations", () => {
    const operations: [number, number][] = [
      [0, 1],
      [1, 2],
      [3, 4],
    ];
    const results = uf.batchUnion(operations);

    expect(results).toEqual([true, true, true]);
    expect(uf.connected(0, 2)).toBe(true);
    expect(uf.connected(3, 4)).toBe(true);
  });

  it("should perform batch find operations", () => {
    uf.union(0, 1);
    uf.union(1, 2);

    const elements = [0, 1, 2, 3];
    const results = uf.batchFind(elements);

    expect(results[0]).toBe(results[1]);
    expect(results[1]).toBe(results[2]);
    expect(results[3]).toBe(3);
  });

  it("should perform batch connected checks", () => {
    uf.union(0, 1);
    uf.union(2, 3);

    const pairs: [number, number][] = [
      [0, 1],
      [2, 3],
      [0, 3],
    ];
    const results = uf.batchConnected(pairs);

    expect(results).toEqual([true, true, false]);
  });

  it("should handle mixed batch operations", () => {
    const operations: BatchOperation[] = [
      { type: "union", args: [0, 1] },
      { type: "find", args: [0] },
      { type: "connected", args: [0, 1] },
    ];

    const results = uf.batchOperations(operations);

    expect(results[0].result).toBe(true);
    expect(typeof results[1].result).toBe("number");
    expect(results[2].result).toBe(true);
  });

  it("should track batch statistics", () => {
    uf.batchUnion([
      [0, 1],
      [1, 2],
    ]);
    uf.batchFind([0, 1, 2]);

    const stats = uf.getBatchStats();
    expect(stats.batchOperations).toBe(2);
    expect(stats.totalOperations).toBe(5);
  });

  it("should use caching in optimized batch union", () => {
    const operations: [number, number][] = [
      [0, 1],
      [0, 1],
      [1, 2],
    ];
    const results = uf.batchUnionOptimized(operations);

    expect(results).toEqual([true, true, true]);

    const stats = uf.getBatchStats();
    expect(stats.cacheHits).toBeGreaterThan(0);
  });
});
