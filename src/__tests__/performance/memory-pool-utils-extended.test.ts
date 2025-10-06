/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createSpatialObjectPool,
  createAABBPool,
  createPointPool,
  createVectorPool,
  MemoryPoolManager,
  globalPoolManager,
} from "../../performance/memory-pool-utils";
import type { PerformanceMemoryPoolConfig } from "../../performance/memory-pool-core";

describe("Memory Pool Utils Extended Coverage", () => {
  describe("createSpatialObjectPool", () => {
    it("should create spatial object pool with default config", () => {
      const pool = createSpatialObjectPool();
      const obj = pool.acquire();

      expect(obj).toBeDefined();
      expect(obj.id).toBe("");
      expect(obj.x).toBe(0);
      expect(obj.y).toBe(0);
      expect(obj.width).toBe(0);
      expect(obj.height).toBe(0);
      expect(obj.data).toBeNull();
    });

    it("should create spatial object pool with custom config", () => {
      const config: PerformanceMemoryPoolConfig = {
        initialSize: 5,
        maxSize: 20,
        growthFactor: 2,
        enableStats: true,
        enableOptimization: true,
      };

      const pool = createSpatialObjectPool(config);
      const obj = pool.acquire();

      expect(obj).toBeDefined();
      expect(obj.id).toBe("");
      expect(obj.x).toBe(0);
      expect(obj.y).toBe(0);
      expect(obj.width).toBe(0);
      expect(obj.height).toBe(0);
      expect(obj.data).toBeNull();
    });

    it("should reset spatial object properly", () => {
      const pool = createSpatialObjectPool();
      const obj = pool.acquire();

      // Modify the object
      obj.id = "test-id";
      obj.x = 10;
      obj.y = 20;
      obj.width = 30;
      obj.height = 40;
      obj.data = { id: "data-id", type: "test", category: "entity" };

      // Return and get again
      pool.release(obj);
      const newObj = pool.acquire();

      expect(newObj.id).toBe("");
      expect(newObj.x).toBe(0);
      expect(newObj.y).toBe(0);
      expect(newObj.width).toBe(0);
      expect(newObj.height).toBe(0);
      expect(newObj.data).toBeNull();
    });
  });

  describe("createAABBPool", () => {
    it("should create AABB pool with default config", () => {
      const pool = createAABBPool();
      const obj = pool.acquire();

      expect(obj).toBeDefined();
      expect(obj.x).toBe(0);
      expect(obj.y).toBe(0);
      expect(obj.width).toBe(0);
      expect(obj.height).toBe(0);
    });

    it("should create AABB pool with custom config", () => {
      const config: PerformanceMemoryPoolConfig = {
        initialSize: 10,
        maxSize: 50,
        growthFactor: 1.5,
        enableStats: false,
        enableOptimization: false,
      };

      const pool = createAABBPool(config);
      const obj = pool.acquire();

      expect(obj).toBeDefined();
      expect(obj.x).toBe(0);
      expect(obj.y).toBe(0);
      expect(obj.width).toBe(0);
      expect(obj.height).toBe(0);
    });

    it("should reset AABB object properly", () => {
      const pool = createAABBPool();
      const obj = pool.acquire();

      // Modify the object
      obj.x = 100;
      obj.y = 200;
      obj.width = 300;
      obj.height = 400;

      // Return and get again
      pool.release(obj);
      const newObj = pool.acquire();

      expect(newObj.x).toBe(0);
      expect(newObj.y).toBe(0);
      expect(newObj.width).toBe(0);
      expect(newObj.height).toBe(0);
    });
  });

  describe("createPointPool", () => {
    it("should create point pool with default config", () => {
      const pool = createPointPool();
      const obj = pool.acquire();

      expect(obj).toBeDefined();
      expect(obj.x).toBe(0);
      expect(obj.y).toBe(0);
    });

    it("should create point pool with custom config", () => {
      const config: PerformanceMemoryPoolConfig = {
        initialSize: 15,
        maxSize: 100,
        growthFactor: 3,
        enableStats: true,
        enableOptimization: true,
      };

      const pool = createPointPool(config);
      const obj = pool.acquire();

      expect(obj).toBeDefined();
      expect(obj.x).toBe(0);
      expect(obj.y).toBe(0);
    });

    it("should reset point object properly", () => {
      const pool = createPointPool();
      const obj = pool.acquire();

      // Modify the object
      obj.x = 50;
      obj.y = 75;

      // Return and get again
      pool.release(obj);
      const newObj = pool.acquire();

      expect(newObj.x).toBe(0);
      expect(newObj.y).toBe(0);
    });
  });

  describe("createVectorPool", () => {
    it("should create vector pool with default config", () => {
      const pool = createVectorPool();
      const obj = pool.acquire();

      expect(obj).toBeDefined();
      expect(obj.x).toBe(0);
      expect(obj.y).toBe(0);
      expect(obj.magnitude).toBe(0);
    });

    it("should create vector pool with custom config", () => {
      const config: PerformanceMemoryPoolConfig = {
        initialSize: 8,
        maxSize: 32,
        growthFactor: 2.5,
        enableStats: false,
        enableOptimization: true,
      };

      const pool = createVectorPool(config);
      const obj = pool.acquire();

      expect(obj).toBeDefined();
      expect(obj.x).toBe(0);
      expect(obj.y).toBe(0);
      expect(obj.magnitude).toBe(0);
    });

    it("should reset vector object properly", () => {
      const pool = createVectorPool();
      const obj = pool.acquire();

      // Modify the object
      obj.x = 1.5;
      obj.y = 2.5;
      obj.magnitude = 3.5;

      // Return and get again
      pool.release(obj);
      const newObj = pool.acquire();

      expect(newObj.x).toBe(0);
      expect(newObj.y).toBe(0);
      expect(newObj.magnitude).toBe(0);
    });
  });

  describe("MemoryPoolManager", () => {
    let manager: MemoryPoolManager;

    beforeEach(() => {
      manager = new MemoryPoolManager();
    });

    afterEach(() => {
      manager.clearAllPools();
    });

    it("should create and manage pools", () => {
      const pool = manager.createPool("test-pool", () => ({
        value: 0,
        reset() {
          this.value = 0;
        },
      }));

      expect(pool).toBeDefined();
      const obj = pool.acquire();
      expect(obj.value).toBe(0);
    });

    it("should get existing pool", () => {
      const pool1 = manager.createPool("test-pool", () => ({
        value: 0,
        reset() {
          this.value = 0;
        },
      }));

      const pool2 = manager.getPool("test-pool");
      expect(pool2).toBe(pool1);
    });

    it("should return undefined for non-existent pool", () => {
      const pool = manager.getPool("non-existent");
      expect(pool).toBeUndefined();
    });

    it("should remove pool", () => {
      manager.createPool("test-pool", () => ({
        value: 0,
        reset() {
          this.value = 0;
        },
      }));

      const removed = manager.removePool("test-pool");
      expect(removed).toBe(true);

      const pool = manager.getPool("test-pool");
      expect(pool).toBeUndefined();
    });

    it("should return false when removing non-existent pool", () => {
      const removed = manager.removePool("non-existent");
      expect(removed).toBe(false);
    });

    it("should get all pool statistics", () => {
      const pool1 = manager.createPool("pool1", () => ({
        value: 0,
        reset() {
          this.value = 0;
        },
      }));

      const pool2 = manager.createPool("pool2", () => ({
        value: 0,
        reset() {
          this.value = 0;
        },
      }));

      const stats = manager.getAllStats();
      expect(stats).toHaveProperty("pool1");
      expect(stats).toHaveProperty("pool2");
      expect(stats.pool1).toBeDefined();
      expect(stats.pool2).toBeDefined();
    });

    it("should clear all pools", () => {
      const pool1 = manager.createPool("pool1", () => ({
        value: 0,
        reset() {
          this.value = 0;
        },
      }));

      const pool2 = manager.createPool("pool2", () => ({
        value: 0,
        reset() {
          this.value = 0;
        },
      }));

      manager.clearAllPools();

      // Pools should still exist but be cleared
      expect(manager.getPool("pool1")).toBeDefined();
      expect(manager.getPool("pool2")).toBeDefined();
    });

    it("should handle multiple pools with different configurations", () => {
      const config1: PerformanceMemoryPoolConfig = {
        initialSize: 5,
        maxSize: 20,
        growthFactor: 2,
        enableStats: true,
        enableOptimization: true,
      };

      const config2: PerformanceMemoryPoolConfig = {
        initialSize: 10,
        maxSize: 50,
        growthFactor: 1.5,
        enableStats: false,
        enableOptimization: false,
      };

      const pool1 = manager.createPool(
        "pool1",
        () => ({
          value: 0,
          reset() {
            this.value = 0;
          },
        }),
        config1
      );

      const pool2 = manager.createPool(
        "pool2",
        () => ({
          value: 0,
          reset() {
            this.value = 0;
          },
        }),
        config2
      );

      expect(pool1).toBeDefined();
      expect(pool2).toBeDefined();

      const obj1 = pool1.acquire();
      const obj2 = pool2.acquire();

      expect(obj1.value).toBe(0);
      expect(obj2.value).toBe(0);
    });
  });

  describe("globalPoolManager", () => {
    afterEach(() => {
      globalPoolManager.clearAllPools();
    });

    it("should be a singleton instance", () => {
      expect(globalPoolManager).toBeDefined();
      expect(globalPoolManager).toBeInstanceOf(MemoryPoolManager);
    });

    it("should work with global pool manager", () => {
      const pool = globalPoolManager.createPool("global-test", () => ({
        value: 0,
        reset() {
          this.value = 0;
        },
      }));

      const obj = pool.acquire();
      expect(obj.value).toBe(0);

      obj.value = 42;
      pool.release(obj);

      const newObj = pool.acquire();
      expect(newObj.value).toBe(0);
    });

    it("should manage multiple global pools", () => {
      const pool1 = globalPoolManager.createPool("global-pool1", () => ({
        value: 0,
        reset() {
          this.value = 0;
        },
      }));

      const pool2 = globalPoolManager.createPool("global-pool2", () => ({
        value: 0,
        reset() {
          this.value = 0;
        },
      }));

      const obj1 = pool1.acquire();
      const obj2 = pool2.acquire();

      expect(obj1.value).toBe(0);
      expect(obj2.value).toBe(0);

      const stats = globalPoolManager.getAllStats();
      expect(stats).toHaveProperty("global-pool1");
      expect(stats).toHaveProperty("global-pool2");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle empty pool configurations", () => {
      const config: PerformanceMemoryPoolConfig = {};

      const spatialPool = createSpatialObjectPool(config);
      const aabbPool = createAABBPool(config);
      const pointPool = createPointPool(config);
      const vectorPool = createVectorPool(config);

      expect(spatialPool).toBeDefined();
      expect(aabbPool).toBeDefined();
      expect(pointPool).toBeDefined();
      expect(vectorPool).toBeDefined();
    });

    it("should handle extreme pool configurations", () => {
      const config: PerformanceMemoryPoolConfig = {
        initialSize: 1,
        maxSize: 1,
        growthFactor: 1,
        enableStats: true,
        enableOptimization: true,
      };

      const pool = createSpatialObjectPool(config);
      const obj = pool.acquire();

      expect(obj).toBeDefined();
      expect(obj.id).toBe("");
    });

    it("should handle pool manager with no pools", () => {
      const manager = new MemoryPoolManager();
      const stats = manager.getAllStats();

      expect(stats).toEqual({});
    });

    it("should handle pool manager operations on empty manager", () => {
      const manager = new MemoryPoolManager();

      const pool = manager.getPool("non-existent");
      expect(pool).toBeUndefined();

      const removed = manager.removePool("non-existent");
      expect(removed).toBe(false);

      manager.clearAllPools(); // Should not throw
    });
  });
});
