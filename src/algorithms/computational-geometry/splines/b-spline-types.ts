/**
 * B-Spline Types
 *
 * Type definitions for B-Spline curve algorithms.
 */

import type { Point } from "../../../core/types/index.js";

/**
 * B-Spline curve configuration
 */
export interface BSplineConfig {
  /** Degree of the B-spline (order = degree + 1) */
  degree?: number;
  /** Whether the spline is uniform (equally spaced knots) */
  uniform?: boolean;
  /** Number of points to generate along the curve */
  numPoints?: number;
  /** Precision for arc length calculation */
  arcLengthPrecision?: number;
}

/**
 * B-Spline curve result
 */
export interface BSplineResult {
  /** Points along the curve */
  points: Point[];
  /** Total length of the curve */
  length: number;
  /** SVG path string representation */
  svgPath: string;
  /** Knot vector used */
  knots: number[];
  /** Control points */
  controlPoints: Point[];
}

/**
 * B-Spline curve definition
 */
export interface BSpline {
  /** Control points */
  controlPoints: Point[];
  /** Degree of the spline */
  degree: number;
  /** Knot vector (for non-uniform B-splines) */
  knots?: number[];
  /** Whether the curve is closed */
  closed?: boolean;
}

/**
 * B-Spline evaluation options
 */
export interface BSplineOptions {
  /** Number of points to generate */
  numPoints?: number;
  /** Whether to generate SVG path */
  generateSVG?: boolean;
  /** Precision for arc length calculation */
  arcLengthPrecision?: number;
}

/**
 * B-Spline evaluation result at parameter t
 */
export interface BSplineEvaluation {
  /** Point on the curve at parameter t */
  point: Point;
  /** Tangent vector at this point */
  tangent: Point;
  /** Normal vector at this point */
  normal: Point;
  /** Curvature at this point */
  curvature: number;
  /** Basis function values */
  basisValues: number[];
}

/**
 * Knot vector generation options
 */
export interface KnotVectorOptions {
  /** Degree of the spline */
  degree: number;
  /** Number of control points */
  numControlPoints: number;
  /** Whether to generate uniform knots */
  uniform?: boolean;
  /** Custom knot values (for non-uniform) */
  customKnots?: number[];
  /** Whether the curve is closed (periodic) */
  closed?: boolean;
}





