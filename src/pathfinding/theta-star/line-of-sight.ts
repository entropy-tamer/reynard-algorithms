/**
 * @module algorithms/pathfinding/theta-star/line-of-sight
 * @description Line-of-sight checking algorithms for Theta* pathfinding.
 */

import type { Point, LineOfSightOptions, LineOfSightResult } from "./theta-star-types";
import { adaptiveMemo } from "../../utils";
import { CellType } from "./theta-star-types";

/**
 * Line-of-sight checking algorithms for Theta* pathfinding.
 */
export class LineOfSight {
  /**
   * Checks if there's a line of sight between two points using Bresenham's line algorithm.
   * @param grid - The grid as a 1D array.
   * @param from - Starting point.
   * @param to - Ending point.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param options - Line-of-sight options.
   * @returns Line-of-sight result.
   * @example
   */
  static checkBresenham(
    grid: CellType[],
    from: Point,
    to: Point,
    width: number,
    height: number,
    options: LineOfSightOptions = {
      useBresenham: true,
      useDDA: false,
      useRayCasting: false,
      checkEndpoints: true,
      useEarlyTermination: true,
      maxDistance: Math.max(width, height),
    }
  ): LineOfSightResult {
    const { checkEndpoints = true, useEarlyTermination = true, maxDistance = Math.max(width, height) } = options;

    try {
      // Check if endpoints are walkable
      if (checkEndpoints) {
        if (!this.isWalkable(grid, from, width, height) || !this.isWalkable(grid, to, width, height)) {
          return {
            hasLineOfSight: false,
            distanceToObstacle: 0,
            success: true,
          };
        }
      }

      // Check distance limit
      const distance = this.distance(from, to);
      if (distance > maxDistance) {
        return {
          hasLineOfSight: false,
          distanceToObstacle: distance,
          success: true,
        };
      }

      // Use Bresenham's line algorithm
      const points = this.bresenhamLine(from, to);

      for (let i = 0; i < points.length; i++) {
        const point = points[i];

        // Skip endpoints if not checking them
        if (!checkEndpoints && (this.pointsEqual(point, from) || this.pointsEqual(point, to))) {
          continue;
        }

        if (!this.isWalkable(grid, point, width, height)) {
          return {
            hasLineOfSight: false,
            distanceToObstacle: this.distance(from, point),
            blockedAt: point,
            success: true,
          };
        }

        // Early termination for performance
        if (useEarlyTermination && i > 10) {
          break;
        }
      }

      return {
        hasLineOfSight: true,
        distanceToObstacle: distance,
        success: true,
      };
    } catch (error) {
      return {
        hasLineOfSight: false,
        distanceToObstacle: 0,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Checks if there's a line of sight between two points using DDA (Digital Differential Analyzer).
   * @param grid - The grid as a 1D array.
   * @param from - Starting point.
   * @param to - Ending point.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param options - Line-of-sight options.
   * @returns Line-of-sight result.
   * @example
   */
  static checkDDA(
    grid: CellType[],
    from: Point,
    to: Point,
    width: number,
    height: number,
    options: LineOfSightOptions = {
      useBresenham: true,
      useDDA: false,
      useRayCasting: false,
      checkEndpoints: true,
      useEarlyTermination: true,
      maxDistance: Math.max(width, height),
    }
  ): LineOfSightResult {
    const { checkEndpoints = true, useEarlyTermination = true, maxDistance = Math.max(width, height) } = options;

    try {
      // Check if endpoints are walkable
      if (checkEndpoints) {
        if (!this.isWalkable(grid, from, width, height) || !this.isWalkable(grid, to, width, height)) {
          return {
            hasLineOfSight: false,
            distanceToObstacle: 0,
            success: true,
          };
        }
      }

      // Check distance limit
      const distance = this.distance(from, to);
      if (distance > maxDistance) {
        return {
          hasLineOfSight: false,
          distanceToObstacle: distance,
          success: true,
        };
      }

      // Use DDA algorithm
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const steps = Math.max(Math.abs(dx), Math.abs(dy));

      if (steps === 0) {
        return {
          hasLineOfSight: true,
          distanceToObstacle: 0,
          success: true,
        };
      }

      const xIncrement = dx / steps;
      const yIncrement = dy / steps;

      let x = from.x;
      let y = from.y;
      let currentDistance = 0;

      for (let i = 0; i <= steps; i++) {
        const point = { x: Math.round(x), y: Math.round(y) };

        // Skip endpoints if not checking them
        if (!checkEndpoints && (this.pointsEqual(point, from) || this.pointsEqual(point, to))) {
          x += xIncrement;
          y += yIncrement;
          currentDistance += Math.sqrt(xIncrement * xIncrement + yIncrement * yIncrement);
          continue;
        }

        if (!this.isWalkable(grid, point, width, height)) {
          return {
            hasLineOfSight: false,
            distanceToObstacle: currentDistance,
            blockedAt: point,
            success: true,
          };
        }

        x += xIncrement;
        y += yIncrement;
        currentDistance += Math.sqrt(xIncrement * xIncrement + yIncrement * yIncrement);

        // Early termination for performance
        if (useEarlyTermination && i > 10) {
          break;
        }
      }

      return {
        hasLineOfSight: true,
        distanceToObstacle: distance,
        success: true,
      };
    } catch (error) {
      return {
        hasLineOfSight: false,
        distanceToObstacle: 0,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Checks if there's a line of sight between two points using ray casting.
   * @param grid - The grid as a 1D array.
   * @param from - Starting point.
   * @param to - Ending point.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param options - Line-of-sight options.
   * @returns Line-of-sight result.
   * @example
   */
  static checkRayCasting(
    grid: CellType[],
    from: Point,
    to: Point,
    width: number,
    height: number,
    options: LineOfSightOptions = {
      useBresenham: true,
      useDDA: false,
      useRayCasting: false,
      checkEndpoints: true,
      useEarlyTermination: true,
      maxDistance: Math.max(width, height),
    }
  ): LineOfSightResult {
    const { checkEndpoints = true, useEarlyTermination = true, maxDistance = Math.max(width, height) } = options;

    try {
      // Check if endpoints are walkable
      if (checkEndpoints) {
        if (!this.isWalkable(grid, from, width, height) || !this.isWalkable(grid, to, width, height)) {
          return {
            hasLineOfSight: false,
            distanceToObstacle: 0,
            success: true,
          };
        }
      }

      // Check distance limit
      const distance = this.distance(from, to);
      if (distance > maxDistance) {
        return {
          hasLineOfSight: false,
          distanceToObstacle: distance,
          success: true,
        };
      }

      // Use ray casting algorithm
      const ray = this.castRay(from, to, distance);

      for (let i = 0; i < ray.length; i++) {
        const point = ray[i];

        // Skip endpoints if not checking them
        if (!checkEndpoints && (this.pointsEqual(point, from) || this.pointsEqual(point, to))) {
          continue;
        }

        if (!this.isWalkable(grid, point, width, height)) {
          return {
            hasLineOfSight: false,
            distanceToObstacle: this.distance(from, point),
            blockedAt: point,
            success: true,
          };
        }

        // Early termination for performance
        if (useEarlyTermination && i > 10) {
          break;
        }
      }

      return {
        hasLineOfSight: true,
        distanceToObstacle: distance,
        success: true,
      };
    } catch (error) {
      return {
        hasLineOfSight: false,
        distanceToObstacle: 0,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Checks if there's a line of sight between two points using the best available method.
   * @param grid - The grid as a 1D array.
   * @param from - Starting point.
   * @param to - Ending point.
   * @param width - Grid width.
   * @param height - Grid height.
   * @param options - Line-of-sight options.
   * @returns Line-of-sight result.
   * @example
   */
  static check(
    grid: CellType[],
    from: Point,
    to: Point,
    width: number,
    height: number,
    options: LineOfSightOptions = {
      useBresenham: true,
      useDDA: false,
      useRayCasting: false,
      checkEndpoints: true,
      useEarlyTermination: true,
      maxDistance: Math.max(width, height),
    }
  ): LineOfSightResult {
    const { useBresenham = true, useDDA = false, useRayCasting = false } = options;

    if (useBresenham) {
      return this.checkBresenham(grid, from, to, width, height, options);
    } else if (useDDA) {
      return this.checkDDA(grid, from, to, width, height, options);
    } else if (useRayCasting) {
      return this.checkRayCasting(grid, from, to, width, height, options);
    } else {
      // Default to Bresenham
      return this.checkBresenham(grid, from, to, width, height, options);
    }
  }

  /**
   * Generates points along a line using Bresenham's algorithm.
   * @param from - Starting point.
   * @param to - Ending point.
   * @returns Array of points along the line.
   * @example
   */
  private static bresenhamLine(from: Point, to: Point): Point[] {
    const points: Point[] = [];
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const sx = from.x < to.x ? 1 : -1;
    const sy = from.y < to.y ? 1 : -1;
    let error = dx - dy;

    let x = from.x;
    let y = from.y;

    while (true) {
      points.push({ x, y });

      if (x === to.x && y === to.y) break;

      const error2 = 2 * error;

      if (error2 > -dy) {
        error -= dy;
        x += sx;
      }

      if (error2 < dx) {
        error += dx;
        y += sy;
      }
    }

    return points;
  }

  /**
   * Casts a ray from one point to another.
   * @param from - Starting point.
   * @param to - Ending point.
   * @param maxDistance - Maximum distance to cast.
   * @param _maxDistance
   * @returns Array of points along the ray.
   * @example
   */
  private static castRay(from: Point, to: Point, _maxDistance: number): Point[] {
    const points: Point[] = [];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) {
      return [from];
    }

    const steps = Math.ceil(distance);
    const xStep = dx / steps;
    const yStep = dy / steps;

    for (let i = 0; i <= steps; i++) {
      const x = Math.round(from.x + i * xStep);
      const y = Math.round(from.y + i * yStep);
      points.push({ x, y });
    }

    return points;
  }

  /**
   * Calculates the distance between two points.
   * @param a - First point.
   * @param b - Second point.
   * @returns Distance.
   * @example
   */
  private static distance(a: Point, b: Point): number {
    if (!this._memoDistance) {
      this._memoDistance = adaptiveMemo(
        (p1: Point, p2: Point) => {
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          return Math.sqrt(dx * dx + dy * dy);
        },
        { maxSize: 8192, minHitRate: 0.6, windowSize: 500, minSamples: 200 },
        (p1: Point, p2: Point) => `${p1.x}|${p1.y}|${p2.x}|${p2.y}`
      );
    }
    return this._memoDistance(a, b);
  }

  private static _memoDistance?: (a: Point, b: Point) => number;

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

  /**
   * Checks if a point is within grid bounds.
   * @param point - Point to check.
   * @param width - Grid width.
   * @param height - Grid height.
   * @returns True if point is within bounds.
   * @example
   */
  private static isWithinBounds(point: Point, width: number, height: number): boolean {
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
  private static isWalkable(grid: CellType[], point: Point, width: number, height: number): boolean {
    if (!this.isWithinBounds(point, width, height)) {
      return false;
    }

    const index = point.y * width + point.x;
    return grid[index] === CellType.WALKABLE || grid[index] === CellType.START || grid[index] === CellType.GOAL;
  }
}
