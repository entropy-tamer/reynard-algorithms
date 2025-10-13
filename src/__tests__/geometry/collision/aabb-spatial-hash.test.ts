import { describe, it, expect } from "vitest";
import { SpatialHash } from "../../../geometry/collision/aabb/aabb-spatial-hash";
import type { AABB } from "../../../geometry/collision/aabb/aabb-types";

// Test utilities
const createAABB = (x: number, y: number, width: number, height: number): AABB => ({
  x,
  y,
  width,
  height,
});

describe("AABB Spatial Hash - Constructor", () => {
  it("should create spatial hash with given cell size", () => {
    const hash = new SpatialHash(100);
    expect(hash).toBeDefined();
  });

  it("should handle different cell sizes", () => {
    const hash1 = new SpatialHash(50);
    const hash2 = new SpatialHash(200);
    expect(hash1).toBeDefined();
    expect(hash2).toBeDefined();
  });
});

describe("AABB Spatial Hash - Insert Operations", () => {
  it("should insert AABB into spatial hash", () => {
    const hash = new SpatialHash(100);
    const aabb = createAABB(50, 50, 50, 50);

    hash.insert(0, aabb);

    // Should not throw and should be able to query
    const results = hash.query(aabb);
    expect(results).toContain(0);
  });

  it("should insert AABB spanning multiple cells", () => {
    const hash = new SpatialHash(50);
    const aabb = createAABB(25, 25, 100, 100); // Spans multiple cells

    hash.insert(0, aabb);

    const results = hash.query(aabb);
    expect(results).toContain(0);
  });

  it("should handle multiple AABBs in same cell", () => {
    const hash = new SpatialHash(100);
    const aabb1 = createAABB(10, 10, 20, 20);
    const aabb2 = createAABB(30, 30, 20, 20);

    hash.insert(0, aabb1);
    hash.insert(1, aabb2);

    const results1 = hash.query(aabb1);
    const results2 = hash.query(aabb2);

    expect(results1).toContain(0);
    expect(results2).toContain(1);
  });

  it("should handle AABB at cell boundaries", () => {
    const hash = new SpatialHash(100);
    const aabb = createAABB(100, 100, 50, 50); // Exactly on boundary

    hash.insert(0, aabb);

    const results = hash.query(aabb);
    expect(results).toContain(0);
  });

  it("should handle negative coordinates", () => {
    const hash = new SpatialHash(100);
    const aabb = createAABB(-50, -50, 100, 100);

    hash.insert(0, aabb);

    const results = hash.query(aabb);
    expect(results).toContain(0);
  });
});

describe("AABB Spatial Hash - Query Operations", () => {
  it("should return empty array for empty hash", () => {
    const hash = new SpatialHash(100);
    const aabb = createAABB(50, 50, 50, 50);

    const results = hash.query(aabb);
    expect(results).toEqual([]);
  });

  it("should return correct indices for overlapping AABBs", () => {
    const hash = new SpatialHash(100);
    const aabb1 = createAABB(0, 0, 50, 50);
    const aabb2 = createAABB(25, 25, 50, 50);
    const aabb3 = createAABB(100, 100, 50, 50);

    hash.insert(0, aabb1);
    hash.insert(1, aabb2);
    hash.insert(2, aabb3);

    const results = hash.query(createAABB(10, 10, 30, 30));
    expect(results).toContain(0);
    expect(results).toContain(1);
    expect(results).not.toContain(2);
  });

  it("should return unique indices", () => {
    const hash = new SpatialHash(50);
    const aabb = createAABB(25, 25, 100, 100); // Spans multiple cells

    hash.insert(0, aabb);

    const results = hash.query(createAABB(30, 30, 20, 20));
    expect(results).toEqual([0]); // Should not contain duplicates
  });

  it("should handle query AABB spanning multiple cells", () => {
    const hash = new SpatialHash(50);
    const aabb1 = createAABB(10, 10, 20, 20);
    const aabb2 = createAABB(60, 60, 20, 20);

    hash.insert(0, aabb1);
    hash.insert(1, aabb2);

    const queryAABB = createAABB(0, 0, 100, 100); // Spans all cells
    const results = hash.query(queryAABB);

    expect(results).toContain(0);
    expect(results).toContain(1);
  });

  it("should handle zero-size AABBs", () => {
    const hash = new SpatialHash(100);
    const aabb = createAABB(50, 50, 0, 0);

    hash.insert(0, aabb);

    const results = hash.query(aabb);
    expect(results).toContain(0);
  });
});

describe("AABB Spatial Hash - Clear Operations", () => {
  it("should clear all stored data", () => {
    const hash = new SpatialHash(100);
    const aabb = createAABB(50, 50, 50, 50);

    hash.insert(0, aabb);
    expect(hash.query(aabb)).toContain(0);

    hash.clear();
    expect(hash.query(aabb)).toEqual([]);
  });

  it("should allow re-insertion after clear", () => {
    const hash = new SpatialHash(100);
    const aabb = createAABB(50, 50, 50, 50);

    hash.insert(0, aabb);
    hash.clear();
    hash.insert(1, aabb);

    const results = hash.query(aabb);
    expect(results).toContain(1);
    expect(results).not.toContain(0);
  });
});

describe("AABB Spatial Hash - Edge Cases", () => {
  it("should handle very small cell size", () => {
    const hash = new SpatialHash(1);
    const aabb = createAABB(0, 0, 10, 10);

    hash.insert(0, aabb);

    const results = hash.query(aabb);
    expect(results).toContain(0);
  });

  it("should handle very large cell size", () => {
    const hash = new SpatialHash(10000);
    const aabb = createAABB(0, 0, 100, 100);

    hash.insert(0, aabb);

    const results = hash.query(aabb);
    expect(results).toContain(0);
  });

  it("should handle floating point coordinates", () => {
    const hash = new SpatialHash(100);
    const aabb = createAABB(50.5, 50.5, 25.25, 25.25);

    hash.insert(0, aabb);

    const results = hash.query(aabb);
    expect(results).toContain(0);
  });

  it("should handle large numbers of objects", () => {
    const hash = new SpatialHash(100);
    const aabbs = Array.from({ length: 1000 }, (_, i) => createAABB((i % 10) * 10, Math.floor(i / 10) * 10, 5, 5));

    aabbs.forEach((aabb, i) => {
      hash.insert(i, aabb);
    });

    const results = hash.query(createAABB(0, 0, 50, 50));
    expect(results.length).toBeGreaterThan(0);
  });
});
