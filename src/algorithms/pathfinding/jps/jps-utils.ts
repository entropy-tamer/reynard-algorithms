/**
 * @module algorithms/pathfinding/jps/jps-utils
 * @description Utility functions for Jump Point Search (JPS) pathfinding algorithm.
 */

import type { Point, Vector, JumpPoint, JPSConfig, JumpPointOptions } from "./jps-types";
import { Direction, MovementType, CellType } from "./jps-types";

/**
 * Utility functions for JPS pathfinding.
 */
export class JPSUtils {
  /**
   * Direction vectors for movement.
   */
  private static readonly DIRECTION_VECTORS: Vector[] = [
    { x: 0, y: -1 }, // NORTH
    { x: 1, y: -1 }, // NORTHEAST
    { x: 1, y: 0 }, // EAST
    { x: 1, y: 1 }, // SOUTHEAST
    { x: 0, y: 1 }, // SOUTH
    { x: -1, y: 1 }, // SOUTHWEST
    { x: -1, y: 0 }, // WEST
    { x: -1, y: -1 }, // NORTHWEST
  ];

  /**
   * Cardinal directions (N, E, S, W).
   */
  private static readonly CARDINAL_DIRECTIONS = [0, 2, 4, 6];

  /**
   * Diagonal directions (NE, SE, SW, NW).
   */
  private static readonly DIAGONAL_DIRECTIONS = [1, 3, 5, 7];

  /**
   * Gets the direction vector for a given direction.
   * @param direction - The direction.
   * @returns The direction vector.
   * @example
   */
  static getDirectionVector(direction: Direction): Vector {
    return this.DIRECTION_VECTORS[direction];
  }

  /**
   * Gets the direction from a vector.
   * @param vector - The vector.
   * @returns The direction.
   * @example
   */
  static getDirectionFromVector(vector: Vector): Direction {
    const normalized = this.normalizeVector(vector);

    for (let i = 0; i < this.DIRECTION_VECTORS.length; i++) {
      const dir = this.DIRECTION_VECTORS[i];
      if (Math.abs(normalized.x - dir.x) < 1e-10 && Math.abs(normalized.y - dir.y) < 1e-10) {
        return i as Direction;
      }
    }

    return Direction.NORTH; // Default fallback
  }

  /**
   * Normalizes a vector to unit length.
   * @param vector - Vector to normalize.
   * @returns Normalized vector.
   * @example
   */
  static normalizeVector(vector: Vector): Vector {
    const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (magnitude === 0) return { x: 0, y: 0 };
    return { x: vector.x / magnitude, y: vector.y / magnitude };
  }

