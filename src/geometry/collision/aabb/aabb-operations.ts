/**
 * AABB (Axis-Aligned Bounding Box) Operations
 *
 * Basic geometric operations for AABB manipulation and analysis.
 * Provides utility functions for AABB transformations and calculations.
 *
 * @module algorithms/aabbOperations
 */

import type { AABB } from "./aabb-types";

/**
 * Check if a point is inside an AABB
 * @param point
 * @param point.x
 * @param point.y
 * @param aabb
 * @example
 */
export function pointInAABB(point: { x: number; y: number }, aabb: AABB): boolean {
  return point.x >= aabb.x && point.x <= aabb.x + aabb.width && point.y >= aabb.y && point.y <= aabb.y + aabb.height;
}

/**
 * Get the union of two AABBs
 * @param a
 * @param b
 * @example
 */
export function unionAABB(a: AABB, b: AABB): AABB {
  const minX = Math.min(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxX = Math.max(a.x + a.width, b.x + b.width);
  const maxY = Math.max(a.y + a.height, b.y + b.height);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Get the intersection of two AABBs
 * @param a
 * @param b
 * @example
 */
export function intersectionAABB(a: AABB, b: AABB): AABB | null {
  const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));

  // Only return intersection if there's actual overlap (not just touching)
  if (overlapX > 0 && overlapY > 0) {
    return {
      x: Math.max(a.x, b.x),
      y: Math.max(a.y, b.y),
      width: overlapX,
      height: overlapY,
    };
  }

  return null;
}

/**
 * Expand an AABB by a given amount
 * @param aabb
 * @param amount
 * @example
 */
export function expandAABB(aabb: AABB, amount: number): AABB {
  return {
    x: aabb.x - amount,
    y: aabb.y - amount,
    width: aabb.width + amount * 2,
    height: aabb.height + amount * 2,
  };
}

/**
 * Check if an AABB is completely contained within another
 * @param container
 * @param contained
 * @example
 */
export function containsAABB(container: AABB, contained: AABB): boolean {
  return (
    contained.x >= container.x &&
    contained.y >= container.y &&
    contained.x + contained.width <= container.x + container.width &&
    contained.y + contained.height <= container.y + container.height
  );
}

/**
 * Check if two AABBs are touching (edge contact)
 * @param a
 * @param b
 * @example
 */
export function areAABBsTouching(a: AABB, b: AABB): boolean {
  // Check if AABBs are touching but not overlapping
  const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));

  // They are touching if they are adjacent but not overlapping
  const isAdjacentX = a.x + a.width === b.x || b.x + b.width === a.x;
  const isAdjacentY = a.y + a.height === b.y || b.y + b.height === a.y;

  return (isAdjacentX && overlapY > 0) || (isAdjacentY && overlapX > 0);
}
