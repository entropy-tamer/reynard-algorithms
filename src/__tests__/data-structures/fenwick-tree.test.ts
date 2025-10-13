import { describe, it, expect, beforeEach, vi } from "vitest";
import { FenwickTree } from "../../data-structures/fenwick-tree/fenwick-tree-core";

describe("Fenwick Tree (Binary Indexed Tree) Data Structure", () => {
  let fenwickTree: FenwickTree;

  beforeEach(() => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    fenwickTree = new FenwickTree();
  });

  describe("Initialization", () => {
    it("should initialize with default configuration", () => {
      expect(fenwickTree).toBeInstanceOf(FenwickTree);
      expect(fenwickTree.isEmpty()).toBe(true);
      expect(fenwickTree.size()).toBe(0);
    });

    it("should initialize with custom configuration", () => {
      const customTree = new FenwickTree({
        config: {
          enableRangeUpdates: false,
          useOneBasedIndexing: false,
        },
        enableStats: true,
        enableDebug: true,
      });
      expect(customTree).toBeInstanceOf(FenwickTree);
    });

    it("should initialize with initial array", () => {
      const initialArray = [1, 2, 3, 4, 5];
      const treeWithArray = new FenwickTree({ initialArray });
      expect(treeWithArray.size()).toBe(5);
      expect(treeWithArray.isEmpty()).toBe(false);
    });

    it("should build tree from initial array", () => {
      const initialArray = [1, 2, 3, 4, 5];
      const treeWithArray = new FenwickTree({ initialArray });

      // Test that the tree was built correctly
      const result = treeWithArray.query(4);
      expect(result.result).toBe(15); // Sum of all elements
    });
  });

  describe("Basic Operations", () => {
    beforeEach(() => {
      const initialArray = [1, 2, 3, 4, 5];
      fenwickTree = new FenwickTree({ initialArray });
    });

    it("should query prefix sum successfully", () => {
      const result = fenwickTree.query(2);

      expect(result.result).toBe(6); // Sum of [1, 2, 3]
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
      expect(result.nodesVisited).toBeGreaterThan(0);
      expect(result.range).toEqual({ start: 0, end: 2 });
    });

    it("should query single element", () => {
      const result = fenwickTree.query(0);

      expect(result.result).toBe(1);
      expect(result.range).toEqual({ start: 0, end: 0 });
    });

    it("should query the entire array", () => {
      const result = fenwickTree.query(4);

      expect(result.result).toBe(15); // Sum of all elements
      expect(result.range).toEqual({ start: 0, end: 4 });
    });

    it("should handle invalid query indices", () => {
      const result1 = fenwickTree.query(-1);
      const result2 = fenwickTree.query(10);

      expect(result1.result).toBe(0);
      expect(result2.result).toBe(0);
    });

    it("should update a single element", () => {
      const result = fenwickTree.updatePoint(2, 10);

      expect(result.success).toBe(true);
      expect(result.nodesUpdated).toBeGreaterThan(0);
      expect(result.index).toBe(2);

      // Verify the update
      const queryResult = fenwickTree.query(2);
      expect(queryResult.result).toBe(13); // 1 + 2 + 10
    });

    it("should update a range of elements", () => {
      const result = fenwickTree.updateRange(0, 2, 5);

      expect(result.success).toBe(true);
      expect(result.nodesUpdated).toBeGreaterThan(0);
      expect(result.range).toEqual({ start: 0, end: 2 });
    });

    it("should handle invalid update indices", () => {
      const result1 = fenwickTree.updatePoint(-1, 10);
      const result2 = fenwickTree.updatePoint(10, 10);
      const result3 = fenwickTree.updateRange(2, 1, 5);

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
      expect(result3.success).toBe(false);
    });
  });

  describe("Range Queries", () => {
    beforeEach(() => {
      const initialArray = [1, 2, 3, 4, 5];
      fenwickTree = new FenwickTree({ initialArray });
    });

    it("should query range sum successfully", () => {
      const result = fenwickTree.queryRange(1, 3);

      expect(result.result).toBe(9); // Sum of [2, 3, 4]
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
      expect(result.nodesVisited).toBeGreaterThan(0);
      expect(result.range).toEqual({ start: 1, end: 3 });
    });

    it("should query single element range", () => {
      const result = fenwickTree.queryRange(2, 2);

      expect(result.result).toBe(3);
      expect(result.range).toEqual({ start: 2, end: 2 });
    });

    it("should query entire array range", () => {
      const result = fenwickTree.queryRange(0, 4);

      expect(result.result).toBe(15); // Sum of all elements
      expect(result.range).toEqual({ start: 0, end: 4 });
    });

    it("should handle invalid range queries", () => {
      const result1 = fenwickTree.queryRange(-1, 2);
      const result2 = fenwickTree.queryRange(2, 1);
      const result3 = fenwickTree.queryRange(0, 10);

      expect(result1.result).toBe(0);
      expect(result2.result).toBe(0);
      expect(result3.result).toBe(0);
    });
  });

  describe("Range Updates", () => {
    beforeEach(() => {
      const initialArray = [1, 2, 3, 4, 5];
      fenwickTree = new FenwickTree({ initialArray });
    });

    it("should update range successfully", () => {
      const result = fenwickTree.updateRange(0, 2, 5);

      expect(result.success).toBe(true);
      expect(result.nodesUpdated).toBeGreaterThan(0);
      expect(result.range).toEqual({ start: 0, end: 2 });

      // Verify the update
      const queryResult = fenwickTree.queryRange(0, 2);
      expect(queryResult.result).toBe(21); // (1+5) + (2+5) + (3+5) = 6 + 7 + 8 = 21
    });

    it("should update single element range", () => {
      const result = fenwickTree.updateRange(2, 2, 10);

      expect(result.success).toBe(true);

      // Verify the update
      const queryResult = fenwickTree.queryRange(2, 2);
      expect(queryResult.result).toBe(13); // 3 + 10
    });

    it("should handle multiple range updates", () => {
      fenwickTree.updateRange(0, 2, 5);
      fenwickTree.updateRange(1, 3, 3);

      // Query overlapping range
      const queryResult = fenwickTree.queryRange(1, 2);
      expect(queryResult.result).toBeGreaterThan(0);
    });
  });

  describe("Configuration", () => {
    it("should respect enableRangeQueries configuration", () => {
      const noRangeQueryTree = new FenwickTree({
        initialArray: [1, 2, 3, 4, 5],
        config: { enableRangeQueries: false },
      });

      const result = noRangeQueryTree.query(2);
      expect(result.result).toBe(0);
    });

    it("should respect enablePointUpdates configuration", () => {
      const noPointUpdateTree = new FenwickTree({
        initialArray: [1, 2, 3, 4, 5],
        config: { enablePointUpdates: false },
      });

      const result = noPointUpdateTree.updatePoint(2, 10);
      expect(result.success).toBe(false);
    });

    it("should respect enableRangeUpdates configuration", () => {
      const noRangeUpdateTree = new FenwickTree({
        initialArray: [1, 2, 3, 4, 5],
        config: { enableRangeUpdates: false },
      });

      const result = noRangeUpdateTree.updateRange(0, 2, 5);
      expect(result.success).toBe(false);
    });

    it("should respect useOneBasedIndexing configuration", () => {
      const zeroBasedTree = new FenwickTree({
        initialArray: [1, 2, 3, 4, 5],
        config: { useOneBasedIndexing: false },
      });

      // Test that it still works with 0-based indexing
      const result = zeroBasedTree.query(2);
      expect(result.result).toBe(6);
    });

    it("should update configuration", () => {
      fenwickTree.updateConfig({ enableRangeQueries: false });

      const result = fenwickTree.query(2);
      expect(result.result).toBe(0);
    });
  });

  describe("Batch Operations", () => {
    beforeEach(() => {
      const initialArray = [1, 2, 3, 4, 5];
      fenwickTree = new FenwickTree({ initialArray });
    });

    it("should update multiple elements in batch", () => {
      const updates = [
        { index: 0, value: 10 },
        { index: 2, value: 20 },
        { index: 4, value: 30 },
      ];
      const result = fenwickTree.updateBatch(updates);

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
      const result = fenwickTree.updateBatch(updates);

      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors.length).toBe(1);
    });
  });

  describe("Serialization", () => {
    beforeEach(() => {
      const initialArray = [1, 2, 3, 4, 5];
      fenwickTree = new FenwickTree({ initialArray });
    });

    it("should serialize the tree", () => {
      const serialized = fenwickTree.serialize();

      expect(serialized).toHaveProperty("version");
      expect(serialized).toHaveProperty("config");
      expect(serialized).toHaveProperty("data");
      expect(serialized).toHaveProperty("metadata");
      expect(serialized.metadata.totalElements).toBe(5);
      expect(serialized.metadata.totalNodes).toBeGreaterThan(0);
    });

    it("should deserialize the tree", () => {
      const serialized = fenwickTree.serialize();
      const newTree = new FenwickTree();

      const result = newTree.deserialize(serialized);
      expect(result).toBe(true);
      expect(newTree.size()).toBe(5);

      // Test that deserialized tree works correctly
      const queryResult = newTree.query(4);
      expect(queryResult.result).toBe(15);
    });

    it("should handle deserialization errors", () => {
      const invalidSerialized = {
        version: "1.0",
        config: {},
        data: "invalid_data",
        metadata: { totalElements: 0, totalNodes: 0, createdAt: Date.now() },
      };

      const newTree = new FenwickTree();
      const result = newTree.deserialize(invalidSerialized as any);
      expect(result).toBe(false);
    });
  });

  describe("Statistics and Performance", () => {
    beforeEach(() => {
      const statsTree = new FenwickTree({
        enableStats: true,
        initialArray: [1, 2, 3, 4, 5],
      });
      fenwickTree = statsTree;
    });

    it("should track statistics", () => {
      const stats = fenwickTree.getStats();

      expect(stats.totalElements).toBe(5);
      expect(stats.totalNodes).toBeGreaterThan(0);
      expect(stats.totalQueries).toBe(0);
      expect(stats.totalUpdates).toBe(0);
      expect(stats.averageQueryTime).toBe(0);
      expect(stats.averageUpdateTime).toBe(0);
      expect(stats.memoryUsage).toBeGreaterThan(0);
    });

    it("should provide performance metrics", () => {
      const metrics = fenwickTree.getPerformanceMetrics();

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
      const initialStats = fenwickTree.getStats();

      fenwickTree.query(2);
      fenwickTree.updatePoint(2, 10);

      const updatedStats = fenwickTree.getStats();
      expect(updatedStats.totalQueries).toBe(initialStats.totalQueries + 1);
      expect(updatedStats.totalUpdates).toBe(initialStats.totalUpdates + 1);
      expect(updatedStats.pointUpdates).toBe(initialStats.pointUpdates + 1);
    });
  });

  describe("Event Handling", () => {
    it("should handle events when debug is enabled", () => {
      const eventHandler = vi.fn();
      const debugTree = new FenwickTree({
        enableDebug: true,
        eventHandlers: [eventHandler],
        initialArray: [1, 2, 3, 4, 5],
      });

      debugTree.query(2);
      debugTree.updatePoint(2, 10);

      expect(eventHandler).toHaveBeenCalled();
    });

    it("should not handle events when debug is disabled", () => {
      const eventHandler = vi.fn();
      const debugTree = new FenwickTree({
        enableDebug: false,
        eventHandlers: [eventHandler],
        initialArray: [1, 2, 3, 4, 5],
      });

      debugTree.query(2);
      debugTree.updatePoint(2, 10);

      expect(eventHandler).not.toHaveBeenCalled();
    });

    it("should add and remove event handlers", () => {
      const eventHandler = vi.fn();
      const debugTree = new FenwickTree({
        enableDebug: true,
        initialArray: [1, 2, 3, 4, 5],
      });

      debugTree.addEventHandler(eventHandler);
      debugTree.query(2);
      expect(eventHandler).toHaveBeenCalled();

      debugTree.removeEventHandler(eventHandler);
      debugTree.query(2);
      expect(eventHandler).toHaveBeenCalledTimes(1); // Only called once
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty tree operations", () => {
      expect(fenwickTree.query(0).result).toBe(0);
      expect(fenwickTree.queryRange(0, 0).result).toBe(0);
      expect(fenwickTree.updatePoint(0, 10).success).toBe(false);
      expect(fenwickTree.updateRange(0, 0, 10).success).toBe(false);
    });

    it("should handle single element array", () => {
      const singleTree = new FenwickTree({ initialArray: [42] });

      expect(singleTree.size()).toBe(1);
      expect(singleTree.query(0).result).toBe(42);
      expect(singleTree.queryRange(0, 0).result).toBe(42);
      expect(singleTree.updatePoint(0, 100).success).toBe(true);
      expect(singleTree.query(0).result).toBe(100);
    });

    it("should handle two element array", () => {
      const twoTree = new FenwickTree({ initialArray: [10, 20] });

      expect(twoTree.size()).toBe(2);
      expect(twoTree.query(1).result).toBe(30);
      expect(twoTree.queryRange(0, 1).result).toBe(30);
      expect(twoTree.queryRange(0, 0).result).toBe(10);
      expect(twoTree.queryRange(1, 1).result).toBe(20);
    });

    it("should clear the tree", () => {
      const initialArray = [1, 2, 3, 4, 5];
      const clearTree = new FenwickTree({ initialArray });
      expect(clearTree.size()).toBe(5);

      clearTree.clear();
      expect(clearTree.size()).toBe(0);
      expect(clearTree.isEmpty()).toBe(true);
      expect(clearTree.query(0).result).toBe(0);
    });

    it("should handle very large arrays", () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => i + 1);
      const largeTree = new FenwickTree({ initialArray: largeArray });

      expect(largeTree.size()).toBe(1000);
      const result = largeTree.query(999);
      expect(result.result).toBe(500500); // Sum of 1 to 1000
    });

    it("should handle negative numbers", () => {
      const negativeArray = [-1, -2, -3, -4, -5];
      const negativeTree = new FenwickTree({ initialArray: negativeArray });

      const result = negativeTree.query(4);
      expect(result.result).toBe(-15);
    });

    it("should handle zero values", () => {
      const zeroArray = [0, 0, 0, 0, 0];
      const zeroTree = new FenwickTree({ initialArray: zeroArray });

      const result = zeroTree.query(4);
      expect(result.result).toBe(0);
    });

    it("should handle mixed positive and negative numbers", () => {
      const mixedArray = [1, -2, 3, -4, 5];
      const mixedTree = new FenwickTree({ initialArray: mixedArray });

      const result = mixedTree.query(4);
      expect(result.result).toBe(3); // 1 + (-2) + 3 + (-4) + 5 = 3
    });
  });

  describe("Performance Benchmarks", () => {
    const runBenchmark = (
      description: string,
      arraySize: number,
      operation: (tree: FenwickTree, size: number) => void
    ) => {
      it(`should perform ${description} with array size ${arraySize}`, () => {
        const benchmarkArray = Array.from({ length: arraySize }, (_, i) => i + 1);
        const benchmarkTree = new FenwickTree({
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

    runBenchmark("prefix sum queries", 100, (tree, size) => {
      for (let i = 0; i < size; i++) {
        tree.query(i);
      }
    });

    runBenchmark("range sum queries", 100, (tree, size) => {
      for (let i = 0; i < size; i++) {
        tree.queryRange(0, i);
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
          tree.query(i);
        } else {
          tree.updatePoint(i, i * 2);
        }
      }
    });

    runBenchmark("large dataset queries", 1000, (tree, size) => {
      for (let i = 0; i < size; i += 10) {
        tree.query(i);
        tree.queryRange(0, i);
      }
    });

    runBenchmark("large dataset updates", 1000, (tree, size) => {
      for (let i = 0; i < size; i += 10) {
        tree.updatePoint(i, i * 2);
        tree.updateRange(i, Math.min(i + 50, size - 1), 5);
      }
    });
  });
});
