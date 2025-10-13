/**
 * @module algorithms/geometry/algorithms/minimum-bounding-box/minimum-bounding-box.test
 * @description Unit tests for Minimum Bounding Box with rotating calipers algorithm.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { MinimumBoundingBox } from "../../../geometry/algorithms/minimum-bounding-box/minimum-bounding-box-core";
import type { Point, Rectangle } from "../../../geometry/algorithms/minimum-bounding-box/minimum-bounding-box-types";

describe("MinimumBoundingBox", () => {
  let mbb: MinimumBoundingBox;

  beforeEach(() => {
    mbb = new MinimumBoundingBox();
  });

  afterEach(() => {
    mbb.resetStats();
  });

  describe("Basic Computation", () => {
    it("should compute minimum bounding box for a square", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ];

      const result = mbb.compute(points);
      expect(result.stats.success).toBe(true);
      expect(result.rectangle).toBeDefined();
      expect(result.area).toBeCloseTo(4, 5);
      expect(result.perimeter).toBeCloseTo(8, 5);
    });

    it("should compute minimum bounding box for a rotated rectangle", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 1 },
        { x: 0, y: 1 },
      ];

      const result = mbb.compute(points);
      expect(result.stats.success).toBe(true);
      expect(result.rectangle.width).toBeCloseTo(4, 5);
      expect(result.rectangle.height).toBeCloseTo(1, 5);
    });

    it("should compute minimum bounding box for a triangle", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 2 },
      ];

      const result = mbb.compute(points);
      expect(result.stats.success).toBe(true);
      expect(result.rectangle).toBeDefined();
      expect(result.area).toBeGreaterThan(0);
    });

    it("should handle minimum number of points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ];

      const result = mbb.compute(points);
      expect(result.stats.success).toBe(true);
      expect(result.rectangle).toBeDefined();
    });

    it("should handle insufficient points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ];

      const result = mbb.compute(points);
      expect(result.stats.success).toBe(true);
      expect(result.rectangle.width).toBeCloseTo(1, 5);
      expect(result.rectangle.height).toBeCloseTo(0, 5);
    });

    it("should handle single point", () => {
      const points: Point[] = [{ x: 0, y: 0 }];

      const result = mbb.compute(points);
      expect(result.stats.success).toBe(true);
      expect(result.rectangle.width).toBeCloseTo(0, 5);
      expect(result.rectangle.height).toBeCloseTo(0, 5);
    });

    it("should handle empty points array", () => {
      const points: Point[] = [];

      const result = mbb.compute(points);
      expect(result.stats.success).toBe(true);
      expect(result.rectangle.width).toBeCloseTo(0, 5);
      expect(result.rectangle.height).toBeCloseTo(0, 5);
    });
  });

  describe("Different Methods", () => {
    it("should use rotating calipers method", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ];

      const result = mbb.compute(points, { method: "rotating-calipers" });
      expect(result.stats.success).toBe(true);
      expect(result.rectangle).toBeDefined();
    });

    it("should use brute force method", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ];

      const result = mbb.compute(points, { method: "brute-force" });
      expect(result.stats.success).toBe(true);
      expect(result.rectangle).toBeDefined();
    });

    it("should use convex hull method", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
        { x: 1, y: 1 }, // Interior point
      ];

      const result = mbb.compute(points, { method: "convex-hull" });
      expect(result.stats.success).toBe(true);
      expect(result.rectangle).toBeDefined();
    });
  });

  describe("Optimization Options", () => {
    it("should optimize for minimum area", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 1 },
        { x: 0, y: 1 },
      ];

      const result = mbb.compute(points, { optimizeForArea: true });
      expect(result.stats.success).toBe(true);
      expect(result.area).toBeCloseTo(4, 5);
    });

    it("should optimize for minimum perimeter", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 1 },
        { x: 0, y: 1 },
      ];

      const result = mbb.compute(points, { optimizeForPerimeter: true });
      expect(result.stats.success).toBe(true);
      expect(result.perimeter).toBeGreaterThan(0);
    });

    it("should use convex hull preprocessing", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
        { x: 1, y: 1 }, // Interior point
        { x: 0.5, y: 0.5 }, // Another interior point
      ];

      const resultWithHull = mbb.compute(points, { useConvexHull: true });
      const resultWithoutHull = mbb.compute(points, { useConvexHull: false });

      expect(resultWithHull.stats.success).toBe(true);
      expect(resultWithoutHull.stats.success).toBe(true);
      // Results should be similar since interior points don't affect the hull
      expect(Math.abs(resultWithHull.area - resultWithoutHull.area)).toBeLessThan(0.1);
    });
  });

  describe("Quality Metrics", () => {
    it("should include quality metrics when requested", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ];

      const result = mbb.compute(points, { includeQuality: true });
      expect(result.quality).toBeDefined();
      expect(result.quality.fitQuality).toBeGreaterThanOrEqual(0);
      expect(result.quality.fitQuality).toBeLessThanOrEqual(1);
      expect(result.quality.efficiency).toBeGreaterThanOrEqual(0);
      expect(result.quality.efficiency).toBeLessThanOrEqual(1);
      expect(result.quality.compactness).toBeGreaterThanOrEqual(0);
    });

    it("should calculate correct fit quality for perfect fit", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ];

      const result = mbb.compute(points, { includeQuality: true });
      expect(result.quality.fitQuality).toBeCloseTo(1, 2);
    });

    it("should calculate efficiency compared to AABB", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ];

      const result = mbb.compute(points, { includeQuality: true });
      expect(result.quality.efficiency).toBeGreaterThanOrEqual(0);
      expect(result.quality.efficiency).toBeLessThanOrEqual(1);
    });
  });

  describe("Validation", () => {
    it("should validate correct result", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ];

      const result = mbb.compute(points);
      const validation = mbb.validate(result);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should detect invalid area", () => {
      const result = {
        rectangle: { center: { x: 0, y: 0 }, width: -1, height: 1, rotation: 0 },
        area: -1,
        perimeter: 0,
        aspectRatio: 1,
        quality: { fitQuality: 1, efficiency: 1, compactness: 1 },
        stats: { pointsProcessed: 4, iterations: 0, angleTests: 0, executionTime: 0, success: true },
      };

      const validation = mbb.validate(result, { minArea: 0 });
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Area -1 is below minimum 0");
    });

    it("should detect invalid rectangle", () => {
      const result = {
        rectangle: { center: { x: 0, y: 0 }, width: -1, height: 1, rotation: 0 },
        area: 1,
        perimeter: 0,
        aspectRatio: 1,
        quality: { fitQuality: 1, efficiency: 1, compactness: 1 },
        stats: { pointsProcessed: 4, iterations: 0, angleTests: 0, executionTime: 0, success: true },
      };

      const validation = mbb.validate(result);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Invalid rectangle in result");
    });
  });

  describe("Comparison", () => {
    it("should compare identical bounding boxes", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ];

      const result1 = mbb.compute(points);
      const result2 = mbb.compute(points);
      const comparison = mbb.compare(result1, result2);

      expect(comparison.areEqual).toBe(true);
      expect(comparison.similarity).toBeCloseTo(1, 2);
    });

    it("should compare different bounding boxes", () => {
      const points1: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ];

      const points2: Point[] = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 1 },
        { x: 0, y: 1 },
      ];

      const result1 = mbb.compute(points1);
      const result2 = mbb.compute(points2);
      const comparison = mbb.compare(result1, result2);

      expect(comparison.areEqual).toBe(false);
      expect(comparison.areaDifference).toBeGreaterThan(0);
    });
  });

  describe("Optimization", () => {
    it("should optimize a bounding box", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ];

      const initialBox: Rectangle = {
        center: { x: 1, y: 1 },
        width: 3,
        height: 3,
        rotation: 0,
      };

      const optimization = mbb.optimize(points, initialBox);
      expect(optimization.rectangle).toBeDefined();
      expect(optimization.iterations).toBeGreaterThan(0);
      expect(optimization.converged).toBe(true);
    });
  });

  describe("Serialization", () => {
    it("should serialize result to JSON", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ];

      const result = mbb.compute(points);
      const serialized = mbb.serialize(result, { precision: 2 });

      expect(serialized.rectangle.center.x).toBe(1);
      expect(serialized.rectangle.center.y).toBe(1);
      expect(serialized.area).toBe(4);
    });

    it("should include stats when requested", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ];

      const result = mbb.compute(points);
      const serialized = mbb.serialize(result, { includeStats: true });

      expect(serialized.stats).toBeDefined();
      expect(serialized.stats!.pointsProcessed).toBe(4);
    });

    it("should include quality when requested", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ];

      const result = mbb.compute(points, { includeQuality: true });
      const serialized = mbb.serialize(result, { includeQuality: true });

      expect(serialized.quality).toBeDefined();
      expect(serialized.quality!.fitQuality).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Configuration", () => {
    it("should update configuration", () => {
      mbb.updateConfig({ tolerance: 1e-6 });
      const config = mbb.getConfig();
      expect(config.tolerance).toBe(1e-6);
    });

    it("should get current configuration", () => {
      const config = mbb.getConfig();
      expect(config).toBeDefined();
      expect(config.tolerance).toBeDefined();
      expect(config.validateInput).toBeDefined();
    });

    it("should get current statistics", () => {
      const stats = mbb.getStats();
      expect(stats).toBeDefined();
      expect(stats.pointsProcessed).toBe(0);
      expect(stats.iterations).toBe(0);
    });

    it("should reset statistics", () => {
      // Perform some operations to generate stats
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ];
      mbb.compute(points);

      mbb.resetStats();
      const stats = mbb.getStats();
      expect(stats.pointsProcessed).toBe(0);
      expect(stats.iterations).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle collinear points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ];

      const result = mbb.compute(points);
      expect(result.stats.success).toBe(true);
      expect(result.rectangle.height).toBeCloseTo(0, 5);
    });

    it("should handle duplicate points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ];

      const result = mbb.compute(points);
      expect(result.stats.success).toBe(true);
      expect(result.rectangle).toBeDefined();
    });

    it("should handle very small points", () => {
      const points: Point[] = [
        { x: 1e-10, y: 1e-10 },
        { x: 2e-10, y: 1e-10 },
        { x: 2e-10, y: 2e-10 },
        { x: 1e-10, y: 2e-10 },
      ];

      const result = mbb.compute(points);
      expect(result.stats.success).toBe(true);
      expect(result.rectangle).toBeDefined();
    });

    it("should handle very large points", () => {
      const points: Point[] = [
        { x: 1e10, y: 1e10 },
        { x: 2e10, y: 1e10 },
        { x: 2e10, y: 2e10 },
        { x: 1e10, y: 2e10 },
      ];

      const result = mbb.compute(points);
      expect(result.stats.success).toBe(true);
      expect(result.rectangle).toBeDefined();
    });

    it("should handle tolerance in comparisons", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ];

      mbb.updateConfig({ tolerance: 1e-3 });
      const result = mbb.compute(points);
      expect(result.stats.success).toBe(true);
    });
  });

  describe("Performance", () => {
    it("should handle large number of points", () => {
      const points: Point[] = [];
      for (let i = 0; i < 1000; i++) {
        points.push({ x: Math.random() * 100, y: Math.random() * 100 });
      }

      const result = mbb.compute(points);
      expect(result.stats.success).toBe(true);
      expect(result.stats.pointsProcessed).toBe(1000);
    });

    it("should track statistics correctly", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ];

      const result = mbb.compute(points);
      expect(result.stats.pointsProcessed).toBe(4);
      expect(result.stats.iterations).toBeGreaterThan(0);
      expect(result.stats.angleTests).toBeGreaterThan(0);
    });
  });
});
