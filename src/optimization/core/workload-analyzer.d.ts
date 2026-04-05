/**
 * Workload Analysis Module
 *
 * Analyzes workload characteristics to determine optimal algorithm selection.
 *
 * @module algorithms/optimization/workloadAnalyzer
 */
import type { WorkloadCharacteristics, WorkloadAnalysis, PerformanceRecord } from "./algorithm-selector-types";
/**
 * Analyzes workload characteristics for algorithm selection
 */
export declare class WorkloadAnalyzer {
    private complexityAnalyzer;
    private memoryAnalyzer;
    private performanceAnalyzer;
    private recommendationGenerator;
    /**
     *
     * @example
     */
    constructor();
    /**
     * Analyze workload characteristics
     * @param workload
     * @example
     */
    analyzeWorkload(workload: WorkloadCharacteristics): WorkloadAnalysis;
    /**
     * Set performance history for analysis
     * @param history
     * @example
     */
    setPerformanceHistory(history: PerformanceRecord[]): void;
}
//# sourceMappingURL=workload-analyzer.d.ts.map