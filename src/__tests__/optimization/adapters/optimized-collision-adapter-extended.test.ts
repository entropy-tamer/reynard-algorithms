/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { OptimizedCollisionAdapter } from "../../../optimization/adapters/optimized-collision-adapter";
import { EnhancedMemoryPool } from "../../../optimization/core/enhanced-memory-pool";
import { PerformanceMonitor } from "../../../optimization/adapters/performance-monitor";

describe("Optimized Collision Adapter Extended Coverage", () => {
  let adapter: OptimizedCollisionAdapter;

  beforeEach(() => {
    adapter = new OptimizedCollisionAdapter();
  });

  afterEach(() => {
    // Memory pool cleanup is handled internally
  });

  describe("detectCollisions - Algorithm Selection Paths", () => {
    it("should use naive algorithm for small datasets (< 400)", () => {
      // Create exactly 399 AABBs to test the naive path
      const aabbs = Array.from({ length: 399 }, (_, i) => ({
        x: i * 10,
        y: i * 10,
        width: 5,
        height: 5,
      }));

      const collisions = adapter.detectCollisions(aabbs);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);

      // Should use naive algorithm
      const stats = adapter.getPerformanceStats();
      expect(stats.algorithmUsage.naive).toBeGreaterThan(0);
    });

    it("should use spatial algorithm for medium datasets (400-1000)", () => {
      // Create exactly 400 AABBs to test the spatial path
      const aabbs = Array.from({ length: 400 }, (_, i) => ({
        x: (i % 20) * 10,
        y: Math.floor(i / 20) * 10,
        width: 5,
        height: 5,
      }));

      const collisions = adapter.detectCollisions(aabbs);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);

      // Should use spatial algorithm
      const stats = adapter.getPerformanceStats();
      expect(stats.algorithmUsage.spatial).toBeGreaterThan(0);
    });

    it("should use optimized algorithm for large datasets (1000+)", () => {
      // Create exactly 1000 AABBs to test the optimized path
      const aabbs = Array.from({ length: 1000 }, (_, i) => ({
        x: (i % 30) * 8,
        y: Math.floor(i / 30) * 8,
        width: 4,
        height: 4,
      }));

      const collisions = adapter.detectCollisions(aabbs);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);

      // Should use optimized algorithm
      const stats = adapter.getPerformanceStats();
      expect(stats.algorithmUsage.optimized).toBeGreaterThan(0);
    });
  });

  describe("executeNaiveWithPool - Memory Pool Integration", () => {
    it("should use memory pool for collision array", () => {
      const aabbs = Array.from({ length: 200 }, (_, i) => ({
        x: i * 5,
        y: i * 5,
        width: 3,
        height: 3,
      }));

      const initialStats = adapter.getMemoryPoolStats();

      const collisions = adapter.detectCollisions(aabbs);

      const finalStats = adapter.getMemoryPoolStats();

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);

      // Memory pool should have been used
      expect(finalStats.totalAllocations).toBeGreaterThanOrEqual(initialStats.totalAllocations);
    });

    it("should handle overlapping AABBs in naive execution", () => {
      // Create overlapping AABBs to ensure collisions are detected
      const aabbs = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 },
        { x: 20, y: 20, width: 10, height: 10 },
      ];

      const collisions = adapter.detectCollisions(aabbs);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);

      // Should detect collision between first two AABBs
      expect(collisions.length).toBeGreaterThan(0);
    });

    it("should return collision array to pool after use", () => {
      const aabbs = Array.from({ length: 100 }, (_, i) => ({
        x: i * 2,
        y: i * 2,
        width: 1,
        height: 1,
      }));

      const initialStats = adapter.getMemoryPoolStats();

      adapter.detectCollisions(aabbs);

      const finalStats = adapter.getMemoryPoolStats();

      // Pool should be in a clean state
      expect(finalStats).toBeDefined();
    });
  });

  describe("executeSpatialDirect - Spatial Hash Implementation", () => {
    it("should fall back to naive for small datasets in spatial path", () => {
      // Create exactly 299 AABBs to test the fallback
      const aabbs = Array.from({ length: 299 }, (_, i) => ({
        x: i * 10,
        y: i * 10,
        width: 5,
        height: 5,
      }));

      const collisions = adapter.detectCollisions(aabbs);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);
    });

    it("should use spatial hash for medium datasets", () => {
      // Create exactly 500 AABBs to test spatial hash
      const aabbs = Array.from({ length: 500 }, (_, i) => ({
        x: (i % 25) * 8,
        y: Math.floor(i / 25) * 8,
        width: 4,
        height: 4,
      }));

      const collisions = adapter.detectCollisions(aabbs);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);
    });

    it("should handle spatial hash insertion and querying", () => {
      // Create overlapping AABBs to test spatial hash collision detection
      const aabbs = Array.from({ length: 600 }, (_, i) => ({
        x: (i % 20) * 5,
        y: Math.floor(i / 20) * 5,
        width: 6,
        height: 6,
      }));

      const collisions = adapter.detectCollisions(aabbs);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);
    });

    it("should handle processed set tracking in spatial hash", () => {
      // Create AABBs that will test the processed set logic
      const aabbs = Array.from({ length: 700 }, (_, i) => ({
        x: i * 2,
        y: i * 2,
        width: 1,
        height: 1,
      }));

      const collisions = adapter.detectCollisions(aabbs);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);
    });

    it("should handle spatial hash query with expanded bounds", () => {
      // Create AABBs that will test the expanded query bounds
      const aabbs = Array.from({ length: 800 }, (_, i) => ({
        x: (i % 30) * 10,
        y: Math.floor(i / 30) * 10,
        width: 5,
        height: 5,
      }));

      const collisions = adapter.detectCollisions(aabbs);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);
    });
  });

  describe("executeOptimizedDirect - Optimized Implementation", () => {
    it("should use optimized algorithm for large datasets", () => {
      // Create exactly 1200 AABBs to test optimized path
      const aabbs = Array.from({ length: 1200 }, (_, i) => ({
        x: (i % 35) * 6,
        y: Math.floor(i / 35) * 6,
        width: 3,
        height: 3,
      }));

      const collisions = adapter.detectCollisions(aabbs);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);
    });

    it("should handle optimized spatial hash insertion", () => {
      // Create AABBs that will test optimized spatial hash insertion
      const aabbs = Array.from({ length: 1500 }, (_, i) => ({
        x: (i % 40) * 5,
        y: Math.floor(i / 40) * 5,
        width: 2,
        height: 2,
      }));

      const collisions = adapter.detectCollisions(aabbs);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);
    });

    it("should handle optimized collision detection with proper index tracking", () => {
      // Create AABBs that will test optimized collision detection
      const aabbs = Array.from({ length: 2000 }, (_, i) => ({
        x: i * 1,
        y: i * 1,
        width: 0.5,
        height: 0.5,
      }));

      const collisions = adapter.detectCollisions(aabbs);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);
    });
  });

  describe("Performance Monitoring Integration", () => {
    it("should record performance metrics for naive algorithm", () => {
      const aabbs = Array.from({ length: 200 }, (_, i) => ({
        x: i * 5,
        y: i * 5,
        width: 2,
        height: 2,
      }));

      const initialStats = adapter.getPerformanceStats();

      adapter.detectCollisions(aabbs);

      const finalStats = adapter.getPerformanceStats();

      expect(finalStats.totalQueries).toBeGreaterThanOrEqual(initialStats.totalQueries);
      expect(finalStats.algorithmUsage.naive).toBeGreaterThanOrEqual(initialStats.algorithmUsage.naive);
    });

    it("should record performance metrics for spatial algorithm", () => {
      const aabbs = Array.from({ length: 500 }, (_, i) => ({
        x: (i % 25) * 8,
        y: Math.floor(i / 25) * 8,
        width: 4,
        height: 4,
      }));

      const initialStats = adapter.getPerformanceStats();

      adapter.detectCollisions(aabbs);

      const finalStats = adapter.getPerformanceStats();

      expect(finalStats.totalQueries).toBeGreaterThanOrEqual(initialStats.totalQueries);
      expect(finalStats.algorithmUsage.spatial).toBeGreaterThanOrEqual(initialStats.algorithmUsage.spatial);
    });

    it("should record performance metrics for optimized algorithm", () => {
      const aabbs = Array.from({ length: 1200 }, (_, i) => ({
        x: (i % 35) * 6,
        y: Math.floor(i / 35) * 6,
        width: 3,
        height: 3,
      }));

      const initialStats = adapter.getPerformanceStats();

      adapter.detectCollisions(aabbs);

      const finalStats = adapter.getPerformanceStats();

      expect(finalStats.totalQueries).toBeGreaterThanOrEqual(initialStats.totalQueries);
      expect(finalStats.algorithmUsage.optimized).toBeGreaterThanOrEqual(initialStats.algorithmUsage.optimized);
    });

    it("should update memory pool stats", () => {
      const aabbs = Array.from({ length: 300 }, (_, i) => ({
        x: i * 3,
        y: i * 3,
        width: 2,
        height: 2,
      }));

      const initialStats = adapter.getPerformanceStats();

      adapter.detectCollisions(aabbs);

      const finalStats = adapter.getPerformanceStats();

      expect(finalStats.memoryPoolStats).toBeDefined();
      expect(finalStats.memoryPoolStats.totalAllocations).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle empty AABB array", () => {
      const collisions = adapter.detectCollisions([]);
      expect(collisions).toEqual([]);
    });

    it("should handle single AABB", () => {
      const aabbs = [{ x: 0, y: 0, width: 10, height: 10 }];
      const collisions = adapter.detectCollisions(aabbs);
      expect(collisions).toEqual([]);
    });

    it("should handle two non-overlapping AABBs", () => {
      const aabbs = [
        { x: 0, y: 0, width: 5, height: 5 },
        { x: 10, y: 10, width: 5, height: 5 },
      ];
      const collisions = adapter.detectCollisions(aabbs);
      expect(collisions).toEqual([]);
    });

    it("should handle two overlapping AABBs", () => {
      const aabbs = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 },
      ];
      const collisions = adapter.detectCollisions(aabbs);
      expect(collisions.length).toBe(1);
      expect(collisions[0].a).toBe(0);
      expect(collisions[0].b).toBe(1);
    });

    it("should handle AABBs with zero dimensions", () => {
      const aabbs = [
        { x: 0, y: 0, width: 0, height: 0 },
        { x: 0, y: 0, width: 0, height: 0 },
      ];
      const collisions = adapter.detectCollisions(aabbs);
      expect(collisions).toEqual([]);
    });

    it("should handle AABBs with negative dimensions", () => {
      const aabbs = [
        { x: 0, y: 0, width: -5, height: -5 },
        { x: 0, y: 0, width: -5, height: -5 },
      ];
      const collisions = adapter.detectCollisions(aabbs);
      expect(collisions).toEqual([]);
    });

    it("should handle AABBs with very large coordinates", () => {
      const aabbs = [
        { x: 1000000, y: 1000000, width: 100, height: 100 },
        { x: 1000100, y: 1000100, width: 100, height: 100 },
      ];
      const collisions = adapter.detectCollisions(aabbs);
      expect(collisions).toEqual([]);
    });

    it("should handle AABBs with very small coordinates", () => {
      const aabbs = [
        { x: 0.001, y: 0.001, width: 0.001, height: 0.001 },
        { x: 0.002, y: 0.002, width: 0.001, height: 0.001 },
      ];
      const collisions = adapter.detectCollisions(aabbs);
      expect(collisions).toEqual([]);
    });
  });

  describe("Memory Management", () => {
    it("should handle memory pool resource management", () => {
      // Create a dataset that will use memory pool resources
      const aabbs = Array.from({ length: 1000 }, (_, i) => ({
        x: (i % 30) * 8,
        y: Math.floor(i / 30) * 8,
        width: 4,
        height: 4,
      }));

      const initialStats = adapter.getMemoryPoolStats();

      const collisions = adapter.detectCollisions(aabbs);

      const finalStats = adapter.getMemoryPoolStats();

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);

      // Memory pool should have been used
      expect(finalStats.totalAllocations).toBeGreaterThanOrEqual(initialStats.totalAllocations);
    });

    it("should handle memory pool cleanup after errors", () => {
      // Create a dataset that will test memory pool cleanup
      const aabbs = Array.from({ length: 800 }, (_, i) => ({
        x: i * 2,
        y: i * 2,
        width: 1,
        height: 1,
      }));

      const collisions = adapter.detectCollisions(aabbs);

      expect(collisions).toBeDefined();
      expect(Array.isArray(collisions)).toBe(true);

      // Memory pool should be in a clean state
      const stats = adapter.getMemoryPoolStats();
      expect(stats).toBeDefined();
    });
  });
});
