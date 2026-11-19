/**
 * Memory Pool Utilities
 *
 * Utility functions and factory methods for creating specialized memory pools
 * for common use cases in the algorithms package.
 *
 * @module algorithms/performance/memoryPoolUtils
 */

import type { SpatialObjectData } from "../../core/types/spatial-types";
import type { PerformanceMemoryPoolStats } from "./memory-pool-core";
import { MemoryPool, PerformanceMemoryPoolConfig, PooledObject } from "./memory-pool-core";

/**
 * Create a memory pool for spatial objects
 * @param config
 * @example
 */
export function createSpatialObjectPool(config: PerformanceMemoryPoolConfig = {}) {
  /**
   * Poolable rectangular spatial object with an id, position, size, and data payload.
   */
  class SpatialObject implements PooledObject {
    id: string | number = "";
    x: number = 0;
    y: number = 0;
    width: number = 0;
    height: number = 0;
    data: SpatialObjectData | null = null;

    /**
     * Clears id, position, size, and payload so the object can be reused.
     */
    reset(): void {
      this.id = "";
      this.x = 0;
      this.y = 0;
      this.width = 0;
      this.height = 0;
      this.data = null;
    }
  }

  return new MemoryPool(() => new SpatialObject(), config);
}

/**
 * Create a memory pool for AABB objects
 * @param config
 * @example
 */
export function createAABBPool(config: PerformanceMemoryPoolConfig = {}) {
  /**
   * Poolable axis-aligned bounding box with position and size.
   */
  class AABBObject implements PooledObject {
    x: number = 0;
    y: number = 0;
    width: number = 0;
    height: number = 0;

    /**
     * Zeros position and size so the box can be reused.
     */
    reset(): void {
      this.x = 0;
      this.y = 0;
      this.width = 0;
      this.height = 0;
    }
  }

  return new MemoryPool(() => new AABBObject(), config);
}

/**
 * Create a memory pool for point objects
 * @param config
 * @example
 */
export function createPointPool(config: PerformanceMemoryPoolConfig = {}) {
  /**
   * Poolable 2D point with x and y coordinates.
   */
  class PointObject implements PooledObject {
    x: number = 0;
    y: number = 0;

    /**
     * Zeros both coordinates so the point can be reused.
     */
    reset(): void {
      this.x = 0;
      this.y = 0;
    }
  }

  return new MemoryPool(() => new PointObject(), config);
}

/**
 * Create a memory pool for vector objects
 * @param config
 * @example
 */
export function createVectorPool(config: PerformanceMemoryPoolConfig = {}) {
  /**
   * Poolable 2D vector with components and a cached magnitude.
   */
  class VectorObject implements PooledObject {
    x: number = 0;
    y: number = 0;
    magnitude: number = 0;

    /**
     * Zeros components and magnitude so the vector can be reused.
     */
    reset(): void {
      this.x = 0;
      this.y = 0;
      this.magnitude = 0;
    }
  }

  return new MemoryPool(() => new VectorObject(), config);
}

/**
 * Global memory pool manager for managing multiple pools
 */
export class MemoryPoolManager {
  private pools = new Map<string, MemoryPool<PooledObject>>();

  /**
   * Creates a memory pool and registers it under `name`, replacing any previous entry.
   *
   * @param name Key used to look up the pool later.
   * @param createFn Factory for newly allocated objects.
   * @param config Optional sizing and statistics settings.
   * @returns The newly created pool.
   */
  createPool<T extends PooledObject>(
    name: string,
    createFn: () => T,
    config: PerformanceMemoryPoolConfig = {}
  ): MemoryPool<T> {
    const pool = new MemoryPool(createFn, config);
    this.pools.set(name, pool as MemoryPool<PooledObject>);
    return pool;
  }

  /**
   * Looks up a previously registered pool by name.
   *
   * @param name Key the pool was registered under.
   * @returns The pool, or `undefined` when no pool has that name.
   */
  getPool<T extends PooledObject>(name: string): MemoryPool<T> | undefined {
    return this.pools.get(name) as MemoryPool<T> | undefined;
  }

  /**
   * Unregisters the pool stored under `name`.
   *
   * @param name Key of the pool to remove.
   * @returns `true` when a pool existed and was removed.
   */
  removePool(name: string): boolean {
    return this.pools.delete(name);
  }

  /**
   * Returns a snapshot of every registered pool's statistics keyed by pool name.
   *
   * @returns Name-to-statistics mapping for all current pools.
   */
  getAllStats(): Record<string, PerformanceMemoryPoolStats> {
    const stats: Record<string, PerformanceMemoryPoolStats> = {};
    this.pools.forEach((pool, name) => {
      stats[name] = pool.getStats();
    });
    return stats;
  }

  /**
   * Clears every registered pool, dropping all idle objects while keeping the pools registered.
   */
  clearAllPools(): void {
    this.pools.forEach(pool => {
      pool.clear();
    });
  }
}

// Global instance for convenience
export const globalPoolManager = new MemoryPoolManager();
