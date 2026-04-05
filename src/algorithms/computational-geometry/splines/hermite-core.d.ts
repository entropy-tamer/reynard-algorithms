/**
 * Hermite Spline Algorithms
 *
 * Implementation of Hermite spline algorithms for smooth curve interpolation
 * with explicit tangent control.
 */
import type { Point } from "../../../core/types/index.js";
import type { HermiteConfig, HermiteResult, HermiteSegment, HermiteOptions, HermiteEvaluation } from "./hermite-types.js";
/**
 * Evaluate a Hermite spline segment at parameter t (0 to 1)
 * Uses cubic Hermite interpolation: H(t) = h00(t)*P0 + h10(t)*T0 + h01(t)*P1 + h11(t)*T1
 * @param segment
 * @param t
 * @example
 */
export declare function evaluateHermiteSegment(segment: HermiteSegment, t: number): Point;
/**
 * Calculate the derivative (tangent) of a Hermite segment at parameter t
 * @param segment
 * @param t
 * @example
 */
export declare function derivativeHermiteSegment(segment: HermiteSegment, t: number): Point;
/**
 * Evaluate a Hermite segment with additional information
 * @param segment
 * @param t
 * @example
 */
export declare function evaluateHermiteSegmentFull(segment: HermiteSegment, t: number): HermiteEvaluation;
/**
 * Generate a Hermite spline from segments
 * @param segments
 * @param options
 * @example
 */
export declare function generateHermiteSpline(segments: HermiteSegment[], options?: HermiteOptions): HermiteResult;
/**
 * Generate Hermite segments from points and tangents
 * @param points
 * @param tangents
 * @param closed
 * @example
 */
export declare function createHermiteSegments(points: Point[], tangents: Point[], closed?: boolean): HermiteSegment[];
/**
 * Hermite spline class for convenient usage
 */
export declare class HermiteSpline {
    private segments;
    /**
     *
     * @param segments
     * @param _config
     * @example
     */
    constructor(segments: HermiteSegment[], _config?: Partial<HermiteConfig>);
    /**
     * Evaluate the spline at parameter t (0 to 1 across all segments)
     * @param t
     * @example
     */
    evaluate(t: number): Point;
    /**
     * Evaluate the spline with full information
     * @param t
     * @example
     */
    evaluateFull(t: number): HermiteEvaluation;
    /**
     * Generate points along the spline
     * @param options
     * @example
     */
    generatePoints(options?: HermiteOptions): HermiteResult;
    /**
     * Get segments
     * @example
     */
    getSegments(): HermiteSegment[];
}
//# sourceMappingURL=hermite-core.d.ts.map