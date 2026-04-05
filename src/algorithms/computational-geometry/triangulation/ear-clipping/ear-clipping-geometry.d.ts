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
export declare function crossProduct(p1: Point, p2: Point, p3: Point): number;
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
export declare function isCounterClockwise(p1: Point, p2: Point, p3: Point, tolerance: number): boolean;
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
export declare function squaredDistance(p1: Point, p2: Point): number;
//# sourceMappingURL=ear-clipping-geometry.d.ts.map