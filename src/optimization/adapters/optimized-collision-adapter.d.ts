/**
 * Optimized Collision Detection Adapter
 *
 * This adapter integrates the PAW optimization techniques with collision detection,
 * providing automatic algorithm selection and memory pooling for optimal performance.
 *
 * @module algorithms/optimization/optimizedCollisionAdapter
 */
import { type MemoryPoolConfig, type MemoryPoolStats, type OptimizationRecommendation } from "../core/memory-pool";
import type { AABB, CollisionPair } from "../../algorithms/collision/narrow-phase/aabb/aabb-types";
import { type CollisionPerformanceStats, type PerformanceReport } from "./performance-monitor";
export interface OptimizedCollisionConfig {
    enableMemoryPooling: boolean;
    enableAlgorithmSelection: boolean;
    enablePerformanceMonitoring: boolean;
    memoryPoolConfig?: Partial<MemoryPoolConfig>;
    algorithmSelectionStrategy: "naive" | "spatial" | "optimized" | "adaptive";
    performanceThresholds: {
        maxExecutionTime: number;
        maxMemoryUsage: number;
        minHitRate: number;
    };
}
export type { CollisionPerformanceStats, PerformanceReport } from "./performance-monitor";
/**
 * Optimized collision detection adapter with automatic algorithm selection
 */
export declare class OptimizedCollisionAdapter {
    private algorithmSelector;
    private memoryPool;
    private performanceMonitor;
    private config;
    /**
     *
     * @param config
     * @example
     */
    constructor(config?: Partial<OptimizedCollisionConfig>);
    /**
     *
     * @param aabbs
     * @example
     */
    detectCollisions(aabbs: AABB[]): CollisionPair[];
    /**
     *
     * @param aabbs
     * @example
     */
    private executeNaiveWithPool;
    /**
     *
     * @param aabbs
     * @example
     */
    private executeSpatialDirect;
    /**
     *
     * @param aabbs
     * @example
     */
    private executeOptimizedDirect;
    /**
     *
     * @param a
     * @param b
     * @example
     */
    private checkCollision;
    /**
     *
     * @example
     */
    getPerformanceStats(): CollisionPerformanceStats;
    /**
     * Get current memory usage
     * @example
     */
    private getCurrentMemoryUsage;
    /**
     *
     * @example
     */
    getMemoryPoolStats(): MemoryPoolStats;
    /**
     *
     * @example
     */
    getOptimizationRecommendations(): OptimizationRecommendation[];
    /**
     *
     * @example
     */
    isPerformanceDegraded(): boolean;
    /**
     *
     * @example
     */
    getPerformanceReport(): PerformanceReport;
    /**
     *
     * @example
     */
    resetStatistics(): void;
    /**
     *
     * @example
     */
    destroy(): void;
}
//# sourceMappingURL=optimized-collision-adapter.d.ts.map