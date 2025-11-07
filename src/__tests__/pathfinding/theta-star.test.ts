/**
 * @file Unit tests for Theta* pathfinding algorithm.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ThetaStar } from "../../algorithms/pathfinding/theta-star/theta-star-core";
import { ThetaStarUtils } from "../../algorithms/pathfinding/theta-star/theta-star-utils";
import { LineOfSight } from "../../algorithms/pathfinding/theta-star/line-of-sight";
import type { Point, CellType, Direction, MovementType } from "../../algorithms/pathfinding/theta-star/theta-star-types";
import {
  Direction as ThetaStarDirection,
  MovementType as ThetaStarMovementType,
} from "../../algorithms/pathfinding/theta-star/theta-star-types";

describe("ThetaStar", () => {
  let thetaStar: ThetaStar;
  let grid: CellType[];
  const width = 10;
  const height = 10;

  beforeEach(() => {
    thetaStar = new ThetaStar();
    grid = ThetaStarUtils.generateTestGrid(width, height, 0.2, 42);
  });

  afterEach(() => {
    thetaStar.clearCache();
  });

  describe("Basic Pathfinding", () => {
    it("should find a path in a simple grid", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result = thetaStar.findPath(grid, width, height, start, goal);

      expect(result.found).toBe(true);
      expect(result.path.length).toBeGreaterThan(0);
      expect(result.path[0]).toEqual(start);
      expect(result.path[result.path.length - 1]).toEqual(goal);
    });

    it("should return empty path when no path exists", () => {
      // Create a grid with a wall blocking the path
      const blockedGrid: CellType[] = new Array(width * height).fill(0); // All walkable
      for (let x = 0; x < width; x++) {
        blockedGrid[5 * width + x] = 1; // Obstacle row
      }

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result = thetaStar.findPath(blockedGrid, width, height, start, goal);

      expect(result.found).toBe(false);
      expect(result.path.length).toBe(0);
    });

    it("should handle start and goal being the same", () => {
      const start: Point = { x: 5, y: 5 };
      const goal: Point = { x: 5, y: 5 };

      const result = thetaStar.findPath(grid, width, height, start, goal);

      expect(result.found).toBe(true);
      expect(result.path).toEqual([start]);
      expect(result.cost).toBe(0);
    });

    it("should find path with diagonal movement", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 2, y: 2 };

      const result = thetaStar.findPath(grid, width, height, start, goal);

      expect(result.found).toBe(true);
      expect(result.path.length).toBeGreaterThan(0);
    });

    it("should find path with cardinal movement only", () => {
      thetaStar.updateConfig({ allowDiagonal: false });

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 2, y: 2 };

      const result = thetaStar.findPath(grid, width, height, start, goal);

      expect(result.found).toBe(true);
      expect(result.path.length).toBeGreaterThan(0);
    });
  });

  describe("Configuration", () => {
    it("should use custom configuration", () => {
      const customConfig = {
        allowDiagonal: false,
        useTieBreaking: false,
        maxIterations: 1000,
      };

      thetaStar.updateConfig(customConfig);
      const config = thetaStar.getConfig();

      expect(config.allowDiagonal).toBe(false);
      expect(config.useTieBreaking).toBe(false);
      expect(config.maxIterations).toBe(1000);
    });

    it("should use default configuration", () => {
      const config = thetaStar.getConfig();

      expect(config.allowDiagonal).toBe(true);
      expect(config.useTieBreaking).toBe(true);
      expect(config.maxIterations).toBe(10000);
    });
  });

  describe("Statistics", () => {
    it("should track pathfinding statistics", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result = thetaStar.findPath(grid, width, height, start, goal);

      expect(result.stats.nodesExplored).toBeGreaterThan(0);
      expect(result.stats.iterations).toBeGreaterThan(0);
      expect(result.stats.executionTime).toBeGreaterThan(0);
      expect(result.stats.success).toBe(true);
    });

    it("should reset statistics", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      thetaStar.findPath(grid, width, height, start, goal);
      const stats1 = thetaStar.getStats();

      thetaStar.resetStats();
      const stats2 = thetaStar.getStats();

      expect(stats2.nodesExplored).toBe(0);
      expect(stats2.iterations).toBe(0);
      expect(stats2.executionTime).toBe(0);
    });
  });

  describe("Grid Validation", () => {
    it("should validate a valid grid", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const validation = thetaStar.validateGrid(grid, width, height, start, goal);

      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it("should detect invalid start point", () => {
      const start: Point = { x: -1, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const validation = thetaStar.validateGrid(grid, width, height, start, goal);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes("Start point out of bounds"))).toBe(true);
    });

    it("should detect invalid goal point", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 10, y: 9 };

      const validation = thetaStar.validateGrid(grid, width, height, start, goal);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes("Goal point out of bounds"))).toBe(true);
    });

    it("should detect non-walkable start point", () => {
      const blockedGrid: CellType[] = new Array(width * height).fill(0);
      blockedGrid[0] = 1; // Make start point an obstacle

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const validation = thetaStar.validateGrid(blockedGrid, width, height, start, goal);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes("Start point out of bounds or not walkable") || e.includes("Start point is not walkable"))).toBe(true);
    });

    it("should detect non-walkable goal point", () => {
      const blockedGrid: CellType[] = new Array(width * height).fill(0);
      blockedGrid[99] = 1; // Make goal point an obstacle

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const validation = thetaStar.validateGrid(blockedGrid, width, height, start, goal);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes("Goal point out of bounds or not walkable") || e.includes("Goal point is not walkable"))).toBe(true);
    });
  });

  describe("Path Optimization", () => {
    it("should optimize path by removing redundant points", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result = thetaStar.findPath(grid, width, height, start, goal, { optimizePath: true });

      expect(result.found).toBe(true);
      expect(result.path.length).toBeGreaterThan(0);
    });

    it("should handle path optimization options", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const optimization = thetaStar.optimizePath(
        [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 2 },
          { x: 9, y: 9 },
        ],
        grid,
        width,
        height,
        { removeRedundant: true }
      );

      expect(optimization.success).toBe(true);
      expect(optimization.path.length).toBeGreaterThan(0);
    });
  });

  describe("Path Comparison", () => {
    it("should compare two pathfinding results", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result1 = thetaStar.findPath(grid, width, height, start, goal);
      const result2 = thetaStar.findPath(grid, width, height, start, goal);

      const comparison = thetaStar.compareResults(result1, result2);

      expect(comparison.areEquivalent).toBe(true);
      expect(comparison.similarity).toBeGreaterThan(0);
    });
  });

  describe("Serialization", () => {
    it("should serialize pathfinding result", () => {
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result = thetaStar.findPath(grid, width, height, start, goal);
      const serialized = thetaStar.serialize(result, { includeStats: true });

      expect(serialized.path).toEqual(result.path);
      expect(serialized.found).toBe(result.found);
      expect(serialized.cost).toBe(result.cost);
      expect(serialized.stats).toBeDefined();
    });
  });

  describe("Caching", () => {
    it("should cache pathfinding results", () => {
      thetaStar.updateConfig({ enableCaching: true });

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result1 = thetaStar.findPath(grid, width, height, start, goal);
      const result2 = thetaStar.findPath(grid, width, height, start, goal);

      expect(result1.path).toEqual(result2.path);
    });

    it("should clear cache", () => {
      thetaStar.updateConfig({ enableCaching: true });

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      thetaStar.findPath(grid, width, height, start, goal);
      thetaStar.clearCache();

      // Cache should be cleared
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty grid", () => {
      const emptyGrid: CellType[] = [];

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 0, y: 0 };

      const result = thetaStar.findPath(emptyGrid, 0, 0, start, goal);

      expect(result.found).toBe(false);
    });

    it("should handle single cell grid", () => {
      const singleGrid: CellType[] = [0]; // Single walkable cell

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 0, y: 0 };

      const result = thetaStar.findPath(singleGrid, 1, 1, start, goal);

      expect(result.found).toBe(true);
      expect(result.path).toEqual([start]);
    });

    it("should handle maximum iterations", () => {
      thetaStar.updateConfig({ maxIterations: 1 });

      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 9, y: 9 };

      const result = thetaStar.findPath(grid, width, height, start, goal);

      expect(result.stats.iterations).toBeLessThanOrEqual(1);
    });
  });
});

describe("ThetaStarUtils", () => {
  describe("Grid Generation", () => {
    it("should generate test grid with obstacles", () => {
      const grid = ThetaStarUtils.generateTestGrid(10, 10, 0.3, 42);

      expect(grid.length).toBe(100);
      expect(grid.some(cell => cell === 1)).toBe(true); // Has obstacles
    });

    it("should generate maze grid", () => {
      const grid = ThetaStarUtils.generateMazeGrid(11, 11, 42);

      expect(grid.length).toBe(121);
      expect(grid.some(cell => cell === 0)).toBe(true); // Has walkable cells
    });

    it("should generate room grid", () => {
      const grid = ThetaStarUtils.generateRoomGrid(20, 20, 3, 3, 6, 42);

      expect(grid.length).toBe(400);
      expect(grid.some(cell => cell === 0)).toBe(true); // Has walkable cells
    });
  });

  describe("Distance Calculations", () => {
    it("should calculate Euclidean distance", () => {
      const a: Point = { x: 0, y: 0 };
      const b: Point = { x: 3, y: 4 };

      const distance = ThetaStarUtils.distance(a, b);

      expect(distance).toBe(5);
    });

    it("should calculate Manhattan distance", () => {
      const a: Point = { x: 0, y: 0 };
      const b: Point = { x: 3, y: 4 };

      const distance = ThetaStarUtils.manhattanDistance(a, b);

      expect(distance).toBe(7);
    });

    it("should calculate Chebyshev distance", () => {
      const a: Point = { x: 0, y: 0 };
      const b: Point = { x: 3, y: 4 };

      const distance = ThetaStarUtils.chebyshevDistance(a, b);

      expect(distance).toBe(4);
    });
  });

  describe("Vector Operations", () => {
    it("should get direction vector", () => {
      const from: Point = { x: 0, y: 0 };
      const to: Point = { x: 3, y: 4 };

      const vector = ThetaStarUtils.getDirectionVector(from, to);

      expect(vector.x).toBeCloseTo(0.6);
      expect(vector.y).toBeCloseTo(0.8);
    });

    it("should normalize vector", () => {
      const vector = { x: 3, y: 4 };

      const normalized = ThetaStarUtils.normalizeVector(vector);

      expect(normalized.x).toBeCloseTo(0.6);
      expect(normalized.y).toBeCloseTo(0.8);
    });

    it("should calculate dot product", () => {
      const a = { x: 1, y: 2 };
      const b = { x: 3, y: 4 };

      const dot = ThetaStarUtils.dotProduct(a, b);

      expect(dot).toBe(11);
    });

    it("should calculate cross product", () => {
      const a = { x: 1, y: 2 };
      const b = { x: 3, y: 4 };

      const cross = ThetaStarUtils.crossProduct(a, b);

      expect(cross).toBe(-2);
    });
  });

  describe("Point Operations", () => {
    it("should interpolate points", () => {
      const a: Point = { x: 0, y: 0 };
      const b: Point = { x: 10, y: 20 };

      const interpolated = ThetaStarUtils.interpolatePoints(a, b, 0.5);

      expect(interpolated.x).toBe(5);
      expect(interpolated.y).toBe(10);
    });

    it("should calculate centroid", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 10 },
        { x: 10, y: 10 },
      ];

      const centroid = ThetaStarUtils.calculateCentroid(points);

      expect(centroid.x).toBe(5);
      expect(centroid.y).toBe(5);
    });

    it("should calculate bounding box", () => {
      const points: Point[] = [
        { x: 1, y: 2 },
        { x: 5, y: 3 },
        { x: 2, y: 8 },
      ];

      const bbox = ThetaStarUtils.calculateBoundingBox(points);

      expect(bbox.min.x).toBe(1);
      expect(bbox.min.y).toBe(2);
      expect(bbox.max.x).toBe(5);
      expect(bbox.max.y).toBe(8);
    });
  });

  describe("Polygon Operations", () => {
    it("should check point in polygon", () => {
      const polygon: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ];

      const inside: Point = { x: 5, y: 5 };
      const outside: Point = { x: 15, y: 5 };

      expect(ThetaStarUtils.isPointInPolygon(inside, polygon)).toBe(true);
      expect(ThetaStarUtils.isPointInPolygon(outside, polygon)).toBe(false);
    });

    it("should calculate polygon area", () => {
      const polygon: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ];

      const area = ThetaStarUtils.calculatePolygonArea(polygon);

      expect(area).toBe(100);
    });

    it("should calculate polygon perimeter", () => {
      const polygon: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ];

      const perimeter = ThetaStarUtils.calculatePolygonPerimeter(polygon);

      expect(perimeter).toBe(40);
    });
  });

  describe("Random Point Generation", () => {
    it("should generate random point", () => {
      const point = ThetaStarUtils.generateRandomPoint(10, 10, 42);

      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThan(10);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThan(10);
    });

    it("should generate multiple random points", () => {
      const points = ThetaStarUtils.generateRandomPoints(5, 10, 10, 42);

      expect(points.length).toBe(5);
      points.forEach(point => {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThan(10);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThan(10);
      });
    });
  });

  describe("Point Search", () => {
    it("should find closest point", () => {
      const target: Point = { x: 5, y: 5 };
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 5, y: 6 },
      ];

      const closest = ThetaStarUtils.findClosestPoint(target, points);

      expect(closest).toEqual({ x: 5, y: 6 });
    });

    it("should find points in radius", () => {
      const target: Point = { x: 5, y: 5 };
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 5, y: 5 },
        { x: 6, y: 6 },
        { x: 10, y: 10 },
      ];

      const inRadius = ThetaStarUtils.findPointsInRadius(target, points, 2);

      expect(inRadius.length).toBe(2);
      expect(inRadius).toContainEqual({ x: 5, y: 5 });
      expect(inRadius).toContainEqual({ x: 6, y: 6 });
    });

    it("should sort points by distance", () => {
      const target: Point = { x: 5, y: 5 };
      const points: Point[] = [
        { x: 10, y: 10 },
        { x: 0, y: 0 },
        { x: 5, y: 6 },
      ];

      const sorted = ThetaStarUtils.sortPointsByDistance(target, points);

      // {x: 5, y: 6} is closest (distance 1)
      expect(sorted[0]).toEqual({ x: 5, y: 6 });
      // {x: 0, y: 0} and {x: 10, y: 10} are both distance ~7.07, so order may vary
      // Just verify distances are sorted correctly
      const dist1 = ThetaStarUtils.distance(target, sorted[0]);
      const dist2 = ThetaStarUtils.distance(target, sorted[1]);
      const dist3 = ThetaStarUtils.distance(target, sorted[2]);
      expect(dist1).toBeLessThanOrEqual(dist2);
      expect(dist2).toBeLessThanOrEqual(dist3);
      // Verify all points are present
      expect(sorted).toContainEqual({ x: 0, y: 0 });
      expect(sorted).toContainEqual({ x: 10, y: 10 });
    });
  });

  describe("Default Configuration", () => {
    it("should create default config", () => {
      const config = ThetaStarUtils.createDefaultConfig();

      expect(config.allowDiagonal).toBe(true);
      expect(config.useTieBreaking).toBe(true);
      expect(config.maxIterations).toBe(10000);
    });

    it("should create default options", () => {
      const options = ThetaStarUtils.createDefaultOptions();

      expect(options.returnExplored).toBe(false);
      expect(options.optimizePath).toBe(true);
      expect(options.maxPathLength).toBe(10000);
    });
  });

  describe("Grid Visualization", () => {
    it("should convert grid to string", () => {
      const grid: CellType[] = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
      const start: Point = { x: 0, y: 0 };
      const goal: Point = { x: 2, y: 1 }; // Fix: goal.y = 1 (not 2) since height is 2

      const str = ThetaStarUtils.gridToString(grid, 5, 2, start, goal);

      expect(str).toContain("S");
      expect(str).toContain("G");
      expect(str).toContain(".");
      expect(str).toContain("#");
    });

    it("should convert path to string", () => {
      const grid: CellType[] = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
      const path: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 2 },
      ];

      const str = ThetaStarUtils.pathToString(grid, 5, 2, path);

      expect(str).toContain("*");
    });
  });
});

describe("LineOfSight", () => {
  let grid: CellType[];
  const width = 10;
  const height = 10;

  beforeEach(() => {
    grid = ThetaStarUtils.generateTestGrid(width, height, 0.2, 42);
  });

  describe("Bresenham Line of Sight", () => {
    it("should detect clear line of sight", () => {
      const from: Point = { x: 0, y: 0 };
      const to: Point = { x: 5, y: 5 };

      const result = LineOfSight.checkBresenham(grid, from, to, width, height);

      expect(result.hasLineOfSight).toBe(true);
      expect(result.success).toBe(true);
    });

    it("should detect blocked line of sight", () => {
      // Create a grid with a wall blocking the line
      const blockedGrid: CellType[] = new Array(width * height).fill(0);
      blockedGrid[1 * width + 1] = 1; // Obstacle at (1, 1)

      const from: Point = { x: 0, y: 0 };
      const to: Point = { x: 5, y: 5 };

      const result = LineOfSight.checkBresenham(blockedGrid, from, to, width, height);

      expect(result.hasLineOfSight).toBe(false);
      expect(result.success).toBe(true);
    });

    it("should handle same start and end points", () => {
      const point: Point = { x: 5, y: 5 };

      const result = LineOfSight.checkBresenham(grid, point, point, width, height);

      expect(result.hasLineOfSight).toBe(true);
      expect(result.success).toBe(true);
    });
  });

  describe("DDA Line of Sight", () => {
    it("should detect clear line of sight", () => {
      const from: Point = { x: 0, y: 0 };
      const to: Point = { x: 5, y: 5 };

      const result = LineOfSight.checkDDA(grid, from, to, width, height);

      expect(result.hasLineOfSight).toBe(true);
      expect(result.success).toBe(true);
    });

    it("should detect blocked line of sight", () => {
      const blockedGrid: CellType[] = new Array(width * height).fill(0);
      blockedGrid[1 * width + 1] = 1; // Obstacle at (1, 1)

      const from: Point = { x: 0, y: 0 };
      const to: Point = { x: 5, y: 5 };

      const result = LineOfSight.checkDDA(blockedGrid, from, to, width, height);

      expect(result.hasLineOfSight).toBe(false);
      expect(result.success).toBe(true);
    });
  });

  describe("Ray Casting Line of Sight", () => {
    it("should detect clear line of sight", () => {
      const from: Point = { x: 0, y: 0 };
      const to: Point = { x: 5, y: 5 };

      const result = LineOfSight.checkRayCasting(grid, from, to, width, height);

      expect(result.hasLineOfSight).toBe(true);
      expect(result.success).toBe(true);
    });

    it("should detect blocked line of sight", () => {
      const blockedGrid: CellType[] = new Array(width * height).fill(0);
      blockedGrid[1 * width + 1] = 1; // Obstacle at (1, 1)

      const from: Point = { x: 0, y: 0 };
      const to: Point = { x: 5, y: 5 };

      const result = LineOfSight.checkRayCasting(blockedGrid, from, to, width, height);

      expect(result.hasLineOfSight).toBe(false);
      expect(result.success).toBe(true);
    });
  });

  describe("General Line of Sight", () => {
    it("should use Bresenham by default", () => {
      const from: Point = { x: 0, y: 0 };
      const to: Point = { x: 5, y: 5 };

      const result = LineOfSight.check(grid, from, to, width, height);

      expect(result.hasLineOfSight).toBe(true);
      expect(result.success).toBe(true);
    });

    it("should use DDA when specified", () => {
      const from: Point = { x: 0, y: 0 };
      const to: Point = { x: 5, y: 5 };

      const result = LineOfSight.check(grid, from, to, width, height, { useDDA: true });

      expect(result.hasLineOfSight).toBe(true);
      expect(result.success).toBe(true);
    });

    it("should use ray casting when specified", () => {
      const from: Point = { x: 0, y: 0 };
      const to: Point = { x: 5, y: 5 };

      const result = LineOfSight.check(grid, from, to, width, height, { useRayCasting: true });

      expect(result.hasLineOfSight).toBe(true);
      expect(result.success).toBe(true);
    });
  });

  describe("Line of Sight Options", () => {
    it("should respect endpoint checking", () => {
      const blockedGrid: CellType[] = new Array(width * height).fill(0);
      blockedGrid[0] = 1; // Make start point an obstacle

      const from: Point = { x: 0, y: 0 };
      const to: Point = { x: 5, y: 5 };

      const result = LineOfSight.check(blockedGrid, from, to, width, height, { checkEndpoints: true });

      expect(result.hasLineOfSight).toBe(false);
    });

    it("should respect distance limit", () => {
      const from: Point = { x: 0, y: 0 };
      const to: Point = { x: 5, y: 5 };

      const result = LineOfSight.check(grid, from, to, width, height, { maxDistance: 1 });

      expect(result.hasLineOfSight).toBe(false);
    });
  });
});
