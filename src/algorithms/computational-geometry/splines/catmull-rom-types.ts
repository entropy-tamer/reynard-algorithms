/**
 * Catmull-Rom Spline Types
 *
 * Type definitions for Catmull-Rom spline algorithms.
 */

import type { Point } from "../../../core/types/index.js";

/**
 * Catmull-Rom spline configuration
 */
export interface CatmullRomConfig {
  /** Tension parameter (0 = uniform, 1 = centripetal, 0.5 = chordal) */
  tension?: number;
  /** Whether the curve is closed (connects last point to first) */
  closed?: boolean;
  /** Number of points to generate per segment */
  pointsPerSegment?: number;
}

/**
 * Catmull-Rom spline result
 */
export interface CatmullRomResult {
  /** Points along the spline */
  points: Point[];
  /** Total length of the spline */
  length: number;
  /** SVG path string representation */
  svgPath: string;
  /** Segments of the spline */
  segments: CatmullRomSegment[];
}

/**
 * A single segment of a Catmull-Rom spline
 */
export interface CatmullRomSegment {
  /** Start point */
  p0: Point;
  /** End point */
  p1: Point;
  /** Previous control point */
  p2: Point;
  /** Next control point */
  p3: Point;
}

/**
 * Catmull-Rom spline options
 */
export interface CatmullRomOptions {
  /** Tension parameter (0 = uniform, 1 = centripetal, 0.5 = chordal) */
  tension?: number;
  /** Number of points to generate per segment */
  pointsPerSegment?: number;
  /** Whether to generate SVG path */
  generateSVG?: boolean;
  /** Whether the curve is closed */
  closed?: boolean;
}

/**
 * Catmull-Rom spline evaluation result at parameter t
 */
export interface CatmullRomEvaluation {
  /** Point on the spline at parameter t */
  point: Point;
  /** Tangent vector at this point */
  tangent: Point;
  /** Normal vector at this point */
  normal: Point;
  /** Curvature at this point */
  curvature: number;
}
