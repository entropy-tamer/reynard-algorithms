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
export declare function createSpatialObjectPool(config?: PerformanceMemoryPoolConfig): MemoryPool<{
    id: string | number;
    x: number;
    y: number;
    width: number;
    height: number;
    data: SpatialObjectData | null;
    /**
     *
     * @example
     */
    reset(): void;
}>;
/**
 * Create a memory pool for AABB objects
 * @param config
 * @example
 */
export declare function createAABBPool(config?: PerformanceMemoryPoolConfig): MemoryPool<{
    x: number;
    y: number;
    width: number;
    height: number;
    /**
     *
     * @example
     */
    reset(): void;
}>;
/**
 * Create a memory pool for point objects
 * @param config
 * @example
 */
export declare function createPointPool(config?: PerformanceMemoryPoolConfig): MemoryPool<{
    x: number;
    y: number;
    /**
     *
     * @example
     */
    reset(): void;
}>;
/**
 * Create a memory pool for vector objects
 * @param config
 * @example
 */
export declare function createVectorPool(config?: PerformanceMemoryPoolConfig): MemoryPool<{
    x: number;
    y: number;
    magnitude: number;
    /**
     *
     * @example
     */
    reset(): void;
}>;
/**
 * Global memory pool manager for managing multiple pools
 */
export declare class MemoryPoolManager {
    private pools;
    /**
     *
     * @param name
     * @param createFn
     * @param config
     * @example
     */
    createPool<T extends PooledObject>(name: string, createFn: () => T, config?: PerformanceMemoryPoolConfig): MemoryPool<T>;
    /**
     *
     * @param name
     * @example
     */
    getPool<T extends PooledObject>(name: string): MemoryPool<T> | undefined;
    /**
     *
     * @param name
     * @example
     */
    removePool(name: string): boolean;
    /**
     *
     * @example
     */
    getAllStats(): Record<string, PerformanceMemoryPoolStats>;
    /**
     *
     * @example
     */
    clearAllPools(): void;
}
export declare const globalPoolManager: MemoryPoolManager;
//# sourceMappingURL=memory-pool-utils.d.ts.map