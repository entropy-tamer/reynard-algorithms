/**
 * Multidimensional Scaling (MDS) Core Implementation
 *
 * Implementation of Multidimensional Scaling for dimensionality reduction.
 * MDS takes a distance matrix and finds a low-dimensional embedding that
 * preserves these distances as well as possible.
 *
 * Mathematical Theory:
 * Classical MDS uses eigenvalue decomposition of the double-centered
 * squared distance matrix to find the embedding:
 * 1. Compute squared distance matrix D^2
 * 2. Double-center: B = -0.5 * H * D^2 * H
 * 3. Eigenvalue decomposition: B = V * Λ * V^T
 * 4. Embedding: Y = V_p * sqrt(Λ_p)
 *
 * @module algorithms/machine-learning/dimensionality-reduction/mds
 */
import type { MDSConfig, MDSResult, MDSOptions } from "./mds-types";
/**
 * Multidimensional Scaling Algorithm
 *
 * Transforms high-dimensional data or distance matrices into
 * lower-dimensional representations while preserving distances.
 */
export declare class MDS {
    private config;
    /**
     * Create a new MDS instance
     *
     * @param options Configuration options
     * @example
     */
    constructor(options?: MDSOptions);
    /**
     * Perform MDS transformation from distance matrix
     *
     * @param distanceMatrix Distance matrix (n x n)
     * @returns MDS result with embedding
     * @example
     */
    fitTransform(distanceMatrix: number[][]): MDSResult;
    /**
     * Perform classical MDS using eigenvalue decomposition
     *
     * @param distanceMatrix Distance matrix
     * @param startTime Start time for performance measurement
     * @returns MDS result
     * @example
     */
    private classicalMDS;
    /**
     * Perform metric MDS using iterative optimization
     *
     * This is a simplified implementation. For production use,
     * consider using a more robust optimization algorithm.
     *
     * @param distanceMatrix Distance matrix
     * @param startTime Start time for performance measurement
     * @returns MDS result
     * @example
     */
    private metricMDS;
    /**
     * Update configuration
     *
     * @param config Partial configuration to update
     * @example
     */
    setConfig(config: Partial<MDSConfig>): void;
    /**
     * Get current configuration
     *
     * @returns Current configuration
     * @example
     */
    getConfig(): MDSConfig;
}
//# sourceMappingURL=mds-core.d.ts.map