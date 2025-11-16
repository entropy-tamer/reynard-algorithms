/**
 * @file Circular Positioning Core
 *
 * Core functions for circular positioning and radial math calculations.
 */

import type { Point } from "../../../core/types/index.js";
import type { CircularPositionOptions, RadialDistributionOptions, CircularPositionResult } from "./circular-types.js";

/**
 * Convert degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 * @param radians - Angle in radians
 * @returns Angle in degrees
 */
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Normalize an angle to the range [0, 2π) for radians or [0, 360) for degrees
 * @param angle - Angle to normalize
 * @param unit - Unit of the angle ('degrees' or 'radians')
 * @returns Normalized angle
 */
export function normalizeAngle(angle: number, unit: "degrees" | "radians" = "radians"): number {
  if (unit === "degrees") {
    return ((angle % 360) + 360) % 360;
  }
  const twoPi = 2 * Math.PI;
  return ((angle % twoPi) + twoPi) % twoPi;
}

/**
 * Calculate a point on a circle given an angle and radius
 * @param angle - Angle in radians
 * @param radius - Radius from center
 * @param center - Center point (defaults to origin { x: 0, y: 0 })
 * @returns Point on the circle
 */
export function calculateCircularPosition(angle: number, radius: number, center: Point = { x: 0, y: 0 }): Point {
  const x = center.x + Math.cos(angle) * radius;
  const y = center.y + Math.sin(angle) * radius;
  return { x, y };
}

/**
 * Calculate a point on a circle with full result information
 * @param options - Circular position options
 * @returns Circular position result with angle and radius information
 */
export function calculateCircularPositionFull(options: CircularPositionOptions): CircularPositionResult {
  const { angle, radius, center = { x: 0, y: 0 } } = options;
  const point = calculateCircularPosition(angle, radius, center);
  return {
    ...point,
    angle,
    radius,
  };
}

/**
 * Generate multiple positions evenly distributed around a circle
 * @param options - Radial distribution options
 * @returns Array of points around the circle
 */
export function calculateRadialPositions(options: RadialDistributionOptions): Point[] {
  const { count, radius, startAngle = 0, angleStep, center = { x: 0, y: 0 } } = options;

  const step = angleStep ?? (2 * Math.PI) / count;
  const positions: Point[] = [];

  for (let i = 0; i < count; i++) {
    const angle = startAngle + i * step;
    positions.push(calculateCircularPosition(angle, radius, center));
  }

  return positions;
}

/**
 * Calculate the length of an arc
 * @param radius - Radius of the circle
 * @param angle - Angle of the arc
 * @param unit - Unit of the angle ('degrees' or 'radians', default: 'radians')
 * @returns Arc length
 */
export function calculateArcLength(radius: number, angle: number, unit: "degrees" | "radians" = "radians"): number {
  const angleRad = unit === "degrees" ? degreesToRadians(angle) : angle;
  return radius * angleRad;
}

/**
 * Calculate the area of a circular sector
 * @param radius - Radius of the circle
 * @param angle - Angle of the sector
 * @param unit - Unit of the angle ('degrees' or 'radians', default: 'radians')
 * @returns Sector area
 */
export function calculateSectorArea(radius: number, angle: number, unit: "degrees" | "radians" = "radians"): number {
  const angleRad = unit === "degrees" ? degreesToRadians(angle) : angle;
  return (radius * radius * angleRad) / 2;
}
