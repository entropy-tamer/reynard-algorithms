/**
 * Multidimensional Scaling (MDS) Types
 *
 * Type definitions for the Multidimensional Scaling algorithm.
 * MDS is a technique for visualizing similarity or dissimilarity data
 * by finding a low-dimensional representation that preserves distances.
 *
 * @module algorithms/machine-learning/dimensionality-reduction/mds
 */

/**
 * Configuration for MDS algorithm
 */
export interface MDSConfig {
  /** Number of output dimensions */
  dimensions: number;
  /** Whether to use classical MDS (true) or metric MDS (false) */
  classical: boolean;
  /** Maximum number of iterations for metric MDS */
  maxIterations: number;
  /** Convergence tolerance */
  tolerance: number;
}

/**
 * Result of MDS transformation
 */
export interface MDSResult {
  /** Low-dimensional embedding (n x dimensions) */
  embedding: number[][];
  /** Eigenvalues from decomposition (if classical MDS) */
  eigenvalues?: number[];
  /** Stress value (for metric MDS) */
  stress?: number;
  /** Number of iterations performed */
  iterations?: number;
  /** Execution time in milliseconds */
  executionTime: number;
}

/**
 * Options for MDS algorithm
 */
export interface MDSOptions {
  /** Configuration settings */
  config?: Partial<MDSConfig>;
  /** Whether to enable statistics collection */
  enableStats?: boolean;
}

/**
 * Default configuration for MDS
 */
export const DEFAULT_MDS_CONFIG: MDSConfig = {
  dimensions: 2,
  classical: true,
  maxIterations: 1000,
  tolerance: 1e-6,
};
