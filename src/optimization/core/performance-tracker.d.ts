/**
 * Performance Tracking Module
 *
 * Tracks algorithm performance and selection statistics.
 *
 * @module algorithms/optimization/performanceTracker
 */
import type { PerformanceRecord, SelectionStats, AlgorithmSelection, WorkloadCharacteristics } from "./algorithm-selector-types";
/**
 * Tracks performance metrics and selection statistics
 */
export declare class PerformanceTracker {
    private performanceHistory;
    private selectionStats;
    /**
     * Record algorithm selection for learning
     * @param selection
     * @param _workload
     * @example
     */
    recordSelection(selection: AlgorithmSelection, _workload: WorkloadCharacteristics): void;
    /**
     * Update performance model with new results
     * @param result
     * @example
     */
    updatePerformanceModel(result: PerformanceRecord): void;
    /**
     * Update selection statistics
     * @param _result
     * @example
     */
    private updateSelectionStats;
    /**
     * Get selection statistics
     * @example
     */
    getSelectionStats(): SelectionStats;
    /**
     * Get performance history
     * @example
     */
    getPerformanceHistory(): PerformanceRecord[];
    /**
     * Clear performance history
     * @example
     */
    clearPerformanceHistory(): void;
}
//# sourceMappingURL=performance-tracker.d.ts.map