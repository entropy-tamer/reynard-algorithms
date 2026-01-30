/**
 * @file ear-clipping-orientation.ts
 * @description Polygon orientation helpers for Ear Clipping.
 */

import type { Point } from "../../../../core/types";

/**
 * Determine whether a polygon is clockwise or counter-clockwise.
 * @param vertices Polygon vertices.
 * @param tolerance Floating-point tolerance.
 * @returns "cw" if clockwise, otherwise "ccw".
 * @example
 * ```ts
 * const orientation = getPolygonOrientation(points, 1e-10);
 * ```
 */
export function getPolygonOrientation(vertices: Point[], tolerance: number): "ccw" | "cw" {
  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    const curr = vertices[i]!;
    const next = vertices[(i + 1) % vertices.length]!;
    area += (next.x - curr.x) * (next.y + curr.y);
  }
  return area > tolerance ? "cw" : "ccw";
}
