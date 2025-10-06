import { describe, expect, it } from "vitest";
import type {
  AABB,
  CollisionResult,
  CollisionPair,
  CollisionStats,
  AABBSpatialHashConfig,
} from "../../geometry/collision/aabb-types";

describe("AABB Types", () => {
  describe("AABB interface", () => {
    it("should create a valid AABB object", () => {
      const aabb: AABB = {
        x: 10,
        y: 20,
        width: 100,
        height: 50,
      };

      expect(aabb.x).toBe(10);
      expect(aabb.y).toBe(20);
      expect(aabb.width).toBe(100);
      expect(aabb.height).toBe(50);
    });

    it("should handle zero dimensions", () => {
      const aabb: AABB = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };

      expect(aabb.x).toBe(0);
      expect(aabb.y).toBe(0);
      expect(aabb.width).toBe(0);
      expect(aabb.height).toBe(0);
    });

    it("should handle negative coordinates", () => {
      const aabb: AABB = {
        x: -10,
        y: -20,
        width: 100,
        height: 50,
      };

      expect(aabb.x).toBe(-10);
      expect(aabb.y).toBe(-20);
      expect(aabb.width).toBe(100);
      expect(aabb.height).toBe(50);
    });

    it("should handle fractional values", () => {
      const aabb: AABB = {
        x: 10.5,
        y: 20.7,
        width: 100.3,
        height: 50.9,
      };

      expect(aabb.x).toBe(10.5);
      expect(aabb.y).toBe(20.7);
      expect(aabb.width).toBe(100.3);
      expect(aabb.height).toBe(50.9);
    });
  });

  describe("CollisionResult interface", () => {
    it("should create a collision result with collision", () => {
      const result: CollisionResult = {
        colliding: true,
        overlap: { x: 10, y: 10, width: 20, height: 20 },
        overlapArea: 400,
        distance: 0,
      };

      expect(result.colliding).toBe(true);
      expect(result.overlap).toEqual({ x: 10, y: 10, width: 20, height: 20 });
      expect(result.overlapArea).toBe(400);
      expect(result.distance).toBe(0);
    });

    it("should create a collision result without collision", () => {
      const result: CollisionResult = {
        colliding: false,
        overlap: null,
        overlapArea: 0,
        distance: 15.5,
      };

      expect(result.colliding).toBe(false);
      expect(result.overlap).toBeNull();
      expect(result.overlapArea).toBe(0);
      expect(result.distance).toBe(15.5);
    });

    it("should handle edge case values", () => {
      const result: CollisionResult = {
        colliding: true,
        overlap: { x: 0, y: 0, width: 0, height: 0 },
        overlapArea: 0,
        distance: Number.MAX_SAFE_INTEGER,
      };

      expect(result.colliding).toBe(true);
      expect(result.overlap).toEqual({ x: 0, y: 0, width: 0, height: 0 });
      expect(result.overlapArea).toBe(0);
      expect(result.distance).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe("CollisionPair interface", () => {
    it("should create a collision pair", () => {
      const pair: CollisionPair = {
        a: 0,
        b: 1,
        result: {
          colliding: true,
          overlap: { x: 10, y: 10, width: 20, height: 20 },
          overlapArea: 400,
          distance: 0,
        },
      };

      expect(pair.a).toBe(0);
      expect(pair.b).toBe(1);
      expect(pair.result.colliding).toBe(true);
      expect(pair.result.overlapArea).toBe(400);
    });

    it("should handle large indices", () => {
      const pair: CollisionPair = {
        a: 999,
        b: 1000,
        result: {
          colliding: false,
          overlap: null,
          overlapArea: 0,
          distance: 50,
        },
      };

      expect(pair.a).toBe(999);
      expect(pair.b).toBe(1000);
      expect(pair.result.colliding).toBe(false);
    });
  });

  describe("CollisionStats interface", () => {
    it("should create collision statistics", () => {
      const stats: CollisionStats = {
        totalChecks: 1000,
        collisionsFound: 150,
        averageCheckTime: 0.5,
        spatialHashHits: 800,
        spatialHashMisses: 200,
      };

      expect(stats.totalChecks).toBe(1000);
      expect(stats.collisionsFound).toBe(150);
      expect(stats.averageCheckTime).toBe(0.5);
      expect(stats.spatialHashHits).toBe(800);
      expect(stats.spatialHashMisses).toBe(200);
    });

    it("should handle zero values", () => {
      const stats: CollisionStats = {
        totalChecks: 0,
        collisionsFound: 0,
        averageCheckTime: 0,
        spatialHashHits: 0,
        spatialHashMisses: 0,
      };

      expect(stats.totalChecks).toBe(0);
      expect(stats.collisionsFound).toBe(0);
      expect(stats.averageCheckTime).toBe(0);
      expect(stats.spatialHashHits).toBe(0);
      expect(stats.spatialHashMisses).toBe(0);
    });

    it("should handle fractional performance metrics", () => {
      const stats: CollisionStats = {
        totalChecks: 1000,
        collisionsFound: 150,
        averageCheckTime: 0.123456789,
        spatialHashHits: 800,
        spatialHashMisses: 200,
      };

      expect(stats.averageCheckTime).toBe(0.123456789);
    });
  });

  describe("AABBSpatialHashConfig interface", () => {
    it("should create spatial hash configuration", () => {
      const config: AABBSpatialHashConfig = {
        cellSize: 64,
        maxObjectsPerCell: 10,
        enableOptimization: true,
      };

      expect(config.cellSize).toBe(64);
      expect(config.maxObjectsPerCell).toBe(10);
      expect(config.enableOptimization).toBe(true);
    });

    it("should handle disabled optimization", () => {
      const config: AABBSpatialHashConfig = {
        cellSize: 32,
        maxObjectsPerCell: 5,
        enableOptimization: false,
      };

      expect(config.enableOptimization).toBe(false);
      expect(config.cellSize).toBe(32);
      expect(config.maxObjectsPerCell).toBe(5);
    });

    it("should handle edge case values", () => {
      const config: AABBSpatialHashConfig = {
        cellSize: 1,
        maxObjectsPerCell: 1,
        enableOptimization: true,
      };

      expect(config.cellSize).toBe(1);
      expect(config.maxObjectsPerCell).toBe(1);
    });
  });

  describe("Type compatibility", () => {
    it("should allow AABB to be used in CollisionResult overlap", () => {
      const aabb: AABB = { x: 10, y: 10, width: 20, height: 20 };
      const result: CollisionResult = {
        colliding: true,
        overlap: aabb,
        overlapArea: 400,
        distance: 0,
      };

      expect(result.overlap).toBe(aabb);
    });

    it("should allow CollisionResult to be used in CollisionPair", () => {
      const collisionResult: CollisionResult = {
        colliding: true,
        overlap: { x: 10, y: 10, width: 20, height: 20 },
        overlapArea: 400,
        distance: 0,
      };

      const pair: CollisionPair = {
        a: 0,
        b: 1,
        result: collisionResult,
      };

      expect(pair.result).toBe(collisionResult);
    });
  });
});
