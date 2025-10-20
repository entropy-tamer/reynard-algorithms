import { describe, it, expect, beforeEach } from "vitest";
import { KdTree } from "../../spatial-structures/kdtree/kdtree-core";
import type { Point } from "../../spatial-structures/kdtree/kdtree-types";

describe("K-d Tree Performance Tests", () => {
  let kdTree: KdTree;

  beforeEach(() => {
    kdTree = new KdTree({
      config: { enableStats: true },
    });
  });

  describe("Insertion Performance", () => {
    it("should handle small dataset efficiently", () => {
      const points = generateRandomPoints(100, 2);

      const startTime = performance.now();
      kdTree.insertBatch(points);
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(50); // Should be fast for 100 points
      expect(kdTree.size()).toBe(100);
    });

    it("should handle medium dataset efficiently", () => {
      const points = generateRandomPoints(10000, 2);

      const startTime = performance.now();
      kdTree.insertBatch(points);
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(500); // Should be reasonable for 10k points
      expect(kdTree.size()).toBe(10000);
    });

    it("should handle large dataset efficiently", () => {
      const points = generateRandomPoints(100000, 2);

      const startTime = performance.now();
      kdTree.insertBatch(points);
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(2000); // Should be reasonable for 100k points
      expect(kdTree.size()).toBe(100000);
    });

    it("should maintain O(log n) insertion time complexity", () => {
      const sizes = [100, 1000, 10000];
      const times: number[] = [];

      for (const size of sizes) {
        const tree = new KdTree({ config: { enableStats: true } });
        const points = generateRandomPoints(size, 2);

        const startTime = performance.now();
        tree.insertBatch(points);
        const endTime = performance.now();

        times.push(endTime - startTime);
      }

      // Check that time doesn't grow quadratically
      const ratio1 = times[1] / times[0];
      const ratio2 = times[2] / times[1];

      // Should be roughly logarithmic growth
      expect(ratio2).toBeLessThan(ratio1 * 2);
    });
  });

  describe("Search Performance", () => {
    beforeEach(() => {
      // Pre-populate with test data
      const points = generateRandomPoints(10000, 2);
      kdTree.insertBatch(points);
    });

    it("should perform searches efficiently", () => {
      const queryPoints = generateRandomPoints(1000, 2);

      const startTime = performance.now();
      for (const point of queryPoints) {
        kdTree.search(point);
      }
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      const avgTime = executionTime / queryPoints.length;

      expect(avgTime).toBeLessThan(1); // Average search should be very fast
    });

    it("should maintain O(log n) search time complexity", () => {
      const sizes = [1000, 10000, 100000];
      const avgTimes: number[] = [];

      for (const size of sizes) {
        const tree = new KdTree({ config: { enableStats: true } });
        const points = generateRandomPoints(size, 2);
        tree.insertBatch(points);

        const queryPoints = generateRandomPoints(100, 2);
        const startTime = performance.now();
        for (const point of queryPoints) {
          tree.search(point);
        }
        const endTime = performance.now();

        avgTimes.push((endTime - startTime) / queryPoints.length);
      }

      // Check logarithmic growth
      const ratio1 = avgTimes[1] / avgTimes[0];
      const ratio2 = avgTimes[2] / avgTimes[1];

      expect(ratio2).toBeLessThan(ratio1 * 1.5); // Should be roughly logarithmic
    });
  });

  describe("Nearest Neighbor Performance", () => {
    beforeEach(() => {
      const points = generateRandomPoints(10000, 2);
      kdTree.insertBatch(points);
    });

    it("should find nearest neighbors efficiently", () => {
      const queryPoints = generateRandomPoints(100, 2);

      const startTime = performance.now();
      for (const point of queryPoints) {
        kdTree.nearestNeighbor(point);
      }
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      const avgTime = executionTime / queryPoints.length;

      expect(avgTime).toBeLessThan(5); // Should be reasonably fast
    });

    it("should find k-nearest neighbors efficiently", () => {
      const queryPoints = generateRandomPoints(50, 2);

      const startTime = performance.now();
      for (const point of queryPoints) {
        kdTree.kNearestNeighbors(point, { k: 10 });
      }
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      const avgTime = executionTime / queryPoints.length;

      expect(avgTime).toBeLessThan(10); // Should be reasonably fast
    });

    it("should maintain good performance with different k values", () => {
      const queryPoint = { coordinates: [0.5, 0.5] };
      const kValues = [1, 5, 10, 50, 100];

      for (const k of kValues) {
        const startTime = performance.now();
        const result = kdTree.kNearestNeighbors(queryPoint, { k });
        const endTime = performance.now();

        const executionTime = endTime - startTime;
        expect(result.success).toBe(true);
        expect(result.points.length).toBeLessThanOrEqual(k);
        expect(executionTime).toBeLessThan(20); // Should be reasonable for any k
      }
    });
  });

  describe("Range Query Performance", () => {
    beforeEach(() => {
      const points = generateRandomPoints(10000, 2);
      kdTree.insertBatch(points);
    });

    it("should perform range queries efficiently", () => {
      const bounds = [
        { min: [0.2, 0.2], max: [0.3, 0.3] },
        { min: [0.4, 0.4], max: [0.6, 0.6] },
        { min: [0.7, 0.7], max: [0.9, 0.9] },
      ];

      const startTime = performance.now();
      for (const bound of bounds) {
        kdTree.rangeQuery(bound);
      }
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      const avgTime = executionTime / bounds.length;

      expect(avgTime).toBeLessThan(5); // Should be reasonably fast
    });

    it("should handle large range queries efficiently", () => {
      const bounds = { min: [0, 0], max: [1, 1] }; // Query entire space

      const startTime = performance.now();
      const result = kdTree.rangeQuery(bounds);
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      expect(result.success).toBe(true);
      expect(result.count).toBe(10000);
      expect(executionTime).toBeLessThan(100); // Should be reasonable even for large results
    });

    it("should handle small range queries efficiently", () => {
      const bounds = { min: [0.499, 0.499], max: [0.501, 0.501] }; // Very small range

      const startTime = performance.now();
      const result = kdTree.rangeQuery(bounds);
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      expect(result.success).toBe(true);
      expect(executionTime).toBeLessThan(5); // Should be very fast for small results
    });
  });

  describe("Memory Usage", () => {
    it("should have reasonable memory usage", () => {
      const points = generateRandomPoints(10000, 2);
      kdTree.insertBatch(points);

      kdTree.getStats();
      const metrics = kdTree.getPerformanceMetrics();

      // Memory usage should be reasonable (rough estimate: ~1KB per 100 points)
      expect(metrics.memoryUsage).toBeLessThan(200000); // 200KB for 10k points
      expect(metrics.memoryUsage).toBeGreaterThan(0);
    });

    it("should scale memory usage linearly with point count", () => {
      const sizes = [1000, 5000, 10000];
      const memoryUsages: number[] = [];

      for (const size of sizes) {
        const tree = new KdTree({ config: { enableStats: true } });
        const points = generateRandomPoints(size, 2);
        tree.insertBatch(points);

        const metrics = tree.getPerformanceMetrics();
        memoryUsages.push(metrics.memoryUsage);
      }

      // Memory should scale roughly linearly
      const ratio1 = memoryUsages[1] / memoryUsages[0];
      const ratio2 = memoryUsages[2] / memoryUsages[1];

      expect(ratio1).toBeCloseTo(5, 1); // 5x points should use ~5x memory
      expect(ratio2).toBeCloseTo(2, 0.5); // 2x points should use ~2x memory
    });
  });

  describe("Tree Balance", () => {
    it("should maintain reasonable balance with random data", () => {
      const points = generateRandomPoints(10000, 2);
      kdTree.insertBatch(points);

      kdTree.getStats();
      const metrics = kdTree.getPerformanceMetrics();

      // Tree should be reasonably balanced
      expect(metrics.balanceRatio).toBeGreaterThan(0.5);
      expect(metrics.balanceRatio).toBeGreaterThan(0.3); // Tree should be reasonably balanced
    });

    it("should handle worst-case insertion order", () => {
      // Insert points in sorted order (worst case for naive insertion)
      const points: Point[] = [];
      for (let i = 0; i < 1000; i++) {
        points.push({ coordinates: [i, i] });
      }

      kdTree.insertBatch(points);

      kdTree.getStats();
      const metrics = kdTree.getPerformanceMetrics();

      // Even with worst-case data, should maintain some balance
      expect(metrics.balanceRatio).toBeGreaterThan(0.3);
    });

    it("should improve balance after rebuilding", () => {
      // Create unbalanced tree
      const points: Point[] = [];
      for (let i = 0; i < 1000; i++) {
        points.push({ coordinates: [i, 0] }); // All on x-axis
      }
      kdTree.insertBatch(points);

      const balanceBefore = kdTree.getPerformanceMetrics().balanceRatio;

      kdTree.rebuild();

      const balanceAfter = kdTree.getPerformanceMetrics().balanceRatio;

      expect(balanceAfter).toBeGreaterThanOrEqual(balanceBefore);
    });
  });

  describe("3D Performance", () => {
    it("should handle 3D points efficiently", () => {
      const tree3D = new KdTree({
        config: { dimensions: 3, enableStats: true },
      });

      const points = generateRandomPoints(10000, 3);

      const startTime = performance.now();
      tree3D.insertBatch(points);
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(1000); // Should be reasonable for 3D
      expect(tree3D.size()).toBe(10000);
    });

    it("should perform 3D nearest neighbor searches efficiently", () => {
      const tree3D = new KdTree({
        config: { dimensions: 3, enableStats: true },
      });

      const points = generateRandomPoints(10000, 3);
      tree3D.insertBatch(points);

      const queryPoints = generateRandomPoints(100, 3);

      const startTime = performance.now();
      for (const point of queryPoints) {
        tree3D.nearestNeighbor(point);
      }
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      const avgTime = executionTime / queryPoints.length;

      expect(avgTime).toBeLessThan(10); // Should be reasonable for 3D
    });
  });

  describe("High-Dimensional Performance", () => {
    it("should handle high-dimensional points", () => {
      const tree5D = new KdTree({
        config: { dimensions: 5, enableStats: true },
      });

      const points = generateRandomPoints(1000, 5);

      const startTime = performance.now();
      tree5D.insertBatch(points);
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(500); // Should be reasonable for 5D
      expect(tree5D.size()).toBe(1000);
    });

    it("should perform high-dimensional searches", () => {
      const tree5D = new KdTree({
        config: { dimensions: 5, enableStats: true },
      });

      const points = generateRandomPoints(1000, 5);
      tree5D.insertBatch(points);

      const queryPoint = { coordinates: [0.5, 0.5, 0.5, 0.5, 0.5] };

      const startTime = performance.now();
      const result = tree5D.nearestNeighbor(queryPoint);
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      expect(result.success).toBe(true);
      expect(executionTime).toBeLessThan(10); // Should be reasonable
    });
  });
});

// Helper function to generate random points
/**
 *
 * @param count
 * @param dimensions
 * @example
 */
function generateRandomPoints(count: number, dimensions: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    const coordinates: number[] = [];
    for (let d = 0; d < dimensions; d++) {
      coordinates.push(Math.random());
    }
    points.push({ coordinates });
  }
  return points;
}
