/**
 * @module algorithms/machine-learning/clustering/k-means-core
 * @description K-Means clustering algorithm implementation.
 *
 * Mathematical Theory:
 * K-Means is an iterative clustering algorithm that partitions n data points
 * into k clusters by minimizing the within-cluster sum of squares (WCSS):
 *
 * WCSS = Σ(i=1 to k) Σ(x in Ci) ||x - μi||²
 *
 * where:
 * - Ci is the i-th cluster
 * - μi is the centroid (mean) of cluster i
 * - ||x - μi||² is the squared Euclidean distance
 *
 * The algorithm alternates between:
 * 1. Assignment: Assign each point to the nearest centroid
 * 2. Update: Recalculate centroids as the mean of assigned points
 *
 * Convergence occurs when centroids change by less than the tolerance threshold.
 */
import type { Point } from "../../../core/types";
import type { ElbowMethodResult, KMeansConfig, KMeansOptions, KMeansResult, SilhouetteAnalysis } from "./k-means-types";
/**
 * K-Means clustering algorithm.
 */
export declare class KMeans {
    private config;
    private rng;
    /**
     * Creates a new KMeans instance.
     * @param config Configuration options.
     * @example
     */
    constructor(config?: Partial<KMeansConfig>);
    /**
     * Validate input data.
     * @param data
     * @example
     */
    private validateInput;
    /**
     * Initialize cluster centers based on the selected method.
     * @param data
     * @example
     */
    private initializeCentroids;
    /**
     * Assign each data point to the nearest centroid.
     * @param data
     * @param centroids
     * @example
     */
    private assignClusters;
    /**
     * Update centroids based on current cluster assignments.
     * @param data
     * @param labels
     * @param k
     * @example
     */
    private updateCentroids;
    /**
     * Calculate the maximum change in centroids.
     * @param oldCentroids
     * @param newCentroids
     * @example
     */
    private calculateCentroidChange;
    /**
     * Perform K-Means clustering on the given data.
     * @param data Array of data points to cluster.
     * @param options Additional options.
     * @returns Clustering result.
     * @example
     */
    cluster(data: Point[], options?: Partial<KMeansOptions>): KMeansResult;
    /**
     * Perform elbow method analysis to determine optimal k.
     * @param data Array of data points.
     * @param minK Minimum k to test.
     * @param maxK Maximum k to test.
     * @returns Elbow method result.
     * @example
     */
    elbowMethod(data: Point[], minK?: number, maxK?: number): ElbowMethodResult;
    /**
     * Perform silhouette analysis.
     * @param data Array of data points.
     * @param labels Cluster assignments.
     * @param centroids Cluster centers.
     * @returns Silhouette analysis result.
     * @example
     */
    silhouetteAnalysis(data: Point[], labels: number[], centroids: Point[]): SilhouetteAnalysis;
}
//# sourceMappingURL=k-means-core.d.ts.map