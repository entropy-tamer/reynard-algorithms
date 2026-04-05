/**
 * Core Algorithm Selection Logic
 *
 * Contains the core algorithm selection algorithms for different types.
 *
 * @module algorithms/optimization/algorithmSelectorCore
 */
import type { WorkloadAnalysis, AlgorithmSelection } from "./algorithm-selector-types";
/**
 * Core algorithm selection logic
 */
export declare class AlgorithmSelectorCore {
    private collisionSelector;
    private spatialSelector;
    private unionFindSelector;
    private proceduralSelector;
    /**
     *
     * @example
     */
    constructor();
    /**
     * Select optimal collision detection algorithm
     * @param analysis
     * @param t
     * @example
     */
    selectOptimalCollisionAlgorithm(analysis: WorkloadAnalysis, t?: (key: string) => string): AlgorithmSelection;
    /**
     * Select optimal spatial algorithm
     * @param analysis
     * @param t
     * @example
     */
    selectOptimalSpatialAlgorithm(analysis: WorkloadAnalysis, t?: (key: string) => string): AlgorithmSelection;
    /**
     * Select optimal Union-Find algorithm
     * @param analysis
     * @example
     */
    selectOptimalUnionFindAlgorithm(analysis: WorkloadAnalysis): AlgorithmSelection;
    /**
     * Select optimal procedural generation algorithm
     * @param analysis
     * @param t
     * @example
     */
    selectOptimalProceduralAlgorithm(analysis: WorkloadAnalysis, t?: (key: string) => string): AlgorithmSelection;
}
//# sourceMappingURL=algorithm-selector-core.d.ts.map