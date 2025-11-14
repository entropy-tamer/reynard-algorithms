/**
 * Hermite Spline Types
 *
 * Type definitions for Hermite spline algorithms.
 */

import type { Point } from "../../../core/types/index.js";

/**
 * Hermite spline configuration
 */
export interface HermiteConfig {
  /** Number of points to generate per segment */
  pointsPerSegment?: number;
  /** Precision for arc length calculation */
  arcLengthPrecision?: number;
}

/**
 * Hermite spline result
 */
export interface HermiteResult {
  /** Points along the spline */
  points: Point[];
  /** Total length of the spline */
  length: number;
  /** SVG path string representation */
  svgPath: string;
  /** Segments of the spline */
  segments: HermiteSegment[];
}

/**
 * A single segment of a Hermite spline
 */
export interface HermiteSegment {
  /** Start point */
  p0: Point;
  /** End point */
  p1: Point;
  /** Tangent at start point */
  t0: Point;
  /** Tangent at end point */
  t1: Point;
}

/**
 * Hermite spline options
 */
export interface HermiteOptions {
  /** Number of points to generate per segment */
  pointsPerSegment?: number;
  /** Whether to generate SVG path */
  generateSVG?: boolean;
  /** Whether the curve is closed */
  closed?: boolean;
  /** Precision for arc length calculation */
  arcLengthPrecision?: number;
}

/**
 * Hermite spline evaluation result at parameter t
 */
export interface HermiteEvaluation {
  /** Point on the spline at parameter t */
  point: Point;
  /** Tangent vector at this point */
  tangent: Point;
  /** Normal vector at this point */
  normal: Point;
  /** Curvature at this point */
  curvature: number;
}





