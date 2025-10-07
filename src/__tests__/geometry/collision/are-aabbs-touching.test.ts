import { describe, it, expect } from "vitest";
import { areAABBsTouching } from "../../../computational-geometry/collision/aabb-operations";
import type { AABB } from "../../../computational-geometry/collision/aabb-types";

// Helper function for creating AABB test objects
const createAABB = (x: number, y: number, width: number, height: number): AABB => ({
  x,
  y,
  width,
  height,
});

describe("areAABBsTouching", () => {
  it("should return true for AABBs touching on horizontal edge", () => {
    const a = createAABB(0, 0, 50, 50);
    const b = createAABB(50, 0, 50, 50); // Touching on right edge

    expect(areAABBsTouching(a, b)).toBe(true);
  });

  it("should return true for AABBs touching on vertical edge", () => {
    const a = createAABB(0, 0, 50, 50);
    const b = createAABB(0, 50, 50, 50); // Touching on bottom edge

    expect(areAABBsTouching(a, b)).toBe(true);
  });

  it("should return false for overlapping AABBs", () => {
    const a = createAABB(0, 0, 100, 100);
    const b = createAABB(50, 50, 100, 100); // Overlapping

    expect(areAABBsTouching(a, b)).toBe(false);
  });

  it("should return false for AABBs with gap", () => {
    const a = createAABB(0, 0, 50, 50);
    const b = createAABB(60, 0, 50, 50); // Gap of 10 pixels

    expect(areAABBsTouching(a, b)).toBe(false);
  });

  it("should return false for identical AABBs", () => {
    const aabb = createAABB(10, 20, 30, 40);
    expect(areAABBsTouching(aabb, aabb)).toBe(false);
  });

  it("should handle corner touching", () => {
    const a = createAABB(0, 0, 50, 50);
    const b = createAABB(50, 50, 50, 50); // Touching at corner

    expect(areAABBsTouching(a, b)).toBe(false); // Corner touching is not considered touching
  });

  it("should handle T-shaped touching", () => {
    const a = createAABB(0, 0, 100, 50);
    const b = createAABB(50, 50, 50, 50); // T-shape

    expect(areAABBsTouching(a, b)).toBe(true);
  });
});
