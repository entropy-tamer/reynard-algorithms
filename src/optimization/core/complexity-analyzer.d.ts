/**
 * Complexity Analysis Module
 *
 * Analyzes workload complexity for algorithm selection.
 *
 * @module algorithms/optimization/complexityAnalyzer
 */
import type { WorkloadCharacteristics, ComplexityAnalysis } from "./algorithm-selector-types";
/**
 * Analyzes workload complexity based on PAW findings
 */
export declare class ComplexityAnalyzer {
    /**
     * Calculate workload complexity based on PAW findings
     * @param workload
     * @example
     */
    calculateComplexity(workload: WorkloadCharacteristics): ComplexityAnalysis;
    /**
     * Find crossover point between algorithms
     * @param naiveComplexity
     * @param spatialComplexity
     * @example
     */
    private findCrossoverPoint;
    /**
     * Get complexity-based recommendation
     * @param naive
     * @param spatial
     * @param optimized
     * @example
     */
    private getComplexityRecommendation;
}
//# sourceMappingURL=complexity-analyzer.d.ts.map