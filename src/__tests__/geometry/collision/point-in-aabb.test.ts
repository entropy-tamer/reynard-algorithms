import { describe, it, expect } from "vitest";
import { pointInAABB } from "../../../computational-geometry/collision/aabb-operations";
import type { AABB } from "../../../computational-geometry/collision/aabb-types";

// Helper function for creating AABB test objects
const createAABB = (x: number, y: number, width: number, height: number): AABB => ({
  x,
  y,
  width,
  height,
});

describe("pointInAABB", () => {
  const aabb = createAABB(10, 20, 100, 80);

  it("should return true for point inside AABB", () => {
    expect(pointInAABB({ x: 50, y: 50 }, aabb)).toBe(true);
    expect(pointInAABB({ x: 10, y: 20 }, aabb)).toBe(true); // Top-left corner
    expect(pointInAABB({ x: 110, y: 100 }, aabb)).toBe(true); // Bottom-right corner
  });

  it("should return false for point outside AABB", () => {
    expect(pointInAABB({ x: 5, y: 50 }, aabb)).toBe(false); // Left of AABB
    expect(pointInAABB({ x: 50, y: 10 }, aabb)).toBe(false); // Above AABB
    expect(pointInAABB({ x: 120, y: 50 }, aabb)).toBe(false); // Right of AABB
    expect(pointInAABB({ x: 50, y: 110 }, aabb)).toBe(false); // Below AABB
  });

  it("should handle edge cases", () => {
    expect(pointInAABB({ x: 0, y: 0 }, createAABB(0, 0, 0, 0))).toBe(true); // Zero-size AABB
  });
});
