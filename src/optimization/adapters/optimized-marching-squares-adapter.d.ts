/**
 * Optimized Marching Squares Adapter
 *
 * This adapter integrates the PAW optimization techniques with marching squares,
 * providing automatic algorithm selection and memory pooling for optimal performance.
 *
 * @module algorithms/optimization/optimizedMarchingSquaresAdapter
 */
import { type MemoryPoolConfig, type MemoryPoolStats, type OptimizationRecommendation } from "../core/memory-pool";
import type { MarchingSquaresConfig, MarchingSquaresResult } from "../../algorithms/procedural-generation/marching-squares/marching-squares-types";
import { type CollisionPerformanceStats, type PerformanceReport } from "./performance-monitor";
export interface OptimizedMarchingSquaresConfig {
    enableMemoryPooling: boolean;
    enableAlgorithmSelection: boolean;
    enablePerformanceMonitoring: boolean;
    memoryPoolConfig?: Partial<MemoryPoolConfig>;
    algorithmSelectionStrategy: "standard" | "refined-lut" | "adaptive";
    performanceThresholds: {
        maxExecutionTime: number;
        maxMemoryUsage: number;
        minContourAccuracy: number;
    };
    marchingSquaresConfig?: Partial<MarchingSquaresConfig>;
}
export type { CollisionPerformanceStats as MarchingSquaresPerformanceStats, PerformanceReport, } from "./performance-monitor";
/**
 * Optimized marching squares adapter with automatic algorithm selection
 */
export declare class OptimizedMarchingSquaresAdapter {
    private algorithmSelector;
    private memoryPool;
    private performanceMonitor;
    private config;
    private marchingSquares;
    private marchingSquaresLegacy;
    /**
     *
     * @param config
     * @example
     */
    constructor(config?: Partial<OptimizedMarchingSquaresConfig>);
    /**
     * Compute contours from a 2D scalar field with automatic algorithm selection
     * @param grid - 2D array representing the scalar field values
     * @param threshold - Optional threshold override
     * @example
     */
    compute(grid: number[][], threshold?: number): MarchingSquaresResult;
    /**
     * Execute refined LUT algorithm (default, fastest)
     * @param grid
     * @param threshold
     * @example
     */
    private executeRefinedLUT;
    /**
     * Execute refined LUT with interpolation for medium grids
     * @param grid
     * @param threshold
     * @example
     */
    private executeRefinedLUTWithInterpolation;
    /**
     * Execute refined LUT optimized for large grids
     * @param grid
     * @param threshold
     * @example
     */
    private executeRefinedLUTOptimized;
    /**
     * Execute legacy algorithm
     * @param grid
     * @param threshold
     * @example
     */
    private executeLegacy;
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
//# sourceMappingURL=optimized-marching-squares-adapter.d.ts.map