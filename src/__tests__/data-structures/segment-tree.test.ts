/**
 * @file Segment Tree tests
 */
/* eslint-disable max-lines, max-lines-per-function */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { SegmentTree } from "../../data-structures/trees/segment-tree/segment-tree-core";
import { TraversalOrder } from "../../data-structures/trees/segment-tree/segment-tree-types";

describe("Segment Tree Data Structure", () => {
  let segmentTree: SegmentTree<number>;

  beforeEach(() => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    segmentTree = new SegmentTree<number>();
  });

  describe("Initialization", () => {
    it("should initialize with default configuration", () => {
      expect(segmentTree).toBeInstanceOf(SegmentTree);
      expect(segmentTree.isEmpty()).toBe(true);
      expect(segmentTree.size()).toBe(0);
    });

    it("should initialize with custom configuration", () => {
      const customTree = new SegmentTree<number>({
        config: {
          aggregationFunction: (a, b) => Math.max(a, b),
          identityElement: -Infinity,
          enableLazyPropagation: true,
        },
        enableStats: true,
        enableDebug: true,
      });
      expect(customTree).toBeInstanceOf(SegmentTree);
    });

    it("should initialize with initial array", () => {
      const initialArray = [1, 2, 3, 4, 5];
      const treeWithArray = new SegmentTree<number>({ initialArray });
      expect(treeWithArray.size()).toBe(5);
      expect(treeWithArray.isEmpty()).toBe(false);
    });

    it("should build tree from initial array", () => {
      const initialArray = [1, 2, 3, 4, 5];
      const treeWithArray = new SegmentTree<number>({ initialArray });

      // Test that the tree was built correctly
      const result = treeWithArray.query(0, 4);
      expect(result.result).toBe(15); // Sum of all elements
    });
  });

  describe("Basic Operations", () => {
    beforeEach(() => {
      const initialArray = [1, 2, 3, 4, 5];
      segmentTree = new SegmentTree<number>({ initialArray });
    });

    it("should query a range successfully", () => {
      const result = segmentTree.query(0, 2);

      expect(result.result).toBe(6); // Sum of [1, 2, 3]
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
      expect(result.nodesVisited).toBeGreaterThan(0);
      expect(result.range).toEqual({ start: 0, end: 2 });
    });

    it("should query a single element", () => {
      const result = segmentTree.query(2, 2);

      expect(result.result).toBe(3);
      expect(result.range).toEqual({ start: 2, end: 2 });
    });

    it("should query the entire array", () => {
      const result = segmentTree.query(0, 4);

      expect(result.result).toBe(15); // Sum of all elements
      expect(result.range).toEqual({ start: 0, end: 4 });
    });

    it("should handle invalid query ranges", () => {
      const result1 = segmentTree.query(-1, 2);
      const result2 = segmentTree.query(2, 1);
      const result3 = segmentTree.query(0, 10);

      expect(result1.result).toBe(0); // Identity element
      expect(result2.result).toBe(0); // Identity element
      expect(result3.result).toBe(0); // Identity element
    });

    it("should update a single element", () => {
      const result = segmentTree.updatePoint(2, 10);

      expect(result.success).toBe(true);
      expect(result.nodesUpdated).toBeGreaterThan(0);
      expect(result.range).toEqual({ start: 2, end: 2 });

      // Verify the update
      const queryResult = segmentTree.query(2, 2);
      expect(queryResult.result).toBe(10);
    });

    it("should update a range of elements", () => {
      const result = segmentTree.updateRange(0, 2, 5);

      expect(result.success).toBe(true);
      expect(result.nodesUpdated).toBeGreaterThan(0);
      expect(result.range).toEqual({ start: 0, end: 2 });
    });

    it("should handle invalid update ranges", () => {
      const result1 = segmentTree.updatePoint(-1, 10);
      const result2 = segmentTree.updatePoint(10, 10);
      const result3 = segmentTree.updateRange(2, 1, 5);

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
      expect(result3.success).toBe(false);
    });
  });

  describe("Different Aggregation Functions", () => {
    it("should work with sum aggregation", () => {
      const sumTree = new SegmentTree<number>({
        initialArray: [1, 2, 3, 4, 5],
        config: {
          aggregationFunction: (a, b) => a + b,
          identityElement: 0,
        },
      });

      const result = sumTree.query(0, 4);
      expect(result.result).toBe(15);
    });

    it("should work with max aggregation", () => {
      const maxTree = new SegmentTree<number>({
        initialArray: [1, 2, 3, 4, 5],
        config: {
          aggregationFunction: (a, b) => Math.max(a, b),
          identityElement: -Infinity,
        },
      });

      const result = maxTree.query(0, 4);
      expect(result.result).toBe(5);
    });

    it("should work with min aggregation", () => {
      const minTree = new SegmentTree<number>({
        initialArray: [1, 2, 3, 4, 5],
        config: {
          aggregationFunction: (a, b) => Math.min(a, b),
          identityElement: Infinity,
        },
      });

      const result = minTree.query(0, 4);
      expect(result.result).toBe(1);
    });

    it("should work with product aggregation", () => {
      const productTree = new SegmentTree<number>({
        initialArray: [1, 2, 3, 4, 5],
        config: {
          aggregationFunction: (a, b) => a * b,
          identityElement: 1,
        },
      });

      const result = productTree.query(0, 4);
      expect(result.result).toBe(120);
    });
  });

  describe("Lazy Propagation", () => {
    it("should handle lazy propagation for range updates", () => {
      const lazyTree = new SegmentTree<number>({
        initialArray: [1, 2, 3, 4, 5],
        config: {
          enableLazyPropagation: true,
          updateFunction: (current, update) => current + update,
        },
      });

      // Update range [0, 2] by adding 5
      const updateResult = lazyTree.updateRange(0, 2, 5);
      expect(updateResult.success).toBe(true);

      // Query the updated range
      const queryResult = lazyTree.query(0, 2);
      expect(queryResult.result).toBe(21); // (1+5) + (2+5) + (3+5) = 6 + 7 + 8 = 21
    });

    it("should handle lazy propagation with multiple updates", () => {
      const lazyTree = new SegmentTree<number>({
        initialArray: [1, 2, 3, 4, 5],
        config: {
          enableLazyPropagation: true,
          updateFunction: (current, update) => current + update,
        },
      });

      // Multiple range updates
      lazyTree.updateRange(0, 2, 5);
      lazyTree.updateRange(1, 3, 3);

      // Query overlapping range
      const queryResult = lazyTree.query(1, 2);
      expect(queryResult.result).toBeGreaterThan(0);
    });
  });

  describe("Configuration", () => {
    it("should respect enableRangeQueries configuration", () => {
      const noRangeQueryTree = new SegmentTree<number>({
        initialArray: [1, 2, 3, 4, 5],
        config: { enableRangeQueries: false },
      });

      const result = noRangeQueryTree.query(0, 2);
      expect(result.result).toBe(0); // Identity element
    });

    it("should respect enablePointUpdates configuration", () => {
      const noPointUpdateTree = new SegmentTree<number>({
        initialArray: [1, 2, 3, 4, 5],
        config: { enablePointUpdates: false },
      });

      const result = noPointUpdateTree.updatePoint(2, 10);
      expect(result.success).toBe(false);
    });

    it("should respect enableRangeUpdates configuration", () => {
      const noRangeUpdateTree = new SegmentTree<number>({
        initialArray: [1, 2, 3, 4, 5],
        config: { enableRangeUpdates: false },
      });

      const result = noRangeUpdateTree.updateRange(0, 2, 5);
      expect(result.success).toBe(false);
    });

    it("should update configuration", () => {
      segmentTree.updateConfig({ enableRangeQueries: false });

      const result = segmentTree.query(0, 2);
      expect(result.result).toBe(0); // Identity element
    });
  });

  describe("Batch Operations", () => {
    beforeEach(() => {
      const initialArray = [1, 2, 3, 4, 5];
      segmentTree = new SegmentTree<number>({ initialArray });
    });

    it("should update multiple elements in batch", () => {
      const updates = [
        { index: 0, value: 10 },
        { index: 2, value: 20 },
        { index: 4, value: 30 },
      ];
      const result = segmentTree.updateBatch(updates);

      expect(result.successful).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
    });

    it("should handle batch update errors", () => {
      const updates = [
        { index: 0, value: 10 },
        { index: -1, value: 20 }, // Invalid index
        { index: 4, value: 30 },
      ];
      const result = segmentTree.updateBatch(updates);

      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors.length).toBe(1);
    });
  });

  describe("Traversal", () => {
    beforeEach(() => {
      const initialArray = [1, 2, 3, 4, 5];
      segmentTree = new SegmentTree<number>({ initialArray });
    });

    it("should traverse in order", () => {
      const result = segmentTree.traverse({ order: TraversalOrder.IN_ORDER });

      expect(result.values.length).toBeGreaterThan(0);
      expect(result.nodesVisited).toBeGreaterThan(0);
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it("should traverse in pre-order", () => {
      const result = segmentTree.traverse({ order: TraversalOrder.PRE_ORDER });

      expect(result.values.length).toBeGreaterThan(0);
      expect(result.nodesVisited).toBeGreaterThan(0);
    });

    it("should traverse in post-order", () => {
      const result = segmentTree.traverse({ order: TraversalOrder.POST_ORDER });

      expect(result.values.length).toBeGreaterThan(0);
      expect(result.nodesVisited).toBeGreaterThan(0);
    });

    it("should get all elements", () => {
      const elements = segmentTree.getAllElements();

      expect(elements).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe("Serialization", () => {
    beforeEach(() => {
      const initialArray = [1, 2, 3, 4, 5];
      segmentTree = new SegmentTree<number>({ initialArray });
    });

    it("should serialize the tree", () => {
      const serialized = segmentTree.serialize();

      expect(serialized).toHaveProperty("version");
      expect(serialized).toHaveProperty("config");
      expect(serialized).toHaveProperty("data");
      expect(serialized).toHaveProperty("metadata");
      expect(serialized.metadata.totalElements).toBe(5);
      expect(serialized.metadata.totalNodes).toBeGreaterThan(0);
    });

    it("should deserialize the tree", () => {
      const serialized = segmentTree.serialize();
      const newTree = new SegmentTree<number>();

      const result = newTree.deserialize(serialized);
      expect(result).toBe(true);
      expect(newTree.size()).toBe(5);

      // Test that deserialized tree works correctly
      const queryResult = newTree.query(0, 4);
      expect(queryResult.result).toBe(15);
    });

    it("should handle deserialization errors", () => {
      const invalidSerialized = {
        version: "1.0",
        config: {},
        data: "invalid_data",
        metadata: { totalElements: 0, totalNodes: 0, height: 0, createdAt: Date.now() },
      };

      const newTree = new SegmentTree<number>();
      const result = newTree.deserialize(invalidSerialized as any);
      expect(result).toBe(false);
    });
  });

  describe("Statistics and Performance", () => {
    beforeEach(() => {
      const statsTree = new SegmentTree<number>({
        enableStats: true,
        initialArray: [1, 2, 3, 4, 5],
      });
      segmentTree = statsTree;
    });

    it("should track statistics", () => {
      const stats = segmentTree.getStats();

      expect(stats.totalElements).toBe(5);
      expect(stats.totalNodes).toBeGreaterThan(0);
      expect(stats.height).toBeGreaterThan(0);
      expect(stats.totalQueries).toBe(0);
      expect(stats.totalUpdates).toBe(0);
      expect(stats.averageQueryTime).toBe(0);
      expect(stats.averageUpdateTime).toBe(0);
      expect(stats.memoryUsage).toBeGreaterThan(0);
    });

    it("should provide performance metrics", () => {
      const metrics = segmentTree.getPerformanceMetrics();

      expect(metrics).toHaveProperty("memoryUsage");
      expect(metrics).toHaveProperty("averageQueryTime");
      expect(metrics).toHaveProperty("averageUpdateTime");
      expect(metrics).toHaveProperty("performanceScore");
      expect(metrics).toHaveProperty("queryEfficiency");
      expect(metrics).toHaveProperty("updateEfficiency");
      expect(metrics.performanceScore).toBeGreaterThanOrEqual(0);
      expect(metrics.performanceScore).toBeLessThanOrEqual(100);
    });

    it("should update statistics on operations", () => {
      const initialStats = segmentTree.getStats();

      segmentTree.query(0, 2);
      segmentTree.updatePoint(2, 10);

      const updatedStats = segmentTree.getStats();
      expect(updatedStats.totalQueries).toBe(initialStats.totalQueries + 1);
      expect(updatedStats.totalUpdates).toBe(initialStats.totalUpdates + 1);
      expect(updatedStats.pointUpdates).toBe(initialStats.pointUpdates + 1);
    });
  });

  describe("Event Handling", () => {
    it("should handle events when debug is enabled", () => {
      const eventHandler = vi.fn();
      const debugTree = new SegmentTree<number>({
        enableDebug: true,
        eventHandlers: [eventHandler],
        initialArray: [1, 2, 3, 4, 5],
      });

      debugTree.query(0, 2);
      debugTree.updatePoint(2, 10);

      expect(eventHandler).toHaveBeenCalled();
    });

    it("should not handle events when debug is disabled", () => {
      const eventHandler = vi.fn();
      const debugTree = new SegmentTree<number>({
        enableDebug: false,
        eventHandlers: [eventHandler],
        initialArray: [1, 2, 3, 4, 5],
      });

      debugTree.query(0, 2);
      debugTree.updatePoint(2, 10);

      expect(eventHandler).not.toHaveBeenCalled();
    });

    it("should add and remove event handlers", () => {
      const eventHandler = vi.fn();
      const debugTree = new SegmentTree<number>({
        enableDebug: true,
        initialArray: [1, 2, 3, 4, 5],
      });

      debugTree.addEventHandler(eventHandler);
      debugTree.query(0, 2);
      expect(eventHandler).toHaveBeenCalled();

      debugTree.removeEventHandler(eventHandler);
      debugTree.query(0, 2);
      expect(eventHandler).toHaveBeenCalledTimes(1); // Only called once
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty tree operations", () => {
      expect(segmentTree.query(0, 0).result).toBe(0);
      expect(segmentTree.updatePoint(0, 10).success).toBe(false);
      expect(segmentTree.updateRange(0, 0, 10).success).toBe(false);
    });

    it("should handle single element array", () => {
      const singleTree = new SegmentTree<number>({ initialArray: [42] });

      expect(singleTree.size()).toBe(1);
      expect(singleTree.query(0, 0).result).toBe(42);
      expect(singleTree.updatePoint(0, 100).success).toBe(true);
      expect(singleTree.query(0, 0).result).toBe(100);
    });

    it("should handle two element array", () => {
      const twoTree = new SegmentTree<number>({ initialArray: [10, 20] });

      expect(twoTree.size()).toBe(2);
      expect(twoTree.query(0, 1).result).toBe(30);
      expect(twoTree.query(0, 0).result).toBe(10);
      expect(twoTree.query(1, 1).result).toBe(20);
    });

    it("should clear the tree", () => {
      const initialArray = [1, 2, 3, 4, 5];
      const clearTree = new SegmentTree<number>({ initialArray });
      expect(clearTree.size()).toBe(5);

      clearTree.clear();
      expect(clearTree.size()).toBe(0);
      expect(clearTree.isEmpty()).toBe(true);
      expect(clearTree.query(0, 0).result).toBe(0);
    });

    it("should handle very large arrays", () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => i + 1);
      const largeTree = new SegmentTree<number>({ initialArray: largeArray });

      expect(largeTree.size()).toBe(1000);
      const result = largeTree.query(0, 999);
      expect(result.result).toBe(500500); // Sum of 1 to 1000
    });

    it("should handle negative numbers", () => {
      const negativeArray = [-1, -2, -3, -4, -5];
      const negativeTree = new SegmentTree<number>({ initialArray: negativeArray });

      const result = negativeTree.query(0, 4);
      expect(result.result).toBe(-15);
    });

    it("should handle zero values", () => {
      const zeroArray = [0, 0, 0, 0, 0];
      const zeroTree = new SegmentTree<number>({ initialArray: zeroArray });

      const result = zeroTree.query(0, 4);
      expect(result.result).toBe(0);
    });
  });

  describe("Performance Benchmarks", () => {
    const runBenchmark = (
      description: string,
      arraySize: number,
      operation: (tree: SegmentTree<number>, size: number) => void
    ) => {
      it(`should perform ${description} with array size ${arraySize}`, () => {
        const benchmarkArray = Array.from({ length: arraySize }, (_, i) => i + 1);
        const benchmarkTree = new SegmentTree<number>({
          enableStats: true,
          initialArray: benchmarkArray,
        });

        const startTime = performance.now();
        operation(benchmarkTree, arraySize);
        const endTime = performance.now();

        const executionTime = endTime - startTime;
        expect(executionTime).toBeGreaterThanOrEqual(0);

        // Log for manual inspection during benchmark runs
        // console.log(`Benchmark: ${description} - Array Size: ${arraySize}`);
        // console.log(`  Execution Time: ${executionTime.toFixed(3)} ms`);
        // console.log(`  Stats:`, benchmarkTree.getStats());
      });
    };

    runBenchmark("range queries", 100, (tree, size) => {
      for (let i = 0; i < size; i++) {
        tree.query(0, i);
      }
    });

    runBenchmark("point updates", 100, (tree, size) => {
      for (let i = 0; i < size; i++) {
        tree.updatePoint(i, i * 2);
      }
    });

    runBenchmark("range updates", 100, (tree, size) => {
      for (let i = 0; i < size / 2; i++) {
        tree.updateRange(i, i + 10, 5);
      }
    });

    runBenchmark("mixed operations", 100, (tree, size) => {
      for (let i = 0; i < size; i++) {
        if (i % 2 === 0) {
          tree.query(0, i);
        } else {
          tree.updatePoint(i, i * 2);
        }
      }
    });

    runBenchmark("large dataset queries", 1000, (tree, size) => {
      for (let i = 0; i < size; i += 10) {
        tree.query(i, Math.min(i + 50, size - 1));
      }
    });

    runBenchmark("large dataset updates", 1000, (tree, size) => {
      for (let i = 0; i < size; i += 10) {
        tree.updateRange(i, Math.min(i + 50, size - 1), 5);
      }
    });
  });
});
