/**
 * Isomap Core Implementation
 *
 * Implementation of Isomap (Isometric Mapping) for non-linear dimensionality reduction.
 * Isomap preserves geodesic distances on the data manifold by:
 * 1. Constructing a k-nearest neighbor graph
 * 2. Computing geodesic distances using shortest paths
 * 3. Applying MDS to the geodesic distance matrix
 *
 * Mathematical Theory:
 * Isomap extends MDS to non-linear manifolds by replacing Euclidean distances
 * with geodesic distances approximated via shortest paths on a k-NN graph.
 * This allows it to capture the intrinsic geometry of non-linear manifolds.
 *
 * @module algorithms/machine-learning/dimensionality-reduction/isomap
 */
import type { IsomapConfig, IsomapResult, IsomapOptions } from "./isomap-types";
/**
 * Isomap Algorithm
 *
 * Non-linear dimensionality reduction that preserves geodesic distances
 * on the data manifold using graph-based shortest paths.
 */
export declare class Isomap {
    private config;
    private graph?;
    /**
     * Create a new Isomap instance
     *
     * @param options Configuration options
     * @example
     */
    constructor(options?: IsomapOptions);
    /**
     * Fit Isomap to data and transform it
     *
     * @param data Input data (n x m), where n is samples and m is features
     * @returns Isomap result with embedding
     * @example
     */
    fitTransform(data: number[][]): IsomapResult;
    /**
     * Update configuration
     *
     * @param config Partial configuration to update
     * @example
     */
    setConfig(config: Partial<IsomapConfig>): void;
    /**
     * Get current configuration
     *
     * @returns Current configuration
     * @example
     */
    getConfig(): IsomapConfig;
    /**
     * Get the k-NN graph used in the last transformation
     *
     * @returns Graph structure
     * @example
     */
    getGraph(): {
        nodes: number;
        edges: Array<{
            from: number;
            to: number;
            weight: number;
        }>;
    } | undefined;
}
//# sourceMappingURL=isomap-core.d.ts.map