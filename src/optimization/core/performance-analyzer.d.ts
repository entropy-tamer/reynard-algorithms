/**
 * Performance Analysis Module
 *
 * Analyzes performance profiles from historical data.
 *
 * @module algorithms/optimization/performanceAnalyzer
 */
import type { WorkloadCharacteristics, PerformanceProfile, PerformanceRecord } from "./algorithm-selector-types";
/**
 * Analyzes performance profiles from historical data
 */
export declare class PerformanceAnalyzer {
    private performanceHistory;
    /**
     * Get performance profile from historical data
     * @param workload
     * @example
     */
    getPerformanceProfile(workload: WorkloadCharacteristics): PerformanceProfile;
    /**
     * Find similar workloads in performance history
     * @param workload
     * @example
     */
    private findSimilarWorkloads;
    /**
     * Calculate similarity between workloads
     * @param workload1
     * @param workload2
     * @example
     */
    private calculateWorkloadSimilarity;
    /**
     * Calculate average performance from historical data
     * @param records
     * @example
     */
    private calculateAveragePerformance;
    /**
     * Get default performance estimates
     * @param workload
     * @example
     */
    private getDefaultPerformance;
    /**
     * Set performance history for analysis
     * @param history
     * @example
     */
    setPerformanceHistory(history: PerformanceRecord[]): void;
}
//# sourceMappingURL=performance-analyzer.d.ts.map