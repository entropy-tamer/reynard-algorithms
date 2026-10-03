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

  // AABBs collide if they overlap, or if their edges genuinely meet.
  //
  // "Touching" means edge contact, and `areAABBsTouching` is the authority on
  // that: it requires a.x + a.width === b.x (or the mirror) alongside a real
  // overlap on the other axis.
  //
  // This previously also treated `(overlapX === 0 && overlapY > 0)` and its
  // transpose as touching. Those describe a GAP, not contact: two boxes 500px
  // apart horizontally whose Y ranges overlap satisfied the first clause and
  // were reported as colliding with overlapArea 0. On a seeded 100-AABB
  // fixture in a 1000x1000 field this invented 207 collisions where zero pairs
  // actually overlapped, because the naive O(n^2) path ran every pair through
  // `checkCollision` and the spatial path was then judged against it. Real
  // separation on one axis is a separation, not a contact.
  const hasOverlap = overlapX > 0 && overlapY > 0;
  const isTouching = areAABBsTouching(a, b);
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
