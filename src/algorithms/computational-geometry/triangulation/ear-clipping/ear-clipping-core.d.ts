/**
 * @file ear-clipping-core.ts
 * @module algorithms/computational-geometry/triangulation/ear-clipping-core
 * @description Ear Clipping triangulation algorithm implementation.
 *
 * Mathematical Theory:
 * Ear Clipping is a simple algorithm for triangulating simple polygons.
 * An "ear" is a triangle formed by three consecutive vertices where:
 * 1. The triangle is convex (interior angle < 180°)
 * 2. No other vertices lie inside the triangle
 *
 * The algorithm:
 * 1. Find an ear (convex vertex with no other vertices inside the triangle)
 * 2. Clip the ear (remove the middle vertex, add the triangle)
 * 3. Repeat until only 3 vertices remain
 *
 * Time Complexity: O(n²) for simple polygons, can be optimized to O(n log n)
 * Space Complexity: O(n)
 */
import type { Point } from "../../../../core/types";
import type { EarClippingConfig, EarClippingOptions, EarClippingResult } from "./ear-clipping-types";
/**
 * Ear Clipping triangulation algorithm.
 */
export declare class EarClipping {
    private config;
    /**
     * Creates a new EarClipping instance.
     * @param config Configuration options.
     * @example
     * ```ts
     * const earClipping = new EarClipping({ tolerance: 1e-10 });
     * ```
     */
    constructor(config?: Partial<EarClippingConfig>);
    /**
     * Triangulate a simple polygon using Ear Clipping.
     * @param vertices Array of polygon vertices (must be in order).
     * @param options Additional options.
     * @returns Triangulation result.
     * @example
     * ```ts
     * const result = earClipping.triangulate(points);
     * console.log(result.triangles.length);
     * ```
     */
    triangulate(vertices: Point[], options?: Partial<EarClippingOptions>): EarClippingResult;
    /**
     * Triangulate a polygon with holes.
     * @param _outerVertices Outer polygon vertices.
     * @param _holes Array of hole polygons.
     * @param _options Additional options.
     * @returns Triangulation result.
     * @example
     * ```ts
     * earClipping.triangulateWithHoles(outer, [hole]);
     * ```
     */
    triangulateWithHoles(_outerVertices: Point[], _holes: Point[][], _options?: Partial<EarClippingOptions>): EarClippingResult;
    /**
     * Handle the trivial triangle case.
     * @param vertices Polygon vertices.
     * @param startTime Start timestamp for stats.
     * @returns Result when vertices form a triangle, otherwise null.
     * @example
     * ```ts
     * const immediate = earClipping['handleTriangle'](vertices, performance.now());
     * ```
     */
    private handleTriangle;
    /**
     * Clone vertices and enforce counter-clockwise orientation.
     * @param vertices Polygon vertices.
     * @param tolerance Floating-point tolerance.
     * @returns A CCW-oriented vertex list.
     * @example
     * ```ts
     * const working = earClipping['prepareWorkingVertices'](vertices, 1e-10);
     * ```
     */
    private prepareWorkingVertices;
    /**
     * Run the ear clipping loop until only one triangle remains.
     * @param workingVertices Mutable vertex list.
     * @param tolerance Floating-point tolerance.
     * @returns Generated triangles and the number of ears clipped.
     * @example
     * ```ts
     * const data = earClipping['clipPolygon']([...vertices], 1e-10);
     * ```
     */
    private clipPolygon;
    /**
     * Find the index of the next ear to clip.
     * @param vertices Polygon vertices.
     * @param tolerance Floating-point tolerance.
     * @returns Index of the ear or -1 when none exist.
     * @example
     * ```ts
     * const index = earClipping['findEarIndex'](vertices, 1e-10);
     * ```
     */
    private findEarIndex;
    /**
     * Build triangulation statistics.
     * @param vertexCount Number of original vertices.
     * @param triangleCount Number of triangles produced.
     * @param earsClipped Number of ears removed.
     * @param startTime Start timestamp for execution time.
     * @returns Aggregated stats.
     * @example
     * ```ts
     * const stats = earClipping['createStats'](4, 2, 1, performance.now());
     * ```
     */
    private createStats;
}
//# sourceMappingURL=ear-clipping-core.d.ts.map