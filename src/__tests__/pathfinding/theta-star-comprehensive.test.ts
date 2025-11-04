/**
 * @file Comprehensive test suite for Theta* pathfinding algorithm.
 *
 * This test suite provides extensive coverage for edge cases, performance scenarios,
 * and real-world usage patterns that were identified as gaps in the existing test suite.
 *
 * Test Categories:
 * - Edge Cases & Boundary Conditions
 * - Performance Under Stress
 * - Real-World Scenarios
 * - Algorithm Correctness
 * - Memory Management
 * - Concurrent Operations
 * - Error Recovery
 * - Integration Scenarios
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ThetaStar } from "../../algorithms/pathfinding/theta-star/theta-star-core";
import { LineOfSight } from "../../algorithms/pathfinding/theta-star/line-of-sight";
import type { Point, CellType, ThetaStarConfig, ThetaStarOptions } from "../../algorithms/pathfinding/theta-star/theta-star-types";

describe("ThetaStar Comprehensive Test Suite", () => {
  let thetaStar: ThetaStar;
  let grid: CellType[];
  const width = 20;
  const height = 20;

  beforeEach(() => {
    thetaStar = new ThetaStar();
    grid = ThetaStarUtils.generateTestGrid(width, height, 0.2, 42);
  });

  afterEach(() => {
    thetaStar.clearCache();
  });

  describe("Edge Cases & Boundary Conditions", () => {
    it("should handle negative coordinates gracefully", () => {
      const start: Point = { x: -1, y: -1 };
      const goal: Point = { x: 5, y: 5 };

      const result = thetaStar.findPath(grid, width, height, start, goal);
      expect(result.found).toBe(false);
      expect(result.path.length).toBe(0);
    });

    it("should handle coordinates beyond grid bounds", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: width + 10, y: height + 10 };

      const result = thetaStar.findPath(grid, width, height, start, goal);
      expect(result.found).toBe(false);
      expect(result.path.length).toBe(0);
    });

    it("should handle floating point coordinates", () => {
      const start: Point = { x: 0.5, y: 0.5 };
      const goal: Point = { x: 5.7, y: 5.3 };

      const result = thetaStar.findPath(grid, width, height, start, goal);
      // Should either succeed or fail gracefully
      expect(typeof result.success).toBe("boolean");
    });

    it("should handle extremely small grids", () => {
      const tinyGrid: CellType[] = [0];
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 0, y: 0 };

      const result = thetaStar.findPath(tinyGrid, 1, 1, start, goal);
      expect(result.found).toBe(true);
      expect(result.path).toEqual([start]);
    });

    it("should handle rectangular grids (non-square)", () => {
      const rectGrid = ThetaStarUtils.generateTestGrid(50, 10, 0.1, 42);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 49, y: 9 };

      const result = thetaStar.findPath(rectGrid, 50, 10, start, goal);
      expect(result.found).toBe(true);
      expect(result.path.length).toBeGreaterThan(0);
    });

    it("should handle grids with all obstacles", () => {
      const blockedGrid: CellType[] = new Array(width * height).fill(1);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: width - 1, y: height - 1 };

      const result = thetaStar.findPath(blockedGrid, width, height, start, goal);
      expect(result.found).toBe(false);
    });

    it("should handle grids with no obstacles", () => {
      const openGrid: CellType[] = new Array(width * height).fill(0);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: width - 1, y: height - 1 };

      const result = thetaStar.findPath(openGrid, width, height, start, goal);
      expect(result.found).toBe(true);
      expect(result.path.length).toBeGreaterThan(0);
    });
  });

  describe("Performance Under Stress", () => {
    it("should handle very large grids efficiently", () => {
      const largeGrid = ThetaStarUtils.generateTestGrid(500, 500, 0.1, 42);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 499, y: 499 };

      const startTime = performance.now();
      const result = thetaStar.findPath(largeGrid, 500, 500, start, goal);
      const endTime = performance.now();

      expect(result.found).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5 seconds
    });

    it("should handle high obstacle density", () => {
      const denseGrid = ThetaStarUtils.generateTestGrid(100, 100, 0.8, 42);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };

      const startTime = performance.now();
      const result = thetaStar.findPath(denseGrid, 100, 100, start, goal);
      const endTime = performance.now();

      // May not find a path, but should complete quickly
      expect(endTime - startTime).toBeLessThan(2000);
    });

    it("should handle maximum iterations gracefully", () => {
      thetaStar.updateConfig({ maxIterations: 10 });

      const complexGrid = ThetaStarUtils.generateMazeGrid(51, 51, 42);
      const start: Point = { x: 1, y: 1 };
      const goal: Point = { x: 49, y: 49 };

      const result = thetaStar.findPath(complexGrid, 51, 51, start, goal);
      expect(result.stats.iterations).toBeLessThanOrEqual(10);
    });

    it("should handle rapid successive calls", () => {
      const results: any[] = [];
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        const start: Point = { x: Math.floor(Math.random() * width), y: Math.floor(Math.random() * height) };
        const goal: Point = { x: Math.floor(Math.random() * width), y: Math.floor(Math.random() * height) };

        const result = thetaStar.findPath(grid, width, height, start, goal);
        results.push(result);
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // All 100 calls in under 1 second
      expect(results.length).toBe(100);
    });
  });

  describe("Real-World Scenarios", () => {
    it("should handle maze-like environments", () => {
      const mazeGrid = ThetaStarUtils.generateMazeGrid(21, 21, 42);
      const start: Point = { x: 1, y: 1 };
      const goal: Point = { x: 19, y: 19 };

      const result = thetaStar.findPath(mazeGrid, 21, 21, start, goal);
      expect(result.found).toBe(true);
      expect(result.path.length).toBeGreaterThan(0);
    });

    it("should handle room-based environments", () => {
      const roomGrid = ThetaStarUtils.generateRoomGrid(50, 50, 5, 3, 8, 42);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 49, y: 49 };

      const result = thetaStar.findPath(roomGrid, 50, 50, start, goal);
      expect(result.found).toBe(true);
      expect(result.path.length).toBeGreaterThan(0);
    });

    it("should handle narrow passages", () => {
      const narrowGrid: CellType[] = new Array(10 * 10).fill(0);
      // Create a narrow passage
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
          if (x !== 5) {
            // Leave column 5 as passage
            narrowGrid[y * 10 + x] = 1;
          }
        }
      }

      const start: Point = { x: 0, y: 5 };
      const goal: Point = { x: 9, y: 5 };

      const result = thetaStar.findPath(narrowGrid, 10, 10, start, goal);
      expect(result.found).toBe(true);
      expect(result.path.length).toBeGreaterThan(0);
    });

    it("should handle U-shaped obstacles", () => {
      const uGrid: CellType[] = new Array(10 * 10).fill(0);
      // Create U-shaped obstacle
      for (let x = 2; x <= 7; x++) {
        uGrid[2 * 10 + x] = 1; // Top of U
        uGrid[7 * 10 + x] = 1; // Bottom of U
      }
      for (let y = 2; y <= 7; y++) {
        uGrid[y * 10 + 2] = 1; // Left side of U
        uGrid[y * 10 + 7] = 1; // Right side of U
      }

      const start: Point = { x: 0, y: 5 };
      const goal: Point = { x: 9, y: 5 };

      const result = thetaStar.findPath(uGrid, 10, 10, start, goal);
      expect(result.found).toBe(true);
      expect(result.path.length).toBeGreaterThan(0);
    });
  });

  describe("Algorithm Correctness", () => {
    it("should find optimal paths in simple cases", () => {
      const simpleGrid: CellType[] = new Array(5 * 5).fill(0);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 4, y: 4 };

      const result = thetaStar.findPath(simpleGrid, 5, 5, start, goal);
      expect(result.found).toBe(true);

      // Path should be close to optimal (diagonal)
      const expectedMinLength = Math.sqrt(32); // Diagonal distance
      expect(result.cost).toBeCloseTo(expectedMinLength, 1);
    });

    it("should respect movement constraints", () => {
      thetaStar.updateConfig({ allowDiagonal: false });

      const simpleGrid: CellType[] = new Array(5 * 5).fill(0);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 4, y: 4 };

      const result = thetaStar.findPath(simpleGrid, 5, 5, start, goal);
      expect(result.found).toBe(true);

      // With no diagonal movement, path should be longer
      expect(result.cost).toBeGreaterThanOrEqual(8); // Manhattan distance
    });

    it("should handle tie-breaking correctly", () => {
      thetaStar.updateConfig({ useTieBreaking: true });

      const tieGrid: CellType[] = new Array(5 * 5).fill(0);
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 4, y: 4 };

      const result1 = thetaStar.findPath(tieGrid, 5, 5, start, goal);
      const result2 = thetaStar.findPath(tieGrid, 5, 5, start, goal);

      // With tie-breaking, results should be consistent
      expect(result1.path).toEqual(result2.path);
    });

    it("should produce consistent results", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const results = [];
      for (let i = 0; i < 10; i++) {
        const result = thetaStar.findPath(grid, width, height, start, goal);
        results.push(result);
      }

      // All results should be identical
      const firstResult = results[0];
      results.forEach(result => {
        expect(result.success).toBe(firstResult.success);
        if (firstResult.success) {
          expect(result.path).toEqual(firstResult.path);
        }
      });
    });
  });

  describe("Memory Management", () => {
    it("should not leak memory with repeated calls", () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      for (let i = 0; i < 1000; i++) {
        const start: Point = { x: Math.floor(Math.random() * width), y: Math.floor(Math.random() * height) };
        const goal: Point = { x: Math.floor(Math.random() * width), y: Math.floor(Math.random() * height) };

        thetaStar.findPath(grid, width, height, start, goal);

        if (i % 100 === 0) {
          thetaStar.clearCache();
        }
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      // Memory growth should be reasonable (less than 10MB)
      expect(finalMemory - initialMemory).toBeLessThan(10 * 1024 * 1024);
    });

    it("should handle cache size limits", () => {
      thetaStar.updateConfig({ enableCaching: true });

      // Generate many different paths to fill cache
      for (let i = 0; i < 100; i++) {
        const testGrid = ThetaStarUtils.generateTestGrid(20, 20, 0.2, i);
        const start: Point = { x: 0, y: 0 };
        const goal: Point = { x: 19, y: 19 };

        thetaStar.findPath(testGrid, 20, 20, start, goal);
      }

      // Cache should still be functional
      const cacheStats = thetaStar.getCacheStats();
      expect(cacheStats).toBeDefined();
    });
  });

  describe("Concurrent Operations", () => {
    it("should handle concurrent pathfinding calls", async () => {
      const promises = [];

      for (let i = 0; i < 10; i++) {
        const promise = new Promise(resolve => {
          setTimeout(() => {
            const start: Point = { x: Math.floor(Math.random() * width), y: Math.floor(Math.random() * height) };
            const goal: Point = { x: Math.floor(Math.random() * width), y: Math.floor(Math.random() * height) };

            const result = thetaStar.findPath(grid, width, height, start, goal);
            resolve(result);
          }, Math.random() * 10);
        });
        promises.push(promise);
      }

      const results = await Promise.all(promises);
      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(typeof result.success).toBe("boolean");
      });
    });

    it("should handle configuration changes during execution", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      // Start pathfinding
      const pathfindingPromise = new Promise(resolve => {
        setTimeout(() => {
          const result = thetaStar.findPath(grid, width, height, start, goal);
          resolve(result);
        }, 0);
      });

      // Change configuration during execution
      thetaStar.updateConfig({ allowDiagonal: false });

      return pathfindingPromise.then((result: any) => {
        expect(typeof result.success).toBe("boolean");
      });
    });
  });

  describe("Error Recovery", () => {
    it("should recover from invalid grid data", () => {
      const invalidGrid: CellType[] = [0, 1, 2, 3, 4]; // Invalid cell types
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 2, y: 2 };

      const result = thetaStar.findPath(invalidGrid, 5, 1, start, goal);
      expect(result.found).toBe(false);
    });

    it("should handle corrupted grid dimensions", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 5, y: 5 };

      // Grid size doesn't match actual grid length
      const result = thetaStar.findPath(grid, 100, 100, start, goal);
      expect(result.found).toBe(false);
    });

    it("should handle NaN coordinates", () => {
      const start: Point = { x: NaN, y: 0 };
      const goal: Point = { x: 5, y: 5 };

      const result = thetaStar.findPath(grid, width, height, start, goal);
      expect(result.found).toBe(false);
    });

    it("should handle Infinity coordinates", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: Infinity, y: 5 };

      const result = thetaStar.findPath(grid, width, height, start, goal);
      expect(result.found).toBe(false);
    });
  });

  describe("Integration Scenarios", () => {
    it("should work with different grid generators", () => {
      const generators = [
        () => ThetaStarUtils.generateTestGrid(20, 20, 0.2, 42),
        () => ThetaStarUtils.generateMazeGrid(21, 21, 42),
        () => ThetaStarUtils.generateRoomGrid(20, 20, 3, 2, 5, 42),
      ];

      generators.forEach((generator, index) => {
        const testGrid = generator();
        const start: Point = { x: 0, y: 0 };
        const goal: Point = { x: 19, y: 19 };

        const result = thetaStar.findPath(testGrid, 20, 20, start, goal);
        expect(typeof result.success).toBe("boolean");
      });
    });

    it("should work with different movement types", () => {
      const movementTypes = [
        { allowDiagonal: true, diagonalOnlyWhenClear: false },
        { allowDiagonal: true, diagonalOnlyWhenClear: true },
        { allowDiagonal: false, diagonalOnlyWhenClear: false },
      ];

      movementTypes.forEach(config => {
        thetaStar.updateConfig(config);

        const start: Point = { x: 0, y: 0 };
        const goal: Point = { x: 9, y: 9 };

        const result = thetaStar.findPath(grid, width, height, start, goal);
        expect(typeof result.success).toBe("boolean");
      });
    });

    it("should work with different optimization settings", () => {
      const options: ThetaStarOptions[] = [
        { optimizePath: true, useEuclideanDistance: true },
        { optimizePath: false, useEuclideanDistance: false },
        { optimizePath: true, useEuclideanDistance: false },
      ];

      options.forEach(option => {
        const start: Point = { x: 0, y: 0 };
        const goal: Point = { x: 9, y: 9 };

        const result = thetaStar.findPath(grid, width, height, start, goal, option);
        expect(typeof result.success).toBe("boolean");
      });
    });
  });

  describe("Line of Sight Integration", () => {
    it("should work with different line of sight algorithms", () => {
      const algorithms = [{ useBresenham: true }, { useDDA: true }, { useRayCasting: true }];

      algorithms.forEach(algorithm => {
        const start: Point = { x: 0, y: 0 };
        const goal: Point = { x: 9, y: 9 };

        const result = LineOfSight.check(grid, start, goal, width, height, algorithm);
        expect(typeof result.hasLineOfSight).toBe("boolean");
        expect(result.found).toBe(true);
      });
    });

    it("should handle line of sight edge cases", () => {
      const edgeCases = [
        { from: { x: 0, y: 0 }, to: { x: 0, y: 0 } }, // Same point
        { from: { x: -1, y: 0 }, to: { x: 5, y: 5 } }, // Invalid start
        { from: { x: 0, y: 0 }, to: { x: 100, y: 100 } }, // Invalid end
      ];

      edgeCases.forEach(({ from, to }) => {
        const result = LineOfSight.check(grid, from, to, width, height);
        expect(typeof result.hasLineOfSight).toBe("boolean");
        expect(typeof result.success).toBe("boolean");
      });
    });
  });

  describe("Statistics and Monitoring", () => {
    it("should provide accurate statistics", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result = thetaStar.findPath(grid, width, height, start, goal);

      expect(result.stats.nodesExplored).toBeGreaterThan(0);
      expect(result.stats.iterations).toBeGreaterThan(0);
      expect(result.stats.executionTime).toBeGreaterThan(0);
      expect(result.stats.success).toBe(true);
    });

    it("should track different move types", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result = thetaStar.findPath(grid, width, height, start, goal);

      expect(result.stats.cardinalMoves + result.stats.diagonalMoves).toBeGreaterThan(0);
    });

    it("should reset statistics correctly", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      thetaStar.findPath(grid, width, height, start, goal);
      const statsBefore = thetaStar.getStats();

      thetaStar.resetStats();
      const statsAfter = thetaStar.getStats();

      expect(statsAfter.nodesExplored).toBe(0);
      expect(statsAfter.iterations).toBe(0);
      expect(statsAfter.executionTime).toBe(0);
      expect(statsBefore.nodesExplored).toBeGreaterThan(0);
    });
  });

  describe("Configuration Validation", () => {
    it("should validate configuration parameters", () => {
      const invalidConfigs = [{ maxIterations: -1 }, { maxIterations: 0 }, { tolerance: -0.1 }, { tolerance: NaN }];

      invalidConfigs.forEach(config => {
        expect(() => {
          thetaStar.updateConfig(config);
        }).not.toThrow();
      });
    });

    it("should handle extreme configuration values", () => {
      const extremeConfigs = [
        { maxIterations: Number.MAX_SAFE_INTEGER },
        { tolerance: Number.MIN_VALUE },
        { maxIterations: 1 },
      ];

      extremeConfigs.forEach(config => {
        expect(() => {
          thetaStar.updateConfig(config);
          const result = thetaStar.findPath(grid, width, height, { x: 0, y: 0 }, { x: 9, y: 9 });
          expect(typeof result.success).toBe("boolean");
        }).not.toThrow();
      });
    });
  });
});
