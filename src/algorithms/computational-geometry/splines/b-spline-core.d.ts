/**
 * B-Spline Algorithms
 *
 * Implementation of B-Spline curve algorithms for smooth curve generation.
 * Supports both uniform and non-uniform B-splines.
 */
import type { Point } from "../../../core/types/index.js";
import type { BSpline, BSplineConfig, BSplineEvaluation, BSplineOptions, BSplineResult, KnotVectorOptions } from "./b-spline-types.js";
/**
 * Generate a uniform knot vector
 * @param options
 * @example
 */
export declare function generateUniformKnotVector(options: KnotVectorOptions): number[];
/**
 * Generate a non-uniform knot vector
 * @param options
 * @example
 */
export declare function generateNonUniformKnotVector(options: KnotVectorOptions): number[];
/**
 * Calculate B-spline basis function N(i,p,t) using Cox-de Boor recursion
 * @param i
 * @param p
 * @param t
 * @param knots
 * @example
 */
export declare function basisFunction(i: number, p: number, t: number, knots: number[]): number;
/**
 * Evaluate a B-spline curve at parameter t
 * @param spline
 * @param t
 * @example
 */
export declare function evaluateBSpline(spline: BSpline, t: number): Point;
/**
 * Evaluate a B-spline curve with full information
 * @param spline
 * @param t
 * @example
 */
export declare function evaluateBSplineFull(spline: BSpline, t: number): BSplineEvaluation;
/**
 * Generate points along a B-spline curve
 * @param spline
 * @param options
 * @example
 */
export declare function generateBSplinePoints(spline: BSpline, options?: BSplineOptions): BSplineResult;
/**
 * B-Spline class for convenient usage
 */
export declare class BSplineCurve {
    private spline;
    private config;
    /**
     *
     * @param controlPoints
     * @param config
     * @example
     */
    constructor(controlPoints: Point[], config?: Partial<BSplineConfig>);
    /**
     * Evaluate the curve at parameter t
     * @param t
     * @example
     */
    evaluate(t: number): Point;
    /**
     * Evaluate the curve with full information
     * @param t
     * @example
     */
    evaluateFull(t: number): BSplineEvaluation;
    /**
     * Generate points along the curve
     * @param options
     * @example
     */
    generatePoints(options?: BSplineOptions): BSplineResult;
    /**
     * Set the knot vector
     * @param knots
     * @example
     */
    setKnots(knots: number[]): void;
    /**
     * Get the knot vector
     * @example
     */
    getKnots(): number[];
}
//# sourceMappingURL=b-spline-core.d.ts.map