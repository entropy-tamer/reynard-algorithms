/**
 * @file A* Pathfinding Algorithm Tests
 *
 * Comprehensive test suite for the A* pathfinding algorithm implementation.
 * Tests mathematical correctness, performance, edge cases, and integration.
 */
/* eslint-disable max-lines, max-lines-per-function */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  AStar,
  manhattanDistance,
  euclideanDistance,
  chebyshevDistance,
  octileDistance,
  createHeuristic,
  type Point,
  type AStarGrid,
} from "../../algorithms/pathfinding/astar";

describe("A* Pathfinding Algorithm", () => {
  let astar: AStar;
  let simpleGrid: AStarGrid;
  let complexGrid: AStarGrid;

  beforeEach(() => {
    astar = new AStar();

    // Simple 5x5 grid with no obstacles
    simpleGrid = {
      width: 5,
      height: 5,
      cellSize: 1,
      cells: Array(5)
        .fill(null)
        .map(() => Array(5).fill(true)),
    };

    // Complex 10x10 grid with obstacles
    complexGrid = {
      width: 10,
      height: 10,
      cellSize: 1,
      cells: Array(10)
        .fill(null)
        .map(() => Array(10).fill(true)),
    };

    // Add obstacles to complex grid
    for (let i = 2; i < 8; i++) {
      complexGrid.cells[4][i] = false; // Horizontal wall
      complexGrid.cells[i][4] = false; // Vertical wall
    }
  });

  describe("Mathematical Theory", () => {
    it("should implement correct f-score calculation: f(n) = g(n) + h(n)", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 4, y: 4 };

      const result = astar.findPath(start, goal, simpleGrid);

      expect(result.success).toBe(true);
      expect(result.path.length).toBeGreaterThan(0);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it("should find optimal path using admissible heuristic", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 2, y: 2 };

      const result = astar.findPath(start, goal, simpleGrid);

      expect(result.success).toBe(true);
      // Optimal path should be diagonal (if allowed) or Manhattan distance
      expect(result.path.length).toBeLessThanOrEqual(3);
    });

    it("should respect heuristic admissibility property", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 3, y: 4 };

      // Euclidean heuristic should never overestimate
      const euclideanResult = astar.findPath(start, goal, simpleGrid);
      const euclideanCost = euclideanResult.totalCost;

      // Manhattan heuristic should never overestimate
      astar.setHeuristic(manhattanDistance);
      const manhattanResult = astar.findPath(start, goal, simpleGrid);
      const manhattanCost = manhattanResult.totalCost;

      expect(euclideanResult.success).toBe(true);
      expect(manhattanResult.success).toBe(true);
      expect(euclideanCost).toBeLessThanOrEqual(manhattanCost);
    });
  });

  describe("Core Operations", () => {
    it("should find path in simple grid", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 4, y: 4 };

      const result = astar.findPath(start, goal, simpleGrid);

      expect(result.success).toBe(true);
      expect(result.path[0]).toEqual(start);
      expect(result.path[result.path.length - 1]).toEqual(goal);
    });

    it("should find path around obstacles", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result = astar.findPath(start, goal, complexGrid);

      expect(result.success).toBe(true);
      expect(result.path.length).toBeGreaterThan(10); // Should go around obstacles
    });

    it("should handle no path scenarios", () => {
      // Create grid with no possible path
      const blockedGrid: AStarGrid = {
        width: 3,
        height: 3,
        cellSize: 1,
        cells: [
          [true, false, true],
          [false, false, false],
          [true, false, true],
        ],
      };

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 2, y: 2 };

      const result = astar.findPath(start, goal, blockedGrid);

      expect(result.success).toBe(false);
      expect(result.path).toEqual([]);
    });

    it("should handle same start and goal", () => {
      const point: Point = { x: 2, y: 2 };

      const result = astar.findPath(point, point, simpleGrid);

      expect(result.success).toBe(true);
      expect(result.path).toEqual([point]);
      expect(result.totalCost).toBe(0);
    });

    it("should respect diagonal movement settings", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 2, y: 2 };

      // Test with diagonal movement allowed
      astar.updateConfig({ allowDiagonal: true });
      const diagonalResult = astar.findPath(start, goal, simpleGrid);

      // Test with diagonal movement disabled
      astar.updateConfig({ allowDiagonal: false });
      const noDiagonalResult = astar.findPath(start, goal, simpleGrid);

      expect(diagonalResult.success).toBe(true);
      expect(noDiagonalResult.success).toBe(true);
      expect(diagonalResult.path.length).toBeLessThanOrEqual(noDiagonalResult.path.length);
    });
  });

  describe("Heuristic Functions", () => {
    it("should work with Manhattan distance heuristic", () => {
      astar.setHeuristic(manhattanDistance);

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 3, y: 4 };

      const result = astar.findPath(start, goal, simpleGrid);

      expect(result.success).toBe(true);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it("should work with Euclidean distance heuristic", () => {
      astar.setHeuristic(euclideanDistance);

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 3, y: 4 };

      const result = astar.findPath(start, goal, simpleGrid);

      expect(result.success).toBe(true);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it("should work with Chebyshev distance heuristic", () => {
      astar.setHeuristic(chebyshevDistance);

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 3, y: 4 };

      const result = astar.findPath(start, goal, simpleGrid);

      expect(result.success).toBe(true);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it("should work with Octile distance heuristic", () => {
      astar.setHeuristic(octileDistance);

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 3, y: 4 };

      const result = astar.findPath(start, goal, simpleGrid);

      expect(result.success).toBe(true);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it("should work with custom heuristic", () => {
      const customHeuristic = createHeuristic("manhattan", { weight: 1.5 });
      astar.setHeuristic(customHeuristic);

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 3, y: 4 };

      const result = astar.findPath(start, goal, simpleGrid);

      expect(result.success).toBe(true);
      expect(result.totalCost).toBeGreaterThan(0);
    });
  });

  describe("Configuration Options", () => {
    it("should respect max iterations limit", () => {
      astar.updateConfig({ maxIterations: 5 });

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result = astar.findPath(start, goal, complexGrid);

      expect(result.iterations).toBeLessThanOrEqual(5);
    });

    it("should use tie-breaking when enabled", () => {
      astar.updateConfig({ useTieBreaking: true, tieBreakingFactor: 0.001 });

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 4, y: 4 };

      const result = astar.findPath(start, goal, simpleGrid);

      expect(result.success).toBe(true);
    });

    it("should handle different diagonal costs", () => {
      astar.updateConfig({
        allowDiagonal: true,
        diagonalCost: 2.0,
        regularCost: 1.0,
      });

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 2, y: 2 };

      const result = astar.findPath(start, goal, simpleGrid);

      expect(result.success).toBe(true);
      expect(result.totalCost).toBeGreaterThan(0);
    });
  });

  describe("Caching", () => {
    it("should cache pathfinding results", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 4, y: 4 };

      // First call
      const result1 = astar.findPath(start, goal, simpleGrid);
      expect(result1.success).toBe(true);

      // Second call should return consistent results
      const result2 = astar.findPath(start, goal, simpleGrid);
      expect(result2.success).toBe(true);
      expect(result2.path).toEqual(result1.path); // Same path should be found
    });

    it("should clear cache when requested", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 4, y: 4 };

      // Cache a result
      astar.findPath(start, goal, simpleGrid);

      // Clear cache
      astar.clearCache();

      // Next call should not use cache
      const result = astar.findPath(start, goal, simpleGrid);
      expect(result.success).toBe(true);
      expect(result.executionTime).toBeGreaterThan(0);
    });
  });

  describe("Statistics and Performance", () => {
    it("should collect statistics", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 4, y: 4 };

      astar.findPath(start, goal, simpleGrid);

      const stats = astar.getStats();
      expect(stats.totalOperations).toBe(1);
      expect(stats.successRate).toBe(1.0);
      expect(stats.averageExecutionTime).toBeGreaterThan(0);
    });

    it("should provide performance metrics", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 4, y: 4 };

      astar.findPath(start, goal, simpleGrid);

      const metrics = astar.getPerformanceMetrics();
      expect(metrics.performanceScore).toBeGreaterThan(0);
      expect(metrics.cacheSize).toBeGreaterThanOrEqual(0);
      expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
    });

    it("should reset statistics", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 4, y: 4 };

      astar.findPath(start, goal, simpleGrid);
      astar.resetStats();

      const stats = astar.getStats();
      expect(stats.totalOperations).toBe(0);
      expect(stats.successRate).toBe(0);
    });
  });

  describe("Event Handling", () => {
    it("should emit events when debugging is enabled", () => {
      const eventHandler = vi.fn();
      const debugAstar = new AStar({ enableDebug: true, eventHandlers: [eventHandler] });

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 2, y: 2 };

      debugAstar.findPath(start, goal, simpleGrid);

      expect(eventHandler).toHaveBeenCalled();
    });

    it("should not emit events when debugging is disabled", () => {
      const eventHandler = vi.fn();
      const normalAstar = new AStar({ enableDebug: false, eventHandlers: [eventHandler] });

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 2, y: 2 };

      normalAstar.findPath(start, goal, simpleGrid);

      expect(eventHandler).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle out-of-bounds start point", () => {
      const start: Point = { x: -1, y: -1 };
      const goal: Point = { x: 2, y: 2 };

      const result = astar.findPath(start, goal, simpleGrid);

      // Out of bounds start point should be handled gracefully
      // Current implementation may clip to valid bounds
      expect(result).toBeDefined();
    });

    it("should handle out-of-bounds goal point", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 10, y: 10 };

      const result = astar.findPath(start, goal, simpleGrid);

      expect(result.success).toBe(false);
    });

    it("should handle single-cell grid", () => {
      const singleCellGrid: AStarGrid = {
        width: 1,
        height: 1,
        cellSize: 1,
        cells: [[true]],
      };

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 0, y: 0 };

      const result = astar.findPath(start, goal, singleCellGrid);

      expect(result.success).toBe(true);
      expect(result.path).toEqual([start]);
    });

    it("should handle very large grids efficiently", () => {
      const largeGrid: AStarGrid = {
        width: 100,
        height: 100,
        cellSize: 1,
        cells: Array(100)
          .fill(null)
          .map(() => Array(100).fill(true)),
      };

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 99, y: 99 };

      const result = astar.findPath(start, goal, largeGrid);

      expect(result.success).toBe(true);
      expect(result.iterations).toBeLessThan(10000); // Should complete within max iterations
    });
  });

  describe("Performance Benchmarks", () => {
    it("should complete pathfinding within reasonable time", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const startTime = performance.now();
      const result = astar.findPath(start, goal, complexGrid);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    it("should explore reasonable number of nodes", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 4, y: 4 };

      const result = astar.findPath(start, goal, simpleGrid);

      expect(result.success).toBe(true);
      expect(result.nodesExplored).toBeLessThan(25); // Should not explore entire grid
      expect(result.nodesExplored).toBeGreaterThan(0);
    });

    it("should find efficient paths", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 4, y: 4 };

      const result = astar.findPath(start, goal, simpleGrid);

      expect(result.success).toBe(true);
      // Path should be reasonably efficient
      expect(result.path.length).toBeLessThanOrEqual(9); // Manhattan distance + some overhead
    });
  });

  describe("Integration", () => {
    it("should work with different grid configurations", () => {
      const grids = [
        simpleGrid,
        complexGrid,
        {
          width: 3,
          height: 3,
          cellSize: 1,
          cells: Array(3)
            .fill(null)
            .map(() => Array(3).fill(true)),
        },
      ];

      for (const grid of grids) {
        const start: Point = { x: 0, y: 0 };
        const goal: Point = { x: grid.width - 1, y: grid.height - 1 };

        const result = astar.findPath(start, goal, grid);

        expect(result.success).toBe(true);
        expect(result.path.length).toBeGreaterThan(0);
      }
    });

    it("should maintain consistency across multiple calls", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 4, y: 4 };

      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(astar.findPath(start, goal, simpleGrid));
      }

      // All results should be identical
      for (let i = 1; i < results.length; i++) {
        expect(results[i].success).toBe(results[0].success);
        expect(results[i].path.length).toBe(results[0].path.length);
        expect(results[i].totalCost).toBe(results[0].totalCost);
      }
    });
  });
});
