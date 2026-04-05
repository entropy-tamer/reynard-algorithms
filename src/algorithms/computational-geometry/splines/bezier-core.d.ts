/**
 * Bezier Curve Algorithms
 *
 * Implementation of Bezier curve algorithms for smooth curve generation.
 * Supports both quadratic (3 points) and cubic (4 points) Bezier curves.
 */
import type { Point } from "../../../core/types/index.js";
import type { BezierResult, QuadraticBezier, CubicBezier, BezierOptions, BezierEvaluation } from "./bezier-types.js";
/**
 * Evaluate a quadratic Bezier curve at parameter t (0 to 1)
 * @param curve
 * @param t
 * @example
 */
export declare function evaluateQuadraticBezier(curve: QuadraticBezier, t: number): Point;
/**
 * Evaluate a cubic Bezier curve at parameter t (0 to 1)
 * @param curve
 * @param t
 * @example
 */
export declare function evaluateCubicBezier(curve: CubicBezier, t: number): Point;
/**
 * Calculate the derivative (tangent) of a quadratic Bezier curve at parameter t
 * @param curve
 * @param t
 * @example
 */
export declare function derivativeQuadraticBezier(curve: QuadraticBezier, t: number): Point;
/**
 * Calculate the derivative (tangent) of a cubic Bezier curve at parameter t
 * @param curve
 * @param t
 * @example
 */
export declare function derivativeCubicBezier(curve: CubicBezier, t: number): Point;
/**
 * Evaluate a quadratic Bezier curve with additional information
 * @param curve
 * @param t
 * @example
 */
export declare function evaluateQuadraticBezierFull(curve: QuadraticBezier, t: number): BezierEvaluation;
/**
 * Evaluate a cubic Bezier curve with additional information
 * @param curve
 * @param t
 * @example
 */
export declare function evaluateCubicBezierFull(curve: CubicBezier, t: number): BezierEvaluation;
/**
 * Generate points along a quadratic Bezier curve
 * @param curve
 * @param options
 * @example
 */
export declare function generateQuadraticBezierPoints(curve: QuadraticBezier, options?: BezierOptions): BezierResult;
/**
 * Generate points along a cubic Bezier curve
 * @param curve
 * @param options
 * @example
 */
export declare function generateCubicBezierPoints(curve: CubicBezier, options?: BezierOptions): BezierResult;
/**
 * Convert a quadratic Bezier to cubic Bezier (for uniform handling)
 * @param curve
 * @example
 */
export declare function quadraticToCubic(curve: QuadraticBezier): CubicBezier;
//# sourceMappingURL=bezier-core.d.ts.map