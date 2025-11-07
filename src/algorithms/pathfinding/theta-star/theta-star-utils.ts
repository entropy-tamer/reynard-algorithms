/**
 * @module algorithms/pathfinding/theta-star/theta-star-utils
 * @description Utility functions for Theta* pathfinding algorithm.
 */

import type {
  Point,
  Vector,
  GridCell,
  ThetaStarConfig,
  ThetaStarOptions,
  LineOfSightOptions,
  GridValidationOptions,
  PathOptimizationOptions,
} from "./theta-star-types";
import { Direction, MovementType, CellType } from "./theta-star-types";

/**
 * Utility functions for Theta* pathfinding.
 */
export class ThetaStarUtils {
  /**
   * Generates a test grid with random obstacles.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param obstacleRatio - Ratio of obstacles (0-1).
   * @param seed - Random seed for reproducible results.
   * @returns Generated grid.
   * @example
   */
  static generateTestGrid(width: number, height: number, obstacleRatio: number = 0.3, seed?: number): CellType[] {
    const grid: CellType[] = new Array(width * height).fill(CellType.WALKABLE);

    if (seed !== undefined) {
      this.seedRandom(seed);
    }

    for (let i = 0; i < grid.length; i++) {
      if (Math.random() < obstacleRatio) {
        grid[i] = CellType.OBSTACLE;
      }
    }

    return grid;
  }

