/**
 * @file Circular Positioning Types
 *
 * Type definitions for circular positioning and radial math algorithms.
 */

import type { Point } from "../../../core/types/index.js";

/**
 * Options for calculating a single circular position
 */
export interface CircularPositionOptions {
  /** Angle in radians */
  angle: number;
  /** Radius from center */
  radius: number;
  /** Center point (defaults to origin { x: 0, y: 0 }) */
  center?: Point;
}

/**
 * Options for generating multiple positions around a circle
 */
export interface RadialDistributionOptions {
  /** Number of positions to generate */
  count: number;
  /** Radius from center */
  radius: number;
  /** Starting angle in radians (default: 0) */
  startAngle?: number;
  /** Angle step between positions in radians (default: 2π / count) */
  angleStep?: number;
  /** Center point (defaults to origin { x: 0, y: 0 }) */
  center?: Point;
}

/**
 * Result of a circular position calculation
 */
export interface CircularPositionResult extends Point {
  /** The angle used (in radians) */
  angle: number;
  /** The radius used */
  radius: number;
}





