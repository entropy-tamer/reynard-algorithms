/**
 * Point Algorithms
 *
 * Specialized algorithms for point operations, including mathematical
 * operations, distance calculations, and geometric transformations.
 *
 * @module algorithms/point-algorithms
 */

import { memoizeGeometry } from "../../utils/memoization";
import type { Point } from "../types";

export type { Point };

/**
 * Point operations
 */
export class PointOps {
  // Memoized mathematical operations for performance
  private static readonly memoizedDistance = memoizeGeometry((x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  );

  /**
   * Creates a Point from x/y components.
   */
  static create(x: number, y: number): Point {
    return { x, y };
  }

  /**
   * Component-wise vector addition `a + b`. Returns a new point; inputs unmodified.
   */
  static add(a: Point, b: Point): Point {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  /**
   * Component-wise vector subtraction `a - b` (the vector from b to a when
   * interpreted positionally). Returns a new point.
   */
  static subtract(a: Point, b: Point): Point {
    return { x: a.x - b.x, y: a.y - b.y };
  }

  /**
   * Uniform scalar multiplication. Returns a new point.
   */
  static multiply(a: Point, scalar: number): Point {
    return { x: a.x * scalar, y: a.y * scalar };
  }

  /**
   * Uniform scalar division. Throws on zero divisor.
   */
  static divide(a: Point, scalar: number): Point {
    if (scalar === 0) {
      throw new Error("Division by zero");
    }
    return { x: a.x / scalar, y: a.y / scalar };
  }

  /**
   * Euclidean distance between two points. Memoized internally — repeated
   * identical coordinate queries skip the sqrt.
   */
  static distance(a: Point, b: Point): number {
    return PointOps.memoizedDistance(a.x, a.y, b.x, b.y);
  }

  /**
   * Squared Euclidean distance — avoids the sqrt for cheap comparisons
   * (e.g. radius checks: compare against `r*r` instead of `r`).
   */
  static distanceSquared(a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return dx * dx + dy * dy;
  }

  /**
   * Midpoint of the segment from a to b.
   */
  static midpoint(a: Point, b: Point): Point {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  /**
   * Linear interpolation: `t = 0` yields a, `t = 1` yields b; values outside
   * [0,1] extrapolate beyond the segment.
   */
  static lerp(a: Point, b: Point, t: number): Point {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }

  /**
   * Exact-equality test within a fixed epsilon of 1e-10 per component.
   */
  static equals(a: Point, b: Point): boolean {
    return Math.abs(a.x - b.x) < 1e-10 && Math.abs(a.y - b.y) < 1e-10;
  }

  /**
   * Shallow copy of the point (new object, same coordinates).
   */
  static clone(point: Point): Point {
    return { x: point.x, y: point.y };
  }
}
