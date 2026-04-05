/**
 * @file ear-clipping-validation.ts
 * @description Input validation utilities for Ear Clipping.
 */
import type { Point } from "../../../../core/types";
/**
 * Validate that a polygon is suitable for ear clipping.
 * @param vertices Polygon vertices.
 * @param tolerance Floating-point tolerance.
 * @example
 * ```ts
 * validatePolygon(points, 1e-10);
 * ```
 */
export declare function validatePolygon(vertices: Point[], tolerance: number): void;
//# sourceMappingURL=ear-clipping-validation.d.ts.map