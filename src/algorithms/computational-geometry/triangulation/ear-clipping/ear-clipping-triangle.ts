/**
 * @file ear-clipping-triangle.ts
 * @description Triangle predicates for the Ear Clipping algorithm.
 */

import type { Point } from "../../../../core/types";
import { crossProduct, isCounterClockwise } from "./ear-clipping-geometry";

/**
 * Determine whether a point lies inside a triangle.
 * @param point Point to test.
 * @param a Triangle vertex A.
 * @param b Triangle vertex B.
 * @param c Triangle vertex C.
 * @param tolerance Floating-point tolerance.
 * @returns True if the point is inside or on the edges.
 * @example
 * ```ts
 * const inside = pointInTriangle(point, a, b, c, 1e-10);
 * ```
 */
export function pointInTriangle(
  point: Point,
  a: Point,
  b: Point,
  c: Point,
  tolerance: number
): boolean {
  const ab = crossProduct(a, b, point);
  const bc = crossProduct(b, c, point);
  const ca = crossProduct(c, a, point);

  const hasPositive = ab > tolerance || bc > tolerance || ca > tolerance;
  const hasNegative = ab < -tolerance || bc < -tolerance || ca < -tolerance;

  return !(hasPositive && hasNegative);
}

/**
 * Check whether three consecutive vertices form an ear.
 * @param prev Previous vertex.
 * @param curr Current vertex.
 * @param next Next vertex.
 * @param vertices Polygon vertices.
 * @param tolerance Floating-point tolerance.
 * @returns True if the triple forms an ear.
 * @example
 * ```ts
 * const ear = isEar(prev, curr, next, vertices, 1e-10);
 * ```
 */
export function isEar(
  prev: Point,
  curr: Point,
  next: Point,
  vertices: Point[],
  tolerance: number
): boolean {
  if (!isCounterClockwise(prev, curr, next, tolerance)) {
    return false;
  }

  for (const vertex of vertices) {
    if (vertex === prev || vertex === curr || vertex === next) {
      continue;
    }
    if (pointInTriangle(vertex, prev, curr, next, tolerance)) {
      return false;
    }
  }

  return true;
}

