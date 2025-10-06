/**
 * Optimized Algorithms Test Suite
 *
 * This test suite validates the refactored algorithms package with
 * PAW optimization integration and automatic algorithm selection.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkCollision } from "../../geometry/collision/aabb-collision";
import type { AABB } from "../../geometry/collision/aabb-types";
import { AlgorithmSelector, EnhancedMemoryPool as MemoryPool } from "../../optimization";
import {
  OptimizationConfig,
  PerformanceMonitor,
  cleanup,
  configureOptimization,
  detectCollisions,
  performSpatialQuery,
} from "../../optimized";
import { findConnectedComponents } from "../../union-find";

describe("Optimized Algorithms API", () => {
  beforeEach(() => {
    // Reset global configuration before each test
    configureOptimization({
      enableMemoryPooling: true,
      enableAlgorithmSelection: true,
      enablePerformanceMonitoring: true,
      algorithmSelectionStrategy: "adaptive",
    });
  });

  afterEach(() => {
    // Clean up global instances after each test
    cleanup();
  });

  describe("detectCollisions", () => {
    it("should detect collisions between overlapping AABBs", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 100, height: 100 },
        { x: 50, y: 50, width: 100, height: 100 },
        { x: 200, y: 200, width: 50, height: 50 },
      ];

      const collisions = detectCollisions(aabbs);

      expect(collisions).toHaveLength(1);
      expect(collisions[0].a).toBe(0);
      expect(collisions[0].b).toBe(1);
      expect(collisions[0].result.colliding).toBe(true);
    });

    it("should return empty array for non-overlapping AABBs", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 50, height: 50 },
        { x: 100, y: 100, width: 50, height: 50 },
      ];

      const collisions = detectCollisions(aabbs);

      expect(collisions).toHaveLength(0);
    });

    it("should handle large datasets efficiently", () => {
      const aabbs: AABB[] = [];

      // Generate 100 AABBs
      for (let i = 0; i < 100; i++) {
        aabbs.push({
          x: i * 10,
          y: i * 10,
          width: 50,
          height: 50,
        });
      }

      const start = performance.now();
      const collisions = detectCollisions(aabbs);
      const duration = performance.now() - start;

      expect(collisions.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });

    it("should automatically select optimal algorithm based on dataset size", () => {
      // Small dataset - should use naive algorithm
      const smallAabbs: AABB[] = [
        { x: 0, y: 0, width: 50, height: 50 },
        { x: 25, y: 25, width: 50, height: 50 },
      ];

      const smallCollisions = detectCollisions(smallAabbs);
      expect(smallCollisions).toHaveLength(1);

      // Large dataset - should use optimized algorithm
      const largeAabbs: AABB[] = [];
      for (let i = 0; i < 200; i++) {
        largeAabbs.push({
          x: i * 5,
          y: i * 5,
          width: 30,
          height: 30,
        });
      }

      const largeCollisions = detectCollisions(largeAabbs);
      expect(largeCollisions.length).toBeGreaterThan(0);
    });
  });

  describe("performSpatialQuery", () => {
    it("should find objects within query AABB", () => {
      const spatialObjects = [
        { aabb: { x: 0, y: 0, width: 50, height: 50 }, data: "object1" },
        { aabb: { x: 100, y: 100, width: 50, height: 50 }, data: "object2" },
        { aabb: { x: 25, y: 25, width: 50, height: 50 }, data: "object3" },
      ];

      const queryAABB: AABB = { x: 0, y: 0, width: 100, height: 100 };
      const nearby = performSpatialQuery(queryAABB, spatialObjects);

      expect(nearby).toHaveLength(2);
      expect(nearby.map(obj => obj.data)).toContain("object1");
      expect(nearby.map(obj => obj.data)).toContain("object3");
    });
  });

  describe("findConnectedComponents", () => {
    it("should find connected components from edges", () => {
      const edges: Array<[number, number]> = [
        [0, 1],
        [1, 2],
        [3, 4],
      ];

      const components = findConnectedComponents(edges);

      expect(components).toHaveLength(2);
      expect(components[0]).toEqual([0, 1, 2]);
      expect(components[1]).toEqual([3, 4]);
    });

    it("should handle isolated objects", () => {
      const edges: Array<[number, number]> = [[0, 1]];

      const components = findConnectedComponents(edges);

      expect(components).toHaveLength(1);
      expect(components[0]).toEqual([0, 1]);
    });
  });

  describe("checkCollision", () => {
    it("should detect collision between overlapping AABBs", () => {
      const a: AABB = { x: 0, y: 0, width: 100, height: 100 };
      const b: AABB = { x: 50, y: 50, width: 100, height: 100 };

      const result = checkCollision(a, b);
      expect(result.colliding).toBe(true);
      expect(result.overlapArea).toBeGreaterThan(0);
    });

    it("should not detect collision between non-overlapping AABBs", () => {
      const a: AABB = { x: 0, y: 0, width: 50, height: 50 };
      const b: AABB = { x: 100, y: 100, width: 50, height: 50 };

      const result = checkCollision(a, b);
      expect(result.colliding).toBe(false);
      expect(result.overlapArea).toBe(0);
    });

    it("should detect collision for touching AABBs", () => {
      const a: AABB = { x: 0, y: 0, width: 50, height: 50 };
      const b: AABB = { x: 50, y: 0, width: 50, height: 50 };

      const result = checkCollision(a, b);
      expect(result.colliding).toBe(true);
    });
  });

  describe("PerformanceMonitor", () => {
    it("should track performance statistics", () => {
      const monitor = new PerformanceMonitor();

      // Perform some operations
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 50, height: 50 },
        { x: 25, y: 25, width: 50, height: 50 },
      ];

      detectCollisions(aabbs);
      detectCollisions(aabbs);
      detectCollisions(aabbs);

      const stats = monitor.getPerformanceStats();
      expect(stats.totalQueries).toBe(3);
      expect(stats.averageExecutionTime).toBeGreaterThan(0);
    });

    it("should provide memory pool statistics", () => {
      const monitor = new PerformanceMonitor();

      // Perform operations to generate pool usage
      const aabbs: AABB[] = [];
      for (let i = 0; i < 100; i++) {
        aabbs.push({
          x: i * 5,
          y: i * 5,
          width: 30,
          height: 30,
        });
      }

      // Perform multiple operations to trigger memory pooling
      for (let i = 0; i < 10; i++) {
        detectCollisions(aabbs);
      }

      const poolStats = monitor.getMemoryPoolStats();
      expect(poolStats.totalAllocations).toBeGreaterThanOrEqual(0);
      expect(poolStats.hitRate).toBeGreaterThanOrEqual(0);
    });

    it("should provide optimization recommendations", () => {
      const monitor = new PerformanceMonitor();

      const recommendations = monitor.getOptimizationRecommendations();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it("should detect performance degradation", () => {
      const monitor = new PerformanceMonitor();

      const isDegraded = monitor.isPerformanceDegraded();
      expect(typeof isDegraded).toBe("boolean");
    });

    it("should generate comprehensive performance report", () => {
      const monitor = new PerformanceMonitor();

      const report = monitor.getPerformanceReport();
      expect(report).toHaveProperty("summary");
      expect(report).toHaveProperty("algorithmUsage");
      expect(report).toHaveProperty("memoryPool");
      expect(report).toHaveProperty("recommendations");
    });

    it("should reset statistics", () => {
      const monitor = new PerformanceMonitor();

      // Perform operations
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 50, height: 50 },
        { x: 25, y: 25, width: 50, height: 50 },
      ];

      detectCollisions(aabbs);

      const statsBefore = monitor.getPerformanceStats();
      expect(statsBefore.totalQueries).toBe(1);

      monitor.resetStatistics();

      const statsAfter = monitor.getPerformanceStats();
      expect(statsAfter.totalQueries).toBe(0);
    });
  });

  describe("OptimizationConfig", () => {
    it("should allow configuration updates", () => {
      const config = new OptimizationConfig();

      config.update({
        algorithmSelectionStrategy: "spatial",
        enableMemoryPooling: false,
      });

      const currentConfig = config.getConfig();
      expect(currentConfig.algorithmSelectionStrategy).toBe("spatial");
      expect(currentConfig.enableMemoryPooling).toBe(false);
    });

    it("should provide convenience methods for common configurations", () => {
      const config = new OptimizationConfig();

      config.enableMemoryPooling();
      config.setAlgorithmStrategy("optimized");
      config.setPerformanceThresholds({
        maxExecutionTime: 8,
        minHitRate: 95,
      });

      const currentConfig = config.getConfig();
      expect(currentConfig.enableMemoryPooling).toBe(true);
      expect(currentConfig.algorithmSelectionStrategy).toBe("optimized");
      expect(currentConfig.performanceThresholds.maxExecutionTime).toBe(8);
      expect(currentConfig.performanceThresholds.minHitRate).toBe(95);
    });
  });

  describe("AlgorithmSelector", () => {
    it("should select optimal collision detection algorithm", () => {
      const selector = new AlgorithmSelector();

      const workload = {
        objectCount: 100,
        spatialDensity: 0.5,
        overlapRatio: 0.3,
        updateFrequency: 5,
        queryPattern: "random" as const,
      };

      const selection = selector.selectCollisionAlgorithm(workload);

      expect(selection).toHaveProperty("algorithm");
      expect(selection).toHaveProperty("confidence");
      expect(selection).toHaveProperty("expectedPerformance");
      expect(selection).toHaveProperty("reasoning");
      expect(selection.confidence).toBeGreaterThan(0);
      expect(selection.confidence).toBeLessThanOrEqual(1);
    });

    it("should provide selection statistics", () => {
      const selector = new AlgorithmSelector();

      const stats = selector.getSelectionStats();
      expect(stats).toHaveProperty("totalSelections");
      expect(stats).toHaveProperty("correctSelections");
      expect(stats).toHaveProperty("averageConfidence");
      expect(stats).toHaveProperty("performanceImprovement");
    });

    it("should track performance history", () => {
      const selector = new AlgorithmSelector();

      const history = selector.getPerformanceHistory();
      expect(Array.isArray(history)).toBe(true);
    });

    it("should clear performance history", () => {
      const selector = new AlgorithmSelector();

      selector.clearPerformanceHistory();
      const history = selector.getPerformanceHistory();
      expect(history).toHaveLength(0);
    });
  });

  describe("MemoryPool", () => {
    it("should provide memory pool statistics", () => {
      const pool = new MemoryPool();

      const stats = pool.getStatistics();
      expect(stats).toHaveProperty("totalAllocations");
      expect(stats).toHaveProperty("poolHits");
      expect(stats).toHaveProperty("poolMisses");
      expect(stats).toHaveProperty("hitRate");
    });

    it("should provide pool information", () => {
      const pool = new MemoryPool();

      const info = pool.getPoolInfo();
      expect(info).toHaveProperty("spatialHashPool");
      expect(info).toHaveProperty("unionFindPool");
      expect(info).toHaveProperty("collisionArrayPool");
      expect(info).toHaveProperty("processedSetPool");
    });

    it("should provide optimization recommendations", () => {
      const pool = new MemoryPool();

      const recommendations = pool.getOptimizationRecommendations();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it("should optimize for specific workloads", () => {
      const pool = new MemoryPool();

      const workload = {
        objectCount: 200,
        spatialDensity: 0.8,
        updateFrequency: 15,
      };

      // This should not throw
      expect(() => pool.optimizeForWorkload(workload)).not.toThrow();
    });

    it("should clean up resources when destroyed", () => {
      const pool = new MemoryPool();

      // This should not throw
      expect(() => pool.destroy()).not.toThrow();
    });
  });

  describe("Global Configuration", () => {
    it("should allow global configuration updates", () => {
      configureOptimization({
        algorithmSelectionStrategy: "naive",
        enableMemoryPooling: false,
      });

      // Perform operation to verify configuration
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 50, height: 50 },
        { x: 25, y: 25, width: 50, height: 50 },
      ];

      const collisions = detectCollisions(aabbs);
      expect(collisions).toHaveLength(1);
    });

    it("should clean up global instances", () => {
      // Perform operations to create global instances
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 50, height: 50 },
        { x: 25, y: 25, width: 50, height: 50 },
      ];

      detectCollisions(aabbs);

      // Cleanup should not throw
      expect(() => cleanup()).not.toThrow();
    });
  });

  describe("Performance Integration", () => {
    it("should maintain performance across multiple operations", () => {
      const aabbs: AABB[] = [];

      // Generate test data
      for (let i = 0; i < 50; i++) {
        aabbs.push({
          x: i * 10,
          y: i * 10,
          width: 50,
          height: 50,
        });
      }

      const start = performance.now();

      // Perform multiple operations
      for (let i = 0; i < 10; i++) {
        detectCollisions(aabbs);
      }

      const duration = performance.now() - start;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(500);
    });

    it("should show memory pool effectiveness", () => {
      const monitor = new PerformanceMonitor();

      // Perform operations to generate pool usage
      const aabbs: AABB[] = [];
      for (let i = 0; i < 100; i++) {
        aabbs.push({
          x: i * 5,
          y: i * 5,
          width: 30,
          height: 30,
        });
      }

      // Perform multiple operations
      for (let i = 0; i < 20; i++) {
        detectCollisions(aabbs);
      }

      const poolStats = monitor.getMemoryPoolStats();

      // Should have high hit rate due to pooling
      expect(poolStats.hitRate).toBeGreaterThan(80);
      expect(poolStats.poolHits).toBeGreaterThan(0);
    });
  });
});
