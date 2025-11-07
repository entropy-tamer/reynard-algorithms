/**
 * Bezier Curve Types
 *
 * Type definitions for Bezier curve algorithms.
 */

import type { Point } from "../../../core/types/index.js";

/**
 * Bezier curve configuration
 */
export interface BezierConfig {
  /** Precision for curve generation (number of points to generate) */
  precision?: number;
  /** Whether to optimize the curve */
  optimize?: boolean;
}

/**
 * Bezier curve result
 */
export interface BezierResult {
  /** Points along the curve */
  points: Point[];
  /** Total length of the curve */
  length: number;
  /** SVG path string representation */
  svgPath: string;
}

/**
 * Quadratic Bezier curve (3 control points)
 */
export interface QuadraticBezier {
  /** Start point */
  p0: Point;
  /** Control point */
  p1: Point;
  /** End point */
  p2: Point;
}

/**
 * Cubic Bezier curve (4 control points)
 */
export interface CubicBezier {
  /** Start point */
  p0: Point;
  /** First control point */
  p1: Point;
  /** Second control point */
  p2: Point;
  /** End point */
  p3: Point;
}

/**
 * Bezier curve options
 */
export interface BezierOptions {
  /** Number of points to generate along the curve */
  numPoints?: number;
  /** Precision for arc length calculation */
  arcLengthPrecision?: number;
  /** Whether to generate SVG path */
  generateSVG?: boolean;
}

/**
 * Bezier curve evaluation result at parameter t
 */
export interface BezierEvaluation {
  /** Point on the curve at parameter t */
  point: Point;
  /** Tangent vector at this point */
  tangent: Point;
  /** Normal vector at this point */
  normal: Point;
  /** Curvature at this point */
  curvature: number;
}
