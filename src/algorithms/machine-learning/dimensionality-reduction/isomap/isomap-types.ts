/**
 * Isomap Types
 *
 * Type definitions for the Isomap algorithm.
 * Isomap is a non-linear dimensionality reduction technique that preserves
 * geodesic distances on the data manifold.
 *
 * @module algorithms/machine-learning/dimensionality-reduction/isomap
 */

import type { DistanceMetric } from "../shared/distance-metrics";

/**
 * Configuration for Isomap algorithm
 */
export interface IsomapConfig {
  /** Number of nearest neighbors for k-NN graph */
  k: number;
  /** Number of output dimensions */
  dimensions: number;
  /** Distance metric to use */
  distanceMetric: DistanceMetric;
  /** Whether to check graph connectivity */
  checkConnectivity: boolean;
}

/**
 * Result of Isomap transformation
 */
export interface IsomapResult {
  /** Low-dimensional embedding (n x dimensions) */
  embedding: number[][];
  /** Geodesic distance matrix (n x n) */
  geodesicDistances: number[][];
  /** k-NN graph structure */
  graph?: {
    nodes: number;
    edges: Array<{ from: number; to: number; weight: number }>;
  };
  /** Execution time in milliseconds */
  executionTime: number;
  /** Error message if transformation failed */
  error?: string;
}

/**
 * Options for Isomap algorithm
 */
export interface IsomapOptions {
  /** Configuration settings */
  config?: Partial<IsomapConfig>;
  /** Whether to enable statistics collection */
  enableStats?: boolean;
}

/**
 * Default configuration for Isomap
 */
export const DEFAULT_ISOMAP_CONFIG: IsomapConfig = {
  k: 5,
  dimensions: 2,
  distanceMetric: undefined as any, // Will be set to euclideanDistance in constructor
  checkConnectivity: true,
};
