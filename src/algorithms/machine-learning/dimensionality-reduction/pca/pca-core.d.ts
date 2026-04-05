/**
 * Principal Component Analysis (PCA) Core Implementation
 *
 * Implementation of Principal Component Analysis for dimensionality reduction.
 * PCA finds the directions of maximum variance in the data and projects
 * the data onto these directions.
 *
 * Mathematical Theory:
 * 1. Center the data: X_centered = X - mean(X)
 * 2. Compute covariance matrix: C = (1/(n-1)) * X_centered^T * X_centered
 * 3. Eigenvalue decomposition: C = V * Λ * V^T
 * 4. Project: Y = X_centered * V_p
 *
 * @module algorithms/machine-learning/dimensionality-reduction/pca
 */
import type { PCAConfig, PCAOptions, PCAResult } from "./pca-types";
/**
 * Principal Component Analysis Algorithm
 *
 * Performs linear dimensionality reduction by finding the principal
 * components (directions of maximum variance) in the data.
 */
export declare class PCA {
    private config;
    private mean?;
    private scale?;
    private components?;
    private explainedVariance?;
    /**
     * Create a new PCA instance
     *
     * @param options Configuration options
     * @example
     */
    constructor(options?: PCAOptions);
    /**
     * Fit PCA to data and transform it
     *
     * @param data Input data (n x m), where n is samples and m is features
     * @returns PCA result with transformed data
     * @example
     */
    fitTransform(data: number[][]): PCAResult;
    /**
     * Transform new data using fitted PCA
     *
     * @param data New data to transform
     * @returns Transformed data
     * @example
     */
    transform(data: number[][]): number[][];
    /**
     * Update configuration
     *
     * @param config Partial configuration to update
     * @example
     */
    setConfig(config: Partial<PCAConfig>): void;
    /**
     * Get current configuration
     *
     * @returns Current configuration
     * @example
     */
    getConfig(): PCAConfig;
    /**
     * Get fitted components
     *
     * @returns Principal components
     * @example
     */
    getComponents(): number[][] | undefined;
    /**
     * Get explained variance
     *
     * @returns Explained variance for each component
     * @example
     */
    getExplainedVariance(): number[] | undefined;
}
//# sourceMappingURL=pca-core.d.ts.map