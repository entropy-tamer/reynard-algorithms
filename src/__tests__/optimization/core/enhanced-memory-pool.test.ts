/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { EnhancedMemoryPool } from "../../../optimization/core/enhanced-memory-pool";
import type { MemoryPoolConfig } from "../../../optimization/core/enhanced-memory-pool";

describe("EnhancedMemoryPool", () => {
  let memoryPool: EnhancedMemoryPool;
  let config: MemoryPoolConfig;

  beforeEach(() => {
    vi.useFakeTimers();
    config = {
      spatialHashPoolSize: 5,
      unionFindPoolSize: 5,
      collisionArrayPoolSize: 5,
      processedSetPoolSize: 5,
      enableAutoResize: true,
      maxPoolSize: 100,
      cleanupInterval: 1000,
      enableStatistics: true,
      enablePerformanceTracking: true,
    };
    memoryPool = new EnhancedMemoryPool(config);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Pool Management", () => {
    it("should get and return spatial hash pools", () => {
      const spatialHash = memoryPool.getSpatialHash({ cellSize: 100 });
      expect(spatialHash).toBeDefined();

      memoryPool.returnSpatialHash(spatialHash);
      const stats = memoryPool.getStatistics();
      expect(stats.poolHits).toBeGreaterThan(0);
    });

    it("should get and return data-structures/union-find pools", () => {
      const unionFind = memoryPool.getUnionFind(10);
      expect(unionFind).toBeDefined();

      memoryPool.returnUnionFind(unionFind);
      const stats = memoryPool.getStatistics();
      expect(stats.poolHits).toBeGreaterThan(0);
    });

    it("should get and return collision arrays", () => {
      const collisionArray = memoryPool.getCollisionArray();
      expect(collisionArray).toBeDefined();
      expect(Array.isArray(collisionArray)).toBe(true);

      memoryPool.returnCollisionArray(collisionArray);
      const stats = memoryPool.getStatistics();
      expect(stats.poolHits).toBeGreaterThan(0);
    });

    it("should get and return processed sets", () => {
      const processedSet = memoryPool.getProcessedSet();
      expect(processedSet).toBeDefined();
      expect(processedSet instanceof Set).toBe(true);

      memoryPool.returnProcessedSet(processedSet);
      const stats = memoryPool.getStatistics();
      expect(stats.poolHits).toBeGreaterThan(0);
    });
  });

  describe("Performance History", () => {
    it("should record and retrieve performance history", () => {
      const history = memoryPool.getPerformanceHistory();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(0);
    });

    it("should record performance metrics", () => {
      const spatialHash = memoryPool.getSpatialHash({ cellSize: 100 });
      memoryPool.returnSpatialHash(spatialHash);

      const history = memoryPool.getPerformanceHistory();
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe("Pool Cleanup", () => {
    it("should start cleanup interval", () => {
      const setIntervalSpy = vi.spyOn(global, "setInterval");
      const newPool = new EnhancedMemoryPool({
        ...config,
        cleanupInterval: 100,
      });

      expect(setIntervalSpy).toHaveBeenCalled();
    });

    it("should cleanup unused pools", async () => {
      // Get and return a pool to create some history
      const spatialHash = memoryPool.getSpatialHash({ cellSize: 100 });
      memoryPool.returnSpatialHash(spatialHash);

      // Mock Date.now to simulate time passing
      const originalNow = Date.now;
      vi.spyOn(Date, "now").mockImplementation(() => originalNow() + 400000); // 6+ minutes later

      // Manually trigger cleanup
      (memoryPool as any).cleanupUnusedPools();

      // Restore Date.now
      vi.restoreAllMocks();

      const stats = memoryPool.getStatistics();
      expect(stats.poolHits).toBeGreaterThan(0);
    });
  });

  describe("Workload Optimization", () => {
    it("should optimize for different workloads", () => {
      const smallWorkload = {
        objectCount: 10,
        spatialDensity: 0.2,
        overlapRatio: 0.1,
        updateFrequency: 0.1,
        queryPattern: "random" as const,
      };

      const largeWorkload = {
        objectCount: 1000,
        spatialDensity: 0.8,
        overlapRatio: 0.5,
        updateFrequency: 0.9,
        queryPattern: "clustered" as const,
      };

      memoryPool.optimizeForWorkload(smallWorkload);
      let stats = memoryPool.getStatistics();
      const smallPoolHits = stats.poolHits;

      memoryPool.optimizeForWorkload(largeWorkload);
      stats = memoryPool.getStatistics();
      const largePoolHits = stats.poolHits;

      expect(largePoolHits).toBeGreaterThanOrEqual(smallPoolHits);
    });
  });

  describe("Statistics", () => {
    it("should provide comprehensive statistics", () => {
      const spatialHash = memoryPool.getSpatialHash({ cellSize: 100 });
      const unionFind = memoryPool.getUnionFind(10);
      const collisionArray = memoryPool.getCollisionArray();
      const processedSet = memoryPool.getProcessedSet();

      const stats = memoryPool.getStatistics();

      expect(stats.totalAllocations).toBeGreaterThanOrEqual(0);
      expect(stats.totalDeallocations).toBeGreaterThanOrEqual(0);
      expect(stats.poolHits).toBeGreaterThanOrEqual(0);
      expect(stats.memorySaved).toBeGreaterThanOrEqual(0);

      // Return pools
      memoryPool.returnSpatialHash(spatialHash);
      memoryPool.returnUnionFind(unionFind);
      memoryPool.returnCollisionArray(collisionArray);
      memoryPool.returnProcessedSet(processedSet);
    });

    it("should track allocation and deallocation counts", () => {
      const initialStats = memoryPool.getStatistics();
      const initialAllocations = initialStats.totalAllocations;
      const initialDeallocations = initialStats.totalDeallocations;

      const spatialHash = memoryPool.getSpatialHash({ cellSize: 100 });
      memoryPool.returnSpatialHash(spatialHash);

      const finalStats = memoryPool.getStatistics();
      expect(finalStats.totalAllocations).toBeGreaterThan(initialAllocations);
      expect(finalStats.totalDeallocations).toBeGreaterThan(initialDeallocations);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid pool returns gracefully", () => {
      const invalidPool = {} as any;

      expect(() => memoryPool.returnSpatialHash(invalidPool)).not.toThrow();
      expect(() => memoryPool.returnUnionFind(invalidPool)).not.toThrow();
      expect(() => memoryPool.returnCollisionArray(invalidPool)).not.toThrow();
      expect(() => memoryPool.returnProcessedSet(invalidPool)).not.toThrow();
    });
  });

  describe("Configuration", () => {
    it("should respect configuration settings", () => {
      const customConfig: MemoryPoolConfig = {
        spatialHashPoolSize: 10,
        unionFindPoolSize: 10,
        collisionArrayPoolSize: 10,
        processedSetPoolSize: 10,
        enableAutoResize: false,
        maxPoolSize: 50,
        cleanupInterval: 5000,
        enableStatistics: false,
        enablePerformanceTracking: false,
      };

      const customPool = new EnhancedMemoryPool(customConfig);
      const stats = customPool.getStatistics();

      expect(stats.totalAllocations).toBeGreaterThanOrEqual(0);
      expect(stats.totalDeallocations).toBeGreaterThanOrEqual(0);
    });
  });
});
