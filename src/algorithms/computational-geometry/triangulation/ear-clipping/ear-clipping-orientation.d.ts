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
export declare function getPolygonOrientation(vertices: Point[], tolerance: number): "ccw" | "cw";
//# sourceMappingURL=ear-clipping-orientation.d.ts.map