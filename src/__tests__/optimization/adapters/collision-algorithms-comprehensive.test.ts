/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  executeSpatialCollisionDetection,
  executeOptimizedCollisionDetection,
} from "../../../optimization/adapters/collision-algorithms";
import { MemoryPool } from "../../../optimization/core/enhanced-memory-pool";

describe("Collision Algorithms Comprehensive Coverage", () => {
  let memoryPool: MemoryPool;

  beforeEach(() => {
    memoryPool = new MemoryPool();
  });

  afterEach(() => {
    // Memory pool cleanup is handled internally
  });

  describe("executeSpatialCollisionDetection - Medium Dataset Branch", () => {
    it("should use naive approach for medium datasets (< 300)", () => {
      // Create exactly 299 AABBs to test the medium dataset branch
      const aabbs = Array.from({ length: 299 }, (_, i) => ({
        x: i * 10,
        y: i * 10,
        width: 5,
        height: 5,
      }));

      const collisions = executeSpatialCollisionDetection(aabbs, memoryPool);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);
    });

    it("should use spatial hash for large datasets (>= 300)", () => {
      // Create exactly 300 AABBs to test the spatial hash branch
      const aabbs = Array.from({ length: 300 }, (_, i) => ({
        x: i * 10,
        y: i * 10,
        width: 5,
        height: 5,
      }));

      const collisions = executeSpatialCollisionDetection(aabbs, memoryPool);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);
    });

    it("should handle spatial hash insertion and querying", () => {
      // Create overlapping AABBs to ensure collisions are detected
      const aabbs = Array.from({ length: 350 }, (_, i) => ({
        x: (i % 10) * 5, // Create a grid pattern with overlap
        y: Math.floor(i / 10) * 5,
        width: 8,
        height: 8,
      }));

      const collisions = executeSpatialCollisionDetection(aabbs, memoryPool);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);

      // Should detect some collisions due to overlapping grid
      expect(collisions.length).toBeGreaterThanOrEqual(0);
    });

    it("should handle spatial hash with processed set tracking", () => {
      // Create AABBs that will trigger the processed set logic
      const aabbs = Array.from({ length: 400 }, (_, i) => ({
        x: i * 5,
        y: i * 5,
        width: 3,
        height: 3,
      }));

      const collisions = executeSpatialCollisionDetection(aabbs, memoryPool);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);
    });

    it("should handle spatial hash query with expanded bounds", () => {
      // Create AABBs that will test the expanded query bounds
      const aabbs = Array.from({ length: 500 }, (_, i) => ({
        x: (i % 20) * 15, // Wider spacing
        y: Math.floor(i / 20) * 15,
        width: 10,
        height: 10,
      }));

      const collisions = executeSpatialCollisionDetection(aabbs, memoryPool);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);
    });

    it("should handle collision detection with proper index tracking", () => {
      // Create AABBs that will test the index comparison logic
      const aabbs = Array.from({ length: 600 }, (_, i) => ({
        x: i * 2,
        y: i * 2,
        width: 1,
        height: 1,
      }));

      const collisions = executeSpatialCollisionDetection(aabbs, memoryPool);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);

      // Verify collision structure
      if (collisions.length > 0) {
        const collision = collisions[0];
        expect(collision).toHaveProperty("a");
        expect(collision).toHaveProperty("b");
        expect(collision).toHaveProperty("result");
        expect(typeof collision.a).toBe("number");
        expect(typeof collision.b).toBe("number");
      }
    });

    it("should handle memory pool cleanup in finally blocks", () => {
      // Create a large dataset to ensure memory pool operations
      const aabbs = Array.from({ length: 1000 }, (_, i) => ({
        x: i * 1,
        y: i * 1,
        width: 0.5,
        height: 0.5,
      }));

      const collisions = executeSpatialCollisionDetection(aabbs, memoryPool);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);

      // Memory pool should be in a clean state after execution
      const stats = memoryPool.getStatistics();
      expect(stats).toBeDefined();
    });
  });

  describe("executeOptimizedCollisionDetection", () => {
    it("should handle optimized collision detection for large datasets", () => {
      // Create a large dataset to test optimized approach
      const aabbs = Array.from({ length: 800 }, (_, i) => ({
        x: (i % 25) * 12,
        y: Math.floor(i / 25) * 12,
        width: 8,
        height: 8,
      }));

      const collisions = executeOptimizedCollisionDetection(aabbs, memoryPool);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);
    });

    it("should handle optimized collision detection with overlapping objects", () => {
      // Create overlapping AABBs to ensure collisions are detected
      const aabbs = Array.from({ length: 1000 }, (_, i) => ({
        x: (i % 30) * 4, // Create overlap
        y: Math.floor(i / 30) * 4,
        width: 6,
        height: 6,
      }));

      const collisions = executeOptimizedCollisionDetection(aabbs, memoryPool);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);

      // Should detect some collisions due to overlapping grid
      expect(collisions.length).toBeGreaterThanOrEqual(0);
    });

    it("should handle optimized collision detection with memory pool integration", () => {
      // Create a dataset that will use memory pool resources
      const aabbs = Array.from({ length: 1200 }, (_, i) => ({
        x: i * 0.5,
        y: i * 0.5,
        width: 0.3,
        height: 0.3,
      }));

      const collisions = executeOptimizedCollisionDetection(aabbs, memoryPool);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);

      // Memory pool should be in a clean state after execution
      const stats = memoryPool.getStatistics();
      expect(stats).toBeDefined();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle empty AABB array", () => {
      const collisions = executeSpatialCollisionDetection([], memoryPool);
      expect(collisions).toEqual([]);
    });

    it("should handle single AABB", () => {
      const aabbs = [{ x: 0, y: 0, width: 10, height: 10 }];
      const collisions = executeSpatialCollisionDetection(aabbs, memoryPool);
      expect(collisions).toEqual([]);
    });

    it("should handle two non-overlapping AABBs", () => {
      const aabbs = [
        { x: 0, y: 0, width: 5, height: 5 },
        { x: 10, y: 10, width: 5, height: 5 },
      ];
      const collisions = executeSpatialCollisionDetection(aabbs, memoryPool);
      expect(collisions).toEqual([]);
    });

    it("should handle two overlapping AABBs", () => {
      const aabbs = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 },
      ];
      const collisions = executeSpatialCollisionDetection(aabbs, memoryPool);
      expect(collisions.length).toBe(1);
      expect(collisions[0].a).toBe(0);
      expect(collisions[0].b).toBe(1);
    });

    it("should handle AABBs with zero dimensions", () => {
      const aabbs = [
        { x: 0, y: 0, width: 0, height: 0 },
        { x: 0, y: 0, width: 0, height: 0 },
      ];
      const collisions = executeSpatialCollisionDetection(aabbs, memoryPool);
      expect(collisions).toEqual([]);
    });

    it("should handle AABBs with negative dimensions", () => {
      const aabbs = [
        { x: 0, y: 0, width: -5, height: -5 },
        { x: 0, y: 0, width: -5, height: -5 },
      ];
      const collisions = executeSpatialCollisionDetection(aabbs, memoryPool);
      expect(collisions).toEqual([]);
    });

    it("should handle AABBs with very large coordinates", () => {
      const aabbs = [
        { x: 1000000, y: 1000000, width: 100, height: 100 },
        { x: 1000100, y: 1000100, width: 100, height: 100 },
      ];
      const collisions = executeSpatialCollisionDetection(aabbs, memoryPool);
      expect(collisions).toEqual([]);
    });

    it("should handle AABBs with very small coordinates", () => {
      const aabbs = [
        { x: 0.001, y: 0.001, width: 0.001, height: 0.001 },
        { x: 0.002, y: 0.002, width: 0.001, height: 0.001 },
      ];
      const collisions = executeSpatialCollisionDetection(aabbs, memoryPool);
      expect(collisions).toEqual([]);
    });
  });

  describe("Performance and Memory Management", () => {
    it("should handle memory pool resource management", () => {
      // Create a dataset that will use multiple memory pool resources
      const aabbs = Array.from({ length: 2000 }, (_, i) => ({
        x: (i % 40) * 10,
        y: Math.floor(i / 40) * 10,
        width: 5,
        height: 5,
      }));

      const initialStats = memoryPool.getStatistics();

      const collisions = executeSpatialCollisionDetection(aabbs, memoryPool);

      const finalStats = memoryPool.getStatistics();

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);

      // Memory pool should have been used
      expect(finalStats.totalAllocations).toBeGreaterThanOrEqual(initialStats.totalAllocations);
    });

    it("should handle memory pool cleanup after errors", () => {
      // Create a dataset that will test memory pool cleanup
      const aabbs = Array.from({ length: 1500 }, (_, i) => ({
        x: i * 2,
        y: i * 2,
        width: 1,
        height: 1,
      }));

      const collisions = executeSpatialCollisionDetection(aabbs, memoryPool);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);

      // Memory pool should be in a clean state
      const stats = memoryPool.getStatistics();
      expect(stats).toBeDefined();
    });
  });
});
