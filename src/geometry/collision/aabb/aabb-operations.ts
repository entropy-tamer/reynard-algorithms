/**
 * @file AABB (Axis-Aligned Bounding Box) Operations
 *
 * Basic geometric operations for AABB manipulation and analysis.
 * Provides utility functions for AABB transformations and calculations.
 */

import type { AABB } from "./aabb-types";
import { adaptiveMemo } from "../../../utils";

/**
 * Check if a point lies inside an AABB.
 * @param point Point coordinates.
 * @param point.x X coordinate of the point.
 * @param point.y Y coordinate of the point.
 * @param aabb Axis-aligned bounding box.
 * @returns True if the point is within the bounds (inclusive), otherwise false.
 * @example
 * pointInAABB({ x: 5, y: 5 }, { x: 0, y: 0, width: 10, height: 10 }); // true
 */
export function pointInAABB(point: { x: number; y: number }, aabb: AABB): boolean {
  return point.x >= aabb.x && point.x <= aabb.x + aabb.width && point.y >= aabb.y && point.y <= aabb.y + aabb.height;
}

/**
 * Compute the minimal AABB that encloses two AABBs.
 * @param a First AABB.
 * @param b Second AABB.
 * @returns A new AABB representing the union.
 * @example
 * unionAABB({ x: 0, y: 0, width: 1, height: 1 }, { x: 1, y: 1, width: 1, height: 1 });
 */
const _unionMemo = adaptiveMemo(
  (a: AABB, b: AABB): AABB => {
    const minX = Math.min(a.x, b.x);
    const minY = Math.min(a.y, b.y);
    const maxX = Math.max(a.x + a.width, b.x + b.width);
    const maxY = Math.max(a.y + a.height, b.y + b.height);
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  },
  { name: 'unionAABB', maxSize: 4096, minHitRate: 0.6, windowSize: 500, minSamples: 200 },
  (a: AABB, b: AABB) => `${a.x}|${a.y}|${a.width}|${a.height}::${b.x}|${b.y}|${b.width}|${b.height}`
);

/**
 * Get the cached union of two AABBs.
 * @param a First AABB.
 * @param b Second AABB.
 * @returns AABB covering both inputs.
 * @example
 * unionAABB({ x: 0, y: 0, width: 1, height: 1 }, { x: 1, y: 1, width: 1, height: 1 });
 */
export function unionAABB(a: AABB, b: AABB): AABB {
  return _unionMemo(a, b);
}

/**
 * Compute the intersection of two AABBs.
 * @param a First AABB.
 * @param b Second AABB.
 * @returns The overlapping AABB or null if they do not intersect.
 * @example
 * intersectionAABB({ x: 0, y: 0, width: 2, height: 2 }, { x: 1, y: 1, width: 2, height: 2 });
 */
const _intersectMemo = adaptiveMemo(
  (a: AABB, b: AABB): AABB | null => {
    const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
    const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
    if (overlapX > 0 && overlapY > 0) {
      return { x: Math.max(a.x, b.x), y: Math.max(a.y, b.y), width: overlapX, height: overlapY };
    }
    return null;
  },
  { name: 'intersectionAABB', maxSize: 4096, minHitRate: 0.6, windowSize: 500, minSamples: 200 },
  (a: AABB, b: AABB) => `${a.x}|${a.y}|${a.width}|${a.height}::${b.x}|${b.y}|${b.width}|${b.height}`
);

/**
 * Get the cached intersection of two AABBs.
 * @param a First AABB.
 * @param b Second AABB.
 * @returns Overlapping region or null.
 * @example
 * intersectionAABB({ x: 0, y: 0, width: 2, height: 2 }, { x: 1, y: 1, width: 2, height: 2 });
 */
export function intersectionAABB(a: AABB, b: AABB): AABB | null {
  return _intersectMemo(a, b);
}

/**
 * Expand an AABB by a uniform amount in all directions.
 * @param aabb Input AABB.
 * @param amount Expansion amount (applied to all sides).
 * @returns Expanded AABB.
 * @example
 * expandAABB({ x: 1, y: 1, width: 2, height: 2 }, 1);
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
 * Check if one AABB is fully contained within another.
 * @param container Outer AABB.
 * @param contained Inner AABB.
 * @returns True if the inner AABB lies completely inside the outer AABB.
 * @example
 * containsAABB({ x: 0, y: 0, width: 5, height: 5 }, { x: 1, y: 1, width: 1, height: 1 }); // true
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
 * Check if two AABBs are touching by edges without overlapping area.
 * @param a First AABB.
 * @param b Second AABB.
 * @returns True if the AABBs are adjacent (share an edge) but not overlapping.
 * @example
 * areAABBsTouching({ x: 0, y: 0, width: 1, height: 1 }, { x: 1, y: 0, width: 1, height: 1 }); // true
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
