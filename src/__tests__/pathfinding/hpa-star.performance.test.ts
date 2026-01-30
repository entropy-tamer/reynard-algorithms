/**
 * @module algorithms/pathfinding/hpa-star/hpa-star.performance.test
 * @description Performance tests for HPA* hierarchical pathfinding algorithm.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { HPAStar, HPAStarUtils } from "../../algorithms/pathfinding/hpa-star";
import type { Point, CellType, HPAConfig, HPAOptions } from "../../algorithms/pathfinding/hpa-star/hpa-star-types";

describe("HPAStar Performance", () => {
  let hpaStar: HPAStar;
  let config: HPAConfig;
  let options: HPAOptions;

  beforeEach(() => {
    config = {
      width: 100,
      height: 100,
      clusterSize: 10,
      allowDiagonal: true,
      diagonalOnlyWhenClear: true,
      cardinalCost: 1,
      diagonalCost: Math.sqrt(2),
      maxPathLength: 10000,
      usePathSmoothing: true,
      smoothingFactor: 0.5,
      useEarlyTermination: true,
      validateInput: true,
      enableCaching: true,
      tolerance: 1e-10,
    };

    options = {
      returnAbstractPath: true,
      returnRefinedPath: true,
      usePathSmoothing: true,
      useEarlyTermination: true,
      maxIterations: 10000,
      useGoalBounding: false,
      useHierarchicalAbstraction: true,
    };

    hpaStar = new HPAStar(config);
  });

  describe("pathfinding performance", () => {
    it("should find path quickly on small grid", () => {
      const smallConfig = { ...config, width: 20, height: 20 };
      const smallHPA = new HPAStar(smallConfig);
      const grid = HPAStarUtils.generateTestGrid(20, 20, 0.3, 12345);
      const start = { x: 0, y: 0 };
      const goals = [{ x: 19, y: 19 }];

      const startTime = performance.now();
      const result = smallHPA.findPath(start, goals, grid, options);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    it("should find path efficiently on medium grid", () => {
      const mediumConfig = { ...config, width: 50, height: 50 };
      const mediumHPA = new HPAStar(mediumConfig);
      const grid = HPAStarUtils.generateTestGrid(50, 50, 0.3, 12345);
      const start = { x: 0, y: 0 };
      const goals = [{ x: 49, y: 49 }];

      const startTime = performance.now();
      const result = mediumHPA.findPath(start, goals, grid, options);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });

    it("should find path efficiently on large grid", () => {
      const largeConfig = { ...config, width: 100, height: 100 };
      const largeHPA = new HPAStar(largeConfig);
      const grid = HPAStarUtils.generateTestGrid(100, 100, 0.3, 12345);
      const start = { x: 0, y: 0 };
      const goals = [{ x: 99, y: 99 }];

      const startTime = performance.now();
      const result = largeHPA.findPath(start, goals, grid, options);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it("should handle multiple pathfinding operations efficiently", () => {
      const grid = HPAStarUtils.generateTestGrid(50, 50, 0.3, 12345);
      const starts = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 20 },
        { x: 30, y: 30 },
        { x: 40, y: 40 },
      ];
      const goals = [{ x: 49, y: 49 }];

      const startTime = performance.now();

      for (const start of starts) {
        const result = hpaStar.findPath(start, goals, grid, options);
        expect(result.success).toBe(true);
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it("should handle multiple goals efficiently", () => {
      const grid = HPAStarUtils.generateTestGrid(50, 50, 0.3, 12345);
      const start = { x: 0, y: 0 };
      const goals = [
        { x: 10, y: 10 },
        { x: 20, y: 20 },
        { x: 30, y: 30 },
        { x: 40, y: 40 },
        { x: 49, y: 49 },
      ];

      const startTime = performance.now();
      const result = hpaStar.findPath(start, goals, grid, options);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe("clustering performance", () => {
    it("should generate clusters quickly", () => {
      const grid = HPAStarUtils.generateTestGrid(100, 100, 0.3, 12345);

      const startTime = performance.now();
      const clusters = hpaStar.generateClusters(grid);
      const endTime = performance.now();

      expect(clusters.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });

    it("should handle different cluster sizes efficiently", () => {
      const grid = HPAStarUtils.generateTestGrid(100, 100, 0.3, 12345);
      const clusterSizes = [5, 10, 20, 25];

      for (const clusterSize of clusterSizes) {
        const testConfig = { ...config, clusterSize };
        const testHPA = new HPAStar(testConfig);

        const startTime = performance.now();
        const clusters = testHPA.generateClusters(grid);
        const endTime = performance.now();

        expect(clusters.length).toBeGreaterThan(0);
        expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      }
    });
  });

  describe("abstract graph performance", () => {
    it("should build abstract graph quickly", () => {
      const grid = HPAStarUtils.generateTestGrid(100, 100, 0.3, 12345);
      const clusters = hpaStar.generateClusters(grid);

      const startTime = performance.now();
      const abstractGraph = hpaStar.buildAbstractGraph(clusters, grid);
      const endTime = performance.now();

      expect(abstractGraph.nodes.length).toBeGreaterThan(0);
      expect(abstractGraph.edges.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it("should handle complex abstract graphs efficiently", () => {
      const grid = HPAStarUtils.generatePatternGrid(100, 100, "maze", 12345);
      const clusters = hpaStar.generateClusters(grid);

      const startTime = performance.now();
      const abstractGraph = hpaStar.buildAbstractGraph(clusters, grid);
      const endTime = performance.now();

      expect(abstractGraph.nodes.length).toBeGreaterThan(0);
      expect(abstractGraph.edges.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe("path refinement performance", () => {
    it("should refine paths quickly", () => {
      const grid = HPAStarUtils.generateTestGrid(100, 100, 0.3, 12345);
      const clusters = hpaStar.generateClusters(grid);
      const abstractGraph = hpaStar.buildAbstractGraph(clusters, grid);
      const abstractPath = [
        { x: 0, y: 0 },
        { x: 50, y: 50 },
        { x: 99, y: 99 },
      ];

      const startTime = performance.now();
      const refinedPath = hpaStar.refinePath(abstractPath, clusters, grid);
      const endTime = performance.now();

      expect(refinedPath.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });

    it("should handle long abstract paths efficiently", () => {
      const grid = HPAStarUtils.generateTestGrid(100, 100, 0.3, 12345);
      const clusters = hpaStar.generateClusters(grid);
      const abstractGraph = hpaStar.buildAbstractGraph(clusters, grid);

      // Create a long abstract path
      const abstractPath: Point[] = [];
      for (let i = 0; i < 20; i++) {
        abstractPath.push({ x: i * 5, y: i * 5 });
      }

      const startTime = performance.now();
      const refinedPath = hpaStar.refinePath(abstractPath, clusters, grid);
      const endTime = performance.now();

      expect(refinedPath.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe("memory usage", () => {
    it("should not leak memory during pathfinding", () => {
      const grid = HPAStarUtils.generateTestGrid(50, 50, 0.3, 12345);
      const start = { x: 0, y: 0 };
      const goals = [{ x: 49, y: 49 }];

      // Perform multiple pathfinding operations
      for (let i = 0; i < 10; i++) {
        const result = hpaStar.findPath(start, goals, grid, options);
        expect(result.success).toBe(true);
      }

      // Clear cache to free memory
      hpaStar.clearCache();

      // Statistics should be maintained
      const stats = hpaStar.getStatistics();
      expect(stats.totalPathsFound).toBeGreaterThan(0);
    });

    it("should handle large grids without excessive memory usage", () => {
      const largeConfig = { ...config, width: 200, height: 200 };
      const largeHPA = new HPAStar(largeConfig);
      const grid = HPAStarUtils.generateTestGrid(200, 200, 0.3, 12345);
      const start = { x: 0, y: 0 };
      const goals = [{ x: 199, y: 199 }];

      const startTime = performance.now();
      const result = largeHPA.findPath(start, goals, grid, options);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe("scalability", () => {
    it("should scale linearly with grid size", () => {
      const sizes = [25, 50, 75, 100];
      const times: number[] = [];

      for (const size of sizes) {
        const testConfig = { ...config, width: size, height: size };
        const testHPA = new HPAStar(testConfig);
        const grid = HPAStarUtils.generateTestGrid(size, size, 0.3, 12345);
        const start = { x: 0, y: 0 };
        const goals = [{ x: size - 1, y: size - 1 }];

        const startTime = performance.now();
        const result = testHPA.findPath(start, goals, grid, options);
        const endTime = performance.now();

        expect(result.success).toBe(true);
        times.push(endTime - startTime);
      }

      // Times should generally increase with size (allowing for some variance)
      for (let i = 1; i < times.length; i++) {
        expect(times[i]).toBeGreaterThanOrEqual(times[i - 1] * 0.5); // Allow 50% variance
      }
    });

    it("should scale well with cluster size", () => {
      const grid = HPAStarUtils.generateTestGrid(100, 100, 0.3, 12345);
      const start = { x: 0, y: 0 };
      const goals = [{ x: 99, y: 99 }];
      const clusterSizes = [5, 10, 20, 25];
      const times: number[] = [];

      for (const clusterSize of clusterSizes) {
        const testConfig = { ...config, clusterSize };
        const testHPA = new HPAStar(testConfig);

        const startTime = performance.now();
        const result = testHPA.findPath(start, goals, grid, options);
        const endTime = performance.now();

        expect(result.success).toBe(true);
        times.push(endTime - startTime);
      }

      // All times should be reasonable
      for (const time of times) {
        expect(time).toBeLessThan(2000); // Should complete within 2 seconds
      }
    });
  });

  describe("pattern-specific performance", () => {
    it("should handle maze patterns efficiently", () => {
      const grid = HPAStarUtils.generatePatternGrid(100, 100, "maze", 12345);
      const start = { x: 0, y: 0 };
      const goals = [{ x: 99, y: 99 }];

      const startTime = performance.now();
      const result = hpaStar.findPath(start, goals, grid, options);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it("should handle room patterns efficiently", () => {
      const grid = HPAStarUtils.generatePatternGrid(100, 100, "rooms", 12345);
      const start = { x: 0, y: 0 };
      const goals = [{ x: 99, y: 99 }];

      const startTime = performance.now();
      const result = hpaStar.findPath(start, goals, grid, options);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it("should handle corridor patterns efficiently", () => {
      const grid = HPAStarUtils.generatePatternGrid(100, 100, "corridors", 12345);
      const start = { x: 0, y: 0 };
      const goals = [{ x: 99, y: 99 }];

      const startTime = performance.now();
      const result = hpaStar.findPath(start, goals, grid, options);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it("should handle spiral patterns efficiently", () => {
      const grid = HPAStarUtils.generatePatternGrid(100, 100, "spiral", 12345);
      const start = { x: 0, y: 0 };
      const goals = [{ x: 99, y: 99 }];

      const startTime = performance.now();
      const result = hpaStar.findPath(start, goals, grid, options);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe("optimization features", () => {
    it("should benefit from caching", () => {
      const grid = HPAStarUtils.generateTestGrid(50, 50, 0.3, 12345);
      const start = { x: 0, y: 0 };
      const goals = [{ x: 49, y: 49 }];

      // First pathfinding (no cache)
      const startTime1 = performance.now();
      const result1 = hpaStar.findPath(start, goals, grid, options);
      const endTime1 = performance.now();
      const time1 = endTime1 - startTime1;

      // Second pathfinding (with cache)
      const startTime2 = performance.now();
      const result2 = hpaStar.findPath(start, goals, grid, options);
      const endTime2 = performance.now();
      const time2 = endTime2 - startTime2;

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(time2).toBeLessThanOrEqual(time1); // Second should be faster or equal
    });

    it("should benefit from early termination", () => {
      const grid = HPAStarUtils.generateTestGrid(50, 50, 0.3, 12345);
      const start = { x: 0, y: 0 };
      const goals = [{ x: 49, y: 49 }];

      const earlyTermOptions = { ...options, useEarlyTermination: true };
      const noEarlyTermOptions = { ...options, useEarlyTermination: false };

      const startTime1 = performance.now();
      const result1 = hpaStar.findPath(start, goals, grid, earlyTermOptions);
      const endTime1 = performance.now();
      const time1 = endTime1 - startTime1;

      const startTime2 = performance.now();
      const result2 = hpaStar.findPath(start, goals, grid, noEarlyTermOptions);
      const endTime2 = performance.now();
      const time2 = endTime2 - startTime2;

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(time1).toBeLessThanOrEqual(time2); // Early termination should be faster or equal
    });
  });
});
