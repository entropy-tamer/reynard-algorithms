/**
 * Memory Pool Core Implementation
 *
 * A high-performance object pooling system that reuses objects to reduce
 * garbage collection pressure and improve performance for high-frequency operations.
 *
 * @module algorithms/performance/memoryPoolCore
 */
export interface PooledObject {
    reset(): void;
}
export interface PerformanceMemoryPoolConfig {
    initialSize?: number;
    maxSize?: number;
    growthFactor?: number;
    enableStats?: boolean;
}
export interface PerformanceMemoryPoolStats {
    created: number;
    acquired: number;
    released: number;
    poolSize: number;
    peakPoolSize: number;
    hitRate: number;
}
/**
 *
 */
export declare class MemoryPool<T extends PooledObject> {
    private pool;
    private createFn;
    private config;
    private stats;
    /**
     *
     * @param createFn
     * @param config
     * @example
     */
    constructor(createFn: () => T, config?: PerformanceMemoryPoolConfig);
    /**
     *
     * @example
     */
    private initializePool;
    /**
     *
     * @example
     */
    acquire(): T;
    /**
     *
     * @param obj
     * @example
     */
    release(obj: T): void;
    /**
     *
     * @example
     */
    private updateHitRate;
    /**
     *
     * @example
     */
    getStats(): PerformanceMemoryPoolStats;
    /**
     *
     * @example
     */
    clear(): void;
    /**
     *
     * @param newSize
     * @example
     */
    resize(newSize: number): void;
}
//# sourceMappingURL=memory-pool-core.d.ts.map