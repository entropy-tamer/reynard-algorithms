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
 * @example
 */
export declare function degreesToRadians(degrees: number): number;
/**
 * Convert radians to degrees
 * @param radians - Angle in radians
 * @returns Angle in degrees
 * @example
 */
export declare function radiansToDegrees(radians: number): number;
/**
 * Normalize an angle to the range [0, 2π) for radians or [0, 360) for degrees
 * @param angle - Angle to normalize
 * @param unit - Unit of the angle ('degrees' or 'radians')
 * @returns Normalized angle
 * @example
 */
export declare function normalizeAngle(angle: number, unit?: "degrees" | "radians"): number;
/**
 * Calculate a point on a circle given an angle and radius
 * @param angle - Angle in radians
 * @param radius - Radius from center
 * @param center - Center point (defaults to origin { x: 0, y: 0 })
 * @returns Point on the circle
 * @example
 */
export declare function calculateCircularPosition(angle: number, radius: number, center?: Point): Point;
/**
 * Calculate a point on a circle with full result information
 * @param options - Circular position options
 * @returns Circular position result with angle and radius information
 * @example
 */
export declare function calculateCircularPositionFull(options: CircularPositionOptions): CircularPositionResult;
/**
 * Generate multiple positions evenly distributed around a circle
 * @param options - Radial distribution options
 * @returns Array of points around the circle
 * @example
 */
export declare function calculateRadialPositions(options: RadialDistributionOptions): Point[];
/**
 * Calculate the length of an arc
 * @param radius - Radius of the circle
 * @param angle - Angle of the arc
 * @param unit - Unit of the angle ('degrees' or 'radians', default: 'radians')
 * @returns Arc length
 * @example
 */
export declare function calculateArcLength(radius: number, angle: number, unit?: "degrees" | "radians"): number;
/**
 * Calculate the area of a circular sector
 * @param radius - Radius of the circle
 * @param angle - Angle of the sector
 * @param unit - Unit of the angle ('degrees' or 'radians', default: 'radians')
 * @returns Sector area
 * @example
 */
export declare function calculateSectorArea(radius: number, angle: number, unit?: "degrees" | "radians"): number;
//# sourceMappingURL=circular-core.d.ts.map