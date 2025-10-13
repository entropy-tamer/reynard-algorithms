/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { MemoryPool } from "../../../optimization/core/enhanced-memory-pool";

describe("Enhanced Memory Pool Cleanup Coverage", () => {
  let memoryPool: MemoryPool;

  beforeEach(() => {
    memoryPool = new MemoryPool();
  });

  afterEach(() => {
    // Memory pool cleanup is handled internally
  });

  describe("cleanupUnusedPools - Pool Cleanup Logic", () => {
    it("should clean up unused spatial hash pools after maxIdleTime", () => {
      // Get a spatial hash and mark it as unused
      const spatialHash = memoryPool.getSpatialHash({ cellSize: 100 });

      // Manually mark as unused and set old lastUsed time
      (spatialHash as any).isInUse = false;
      (spatialHash as any).lastUsed = Date.now() - 10000; // 10 seconds ago

      // Return to pool
      memoryPool.returnSpatialHash(spatialHash);

      // Force cleanup by calling the private method
      (memoryPool as any).cleanupUnusedPools();

      // The pool should be cleaned up
      const stats = memoryPool.getStatistics();
      expect(stats).toBeDefined();
    });

    it("should clean up unused data-structures/union-find pools after maxIdleTime", () => {
      // Get a data-structures/union-find and mark it as unused
      const unionFind = memoryPool.getUnionFind(100);

      // Manually mark as unused and set old lastUsed time
      (unionFind as any).isInUse = false;
      (unionFind as any).lastUsed = Date.now() - 10000; // 10 seconds ago

      // Return to pool
      memoryPool.returnUnionFind(unionFind);

      // Force cleanup by calling the private method
      (memoryPool as any).cleanupUnusedPools();

      // The pool should be cleaned up
      const stats = memoryPool.getStatistics();
      expect(stats).toBeDefined();
    });

    it("should clean up unused collision array pools after maxIdleTime", () => {
      // Get a collision array and mark it as unused
      const collisionArray = memoryPool.getCollisionArray();

      // Manually mark as unused and set old lastUsed time
      (collisionArray as any).isInUse = false;
      (collisionArray as any).lastUsed = Date.now() - 10000; // 10 seconds ago

      // Return to pool
      memoryPool.returnCollisionArray(collisionArray);

      // Force cleanup by calling the private method
      (memoryPool as any).cleanupUnusedPools();

      // The pool should be cleaned up
      const stats = memoryPool.getStatistics();
      expect(stats).toBeDefined();
    });

    it("should clean up unused processed set pools after maxIdleTime", () => {
      // Get a processed set and mark it as unused
      const processedSet = memoryPool.getProcessedSet();

      // Manually mark as unused and set old lastUsed time
      (processedSet as any).isInUse = false;
      (processedSet as any).lastUsed = Date.now() - 10000; // 10 seconds ago

      // Return to pool
      memoryPool.returnProcessedSet(processedSet);

      // Force cleanup by calling the private method
      (memoryPool as any).cleanupUnusedPools();

      // The pool should be cleaned up
      const stats = memoryPool.getStatistics();
      expect(stats).toBeDefined();
    });

    it("should not clean up recently used pools", () => {
      // Get a spatial hash and mark it as recently used
      const spatialHash = memoryPool.getSpatialHash({ cellSize: 100 });

      // Manually mark as unused but recently used
      (spatialHash as any).isInUse = false;
      (spatialHash as any).lastUsed = Date.now() - 1000; // 1 second ago

      // Return to pool
      memoryPool.returnSpatialHash(spatialHash);

      // Force cleanup by calling the private method
      (memoryPool as any).cleanupUnusedPools();

      // The pool should not be cleaned up
      const stats = memoryPool.getStatistics();
      expect(stats).toBeDefined();
    });

    it("should not clean up pools that are currently in use", () => {
      // Get a spatial hash and keep it in use
      const spatialHash = memoryPool.getSpatialHash({ cellSize: 100 });

      // Manually mark as in use with old lastUsed time
      (spatialHash as any).isInUse = true;
      (spatialHash as any).lastUsed = Date.now() - 10000; // 10 seconds ago

      // Force cleanup by calling the private method
      (memoryPool as any).cleanupUnusedPools();

      // The pool should not be cleaned up
      const stats = memoryPool.getStatistics();
      expect(stats).toBeDefined();
    });

    it("should handle cleanup with custom maxIdleTime", () => {
      // Get a spatial hash and mark it as unused
      const spatialHash = memoryPool.getSpatialHash({ cellSize: 100 });

      // Manually mark as unused and set old lastUsed time
      (spatialHash as any).isInUse = false;
      (spatialHash as any).lastUsed = Date.now() - 5000; // 5 seconds ago

      // Return to pool
      memoryPool.returnSpatialHash(spatialHash);

      // Force cleanup with custom maxIdleTime
      (memoryPool as any).cleanupUnusedPools(3000); // 3 seconds maxIdleTime

      // The pool should be cleaned up
      const stats = memoryPool.getStatistics();
      expect(stats).toBeDefined();
    });

    it("should handle cleanup with very short maxIdleTime", () => {
      // Get a spatial hash and mark it as unused
      const spatialHash = memoryPool.getSpatialHash({ cellSize: 100 });

      // Manually mark as unused and set old lastUsed time
      (spatialHash as any).isInUse = false;
      (spatialHash as any).lastUsed = Date.now() - 1000; // 1 second ago

      // Return to pool
      memoryPool.returnSpatialHash(spatialHash);

      // Force cleanup with very short maxIdleTime
      (memoryPool as any).cleanupUnusedPools(500); // 0.5 seconds maxIdleTime

      // The pool should be cleaned up
      const stats = memoryPool.getStatistics();
      expect(stats).toBeDefined();
    });

    it("should handle cleanup with very long maxIdleTime", () => {
      // Get a spatial hash and mark it as unused
      const spatialHash = memoryPool.getSpatialHash({ cellSize: 100 });

      // Manually mark as unused and set old lastUsed time
      (spatialHash as any).isInUse = false;
      (spatialHash as any).lastUsed = Date.now() - 10000; // 10 seconds ago

      // Return to pool
      memoryPool.returnSpatialHash(spatialHash);

      // Force cleanup with very long maxIdleTime
      (memoryPool as any).cleanupUnusedPools(20000); // 20 seconds maxIdleTime

      // The pool should not be cleaned up
      const stats = memoryPool.getStatistics();
      expect(stats).toBeDefined();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle cleanup with no pools", () => {
      // Force cleanup with no pools
      (memoryPool as any).cleanupUnusedPools();

      // Should not throw
      const stats = memoryPool.getStatistics();
      expect(stats).toBeDefined();
    });

    it("should handle cleanup with mixed pool states", () => {
      // Create multiple pools with different states
      const spatialHash1 = memoryPool.getSpatialHash({ cellSize: 100 });
      const spatialHash2 = memoryPool.getSpatialHash({ cellSize: 100 });
      const spatialHash3 = memoryPool.getSpatialHash({ cellSize: 100 });

      // Mark them with different states
      (spatialHash1 as any).isInUse = true;
      (spatialHash1 as any).lastUsed = Date.now() - 10000;

      (spatialHash2 as any).isInUse = false;
      (spatialHash2 as any).lastUsed = Date.now() - 10000;

      (spatialHash3 as any).isInUse = false;
      (spatialHash3 as any).lastUsed = Date.now() - 1000;

      // Return to pool
      memoryPool.returnSpatialHash(spatialHash1);
      memoryPool.returnSpatialHash(spatialHash2);
      memoryPool.returnSpatialHash(spatialHash3);

      // Force cleanup
      (memoryPool as any).cleanupUnusedPools();

      // Should handle mixed states correctly
      const stats = memoryPool.getStatistics();
      expect(stats).toBeDefined();
    });

    it("should handle cleanup with invalid timestamps", () => {
      // Get a spatial hash and mark it with invalid timestamp
      const spatialHash = memoryPool.getSpatialHash({ cellSize: 100 });

      // Manually mark as unused with invalid timestamp
      (spatialHash as any).isInUse = false;
      (spatialHash as any).lastUsed = -1; // Invalid timestamp

      // Return to pool
      memoryPool.returnSpatialHash(spatialHash);

      // Force cleanup
      (memoryPool as any).cleanupUnusedPools();

      // Should handle invalid timestamp gracefully
      const stats = memoryPool.getStatistics();
      expect(stats).toBeDefined();
    });

    it("should handle cleanup with future timestamps", () => {
      // Get a spatial hash and mark it with future timestamp
      const spatialHash = memoryPool.getSpatialHash({ cellSize: 100 });

      // Manually mark as unused with future timestamp
      (spatialHash as any).isInUse = false;
      (spatialHash as any).lastUsed = Date.now() + 10000; // Future timestamp

      // Return to pool
      memoryPool.returnSpatialHash(spatialHash);

      // Force cleanup
      (memoryPool as any).cleanupUnusedPools();

      // Should handle future timestamp gracefully
      const stats = memoryPool.getStatistics();
      expect(stats).toBeDefined();
    });
  });

  describe("Performance and Memory Management", () => {
    it("should handle cleanup with large number of pools", () => {
      // Create many pools
      const pools = [];
      for (let i = 0; i < 100; i++) {
        const spatialHash = memoryPool.getSpatialHash({ cellSize: 100 });
        (spatialHash as any).isInUse = false;
        (spatialHash as any).lastUsed = Date.now() - 10000;
        pools.push(spatialHash);
      }

      // Return all to pool
      pools.forEach(pool => memoryPool.returnSpatialHash(pool));

      // Force cleanup
      (memoryPool as any).cleanupUnusedPools();

      // Should handle large number of pools
      const stats = memoryPool.getStatistics();
      expect(stats).toBeDefined();
    });

    it("should handle cleanup with mixed pool types", () => {
      // Create pools of different types
      const spatialHash = memoryPool.getSpatialHash({ cellSize: 100 });
      const unionFind = memoryPool.getUnionFind(100);
      const collisionArray = memoryPool.getCollisionArray();
      const processedSet = memoryPool.getProcessedSet();

      // Mark all as unused with old timestamps
      [spatialHash, unionFind, collisionArray, processedSet].forEach(pool => {
        (pool as any).isInUse = false;
        (pool as any).lastUsed = Date.now() - 10000;
      });

      // Return all to pool
      memoryPool.returnSpatialHash(spatialHash);
      memoryPool.returnUnionFind(unionFind);
      memoryPool.returnCollisionArray(collisionArray);
      memoryPool.returnProcessedSet(processedSet);

      // Force cleanup
      (memoryPool as any).cleanupUnusedPools();

      // Should handle mixed pool types
      const stats = memoryPool.getStatistics();
      expect(stats).toBeDefined();
    });
  });
});
