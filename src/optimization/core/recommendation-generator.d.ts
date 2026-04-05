/**
 * Recommendation Generator Module
 *
 * Generates optimization recommendations based on workload analysis.
 *
 * @module algorithms/optimization/recommendationGenerator
 */
import type { WorkloadCharacteristics, ComplexityAnalysis, MemoryPressureAnalysis } from "./algorithm-selector-types";
/**
 * Generates optimization recommendations
 */
export declare class RecommendationGenerator {
    /**
     * Generate optimization recommendations
     * @param workload
     * @param _complexity
     * @param memoryPressure
     * @example
     */
    generateRecommendations(workload: WorkloadCharacteristics, _complexity: ComplexityAnalysis, memoryPressure: MemoryPressureAnalysis): string[];
}
//# sourceMappingURL=recommendation-generator.d.ts.map