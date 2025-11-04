/**
 * @file Unit tests for Jump Point Search (JPS) pathfinding algorithm
 */
/* eslint-disable max-lines, max-lines-per-function */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { JPS, JPSUtils } from "../../algorithms/pathfinding/jps/index";
import type { Point, CellType } from "../../algorithms/pathfinding/jps/jps-types";
import { Direction, MovementType } from "../../algorithms/pathfinding/jps/jps-types";

describe("JPS", () => {
  let jps: JPS;
  let grid: CellType[];
  let width: number;
  let height: number;

  beforeEach(() => {
    jps = new JPS();
    width = 10;
    height = 10;
    // Create a simple grid with some obstacles
    grid = new Array(width * height).fill(0); // All walkable initially

    // Add some obstacles
    grid[1 * width + 1] = 1; // Obstacle at (1,1)
    grid[2 * width + 2] = 1; // Obstacle at (2,2)
    grid[3 * width + 3] = 1; // Obstacle at (3,3)
  });

  afterEach(() => {
    jps.resetStats();
    jps.clearCache();
  });

  describe("Basic Pathfinding", () => {
    it("should find a simple path", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result = jps.findPath(grid, width, height, start, goal);

      expect(result.found).toBe(true);
      expect(result.path).toBeDefined();
      expect(result.path.length).toBeGreaterThan(0);
      expect(result.path[0]).toEqual(start);
      expect(result.path[result.path.length - 1]).toEqual(goal);
    });

    it("should find a path avoiding obstacles", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 4, y: 4 };

      const result = jps.findPath(grid, width, height, start, goal);

      expect(result.found).toBe(true);
      expect(result.path).toBeDefined();

      // Check that path doesn't go through obstacles
      for (const point of result.path) {
        expect(JPSUtils.getCellType(grid, point, width, height)).not.toBe(1);
      }
    });

    it("should handle start and goal at same position", () => {
      const start: Point = { x: 5, y: 5 };
      const goal: Point = { x: 5, y: 5 };

      const result = jps.findPath(grid, width, height, start, goal);

      expect(result.found).toBe(true);
      expect(result.path).toEqual([start]);
      expect(result.cost).toBe(0);
    });

    it("should return no path when goal is unreachable", () => {
      // Create a grid with a wall blocking the goal
      const blockedGrid = new Array(width * height).fill(0);
      for (let x = 0; x < width; x++) {
        blockedGrid[5 * width + x] = 1; // Wall at y=5
      }
      blockedGrid[5 * width + 9] = 0; // Leave goal accessible
      blockedGrid[5 * width + 8] = 1; // But block the path to it

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result = jps.findPath(blockedGrid, width, height, start, goal);

      expect(result.found).toBe(false);
      expect(result.path).toEqual([]);
    });

    it("should handle diagonal movement when enabled", () => {
      jps.updateConfig({ allowDiagonal: true, movementType: MovementType.ALL });

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 4, y: 4 }; // Goal not blocked by obstacles

      const result = jps.findPath(grid, width, height, start, goal);

      expect(result.found).toBe(true);
      expect(result.path).toBeDefined();
    });

    it("should handle cardinal-only movement", () => {
      jps.updateConfig({ allowDiagonal: false, movementType: MovementType.CARDINAL });

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 4, y: 4 }; // Goal not blocked by obstacles

      const result = jps.findPath(grid, width, height, start, goal);

      expect(result.found).toBe(true);
      expect(result.path).toBeDefined();
    });
  });

  describe("Grid Validation", () => {
    it("should validate correct grid", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const validation = jps.validateGrid(grid, width, height, start, goal);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should detect invalid start point", () => {
      const start: Point = { x: -1, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const validation = jps.validateGrid(grid, width, height, start, goal);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Start point out of bounds: (-1, 0)");
    });

    it("should detect invalid goal point", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 10, y: 10 };

      const validation = jps.validateGrid(grid, width, height, start, goal);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Goal point out of bounds: (10, 10)");
    });

    it("should detect unwalkable start point", () => {
      const start: Point = { x: 1, y: 1 }; // Obstacle position
      const goal: Point = { x: 9, y: 9 };

      const validation = jps.validateGrid(grid, width, height, start, goal);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Start point is not walkable: (1, 1)");
    });

    it("should detect unwalkable goal point", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 2, y: 2 }; // Obstacle position

      const validation = jps.validateGrid(grid, width, height, start, goal);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Goal point is not walkable: (2, 2)");
    });

    it("should detect grid size mismatch", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };
      const wrongGrid = new Array(50).fill(0); // Wrong size

      const validation = jps.validateGrid(wrongGrid, width, height, start, goal);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Grid array length mismatch: expected 100, got 50");
    });

    it("should detect disconnected start and goal", () => {
      // Create a grid with a wall completely separating start and goal
      const disconnectedGrid = new Array(width * height).fill(0);
      for (let x = 0; x < width; x++) {
        disconnectedGrid[5 * width + x] = 1; // Wall at y=5
      }

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const validation = jps.validateGrid(disconnectedGrid, width, height, start, goal);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("No path exists between start and goal");
    });
  });

  describe("Path Optimization", () => {
    it("should optimize path by removing redundant points", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result = jps.findPath(grid, width, height, start, goal, { optimizePath: true });

      expect(result.found).toBe(true);
      expect(result.path).toBeDefined();

      // Path should be optimized (fewer points than a naive path)
      expect(result.path.length).toBeLessThanOrEqual(19); // Maximum possible for 10x10 grid
    });

    it("should handle path optimization with line of sight", () => {
      const optimization = jps.optimizePath(
        [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 2 },
          { x: 9, y: 9 },
        ],
        grid,
        width,
        height,
        { useLineOfSight: true }
      );

      expect(optimization.success).toBe(true);
      expect(optimization.path).toBeDefined();
      expect(optimization.pointsRemoved).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Statistics and Performance", () => {
    it("should track pathfinding statistics", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result = jps.findPath(grid, width, height, start, goal);

      expect(result.stats.success).toBe(true);
      expect(result.stats.nodesExplored).toBeGreaterThan(0);
      expect(result.stats.jumpPointsFound).toBeGreaterThan(0);
      expect(result.stats.iterations).toBeGreaterThan(0);
      expect(result.stats.executionTime).toBeGreaterThan(0);
    });

    it("should track movement statistics", () => {
      jps.updateConfig({ allowDiagonal: true });

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result = jps.findPath(grid, width, height, start, goal);

      expect(result.stats.cardinalMoves + result.stats.diagonalMoves).toBeGreaterThan(0);
    });

    it("should reset statistics", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      jps.findPath(grid, width, height, start, goal);
      jps.resetStats();

      const stats = jps.getStats();
      expect(stats.nodesExplored).toBe(0);
      expect(stats.jumpPointsFound).toBe(0);
      expect(stats.iterations).toBe(0);
    });
  });

  describe("Configuration", () => {
    it("should update configuration", () => {
      jps.updateConfig({ allowDiagonal: false, maxIterations: 1000 });

      const config = jps.getConfig();
      expect(config.allowDiagonal).toBe(false);
      expect(config.maxIterations).toBe(1000);
    });

    it("should get current configuration", () => {
      const config = jps.getConfig();
      expect(config).toBeDefined();
      expect(config.allowDiagonal).toBeDefined();
      expect(config.movementType).toBeDefined();
      expect(config.maxIterations).toBeDefined();
    });

    it("should handle different movement types", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 4, y: 4 }; // Goal not blocked by obstacles

      // Test cardinal movement
      jps.updateConfig({ movementType: MovementType.CARDINAL, allowDiagonal: false });
      const cardinalResult = jps.findPath(grid, width, height, start, goal);
      expect(cardinalResult.found).toBe(true);

      // Test diagonal movement
      jps.updateConfig({ movementType: MovementType.DIAGONAL, allowDiagonal: true });
      const diagonalResult = jps.findPath(grid, width, height, start, goal);
      expect(diagonalResult.found).toBe(true);

      // Test all movement
      jps.updateConfig({ movementType: MovementType.ALL, allowDiagonal: true });
      const allResult = jps.findPath(grid, width, height, start, goal);
      expect(allResult.found).toBe(true);
    });
  });

  describe("Caching", () => {
    it("should cache results when enabled", () => {
      jps.updateConfig({ enableCaching: true });

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result1 = jps.findPath(grid, width, height, start, goal);
      const result2 = jps.findPath(grid, width, height, start, goal);

      expect(result1.found).toBe(result2.found);
      expect(result1.path).toEqual(result2.path);
    });

    it("should not cache when disabled", () => {
      jps.updateConfig({ enableCaching: false });

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result1 = jps.findPath(grid, width, height, start, goal);
      const result2 = jps.findPath(grid, width, height, start, goal);

      // Results should be the same but not cached
      expect(result1.found).toBe(result2.found);
    });

    it("should clear cache", () => {
      jps.updateConfig({ enableCaching: true });

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result1 = jps.findPath(grid, width, height, start, goal);
      expect(result1.found).toBe(true);
      
      jps.clearCache();
      
      // Run the same path again - should recalculate (not use cache)
      const result2 = jps.findPath(grid, width, height, start, goal);
      expect(result2.found).toBe(true);
      // Both should have found paths (cache was cleared, so it recalculated)
    });
  });

  describe("Serialization", () => {
    it("should serialize result to JSON", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result = jps.findPath(grid, width, height, start, goal);
      const serialized = jps.serialize(result, { precision: 2 });

      expect(serialized.path).toBeDefined();
      expect(serialized.found).toBe(result.found);
      // Cost should be rounded to 2 decimal places when precision is 2
      expect(serialized.cost).toBeCloseTo(result.cost, 2);
    });

    it("should include statistics when requested", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result = jps.findPath(grid, width, height, start, goal);
      const serialized = jps.serialize(result, { includeStats: true });

      expect(serialized.stats).toBeDefined();
      expect(serialized.stats!.nodesExplored).toBeGreaterThan(0);
    });

    it("should include explored nodes when requested", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result = jps.findPath(grid, width, height, start, goal, { returnExplored: true });
      const serialized = jps.serialize(result, { includeExplored: true });

      expect(serialized.explored).toBeDefined();
    });
  });

  describe("Comparison", () => {
    it("should compare identical results", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result1 = jps.findPath(grid, width, height, start, goal);
      const result2 = jps.findPath(grid, width, height, start, goal);

      const comparison = jps.compare(result1, result2);
      expect(comparison.areEquivalent).toBe(true);
      expect(comparison.similarity).toBeCloseTo(1, 2);
    });

    it("should compare different results", () => {
      const start: Point = { x: 0, y: 0 };
      const goal1: Point = { x: 5, y: 5 };
      const goal2: Point = { x: 9, y: 9 };

      const result1 = jps.findPath(grid, width, height, start, goal1);
      const result2 = jps.findPath(grid, width, height, start, goal2);

      const comparison = jps.compare(result1, result2);
      expect(comparison.areEquivalent).toBe(false);
      expect(comparison.similarity).toBeLessThan(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty grid", () => {
      const emptyGrid: CellType[] = [];
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 0, y: 0 };

      const result = jps.findPath(emptyGrid, 0, 0, start, goal);
      expect(result.found).toBe(false);
    });

    it("should handle single cell grid", () => {
      const singleGrid: CellType[] = [0];
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 0, y: 0 };

      const result = jps.findPath(singleGrid, 1, 1, start, goal);
      expect(result.found).toBe(true);
      expect(result.path).toEqual([start]);
    });

    it("should handle maximum iterations", () => {
      jps.updateConfig({ maxIterations: 1 });

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result = jps.findPath(grid, width, height, start, goal);

      // Should either find path quickly or hit iteration limit
      expect(result.stats.iterations).toBeLessThanOrEqual(1);
    });

    it("should handle custom heuristic", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const customHeuristic = (from: Point, to: Point) => {
        return Math.abs(to.x - from.x) + Math.abs(to.y - from.y) * 2; // Weighted Manhattan
      };

      const result = jps.findPath(grid, width, height, start, goal, { customHeuristic });

      expect(result.found).toBe(true);
      expect(result.path).toBeDefined();
    });
  });

  describe("JPSUtils", () => {
    it("should calculate distances correctly", () => {
      const a: Point = { x: 0, y: 0 };
      const b: Point = { x: 3, y: 4 };

      expect(JPSUtils.distance(a, b)).toBeCloseTo(5, 5);
      expect(JPSUtils.manhattanDistance(a, b)).toBe(7);
      expect(JPSUtils.chebyshevDistance(a, b)).toBe(4);
    });

    it("should handle direction vectors", () => {
      const north = JPSUtils.getDirectionVector(Direction.NORTH);
      expect(north).toEqual({ x: 0, y: -1 });

      const east = JPSUtils.getDirectionVector(Direction.EAST);
      expect(east).toEqual({ x: 1, y: 0 });

      const direction = JPSUtils.getDirectionFromVector({ x: 1, y: 0 });
      expect(direction).toBe(Direction.EAST);
    });

    it("should check walkability correctly", () => {
      expect(JPSUtils.isWalkable(grid, { x: 0, y: 0 }, width, height)).toBe(true);
      expect(JPSUtils.isWalkable(grid, { x: 1, y: 1 }, width, height)).toBe(false);
      expect(JPSUtils.isWalkable(grid, { x: -1, y: 0 }, width, height)).toBe(false);
    });

    it("should generate test grids", () => {
      const testGrid = JPSUtils.generateTestGrid(5, 5, 0.2);
      expect(testGrid.length).toBe(25);

      const obstacleCount = testGrid.filter(cell => cell === 1).length;
      expect(obstacleCount).toBeGreaterThan(0);
    });

    it("should convert between 1D and 2D arrays", () => {
      const grid2D = [
        [0, 1, 0],
        [1, 0, 1],
        [0, 1, 0],
      ];

      const grid1D = JPSUtils.from2DArray(grid2D);
      expect(grid1D.length).toBe(9);

      const backTo2D = JPSUtils.to2DArray(grid1D, 3, 3);
      expect(backTo2D).toEqual(grid2D);
    });
  });
});
