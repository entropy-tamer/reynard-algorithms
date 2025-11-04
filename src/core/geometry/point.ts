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
   *
   * @param x
   * @param y
   * @example
   */
  static create(x: number, y: number): Point {
    return { x, y };
  }

  /**
   *
   * @param a
   * @param b
   * @example
   */
  static add(a: Point, b: Point): Point {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  /**
   *
   * @param a
   * @param b
   * @example
   */
  static subtract(a: Point, b: Point): Point {
    return { x: a.x - b.x, y: a.y - b.y };
  }

  /**
   *
   * @param a
   * @param scalar
   * @example
   */
  static multiply(a: Point, scalar: number): Point {
    return { x: a.x * scalar, y: a.y * scalar };
  }

  /**
   *
   * @param a
   * @param scalar
   * @example
   */
  static divide(a: Point, scalar: number): Point {
    if (scalar === 0) {
      throw new Error("Division by zero");
    }
    return { x: a.x / scalar, y: a.y / scalar };
  }

  /**
   *
   * @param a
   * @param b
   * @example
   */
  static distance(a: Point, b: Point): number {
    return PointOps.memoizedDistance(a.x, a.y, b.x, b.y);
  }

  /**
   *
   * @param a
   * @param b
   * @example
   */
  static distanceSquared(a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return dx * dx + dy * dy;
  }

  /**
   *
   * @param a
   * @param b
   * @example
   */
  static midpoint(a: Point, b: Point): Point {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  /**
   *
   * @param a
   * @param b
   * @param t
   * @example
   */
  static lerp(a: Point, b: Point, t: number): Point {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }

  /**
   *
   * @param a
   * @param b
   * @example
   */
  static equals(a: Point, b: Point): boolean {
    return Math.abs(a.x - b.x) < 1e-10 && Math.abs(a.y - b.y) < 1e-10;
  }

  /**
   *
   * @param point
   * @example
   */
  static clone(point: Point): Point {
    return { x: point.x, y: point.y };
  }
}
