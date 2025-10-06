/**
 * Collision Detection Algorithm Module
 *
 * Comprehensive collision detection algorithms for AABB (Axis-Aligned Bounding Box)
 * and general collision detection systems.
 *
 * Features:
 * - AABB collision detection
 * - Batch collision processing
 * - Spatial indexing for collision optimization
 * - Memory-efficient collision queries
 * - Type-safe collision operations
 *
 * @module algorithms/geometry/collision
 */

// Export AABB types
export * from "./aabb-types";

// Export AABB operations
export * from "./aabb-operations";

// Export AABB collision detection
export * from "./aabb-collision";

// Export AABB utilities
export * from "./aabb-utils";

// Export AABB spatial hash
export * from "./aabb-spatial-hash";

// Export AABB batch collision
export * from "./aabb-batch-collision";

// Export AABB index
export * from "./aabb-index";

// Export general collision algorithms
export * from "./collision-algorithms";

// Export spatial collision optimizer
export * from "./spatial-collision-optimizer";
