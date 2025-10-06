/**
 * Memory Pool Utilities
 *
 * Utility functions and factory methods for creating specialized memory pools
 * for common use cases in the algorithms package.
 *
 * @module algorithms/performance/memoryPoolUtils
 */

import type { SpatialObjectData } from "../types/spatial-types";
import type { PerformanceMemoryPoolStats } from "./memory-pool-core";
import { MemoryPool, PerformanceMemoryPoolConfig, PooledObject } from "./memory-pool-core";

/**
 * Create a memory pool for spatial objects
 */
export function createSpatialObjectPool(config: PerformanceMemoryPoolConfig = {}) {
  class SpatialObject implements PooledObject {
    id: string | number = "";
    x: number = 0;
    y: number = 0;
    width: number = 0;
    height: number = 0;
    data: SpatialObjectData | null = null;

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
 */
export function createAABBPool(config: PerformanceMemoryPoolConfig = {}) {
  class AABBObject implements PooledObject {
    x: number = 0;
    y: number = 0;
    width: number = 0;
    height: number = 0;

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
 */
export function createPointPool(config: PerformanceMemoryPoolConfig = {}) {
  class PointObject implements PooledObject {
    x: number = 0;
    y: number = 0;

    reset(): void {
      this.x = 0;
      this.y = 0;
    }
  }

  return new MemoryPool(() => new PointObject(), config);
}

/**
 * Create a memory pool for vector objects
 */
export function createVectorPool(config: PerformanceMemoryPoolConfig = {}) {
  class VectorObject implements PooledObject {
    x: number = 0;
    y: number = 0;
    magnitude: number = 0;

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

  createPool<T extends PooledObject>(
    name: string,
    createFn: () => T,
    config: PerformanceMemoryPoolConfig = {}
  ): MemoryPool<T> {
    const pool = new MemoryPool(createFn, config);
    this.pools.set(name, pool as MemoryPool<PooledObject>);
    return pool;
  }

  getPool<T extends PooledObject>(name: string): MemoryPool<T> | undefined {
    return this.pools.get(name) as MemoryPool<T> | undefined;
  }

  removePool(name: string): boolean {
    return this.pools.delete(name);
  }

  getAllStats(): Record<string, PerformanceMemoryPoolStats> {
    const stats: Record<string, PerformanceMemoryPoolStats> = {};
    this.pools.forEach((pool, name) => {
      stats[name] = pool.getStats();
    });
    return stats;
  }

  clearAllPools(): void {
    this.pools.forEach(pool => {
      pool.clear();
    });
  }
}

// Global instance for convenience
export const globalPoolManager = new MemoryPoolManager();
