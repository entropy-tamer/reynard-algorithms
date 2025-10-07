/**
 * AABB (Axis-Aligned Bounding Box) Utilities
 *
 * Utility functions for AABB calculations and measurements.
 * Provides simple mathematical operations on AABB objects.
 *
 * @module algorithms/aabbUtils
 */

import type { AABB } from "./aabb-types";

/**
 * Calculate the area of an AABB
 */
export function getAABBArea(aabb: AABB): number {
  return aabb.width * aabb.height;
}

/**
 * Calculate the perimeter of an AABB
 */
export function getAABBPerimeter(aabb: AABB): number {
  return 2 * (aabb.width + aabb.height);
}
