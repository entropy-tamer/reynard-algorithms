/**
 * @file ear-clipping-validation.ts
 * @description Input validation utilities for Ear Clipping.
 */

import type { Point } from "../../../../core/types";
import { crossProduct, squaredDistance } from "./ear-clipping-geometry";

/**
 * Validate that a polygon is suitable for ear clipping.
 * @param vertices Polygon vertices.
 * @param tolerance Floating-point tolerance.
 * @example
 * ```ts
 * validatePolygon(points, 1e-10);
 * ```
 */
export function validatePolygon(vertices: Point[], tolerance: number): void {
  if (!Array.isArray(vertices)) {
    throw new Error("Vertices must be an array");
  }
  if (vertices.length < 3) {
    throw new Error("Polygon must have at least 3 vertices");
  }

  for (let i = 0; i < vertices.length; i++) {
    const curr = vertices[i]!;
    const next = vertices[(i + 1) % vertices.length]!;
    const dist = squaredDistance(curr, next);
    if (dist < tolerance * tolerance) {
      throw new Error("Polygon has duplicate consecutive vertices");
    }
  }

  for (let i = 0; i < vertices.length; i++) {
    const prev = vertices[(i - 1 + vertices.length) % vertices.length]!;
    const curr = vertices[i]!;
    const next = vertices[(i + 1) % vertices.length]!;
    const cross = Math.abs(crossProduct(prev, curr, next));
    if (cross < tolerance) {
      throw new Error("Polygon has collinear vertices");
    }
  }
}
