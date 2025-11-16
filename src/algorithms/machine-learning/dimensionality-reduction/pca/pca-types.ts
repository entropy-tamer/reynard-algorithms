/**
 * Principal Component Analysis (PCA) Types
 *
 * Type definitions for the PCA algorithm.
 * PCA is a linear dimensionality reduction technique that finds
 * the directions of maximum variance in high-dimensional data.
 *
 * @module algorithms/machine-learning/dimensionality-reduction/pca
 */

/**
 * Configuration for PCA algorithm
 */
export interface PCAConfig {
  /** Number of principal components to extract */
  components: number;
  /** Whether to center the data (subtract mean) */
  center: boolean;
  /** Whether to scale the data (divide by standard deviation) */
  scale: boolean;
}

/**
 * Result of PCA transformation
 */
export interface PCAResult {
  /** Transformed data (n x components) */
  transformed: number[][];
  /** Principal components (components x features) */
  components: number[][];
  /** Explained variance for each component */
  explainedVariance: number[];
  /** Explained variance ratio for each component */
  explainedVarianceRatio: number[];
  /** Mean of original data (if centered) */
  mean?: number[];
  /** Standard deviation of original data (if scaled) */
  scale?: number[];
  /** Execution time in milliseconds */
  executionTime: number;
}

/**
 * Options for PCA algorithm
 */
export interface PCAOptions {
  /** Configuration settings */
  config?: Partial<PCAConfig>;
  /** Whether to enable statistics collection */
  enableStats?: boolean;
}

/**
 * Default configuration for PCA
 */
export const DEFAULT_PCA_CONFIG: PCAConfig = {
  components: 2,
  center: true,
  scale: false,
};
