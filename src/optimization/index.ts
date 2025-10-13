/**
 * PAW Optimization Framework
 *
 * This module provides the unified optimization layer for the algorithms package,
 * integrating memory pooling, intelligent algorithm selection, and performance monitoring
 * based on the PAW optimization research findings.
 *
 * @module algorithms/optimization
 */

// Core optimization components
export { AlgorithmSelector, type AlgorithmSelection, type WorkloadCharacteristics } from "./core/algorithm-selector";
export {
  MemoryPool,
  type MemoryPoolConfig,
  type MemoryPoolStats,
  type OptimizationRecommendation,
} from "./core/memory-pool";

// Optimized algorithm adapters
export {
  OptimizedCollisionAdapter,
  type CollisionPerformanceStats,
  type OptimizedCollisionConfig,
} from "./adapters/optimized-collision-adapter";

// Legacy optimizations removed - use OptimizedCollisionAdapter instead

// Re-export types for convenience
export type { AABB, CollisionPair, CollisionResult } from "../geometry/collision/aabb/aabb-types";
// export type { SpatialHash } from "../spatial-structures/spatial-hash/spatial-structures/spatial-hash-core"; // Removed to avoid overriding class export
export { UnionFind } from "../data-structures/union-find/union-find-core";
