/**
 * Collision Detection Module
 *
 * Comprehensive collision detection system with AABB support, general algorithms,
 * and optimization systems for efficient collision detection in 2D and 3D spaces.
 *
 * Features:
 * - AABB collision detection with batch processing
 * - SAT (Separating Axis Theorem) for complex shapes
 * - Sweep and Prune broad-phase collision detection
 * - Spatial optimization and caching systems
 * - Performance monitoring and statistics
 *
 * @module algorithms/geometry/collision
 */

// Export AABB collision detection
export * from "./aabb";

// Export general collision algorithms (SAT, Sweep-Prune)
export * from "./algorithms";

// Export optimization systems (excluding duplicate types)
export {
  SpatialCollisionOptimizer,
  naiveCollisionDetection,
  spatialCollisionDetection,
  checkCollisionWithCache,
  type CollisionCache,
} from "./optimization";

// Export spatial hash from spatial-structures
export { SpatialHash } from "../../spatial-structures/spatial-hash/spatial-hash-core";
