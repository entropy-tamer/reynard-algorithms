/**
 * Spatial Hashing Algorithm
 *
 * A highly optimized spatial partitioning system for efficient spatial queries,
 * nearest neighbor searches, and collision detection optimization.
 *
 * Features:
 * - Dynamic cell size adjustment
 * - Efficient spatial queries
 * - Memory-optimized storage
 * - Type-safe operations
 * - Performance monitoring
 * - Automatic cleanup
 *
 * @module algorithms/spatialHash
 */

// Export all types and interfaces
export * from "./spatial-hash-types";

// Export the main SpatialHash class
export { SpatialHash } from "./spatial-hash-core";

// Export utility functions
export { createOptimizedSpatialHash, calculateOptimalCellSize, estimateMemoryUsage } from "./spatial-hash-utils";
