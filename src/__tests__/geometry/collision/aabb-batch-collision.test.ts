import { describe, it, expect } from "vitest";
import {
  batchCollisionDetection,
  batchCollisionWithSpatialHash,
} from "../../../geometry/collision/aabb";
import type { AABB, AABBSpatialHashConfig } from "../../../geometry/collision/aabb/aabb-types";

// Test helper functions
const createAABB = (x: number, y: number, width: number, height: number): AABB => ({
  x,
  y,
  width,
  height,
});

const createSpatialHashConfig = (cellSize: number): AABBSpatialHashConfig => ({
  cellSize,
  maxObjectsPerCell: 50,
  enableOptimization: true,
});

describe("AABB Batch Collision Detection - Basic Functionality", () => {
  describe("batchCollisionDetection", () => {
    it("should detect collisions between overlapping AABBs", () => {
      const aabbs = [
        createAABB(0, 0, 100, 100), // AABB 0
        createAABB(50, 50, 100, 100), // AABB 1 - overlaps with 0
        createAABB(200, 200, 50, 50), // AABB 2 - no overlap
      ];

      const collisions = batchCollisionDetection(aabbs);

      expect(collisions).toHaveLength(1);
      expect(collisions[0]).toEqual({
        index1: 0,
        index2: 1,
        result: expect.objectContaining({
          colliding: true,
          distance: expect.any(Number),
        }),
      });
    });

    it("should handle empty array", () => {
      const collisions = batchCollisionDetection([]);
      expect(collisions).toHaveLength(0);
    });

    it("should handle single AABB", () => {
      const aabbs = [createAABB(0, 0, 100, 100)];
      const collisions = batchCollisionDetection(aabbs);
      expect(collisions).toHaveLength(0);
    });
  });
});

describe("AABB Batch Collision Detection - Self-Collision Options", () => {
  describe("batchCollisionDetection", () => {
    it("should not include self-collisions by default", () => {
      const aabbs = [createAABB(0, 0, 100, 100), createAABB(200, 200, 50, 50)];

      const collisions = batchCollisionDetection(aabbs, { includeSelf: false });
      expect(collisions).toHaveLength(0);
    });

    it("should include self-collisions when includeSelf is true", () => {
      const aabbs = [createAABB(0, 0, 100, 100), createAABB(200, 200, 50, 50)];

      const collisions = batchCollisionDetection(aabbs, { includeSelf: true });
      expect(collisions).toHaveLength(2); // 0-0, 1-1 (0-1 and 1-0 don't collide)
    });
  });
});

describe("AABB Batch Collision Detection - Distance Filtering", () => {
  describe("batchCollisionDetection", () => {
    it("should respect maxDistance filter", () => {
      const aabbs = [
        createAABB(0, 0, 100, 100),
        createAABB(150, 150, 50, 50), // Far away
        createAABB(50, 50, 50, 50), // Close
      ];

      const collisions = batchCollisionDetection(aabbs, { maxDistance: 100 });

      // Should only include close collisions
      expect(collisions.length).toBeGreaterThan(0);
      collisions.forEach((collision: any) => {
        expect(collision.result.distance).toBeLessThanOrEqual(100);
      });
    });
  });
});

describe("AABB Batch Collision Detection - Spatial Hash Optimization", () => {
  describe("batchCollisionDetection", () => {
    it("should use spatial hash optimization for large arrays", () => {
      const aabbs = Array.from({ length: 150 }, (_, i) => createAABB(i * 10, i * 10, 50, 50));

      const collisions = batchCollisionDetection(aabbs, {
        spatialHash: createSpatialHashConfig(100),
      });

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);
    });
  });
});

describe("AABB Batch Collision Detection - Spatial Hash Function", () => {
  describe("batchCollisionWithSpatialHash", () => {
    it("should detect collisions using spatial hashing", () => {
      const aabbs = [
        createAABB(0, 0, 100, 100),
        createAABB(50, 50, 100, 100), // Overlaps
        createAABB(200, 200, 50, 50), // No overlap
      ];

      const collisions = batchCollisionWithSpatialHash(aabbs, {
        spatialHash: createSpatialHashConfig(100),
      });

      expect(collisions).toHaveLength(1);
      expect(collisions[0].index1).toBe(0);
      expect(collisions[0].index2).toBe(1);
    });

    it("should fallback to regular detection when no spatial hash config", () => {
      const aabbs = [createAABB(0, 0, 100, 100), createAABB(50, 50, 100, 100)];

      const collisions = batchCollisionWithSpatialHash(aabbs, {});
      expect(collisions).toHaveLength(1);
    });

    it("should respect includeSelf option with spatial hash", () => {
      const aabbs = [createAABB(0, 0, 100, 100), createAABB(200, 200, 50, 50)];

      const collisions = batchCollisionWithSpatialHash(aabbs, {
        includeSelf: true,
        spatialHash: createSpatialHashConfig(100),
      });

      expect(collisions.length).toBeGreaterThan(0);
    });

    it("should respect maxDistance with spatial hash", () => {
      const aabbs = [createAABB(0, 0, 100, 100), createAABB(150, 150, 50, 50), createAABB(50, 50, 50, 50)];

      const collisions = batchCollisionWithSpatialHash(aabbs, {
        maxDistance: 100,
        spatialHash: createSpatialHashConfig(100),
      });

      collisions.forEach((collision: any) => {
        expect(collision.result.distance).toBeLessThanOrEqual(100);
      });
    });

    it("should handle multiple objects in same cell", () => {
      const aabbs = [createAABB(0, 0, 50, 50), createAABB(25, 25, 50, 50), createAABB(10, 10, 30, 30)];

      const collisions = batchCollisionWithSpatialHash(aabbs, {
        spatialHash: createSpatialHashConfig(100),
      });

      expect(collisions.length).toBeGreaterThan(0);
    });
  });
});
