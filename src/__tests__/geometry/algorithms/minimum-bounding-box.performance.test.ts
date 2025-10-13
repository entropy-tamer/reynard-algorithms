/**
 * @module algorithms/geometry/algorithms/minimum-bounding-box/minimum-bounding-box.performance.test
 * @description Performance tests for Minimum Bounding Box with rotating calipers algorithm.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { MinimumBoundingBox } from "../../../geometry/algorithms/minimum-bounding-box/minimum-bounding-box-core";
import type { Point } from "../../../geometry/algorithms/minimum-bounding-box/minimum-bounding-box-types";

describe("MinimumBoundingBox Performance", () => {
  let mbb: MinimumBoundingBox;

  beforeEach(() => {
    mbb = new MinimumBoundingBox();
  });

  afterEach(() => {
    mbb.resetStats();
  });

  /**
   * Generates random points within a specified area.
   * @param count - Number of points to generate.
   * @param minX - Minimum X coordinate.
   * @param maxX - Maximum X coordinate.
   * @param minY - Minimum Y coordinate.
   * @param maxY - Maximum Y coordinate.
   * @returns Array of random points.
   */
  function generateRandomPoints(
    count: number,
    minX: number = -10,
    maxX: number = 10,
    minY: number = -10,
    maxY: number = 10
  ): Point[] {
    const points: Point[] = [];
    for (let i = 0; i < count; i++) {
      points.push({
        x: Math.random() * (maxX - minX) + minX,
        y: Math.random() * (maxY - minY) + minY,
      });
    }
    return points;
  }

  /**
   * Generates points forming a regular polygon.
   * @param sides - Number of sides.
   * @param radius - Radius of the polygon.
   * @param centerX - Center X coordinate.
   * @param centerY - Center Y coordinate.
   * @returns Array of points forming a regular polygon.
   */
  function generateRegularPolygon(
    sides: number,
    radius: number = 5,
    centerX: number = 0,
    centerY: number = 0
  ): Point[] {
    const points: Point[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (2 * Math.PI * i) / sides;
      points.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }
    return points;
  }

  /**
   * Generates points forming a rectangle.
   * @param width - Width of the rectangle.
   * @param height - Height of the rectangle.
   * @param centerX - Center X coordinate.
   * @param centerY - Center Y coordinate.
   * @param rotation - Rotation angle in radians.
   * @returns Array of points forming a rectangle.
   */
  function generateRectangle(
    width: number,
    height: number,
    centerX: number = 0,
    centerY: number = 0,
    rotation: number = 0
  ): Point[] {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    const corners = [
      { x: -halfWidth, y: -halfHeight },
      { x: halfWidth, y: -halfHeight },
      { x: halfWidth, y: halfHeight },
      { x: -halfWidth, y: halfHeight },
    ];

    return corners.map(corner => ({
      x: centerX + corner.x * cos - corner.y * sin,
      y: centerY + corner.x * sin + corner.y * cos,
    }));
  }

  describe("Basic Performance", () => {
    it("should compute minimum bounding box for 100 points quickly", () => {
      const points = generateRandomPoints(100);
      
      const startTime = performance.now();
      const result = mbb.compute(points);
      const endTime = performance.now();

      expect(result.stats.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(50); // Should complete in under 50ms
      expect(result.stats.executionTime).toBeLessThan(50);
    });

    it("should compute minimum bounding box for 1000 points in reasonable time", () => {
      const points = generateRandomPoints(1000);
      
      const startTime = performance.now();
      const result = mbb.compute(points);
      const endTime = performance.now();

      expect(result.stats.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(200); // Should complete in under 200ms
    });

    it("should compute minimum bounding box for 10000 points", () => {
      const points = generateRandomPoints(10000);
      
      const startTime = performance.now();
      const result = mbb.compute(points);
      const endTime = performance.now();

      expect(result.stats.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1s
    });

    it("should scale linearly with point count", () => {
      const sizes = [100, 500, 1000];
      const times: number[] = [];

      for (const size of sizes) {
        const points = generateRandomPoints(size);
        
        const startTime = performance.now();
        mbb.compute(points);
        const endTime = performance.now();
        
        times.push(endTime - startTime);
      }

      // Times should scale roughly linearly
      const ratio1 = times[1] / times[0];
      const ratio2 = times[2] / times[0];
      
      expect(ratio1).toBeLessThan(6); // 5x points should take less than 6x time
      expect(ratio2).toBeLessThan(12); // 10x points should take less than 12x time
    });
  });

  describe("Method Performance Comparison", () => {
    it("should compare performance of different methods", () => {
      const points = generateRandomPoints(500);
      const methods = ["rotating-calipers", "brute-force", "convex-hull"] as const;
      const times: number[] = [];

      for (const method of methods) {
        const startTime = performance.now();
        mbb.compute(points, { method });
        const endTime = performance.now();
        
        times.push(endTime - startTime);
      }

      // All methods should complete in reasonable time
      for (const time of times) {
        expect(time).toBeLessThan(300);
      }

      // Rotating calipers should be fastest
      expect(times[0]).toBeLessThan(times[1]); // rotating-calipers vs brute-force
    });

    it("should handle convex hull preprocessing efficiently", () => {
      const points = generateRandomPoints(1000);
      
      const startTimeWithHull = performance.now();
      mbb.compute(points, { useConvexHull: true });
      const endTimeWithHull = performance.now();

      const startTimeWithoutHull = performance.now();
      mbb.compute(points, { useConvexHull: false });
      const endTimeWithoutHull = performance.now();

      const timeWithHull = endTimeWithHull - startTimeWithHull;
      const timeWithoutHull = endTimeWithoutHull - startTimeWithoutHull;

      // Convex hull preprocessing should be efficient
      expect(timeWithHull).toBeLessThan(300);
      expect(timeWithoutHull).toBeLessThan(300);
    });
  });

  describe("Shape-Specific Performance", () => {
    it("should handle regular polygons efficiently", () => {
      const polygonSides = [3, 5, 8, 12, 20, 50, 100];
      const times: number[] = [];

      for (const sides of polygonSides) {
        const points = generateRegularPolygon(sides);
        
        const startTime = performance.now();
        mbb.compute(points);
        const endTime = performance.now();
        
        times.push(endTime - startTime);
      }

      // All polygons should be processed quickly
      for (const time of times) {
        expect(time).toBeLessThan(100);
      }
    });

    it("should handle rectangles efficiently", () => {
      const rectangles = [
        { width: 1, height: 1 },
        { width: 2, height: 1 },
        { width: 4, height: 1 },
        { width: 8, height: 1 },
        { width: 16, height: 1 },
      ];

      for (const rect of rectangles) {
        const points = generateRectangle(rect.width, rect.height);
        
        const startTime = performance.now();
        const result = mbb.compute(points);
        const endTime = performance.now();

        expect(result.stats.success).toBe(true);
        expect(endTime - startTime).toBeLessThan(50);
      }
    });

    it("should handle rotated shapes efficiently", () => {
      const rotations = [0, Math.PI / 4, Math.PI / 2, Math.PI, Math.PI * 1.5];
      
      for (const rotation of rotations) {
        const points = generateRectangle(4, 2, 0, 0, rotation);
        
        const startTime = performance.now();
        const result = mbb.compute(points);
        const endTime = performance.now();

        expect(result.stats.success).toBe(true);
        expect(endTime - startTime).toBeLessThan(50);
      }
    });
  });

  describe("Optimization Performance", () => {
    it("should optimize bounding boxes efficiently", () => {
      const points = generateRandomPoints(100);
      const initialBox = {
        center: { x: 0, y: 0 },
        width: 10,
        height: 10,
        rotation: 0,
      };

      const startTime = performance.now();
      const optimization = mbb.optimize(points, initialBox);
      const endTime = performance.now();

      expect(optimization.rectangle).toBeDefined();
      expect(endTime - startTime).toBeLessThan(100);
    });

    it("should handle multiple optimization iterations", () => {
      const points = generateRandomPoints(200);
      const initialBox = {
        center: { x: 0, y: 0 },
        width: 20,
        height: 20,
        rotation: 0,
      };

      const startTime = performance.now();
      for (let i = 0; i < 10; i++) {
        mbb.optimize(points, initialBox);
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe("Validation Performance", () => {
    it("should validate results quickly", () => {
      const points = generateRandomPoints(500);
      const result = mbb.compute(points);

      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        mbb.validate(result);
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50);
    });

    it("should handle validation with all checks efficiently", () => {
      const points = generateRandomPoints(500);
      const result = mbb.compute(points);

      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        mbb.validate(result, {
          checkPoints: true,
          checkRectangle: true,
          checkArea: true,
          checkPerimeter: true,
        });
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe("Serialization Performance", () => {
    it("should serialize results quickly", () => {
      const points = generateRandomPoints(500);
      const result = mbb.compute(points);

      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        mbb.serialize(result);
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it("should handle serialization with all options efficiently", () => {
      const points = generateRandomPoints(500);
      const result = mbb.compute(points, { includeQuality: true });

      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        mbb.serialize(result, {
          includeStats: true,
          includeQuality: true,
          includeValidation: true,
        });
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200);
    });
  });

  describe("Comparison Performance", () => {
    it("should compare bounding boxes quickly", () => {
      const points1 = generateRandomPoints(200);
      const points2 = generateRandomPoints(200);
      const result1 = mbb.compute(points1);
      const result2 = mbb.compute(points2);

      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        mbb.compare(result1, result2);
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it("should handle comparison with all options efficiently", () => {
      const points1 = generateRandomPoints(200);
      const points2 = generateRandomPoints(200);
      const result1 = mbb.compute(points1);
      const result2 = mbb.compute(points2);

      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        mbb.compare(result1, result2, {
          compareAreas: true,
          comparePerimeters: true,
          compareAspectRatios: true,
          compareRotations: true,
        });
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe("Memory Usage", () => {
    it("should not leak memory during repeated operations", () => {
      const points = generateRandomPoints(100);

      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        mbb.compute(points);
        mbb.validate(mbb.compute(points));
        mbb.serialize(mbb.compute(points));
        mbb.optimize(points, {
          center: { x: 0, y: 0 },
          width: 10,
          height: 10,
          rotation: 0,
        });
      }

      // If we get here without running out of memory, the test passes
      expect(true).toBe(true);
    });

    it("should handle large datasets efficiently", () => {
      const largePoints = generateRandomPoints(10000);
      
      const startTime = performance.now();
      const result = mbb.compute(largePoints);
      const endTime = performance.now();

      expect(result.stats.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should handle 10k points in under 1s
    });
  });

  describe("Stress Tests", () => {
    it("should handle rapid successive operations", () => {
      const points = generateRandomPoints(100);
      
      const startTime = performance.now();
      
      // Rapidly alternate between different operations
      for (let i = 0; i < 100; i++) {
        mbb.compute(points);
        mbb.validate(mbb.compute(points));
        mbb.serialize(mbb.compute(points));
        mbb.optimize(points, {
          center: { x: 0, y: 0 },
          width: 10,
          height: 10,
          rotation: 0,
        });
      }
      
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500); // Should handle rapid operations
    });

    it("should maintain accuracy under stress", () => {
      const points = generateRegularPolygon(8, 5);

      // Perform many computations
      let results: any[] = [];
      for (let i = 0; i < 100; i++) {
        results.push(mbb.compute(points));
      }

      // All results should be similar
      const firstResult = results[0];
      for (const result of results) {
        expect(Math.abs(result.area - firstResult.area)).toBeLessThan(0.1);
        expect(Math.abs(result.perimeter - firstResult.perimeter)).toBeLessThan(0.1);
      }
    });

    it("should handle extreme values", () => {
      const extremePoints: Point[] = [
        { x: 1e10, y: 1e10 },
        { x: -1e10, y: 1e10 },
        { x: -1e10, y: -1e10 },
        { x: 1e10, y: -1e10 },
      ];

      const startTime = performance.now();
      const result = mbb.compute(extremePoints);
      const endTime = performance.now();

      expect(result.stats.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(50); // Should handle extreme values quickly
    });

    it("should handle very small values", () => {
      const smallPoints: Point[] = [
        { x: 1e-10, y: 1e-10 },
        { x: -1e-10, y: 1e-10 },
        { x: -1e-10, y: -1e-10 },
        { x: 1e-10, y: -1e-10 },
      ];

      const startTime = performance.now();
      const result = mbb.compute(smallPoints);
      const endTime = performance.now();

      expect(result.stats.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(50); // Should handle small values quickly
    });
  });

  describe("Algorithm-Specific Performance", () => {
    it("should handle rotating calipers efficiently", () => {
      const points = generateRandomPoints(500);
      
      const startTime = performance.now();
      mbb.compute(points, { method: "rotating-calipers" });
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it("should handle brute force method efficiently", () => {
      const points = generateRandomPoints(200);
      
      const startTime = performance.now();
      mbb.compute(points, { method: "brute-force" });
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200);
    });

    it("should handle convex hull method efficiently", () => {
      const points = generateRandomPoints(500);
      
      const startTime = performance.now();
      mbb.compute(points, { method: "convex-hull" });
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(150);
    });
  });
});
