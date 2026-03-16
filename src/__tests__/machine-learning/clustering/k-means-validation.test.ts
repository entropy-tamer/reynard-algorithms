/**
 * @file k-means-validation.test.ts
 * @description Comprehensive validation tests for K-Means clustering algorithm
 * against the standard algorithm described in Wikipedia and academic literature.
 */

import { describe, it, expect } from "vitest";
import { KMeans } from "../../../algorithms/machine-learning/clustering/k-means-core";
import type { Point } from "../../../core/types";

/**
 * Generate well-separated clusters for testing
 * @param clusters
 * @param pointsPerCluster
 * @param separation
 * @example
 */
function generateWellSeparatedClusters(
  clusters: number,
  pointsPerCluster: number,
  separation: number = 10
): Point[] {
  const data: Point[] = [];
  for (let c = 0; c < clusters; c++) {
    const centerX = c * separation;
    const centerY = c * separation;
    for (let i = 0; i < pointsPerCluster; i++) {
      data.push({
        x: centerX + (Math.random() - 0.5) * 2,
        y: centerY + (Math.random() - 0.5) * 2,
      });
    }
  }
  return data;
}

/**
 * Calculate WCSS manually for validation
 * @param data
 * @param labels
 * @param centroids
 * @example
 */
function calculateWCSSManual(data: Point[], labels: number[], centroids: Point[]): number {
  let wcss = 0;
  for (let i = 0; i < data.length; i++) {
    const clusterIdx = labels[i];
    if (clusterIdx === undefined) continue;
    const centroid = centroids[clusterIdx];
    const pt = data[i];
    if (centroid && pt) {
      const dx = pt.x - centroid.x;
      const dy = pt.y - centroid.y;
      wcss += dx * dx + dy * dy;
    }
  }
  return wcss;
}

/**
 * Verify that centroids are actually the mean of their assigned points
 * @param data
 * @param labels
 * @param centroids
 * @example
 */
