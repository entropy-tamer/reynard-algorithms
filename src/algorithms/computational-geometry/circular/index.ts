/**
 * @file Circular Positioning Module
 *
 * Circular positioning and radial math utilities for computational geometry.
 */

export type { CircularPositionOptions, RadialDistributionOptions, CircularPositionResult } from "./circular-types.js";

export {
  calculateCircularPosition,
  calculateCircularPositionFull,
  calculateRadialPositions,
  degreesToRadians,
  radiansToDegrees,
  normalizeAngle,
  calculateArcLength,
  calculateSectorArea,
} from "./circular-core.js";





