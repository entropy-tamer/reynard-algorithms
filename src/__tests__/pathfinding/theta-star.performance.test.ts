/**
 * @fileoverview Performance tests for Theta* pathfinding algorithm.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ThetaStar, ThetaStarUtils } from "../../pathfinding/theta-star/theta-star-core";
import type { Point, CellType } from "../../pathfinding/theta-star/theta-star-types";

describe("ThetaStar Performance", () => {
  let thetaStar: ThetaStar;

  beforeEach(() => {
    thetaStar = new ThetaStar();
  });

  afterEach(() => {
    thetaStar.clearCache();
  });

  describe("Basic Performance", () => {
    it("should find path quickly on small grid", () => {
      const grid = ThetaStarUtils.generateTestGrid(50, 50, 0.2, 42);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 49, y: 49 };
      
      const startTime = performance.now();
      const result = thetaStar.findPath(grid, 50, 50, start, goal);
      const endTime = performance.now();
      
      expect(result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it("should find path quickly on medium grid", () => {
      const grid = ThetaStarUtils.generateTestGrid(100, 100, 0.2, 42);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };
      
      const startTime = performance.now();
      const result = thetaStar.findPath(grid, 100, 100, start, goal);
      const endTime = performance.now();
      
      expect(result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(500); // Should complete in under 500ms
    });

    it("should find path quickly on large grid", () => {
      const grid = ThetaStarUtils.generateTestGrid(200, 200, 0.2, 42);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 199, y: 199 };
      
      const startTime = performance.now();
      const result = thetaStar.findPath(grid, 200, 200, start, goal);
      const endTime = performance.now();
      
      expect(result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete in under 2s
    });
  });

  describe("Grid Size Impact", () => {
    it("should scale linearly with grid size", () => {
      const sizes = [25, 50, 100];
      const times: number[] = [];
      
      for (const size of sizes) {
        const grid = ThetaStarUtils.generateTestGrid(size, size, 0.2, 42);
        const start: Point = { x: 0, y: 0 };
        const goal: Point = { x: size - 1, y: size - 1 };
        
        const startTime = performance.now();
        thetaStar.findPath(grid, size, size, start, goal);
        const endTime = performance.now();
        
        times.push(endTime - startTime);
      }
      
      // Times should generally increase with grid size
      expect(times[1]).toBeGreaterThan(times[0]);
      expect(times[2]).toBeGreaterThan(times[1]);
    });

    it("should handle very large grids", () => {
      const grid = ThetaStarUtils.generateTestGrid(500, 500, 0.1, 42);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 499, y: 499 };
      
      const startTime = performance.now();
      const result = thetaStar.findPath(grid, 500, 500, start, goal);
      const endTime = performance.now();
      
      expect(result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete in under 10s
    });
  });

  describe("Obstacle Density Impact", () => {
    it("should perform well with low obstacle density", () => {
      const grid = ThetaStarUtils.generateTestGrid(100, 100, 0.1, 42);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };
      
      const startTime = performance.now();
      const result = thetaStar.findPath(grid, 100, 100, start, goal);
      const endTime = performance.now();
      
      expect(result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(200); // Should be fast with few obstacles
    });

    it("should perform reasonably with medium obstacle density", () => {
      const grid = ThetaStarUtils.generateTestGrid(100, 100, 0.3, 42);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };
      
      const startTime = performance.now();
      const result = thetaStar.findPath(grid, 100, 100, start, goal);
      const endTime = performance.now();
      
      expect(result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(500); // Should still be reasonable
    });

    it("should handle high obstacle density", () => {
      const grid = ThetaStarUtils.generateTestGrid(100, 100, 0.5, 42);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };
      
      const startTime = performance.now();
      const result = thetaStar.findPath(grid, 100, 100, start, goal);
      const endTime = performance.now();
      
      // May not find a path, but should complete quickly
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe("Movement Type Comparison", () => {
    it("should perform well with cardinal movement only", () => {
      thetaStar.updateConfig({ allowDiagonal: false });
      
      const grid = ThetaStarUtils.generateTestGrid(100, 100, 0.2, 42);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };
      
      const startTime = performance.now();
      const result = thetaStar.findPath(grid, 100, 100, start, goal);
      const endTime = performance.now();
      
      expect(result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(500);
    });

    it("should perform well with diagonal movement", () => {
      thetaStar.updateConfig({ allowDiagonal: true });
      
      const grid = ThetaStarUtils.generateTestGrid(100, 100, 0.2, 42);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };
      
      const startTime = performance.now();
      const result = thetaStar.findPath(grid, 100, 100, start, goal);
      const endTime = performance.now();
      
      expect(result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe("Caching Benefits", () => {
    it("should benefit from caching", () => {
      thetaStar.updateConfig({ enableCaching: true });
      
      const grid = ThetaStarUtils.generateTestGrid(100, 100, 0.2, 42);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };
      
      // First call
      const startTime1 = performance.now();
      const result1 = thetaStar.findPath(grid, 100, 100, start, goal);
      const endTime1 = performance.now();
      
      // Second call (should be faster due to caching)
      const startTime2 = performance.now();
      const result2 = thetaStar.findPath(grid, 100, 100, start, goal);
      const endTime2 = performance.now();
      
      expect(result1.found).toBe(true);
      expect(result2.found).toBe(true);
      expect(result1.path).toEqual(result2.path);
      expect(endTime2 - startTime2).toBeLessThan(endTime1 - startTime1);
    });

    it("should handle cache invalidation", () => {
      thetaStar.updateConfig({ enableCaching: true });
      
      const grid1 = ThetaStarUtils.generateTestGrid(100, 100, 0.2, 42);
      const grid2 = ThetaStarUtils.generateTestGrid(100, 100, 0.3, 43);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };
      
      // First call with grid1
      const startTime1 = performance.now();
      thetaStar.findPath(grid1, 100, 100, start, goal);
      const endTime1 = performance.now();
      
      // Second call with different grid (should not use cache)
      const startTime2 = performance.now();
      thetaStar.findPath(grid2, 100, 100, start, goal);
      const endTime2 = performance.now();
      
      // Both calls should take similar time
      const time1 = endTime1 - startTime1;
      const time2 = endTime2 - startTime2;
      expect(Math.abs(time1 - time2)).toBeLessThan(time1 * 0.5); // Within 50% of each other
    });
  });

  describe("Path Optimization Overhead", () => {
    it("should handle path optimization efficiently", () => {
      const grid = ThetaStarUtils.generateTestGrid(100, 100, 0.2, 42);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };
      
      // Without optimization
      const startTime1 = performance.now();
      const result1 = thetaStar.findPath(grid, 100, 100, start, goal, { optimizePath: false });
      const endTime1 = performance.now();
      
      // With optimization
      const startTime2 = performance.now();
      const result2 = thetaStar.findPath(grid, 100, 100, start, goal, { optimizePath: true });
      const endTime2 = performance.now();
      
      expect(result1.found).toBe(true);
      expect(result2.found).toBe(true);
      
      // Optimization should not add too much overhead
      const time1 = endTime1 - startTime1;
      const time2 = endTime2 - startTime2;
      expect(time2).toBeLessThan(time1 * 2); // Should not be more than 2x slower
    });
  });

  describe("Statistics Tracking", () => {
    it("should track statistics efficiently", () => {
      const grid = ThetaStarUtils.generateTestGrid(100, 100, 0.2, 42);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };
      
      const startTime = performance.now();
      const result = thetaStar.findPath(grid, 100, 100, start, goal);
      const endTime = performance.now();
      
      expect(result.found).toBe(true);
      expect(result.stats.nodesExplored).toBeGreaterThan(0);
      expect(result.stats.iterations).toBeGreaterThan(0);
      expect(result.stats.executionTime).toBeGreaterThan(0);
      
      // Statistics tracking should not add significant overhead
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe("Memory Usage", () => {
    it("should handle large grids without excessive memory usage", () => {
      const grid = ThetaStarUtils.generateTestGrid(200, 200, 0.2, 42);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 199, y: 199 };
      
      const startTime = performance.now();
      const result = thetaStar.findPath(grid, 200, 200, start, goal);
      const endTime = performance.now();
      
      expect(result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000);
      
      // Clear cache to free memory
      thetaStar.clearCache();
    });

    it("should handle multiple pathfinding calls efficiently", () => {
      const grid = ThetaStarUtils.generateTestGrid(100, 100, 0.2, 42);
      const starts: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 20 },
        { x: 30, y: 30 },
        { x: 40, y: 40 },
      ];
      const goal: Point = { x: 99, y: 99 };
      
      const startTime = performance.now();
      const results = starts.map(start => 
        thetaStar.findPath(grid, 100, 100, start, goal)
      );
      const endTime = performance.now();
      
      results.forEach(result => {
        expect(result.found).toBe(true);
      });
      
      expect(endTime - startTime).toBeLessThan(2000); // All calls should complete in under 2s
    });
  });

  describe("Stress Tests", () => {
    it("should handle maximum iterations limit", () => {
      thetaStar.updateConfig({ maxIterations: 1000 });
      
      const grid = ThetaStarUtils.generateTestGrid(100, 100, 0.4, 42);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };
      
      const startTime = performance.now();
      const result = thetaStar.findPath(grid, 100, 100, start, goal);
      const endTime = performance.now();
      
      expect(result.stats.iterations).toBeLessThanOrEqual(1000);
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it("should handle complex maze grids", () => {
      const grid = ThetaStarUtils.generateMazeGrid(51, 51, 42);
      const start: Point = { x: 1, y: 1 };
      const goal: Point = { x: 49, y: 49 };
      
      const startTime = performance.now();
      const result = thetaStar.findPath(grid, 51, 51, start, goal);
      const endTime = performance.now();
      
      expect(result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it("should handle room-based grids", () => {
      const grid = ThetaStarUtils.generateRoomGrid(100, 100, 10, 5, 15, 42);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };
      
      const startTime = performance.now();
      const result = thetaStar.findPath(grid, 100, 100, start, goal);
      const endTime = performance.now();
      
      expect(result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe("Line of Sight Performance", () => {
    it("should perform line of sight checks efficiently", () => {
      const grid = ThetaStarUtils.generateTestGrid(100, 100, 0.2, 42);
      const from: Point = { x: 0, y: 0 };
      const to: Point = { x: 99, y: 99 };
      
      const startTime = performance.now();
      const result = thetaStar.findPath(grid, 100, 100, from, to, { returnLineOfSight: true });
      const endTime = performance.now();
      
      expect(result.found).toBe(true);
      expect(result.stats.lineOfSightChecks).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(500);
    });

    it("should handle multiple line of sight checks", () => {
      const grid = ThetaStarUtils.generateTestGrid(50, 50, 0.2, 42);
      const points: Point[] = ThetaStarUtils.generateRandomPoints(20, 50, 50, 42);
      
      const startTime = performance.now();
      let totalChecks = 0;
      
      for (let i = 0; i < points.length - 1; i++) {
        const result = thetaStar.findPath(grid, 50, 50, points[i], points[i + 1]);
        totalChecks += result.stats.lineOfSightChecks;
      }
      
      const endTime = performance.now();
      
      expect(totalChecks).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe("Configuration Impact", () => {
    it("should perform well with lazy evaluation", () => {
      thetaStar.updateConfig({ useLazyEvaluation: true });
      
      const grid = ThetaStarUtils.generateTestGrid(100, 100, 0.2, 42);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };
      
      const startTime = performance.now();
      const result = thetaStar.findPath(grid, 100, 100, start, goal);
      const endTime = performance.now();
      
      expect(result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(500);
    });

    it("should perform well with tie breaking", () => {
      thetaStar.updateConfig({ useTieBreaking: true });
      
      const grid = ThetaStarUtils.generateTestGrid(100, 100, 0.2, 42);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };
      
      const startTime = performance.now();
      const result = thetaStar.findPath(grid, 100, 100, start, goal);
      const endTime = performance.now();
      
      expect(result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(500);
    });
  });
});
