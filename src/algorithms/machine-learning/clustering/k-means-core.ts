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
import type {
  ElbowMethodResult,
  KMeansConfig,
  KMeansOptions,
  KMeansResult,
  KMeansStats,
  SilhouetteAnalysis,
} from "./k-means-types";
import { DEFAULT_KMEANS_CONFIG } from "./k-means-types";

/**
 * Seeded random number generator.
 */
class SeededRandom {
  private seed: number;

  /**
   *
   * @param seed
   * @example
   */
  constructor(seed?: number) {
    this.seed = seed ?? Math.random() * 0x7fffffff;
  }

  /**
   *
   * @example
   */
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

/**
 * Calculate Euclidean distance between two points.
 * @param p1
 * @param p2
 * @example
 */
function euclideanDistance(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate squared Euclidean distance (faster, avoids sqrt).
 * @param p1
 * @param p2
 * @example
 */
function squaredDistance(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return dx * dx + dy * dy;
}

/**
 * Calculate mean point (centroid) of a set of points.
 * @param points
 * @example
 */
function calculateCentroid(points: Point[]): Point {
  if (points.length === 0) {
    throw new Error("Cannot calculate centroid of empty point set");
  }
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  return {
    x: sumX / points.length,
    y: sumY / points.length,
  };
}

/**
 * Initialize cluster centers using random selection.
 * @param data
 * @param k
 * @param rng
 * @example
 */
function initializeRandom(data: Point[], k: number, rng: SeededRandom): Point[] {
  const indices: number[] = [];
  const centers: Point[] = [];

  while (indices.length < k) {
    const idx = Math.floor(rng.next() * data.length);
    if (!indices.includes(idx)) {
      const point = data[idx];
      if (point && typeof point.x === "number" && typeof point.y === "number") {
        indices.push(idx);
        centers.push({ x: point.x, y: point.y });
      }
    }
  }

  return centers;
}

/**
 * Initialize cluster centers using Forgy method (random points from data).
 * @param data
 * @param k
 * @param rng
 * @example
 */
function initializeForgy(data: Point[], k: number, rng: SeededRandom): Point[] {
  return initializeRandom(data, k, rng);
}

/**
 * Initialize cluster centers using K-Means++ method.
 * K-Means++ selects initial centers to be far apart, improving convergence.
 * @param data
 * @param k
 * @param rng
 * @example
 */
function initializeKMeansPlusPlus(data: Point[], k: number, rng: SeededRandom): Point[] {
  const centers: Point[] = [];
  const n = data.length;

  // Select first center randomly
  const firstIdx = Math.floor(rng.next() * n);
  const firstPoint = data[firstIdx];
  if (firstPoint && typeof firstPoint.x === "number" && typeof firstPoint.y === "number") {
    centers.push({ x: firstPoint.x, y: firstPoint.y });
  } else {
    throw new Error("Invalid data point for initialization");
  }

  // Select remaining centers based on distance to nearest center
  for (let i = 1; i < k; i++) {
    const distances: number[] = [];
    let sumDistances = 0;

    // Calculate distance from each point to nearest existing center
    for (const point of data) {
      let minDist = Infinity;
      for (const center of centers) {
        const dist = squaredDistance(point, center);
        if (dist < minDist) {
          minDist = dist;
        }
      }
      distances.push(minDist);
      sumDistances += minDist;
    }

    // Select point with probability proportional to squared distance
    let random = rng.next() * sumDistances;
    for (let j = 0; j < n; j++) {
      const distance = distances[j];
      if (distance !== undefined) {
        random -= distance;
        if (random <= 0) {
          const point = data[j];
          if (point && typeof point.x === "number" && typeof point.y === "number") {
            centers.push({ x: point.x, y: point.y });
          }
          break;
        }
      }
    }
  }

  return centers;
}

/**
 * Calculate within-cluster sum of squares (WCSS).
 * @param data
 * @param labels
 * @param centroids
 * @example
 */
function calculateWCSS(data: Point[], labels: number[], centroids: Point[]): number {
  let wcss = 0;
  for (let i = 0; i < data.length; i++) {
    const clusterIdx = labels[i];
    if (clusterIdx === undefined) continue;
    const centroid = centroids[clusterIdx];
    const point = data[i];
    if (!centroid || !point) continue;
    wcss += squaredDistance(point, centroid);
  }
  return wcss;
}

/**
 * Calculate between-cluster sum of squares (BCSS).
 * @param data
 * @param labels
 * @param centroids
 * @example
 */
function calculateBCSS(data: Point[], labels: number[], centroids: Point[]): number {
  const overallCentroid = calculateCentroid(data);
  let bcss = 0;
  for (let clusterIdx = 0; clusterIdx < centroids.length; clusterIdx++) {
    const clusterSize = labels.filter(l => l === clusterIdx).length;
    if (clusterSize > 0) {
      const centroid = centroids[clusterIdx];
      if (centroid) {
        bcss += clusterSize * squaredDistance(centroid, overallCentroid);
      }
    }
  }
  return bcss;
}

/**
 * Calculate silhouette score for a single point.
 * @param point
 * @param pointCluster
 * @param data
 * @param labels
 * @param centroids
 * @example
 */
function calculateSilhouetteScore(
  point: Point,
  pointCluster: number,
  data: Point[],
  labels: number[],
  centroids: Point[]
): number {
  // Calculate average distance to points in same cluster (a_i)
  const sameClusterPoints = data.filter((_, i) => labels[i] === pointCluster);
  let a = 0;
  for (const other of sameClusterPoints) {
    a += euclideanDistance(point, other);
  }
  a = sameClusterPoints.length > 1 ? a / (sameClusterPoints.length - 1) : 0;

  // Calculate minimum average distance to other clusters (b_i)
  let minB = Infinity;
  for (let clusterIdx = 0; clusterIdx < centroids.length; clusterIdx++) {
    if (clusterIdx === pointCluster) continue;

    const otherClusterPoints = data.filter((_, i) => labels[i] === clusterIdx);
    if (otherClusterPoints.length === 0) continue;

    let b = 0;
    for (const other of otherClusterPoints) {
      b += euclideanDistance(point, other);
    }
    b /= otherClusterPoints.length;

    if (b < minB) {
      minB = b;
    }
  }

  // Silhouette score: s_i = (b_i - a_i) / max(a_i, b_i)
  if (minB === Infinity) return 0;
  const maxAB = Math.max(a, minB);
  return maxAB > 0 ? (minB - a) / maxAB : 0;
}

/**
 * K-Means clustering algorithm.
 */
export class KMeans {
  private config: KMeansConfig;
  private rng: SeededRandom;

  /**
   * Creates a new KMeans instance.
   * @param config Configuration options.
   * @example
   */
  constructor(config: Partial<KMeansConfig> = {}) {
    this.config = { ...DEFAULT_KMEANS_CONFIG, ...config };
    this.rng = new SeededRandom(this.config.seed);
  }

  /**
   * Validate input data.
   * @param data
   * @example
   */
  private validateInput(data: Point[]): void {
    if (!Array.isArray(data)) {
      throw new Error("Data must be an array");
    }
    if (data.length === 0) {
      throw new Error("Data array cannot be empty");
    }
    const k = this.config.k ?? 3;
    if (k < 1) {
      throw new Error("k must be at least 1");
    }
    if (k > data.length) {
      throw new Error("k cannot be greater than the number of data points");
    }
    for (const point of data) {
      if (typeof point.x !== "number" || typeof point.y !== "number") {
        throw new Error("All points must have numeric x and y coordinates");
      }
      if (!isFinite(point.x) || !isFinite(point.y)) {
        throw new Error("All point coordinates must be finite");
      }
    }
  }

  /**
   * Initialize cluster centers based on the selected method.
   * @param data
   * @example
   */
  private initializeCentroids(data: Point[]): Point[] {
    const k = this.config.k ?? 3;
    const init = this.config.initialization ?? "kmeans++";
    switch (init) {
      case "random":
        return initializeRandom(data, k, this.rng);
      case "forgy":
        return initializeForgy(data, k, this.rng);
      case "kmeans++":
        return initializeKMeansPlusPlus(data, k, this.rng);
      default:
        return initializeKMeansPlusPlus(data, k, this.rng);
    }
  }

  /**
   * Assign each data point to the nearest centroid.
   * @param data
   * @param centroids
   * @example
   */
  private assignClusters(data: Point[], centroids: Point[]): number[] {
    const labels: number[] = [];
    for (const point of data) {
      let minDist = Infinity;
      let nearestCluster = 0;

      for (let i = 0; i < centroids.length; i++) {
        const centroid = centroids[i];
        if (!centroid) continue;
        const dist = squaredDistance(point, centroid);
        if (dist < minDist) {
          minDist = dist;
          nearestCluster = i;
        }
      }

      labels.push(nearestCluster);
    }
    return labels;
  }

  /**
   * Update centroids based on current cluster assignments.
   * @param data
   * @param labels
   * @param k
   * @example
   */
  private updateCentroids(data: Point[], labels: number[], k: number): Point[] {
    const clusters: Point[][] = Array.from({ length: k }, () => []);
    for (let i = 0; i < data.length; i++) {
      const label = labels[i];
      const point = data[i];
      if (label !== undefined && point) {
        const cluster = clusters[label];
        if (cluster) {
          cluster.push(point);
        }
      }
    }

    const newCentroids: Point[] = [];
    for (let i = 0; i < k; i++) {
      const cluster = clusters[i];
      if (!cluster || cluster.length === 0) {
        // Empty cluster - reinitialize randomly
        const randomIdx = Math.floor(this.rng.next() * data.length);
        const randomPoint = data[randomIdx];
        if (randomPoint && typeof randomPoint.x === "number" && typeof randomPoint.y === "number") {
          newCentroids.push({ x: randomPoint.x, y: randomPoint.y });
        } else {
          throw new Error("Invalid data point for centroid reinitialization");
        }
      } else {
        newCentroids.push(calculateCentroid(cluster));
      }
    }

    return newCentroids;
  }

  /**
   * Calculate the maximum change in centroids.
   * @param oldCentroids
   * @param newCentroids
   * @example
   */
  private calculateCentroidChange(oldCentroids: Point[], newCentroids: Point[]): number {
    let maxChange = 0;
    for (let i = 0; i < oldCentroids.length; i++) {
      const oldCentroid = oldCentroids[i];
      const newCentroid = newCentroids[i];
      if (oldCentroid && newCentroid) {
        const change = euclideanDistance(oldCentroid, newCentroid);
        if (change > maxChange) {
          maxChange = change;
        }
      }
    }
    return maxChange;
  }

  /**
   * Perform K-Means clustering on the given data.
   * @param data Array of data points to cluster.
   * @param options Additional options.
   * @returns Clustering result.
   * @example
   */
  cluster(data: Point[], options: Partial<KMeansOptions> = {}): KMeansResult {
    const startTime = performance.now();

    if (this.config.validateInput) {
      this.validateInput(data);
    }

    const k = this.config.k ?? 3;
    const maxIterations = this.config.maxIterations ?? 100;
    const tolerance = this.config.tolerance ?? 1e-6;

    // Initialize centroids
    let centroids = this.initializeCentroids(data);
    let labels: number[] = [];
    let iterations = 0;
    let converged = false;
    let finalChange = 0;

    // Main iteration loop
    for (iterations = 0; iterations < maxIterations; iterations++) {
      // Assign points to nearest centroids
      labels = this.assignClusters(data, centroids);

      // Update centroids
      const newCentroids = this.updateCentroids(data, labels, k);

      // Check for convergence
      finalChange = this.calculateCentroidChange(centroids, newCentroids);
      if (finalChange < tolerance) {
        converged = true;
        centroids = newCentroids;
        break;
      }

      centroids = newCentroids;
    }

    // Reassign labels with final centroids
    labels = this.assignClusters(data, centroids);

    // Build clusters array
    const clusters: Point[][] = Array.from({ length: k }, () => []);
    for (let i = 0; i < data.length; i++) {
      const label = labels[i];
      const point = data[i];
      if (label !== undefined && point) {
        const cluster = clusters[label];
        if (cluster) {
          cluster.push(point);
        }
      }
    }

    // Calculate statistics
    const wcss = calculateWCSS(data, labels, centroids);
    const bcss = calculateBCSS(data, labels, centroids);
    const tss = wcss + bcss; // Total sum of squares = WCSS + BCSS
    const executionTime = performance.now() - startTime;

    const stats: KMeansStats = {
      iterations,
      wcss,
      bcss,
      tss,
      executionTime,
      converged,
      finalChange,
    };

    const result: KMeansResult = {
      centroids,
      labels,
      clusters,
      stats,
    };

    // Compute silhouette scores if requested
    if (options.computeSilhouette) {
      const silhouetteScores: number[] = [];
      for (let i = 0; i < data.length; i++) {
        const point = data[i];
        const label = labels[i];
        if (point && label !== undefined) {
          const score = calculateSilhouetteScore(point, label, data, labels, centroids);
          silhouetteScores.push(score);
        }
      }
      result.silhouetteScores = silhouetteScores;
      result.averageSilhouette = silhouetteScores.reduce((sum, s) => sum + s, 0) / silhouetteScores.length;
    }

    return result;
  }

  /**
   * Perform elbow method analysis to determine optimal k.
   * @param data Array of data points.
   * @param minK Minimum k to test.
   * @param maxK Maximum k to test.
   * @returns Elbow method result.
   * @example
   */
  elbowMethod(data: Point[], minK: number = 1, maxK: number = 10): ElbowMethodResult {
    if (this.config.validateInput) {
      this.validateInput(data);
    }

    const kValues: number[] = [];
    const wcssValues: number[] = [];

    for (let k = minK; k <= maxK && k <= data.length; k++) {
      const tempConfig = { ...this.config, k };
      const tempKMeans = new KMeans(tempConfig);
      const result = tempKMeans.cluster(data);
      kValues.push(k);
      wcssValues.push(result.stats.wcss);
    }

    // Calculate rate of change
    const wcssChange: number[] = [];
    for (let i = 1; i < wcssValues.length; i++) {
      const prev = wcssValues[i - 1];
      const curr = wcssValues[i];
      if (prev !== undefined && curr !== undefined) {
        wcssChange.push(prev - curr);
      }
    }

    // Find elbow point (largest decrease in rate of change)
    let optimalK: number | undefined;
    if (wcssChange.length > 1) {
      let maxChangeIdx = 0;
      for (let i = 1; i < wcssChange.length; i++) {
        const changeI = wcssChange[i];
        const changeMax = wcssChange[maxChangeIdx];
        if (changeI !== undefined && changeMax !== undefined && changeI > changeMax) {
          maxChangeIdx = i;
        }
      }
      const optimalKValue = kValues[maxChangeIdx + 1];
      if (optimalKValue !== undefined) {
        optimalK = optimalKValue;
      }
    }

    const result: ElbowMethodResult = {
      kValues,
      wcssValues,
      wcssChange,
    };
    if (optimalK !== undefined) {
      result.optimalK = optimalK;
    }
    return result;
  }

  /**
   * Perform silhouette analysis.
   * @param data Array of data points.
   * @param labels Cluster assignments.
   * @param centroids Cluster centers.
   * @returns Silhouette analysis result.
   * @example
   */
  silhouetteAnalysis(data: Point[], labels: number[], centroids: Point[]): SilhouetteAnalysis {
    const pointScores: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const point = data[i];
      const label = labels[i];
      if (point && label !== undefined) {
        const score = calculateSilhouetteScore(point, label, data, labels, centroids);
        pointScores.push(score);
      }
    }

    const averageScore = pointScores.reduce((sum, s) => sum + s, 0) / pointScores.length;

    // Calculate per-cluster scores
    const clusterScores: number[] = [];
    for (let clusterIdx = 0; clusterIdx < centroids.length; clusterIdx++) {
      const clusterPoints = pointScores.filter((_, i) => labels[i] === clusterIdx);
      const clusterAvg =
        clusterPoints.length > 0 ? clusterPoints.reduce((sum, s) => sum + s, 0) / clusterPoints.length : 0;
      clusterScores.push(clusterAvg);
    }

    // Interpret score
    let interpretation: "excellent" | "good" | "fair" | "poor";
    if (averageScore >= 0.7) {
      interpretation = "excellent";
    } else if (averageScore >= 0.5) {
      interpretation = "good";
    } else if (averageScore >= 0.25) {
      interpretation = "fair";
    } else {
      interpretation = "poor";
    }

    return {
      pointScores,
      averageScore,
      clusterScores,
      interpretation,
    };
  }
}
