/**
 * @file Optimized Algorithms API
 * @description Provides unified, performance-optimized API for the algorithms package.
 * It automatically selects optimal algorithms based on workload characteristics and
 * integrates memory pooling for maximum performance.
 *
 * @module algorithms/optimized
 */
import type { SpatialDataType } from "./core/types/spatial-types";
import { type OptimizedCollisionConfig } from "./optimization/adapters/optimized-collision-adapter";
import type { AABB, CollisionPair } from "./algorithms/collision/narrow-phase/aabb/aabb-types";
import { PerformanceMonitor } from "./optimization/monitors/performance-monitor-public";
import { OptimizationConfig } from "./optimization/config/optimization-config-public";
/**
 * Configure the global optimization settings (now immutable and thread-safe)
 * @param config - Partial optimization configuration to apply
 * @example
 * ```typescript
 * await configureOptimization({ enableMemoryPooling: false });
 * ```
 */
export declare function configureOptimization(config: Partial<OptimizedCollisionConfig>): Promise<void>;
/**
 * Detect collisions with automatic algorithm selection and optimization
 *
 * This is the main entry point for collision detection. It automatically:
 * - Analyzes workload characteristics
 * - Selects the optimal algorithm (naive, spatial, or optimized)
 * - Uses memory pooling to eliminate allocation overhead
 * - Monitors performance and adapts as needed
 *
 * @param aabbs Array of AABB objects to check for collisions
 * @returns Array of collision pairs
 *
 * @example
 * ```typescript
 * import { detectCollisions } from 'reynard-algorithms';
 *
 * const aabbs = [
 *   { x: 0, y: 0, width: 100, height: 100 },
 *   { x: 50, y: 50, width: 100, height: 100 }
 * ];
 *
 * const collisions = detectCollisions(aabbs);
 * console.log(`Found ${collisions.length} collisions`);
 * ```
 */
export declare function detectCollisions(aabbs: AABB[]): CollisionPair[];
/**
 * Perform spatial query with optimization
 *
 * @param queryAABB The AABB to query against
 * @param spatialObjects Array of spatial objects
 * @returns Array of nearby objects
 * @example
 * ```typescript
 * const results = performSpatialQuery(queryAABB, objects);
 * ```
 */
export declare function performSpatialQuery<T extends SpatialDataType>(queryAABB: AABB, spatialObjects: Array<{
    aabb: AABB;
    data: T;
}>): Array<{
    aabb: AABB;
    data: T;
}>;
/**
 * Cleanup function to destroy global instances
 * @example
 * ```typescript
 * cleanup();
 * ```
 */
export declare function cleanup(): void;
export { PerformanceMonitor, OptimizationConfig };
//# sourceMappingURL=optimized.d.ts.map