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
import type {
  EarClippingConfig,
  EarClippingOptions,
  EarClippingResult,
  EarClippingStats,
  Triangle,
} from "./ear-clipping-types";
import { DEFAULT_EAR_CLIPPING_CONFIG } from "./ear-clipping-types";
import { getPolygonOrientation } from "./ear-clipping-orientation";
import { isEar } from "./ear-clipping-triangle";
import { validatePolygon } from "./ear-clipping-validation";

/**
 * Ear Clipping triangulation algorithm.
 */
export class EarClipping {
  private config: Required<EarClippingConfig>;

  /**
   * Creates a new EarClipping instance.
   * @param config Configuration options.
   * @example
   * ```ts
   * const earClipping = new EarClipping({ tolerance: 1e-10 });
   * ```
   */
  constructor(config: Partial<EarClippingConfig> = {}) {
    this.config = { ...DEFAULT_EAR_CLIPPING_CONFIG, ...config };
  }

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
  triangulate(vertices: Point[], options: Partial<EarClippingOptions> = {}): EarClippingResult {
    const startTime = performance.now();
    const opts = { ...this.config, ...options };
    const tolerance = opts.tolerance;

    if (opts.validateInput) {
      validatePolygon(vertices, tolerance);
    }

    const triangleResult = this.handleTriangle(vertices, startTime);
    if (triangleResult) {
      return triangleResult;
    }

    const workingVertices = this.prepareWorkingVertices(vertices, tolerance);
    const { triangles, earsClipped } = this.clipPolygon(workingVertices, tolerance);
    const stats = this.createStats(vertices.length, triangles.length, earsClipped, startTime);

    return { triangles, stats };
  }

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
  triangulateWithHoles(
    _outerVertices: Point[],
    _holes: Point[][],
    _options: Partial<EarClippingOptions> = {}
  ): EarClippingResult {
    // For now, throw error if holes are not supported
    // Full implementation would require connecting holes to outer boundary
    if (!this.config.handleHoles) {
      throw new Error("Hole handling is not enabled. Set handleHoles to true.");
    }

    // TODO: Implement hole handling by:
    // 1. Finding bridge edges from outer boundary to holes
    // 2. Creating a single polygon with all vertices
    // 3. Triangulating the combined polygon

    throw new Error("Hole handling not yet implemented");
  }

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
  private handleTriangle(vertices: Point[], startTime: number): EarClippingResult | null {
    if (vertices.length !== 3) {
      return null;
    }

    const stats = this.createStats(3, 1, 0, startTime);
    return {
      triangles: [{ a: vertices[0]!, b: vertices[1]!, c: vertices[2]! }],
      stats,
    };
  }

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
  private prepareWorkingVertices(vertices: Point[], tolerance: number): Point[] {
    const workingVertices: Point[] = vertices.map((v) => ({ ...v }));
    if (getPolygonOrientation(workingVertices, tolerance) === "cw") {
      workingVertices.reverse();
    }
    return workingVertices;
  }

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
  private clipPolygon(
    workingVertices: Point[],
    tolerance: number
  ): { triangles: Triangle[]; earsClipped: number } {
    const triangles: Triangle[] = [];
    let earsClipped = 0;

    while (workingVertices.length > 3) {
      const earIndex = this.findEarIndex(workingVertices, tolerance);
      if (earIndex === -1) {
        throw new Error(
          "No ear found - polygon may be self-intersecting or have invalid geometry"
        );
      }

      const prev = workingVertices[(earIndex - 1 + workingVertices.length) % workingVertices.length]!;
      const curr = workingVertices[earIndex]!;
      const next = workingVertices[(earIndex + 1) % workingVertices.length]!;

      triangles.push({ a: prev, b: curr, c: next });
      workingVertices.splice(earIndex, 1);
      earsClipped++;
    }

    triangles.push({
      a: workingVertices[0]!,
      b: workingVertices[1]!,
      c: workingVertices[2]!,
    });

    return { triangles, earsClipped };
  }

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
  private findEarIndex(vertices: Point[], tolerance: number): number {
    for (let i = 0; i < vertices.length; i++) {
      const prev = vertices[(i - 1 + vertices.length) % vertices.length]!;
      const curr = vertices[i]!;
      const next = vertices[(i + 1) % vertices.length]!;
      if (isEar(prev, curr, next, vertices, tolerance)) {
        return i;
      }
    }
    return -1;
  }

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
  private createStats(
    vertexCount: number,
    triangleCount: number,
    earsClipped: number,
    startTime: number
  ): EarClippingStats {
    return {
      vertexCount,
      triangleCount,
      executionTime: performance.now() - startTime,
      earsClipped,
    };
  }
}
