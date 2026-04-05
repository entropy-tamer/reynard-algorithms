/**
 * @file AABB (Axis-Aligned Bounding Box) Operations
 *
 * Basic geometric operations for AABB manipulation and analysis.
 * Provides utility functions for AABB transformations and calculations.
 */
import type { AABB } from "./aabb-types";
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
export declare function pointInAABB(point: {
    x: number;
    y: number;
}, aabb: AABB): boolean;
/**
 * Get the cached union of two AABBs.
 * @param a First AABB.
 * @param b Second AABB.
 * @returns AABB covering both inputs.
 * @example
 * unionAABB({ x: 0, y: 0, width: 1, height: 1 }, { x: 1, y: 1, width: 1, height: 1 });
 */
export declare function unionAABB(a: AABB, b: AABB): AABB;
/**
 * Get the cached intersection of two AABBs.
 * @param a First AABB.
 * @param b Second AABB.
 * @returns Overlapping region or null.
 * @example
 * intersectionAABB({ x: 0, y: 0, width: 2, height: 2 }, { x: 1, y: 1, width: 2, height: 2 });
 */
export declare function intersectionAABB(a: AABB, b: AABB): AABB | null;
/**
 * Expand an AABB by a uniform amount in all directions.
 * @param aabb Input AABB.
 * @param amount Expansion amount (applied to all sides).
 * @returns Expanded AABB.
 * @example
 * expandAABB({ x: 1, y: 1, width: 2, height: 2 }, 1);
 */
export declare function expandAABB(aabb: AABB, amount: number): AABB;
/**
 * Check if one AABB is fully contained within another.
 * @param container Outer AABB.
 * @param contained Inner AABB.
 * @returns True if the inner AABB lies completely inside the outer AABB.
 * @example
 * containsAABB({ x: 0, y: 0, width: 5, height: 5 }, { x: 1, y: 1, width: 1, height: 1 }); // true
 */
export declare function containsAABB(container: AABB, contained: AABB): boolean;
/**
 * Check if two AABBs are touching by edges without overlapping area.
 * @param a First AABB.
 * @param b Second AABB.
 * @returns True if the AABBs are adjacent (share an edge) but not overlapping.
 * @example
 * areAABBsTouching({ x: 0, y: 0, width: 1, height: 1 }, { x: 1, y: 0, width: 1, height: 1 }); // true
 */
export declare function areAABBsTouching(a: AABB, b: AABB): boolean;
//# sourceMappingURL=aabb-operations.d.ts.map