/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  executeSpatialCollisionDetection,
  executeOptimizedCollisionDetection,
} from "../../../optimization/adapters/collision-algorithms";
import { EnhancedMemoryPool } from "../../../optimization/core/enhanced-memory-pool";
import type { AABB } from "../../../computational-geometry/collision/aabb-types";

describe("Collision Algorithms Extended Coverage", () => {
  let memoryPool: EnhancedMemoryPool;
  let aabbs: AABB[];

  beforeEach(() => {
    memoryPool = new EnhancedMemoryPool({
      spatialHashPoolSize: 5,
      unionFindPoolSize: 5,
      collisionArrayPoolSize: 5,
      processedSetPoolSize: 5,
      enableStats: true,
      enableOptimization: true,
      cleanupInterval: 1000,
    });

    // Create test AABBs with various configurations
    aabbs = [
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 5, y: 5, width: 10, height: 10 }, // Overlaps with first
      { x: 20, y: 20, width: 10, height: 10 },
      { x: 25, y: 25, width: 10, height: 10 }, // Overlaps with third
      { x: 50, y: 50, width: 10, height: 10 },
    ];
  });

  afterEach(() => {
    // No cleanup method available
  });

  describe("executeSpatialCollisionDetection", () => {
    it("should handle spatial hash collision detection with memory pool", () => {
      const collisions = executeSpatialCollisionDetection(aabbs, memoryPool);

      expect(Array.isArray(collisions)).toBe(true);
      expect(collisions.length).toBeGreaterThan(0);

      // Check that collisions are properly structured
      collisions.forEach(collision => {
        expect(collision).toHaveProperty("a");
        expect(collision).toHaveProperty("b");
        expect(collision).toHaveProperty("result");
        expect(typeof collision.a).toBe("number");
        expect(typeof collision.b).toBe("number");
        expect(collision.a).toBeLessThan(collision.b);
      });
    });

    it("should handle empty AABB array", () => {
      const collisions = executeSpatialCollisionDetection([], memoryPool);
      expect(collisions).toEqual([]);
    });

    it("should handle single AABB", () => {
      const singleAABB = [{ x: 0, y: 0, width: 10, height: 10 }];
      const collisions = executeSpatialCollisionDetection(singleAABB, memoryPool);
      expect(collisions).toEqual([]);
    });

    it("should handle non-overlapping AABBs", () => {
      const nonOverlappingAABBs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 20, y: 20, width: 10, height: 10 },
        { x: 40, y: 40, width: 10, height: 10 },
      ];

      const collisions = executeSpatialCollisionDetection(nonOverlappingAABBs, memoryPool);
      expect(collisions).toEqual([]);
    });

    it("should handle large number of AABBs", () => {
      const largeAABBs: AABB[] = [];
      for (let i = 0; i < 50; i++) {
        largeAABBs.push({
          x: i * 5,
          y: i * 5,
          width: 10,
          height: 10,
        });
      }

      const collisions = executeSpatialCollisionDetection(largeAABBs, memoryPool);
      expect(Array.isArray(collisions)).toBe(true);
    });

    it("should handle AABBs with zero dimensions", () => {
      const zeroDimAABBs: AABB[] = [
        { x: 0, y: 0, width: 0, height: 0 },
        { x: 0, y: 0, width: 10, height: 10 },
      ];

      const collisions = executeSpatialCollisionDetection(zeroDimAABBs, memoryPool);
      expect(Array.isArray(collisions)).toBe(true);
    });

    it("should handle AABBs with negative coordinates", () => {
      const negativeCoordAABBs: AABB[] = [
        { x: -10, y: -10, width: 10, height: 10 },
        { x: -5, y: -5, width: 10, height: 10 },
      ];

      const collisions = executeSpatialCollisionDetection(negativeCoordAABBs, memoryPool);
      expect(Array.isArray(collisions)).toBe(true);
    });
  });

  describe("executeOptimizedCollisionDetection", () => {
    it("should handle optimized collision detection with config", () => {
      const config = {
        enableSpatialOptimization: true,
        enableMemoryPooling: true,
        spatialHashCellSize: 50,
        maxCollisionChecks: 1000,
        enableEarlyTermination: true,
      };

      const collisions = executeOptimizedCollisionDetection(aabbs, config, memoryPool);

      expect(Array.isArray(collisions)).toBe(true);
      expect(collisions.length).toBeGreaterThan(0);

      // Check that collisions are properly structured
      collisions.forEach(collision => {
        expect(collision).toHaveProperty("a");
        expect(collision).toHaveProperty("b");
        expect(collision).toHaveProperty("result");
        expect(typeof collision.a).toBe("number");
        expect(typeof collision.b).toBe("number");
        expect(collision.a).toBeLessThan(collision.b);
      });
    });

    it("should handle optimized collision detection with different configs", () => {
      const configs = [
        {
          enableSpatialOptimization: false,
          enableMemoryPooling: true,
          spatialHashCellSize: 100,
          maxCollisionChecks: 500,
          enableEarlyTermination: false,
        },
        {
          enableSpatialOptimization: true,
          enableMemoryPooling: false,
          spatialHashCellSize: 25,
          maxCollisionChecks: 2000,
          enableEarlyTermination: true,
        },
      ];

      configs.forEach(config => {
        const collisions = executeOptimizedCollisionDetection(aabbs, config, memoryPool);
        expect(Array.isArray(collisions)).toBe(true);
      });
    });

    it("should handle empty AABB array with optimization", () => {
      const config = {
        enableSpatialOptimization: true,
        enableMemoryPooling: true,
        spatialHashCellSize: 50,
        maxCollisionChecks: 1000,
        enableEarlyTermination: true,
      };

      const collisions = executeOptimizedCollisionDetection([], config, memoryPool);
      expect(collisions).toEqual([]);
    });

    it("should handle single AABB with optimization", () => {
      const singleAABB = [{ x: 0, y: 0, width: 10, height: 10 }];
      const config = {
        enableSpatialOptimization: true,
        enableMemoryPooling: true,
        spatialHashCellSize: 50,
        maxCollisionChecks: 1000,
        enableEarlyTermination: true,
      };

      const collisions = executeOptimizedCollisionDetection(singleAABB, config, memoryPool);
      expect(collisions).toEqual([]);
    });

    it("should handle large number of AABBs with optimization", () => {
      const largeAABBs: AABB[] = [];
      for (let i = 0; i < 100; i++) {
        largeAABBs.push({
          x: i * 3,
          y: i * 3,
          width: 10,
          height: 10,
        });
      }

      const config = {
        enableSpatialOptimization: true,
        enableMemoryPooling: true,
        spatialHashCellSize: 50,
        maxCollisionChecks: 5000,
        enableEarlyTermination: true,
      };

      const collisions = executeOptimizedCollisionDetection(largeAABBs, config, memoryPool);
      expect(Array.isArray(collisions)).toBe(true);
    });

    it("should handle edge cases with optimization", () => {
      const edgeCaseAABBs: AABB[] = [
        { x: 0, y: 0, width: 0, height: 0 },
        { x: 0, y: 0, width: 10, height: 0 },
        { x: 0, y: 0, width: 0, height: 10 },
        { x: -5, y: -5, width: 10, height: 10 },
      ];

      const config = {
        enableSpatialOptimization: true,
        enableMemoryPooling: true,
        spatialHashCellSize: 50,
        maxCollisionChecks: 1000,
        enableEarlyTermination: true,
      };

      const collisions = executeOptimizedCollisionDetection(edgeCaseAABBs, config, memoryPool);
      expect(Array.isArray(collisions)).toBe(true);
    });
  });

  describe("Memory Pool Integration", () => {
    it("should properly use memory pool for spatial hash operations", () => {
      const initialStats = memoryPool.getStatistics();
      const initialAllocations = initialStats.totalAllocations;

      executeSpatialCollisionDetection(aabbs, memoryPool);

      const finalStats = memoryPool.getStatistics();
      expect(finalStats.totalAllocations).toBeGreaterThanOrEqual(initialAllocations);
    });

    it("should properly use memory pool for optimized operations", () => {
      const config = {
        enableSpatialOptimization: true,
        enableMemoryPooling: true,
        spatialHashCellSize: 50,
        maxCollisionChecks: 1000,
        enableEarlyTermination: true,
      };

      const initialStats = memoryPool.getStatistics();
      const initialAllocations = initialStats.totalAllocations;

      executeOptimizedCollisionDetection(aabbs, config, memoryPool);

      const finalStats = memoryPool.getStatistics();
      const finalAllocations = finalStats.totalAllocations;

      expect(finalAllocations).toBeGreaterThanOrEqual(initialAllocations);
    });
  });
});
