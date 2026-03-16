/**
 * @file k-means.test.ts
 * @description Tests for K-Means clustering algorithm.
 */

import { describe, it, expect } from "vitest";
import { KMeans } from "../../../algorithms/machine-learning/clustering/k-means-core";
import type { Point } from "../../../core/types";

describe("KMeans", () => {
  describe("Basic clustering", () => {
    it("should cluster simple 2D data", () => {
      const data: Point[] = [
        { x: 1, y: 1 },
        { x: 1.5, y: 1.5 },
        { x: 2, y: 2 },
        { x: 10, y: 10 },
        { x: 10.5, y: 10.5 },
        { x: 11, y: 11 },
      ];

      const kmeans = new KMeans({ k: 2 });
      const result = kmeans.cluster(data);

      expect(result.centroids).toHaveLength(2);
      expect(result.labels).toHaveLength(6);
      expect(result.clusters).toHaveLength(2);
      expect(result.stats.converged).toBe(true);
    });

    it("should handle k=1 (single cluster)", () => {
      const data: Point[] = [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
      ];

      const kmeans = new KMeans({ k: 1 });
      const result = kmeans.cluster(data);

      expect(result.centroids).toHaveLength(1);
      expect(result.labels.every((l) => l === 0)).toBe(true);
    });

    it("should use k-means++ initialization by default", () => {
      const data: Point[] = Array.from({ length: 20 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));

      const kmeans = new KMeans({ k: 3, seed: 42 });
      const result = kmeans.cluster(data);

      expect(result.centroids).toHaveLength(3);
      expect(result.stats.converged).toBe(true);
    });
  });

  describe("Elbow method", () => {
    it("should find optimal k using elbow method", () => {
      const data: Point[] = [
        ...Array.from({ length: 10 }, () => ({ x: Math.random() * 2, y: Math.random() * 2 })),
        ...Array.from({ length: 10 }, () => ({ x: Math.random() * 2 + 10, y: Math.random() * 2 + 10 })),
        ...Array.from({ length: 10 }, () => ({ x: Math.random() * 2 + 20, y: Math.random() * 2 + 20 })),
      ];

      const kmeans = new KMeans({ k: 2, seed: 42 });
      const elbow = kmeans.elbowMethod(data, 1, 5);

      expect(elbow.kValues.length).toBeGreaterThan(0);
      expect(elbow.wcssValues.length).toBe(elbow.kValues.length);
      expect(elbow.wcssChange.length).toBe(elbow.kValues.length - 1);
    });
  });

  describe("Silhouette analysis", () => {
    it("should compute silhouette scores", () => {
      const data: Point[] = [
        { x: 1, y: 1 },
        { x: 1.5, y: 1.5 },
        { x: 2, y: 2 },
        { x: 10, y: 10 },
        { x: 10.5, y: 10.5 },
        { x: 11, y: 11 },
      ];

      const kmeans = new KMeans({ k: 2 });
      const result = kmeans.cluster(data, { computeSilhouette: true });

      expect(result.silhouetteScores).toBeDefined();
      expect(result.silhouetteScores?.length).toBe(data.length);
      expect(result.averageSilhouette).toBeDefined();
      expect(result.averageSilhouette).toBeGreaterThanOrEqual(-1);
      expect(result.averageSilhouette).toBeLessThanOrEqual(1);
    });
  });

  describe("Input validation", () => {
    it("should throw error for empty data", () => {
      const kmeans = new KMeans({ k: 2 });
      expect(() => kmeans.cluster([])).toThrow();
    });

    it("should throw error when k > data length", () => {
      const data: Point[] = [{ x: 1, y: 1 }, { x: 2, y: 2 }];
      const kmeans = new KMeans({ k: 5 });
      expect(() => kmeans.cluster(data)).toThrow();
    });

    it("should throw error when k < 1", () => {
      const data: Point[] = [{ x: 1, y: 1 }];
      const kmeans = new KMeans({ k: 0 });
      expect(() => kmeans.cluster(data)).toThrow();
    });
  });
});





