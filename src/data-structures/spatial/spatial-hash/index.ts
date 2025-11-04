/**
 * Spatial Hashing Algorithm Module
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
 * @file Public entrypoint for the spatial hash module API
 * @module algorithms/spatialHash
 */

// Export all types and interfaces
export * from "./spatial-hash-types";

// Export core implementation
export { SpatialHash } from "./spatial-hash-core";

// Export utility functions
export * from "./spatial-hash-utils";

// Export main class
export { SpatialHash as default } from "./spatial-hash";
