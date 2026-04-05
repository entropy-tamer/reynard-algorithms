/**
 * Procedural Generation Algorithm Selector
 *
 * Selects optimal marching squares implementations based on workload characteristics.
 *
 * @module algorithms/optimization/proceduralSelector
 */
import type { WorkloadAnalysis, AlgorithmSelection } from "./algorithm-selector-types";
/**
 * Selects optimal procedural generation algorithms (marching squares)
 */
export declare class ProceduralSelector {
    private static readonly memoizedSquare;
    private static readonly memoizedMultiply;
    /**
     * Select optimal marching squares algorithm based on workload
     * @param analysis
     * @param t
     * @example
     */
    selectOptimalProceduralAlgorithm(analysis: WorkloadAnalysis, t?: (key: string) => string): AlgorithmSelection;
    /**
     * Select refined LUT algorithm for small grids
     * @param analysis
     * @param t
     * @example
     */
    private selectRefinedLUTAlgorithm;
    /**
     * Select refined LUT with interpolation for medium grids
     * @param analysis
     * @param t
     * @example
     */
    private selectRefinedLUTWithInterpolation;
    /**
     * Select refined LUT with optimization for large grids
     * @param analysis
     * @param t
     * @example
     */
    private selectRefinedLUTWithOptimization;
}
//# sourceMappingURL=procedural-selector.d.ts.map