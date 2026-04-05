/**
 * Collision Algorithm Selector
 *
 * Selects optimal collision detection algorithms.
 *
 * @module algorithms/optimization/collisionSelector
 */
import type { WorkloadAnalysis, AlgorithmSelection } from "./algorithm-selector-types";
/**
 * Selects optimal collision detection algorithms
 */
export declare class CollisionSelector {
    private static readonly memoizedSquare;
    private static readonly memoizedLog;
    private static readonly memoizedMultiply;
    private static readonly memoizedAdd;
    /**
     *
     * @example
     */
    private getThresholds;
    /**
     * Select optimal collision detection algorithm
     * @param analysis
     * @param t
     * @example
     */
    selectOptimalCollisionAlgorithm(analysis: WorkloadAnalysis, t?: (key: string) => string): AlgorithmSelection;
    /**
     * Select naive collision algorithm for small datasets
     * @param analysis
     * @param t
     * @example
     */
    private selectNaiveAlgorithm;
    /**
     * Select spatial collision algorithm for medium datasets
     * @param analysis
     * @param t
     * @example
     */
    private selectSpatialAlgorithm;
    /**
     * Select optimized collision algorithm for large datasets
     * @param analysis
     * @param t
     * @example
     */
    private selectOptimizedAlgorithm;
}
//# sourceMappingURL=collision-selector.d.ts.map