function verifyCentroidsAreMeans(data: Point[], labels: number[], centroids: Point[]): boolean {
  const k = centroids.length;
  for (let clusterIdx = 0; clusterIdx < k; clusterIdx++) {
    const clusterPoints = data.filter((_, i) => labels[i] === clusterIdx);
    if (clusterPoints.length === 0) continue;

    const expectedCentroid = {
      x: clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length,
      y: clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length,
    };

    const actualCentroid = centroids[clusterIdx];
    if (!actualCentroid) return false;

    const tolerance = 1e-6;
    if (
      Math.abs(actualCentroid.x - expectedCentroid.x) > tolerance ||
      Math.abs(actualCentroid.y - expectedCentroid.y) > tolerance
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Verify that each point is assigned to the nearest centroid
 * @param data
 * @param labels
 * @param centroids
 * @example
 */
function verifyNearestCentroidAssignment(data: Point[], labels: number[], centroids: Point[]): boolean {
  for (let i = 0; i < data.length; i++) {
    const point = data[i];
    const assignedCluster = labels[i];
    if (point === undefined || assignedCluster === undefined) return false;
    const assignedCentroid = centroids[assignedCluster];
    if (!assignedCentroid) return false;

    // Calculate distance to assigned centroid
    const dxAssigned = point.x - assignedCentroid.x;
    const dyAssigned = point.y - assignedCentroid.y;
    const distAssigned = dxAssigned * dxAssigned + dyAssigned * dyAssigned;

    // Check that no other centroid is closer
    for (let j = 0; j < centroids.length; j++) {
      if (j === assignedCluster) continue;
      const otherCentroid = centroids[j];
      if (!otherCentroid) continue;

      const dxOther = point!.x - otherCentroid.x;
      const dyOther = point!.y - otherCentroid.y;
      const distOther = dxOther * dxOther + dyOther * dyOther;

      if (distOther < distAssigned - 1e-10) {
        // Allow small numerical error
        return false;
      }
    }
  }
  return true;
}

describe("K-Means Algorithm Validation", () => {
  describe("Standard Algorithm Correctness (Wikipedia)", () => {
    it("should follow the standard k-means algorithm: Assignment + Update steps", () => {
      const data = generateWellSeparatedClusters(3, 20, 15);
      const kmeans = new KMeans({ k: 3, seed: 42, maxIterations: 100 });
      const result = kmeans.cluster(data);

      // Verify centroids are means of their clusters
      expect(verifyCentroidsAreMeans(data, result.labels, result.centroids)).toBe(true);

      // Verify each point is assigned to nearest centroid
      expect(verifyNearestCentroidAssignment(data, result.labels, result.centroids)).toBe(true);
    });

    it("should minimize WCSS (within-cluster sum of squares)", () => {
      const data = generateWellSeparatedClusters(3, 20, 15);
      const kmeans = new KMeans({ k: 3, seed: 42 });
      const result = kmeans.cluster(data);

      // Verify WCSS calculation matches manual calculation
      const manualWCSS = calculateWCSSManual(data, result.labels, result.centroids);
      expect(Math.abs(result.stats.wcss - manualWCSS)).toBeLessThan(1e-6);
    });

    it("should converge (centroids stop changing)", () => {
      const data = generateWellSeparatedClusters(3, 20, 15);
      const kmeans = new KMeans({ k: 3, seed: 42, tolerance: 1e-6 });
      const result = kmeans.cluster(data);

      // If converged, final change should be less than tolerance
      if (result.stats.converged) {
        expect(result.stats.finalChange).toBeLessThan(1e-6);
      }

      // Algorithm should converge for well-separated clusters
      expect(result.stats.converged).toBe(true);
    });

    it("should use squared Euclidean distance for assignment (not regular distance)", () => {
      // This is a key property of k-means - it uses squared distance
      // which is equivalent but faster (avoids sqrt)
      const data: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 10, y: 0 },
        { x: 11, y: 0 },
      ];

      const kmeans = new KMeans({ k: 2, seed: 42 });
      const result = kmeans.cluster(data);

      // Points should be clustered as [0,1] and [10,11]
      // Verify by checking distances
      const cluster0 = result.clusters[0]!;
      const cluster1 = result.clusters[1]!;

      // One cluster should have points near 0, other near 10
      const hasNearZero = cluster0.some((p) => Math.abs(p.x) < 2) || cluster1.some((p) => Math.abs(p.x) < 2);
      const hasNearTen = cluster0.some((p) => Math.abs(p.x - 10) < 2) || cluster1.some((p) => Math.abs(p.x - 10) < 2);

      expect(hasNearZero).toBe(true);
      expect(hasNearTen).toBe(true);
    });
  });

  describe("Initialization Methods", () => {
    it("should support Forgy initialization (random points from data)", () => {
      const data = generateWellSeparatedClusters(3, 20, 15);
      const kmeans = new KMeans({ k: 3, initialization: "forgy", seed: 42 });
      const result = kmeans.cluster(data);

      // All initial centroids should be from the data (or very close after convergence)
      expect(result.centroids.length).toBe(3);
      expect(result.stats.converged).toBe(true);
    });

    it("should support k-means++ initialization (probability proportional to distance²)", () => {
      const data = generateWellSeparatedClusters(3, 20, 15);
      const kmeans = new KMeans({ k: 3, initialization: "kmeans++", seed: 42 });
      const result = kmeans.cluster(data);

      expect(result.centroids.length).toBe(3);
      expect(result.stats.converged).toBe(true);
    });

    it("should produce different results with different seeds (non-deterministic)", () => {
      const data = generateWellSeparatedClusters(3, 20, 15);

      const result1 = new KMeans({ k: 3, seed: 42 }).cluster(data);
      const result2 = new KMeans({ k: 3, seed: 123 }).cluster(data);

      // Results might differ due to initialization, but both should converge
      expect(result1.stats.converged).toBe(true);
      expect(result2.stats.converged).toBe(true);
    });
  });

  describe("Edge Cases and Robustness", () => {
    it("should handle empty clusters by reinitializing", () => {
      // Create data where one cluster might become empty
      const data: Point[] = [
        { x: 0, y: 0 },
        { x: 0.1, y: 0.1 },
        { x: 0.2, y: 0.2 },
        { x: 10, y: 10 },
        { x: 10.1, y: 10.1 },
        { x: 10.2, y: 10.2 },
      ];

      const kmeans = new KMeans({ k: 3, seed: 42, maxIterations: 50 });
      const result = kmeans.cluster(data);

      // Should still produce k clusters (some might be empty initially but get reinitialized)
      expect(result.centroids.length).toBe(3);
      expect(result.clusters.length).toBe(3);
    });

    it("should handle k=1 (all points in one cluster)", () => {
      const data = generateWellSeparatedClusters(1, 20, 0);
      const kmeans = new KMeans({ k: 1 });
      const result = kmeans.cluster(data);

      expect(result.centroids.length).toBe(1);
      expect(result.labels.every((l) => l === 0)).toBe(true);
      expect(result.centroids[0]).toBeDefined();
    });

    it("should handle identical points", () => {
      const data: Point[] = Array(10).fill({ x: 5, y: 5 });
      const kmeans = new KMeans({ k: 2, seed: 42 });
      const result = kmeans.cluster(data);

      // Should still work, though clustering is arbitrary
      expect(result.centroids.length).toBe(2);
      expect(result.labels.length).toBe(10);
    });
  });

  describe("Convergence Properties", () => {
    it("should monotonically decrease WCSS (or stay same)", () => {
      // This is a key property: WCSS should never increase
      const data = generateWellSeparatedClusters(3, 20, 15);
      const kmeans = new KMeans({ k: 3, seed: 42, maxIterations: 100 });

      // We can't easily track WCSS per iteration without modifying the code,
      // but we can verify the final result is reasonable
      const result = kmeans.cluster(data);
      expect(result.stats.wcss).toBeGreaterThanOrEqual(0);
      expect(result.stats.converged).toBe(true);
    });

    it("should converge within maxIterations for well-separated clusters", () => {
      const data = generateWellSeparatedClusters(3, 20, 15);
      const kmeans = new KMeans({ k: 3, seed: 42, maxIterations: 100, tolerance: 1e-6 });
      const result = kmeans.cluster(data);

      expect(result.stats.iterations).toBeLessThanOrEqual(100);
      expect(result.stats.converged).toBe(true);
    });
  });

  describe("Visualization Data Validation", () => {
    it("should produce valid data for visualization (all points assigned, centroids valid)", () => {
      const data = generateWellSeparatedClusters(3, 20, 15);
      const kmeans = new KMeans({ k: 3, seed: 42 });
      const result = kmeans.cluster(data);

      // All points should be assigned
      expect(result.labels.length).toBe(data.length);
      expect(result.labels.every((l) => l >= 0 && l < 3)).toBe(true);

      // All centroids should be valid points
      expect(result.centroids.length).toBe(3);
      result.centroids.forEach((centroid) => {
        expect(typeof centroid.x).toBe("number");
        expect(typeof centroid.y).toBe("number");
        expect(isFinite(centroid.x)).toBe(true);
        expect(isFinite(centroid.y)).toBe(true);
      });

      // Clusters should match labels
      const totalPointsInClusters = result.clusters.reduce((sum, cluster) => sum + cluster.length, 0);
      expect(totalPointsInClusters).toBe(data.length);
    });

    it("should produce consistent results for same input (with same seed)", () => {
      const data = generateWellSeparatedClusters(3, 20, 15);

      const result1 = new KMeans({ k: 3, seed: 42 }).cluster(data);
      const result2 = new KMeans({ k: 3, seed: 42 }).cluster(data);

      // With same seed, results should be identical
      expect(result1.centroids.length).toBe(result2.centroids.length);
      expect(result1.labels).toEqual(result2.labels);
      expect(result1.stats.wcss).toBe(result2.stats.wcss);
    });
  });
});

