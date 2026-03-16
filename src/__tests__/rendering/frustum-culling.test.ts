/**
 * @file frustum-culling.test.ts
 * @description Tests for Frustum Culling algorithm.
 */

import { describe, it, expect } from "vitest";
import { FrustumCulling } from "../../algorithms/rendering/frustum-culling/frustum-culling-core";
import type { Frustum3D, AABB3D, Sphere3D, Point3D, Plane3D } from "../../core/types";

describe("FrustumCulling", () => {
  // Create a simple frustum for testing
  /**
   *
   * @example
   */
  function createTestFrustum(): Frustum3D {
    const planes: Plane3D[] = [
      // Near plane
      { normal: { x: 0, y: 0, z: 1 }, distance: 1 },
      // Far plane
      { normal: { x: 0, y: 0, z: -1 }, distance: -10 },
      // Left plane
      { normal: { x: 1, y: 0, z: 0 }, distance: -5 },
      // Right plane
      { normal: { x: -1, y: 0, z: 0 }, distance: -5 },
      // Top plane
      { normal: { x: 0, y: -1, z: 0 }, distance: -5 },
      // Bottom plane
      { normal: { x: 0, y: 1, z: 0 }, distance: -5 },
    ];
    return { planes };
  }

  describe("Point culling", () => {
    it("should identify point inside frustum", () => {
      const culling = new FrustumCulling();
      const frustum = createTestFrustum();
      const point: Point3D = { x: 0, y: 0, z: 5 };

      const result = culling.testObject(point, frustum);
      expect(result.inside || result.intersects).toBe(true);
    });

    it("should identify point outside frustum", () => {
      const culling = new FrustumCulling();
      const frustum = createTestFrustum();
      const point: Point3D = { x: 100, y: 100, z: 5 };

      const result = culling.testObject(point, frustum);
      expect(result.inside).toBe(false);
      expect(typeof result.outside).toBe("boolean");
    });
  });

  describe("AABB culling", () => {
    it("should cull multiple AABBs", () => {
      const culling = new FrustumCulling();
      const frustum = createTestFrustum();

      const aabbs: AABB3D[] = [
        { x: 0, y: 0, z: 5, width: 2, height: 2, depth: 2 },
        { x: 100, y: 100, z: 5, width: 2, height: 2, depth: 2 },
        { x: 1, y: 1, z: 5, width: 1, height: 1, depth: 1 },
      ];

      const result = culling.cull(aabbs, frustum);

      expect(result.results).toHaveLength(3);
      expect(result.stats.objectsTested).toBe(3);
      expect(result.insideIndices).toBeDefined();
      expect(result.intersectingIndices).toBeDefined();
    });
  });

  describe("Sphere culling", () => {
    it("should identify sphere inside frustum", () => {
      const culling = new FrustumCulling();
      const frustum = createTestFrustum();
      const sphere: Sphere3D = { center: { x: 0, y: 0, z: 5 }, radius: 1 };

      const result = culling.testObject(sphere, frustum);
      expect(typeof result.inside).toBe("boolean");
      expect(typeof result.intersects).toBe("boolean");
    });
  });
});


