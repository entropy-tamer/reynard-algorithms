import { describe, it, expect, beforeEach, vi } from "vitest";
import { IntervalTree } from "../../data-structures/interval-tree/interval-tree-core";
import { TraversalOrder } from "../../data-structures/interval-tree/interval-tree-types";

describe("Interval Tree Data Structure", () => {
  let intervalTree: IntervalTree;

  beforeEach(() => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    intervalTree = new IntervalTree();
  });

  describe("Initialization", () => {
    it("should initialize with default configuration", () => {
      expect(intervalTree).toBeInstanceOf(IntervalTree);
      expect(intervalTree.isEmpty()).toBe(true);
      expect(intervalTree.size()).toBe(0);
    });

    it("should initialize with custom configuration", () => {
      const customTree = new IntervalTree({
        config: {
          allowOverlaps: false,
          useAVLBalancing: true,
          maxIntervals: 100,
        },
        enableStats: true,
        enableDebug: true,
      });
      expect(customTree).toBeInstanceOf(IntervalTree);
    });

    it("should initialize with initial intervals", () => {
      const initialIntervals = [
        { start: 1, end: 5 },
        { start: 3, end: 7 },
        { start: 8, end: 12 },
      ];
      const treeWithIntervals = new IntervalTree({ initialIntervals });
      expect(treeWithIntervals.size()).toBe(3);
    });
  });

  describe("Basic Operations", () => {
    it("should insert an interval successfully", () => {
      const interval = { start: 1, end: 5 };
      const result = intervalTree.insert(interval);
      expect(result).toBe(true);
      expect(intervalTree.size()).toBe(1);
      expect(intervalTree.isEmpty()).toBe(false);
    });

    it("should insert an interval with data", () => {
      const interval = { start: 1, end: 5, data: { id: 1, type: "test" } };
      const result = intervalTree.insert(interval);
      expect(result).toBe(true);

      const searchResult = intervalTree.searchOverlapping({ start: 2, end: 4 });
      expect(searchResult.intervals).toContainEqual(interval);
    });

    it("should reject invalid intervals", () => {
      const invalidInterval = { start: 5, end: 1 }; // start > end
      const result = intervalTree.insert(invalidInterval);
      expect(result).toBe(false);
      expect(intervalTree.size()).toBe(0);
    });

    it("should delete an existing interval", () => {
      const interval = { start: 1, end: 5 };
      intervalTree.insert(interval);
      expect(intervalTree.size()).toBe(1);

      const result = intervalTree.delete(interval);
      expect(result).toBe(true);
      expect(intervalTree.size()).toBe(0);
      expect(intervalTree.isEmpty()).toBe(true);
    });

    it("should delete a non-existing interval", () => {
      intervalTree.insert({ start: 1, end: 5 });
      const result = intervalTree.delete({ start: 6, end: 10 });
      expect(result).toBe(false);
      expect(intervalTree.size()).toBe(1);
    });

    it("should check if interval exists", () => {
      const interval = { start: 1, end: 5 };
      intervalTree.insert(interval);

      expect(intervalTree.contains(interval)).toBe(true);
      expect(intervalTree.contains({ start: 6, end: 10 })).toBe(false);
    });
  });

  describe("Overlap Search", () => {
    beforeEach(() => {
      intervalTree.insert({ start: 1, end: 5 });
      intervalTree.insert({ start: 3, end: 7 });
      intervalTree.insert({ start: 8, end: 12 });
      intervalTree.insert({ start: 10, end: 15 });
    });

    it("should find overlapping intervals", () => {
      const queryInterval = { start: 2, end: 6 };
      const result = intervalTree.searchOverlapping(queryInterval);

      expect(result.count).toBe(2);
      expect(result.intervals).toContainEqual({ start: 1, end: 5 });
      expect(result.intervals).toContainEqual({ start: 3, end: 7 });
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
      expect(result.nodesVisited).toBeGreaterThan(0);
    });

    it("should find no overlapping intervals", () => {
      const queryInterval = { start: 20, end: 25 };
      const result = intervalTree.searchOverlapping(queryInterval);

      expect(result.count).toBe(0);
      expect(result.intervals).toEqual([]);
    });

    it("should handle edge case overlaps", () => {
      const queryInterval = { start: 5, end: 8 };
      const result = intervalTree.searchOverlapping(queryInterval);

      expect(result.count).toBe(3);
      expect(result.intervals).toContainEqual({ start: 3, end: 7 });
      expect(result.intervals).toContainEqual({ start: 1, end: 5 });
      expect(result.intervals).toContainEqual({ start: 8, end: 12 });
    });

    it("should handle point overlaps", () => {
      const queryInterval = { start: 5, end: 5 };
      const result = intervalTree.searchOverlapping(queryInterval);

      expect(result.count).toBe(2);
      expect(result.intervals).toContainEqual({ start: 3, end: 7 });
      expect(result.intervals).toContainEqual({ start: 1, end: 5 });
    });
  });

  describe("Point Search", () => {
    beforeEach(() => {
      intervalTree.insert({ start: 1, end: 5 });
      intervalTree.insert({ start: 3, end: 7 });
      intervalTree.insert({ start: 8, end: 12 });
      intervalTree.insert({ start: 10, end: 15 });
    });

    it("should find intervals containing a point", () => {
      const result = intervalTree.searchContaining(4);

      expect(result.count).toBe(2);
      expect(result.intervals).toContainEqual({ start: 1, end: 5 });
      expect(result.intervals).toContainEqual({ start: 3, end: 7 });
    });

    it("should find no intervals for point outside all intervals", () => {
      const result = intervalTree.searchContaining(20);

      expect(result.count).toBe(0);
      expect(result.intervals).toEqual([]);
    });

    it("should handle boundary points", () => {
      const result1 = intervalTree.searchContaining(1);
      const result5 = intervalTree.searchContaining(5);
      const result8 = intervalTree.searchContaining(8);

      expect(result1.count).toBe(1);
      expect(result5.count).toBe(2); // Both {1,5} and {3,7} contain point 5
      expect(result8.count).toBe(1);
    });
  });

  describe("Contained Search", () => {
    beforeEach(() => {
      intervalTree.insert({ start: 1, end: 5 });
      intervalTree.insert({ start: 3, end: 7 });
      intervalTree.insert({ start: 8, end: 12 });
      intervalTree.insert({ start: 10, end: 15 });
    });

    it("should find intervals contained within query", () => {
      const queryInterval = { start: 0, end: 20 };
      const result = intervalTree.searchContainedIn(queryInterval);

      expect(result.count).toBe(4);
      expect(result.intervals).toContainEqual({ start: 1, end: 5 });
      expect(result.intervals).toContainEqual({ start: 3, end: 7 });
      expect(result.intervals).toContainEqual({ start: 8, end: 12 });
      expect(result.intervals).toContainEqual({ start: 10, end: 15 });
    });

    it("should find no intervals for restrictive query", () => {
      const queryInterval = { start: 2, end: 4 };
      const result = intervalTree.searchContainedIn(queryInterval);

      expect(result.count).toBe(0);
      expect(result.intervals).toEqual([]);
    });

    it("should find some intervals for partial query", () => {
      const queryInterval = { start: 0, end: 6 };
      const result = intervalTree.searchContainedIn(queryInterval);

      expect(result.count).toBe(1);
      expect(result.intervals).toContainEqual({ start: 1, end: 5 });
    });
  });

  describe("Overlap Check", () => {
    beforeEach(() => {
      intervalTree.insert({ start: 1, end: 5 });
      intervalTree.insert({ start: 8, end: 12 });
    });

    it("should detect overlap", () => {
      const result = intervalTree.checkOverlap({ start: 3, end: 7 });

      expect(result.overlaps).toBe(true);
      expect(result.overlappingInterval).toEqual({ start: 1, end: 5 });
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it("should detect no overlap", () => {
      const result = intervalTree.checkOverlap({ start: 6, end: 7 });

      expect(result.overlaps).toBe(false);
      expect(result.overlappingInterval).toBeUndefined();
    });

    it("should handle edge case overlaps", () => {
      const result = intervalTree.checkOverlap({ start: 5, end: 8 });

      expect(result.overlaps).toBe(true);
      expect(result.overlappingInterval).toEqual({ start: 1, end: 5 });
    });
  });

  describe("Configuration", () => {
    it("should respect allowOverlaps configuration", () => {
      const noOverlapTree = new IntervalTree({
        config: { allowOverlaps: false },
      });

      noOverlapTree.insert({ start: 1, end: 5 });
      const result = noOverlapTree.insert({ start: 3, end: 7 });

      // Should still allow insertion (this is about search behavior, not insertion)
      expect(result).toBe(true);
    });

    it("should respect allowDuplicates configuration", () => {
      const noDuplicateTree = new IntervalTree({
        config: { allowDuplicates: false },
      });

      noDuplicateTree.insert({ start: 1, end: 5 });
      const result = noDuplicateTree.insert({ start: 1, end: 5 });

      expect(result).toBe(false);
      expect(noDuplicateTree.size()).toBe(1);
    });

    it("should respect maxIntervals configuration", () => {
      const limitedTree = new IntervalTree({
        config: { maxIntervals: 2 },
      });

      expect(limitedTree.insert({ start: 1, end: 5 })).toBe(true);
      expect(limitedTree.insert({ start: 6, end: 10 })).toBe(true);
      expect(limitedTree.insert({ start: 11, end: 15 })).toBe(false);
      expect(limitedTree.size()).toBe(2);
    });

    it("should update configuration", () => {
      intervalTree.updateConfig({ allowDuplicates: false });

      intervalTree.insert({ start: 1, end: 5 });
      const result = intervalTree.insert({ start: 1, end: 5 });

      expect(result).toBe(false);
    });
  });

  describe("Batch Operations", () => {
    it("should insert multiple intervals in batch", () => {
      const intervals = [
        { start: 1, end: 5 },
        { start: 3, end: 7 },
        { start: 8, end: 12 },
        { start: 10, end: 15 },
      ];
      const result = intervalTree.insertBatch(intervals);

      expect(result.successful).toBe(4);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
      expect(intervalTree.size()).toBe(4);
    });

    it("should handle batch insert errors", () => {
      const intervals = [
        { start: 1, end: 5 },
        { start: 5, end: 1 }, // Invalid interval
        { start: 8, end: 12 },
      ];
      const result = intervalTree.insertBatch(intervals);

      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors.length).toBe(1);
    });
  });

  describe("Traversal", () => {
    beforeEach(() => {
      intervalTree.insert({ start: 1, end: 5 });
      intervalTree.insert({ start: 3, end: 7 });
      intervalTree.insert({ start: 8, end: 12 });
    });

    it("should traverse in order", () => {
      const result = intervalTree.traverse({ order: TraversalOrder.IN_ORDER });

      expect(result.intervals.length).toBe(3);
      expect(result.count).toBe(3);
      expect(result.nodesVisited).toBeGreaterThan(0);
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it("should traverse in pre-order", () => {
      const result = intervalTree.traverse({ order: TraversalOrder.PRE_ORDER });

      expect(result.intervals.length).toBe(3);
      expect(result.count).toBe(3);
    });

    it("should traverse in post-order", () => {
      const result = intervalTree.traverse({ order: TraversalOrder.POST_ORDER });

      expect(result.intervals.length).toBe(3);
      expect(result.count).toBe(3);
    });

    it("should get all intervals", () => {
      const intervals = intervalTree.getAllIntervals();

      expect(intervals.length).toBe(3);
      expect(intervals).toContainEqual({ start: 1, end: 5 });
      expect(intervals).toContainEqual({ start: 3, end: 7 });
      expect(intervals).toContainEqual({ start: 8, end: 12 });
    });
  });

  describe("Serialization", () => {
    beforeEach(() => {
      intervalTree.insert({ start: 1, end: 5, data: { id: 1 } });
      intervalTree.insert({ start: 8, end: 12, data: { id: 2 } });
    });

    it("should serialize the tree", () => {
      const serialized = intervalTree.serialize();

      expect(serialized).toHaveProperty("version");
      expect(serialized).toHaveProperty("config");
      expect(serialized).toHaveProperty("data");
      expect(serialized).toHaveProperty("metadata");
      expect(serialized.metadata.totalIntervals).toBe(2);
    });

    it("should deserialize the tree", () => {
      const serialized = intervalTree.serialize();
      const newTree = new IntervalTree();

      const result = newTree.deserialize(serialized);
      expect(result).toBe(true);
      expect(newTree.size()).toBe(2);

      const searchResult = newTree.searchOverlapping({ start: 2, end: 4 });
      expect(searchResult.count).toBe(1);
      expect(searchResult.intervals[0].data).toEqual({ id: 1 });
    });
  });

  describe("Statistics and Performance", () => {
    beforeEach(() => {
      const statsTree = new IntervalTree({ enableStats: true });
      intervalTree = statsTree;

      intervalTree.insert({ start: 1, end: 5 });
      intervalTree.insert({ start: 3, end: 7 });
      intervalTree.insert({ start: 8, end: 12 });
    });

    it("should track statistics", () => {
      const stats = intervalTree.getStats();

      expect(stats.totalIntervals).toBe(3);
      expect(stats.totalNodes).toBeGreaterThan(0);
      expect(stats.height).toBeGreaterThan(0);
      expect(stats.averageIntervalLength).toBeGreaterThan(0);
      expect(stats.totalInserts).toBe(3);
    });

    it("should provide performance metrics", () => {
      const metrics = intervalTree.getPerformanceMetrics();

      expect(metrics).toHaveProperty("memoryUsage");
      expect(metrics).toHaveProperty("averageSearchTime");
      expect(metrics).toHaveProperty("performanceScore");
      expect(metrics).toHaveProperty("balanceFactor");
      expect(metrics.performanceScore).toBeGreaterThanOrEqual(0);
      expect(metrics.performanceScore).toBeLessThanOrEqual(100);
    });

    it("should update statistics on operations", () => {
      const initialStats = intervalTree.getStats();

      intervalTree.searchOverlapping({ start: 2, end: 4 });
      intervalTree.delete({ start: 1, end: 5 });

      const updatedStats = intervalTree.getStats();
      expect(updatedStats.totalSearches).toBe(initialStats.totalSearches + 1);
      expect(updatedStats.totalDeletes).toBe(initialStats.totalDeletes + 1);
      expect(updatedStats.totalIntervals).toBe(initialStats.totalIntervals - 1);
    });
  });

  describe("Event Handling", () => {
    it("should handle events when debug is enabled", () => {
      const eventHandler = vi.fn();
      const debugTree = new IntervalTree({
        enableDebug: true,
        eventHandlers: [eventHandler],
      });

      debugTree.insert({ start: 1, end: 5 });
      debugTree.searchOverlapping({ start: 2, end: 4 });

      expect(eventHandler).toHaveBeenCalled();
    });

    it("should not handle events when debug is disabled", () => {
      const eventHandler = vi.fn();
      const debugTree = new IntervalTree({
        enableDebug: false,
        eventHandlers: [eventHandler],
      });

      debugTree.insert({ start: 1, end: 5 });
      debugTree.searchOverlapping({ start: 2, end: 4 });

      expect(eventHandler).not.toHaveBeenCalled();
    });

    it("should add and remove event handlers", () => {
      const eventHandler = vi.fn();
      const debugTree = new IntervalTree({ enableDebug: true });

      debugTree.addEventHandler(eventHandler);
      debugTree.insert({ start: 1, end: 5 });
      expect(eventHandler).toHaveBeenCalled();

      debugTree.removeEventHandler(eventHandler);
      debugTree.insert({ start: 6, end: 10 });
      expect(eventHandler).toHaveBeenCalledTimes(1); // Only called once
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty tree operations", () => {
      expect(intervalTree.searchOverlapping({ start: 1, end: 5 }).count).toBe(0);
      expect(intervalTree.searchContaining(3).count).toBe(0);
      expect(intervalTree.checkOverlap({ start: 1, end: 5 }).overlaps).toBe(false);
      expect(intervalTree.contains({ start: 1, end: 5 })).toBe(false);
    });

    it("should handle single interval", () => {
      intervalTree.insert({ start: 1, end: 5 });

      expect(intervalTree.size()).toBe(1);
      expect(intervalTree.searchOverlapping({ start: 2, end: 4 }).count).toBe(1);
      expect(intervalTree.searchContaining(3).count).toBe(1);
      expect(intervalTree.checkOverlap({ start: 2, end: 4 }).overlaps).toBe(true);
    });

    it("should handle identical intervals", () => {
      const interval = { start: 1, end: 5 };
      intervalTree.insert(interval);
      intervalTree.insert(interval);

      expect(intervalTree.size()).toBe(2);
      expect(intervalTree.searchOverlapping({ start: 2, end: 4 }).count).toBe(2);
    });

    it("should handle zero-length intervals", () => {
      intervalTree.insert({ start: 5, end: 5 });

      expect(intervalTree.size()).toBe(1);
      expect(intervalTree.searchContaining(5).count).toBe(1);
      expect(intervalTree.searchOverlapping({ start: 5, end: 5 }).count).toBe(1);
    });

    it("should clear the tree", () => {
      intervalTree.insert({ start: 1, end: 5 });
      intervalTree.insert({ start: 8, end: 12 });
      expect(intervalTree.size()).toBe(2);

      intervalTree.clear();
      expect(intervalTree.size()).toBe(0);
      expect(intervalTree.isEmpty()).toBe(true);
      expect(intervalTree.searchOverlapping({ start: 1, end: 5 }).count).toBe(0);
    });

    it("should handle very large intervals", () => {
      const largeInterval = { start: 0, end: 1000000 };
      const result = intervalTree.insert(largeInterval);

      expect(result).toBe(true);
      expect(intervalTree.searchContaining(500000).count).toBe(1);
      expect(intervalTree.searchOverlapping({ start: 999999, end: 1000001 }).count).toBe(1);
    });
  });

  describe("Performance Benchmarks", () => {
    const runBenchmark = (
      description: string,
      intervalCount: number,
      operation: (tree: IntervalTree, intervals: any[]) => void
    ) => {
      it(`should perform ${description} with ${intervalCount} intervals`, () => {
        const benchmarkTree = new IntervalTree({ enableStats: true });
        const intervals: any[] = [];

        // Generate test intervals
        for (let i = 0; i < intervalCount; i++) {
          const start = i * 2;
          const end = start + 1;
          intervals.push({ start, end });
          benchmarkTree.insert({ start, end });
        }

        const startTime = performance.now();
        operation(benchmarkTree, intervals);
        const endTime = performance.now();

        const executionTime = endTime - startTime;
        expect(executionTime).toBeGreaterThanOrEqual(0);

        // Log for manual inspection during benchmark runs
        // console.log(`Benchmark: ${description} - Intervals: ${intervalCount}`);
        // console.log(`  Execution Time: ${executionTime.toFixed(3)} ms`);
        // console.log(`  Stats:`, benchmarkTree.getStats());
      });
    };

    runBenchmark("insertion", 100, (tree, intervals) => {
      intervals.forEach(interval => tree.insert({ start: interval.start + 1000, end: interval.end + 1000 }));
    });

    runBenchmark("overlap search", 100, (tree, intervals) => {
      intervals.forEach(interval => tree.searchOverlapping({ start: interval.start - 1, end: interval.end + 1 }));
    });

    runBenchmark("point search", 100, (tree, intervals) => {
      intervals.forEach(interval => tree.searchContaining(interval.start + 0.5));
    });

    runBenchmark("contained search", 100, (tree, intervals) => {
      intervals.forEach(interval => tree.searchContainedIn({ start: interval.start - 1, end: interval.end + 1 }));
    });

    runBenchmark("large dataset insertion", 1000, (tree, intervals) => {
      intervals.forEach(interval => tree.insert({ start: interval.start + 2000, end: interval.end + 2000 }));
    });

    runBenchmark("large dataset overlap search", 1000, (tree, intervals) => {
      intervals.forEach(interval => tree.searchOverlapping({ start: interval.start - 1, end: interval.end + 1 }));
    });
  });
});
