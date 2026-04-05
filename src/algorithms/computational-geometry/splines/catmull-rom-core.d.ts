/**
 * Catmull-Rom Spline Algorithms
 *
 * Implementation of Catmull-Rom spline algorithms for smooth curve interpolation.
 * Catmull-Rom splines pass through all control points, making them ideal for
 * smooth connections through multiple points.
 */
import type { Point } from "../../../core/types/index.js";
import type { CatmullRomResult, CatmullRomSegment, CatmullRomOptions, CatmullRomEvaluation } from "./catmull-rom-types.js";
/**
 * Evaluate a Catmull-Rom segment at parameter t (0 to 1)
 * Uses the standard Catmull-Rom formula
 * @param segment
 * @param t
 * @param tension
 * @example
 */
export declare function evaluateCatmullRomSegment(segment: CatmullRomSegment, t: number, tension?: number): Point;
/**
 * Calculate the derivative (tangent) of a Catmull-Rom segment at parameter t
 * @param segment
 * @param t
 * @param tension
 * @example
 */
export declare function derivativeCatmullRomSegment(segment: CatmullRomSegment, t: number, tension?: number): Point;
/**
 * Evaluate a Catmull-Rom segment with additional information
 * @param segment
 * @param t
 * @param tension
 * @example
 */
export declare function evaluateCatmullRomSegmentFull(segment: CatmullRomSegment, t: number, tension?: number): CatmullRomEvaluation;
/**
 * Generate a Catmull-Rom spline from a series of control points
 * @param points
 * @param options
 * @example
 */
export declare function generateCatmullRomSpline(points: Point[], options?: CatmullRomOptions): CatmullRomResult;
/**
 * Generate a Catmull-Rom spline path string for SVG
 * @param points
 * @param tension
 * @param closed
 * @example
 */
export declare function generateCatmullRomSVGPath(points: Point[], tension?: number, closed?: boolean): string;
//# sourceMappingURL=catmull-rom-core.d.ts.map