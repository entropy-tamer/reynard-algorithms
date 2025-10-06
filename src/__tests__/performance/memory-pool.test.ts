/**
 * Memory Pool Tests
 *
 * Comprehensive tests for the memory pool implementation
 */

import { describe, it, expect, beforeEach } from "vitest";
import { MemoryPool, PooledObject } from "../../performance/memory-pool-core";
import { createSpatialObjectPool, createAABBPool, globalPoolManager } from "../../performance/memory-pool-utils";

class TestObject implements PooledObject {
  value: number = 0;
  name: string = "";

  reset(): void {
    this.value = 0;
    this.name = "";
  }
}

describe("MemoryPool", () => {
  let pool: MemoryPool<TestObject>;

  beforeEach(() => {
    pool = new MemoryPool(() => new TestObject(), {
      initialSize: 2,
      maxSize: 10,
    });
  });

  it("should create objects from pool", () => {
    const obj = pool.acquire();
    expect(obj).toBeInstanceOf(TestObject);
    expect(obj.value).toBe(0);
    expect(obj.name).toBe("");
  });

  it("should reuse objects from pool", () => {
    const obj1 = pool.acquire();
    obj1.value = 42;
    obj1.name = "test";

    pool.release(obj1);

    const obj2 = pool.acquire();
    expect(obj2).toBe(obj1);
    expect(obj2.value).toBe(0); // Should be reset
    expect(obj2.name).toBe("");
  });

  it("should track statistics", () => {
    const obj = pool.acquire();
    pool.release(obj);

    const stats = pool.getStats();
    expect(stats.acquired).toBe(1);
    expect(stats.released).toBe(1);
    expect(stats.poolSize).toBe(2);
  });

  it("should respect max size", () => {
    const pool = new MemoryPool(() => new TestObject(), {
      initialSize: 0,
      maxSize: 2,
    });

    const obj1 = pool.acquire();
    const obj2 = pool.acquire();
    const obj3 = pool.acquire();

    pool.release(obj1);
    pool.release(obj2);
    pool.release(obj3); // Should be discarded

    expect(pool.getStats().poolSize).toBe(2);
  });
});

describe("Memory Pool Utils", () => {
  it("should create spatial object pool", () => {
    const pool = createSpatialObjectPool();
    const obj = pool.acquire();

    expect(obj).toHaveProperty("id");
    expect(obj).toHaveProperty("x");
    expect(obj).toHaveProperty("y");
    expect(obj).toHaveProperty("data");
  });

  it("should create AABB pool", () => {
    const pool = createAABBPool();
    const obj = pool.acquire();

    expect(obj).toHaveProperty("x");
    expect(obj).toHaveProperty("y");
    expect(obj).toHaveProperty("width");
    expect(obj).toHaveProperty("height");
  });

  it("should manage multiple pools", () => {
    const pool1 = globalPoolManager.createPool("test1", () => new TestObject());
    const pool2 = globalPoolManager.createPool("test2", () => new TestObject());

    expect(globalPoolManager.getPool("test1")).toBe(pool1);
    expect(globalPoolManager.getPool("test2")).toBe(pool2);

    const stats = globalPoolManager.getAllStats();
    expect(stats).toHaveProperty("test1");
    expect(stats).toHaveProperty("test2");
  });
});
