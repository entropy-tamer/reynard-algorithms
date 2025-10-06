import { describe, it, expect } from "vitest";
import {
  createOptimizedSpatialHash,
  calculateOptimalCellSize,
  estimateMemoryUsage,
} from "../../spatial-hash/spatial-hash-utils";
import type { SpatialObject } from "../../spatial-hash/spatial-hash-types";

describe("Spatial Hash Utils", () => {
  const createSpatialObject = (x: number, y: number, width: number = 0, height: number = 0): SpatialObject => ({
    x,
    y,
    width,
    height,
  });

  describe("createOptimizedSpatialHash", () => {
    it("should create spatial hash with default options", () => {
      const objects = [createSpatialObject(0, 0, 50, 50), createSpatialObject(100, 100, 50, 50)];

      const hash = createOptimizedSpatialHash(objects);

      expect(hash).toBeDefined();
      expect(hash.queryRadius(0, 0, 100)).toHaveLength(1);
    });

    it("should create spatial hash with custom options", () => {
      const objects = [createSpatialObject(0, 0, 50, 50), createSpatialObject(100, 100, 50, 50)];

      const hash = createOptimizedSpatialHash(objects, {
        targetCellSize: 200,
        maxObjectsPerCell: 10,
      });

      expect(hash).toBeDefined();
    });

    it("should calculate optimal cell size based on object distribution", () => {
      const objects = [createSpatialObject(0, 0, 100, 100), createSpatialObject(200, 200, 100, 100)];

      const hash = createOptimizedSpatialHash(objects);

      expect(hash).toBeDefined();
      // Should use calculated optimal cell size
    });

    it("should handle empty object array", () => {
      const hash = createOptimizedSpatialHash([]);

      expect(hash).toBeDefined();
    });

    it("should handle objects without dimensions", () => {
      const objects = [createSpatialObject(0, 0), createSpatialObject(100, 100)];

      const hash = createOptimizedSpatialHash(objects);

      expect(hash).toBeDefined();
    });

    it("should insert all objects into the hash", () => {
      const objects = [
        createSpatialObject(0, 0, 50, 50),
        createSpatialObject(100, 100, 50, 50),
        createSpatialObject(200, 200, 50, 50),
      ];

      const hash = createOptimizedSpatialHash(objects);

      // All objects should be findable
      expect(hash.queryRadius(0, 0, 1000)).toHaveLength(3);
    });

    it("should handle objects with zero dimensions", () => {
      const objects = [createSpatialObject(0, 0, 0, 0), createSpatialObject(100, 100, 0, 0)];

      const hash = createOptimizedSpatialHash(objects);

      expect(hash).toBeDefined();
    });

    it("should handle very large objects", () => {
      const objects = [createSpatialObject(0, 0, 10000, 10000), createSpatialObject(5000, 5000, 10000, 10000)];

      const hash = createOptimizedSpatialHash(objects);

      expect(hash).toBeDefined();
    });

    it("should handle very small objects", () => {
      const objects = [createSpatialObject(0, 0, 0.1, 0.1), createSpatialObject(0.5, 0.5, 0.1, 0.1)];

      const hash = createOptimizedSpatialHash(objects);

      expect(hash).toBeDefined();
    });
  });

  describe("calculateOptimalCellSize", () => {
    it("should return default size for empty array", () => {
      const size = calculateOptimalCellSize([]);
      expect(size).toBe(100);
    });

    it("should calculate size based on average object dimensions", () => {
      const objects = [
        createSpatialObject(0, 0, 50, 50),
        createSpatialObject(100, 100, 100, 100),
        createSpatialObject(200, 200, 150, 150),
      ];

      const size = calculateOptimalCellSize(objects);

      // Should be between 50 and 200
      expect(size).toBeGreaterThanOrEqual(50);
      expect(size).toBeLessThanOrEqual(200);
    });

    it("should handle objects without dimensions", () => {
      const objects = [createSpatialObject(0, 0), createSpatialObject(100, 100)];

      const size = calculateOptimalCellSize(objects);
      expect(size).toBe(50); // Should return minimum
    });

    it("should handle mixed objects with and without dimensions", () => {
      const objects = [
        createSpatialObject(0, 0, 50, 50),
        createSpatialObject(100, 100), // No dimensions
        createSpatialObject(200, 200, 100, 100),
      ];

      const size = calculateOptimalCellSize(objects);

      expect(size).toBeGreaterThanOrEqual(50);
      expect(size).toBeLessThanOrEqual(200);
    });

    it("should handle very large objects", () => {
      const objects = [createSpatialObject(0, 0, 1000, 1000), createSpatialObject(100, 100, 2000, 2000)];

      const size = calculateOptimalCellSize(objects);

      // Should be capped at 200
      expect(size).toBeLessThanOrEqual(200);
    });

    it("should handle very small objects", () => {
      const objects = [createSpatialObject(0, 0, 1, 1), createSpatialObject(100, 100, 2, 2)];

      const size = calculateOptimalCellSize(objects);

      // Should be at least 50
      expect(size).toBeGreaterThanOrEqual(50);
    });

    it("should handle single object", () => {
      const objects = [createSpatialObject(0, 0, 100, 100)];

      const size = calculateOptimalCellSize(objects);

      expect(size).toBeGreaterThanOrEqual(50);
      expect(size).toBeLessThanOrEqual(200);
    });

    it("should handle objects with zero dimensions", () => {
      const objects = [createSpatialObject(0, 0, 0, 0), createSpatialObject(100, 100, 0, 0)];

      const size = calculateOptimalCellSize(objects);
      expect(size).toBe(50); // Should return minimum
    });
  });

  describe("estimateMemoryUsage", () => {
    it("should estimate memory usage for given parameters", () => {
      const usage = estimateMemoryUsage(100, 1000, 5000);

      expect(usage).toBeGreaterThan(0);
      expect(typeof usage).toBe("number");
    });

    it("should handle zero parameters", () => {
      const usage = estimateMemoryUsage(0, 0, 0);

      expect(usage).toBe(0);
    });

    it("should scale with cell count", () => {
      const usage1 = estimateMemoryUsage(100, 1000, 5000);
      const usage2 = estimateMemoryUsage(200, 1000, 5000);

      expect(usage2).toBeGreaterThan(usage1);
    });

    it("should scale with object count", () => {
      const usage1 = estimateMemoryUsage(100, 1000, 5000);
      const usage2 = estimateMemoryUsage(100, 2000, 5000);

      expect(usage2).toBeGreaterThan(usage1);
    });

    it("should scale with object-to-cell count", () => {
      const usage1 = estimateMemoryUsage(100, 1000, 5000);
      const usage2 = estimateMemoryUsage(100, 1000, 10000);

      expect(usage2).toBeGreaterThan(usage1);
    });

    it("should handle large numbers", () => {
      const usage = estimateMemoryUsage(10000, 100000, 500000);

      expect(usage).toBeGreaterThan(0);
      expect(usage).toBeLessThan(Number.MAX_SAFE_INTEGER);
    });

    it("should provide reasonable estimates", () => {
      // Test with realistic values
      const usage = estimateMemoryUsage(1000, 10000, 50000);

      // Should be in reasonable range (not too small, not too large)
      expect(usage).toBeGreaterThan(1000000); // At least 1MB
      expect(usage).toBeLessThan(1000000000); // Less than 1GB
    });

    it("should handle edge case with very small numbers", () => {
      const usage = estimateMemoryUsage(1, 1, 1);

      expect(usage).toBeGreaterThan(0);
      expect(usage).toBe(180); // 50 + 30 + 100
    });
  });
});
