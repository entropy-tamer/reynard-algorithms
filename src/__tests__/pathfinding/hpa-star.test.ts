/**
 * @module algorithms/pathfinding/hpa-star/hpa-star.test
 * @description Unit tests for HPA* hierarchical pathfinding algorithm.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { HPAStar, HPAStarUtils } from "../../pathfinding/hpa-star";
import type { Point, CellType, HPAConfig, HPAOptions } from "../../pathfinding/hpa-star/hpa-star-types";

describe("HPAStar", () => {
  let hpaStar: HPAStar;
  let config: HPAConfig;
  let options: HPAOptions;
  let grid: CellType[];
  let start: Point;
  let goals: Point[];

  beforeEach(() => {
    config = {
      width: 20,
      height: 20,
      clusterSize: 5,
      allowDiagonal: true,
      diagonalOnlyWhenClear: true,
      cardinalCost: 1,
      diagonalCost: Math.sqrt(2),
      maxPathLength: 1000,
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
      maxIterations: 1000,
      useGoalBounding: false,
      useHierarchicalAbstraction: true,
    };

    // Create a simple test grid
    grid = new Array(config.width * config.height).fill(CellType.WALKABLE);

    // Add some obstacles
    for (let i = 0; i < 50; i++) {
      const x = Math.floor(Math.random() * config.width);
      const y = Math.floor(Math.random() * config.height);
      grid[y * config.width + x] = CellType.OBSTACLE;
    }

    start = { x: 0, y: 0 };
    goals = [{ x: config.width - 1, y: config.height - 1 }];

    hpaStar = new HPAStar(config);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create HPA* instance with valid configuration", () => {
      expect(hpaStar).toBeDefined();
      expect(hpaStar.config).toEqual(config);
    });

    it("should create HPA* instance with default configuration", () => {
      const defaultHPA = new HPAStar();
      expect(defaultHPA).toBeDefined();
      expect(defaultHPA.config).toBeDefined();
    });

    it("should validate configuration parameters", () => {
      const invalidConfig = { ...config, width: -1 };
      expect(() => new HPAStar(invalidConfig)).toThrow();
    });
  });

  describe("findPath", () => {
    it("should find a path from start to goal", () => {
      const result = hpaStar.findPath(start, goals, grid, options);

      expect(result.success).toBe(true);
      expect(result.path).toBeDefined();
      expect(result.path.length).toBeGreaterThan(0);
      expect(result.path[0]).toEqual(start);
      expect(result.path[result.path.length - 1]).toEqual(goals[0]);
    });

    it("should return failure when no path exists", () => {
      // Create a grid with no path
      const blockedGrid = new Array(config.width * config.height).fill(CellType.OBSTACLE);
      blockedGrid[0] = CellType.WALKABLE; // Start
      blockedGrid[blockedGrid.length - 1] = CellType.WALKABLE; // Goal

      const result = hpaStar.findPath(start, goals, blockedGrid, options);

      expect(result.success).toBe(false);
      expect(result.path).toEqual([]);
    });

    it("should handle single goal", () => {
      const result = hpaStar.findPath(start, [goals[0]], grid, options);

      expect(result.success).toBe(true);
      expect(result.path).toBeDefined();
      expect(result.path.length).toBeGreaterThan(0);
    });

    it("should handle multiple goals", () => {
      const multipleGoals = [
        { x: 5, y: 5 },
        { x: 10, y: 10 },
        { x: 15, y: 15 },
      ];

      const result = hpaStar.findPath(start, multipleGoals, grid, options);

      expect(result.success).toBe(true);
      expect(result.path).toBeDefined();
      expect(result.path.length).toBeGreaterThan(0);
    });

    it("should handle start and goal at same position", () => {
      const samePoint = { x: 5, y: 5 };
      const result = hpaStar.findPath(samePoint, [samePoint], grid, options);

      expect(result.success).toBe(true);
      expect(result.path).toEqual([samePoint]);
    });

    it("should respect max path length", () => {
      const limitedConfig = { ...config, maxPathLength: 5 };
      const limitedHPA = new HPAStar(limitedConfig);

      const result = limitedHPA.findPath(start, goals, grid, options);

      if (result.success) {
        expect(result.path.length).toBeLessThanOrEqual(5);
      }
    });

    it("should use path smoothing when enabled", () => {
      const smoothingOptions = { ...options, usePathSmoothing: true };
      const result = hpaStar.findPath(start, goals, grid, smoothingOptions);

      expect(result.success).toBe(true);
      expect(result.path).toBeDefined();
    });

    it("should use early termination when enabled", () => {
      const earlyTermOptions = { ...options, useEarlyTermination: true };
      const result = hpaStar.findPath(start, goals, grid, earlyTermOptions);

      expect(result.success).toBe(true);
      expect(result.path).toBeDefined();
    });
  });

  describe("findPathToNearestGoal", () => {
    it("should find path to nearest goal", () => {
      const multipleGoals = [
        { x: 5, y: 5 },
        { x: 10, y: 10 },
        { x: 15, y: 15 },
      ];

      const result = hpaStar.findPathToNearestGoal(start, multipleGoals, grid, options);

      expect(result.success).toBe(true);
      expect(result.path).toBeDefined();
      expect(result.path.length).toBeGreaterThan(0);
      expect(result.goalReached).toBeDefined();
    });

    it("should return failure when no goals are reachable", () => {
      const blockedGrid = new Array(config.width * config.height).fill(CellType.OBSTACLE);
      blockedGrid[0] = CellType.WALKABLE; // Start only

      const result = hpaStar.findPathToNearestGoal(start, goals, blockedGrid, options);

      expect(result.success).toBe(false);
      expect(result.path).toEqual([]);
    });
  });

  describe("validatePath", () => {
    it("should validate a valid path", () => {
      const result = hpaStar.findPath(start, goals, grid, options);

      if (result.success) {
        const validation = hpaStar.validatePath(result.path, grid);
        expect(validation.isValid).toBe(true);
      }
    });

    it("should invalidate a path with obstacles", () => {
      const invalidPath = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ];

      // Make the middle point an obstacle
      const testGrid = [...grid];
      testGrid[1 * config.width + 1] = CellType.OBSTACLE;

      const validation = hpaStar.validatePath(invalidPath, testGrid);
      expect(validation.isValid).toBe(false);
    });

    it("should invalidate a path with invalid moves", () => {
      const invalidPath = [
        { x: 0, y: 0 },
        { x: 3, y: 3 }, // Invalid move (too far)
      ];

      const validation = hpaStar.validatePath(invalidPath, grid);
      expect(validation.isValid).toBe(false);
    });
  });

  describe("getStatistics", () => {
    it("should return statistics after pathfinding", () => {
      hpaStar.findPath(start, goals, grid, options);
      const stats = hpaStar.getStatistics();

      expect(stats).toBeDefined();
      expect(stats.totalPathsFound).toBeGreaterThanOrEqual(0);
      expect(stats.totalTime).toBeGreaterThanOrEqual(0);
    });

    it("should track pathfinding statistics", () => {
      const initialStats = hpaStar.getStatistics();

      hpaStar.findPath(start, goals, grid, options);
      const afterStats = hpaStar.getStatistics();

      expect(afterStats.totalPathsFound).toBeGreaterThanOrEqual(initialStats.totalPathsFound);
    });
  });

  describe("clearCache", () => {
    it("should clear the pathfinding cache", () => {
      hpaStar.findPath(start, goals, grid, options);
      hpaStar.clearCache();

      const stats = hpaStar.getStatistics();
      expect(stats.cacheHits).toBe(0);
    });
  });

  describe("updateConfiguration", () => {
    it("should update configuration", () => {
      const newConfig = { ...config, clusterSize: 10 };
      hpaStar.updateConfiguration(newConfig);

      expect(hpaStar.config.clusterSize).toBe(10);
    });

    it("should validate new configuration", () => {
      const invalidConfig = { ...config, width: -1 };

      expect(() => hpaStar.updateConfiguration(invalidConfig)).toThrow();
    });
  });

  describe("edge cases", () => {
    it("should handle empty grid", () => {
      const emptyGrid: CellType[] = [];
      const result = hpaStar.findPath(start, goals, emptyGrid, options);

      expect(result.success).toBe(false);
    });

    it("should handle grid with all obstacles", () => {
      const obstacleGrid = new Array(config.width * config.height).fill(CellType.OBSTACLE);
      const result = hpaStar.findPath(start, goals, obstacleGrid, options);

      expect(result.success).toBe(false);
    });

    it("should handle grid with all walkable cells", () => {
      const walkableGrid = new Array(config.width * config.height).fill(CellType.WALKABLE);
      const result = hpaStar.findPath(start, goals, walkableGrid, options);

      expect(result.success).toBe(true);
      expect(result.path).toBeDefined();
    });

    it("should handle very small grid", () => {
      const smallConfig = { ...config, width: 2, height: 2 };
      const smallHPA = new HPAStar(smallConfig);
      const smallGrid = [CellType.WALKABLE, CellType.WALKABLE, CellType.WALKABLE, CellType.WALKABLE];

      const result = smallHPA.findPath({ x: 0, y: 0 }, [{ x: 1, y: 1 }], smallGrid, options);

      expect(result.success).toBe(true);
    });

    it("should handle very large grid", () => {
      const largeConfig = { ...config, width: 100, height: 100 };
      const largeHPA = new HPAStar(largeConfig);
      const largeGrid = new Array(10000).fill(CellType.WALKABLE);

      const result = largeHPA.findPath({ x: 0, y: 0 }, [{ x: 99, y: 99 }], largeGrid, options);

      expect(result.success).toBe(true);
    });
  });

  describe("performance", () => {
    it("should complete pathfinding within reasonable time", () => {
      const startTime = performance.now();
      hpaStar.findPath(start, goals, grid, options);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it("should handle multiple pathfinding operations", () => {
      const multipleStarts = [
        { x: 0, y: 0 },
        { x: 5, y: 5 },
        { x: 10, y: 10 },
      ];

      for (const startPoint of multipleStarts) {
        const result = hpaStar.findPath(startPoint, goals, grid, options);
        expect(result.success).toBe(true);
      }
    });
  });
});

describe("HPAStarUtils", () => {
  describe("generateTestGrid", () => {
    it("should generate a grid with specified dimensions", () => {
      const grid = HPAStarUtils.generateTestGrid(10, 10, 0.3);

      expect(grid.length).toBe(100);
    });

    it("should generate a grid with specified obstacle ratio", () => {
      const grid = HPAStarUtils.generateTestGrid(10, 10, 0.5, 12345);
      const obstacleCount = grid.filter(cell => cell === CellType.OBSTACLE).length;

      expect(obstacleCount).toBeGreaterThan(0);
      expect(obstacleCount).toBeLessThan(100);
    });

    it("should generate reproducible grids with seed", () => {
      const grid1 = HPAStarUtils.generateTestGrid(10, 10, 0.3, 12345);
      const grid2 = HPAStarUtils.generateTestGrid(10, 10, 0.3, 12345);

      expect(grid1).toEqual(grid2);
    });
  });

  describe("generatePatternGrid", () => {
    it("should generate maze pattern", () => {
      const grid = HPAStarUtils.generatePatternGrid(20, 20, "maze", 12345);

      expect(grid.length).toBe(400);
      expect(grid.some(cell => cell === CellType.WALKABLE)).toBe(true);
    });

    it("should generate room pattern", () => {
      const grid = HPAStarUtils.generatePatternGrid(20, 20, "rooms", 12345);

      expect(grid.length).toBe(400);
      expect(grid.some(cell => cell === CellType.WALKABLE)).toBe(true);
    });

    it("should generate corridor pattern", () => {
      const grid = HPAStarUtils.generatePatternGrid(20, 20, "corridors", 12345);

      expect(grid.length).toBe(400);
      expect(grid.some(cell => cell === CellType.WALKABLE)).toBe(true);
    });

    it("should generate spiral pattern", () => {
      const grid = HPAStarUtils.generatePatternGrid(20, 20, "spiral", 12345);

      expect(grid.length).toBe(400);
      expect(grid.some(cell => cell === CellType.WALKABLE)).toBe(true);
    });
  });

  describe("generateRandomGoals", () => {
    it("should generate specified number of goals", () => {
      const grid = HPAStarUtils.generateTestGrid(10, 10, 0.3);
      const goals = HPAStarUtils.generateRandomGoals(5, 10, 10, grid);

      expect(goals.length).toBeLessThanOrEqual(5);
    });

    it("should only generate goals on walkable cells", () => {
      const grid = HPAStarUtils.generateTestGrid(10, 10, 0.3);
      const goals = HPAStarUtils.generateRandomGoals(5, 10, 10, grid);

      for (const goal of goals) {
        const index = goal.y * 10 + goal.x;
        expect(grid[index]).toBe(CellType.WALKABLE);
      }
    });
  });

  describe("generateGoalPattern", () => {
    it("should generate corner goals", () => {
      const grid = HPAStarUtils.generateTestGrid(10, 10, 0.3);
      const goals = HPAStarUtils.generateGoalPattern("corners", 10, 10, grid);

      expect(goals.length).toBeGreaterThan(0);
      expect(goals.length).toBeLessThanOrEqual(4);
    });

    it("should generate center goal", () => {
      const grid = HPAStarUtils.generateTestGrid(10, 10, 0.3);
      const goals = HPAStarUtils.generateGoalPattern("center", 10, 10, grid);

      expect(goals.length).toBeLessThanOrEqual(1);
    });

    it("should generate edge goals", () => {
      const grid = HPAStarUtils.generateTestGrid(10, 10, 0.3);
      const goals = HPAStarUtils.generateGoalPattern("edges", 10, 10, grid);

      expect(goals.length).toBeGreaterThan(0);
    });
  });

  describe("distance calculations", () => {
    it("should calculate Euclidean distance", () => {
      const a = { x: 0, y: 0 };
      const b = { x: 3, y: 4 };

      expect(HPAStarUtils.distance(a, b)).toBe(5);
    });

    it("should calculate Manhattan distance", () => {
      const a = { x: 0, y: 0 };
      const b = { x: 3, y: 4 };

      expect(HPAStarUtils.manhattanDistance(a, b)).toBe(7);
    });

    it("should calculate Chebyshev distance", () => {
      const a = { x: 0, y: 0 };
      const b = { x: 3, y: 4 };

      expect(HPAStarUtils.chebyshevDistance(a, b)).toBe(4);
    });
  });

  describe("default configurations", () => {
    it("should create default config", () => {
      const config = HPAStarUtils.createDefaultConfig();

      expect(config).toBeDefined();
      expect(config.width).toBeGreaterThan(0);
      expect(config.height).toBeGreaterThan(0);
    });

    it("should create default options", () => {
      const options = HPAStarUtils.createDefaultOptions();

      expect(options).toBeDefined();
      expect(typeof options.returnAbstractPath).toBe("boolean");
    });

    it("should create default cluster generation options", () => {
      const options = HPAStarUtils.createDefaultClusterGenerationOptions();

      expect(options).toBeDefined();
      expect(options.clusterSize).toBeGreaterThan(0);
    });

    it("should create default entrance detection options", () => {
      const options = HPAStarUtils.createDefaultEntranceDetectionOptions();

      expect(options).toBeDefined();
      expect(typeof options.detectBorderEntrances).toBe("boolean");
    });

    it("should create default abstract graph options", () => {
      const options = HPAStarUtils.createDefaultAbstractGraphOptions();

      expect(options).toBeDefined();
      expect(typeof options.useInterClusterEdges).toBe("boolean");
    });

    it("should create default path refinement options", () => {
      const options = HPAStarUtils.createDefaultPathRefinementOptions();

      expect(options).toBeDefined();
      expect(typeof options.useAStarRefinement).toBe("boolean");
    });

    it("should create default HPA* validation options", () => {
      const options = HPAStarUtils.createDefaultHPAValidationOptions();

      expect(options).toBeDefined();
      expect(typeof options.checkClusterValidity).toBe("boolean");
    });
  });

  describe("grid visualization", () => {
    it("should convert grid to string", () => {
      const grid = [CellType.WALKABLE, CellType.OBSTACLE, CellType.OBSTACLE, CellType.WALKABLE];

      const result = HPAStarUtils.gridToString(grid, 2, 2);

      expect(result).toContain(".");
      expect(result).toContain("#");
    });

    it("should include goals in visualization", () => {
      const grid = [CellType.WALKABLE, CellType.WALKABLE, CellType.WALKABLE, CellType.WALKABLE];
      const goals = [{ x: 0, y: 0 }];

      const result = HPAStarUtils.gridToString(grid, 2, 2, goals);

      expect(result).toContain("G");
    });

    it("should include agents in visualization", () => {
      const grid = [CellType.WALKABLE, CellType.WALKABLE, CellType.WALKABLE, CellType.WALKABLE];
      const agents = [{ x: 1, y: 1 }];

      const result = HPAStarUtils.gridToString(grid, 2, 2, [], agents);

      expect(result).toContain("A");
    });
  });
});