  /**
   * Adds two vectors.
   * @param a - First vector.
   * @param b - Second vector.
   * @returns Sum of vectors.
   * @example
   */
  static addVectors(a: Vector, b: Vector): Vector {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  /**
   * Multiplies a vector by a scalar.
   * @param vector - Vector to multiply.
   * @param scalar - Scalar multiplier.
   * @returns Scaled vector.
   * @example
   */
  static multiplyVector(vector: Vector, scalar: number): Vector {
    return { x: vector.x * scalar, y: vector.y * scalar };
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
   * @param b - Second point.
   * @returns Chebyshev distance.
   * @example
   */
  static chebyshevDistance(a: Point, b: Point): number {
    return Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
  }

  /**
   * Checks if a point is within grid bounds.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if point is within bounds.
   * @example
   */
  static isWithinBounds(point: Point, width: number, height: number): boolean {
    return point.x >= 0 && point.x < width && point.y >= 0 && point.y < height;
  }

  /**
   * Checks if a cell is walkable.
   * @param grid - The grid.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if cell is walkable.
   * @example
   */
  static isWalkable(grid: CellType[], point: Point, width: number, height: number): boolean {
    if (!this.isWithinBounds(point, width, height)) {
      return false;
    }

    const index = point.y * width + point.x;
    return grid[index] === CellType.WALKABLE || grid[index] === CellType.START || grid[index] === CellType.GOAL;
  }

  /**
   * Gets the cell type at a point.
   * @param grid - The grid.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Cell type.
   * @example
   */
  static getCellType(grid: CellType[], point: Point, width: number, height: number): CellType {
    if (!this.isWithinBounds(point, width, height)) {
      return CellType.OBSTACLE;
    }

    const index = point.y * width + point.x;
    return grid[index];
  }

  /**
   * Sets the cell type at a point.
   * @param grid - The grid.
   * @param point - Point to set.
   * @param type - Cell type.
   * @param width - Grid width.
   * @param height - Grid height.
   * @example
   */
  static setCellType(grid: CellType[], point: Point, type: CellType, width: number, height: number): void {
    if (this.isWithinBounds(point, width, height)) {
      const index = point.y * width + point.x;
      grid[index] = type;
    }
  }

  /**
   * Gets all valid directions based on movement type.
   * @param movementType - Movement type.
   * @param allowDiagonal - Whether diagonal movement is allowed.
   * @returns Array of valid directions.
   * @example
   */
  static getValidDirections(movementType: MovementType, allowDiagonal: boolean): Direction[] {
    switch (movementType) {
      case MovementType.CARDINAL:
        return this.CARDINAL_DIRECTIONS as Direction[];
      case MovementType.DIAGONAL:
        return this.DIAGONAL_DIRECTIONS as Direction[];
      case MovementType.ALL:
        return allowDiagonal
          ? Array.from({ length: 8 }, (_, i) => i as Direction)
          : (this.CARDINAL_DIRECTIONS as Direction[]);
      default:
        return this.CARDINAL_DIRECTIONS as Direction[];
    }
  }

  /**
   * Checks if a direction is cardinal.
   * @param direction - Direction to check.
   * @returns True if direction is cardinal.
   * @example
   */
  static isCardinalDirection(direction: Direction): boolean {
    return this.CARDINAL_DIRECTIONS.includes(direction);
  }

  /**
   * Checks if a direction is diagonal.
   * @param direction - Direction to check.
   * @returns True if direction is diagonal.
   * @example
   */
  static isDiagonalDirection(direction: Direction): boolean {
    return this.DIAGONAL_DIRECTIONS.includes(direction);
  }

  /**
   * Gets the cost of moving in a direction.
   * @param direction - Direction of movement.
   * @param allowDiagonal - Whether diagonal movement is allowed.
   * @returns Movement cost.
   * @example
   */
  static getMovementCost(direction: Direction, allowDiagonal: boolean): number {
    if (this.isCardinalDirection(direction)) {
      return 1;
    } else if (this.isDiagonalDirection(direction) && allowDiagonal) {
      return Math.sqrt(2); // Diagonal cost
    }
    return Infinity; // Invalid movement
  }

  /**
   * Checks if a point has forced neighbors in a given direction.
   * @param grid - The grid.
   * @param point - Current point.
   * @param direction - Direction to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if forced neighbors exist.
   * @example
   */
  static hasForcedNeighbors(
    grid: CellType[],
    point: Point,
    direction: Direction,
    width: number,
    height: number
  ): boolean {
    const dir = this.getDirectionVector(direction);

    if (this.isCardinalDirection(direction)) {
      // For cardinal directions, check perpendicular directions
      const perp1 = this.getPerpendicularDirection(direction, true);
      const perp2 = this.getPerpendicularDirection(direction, false);

      const perp1Vec = this.getDirectionVector(perp1);
      const perp2Vec = this.getDirectionVector(perp2);

      const check1 = { x: point.x + perp1Vec.x, y: point.y + perp1Vec.y };
      const check2 = { x: point.x + perp2Vec.x, y: point.y + perp2Vec.y };

      const blocked1 = !this.isWalkable(grid, check1, width, height);
      const blocked2 = !this.isWalkable(grid, check2, width, height);

      if (blocked1 || blocked2) {
        // Check if there are walkable cells beyond the blocked ones
        const beyond1 = { x: check1.x + dir.x, y: check1.y + dir.y };
        const beyond2 = { x: check2.x + dir.x, y: check2.y + dir.y };

        return (
          (blocked1 && this.isWalkable(grid, beyond1, width, height)) ||
          (blocked2 && this.isWalkable(grid, beyond2, width, height))
        );
      }
    } else if (this.isDiagonalDirection(direction)) {
      // For diagonal directions, check cardinal components
      const cardinal1 = this.getCardinalComponent(direction, true);
      const cardinal2 = this.getCardinalComponent(direction, false);

      const card1Vec = this.getDirectionVector(cardinal1);
      const card2Vec = this.getDirectionVector(cardinal2);

      const check1 = { x: point.x + card1Vec.x, y: point.y + card1Vec.y };
      const check2 = { x: point.x + card2Vec.x, y: point.y + card2Vec.y };

      const blocked1 = !this.isWalkable(grid, check1, width, height);
      const blocked2 = !this.isWalkable(grid, check2, width, height);

      return blocked1 || blocked2;
    }

    return false;
  }

  /**
   * Gets the perpendicular direction to a cardinal direction.
   * @param direction - Cardinal direction.
   * @param clockwise - Whether to get clockwise perpendicular.
   * @returns Perpendicular direction.
   * @example
   */
  static getPerpendicularDirection(direction: Direction, clockwise: boolean): Direction {
    if (!this.isCardinalDirection(direction)) {
      throw new Error("Direction must be cardinal");
    }

    const index = this.CARDINAL_DIRECTIONS.indexOf(direction);
    const perpIndex = clockwise ? (index + 1) % 4 : (index + 3) % 4;
    return this.CARDINAL_DIRECTIONS[perpIndex] as Direction;
  }

  /**
   * Gets a cardinal component of a diagonal direction.
   * @param direction - Diagonal direction.
   * @param first - Whether to get first component.
   * @returns Cardinal direction component.
   * @example
   */
  static getCardinalComponent(direction: Direction, first: boolean): Direction {
    if (!this.isDiagonalDirection(direction)) {
      throw new Error("Direction must be diagonal");
    }

    const index = this.DIAGONAL_DIRECTIONS.indexOf(direction);
    const cardinalIndex = first ? index : (index + 1) % 4;
    return this.CARDINAL_DIRECTIONS[cardinalIndex] as Direction;
  }

  /**
   * Jumps in a given direction until a jump point or obstacle is found.
   * @param grid - The grid.
   * @param start - Starting point.
   * @param direction - Direction to jump.
   * @param goal - Goal point.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param options - Jump point options.
   * @returns Jump point or null if no jump point found.
   * @example
   */
  static jump(
    grid: CellType[],
    start: Point,
    direction: Direction,
    goal: Point,
    width: number,
    height: number,
    options: JumpPointOptions = {
      checkForcedNeighbors: true,
      checkGoalProximity: true,
      useDiagonalPruning: true,
      maxJumpDistance: 10,
      useEarlyTermination: true,
    }
  ): Point | null {
    const {
      checkForcedNeighbors = true,
      checkGoalProximity = true,
      maxJumpDistance = Math.max(width, height),
      useEarlyTermination = true,
    } = options;

    const dir = this.getDirectionVector(direction);
    let current = { ...start };
    let distance = 0;

    while (distance < maxJumpDistance) {
      current = { x: current.x + dir.x, y: current.y + dir.y };
      distance++;

      // Check bounds
      if (!this.isWithinBounds(current, width, height)) {
        return null;
      }

      // Check if we hit an obstacle
      if (!this.isWalkable(grid, current, width, height)) {
        return null;
      }

      // Check if we reached the goal
      if (checkGoalProximity && current.x === goal.x && current.y === goal.y) {
        return current;
      }

      // Check for forced neighbors (jump point condition)
      if (checkForcedNeighbors && this.hasForcedNeighbors(grid, current, direction, width, height)) {
        return current;
      }

      // For diagonal directions, check if we can continue in cardinal components
      if (this.isDiagonalDirection(direction)) {
        const cardinal1 = this.getCardinalComponent(direction, true);
        const cardinal2 = this.getCardinalComponent(direction, false);

        const jump1 = this.jump(grid, current, cardinal1, goal, width, height, options);
        const jump2 = this.jump(grid, current, cardinal2, goal, width, height, options);

        if (jump1 || jump2) {
          return current;
        }
      }

      // Early termination for performance
      if (useEarlyTermination && distance > 10) {
        break;
      }
    }

    return null;
  }

  /**
   * Gets all jump points from a given point.
   * @param grid - The grid.
   * @param point - Starting point.
   * @param goal - Goal point.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param config - JPS configuration.
   * @param options - Jump point options.
   * @returns Array of jump points.
   * @example
   */
  static getJumpPoints(
    grid: CellType[],
    point: Point,
    goal: Point,
    width: number,
    height: number,
    config: JPSConfig,
    options: JumpPointOptions = {
      checkForcedNeighbors: true,
      checkGoalProximity: true,
      useDiagonalPruning: true,
      maxJumpDistance: 10,
      useEarlyTermination: true,
    }
  ): JumpPoint[] {
    const jumpPoints: JumpPoint[] = [];
    const directions = this.getValidDirections(config.movementType, config.allowDiagonal);

    for (const direction of directions) {
      const jumpPoint = this.jump(grid, point, direction, goal, width, height, options);

      if (jumpPoint) {
        const heuristic = this.manhattanDistance(jumpPoint, goal);

        jumpPoints.push({
          x: jumpPoint.x,
          y: jumpPoint.y,
          g: 0, // Will be set by the main algorithm
          h: heuristic,
          f: 0, // Will be set by the main algorithm
          direction,
        });
      }
    }

    return jumpPoints;
  }

  /**
   * Creates a key for a point (for use in maps/sets).
   * @param point - Point to create key for.
   * @returns String key.
   * @example
   */
  static pointToKey(point: Point): string {
    return `${point.x},${point.y}`;
  }

  /**
   * Parses a key back to a point.
   * @param key - String key.
   * @returns Point.
   * @example
   */
  static keyToPoint(key: string): Point {
    const [x, y] = key.split(",").map(Number);
    return { x, y };
  }

  /**
   * Checks if two points are equal.
   * @param a - First point.
   * @param b - Second point.
   * @param tolerance - Numerical tolerance.
   * @returns True if points are equal.
   * @example
   */
  static pointsEqual(a: Point, b: Point, tolerance: number = 1e-10): boolean {
    return Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance;
  }

  /**
   * Calculates the angle between two points.
   * @param from - Starting point.
   * @param to - Ending point.
   * @returns Angle in radians.
   * @example
   */
  static angleBetweenPoints(from: Point, to: Point): number {
    return Math.atan2(to.y - from.y, to.x - from.x);
  }

  /**
   * Checks if a path is valid (no obstacles).
   * @param grid - The grid.
   * @param path - Path to validate.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if path is valid.
   * @example
   */
  static isPathValid(grid: CellType[], path: Point[], width: number, height: number): boolean {
    for (const point of path) {
      if (!this.isWalkable(grid, point, width, height)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Optimizes a path by removing redundant points.
   * @param path - Path to optimize.
   * @param grid - The grid.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns Optimized path.
   * @example
   */
  static optimizePath(path: Point[], grid: CellType[], width: number, height: number): Point[] {
    if (path.length <= 2) return path;

    const optimized: Point[] = [path[0]];
    let lastValid = 0;

    for (let i = 2; i < path.length; i++) {
      if (!this.hasLineOfSight(grid, path[lastValid], path[i], width, height)) {
        optimized.push(path[i - 1]);
        lastValid = i - 1;
      }
    }

    optimized.push(path[path.length - 1]);
    return optimized;
  }

  /**
   * Checks if there's a line of sight between two points.
   * @param grid - The grid.
   * @param from - Starting point.
   * @param to - Ending point.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if line of sight exists.
   * @example
   */
  static hasLineOfSight(grid: CellType[], from: Point, to: Point, width: number, height: number): boolean {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const xStep = from.x < to.x ? 1 : -1;
    const yStep = from.y < to.y ? 1 : -1;

    let x = from.x;
    let y = from.y;
    let error = dx - dy;

    while (true) {
      if (x === to.x && y === to.y) break;

      if (!this.isWalkable(grid, { x, y }, width, height)) {
        return false;
      }

      const error2 = 2 * error;

      if (error2 > -dy) {
        error -= dy;
        x += xStep;
      }

      if (error2 < dx) {
        error += dx;
        y += yStep;
      }
    }

    return true;
  }

  /**
   * Generates a simple grid for testing.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param obstacleRatio - Ratio of obstacles (0-1).
   * @returns Generated grid.
   * @example
   */
  static generateTestGrid(width: number, height: number, obstacleRatio: number = 0.3): CellType[] {
    const grid: CellType[] = new Array(width * height).fill(CellType.WALKABLE);

    for (let i = 0; i < grid.length; i++) {
      if (Math.random() < obstacleRatio) {
        grid[i] = CellType.OBSTACLE;
      }
    }

    return grid;
  }

  /**
   * Creates a grid from a 2D array.
   * @param grid2D - 2D array representation.
   * @returns 1D grid array.
   * @example
   */
  static from2DArray(grid2D: number[][]): CellType[] {
    const height = grid2D.length;
    const width = grid2D[0]?.length || 0;
    const grid: CellType[] = new Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        grid[y * width + x] = grid2D[y][x] as CellType;
      }
    }

    return grid;
  }

  /**
   * Converts a 1D grid to a 2D array.
   * @param grid - 1D grid array.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns 2D array representation.
   * @example
   */
  static to2DArray(grid: CellType[], width: number, height: number): number[][] {
    const grid2D: number[][] = [];

    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        row.push(grid[y * width + x]);
      }
      grid2D.push(row);
    }

    return grid2D;
  }
}
