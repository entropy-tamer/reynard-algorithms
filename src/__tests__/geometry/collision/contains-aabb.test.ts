import { describe, it, expect } from "vitest";
import { containsAABB } from "../../../computational-geometry/collision/aabb-operations";
import type { AABB } from "../../../computational-geometry/collision/aabb-types";

// Helper function for creating AABB test objects
const createAABB = (x: number, y: number, width: number, height: number): AABB => ({
  x,
  y,
  width,
  height,
});

describe("containsAABB", () => {
  it("should return true when container fully contains contained AABB", () => {
    const container = createAABB(0, 0, 100, 100);
    const contained = createAABB(25, 25, 50, 50);

    expect(containsAABB(container, contained)).toBe(true);
  });

  it("should return true for identical AABBs", () => {
    const aabb = createAABB(10, 20, 30, 40);
    expect(containsAABB(aabb, aabb)).toBe(true);
  });

  it("should return false when AABBs do not overlap", () => {
    const container = createAABB(0, 0, 50, 50);
    const contained = createAABB(100, 100, 50, 50);

    expect(containsAABB(container, contained)).toBe(false);
  });

  it("should return false when contained AABB extends outside container", () => {
    const container = createAABB(0, 0, 100, 100);
    const contained = createAABB(50, 50, 100, 100); // Extends beyond container

    expect(containsAABB(container, contained)).toBe(false);
  });

  it("should return false when contained AABB touches container edge", () => {
    const container = createAABB(0, 0, 100, 100);
    const contained = createAABB(0, 0, 50, 50); // Touches top-left corner

    expect(containsAABB(container, contained)).toBe(true); // Should be true for edge touching
  });
});
