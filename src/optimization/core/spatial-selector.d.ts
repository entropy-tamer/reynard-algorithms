/**
 * Spatial Algorithm Selector
 *
 * Selects optimal spatial algorithms.
 *
 * @module algorithms/optimization/spatialSelector
 */
import type { WorkloadAnalysis, AlgorithmSelection } from "./algorithm-selector-types";
/**
 * Selects optimal spatial algorithms
 */
export declare class SpatialSelector {
    /**
     * Select optimal spatial algorithm
     * @param analysis
     * @param t
     * @example
     */
    selectOptimalSpatialAlgorithm(analysis: WorkloadAnalysis, t?: (key: string) => string): AlgorithmSelection;
}
//# sourceMappingURL=spatial-selector.d.ts.map