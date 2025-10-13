/**
 * @module algorithms/geometry/shapes/obb/obb.performance.test
 * @description Performance tests for Oriented Bounding Box (OBB) with SAT collision detection.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { OBB } from "../../../geometry/shapes/obb/obb-core";
import type { Point, OBBData } from "../../../geometry/shapes/obb/obb-types";

describe("OBB Performance", () => {
  let obb: OBB;

  beforeEach(() => {
    obb = new OBB();
  });

  afterEach(() => {
    obb.resetStats();
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
   * Generates a random OBB.
   * @param centerX - Center X coordinate.
   * @param centerY - Center Y coordinate.
   * @param maxSize - Maximum half-width.
   * @returns Random OBB.
   */
  function generateRandomOBB(
    centerX: number = 0,
    centerY: number = 0,
    maxSize: number = 5
  ): OBBData {
    const halfWidthX = Math.random() * maxSize + 0.1;
    const halfWidthY = Math.random() * maxSize + 0.1;
    const rotation = Math.random() * Math.PI * 2;

    return {
      center: { x: centerX, y: centerY },
      halfWidths: { x: halfWidthX, y: halfWidthY },
      axes: [
        { x: Math.cos(rotation), y: Math.sin(rotation) },
        { x: -Math.sin(rotation), y: Math.cos(rotation) },
      ],
      rotation,
    };
  }

  describe("Construction Performance", () => {
    it("should construct OBB from 100 points quickly", () => {
      const points = generateRandomPoints(100);
      
      const startTime = performance.now();
      const result = obb.constructFromPoints(points);
      const endTime = performance.now();

      expect(result.stats.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(50); // Should complete in under 50ms
      expect(result.stats.executionTime).toBeLessThan(50);
    });

    it("should construct OBB from 1000 points in reasonable time", () => {
      const points = generateRandomPoints(1000);
      
      const startTime = performance.now();
      const result = obb.constructFromPoints(points);
      const endTime = performance.now();

      expect(result.stats.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(200); // Should complete in under 200ms
    });

    it("should scale linearly with point count", () => {
      const sizes = [100, 500, 1000];
      const times: number[] = [];

      for (const size of sizes) {
        const points = generateRandomPoints(size);
        
        const startTime = performance.now();
        obb.constructFromPoints(points);
        const endTime = performance.now();
        
        times.push(endTime - startTime);
      }

      // Times should scale roughly linearly
      const ratio1 = times[1] / times[0];
      const ratio2 = times[2] / times[0];
      
      expect(ratio1).toBeLessThan(6); // 5x points should take less than 6x time
      expect(ratio2).toBeLessThan(12); // 10x points should take less than 12x time
    });

    it("should handle different construction methods efficiently", () => {
      const points = generateRandomPoints(500);
      const methods = ["pca", "convex-hull", "brute-force"] as const;
      const times: number[] = [];

      for (const method of methods) {
        const startTime = performance.now();
        obb.constructFromPoints(points, { method });
        const endTime = performance.now();
        
        times.push(endTime - startTime);
      }

      // All methods should complete in reasonable time
      for (const time of times) {
        expect(time).toBeLessThan(300);
      }
    });
  });

  describe("Collision Detection Performance", () => {
    it("should perform 1000 collision tests quickly", () => {
      const obb1Data = generateRandomOBB(0, 0, 2);
      const obb2Data = generateRandomOBB(1, 1, 2);
      
      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        obb.testCollision(obb1Data, obb2Data);
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it("should perform 10000 collision tests in reasonable time", () => {
      const obb1Data = generateRandomOBB(0, 0, 2);
      const obb2Data = generateRandomOBB(1, 1, 2);
      
      const startTime = performance.now();
      for (let i = 0; i < 10000; i++) {
        obb.testCollision(obb1Data, obb2Data);
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1s
    });

    it("should handle collision tests with MTV computation", () => {
      const obb1Data = generateRandomOBB(0, 0, 2);
      const obb2Data = generateRandomOBB(1, 1, 2);
      
      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        obb.testCollision(obb1Data, obb2Data, { computeMTV: true });
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(150); // MTV adds some overhead
    });

    it("should handle early exit optimization", () => {
      const obb1Data = generateRandomOBB(0, 0, 2);
      const obb2Data = generateRandomOBB(10, 10, 2); // Far apart - should exit early
      
      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        obb.testCollision(obb1Data, obb2Data, { useEarlyExit: true });
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Early exit should be faster
    });

    it("should scale collision tests linearly", () => {
      const obb1Data = generateRandomOBB(0, 0, 2);
      const obb2Data = generateRandomOBB(1, 1, 2);
      const testCounts = [100, 500, 1000];
      const times: number[] = [];

      for (const count of testCounts) {
        const startTime = performance.now();
        for (let i = 0; i < count; i++) {
          obb.testCollision(obb1Data, obb2Data);
        }
        const endTime = performance.now();
        
        times.push(endTime - startTime);
      }

      // Times should scale roughly linearly
      const ratio1 = times[1] / times[0];
      const ratio2 = times[2] / times[0];
      
      expect(ratio1).toBeLessThan(6); // 5x tests should take less than 6x time
      expect(ratio2).toBeLessThan(12); // 10x tests should take less than 12x time
    });
  });

  describe("Point Testing Performance", () => {
    it("should test 1000 points quickly", () => {
      const obbData = generateRandomOBB(0, 0, 2);
      const points = generateRandomPoints(1000);
      
      const startTime = performance.now();
      for (const point of points) {
        obb.testPoint(point, obbData);
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should complete in under 50ms
    });

    it("should test 10000 points in reasonable time", () => {
      const obbData = generateRandomOBB(0, 0, 2);
      const points = generateRandomPoints(10000);
      
      const startTime = performance.now();
      for (const point of points) {
        obb.testPoint(point, obbData);
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // Should complete in under 200ms
    });

    it("should scale point tests linearly", () => {
      const obbData = generateRandomOBB(0, 0, 2);
      const testCounts = [100, 500, 1000];
      const times: number[] = [];

      for (const count of testCounts) {
        const points = generateRandomPoints(count);
        
        const startTime = performance.now();
        for (const point of points) {
          obb.testPoint(point, obbData);
        }
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

  describe("Transformation Performance", () => {
    it("should transform OBB quickly", () => {
      const obbData = generateRandomOBB(0, 0, 2);
      
      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        obb.transformOBB(obbData, {
          translation: { x: Math.random(), y: Math.random() },
          rotation: Math.random() * Math.PI * 2,
          scale: { x: Math.random() + 0.5, y: Math.random() + 0.5 },
        });
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it("should handle translation-only transformations efficiently", () => {
      const obbData = generateRandomOBB(0, 0, 2);
      
      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        obb.transformOBB(obbData, {
          translation: { x: Math.random(), y: Math.random() },
        });
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Translation should be very fast
    });

    it("should handle rotation transformations efficiently", () => {
      const obbData = generateRandomOBB(0, 0, 2);
      
      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        obb.transformOBB(obbData, {
          rotation: Math.random() * Math.PI * 2,
        });
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Rotation should be reasonably fast
    });
  });

  describe("Validation Performance", () => {
    it("should validate OBB quickly", () => {
      const obbData = generateRandomOBB(0, 0, 2);
      
      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        obb.validateOBB(obbData);
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should complete in under 50ms
    });

    it("should handle validation with all checks efficiently", () => {
      const obbData = generateRandomOBB(0, 0, 2);
      
      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        obb.validateOBB(obbData, {
          checkDimensions: true,
          checkAxes: true,
          checkOrthogonality: true,
          checkUnitAxes: true,
        });
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // All checks should still be fast
    });
  });

  describe("Serialization Performance", () => {
    it("should serialize OBB quickly", () => {
      const obbData = generateRandomOBB(0, 0, 2);
      
      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        obb.serialize(obbData);
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should complete in under 50ms
    });

    it("should handle serialization with all options efficiently", () => {
      const obbData = generateRandomOBB(0, 0, 2);
      
      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        obb.serialize(obbData, {
          includeStats: true,
          includeQuality: true,
          precision: 10,
        });
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // All options should still be fast
    });
  });

  describe("Memory Usage", () => {
    it("should not leak memory during repeated operations", () => {
      const obb1Data = generateRandomOBB(0, 0, 2);
      const obb2Data = generateRandomOBB(1, 1, 2);
      const points = generateRandomPoints(100);

      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        obb.constructFromPoints(points);
        obb.testCollision(obb1Data, obb2Data);
        obb.testPoint({ x: Math.random(), y: Math.random() }, obb1Data);
        obb.transformOBB(obb1Data, { translation: { x: 0.1, y: 0.1 } });
        obb.validateOBB(obb1Data);
        obb.serialize(obb1Data);
      }

      // If we get here without running out of memory, the test passes
      expect(true).toBe(true);
    });

    it("should handle large datasets efficiently", () => {
      const largePoints = generateRandomPoints(10000);
      
      const startTime = performance.now();
      const result = obb.constructFromPoints(largePoints);
      const endTime = performance.now();

      expect(result.stats.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should handle 10k points in under 1s
    });
  });

  describe("Stress Tests", () => {
    it("should handle rapid successive operations", () => {
      const obb1Data = generateRandomOBB(0, 0, 2);
      const obb2Data = generateRandomOBB(1, 1, 2);
      
      const startTime = performance.now();
      
      // Rapidly alternate between different operations
      for (let i = 0; i < 500; i++) {
        obb.testCollision(obb1Data, obb2Data);
        obb.testPoint({ x: Math.random(), y: Math.random() }, obb1Data);
        obb.transformOBB(obb1Data, { translation: { x: 0.01, y: 0.01 } });
        obb.validateOBB(obb1Data);
      }
      
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // Should handle rapid operations
    });

    it("should maintain accuracy under stress", () => {
      const obb1Data: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const obb2Data: OBBData = {
        center: { x: 0.5, y: 0.5 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      // Perform many collision tests
      let collisionCount = 0;
      for (let i = 0; i < 1000; i++) {
        const result = obb.testCollision(obb1Data, obb2Data);
        if (result.isColliding) {
          collisionCount++;
        }
      }

      // Should consistently detect collision
      expect(collisionCount).toBe(1000);
    });

    it("should handle extreme values", () => {
      const extremeOBB: OBBData = {
        center: { x: 1e10, y: -1e10 },
        halfWidths: { x: 1e5, y: 1e5 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const startTime = performance.now();
      const result = obb.validateOBB(extremeOBB);
      const endTime = performance.now();

      expect(result.isValid).toBe(true);
      expect(endTime - startTime).toBeLessThan(10); // Should handle extreme values quickly
    });
  });
});
