/**
 * AABB (Axis-Aligned Bounding Box) Collision Detection
 *
 * Core collision detection algorithms for axis-aligned bounding boxes.
 * Provides the fundamental collision checking functionality.
 *
 * @module algorithms/aabbCollision
 */

import type { AABB, CollisionResult } from "./aabb-types";
import { pointInAABB, areAABBsTouching } from "./aabb-operations";

/**
 * Check if two AABBs overlap
 * @param a
 * @param b
 * @example
 */
export function checkCollision(a: AABB, b: AABB): CollisionResult {
  const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));

  // AABBs are colliding if they overlap OR if they are touching (edge contact)
  // OR if one AABB is a point inside the other AABB
  const hasOverlap = overlapX > 0 && overlapY > 0;
  const isTouching =
    (overlapX === 0 && overlapY > 0) ||
    (overlapY === 0 && overlapX > 0) ||
    (overlapX === 0 && overlapY === 0 && areAABBsTouching(a, b));
  const isPointInside =
    (b.width === 0 && b.height === 0 && pointInAABB({ x: b.x, y: b.y }, a)) ||
    (a.width === 0 && a.height === 0 && pointInAABB({ x: a.x, y: a.y }, b));
  const colliding = hasOverlap || isTouching || isPointInside;
  const overlapArea = overlapX * overlapY;

  let overlap: AABB | null = null;
  if (hasOverlap) {
    overlap = {
      x: Math.max(a.x, b.x),
      y: Math.max(a.y, b.y),
      width: overlapX,
      height: overlapY,
    };
  }

  // Calculate distance between centers
  const centerAX = a.x + a.width / 2;
  const centerAY = a.y + a.height / 2;
  const centerBX = b.x + b.width / 2;
  const centerBY = b.y + b.height / 2;
  const distance = Math.sqrt((centerBX - centerAX) ** 2 + (centerBY - centerAY) ** 2);

  return {
    colliding,
    overlap,
    overlapArea,
    distance,
  };
}
