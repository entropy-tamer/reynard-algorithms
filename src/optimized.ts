/**
 * Optimized Algorithms API
 *
 * This module provides the unified, performance-optimized API for the algorithms package.
 * It automatically selects optimal algorithms based on workload characteristics and
 * integrates memory pooling for maximum performance.
 *
 * @module algorithms/optimized
 */

import type { SpatialDataType } from "./types/spatial-types";

import {
  OptimizedCollisionAdapter,
  type OptimizedCollisionConfig,
} from "./optimization/adapters/optimized-collision-adapter";
// import { AlgorithmSelector } from "./optimization/core/algorithm-selector";
// import type { WorkloadCharacteristics } from "./optimization/core/algorithm-selector-types";
// import { MemoryPool } from "./optimization/core/enhanced-memory-pool";
import { checkCollision } from "./geometry/collision/aabb/aabb-collision";
import type { AABB, CollisionPair } from "./geometry/collision/aabb/aabb-types";

import { getImmutableOptimizationConfig, updateImmutableConfig, addConfigChangeListener } from './config/immutable-config';

// Provide a local default optimization config matching adapter defaults
const DEFAULT_OPTIMIZATION_CONFIG: OptimizedCollisionConfig = {
  enableMemoryPooling: true,
  enableAlgorithmSelection: true,
  enablePerformanceMonitoring: true,
  memoryPoolConfig: undefined,
  algorithmSelectionStrategy: "adaptive",
  performanceThresholds: {
    maxExecutionTime: 16,
    maxMemoryUsage: 50 * 1024 * 1024,
    minHitRate: 90,
  },
};

// Global instances
let globalCollisionAdapter: OptimizedCollisionAdapter | null = null;

// Initialize configuration change listener
addConfigChangeListener((event) => {
  if (event.changedKeys.some(key => key.startsWith('optimization'))) {
    // Reinitialize global collision adapter when optimization config changes
    if (globalCollisionAdapter) {
      globalCollisionAdapter.destroy();
      globalCollisionAdapter = new OptimizedCollisionAdapter(getImmutableOptimizationConfig());
    }
  }
});
// let globalMemoryPool: MemoryPool | null = null;
// let globalAlgorithmSelector: AlgorithmSelector | null = null;

/**
 * Configure the global optimization settings (now immutable and thread-safe)
 * @param config
 * @example
 */
export async function configureOptimization(config: Partial<OptimizedCollisionConfig>): Promise<void> {
  await updateImmutableConfig(undefined, config);

  // Reinitialize global instances if they exist
  if (globalCollisionAdapter) {
    globalCollisionAdapter.destroy();
    globalCollisionAdapter = new OptimizedCollisionAdapter(getImmutableOptimizationConfig());
  }
}

/**
 * Get the global collision adapter instance
 * @example
 */
function getGlobalCollisionAdapter(): OptimizedCollisionAdapter {
  if (!globalCollisionAdapter) {
    globalCollisionAdapter = new OptimizedCollisionAdapter(getImmutableOptimizationConfig());
  }
  return globalCollisionAdapter;
}

/**
 * Get the global memory pool instance
 */
// function getGlobalMemoryPool(): MemoryPool {
//   if (!globalMemoryPool) {
//     globalMemoryPool = new MemoryPool();
//   }
//   return globalMemoryPool;
// }

/**
 * Get the global algorithm selector instance
 */
