/**
 * @module algorithms/geometry/shapes/obb/obb.test
 * @description Unit tests for Oriented Bounding Box (OBB) with SAT collision detection.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { OBB } from "../../../geometry/shapes/obb/obb-core";
import type { Point, OBBData } from "../../../geometry/shapes/obb/obb-types";

describe("OBB", () => {
  let obb: OBB;

  beforeEach(() => {
    obb = new OBB();
  });

  afterEach(() => {
    obb.resetStats();
  });

  describe("Construction", () => {
    it("should construct OBB from points using PCA", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ];

      const result = obb.constructFromPoints(points);
      expect(result.stats.success).toBe(true);
      expect(result.obb).toBeDefined();
      expect(result.obb.center).toBeDefined();
      expect(result.obb.halfWidths).toBeDefined();
      expect(result.obb.axes).toHaveLength(2);
    });

    it("should construct OBB from rotated rectangle", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 1 },
        { x: 0, y: 1 },
      ];

      const result = obb.constructFromPoints(points);
      expect(result.stats.success).toBe(true);
      expect(result.quality.area).toBeCloseTo(2, 1);
    });

    it("should handle minimum number of points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ];

      const result = obb.constructFromPoints(points);
      expect(result.stats.success).toBe(true);
    });

    it("should reject insufficient points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ];

      const result = obb.constructFromPoints(points);
      expect(result.stats.success).toBe(false);
    });

    it("should handle empty points array", () => {
      const points: Point[] = [];

      const result = obb.constructFromPoints(points);
      expect(result.stats.success).toBe(false);
    });

    it("should use different construction methods", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ];

      const pcaResult = obb.constructFromPoints(points, { method: "pca" });
      const convexHullResult = obb.constructFromPoints(points, { method: "convex-hull" });
      const bruteForceResult = obb.constructFromPoints(points, { method: "brute-force" });

      expect(pcaResult.stats.success).toBe(true);
      expect(convexHullResult.stats.success).toBe(true);
      expect(bruteForceResult.stats.success).toBe(true);
    });
  });

  describe("Collision Detection", () => {
    it("should detect collision between overlapping OBBs", () => {
      const obb1: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const obb2: OBBData = {
        center: { x: 0.5, y: 0.5 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const result = obb.testCollision(obb1, obb2);
      expect(result.isColliding).toBe(true);
      expect(result.mtv).toBeDefined();
      expect(result.penetrationDepth).toBeGreaterThan(0);
    });

    it("should detect no collision between separated OBBs", () => {
      const obb1: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const obb2: OBBData = {
        center: { x: 3, y: 3 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const result = obb.testCollision(obb1, obb2);
      expect(result.isColliding).toBe(false);
      expect(result.mtv).toBeUndefined();
    });

    it("should handle rotated OBBs", () => {
      const obb1: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const obb2: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 0.707, y: 0.707 },
          { x: -0.707, y: 0.707 },
        ],
        rotation: Math.PI / 4,
      };

      const result = obb.testCollision(obb1, obb2);
      expect(result.isColliding).toBe(true);
    });

    it("should compute MTV when requested", () => {
      const obb1: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const obb2: OBBData = {
        center: { x: 0.5, y: 0.5 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const result = obb.testCollision(obb1, obb2, { computeMTV: true });
      expect(result.isColliding).toBe(true);
      expect(result.mtv).toBeDefined();
      expect(result.penetrationAxis).toBeDefined();
    });

    it("should skip MTV computation when not requested", () => {
      const obb1: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const obb2: OBBData = {
        center: { x: 0.5, y: 0.5 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const result = obb.testCollision(obb1, obb2, { computeMTV: false });
      expect(result.isColliding).toBe(true);
      expect(result.mtv).toBeUndefined();
    });

    it("should handle edge case collisions", () => {
      const obb1: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const obb2: OBBData = {
        center: { x: 2, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const result = obb.testCollision(obb1, obb2);
      expect(result.isColliding).toBe(true); // Touching edges
    });
  });

  describe("Point Testing", () => {
    it("should detect point inside OBB", () => {
      const obbData: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const result = obb.testPoint({ x: 0, y: 0 }, obbData);
      expect(result.isInside).toBe(true);
      expect(result.distance).toBe(0);
    });

    it("should detect point outside OBB", () => {
      const obbData: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const result = obb.testPoint({ x: 2, y: 2 }, obbData);
      expect(result.isInside).toBe(false);
      expect(result.distance).toBeGreaterThan(0);
    });

    it("should handle point on OBB boundary", () => {
      const obbData: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const result = obb.testPoint({ x: 1, y: 0 }, obbData);
      expect(result.isInside).toBe(true); // Boundary is considered inside
    });

    it("should calculate closest point correctly", () => {
      const obbData: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const result = obb.testPoint({ x: 2, y: 0 }, obbData);
      expect(result.closestPoint).toEqual({ x: 1, y: 0 });
    });

    it("should handle rotated OBB for point testing", () => {
      const obbData: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 0.707, y: 0.707 },
          { x: -0.707, y: 0.707 },
        ],
        rotation: Math.PI / 4,
      };

      const result = obb.testPoint({ x: 0, y: 0 }, obbData);
      expect(result.isInside).toBe(true);
    });
  });

  describe("Transformation", () => {
    it("should translate OBB", () => {
      const obbData: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const result = obb.transformOBB(obbData, { translation: { x: 2, y: 3 } });
      expect(result.success).toBe(true);
      expect(result.obb.center).toEqual({ x: 2, y: 3 });
    });

    it("should rotate OBB", () => {
      const obbData: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const result = obb.transformOBB(obbData, { rotation: Math.PI / 2 });
      expect(result.success).toBe(true);
      expect(result.obb.rotation).toBeCloseTo(Math.PI / 2, 5);
    });

    it("should scale OBB", () => {
      const obbData: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const result = obb.transformOBB(obbData, { scale: { x: 2, y: 3 } });
      expect(result.success).toBe(true);
      expect(result.obb.halfWidths).toEqual({ x: 2, y: 3 });
    });

    it("should combine transformations", () => {
      const obbData: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const result = obb.transformOBB(obbData, {
        translation: { x: 1, y: 1 },
        rotation: Math.PI / 4,
        scale: { x: 2, y: 2 },
      });

      expect(result.success).toBe(true);
      expect(result.obb.center).toEqual({ x: 1, y: 1 });
      expect(result.obb.halfWidths).toEqual({ x: 2, y: 2 });
      expect(result.obb.rotation).toBeCloseTo(Math.PI / 4, 5);
    });
  });

  describe("Validation", () => {
    it("should validate correct OBB", () => {
      const obbData: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const result = obb.validateOBB(obbData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect invalid dimensions", () => {
      const obbData: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: -1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const result = obb.validateOBB(obbData, { minDimension: 0 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("OBB has invalid dimensions");
    });

    it("should detect non-unit axes", () => {
      const obbData: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 2, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const result = obb.validateOBB(obbData, { checkUnitAxes: true });
      expect(result.warnings).toContain("First axis is not a unit vector");
    });

    it("should detect non-orthogonal axes", () => {
      const obbData: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 1, y: 1 },
        ],
        rotation: 0,
      };

      const result = obb.validateOBB(obbData, { checkOrthogonality: true });
      expect(result.warnings).toContain("OBB axes are not orthogonal");
    });

    it("should detect missing axes", () => {
      const obbData: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [{ x: 1, y: 0 }] as any,
        rotation: 0,
      };

      const result = obb.validateOBB(obbData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("OBB must have exactly 2 axes");
    });
  });

  describe("Serialization", () => {
    it("should serialize OBB to JSON", () => {
      const obbData: OBBData = {
        center: { x: 1.234567, y: 2.345678 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const serialized = obb.serialize(obbData, { precision: 2 });
      expect(serialized.center.x).toBe(1.23);
      expect(serialized.center.y).toBe(2.35);
    });

    it("should include stats when requested", () => {
      const obbData: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const serialized = obb.serialize(obbData, { includeStats: true });
      expect(serialized.stats).toBeDefined();
    });

    it("should include quality when requested", () => {
      const obbData: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const serialized = obb.serialize(obbData, { includeQuality: true });
      expect(serialized.quality).toBeDefined();
    });
  });

  describe("Configuration", () => {
    it("should update configuration", () => {
      obb.updateConfig({ tolerance: 1e-6 });
      const config = obb.getConfig();
      expect(config.tolerance).toBe(1e-6);
    });

    it("should get current configuration", () => {
      const config = obb.getConfig();
      expect(config).toBeDefined();
      expect(config.tolerance).toBeDefined();
      expect(config.validateInput).toBeDefined();
    });

    it("should get current statistics", () => {
      const stats = obb.getStats();
      expect(stats).toBeDefined();
      expect(stats.collisionTests).toBe(0);
      expect(stats.satTests).toBe(0);
    });

    it("should reset statistics", () => {
      // Perform some operations to generate stats
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ];
      obb.constructFromPoints(points);

      obb.resetStats();
      const stats = obb.getStats();
      expect(stats.collisionTests).toBe(0);
      expect(stats.satTests).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle degenerate OBB (zero dimensions)", () => {
      const obbData: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 0, y: 0 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const result = obb.testPoint({ x: 0, y: 0 }, obbData);
      expect(result.isInside).toBe(true);
    });

    it("should handle very small OBB", () => {
      const obbData: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1e-10, y: 1e-10 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const result = obb.testPoint({ x: 0, y: 0 }, obbData);
      expect(result.isInside).toBe(true);
    });

    it("should handle very large OBB", () => {
      const obbData: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1e10, y: 1e10 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const result = obb.testPoint({ x: 1e9, y: 1e9 }, obbData);
      expect(result.isInside).toBe(true);
    });

    it("should handle identical OBBs", () => {
      const obb1: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const result = obb.testCollision(obb1, obb1);
      expect(result.isColliding).toBe(true);
    });

    it("should handle tolerance in collision detection", () => {
      const obb1: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const obb2: OBBData = {
        center: { x: 2.0001, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      obb.updateConfig({ tolerance: 1e-3 });
      const result = obb.testCollision(obb1, obb2);
      expect(result.isColliding).toBe(true);
    });
  });

  describe("Performance", () => {
    it("should handle large number of collision tests", () => {
      const obb1: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const obb2: OBBData = {
        center: { x: 0.5, y: 0.5 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        obb.testCollision(obb1, obb2);
      }
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it("should track statistics correctly", () => {
      const obb1: OBBData = {
        center: { x: 0, y: 0 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      const obb2: OBBData = {
        center: { x: 0.5, y: 0.5 },
        halfWidths: { x: 1, y: 1 },
        axes: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
        rotation: 0,
      };

      obb.testCollision(obb1, obb2);
      const stats = obb.getStats();
      expect(stats.collisionTests).toBe(1);
      expect(stats.satTests).toBe(1);
      expect(stats.projections).toBeGreaterThan(0);
    });
  });
});
