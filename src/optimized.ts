/**
 * @file Optimized Algorithms API
 * @description Provides unified, performance-optimized API for the algorithms package.
 * It automatically selects optimal algorithms based on workload characteristics and
 * integrates memory pooling for maximum performance.
 *
 * @module algorithms/optimized
 */

import type { SpatialDataType } from "./core/types/spatial-types";

import {
  OptimizedCollisionAdapter,
  type OptimizedCollisionConfig,
} from "./optimization/adapters/optimized-collision-adapter";
import { checkCollision } from "./algorithms/collision/narrow-phase/aabb/aabb-collision";
import type { AABB, CollisionPair } from "./algorithms/collision/narrow-phase/aabb/aabb-types";

import {
  getImmutableOptimizationConfig,
  updateImmutableConfig,
  addConfigChangeListener,
} from "./config/immutable-config";

import { PerformanceMonitor } from "./optimization/monitors/performance-monitor-public";
import { OptimizationConfig } from "./optimization/config/optimization-config-public";

let globalCollisionAdapter: OptimizedCollisionAdapter | null = null;

addConfigChangeListener(event => {
  if (event.changedKeys.some(key => key.startsWith("optimization"))) {
    if (globalCollisionAdapter) {
      globalCollisionAdapter.destroy();
      globalCollisionAdapter = new OptimizedCollisionAdapter(getImmutableOptimizationConfig());
    }
  }
});

/**
 * Validates AABB array input for collision detection
 * @param aabbs - Array of AABB objects to validate
 * @throws {Error} If validation fails
 * @example
 * ```typescript
 * validateAABBs([{ x: 0, y: 0, width: 100, height: 100 }]);
 * ```
 */
function validateAABBs(aabbs: AABB[]): void {
  if (aabbs === null || aabbs === undefined) {
    throw new Error("AABBs array cannot be null or undefined");
  }

  if (!Array.isArray(aabbs)) {
    throw new Error("AABBs must be provided as an array");
  }

  if (aabbs.length < 2) {
    return;
  }

  const maxSafeValue = Number.MAX_SAFE_INTEGER / 2;

  for (let i = 0; i < aabbs.length; i++) {
    const aabb = aabbs[i];

    if (aabb === null || aabb === undefined) {
      throw new Error(`AABB at index ${i} cannot be null or undefined`);
    }

    if (typeof aabb !== "object") {
      throw new Error(`AABB at index ${i} must be an object`);
    }

    const requiredProps = ["x", "y", "width", "height"];
    for (const prop of requiredProps) {
      if (!(prop in aabb)) {
        throw new Error(`AABB at index ${i} is missing required property '${prop}'`);
      }
    }

    if (typeof aabb.x !== "number" || !Number.isFinite(aabb.x)) {
      throw new Error(`AABB at index ${i} has invalid x coordinate: ${aabb.x}`);
    }

    if (typeof aabb.y !== "number" || !Number.isFinite(aabb.y)) {
      throw new Error(`AABB at index ${i} has invalid y coordinate: ${aabb.y}`);
    }

    if (typeof aabb.width !== "number" || !Number.isFinite(aabb.width) || aabb.width < 0) {
      throw new Error(`AABB at index ${i} has invalid width: ${aabb.width}. Width must be a finite number >= 0`);
    }

    if (typeof aabb.height !== "number" || !Number.isFinite(aabb.height) || aabb.height < 0) {
      throw new Error(`AABB at index ${i} has invalid height: ${aabb.height}. Height must be a finite number >= 0`);
    }

    if (
      Math.abs(aabb.x) > maxSafeValue ||
      Math.abs(aabb.y) > maxSafeValue ||
      aabb.width > maxSafeValue ||
      aabb.height > maxSafeValue
    ) {
      console.warn(`AABB at index ${i} has very large coordinate values that may cause precision issues`);
    }
  }
}

/**
 * Configure the global optimization settings (now immutable and thread-safe)
 * @param config - Partial optimization configuration to apply
 * @example
 * ```typescript
 * await configureOptimization({ enableMemoryPooling: false });
 * ```
 */
export async function configureOptimization(config: Partial<OptimizedCollisionConfig>): Promise<void> {
  await updateImmutableConfig(undefined, config);

  if (globalCollisionAdapter) {
    globalCollisionAdapter.destroy();
    globalCollisionAdapter = new OptimizedCollisionAdapter(getImmutableOptimizationConfig());
  }
}

/**
 * Get the global collision adapter instance
 * @returns The global collision adapter instance
 * @example
 * ```typescript
 * const adapter = getGlobalCollisionAdapter();
 * ```
 */
function getGlobalCollisionAdapter(): OptimizedCollisionAdapter {
  if (!globalCollisionAdapter) {
    globalCollisionAdapter = new OptimizedCollisionAdapter(getImmutableOptimizationConfig());
  }
  return globalCollisionAdapter;
}

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
export function detectCollisions(aabbs: AABB[]): CollisionPair[] {
  validateAABBs(aabbs);

  if (aabbs.length < 2) {
    return [];
  }

  const adapter = getGlobalCollisionAdapter();
  return adapter.detectCollisions(aabbs);
}

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
export function performSpatialQuery<T extends SpatialDataType>(
  queryAABB: AABB,
  spatialObjects: Array<{ aabb: AABB; data: T }>
): Array<{ aabb: AABB; data: T }> {
  const nearby: Array<{ aabb: AABB; data: T }> = [];

  for (const obj of spatialObjects) {
    if (checkCollision(queryAABB, obj.aabb).colliding) {
      nearby.push(obj);
    }
  }

  return nearby;
}

/**
 * Cleanup function to destroy global instances
 * @example
 * ```typescript
 * cleanup();
 * ```
 */
export function cleanup(): void {
  if (globalCollisionAdapter) {
    globalCollisionAdapter.destroy();
    globalCollisionAdapter = null;
  }
}

export { PerformanceMonitor, OptimizationConfig };