// function getGlobalAlgorithmSelector(): AlgorithmSelector {
//   if (!globalAlgorithmSelector) {
//     globalAlgorithmSelector = new AlgorithmSelector();
//   }
//   return globalAlgorithmSelector;
// }

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
  // Comprehensive input validation
  if (aabbs === null || aabbs === undefined) {
    throw new Error('AABBs array cannot be null or undefined');
  }
  
  if (!Array.isArray(aabbs)) {
    throw new Error('AABBs must be provided as an array');
  }
  
  if (aabbs.length === 0) {
    return [];
  }
  
  if (aabbs.length === 1) {
    return [];
  }
  
  // Validate each AABB in the array
  for (let i = 0; i < aabbs.length; i++) {
    const aabb = aabbs[i];
    
    if (aabb === null || aabb === undefined) {
      throw new Error(`AABB at index ${i} cannot be null or undefined`);
    }
    
    if (typeof aabb !== 'object') {
      throw new Error(`AABB at index ${i} must be an object`);
    }
    
    // Validate required properties
    const requiredProps = ['x', 'y', 'width', 'height'];
    for (const prop of requiredProps) {
      if (!(prop in aabb)) {
        throw new Error(`AABB at index ${i} is missing required property '${prop}'`);
      }
    }
    
    // Validate property types and values
    if (typeof aabb.x !== 'number' || !Number.isFinite(aabb.x)) {
      throw new Error(`AABB at index ${i} has invalid x coordinate: ${aabb.x}`);
    }
    
    if (typeof aabb.y !== 'number' || !Number.isFinite(aabb.y)) {
      throw new Error(`AABB at index ${i} has invalid y coordinate: ${aabb.y}`);
    }
    
    if (typeof aabb.width !== 'number' || !Number.isFinite(aabb.width) || aabb.width < 0) {
      throw new Error(`AABB at index ${i} has invalid width: ${aabb.width}. Width must be a finite number >= 0`);
    }
    
    if (typeof aabb.height !== 'number' || !Number.isFinite(aabb.height) || aabb.height < 0) {
      throw new Error(`AABB at index ${i} has invalid height: ${aabb.height}. Height must be a finite number >= 0`);
    }
    
    // Check for very large values that might cause precision issues
    const maxSafeValue = Number.MAX_SAFE_INTEGER / 2;
    if (Math.abs(aabb.x) > maxSafeValue || Math.abs(aabb.y) > maxSafeValue ||
        aabb.width > maxSafeValue || aabb.height > maxSafeValue) {
      console.warn(`AABB at index ${i} has very large coordinate values that may cause precision issues`);
    }
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
 */
export function performSpatialQuery<T extends SpatialDataType>(
  queryAABB: AABB,
  spatialObjects: Array<{ aabb: AABB; data: T }>
): Array<{ aabb: AABB; data: T }> {
  // This would be implemented with the spatial query adapter
  // For now, return a simple implementation
  const nearby: Array<{ aabb: AABB; data: T }> = [];

  for (const obj of spatialObjects) {
    if (checkCollision(queryAABB, obj.aabb).colliding) {
      nearby.push(obj);
    }
  }

  return nearby;
}

// findConnectedComponents is exported from the data-structures/union-find module

// checkCollision is exported from the geometry module

/**
 * Performance monitoring and optimization
 */
export class PerformanceMonitor {
  private adapter: OptimizedCollisionAdapter;

  /**
   *
   * @example
   */
  constructor() {
    this.adapter = getGlobalCollisionAdapter();
  }

  /**
   * Get current performance statistics
   * @example
   */
  getPerformanceStats() {
    return this.adapter.getPerformanceStats();
  }

  /**
   * Get memory pool statistics
   * @example
   */
  getMemoryPoolStats() {
    return this.adapter.getMemoryPoolStats();
  }

  /**
   * Get optimization recommendations
   * @example
   */
  getOptimizationRecommendations() {
    return this.adapter.getOptimizationRecommendations();
  }

  /**
   * Check if performance is degraded
   * @example
   */
  isPerformanceDegraded(): boolean {
    return this.adapter.isPerformanceDegraded();
  }

  /**
   * Get comprehensive performance report
   * @example
   */
  getPerformanceReport() {
    return this.adapter.getPerformanceReport();
  }

  /**
   * Reset performance statistics
   * @example
   */
  resetStatistics(): void {
    this.adapter.resetStatistics();
  }
}

/**
 * Optimization configuration management
 */
export class OptimizationConfig {
  private config: OptimizedCollisionConfig;

  /**
   *
   * @param config
   * @example
   */
  constructor(config: Partial<OptimizedCollisionConfig> = {}) {
    this.config = { ...DEFAULT_OPTIMIZATION_CONFIG, ...config };
  }

  /**
   * Update configuration
   * @param config
   * @example
   */
  update(config: Partial<OptimizedCollisionConfig>): void {
    this.config = { ...this.config, ...config };
    configureOptimization(this.config);
  }

  /**
   * Get current configuration
   * @example
   */
  getConfig(): OptimizedCollisionConfig {
    return { ...this.config };
  }

  /**
   * Enable memory pooling
   * @example
   */
  enableMemoryPooling(): void {
    this.update({ enableMemoryPooling: true });
  }

  /**
   * Disable memory pooling
   * @example
   */
  disableMemoryPooling(): void {
    this.update({ enableMemoryPooling: false });
  }

  /**
   * Enable algorithm selection
   * @example
   */
  enableAlgorithmSelection(): void {
    this.update({ enableAlgorithmSelection: true });
  }

  /**
   * Disable algorithm selection
   * @example
   */
  disableAlgorithmSelection(): void {
    this.update({ enableAlgorithmSelection: false });
  }

  /**
   * Set algorithm selection strategy
   * @param strategy
   * @example
   */
  setAlgorithmStrategy(strategy: "naive" | "spatial" | "optimized" | "adaptive"): void {
    this.update({ algorithmSelectionStrategy: strategy });
  }

  /**
   * Set performance thresholds
   * @param thresholds
   * @param thresholds.maxExecutionTime
   * @param thresholds.maxMemoryUsage
   * @param thresholds.minHitRate
   * @example
   */
  setPerformanceThresholds(thresholds: {
    maxExecutionTime?: number;
    maxMemoryUsage?: number;
    minHitRate?: number;
  }): void {
    this.update({
      performanceThresholds: {
        ...this.config.performanceThresholds,
        ...thresholds,
      },
    });
  }
}

// AlgorithmSelector is exported from the optimization module

// MemoryPool is exported from the optimization module

/**
 * Cleanup function to destroy global instances
 * @example
 */
export function cleanup(): void {
  if (globalCollisionAdapter) {
    globalCollisionAdapter.destroy();
    globalCollisionAdapter = null;
  }

  // Note: globalMemoryPool and globalAlgorithmSelector are not currently used
  // but kept for future functionality
}

// Note: Types are exported from the optimization module to avoid conflicts
