/**
 * @file NURBS Types
 *
 * Type definitions for Non-Uniform Rational B-Spline (NURBS) algorithms.
 */

import type { Point } from "../../../core/types/index.js";

/**
 * NURBS curve configuration
 */
export interface NURBSConfig {
  /** Degree of the NURBS curve */
  degree?: number;
  /** Number of points to generate along the curve */
  numPoints?: number;
  /** Precision for arc length calculation */
  arcLengthPrecision?: number;
}

/**
 * NURBS curve result
 */
export interface NURBSResult {
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
  /** Weights for each control point */
  weights: number[];
}

/**
 * NURBS curve definition
 */
export interface NURBS {
  /** Control points */
  controlPoints: Point[];
  /** Weights for each control point */
  weights: number[];
  /** Degree of the curve */
  degree: number;
  /** Knot vector */
  knots?: number[];
  /** Whether the curve is closed */
  closed?: boolean;
}

/**
 * NURBS evaluation options
 */
export interface NURBSOptions {
  /** Number of points to generate */
  numPoints?: number;
  /** Whether to generate SVG path */
  generateSVG?: boolean;
  /** Precision for arc length calculation */
  arcLengthPrecision?: number;
}

/**
 * NURBS evaluation result at parameter t
 */
export interface NURBSEvaluation {
  /** Point on the curve at parameter t */
  point: Point;
  /** Tangent vector at this point */
  tangent: Point;
  /** Normal vector at this point */
  normal: Point;
  /** Curvature at this point */
  curvature: number;
  /** Rational basis function values */
  basisValues: number[];
}
