/**
 * @file k-means-types.ts
 * @module algorithms/machine-learning/clustering/k-means-types
 * @description Type definitions for K-Means clustering algorithm.
 */

import type { Point } from "../../../core/types";

/**
 * Configuration options for K-Means clustering.
 */
export interface KMeansConfig {
  /**
   * Number of clusters to generate.
   * @default 3
   */
  k?: number;
  /**
   * Maximum number of iterations.
   * @default 100
   */
  maxIterations?: number;
  /**
   * Convergence threshold (minimum change in cluster centers).
   * @default 1e-6
   */
  tolerance?: number;
  /**
   * Initialization method for cluster centers.
   * @default 'kmeans++'
   */
  initialization?: 'random' | 'kmeans++' | 'forgy';
  /**
   * Random seed for reproducible results.
   * @default undefined (uses Math.random)
   */
  seed?: number | undefined;
  /**
   * Whether to validate input data.
   * @default true
   */
  validateInput?: boolean;
}

/**
 * Statistics about the clustering process.
 */
export interface KMeansStats {
  /**
   * Number of iterations performed.
   */
  iterations: number;
  /**
   * Final within-cluster sum of squares (WCSS).
   */
  wcss: number;
  /**
   * Between-cluster sum of squares (BCSS).
   */
  bcss: number;
  /**
   * Total sum of squares (TSS).
   */
  tss: number;
  /**
   * Execution time in milliseconds.
   */
  executionTime: number;
  /**
   * Whether the algorithm converged.
   */
  converged: boolean;
  /**
   * Final change in cluster centers.
   */
  finalChange: number;
}

/**
 * Result of K-Means clustering.
 */
export interface KMeansResult {
  /**
   * Cluster centers (centroids).
   */
  centroids: Point[];
  /**
   * Cluster assignments for each data point (index corresponds to input data).
   */
  labels: number[];
  /**
   * Data points grouped by cluster.
   */
  clusters: Point[][];
  /**
   * Statistics about the clustering process.
   */
  stats: KMeansStats;
  /**
   * Silhouette scores for each point (if computed).
   */
  silhouetteScores?: number[];
  /**
   * Average silhouette score.
   */
  averageSilhouette?: number;
}

/**
 * Options for K-Means clustering.
 */
export interface KMeansOptions extends Partial<KMeansConfig> {
  /**
   * Whether to compute silhouette scores.
   * @default false
   */
  computeSilhouette?: boolean;
  /**
   * Whether to compute elbow method data.
   * @default false
   */
  computeElbow?: boolean;
}

/**
 * Elbow method result for determining optimal k.
 */
export interface ElbowMethodResult {
  /**
   * Tested k values.
   */
  kValues: number[];
  /**
   * WCSS values for each k.
   */
  wcssValues: number[];
  /**
   * Suggested optimal k (elbow point).
   */
  optimalK?: number;
  /**
   * Rate of change in WCSS.
   */
  wcssChange: number[];
}

/**
 * Silhouette analysis result.
 */
export interface SilhouetteAnalysis {
  /**
   * Silhouette score for each point.
   */
  pointScores: number[];
  /**
   * Average silhouette score.
   */
  averageScore: number;
  /**
   * Per-cluster average silhouette scores.
   */
  clusterScores: number[];
  /**
   * Interpretation of the score.
   */
  interpretation: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * Default K-Means configuration.
 */
export const DEFAULT_KMEANS_CONFIG: KMeansConfig = {
  k: 3,
  maxIterations: 100,
  tolerance: 1e-6,
  initialization: 'kmeans++',
  seed: undefined,
  validateInput: true,
};

