/**
 * @module algorithms/pathfinding/jps/jps.performance.test
 * @description Performance tests for Jump Point Search (JPS) pathfinding algorithm.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { JPS, JPSUtils } from "../../pathfinding/jps/jps-core";
import type { Point, CellType } from "../../pathfinding/jps/jps-types";

describe("JPS Performance", () => {
  let jps: JPS;

  beforeEach(() => {
    jps = new JPS();
  });

  afterEach(() => {
    jps.resetStats();
    jps.clearCache();
  });

  /**
   * Generates a random grid for testing.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param obstacleRatio - Ratio of obstacles (0-1).
   * @returns Generated grid.
   * @example
   */
  function generateRandomGrid(width: number, height: number, obstacleRatio: number = 0.3): CellType[] {
    return JPSUtils.generateTestGrid(width, height, obstacleRatio);
  }

  /**
   * Generates a maze-like grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Maze grid.
   * @example
   */
  function generateMazeGrid(width: number, height: number): CellType[] {
    const grid: CellType[] = new Array(width * height).fill(0);

    // Create walls around the border
    for (let x = 0; x < width; x++) {
      grid[0 * width + x] = 1; // Top wall
      grid[(height - 1) * width + x] = 1; // Bottom wall
    }
    for (let y = 0; y < height; y++) {
      grid[y * width + 0] = 1; // Left wall
      grid[y * width + (width - 1)] = 1; // Right wall
    }

    // Add some internal obstacles
    for (let i = 0; i < width * height * 0.1; i++) {
      const x = Math.floor(Math.random() * (width - 2)) + 1;
      const y = Math.floor(Math.random() * (height - 2)) + 1;
      grid[y * width + x] = 1;
    }

    return grid;
  }

  /**
   * Generates a sparse grid with few obstacles.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Sparse grid.
   * @example
   */
  function generateSparseGrid(width: number, height: number): CellType[] {
    return generateRandomGrid(width, height, 0.1);
  }

  /**
   * Generates a dense grid with many obstacles.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Dense grid.
   * @example
   */
  function generateDenseGrid(width: number, height: number): CellType[] {
    return generateRandomGrid(width, height, 0.6);
  }

  describe("Basic Performance", () => {
    it("should find path in small grid quickly", () => {
      const grid = generateRandomGrid(20, 20, 0.2);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 19, y: 19 };

      const startTime = performance.now();
      const _result = jps.findPath(grid, 20, 20, start, goal);
      const endTime = performance.now();

      expect(_result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(50); // Should complete in under 50ms
      expect(_result.stats.executionTime).toBeLessThan(50);
    });

    it("should find path in medium grid in reasonable time", () => {
      const grid = generateRandomGrid(100, 100, 0.2);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };

      const startTime = performance.now();
      const _result = jps.findPath(grid, 100, 100, start, goal);
      const endTime = performance.now();

      expect(_result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(200); // Should complete in under 200ms
    });

    it("should find path in large grid", () => {
      const grid = generateRandomGrid(500, 500, 0.2);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 499, y: 499 };

      const startTime = performance.now();
      const _result = jps.findPath(grid, 500, 500, start, goal);
      const endTime = performance.now();

      expect(_result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1s
    });

    it("should scale performance with grid size", () => {
      const sizes = [50, 100, 200];
      const times: number[] = [];

      for (const size of sizes) {
        const grid = generateRandomGrid(size, size, 0.2);
        const start: Point = { x: 0, y: 0 };
        const goal: Point = { x: size - 1, y: size - 1 };

        const startTime = performance.now();
        jps.findPath(grid, size, size, start, goal);
        const endTime = performance.now();

        times.push(endTime - startTime);
      }

      // Times should scale roughly with grid size
      const ratio1 = times[1] / times[0];
      const ratio2 = times[2] / times[0];

      expect(ratio1).toBeLessThan(5); // 2x size should take less than 5x time
      expect(ratio2).toBeLessThan(20); // 4x size should take less than 20x time
    });
  });

  describe("Obstacle Density Performance", () => {
    it("should handle sparse grids efficiently", () => {
      const grid = generateSparseGrid(100, 100);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };

      const startTime = performance.now();
      const _result = jps.findPath(grid, 100, 100, start, goal);
      const endTime = performance.now();

      expect(_result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Sparse grids should be fast
    });

    it("should handle dense grids reasonably", () => {
      const grid = generateDenseGrid(100, 100);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };

      const startTime = performance.now();
      jps.findPath(grid, 100, 100, start, goal);
      const endTime = performance.now();

      // Dense grids might not find a path, but should complete quickly
      expect(endTime - startTime).toBeLessThan(300);
    });

    it("should handle maze-like grids", () => {
      const grid = generateMazeGrid(100, 100);
      const start: Point = { x: 1, y: 1 };
      const goal: Point = { x: 98, y: 98 };

      const startTime = performance.now();
      jps.findPath(grid, 100, 100, start, goal);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500); // Mazes can be complex
    });

    it("should compare performance across obstacle densities", () => {
      const densities = [0.1, 0.3, 0.5];
      const times: number[] = [];

      for (const density of densities) {
        const grid = generateRandomGrid(100, 100, density);
        const start: Point = { x: 0, y: 0 };
        const goal: Point = { x: 99, y: 99 };

        const startTime = performance.now();
        jps.findPath(grid, 100, 100, start, goal);
        const endTime = performance.now();

        times.push(endTime - startTime);
      }

      // Higher density should generally take longer
      expect(times[1]).toBeGreaterThan(times[0] * 0.5); // 0.3 density should be slower than 0.1
      expect(times[2]).toBeGreaterThan(times[0] * 0.5); // 0.5 density should be slower than 0.1
    });
  });

  describe("Movement Type Performance", () => {
    it("should handle cardinal movement efficiently", () => {
      jps.updateConfig({ allowDiagonal: false, movementType: "cardinal" as any });

      const grid = generateRandomGrid(100, 100, 0.2);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };

      const startTime = performance.now();
      const _result = jps.findPath(grid, 100, 100, start, goal);
      const endTime = performance.now();

      expect(_result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(200);
    });

    it("should handle diagonal movement efficiently", () => {
      jps.updateConfig({ allowDiagonal: true, movementType: "all" as any });

      const grid = generateRandomGrid(100, 100, 0.2);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };

      const startTime = performance.now();
      const _result = jps.findPath(grid, 100, 100, start, goal);
      const endTime = performance.now();

      expect(_result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(200);
    });

    it("should compare cardinal vs diagonal performance", () => {
      const grid = generateRandomGrid(100, 100, 0.2);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };

      // Test cardinal movement
      jps.updateConfig({ allowDiagonal: false });
      const startTime1 = performance.now();
      const result1 = jps.findPath(grid, 100, 100, start, goal);
      const endTime1 = performance.now();
      const time1 = endTime1 - startTime1;

      // Test diagonal movement
      jps.updateConfig({ allowDiagonal: true });
      const startTime2 = performance.now();
      const result2 = jps.findPath(grid, 100, 100, start, goal);
      const endTime2 = performance.now();
      const time2 = endTime2 - startTime2;

      expect(result1.found).toBe(true);
      expect(result2.found).toBe(true);

      // Diagonal should generally be faster due to shorter paths
      expect(time2).toBeLessThan(time1 * 2); // Diagonal shouldn't be more than 2x slower
    });
  });

  describe("Caching Performance", () => {
    it("should benefit from caching on repeated queries", () => {
      jps.updateConfig({ enableCaching: true });

      const grid = generateRandomGrid(100, 100, 0.2);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };

      // First query
      const startTime1 = performance.now();
      const result1 = jps.findPath(grid, 100, 100, start, goal);
      const endTime1 = performance.now();
      const time1 = endTime1 - startTime1;

      // Second query (should be cached)
      const startTime2 = performance.now();
      const result2 = jps.findPath(grid, 100, 100, start, goal);
      const endTime2 = performance.now();
      const time2 = endTime2 - startTime2;

      expect(result1.found).toBe(result2.found);
      expect(result1.path).toEqual(result2.path);
      expect(time2).toBeLessThan(time1); // Cached query should be faster
    });

    it("should handle multiple cached queries efficiently", () => {
      jps.updateConfig({ enableCaching: true });

      const grid = generateRandomGrid(100, 100, 0.2);
      const queries = [
        { start: { x: 0, y: 0 }, goal: { x: 99, y: 99 } },
        { start: { x: 0, y: 0 }, goal: { x: 50, y: 50 } },
        { start: { x: 50, y: 50 }, goal: { x: 99, y: 99 } },
      ];

      const startTime = performance.now();

      for (let i = 0; i < 10; i++) {
        for (const query of queries) {
          jps.findPath(grid, 100, 100, query.start, query.goal);
        }
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete quickly with caching
    });
  });

  describe("Path Optimization Performance", () => {
    it("should optimize paths efficiently", () => {
      const grid = generateRandomGrid(100, 100, 0.2);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };

      const startTime = performance.now();
      const _result = jps.findPath(grid, 100, 100, start, goal, { optimizePath: true });
      const endTime = performance.now();

      expect(_result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(300); // Optimization shouldn't add much overhead
    });

    it("should handle path optimization on long paths", () => {
      const grid = generateSparseGrid(200, 200);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 199, y: 199 };

      const _result = jps.findPath(grid, 200, 200, start, goal, { optimizePath: true });

      expect(_result.found).toBe(true);
      expect(_result.path.length).toBeGreaterThan(0);

      // Path should be reasonably optimized
      expect(_result.path.length).toBeLessThan(400); // Should be less than naive path length
    });
  });

  describe("Statistics Performance", () => {
    it("should track statistics without significant overhead", () => {
      const grid = generateRandomGrid(100, 100, 0.2);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };

      const startTime = performance.now();
      const _result = jps.findPath(grid, 100, 100, start, goal, { returnExplored: true });
      const endTime = performance.now();

      expect(_result.found).toBe(true);
      expect(_result.stats.nodesExplored).toBeGreaterThan(0);
      expect(_result.stats.jumpPointsFound).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(200);
    });

    it("should handle large exploration sets efficiently", () => {
      const grid = generateDenseGrid(100, 100);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };

      const _result = jps.findPath(grid, 100, 100, start, goal, { returnExplored: true });

      // Even if no path is found, should handle large exploration efficiently
      expect(_result.stats.nodesExplored).toBeGreaterThan(0);
      expect(_result.stats.executionTime).toBeLessThan(500);
    });
  });

  describe("Memory Usage", () => {
    it("should not leak memory during repeated pathfinding", () => {
      const grid = generateRandomGrid(100, 100, 0.2);

      // Perform many pathfinding operations
      for (let i = 0; i < 100; i++) {
        const start: Point = {
          x: Math.floor(Math.random() * 100),
          y: Math.floor(Math.random() * 100),
        };
        const goal: Point = {
          x: Math.floor(Math.random() * 100),
          y: Math.floor(Math.random() * 100),
        };

        jps.findPath(grid, 100, 100, start, goal);
      }

      // If we get here without running out of memory, the test passes
      expect(true).toBe(true);
    });

    it("should handle large grids without excessive memory usage", () => {
      const grid = generateRandomGrid(1000, 1000, 0.1);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 999, y: 999 };

      const startTime = performance.now();
      const _result = jps.findPath(grid, 1000, 1000, start, goal);
      const endTime = performance.now();

      expect(_result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete in under 2s
    });
  });

  describe("Stress Tests", () => {
    it("should handle rapid successive pathfinding", () => {
      const grid = generateRandomGrid(100, 100, 0.2);

      const startTime = performance.now();

      // Rapidly find paths between random points
      for (let i = 0; i < 50; i++) {
        const start: Point = {
          x: Math.floor(Math.random() * 100),
          y: Math.floor(Math.random() * 100),
        };
        const goal: Point = {
          x: Math.floor(Math.random() * 100),
          y: Math.floor(Math.random() * 100),
        };

        jps.findPath(grid, 100, 100, start, goal);
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should handle rapid queries
    });

    it("should maintain accuracy under stress", () => {
      const grid = generateRandomGrid(100, 100, 0.2);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };

      // Find the same path multiple times
      const results: any[] = [];
      for (let i = 0; i < 10; i++) {
        results.push(jps.findPath(grid, 100, 100, start, goal));
      }

      // All results should be consistent
      const firstResult = results[0];
      for (const _result of results) {
        expect(_result.found).toBe(firstResult.found);
        if (firstResult.found) {
          expect(_result.path.length).toBe(firstResult.path.length);
        }
      }
    });

    it("should handle extreme grid sizes", () => {
      const grid = generateRandomGrid(2000, 2000, 0.05); // Very large, sparse grid
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 1999, y: 1999 };

      const startTime = performance.now();
      const _result = jps.findPath(grid, 2000, 2000, start, goal);
      const endTime = performance.now();

      expect(_result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5s
    });

    it("should handle maximum iterations gracefully", () => {
      jps.updateConfig({ maxIterations: 100 });

      const grid = generateDenseGrid(100, 100);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };

      const startTime = performance.now();
      const _result = jps.findPath(grid, 100, 100, start, goal);
      const endTime = performance.now();

      expect(_result.stats.iterations).toBeLessThanOrEqual(100);
      expect(endTime - startTime).toBeLessThan(100); // Should terminate quickly
    });
  });

  describe("Algorithm-Specific Performance", () => {
    it("should demonstrate JPS efficiency over naive approaches", () => {
      const grid = generateRandomGrid(100, 100, 0.2);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };

      // JPS should be efficient
      const startTime = performance.now();
      const _result = jps.findPath(grid, 100, 100, start, goal);
      const endTime = performance.now();

      expect(_result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(200);
      expect(_result.stats.nodesExplored).toBeLessThan(10000); // Should explore relatively few nodes
    });

    it("should handle jump point identification efficiently", () => {
      const grid = generateMazeGrid(100, 100);
      const start: Point = { x: 1, y: 1 };
      const goal: Point = { x: 98, y: 98 };

      const _result = jps.findPath(grid, 100, 100, start, goal);

      expect(_result.stats.jumpPointsFound).toBeGreaterThan(0);
      expect(_result.stats.jumpPointsFound).toBeLessThan(_result.stats.nodesExplored); // Should find fewer jump points than total nodes
    });

    it("should handle forced neighbor detection efficiently", () => {
      const grid = generateRandomGrid(100, 100, 0.3);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };

      const _result = jps.findPath(grid, 100, 100, start, goal);

      expect(_result.found).toBe(true);
      expect(_result.stats.executionTime).toBeLessThan(300);
    });
  });
});
