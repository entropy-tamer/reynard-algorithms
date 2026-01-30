/**
 * @file ear-clipping-geometry.ts
 * @description Geometric helpers for the Ear Clipping triangulation algorithm.
 */

import type { Point } from "../../../../core/types";

/**
 * Calculate the z-component of the cross product for three points.
 * @param p1 First point.
 * @param p2 Second point.
 * @param p3 Third point.
 * @returns Signed area that indicates orientation.
 * @example
 * ```ts
 * const value = crossProduct(p1, p2, p3);
 * ```
 */
export function crossProduct(p1: Point, p2: Point, p3: Point): number {
  return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
}

/**
 * Determine whether three points form a counter-clockwise turn.
 * @param p1 First point.
 * @param p2 Second point.
 * @param p3 Third point.
 * @param tolerance Floating-point tolerance.
 * @returns True if the turn is counter-clockwise.
 * @example
 * ```ts
 * const ccw = isCounterClockwise(a, b, c, 1e-10);
 * ```
 */
export function isCounterClockwise(
  p1: Point,
  p2: Point,
  p3: Point,
  tolerance: number
): boolean {
  return crossProduct(p1, p2, p3) > tolerance;
}

/**
 * Compute the squared distance between two points.
 * @param p1 First point.
 * @param p2 Second point.
 * @returns Squared Euclidean distance.
 * @example
 * ```ts
 * const dist2 = squaredDistance(a, b);
 * ```
 */
export function squaredDistance(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return dx * dx + dy * dy;
}
