/**
 * Intelligent Algorithm Selector
 *
 * Based on PAW optimization findings, this module automatically selects
 * optimal algorithms based on workload characteristics and performance history.
 *
 * @module algorithms/optimization/algorithmSelector
 */
import type { PerformanceRecord, AlgorithmSelection, SelectionStats, WorkloadCharacteristics } from "./algorithm-selector-types";
export type { AlgorithmSelection, WorkloadCharacteristics, PerformanceRecord, SelectionStats, } from "./algorithm-selector-types";
/**
 * Intelligent algorithm selector based on PAW optimization research
 */
export declare class AlgorithmSelector {
    private workloadAnalyzer;
    private algorithmSelectorCore;
    private performanceTracker;
    /**
     *
     * @example
     */
    constructor();
    /**
     * Select optimal collision detection algorithm
     * @param workload
     * @example
     */
    selectCollisionAlgorithm(workload: WorkloadCharacteristics): AlgorithmSelection;
    /**
     * Select optimal spatial algorithm
     * @param workload
     * @example
     */
    selectSpatialAlgorithm(workload: WorkloadCharacteristics): AlgorithmSelection;
    /**
     * Select optimal Union-Find algorithm
     * @param workload
     * @example
     */
    selectUnionFindAlgorithm(workload: WorkloadCharacteristics): AlgorithmSelection;
    /**
     * Select optimal procedural generation algorithm
     * @param workload
     * @example
     */
    selectProceduralAlgorithm(workload: WorkloadCharacteristics): AlgorithmSelection;
    /**
     * Update performance model with new results
     * @param result
     * @example
     */
    updatePerformanceModel(result: PerformanceRecord): void;
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
//# sourceMappingURL=algorithm-selector.d.ts.map