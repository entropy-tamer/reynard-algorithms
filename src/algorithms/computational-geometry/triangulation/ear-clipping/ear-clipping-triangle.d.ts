/**
 * @file ear-clipping-triangle.ts
 * @description Triangle predicates for the Ear Clipping algorithm.
 */
import type { Point } from "../../../../core/types";
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
export declare function pointInTriangle(point: Point, a: Point, b: Point, c: Point, tolerance: number): boolean;
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
export declare function isEar(prev: Point, curr: Point, next: Point, vertices: Point[], tolerance: number): boolean;
//# sourceMappingURL=ear-clipping-triangle.d.ts.map