  /**
   * Generates a maze-like grid using recursive backtracking.
   * @param width - Grid width (must be odd).
   * @param height - Grid height (must be odd).
   * @param seed - Random seed for reproducible results.
   * @returns Generated maze grid.
   * @example
   */
  static generateMazeGrid(width: number, height: number, seed?: number): CellType[] {
    if (width % 2 === 0 || height % 2 === 0) {
      throw new Error("Width and height must be odd for maze generation");
    }

    const grid: CellType[] = new Array(width * height).fill(CellType.OBSTACLE);

    if (seed !== undefined) {
      this.seedRandom(seed);
    }

    // Start from (1, 1)
    const stack: Point[] = [{ x: 1, y: 1 }];
    grid[1 * width + 1] = CellType.WALKABLE;

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(current, grid, width, height);

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        const wall = this.getWallBetween(current, next);

        grid[next.y * width + next.x] = CellType.WALKABLE;
        grid[wall.y * width + wall.x] = CellType.WALKABLE;

        stack.push(next);
      } else {
        stack.pop();
      }
    }

    return grid;
  }

  /**
   * Generates a grid with rooms and corridors.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param roomCount - Number of rooms to generate.
   * @param minRoomSize - Minimum room size.
   * @param maxRoomSize - Maximum room size.
   * @param seed - Random seed for reproducible results.
   * @returns Generated room grid.
   * @example
   */
  static generateRoomGrid(
    width: number,
    height: number,
    roomCount: number = 5,
    minRoomSize: number = 3,
    maxRoomSize: number = 8,
    seed?: number
  ): CellType[] {
    const grid: CellType[] = new Array(width * height).fill(CellType.OBSTACLE);

    if (seed !== undefined) {
      this.seedRandom(seed);
    }

    const rooms: Array<{ x: number; y: number; width: number; height: number }> = [];

    // Generate rooms
    for (let i = 0; i < roomCount; i++) {
      const roomWidth = minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1));
      const roomHeight = minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1));
      const x = 1 + Math.floor(Math.random() * (width - roomWidth - 2));
      const y = 1 + Math.floor(Math.random() * (height - roomHeight - 2));

      // Check for overlap
      let overlaps = false;
      for (const room of rooms) {
        if (x < room.x + room.width && x + roomWidth > room.x && y < room.y + room.height && y + roomHeight > room.y) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        // Create room
        for (let ry = y; ry < y + roomHeight; ry++) {
          for (let rx = x; rx < x + roomWidth; rx++) {
            grid[ry * width + rx] = CellType.WALKABLE;
          }
        }
        rooms.push({ x, y, width: roomWidth, height: roomHeight });
      }
    }

    // Connect rooms with corridors
    for (let i = 1; i < rooms.length; i++) {
      const room1 = rooms[i - 1];
      const room2 = rooms[i];

      const center1 = {
        x: room1.x + Math.floor(room1.width / 2),
        y: room1.y + Math.floor(room1.height / 2),
      };
      const center2 = {
        x: room2.x + Math.floor(room2.width / 2),
        y: room2.y + Math.floor(room2.height / 2),
      };

      // Create L-shaped corridor
      this.createCorridor(grid, width, height, center1, center2);
    }

    return grid;
  }

  /**
   * Creates a corridor between two points.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param from - Starting point.
   * @param to - Ending point.
   * @example
   */
  private static createCorridor(grid: CellType[], width: number, height: number, from: Point, to: Point): void {
    // Horizontal corridor
    const startX = Math.min(from.x, to.x);
    const endX = Math.max(from.x, to.x);
    for (let x = startX; x <= endX; x++) {
      if (x >= 0 && x < width && from.y >= 0 && from.y < height) {
        grid[from.y * width + x] = CellType.WALKABLE;
      }
    }

    // Vertical corridor
    const startY = Math.min(from.y, to.y);
    const endY = Math.max(from.y, to.y);
    for (let y = startY; y <= endY; y++) {
      if (to.x >= 0 && to.x < width && y >= 0 && y < height) {
        grid[y * width + to.x] = CellType.WALKABLE;
      }
    }
  }

  /**
   * Gets unvisited neighbors for maze generation.
   * @param point - Current point.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Array of unvisited neighbors.
   * @example
   */
  private static getUnvisitedNeighbors(point: Point, grid: CellType[], width: number, height: number): Point[] {
    const neighbors: Point[] = [];
    const directions = [
      { x: 0, y: -2 }, // North
      { x: 2, y: 0 }, // East
      { x: 0, y: 2 }, // South
      { x: -2, y: 0 }, // West
    ];

    for (const dir of directions) {
      const neighbor = { x: point.x + dir.x, y: point.y + dir.y };
      if (
        neighbor.x >= 0 &&
        neighbor.x < width &&
        neighbor.y >= 0 &&
        neighbor.y < height &&
        grid[neighbor.y * width + neighbor.x] === CellType.OBSTACLE
      ) {
        neighbors.push(neighbor);
      }
    }

    return neighbors;
  }

  /**
   * Gets the wall between two points for maze generation.
   * @param from - First point.
   * @param to - Second point.
   * @returns Wall point.
   * @example
   */
  private static getWallBetween(from: Point, to: Point): Point {
    return {
      x: from.x + (to.x - from.x) / 2,
      y: from.y + (to.y - from.y) / 2,
    };
  }

  /**
   * Calculates the distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Distance.
   * @example
   */
  static distance(a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculates the Manhattan distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Manhattan distance.
   * @example
   */
  static manhattanDistance(a: Point, b: Point): number {
    return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
  }

  /**
   * Calculates the Chebyshev distance between two points.
   * @param a - First point.
   @param b - Second point.
   * @returns Chebyshev distance.
   * @example
   */
  static chebyshevDistance(a: Point, b: Point): number {
    return Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
  }

  /**
   * Gets the direction vector between two points.
   * @param from - Starting point.
   * @param to - Ending point.
   * @returns Direction vector.
   * @example
   */
  static getDirectionVector(from: Point, to: Point): Vector {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) {
      return { x: 0, y: 0 };
    }

    return { x: dx / length, y: dy / length };
  }

  /**
   * Gets the direction enum from a direction vector.
   * @param vector - Direction vector.
   * @returns Direction enum.
   * @example
   */
  static getDirectionFromVector(vector: Vector): Direction {
    const angle = Math.atan2(vector.y, vector.x);
    const normalizedAngle = (angle + Math.PI * 2) % (Math.PI * 2);

    const directions = [
      Direction.EAST, // 0
      Direction.NORTHEAST, // π/4
      Direction.NORTH, // π/2
      Direction.NORTHWEST, // 3π/4
      Direction.WEST, // π
      Direction.SOUTHWEST, // 5π/4
      Direction.SOUTH, // 3π/2
      Direction.SOUTHEAST, // 7π/4
    ];

    const index = Math.round(normalizedAngle / (Math.PI / 4)) % 8;
    return directions[index];
  }

  /**
   * Normalizes a direction vector.
   * @param vector - Vector to normalize.
   * @returns Normalized vector.
   * @example
   */
  static normalizeVector(vector: Vector): Vector {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

    if (length === 0) {
      return { x: 0, y: 0 };
    }

    return { x: vector.x / length, y: vector.y / length };
  }

  /**
   * Calculates the dot product of two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Dot product.
   * @example
   */
  static dotProduct(a: Vector, b: Vector): number {
    return a.x * b.x + a.y * b.y;
  }

  /**
   * Calculates the cross product of two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Cross product (scalar in 2D).
   * @example
   */
  static crossProduct(a: Vector, b: Vector): number {
    return a.x * b.y - a.y * b.x;
  }

  /**
   * Calculates the angle between two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Angle in radians.
   * @example
   */
  static angleBetweenVectors(a: Vector, b: Vector): number {
    const dot = this.dotProduct(a, b);
    const magA = Math.sqrt(a.x * a.x + a.y * a.y);
    const magB = Math.sqrt(b.x * b.x + b.y * b.y);

    if (magA === 0 || magB === 0) {
      return 0;
    }

    return Math.acos(Math.max(-1, Math.min(1, dot / (magA * magB))));
  }

  /**
   * Rotates a vector by an angle.
   * @param vector - Vector to rotate.
   * @param angle - Angle in radians.
   * @returns Rotated vector.
   * @example
   */
  static rotateVector(vector: Vector, angle: number): Vector {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    return {
      x: vector.x * cos - vector.y * sin,
      y: vector.x * sin + vector.y * cos,
    };
  }

  /**
   * Interpolates between two points.
   * @param a - First point.
   * @param b - Second point.
   * @param t - Interpolation factor (0-1).
   * @returns Interpolated point.
   * @example
   */
  static interpolatePoints(a: Point, b: Point, t: number): Point {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    };
  }

  /**
   * Calculates the centroid of a set of points.
   * @param points - Array of points.
   * @returns Centroid point.
   * @example
   */
  static calculateCentroid(points: Point[]): Point {
    if (points.length === 0) {
      return { x: 0, y: 0 };
    }

    const sum = points.reduce((acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }), { x: 0, y: 0 });

    return {
      x: sum.x / points.length,
      y: sum.y / points.length,
    };
  }

  /**
   * Calculates the bounding box of a set of points.
   * @param points - Array of points.
   * @returns Bounding box.
   * @example
   */
  static calculateBoundingBox(points: Point[]): { min: Point; max: Point } {
    if (points.length === 0) {
      return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    }

    let minX = points[0].x;
    let minY = points[0].y;
    let maxX = points[0].x;
    let maxY = points[0].y;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    return {
      min: { x: minX, y: minY },
      max: { x: maxX, y: maxY },
    };
  }

  /**
   * Checks if a point is inside a polygon.
   * @param point - Point to check.
   * @param polygon - Polygon vertices.
   * @returns True if point is inside polygon.
   * @example
   */
  static isPointInPolygon(point: Point, polygon: Point[]): boolean {
    if (polygon.length < 3) return false;

    let inside = false;
    let j = polygon.length - 1;

    for (let i = 0; i < polygon.length; i++) {
      const pi = polygon[i];
      const pj = polygon[j];

      if (pi.y > point.y !== pj.y > point.y && point.x < ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y) + pi.x) {
        inside = !inside;
      }
      j = i;
    }

    return inside;
  }

  /**
   * Calculates the area of a polygon.
   * @param polygon - Polygon vertices.
   * @returns Polygon area.
   * @example
   */
  static calculatePolygonArea(polygon: Point[]): number {
    if (polygon.length < 3) return 0;

    let area = 0;
    let j = polygon.length - 1;

    for (let i = 0; i < polygon.length; i++) {
      area += (polygon[j].x + polygon[i].x) * (polygon[j].y - polygon[i].y);
      j = i;
    }

    return Math.abs(area) / 2;
  }

  /**
   * Calculates the perimeter of a polygon.
   * @param polygon - Polygon vertices.
   * @returns Polygon perimeter.
   * @example
   */
  static calculatePolygonPerimeter(polygon: Point[]): number {
    if (polygon.length < 2) return 0;

    let perimeter = 0;
    let j = polygon.length - 1;

    for (let i = 0; i < polygon.length; i++) {
      perimeter += this.distance(polygon[j], polygon[i]);
      j = i;
    }

    return perimeter;
  }

  /**
   * Generates a random point within bounds.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param seed - Random seed.
   * @returns Random point.
   * @example
   */
  static generateRandomPoint(width: number, height: number, seed?: number): Point {
    if (seed !== undefined) {
      this.seedRandom(seed);
    }

    return {
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height),
    };
  }

  /**
   * Generates multiple random points within bounds.
   * @param count - Number of points to generate.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param seed - Random seed.
   * @returns Array of random points.
   * @example
   */
  static generateRandomPoints(count: number, width: number, height: number, seed?: number): Point[] {
    if (seed !== undefined) {
      this.seedRandom(seed);
    }

    const points: Point[] = [];
    for (let i = 0; i < count; i++) {
      points.push(this.generateRandomPoint(width, height));
    }

    return points;
  }

  /**
   * Finds the closest point to a target from a set of points.
   * @param target - Target point.
   * @param points - Array of points to search.
   * @returns Closest point.
   * @example
   */
  static findClosestPoint(target: Point, points: Point[]): Point | null {
    if (points.length === 0) return null;

    let closest = points[0];
    let minDistance = this.distance(target, closest);

    for (let i = 1; i < points.length; i++) {
      const distance = this.distance(target, points[i]);
      if (distance < minDistance) {
        minDistance = distance;
        closest = points[i];
      }
    }

    return closest;
  }

  /**
   * Finds all points within a radius of a target.
   * @param target - Target point.
   * @param points - Array of points to search.
   * @param radius - Search radius.
   * @returns Array of points within radius.
   * @example
   */
  static findPointsInRadius(target: Point, points: Point[], radius: number): Point[] {
    return points.filter(point => this.distance(target, point) <= radius);
  }

  /**
   * Sorts points by distance from a target.
   * @param target - Target point.
   * @param points - Array of points to sort.
   * @returns Sorted array of points.
   * @example
   */
  static sortPointsByDistance(target: Point, points: Point[]): Point[] {
    return [...points].sort((a, b) => {
      const distA = this.distance(target, a);
      const distB = this.distance(target, b);
      return distA - distB;
    });
  }

  /**
   * Creates a default configuration for Theta*.
   * @returns Default configuration.
   * @example
   */
  static createDefaultConfig(): ThetaStarConfig {
    return {
      allowDiagonal: true,
      diagonalOnlyWhenClear: true,
      movementType: MovementType.ALL,
      useTieBreaking: true,
      useLazyEvaluation: true,
      useGoalBounding: false,
      validateInput: true,
      enableCaching: true,
      maxIterations: 10000,
      tolerance: 1e-10,
    };
  }

  /**
   * Creates a default options object for pathfinding.
   * @returns Default options.
   * @example
   */
  static createDefaultOptions(): ThetaStarOptions {
    return {
      returnExplored: false,
      returnLineOfSight: false,
      useManhattanHeuristic: true,
      useEuclideanHeuristic: false,
      optimizePath: true,
      useGoalBounding: false,
      maxPathLength: 10000,
    };
  }

  /**
   * Creates a default line-of-sight options object.
   * @returns Default line-of-sight options.
   * @example
   */
  static createDefaultLineOfSightOptions(): LineOfSightOptions {
    return {
      useBresenham: true,
      useDDA: false,
      useRayCasting: false,
      checkEndpoints: true,
      useEarlyTermination: true,
      maxDistance: 1000,
    };
  }

  /**
   * Creates a default grid validation options object.
   * @returns Default grid validation options.
   * @example
   */
  static createDefaultGridValidationOptions(): GridValidationOptions {
    return {
      checkBounds: true,
      checkObstacles: true,
      checkStartGoal: true,
      checkConnectivity: true,
      minGridSize: 1,
      maxGridSize: 10000,
    };
  }

  /**
   * Creates a default path optimization options object.
   * @returns Default path optimization options.
   * @example
   */
  static createDefaultPathOptimizationOptions(): PathOptimizationOptions {
    return {
      removeRedundant: true,
      smoothPath: false,
      useLineOfSight: true,
      smoothingFactor: 0.5,
      maxSmoothingIterations: 10,
    };
  }

  /**
   * Seeds the random number generator for reproducible results.
   * @param seed - Random seed.
   * @example
   */
  private static seedRandom(seed: number): void {
    // Simple linear congruential generator for seeding
    let currentSeed = seed;
    Math.random = () => {
      currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
      return currentSeed / 4294967296;
    };
  }

  /**
   * Converts a grid to a visual string representation.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param start - Optional start point.
   * @param goal - Optional goal point.
   * @returns Visual string representation.
   * @example
   */
  static gridToString(grid: CellType[], width: number, height: number, start?: Point, goal?: Point): string {
    let result = "";

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        if (index >= grid.length) {
          result += "?";
          continue;
        }

        const point = { x, y };

        if (start && this.pointsEqual(point, start, 1e-10)) {
          result += "S";
        } else if (goal && this.pointsEqual(point, goal, 1e-10)) {
          result += "G";
        } else {
          switch (grid[index]) {
            case CellType.WALKABLE:
              result += ".";
              break;
            case CellType.OBSTACLE:
              result += "#";
              break;
            case CellType.START:
              result += "S";
              break;
            case CellType.GOAL:
              result += "G";
              break;
            default:
              result += "?";
          }
        }
      }
      result += "\n";
    }

    return result;
  }

  /**
   * Converts a path to a visual string representation on a grid.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param path - Path to visualize.
   * @returns Visual string representation.
   * @example
   */
  static pathToString(grid: CellType[], width: number, height: number, path: Point[]): string {
    const pathSet = new Set(path.map(p => `${p.x},${p.y}`));
    let result = "";

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const point = { x, y };

        if (pathSet.has(`${x},${y}`)) {
          result += "*";
        } else {
          switch (grid[index]) {
            case CellType.WALKABLE:
              result += ".";
              break;
            case CellType.OBSTACLE:
              result += "#";
              break;
            case CellType.START:
              result += "S";
              break;
            case CellType.GOAL:
              result += "G";
              break;
            default:
              result += "?";
          }
        }
      }
      result += "\n";
    }

    return result;
  }

  /**
   * Checks if two points are equal.
   * @param a - First point.
   * @param b - Second point.
   * @param tolerance - Numerical tolerance.
   * @returns True if points are equal.
   * @example
   */
  private static pointsEqual(a: Point, b: Point, tolerance: number = 1e-10): boolean {
    return Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance;
  }
}
