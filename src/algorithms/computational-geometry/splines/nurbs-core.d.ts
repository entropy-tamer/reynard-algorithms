/**
 * NURBS Algorithms
 *
 * Implementation of Non-Uniform Rational B-Spline (NURBS) curve algorithms.
 */
import type { Point } from "../../../core/types/index.js";
import type { NURBS, NURBSConfig, NURBSResult, NURBSOptions, NURBSEvaluation } from "./nurbs-types.js";
/**
 * Evaluate a NURBS curve at parameter t
 * @param nurbs
 * @param t
 * @example
 */
export declare function evaluateNURBS(nurbs: NURBS, t: number): Point;
/**
 * Evaluate a NURBS curve with full information
 * @param nurbs
 * @param t
 * @example
 */
export declare function evaluateNURBSFull(nurbs: NURBS, t: number): NURBSEvaluation;
/**
 * Generate points along a NURBS curve
 * @param nurbs
 * @param options
 * @example
 */
export declare function generateNURBSPoints(nurbs: NURBS, options?: NURBSOptions): NURBSResult;
/**
 * NURBS class for convenient usage
 */
export declare class NURBSCurve {
    private nurbs;
    private config;
    /**
     *
     * @param controlPoints
     * @param weights
     * @param config
     * @example
     */
    constructor(controlPoints: Point[], weights: number[], config?: Partial<NURBSConfig>);
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
    evaluateFull(t: number): NURBSEvaluation;
    /**
     * Generate points along the curve
     * @param options
     * @example
     */
    generatePoints(options?: NURBSOptions): NURBSResult;
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
    /**
     * Set weights
     * @param weights
     * @example
     */
    setWeights(weights: number[]): void;
    /**
     * Get weights
     * @example
     */
    getWeights(): number[];
}
//# sourceMappingURL=nurbs-core.d.ts.map