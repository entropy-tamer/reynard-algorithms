import { describe, it, expect } from "vitest";
import { intersectionAABB } from "../../../geometry/collision/aabb-operations";
import type { AABB } from "../../../geometry/collision/aabb-types";

// Helper function for creating AABB test objects
const createAABB = (x: number, y: number, width: number, height: number): AABB => ({
  x,
  y,
  width,
  height,
});

describe("intersectionAABB", () => {
  it("should return intersection of overlapping AABBs", () => {
    const a = createAABB(0, 0, 100, 100);
    const b = createAABB(50, 50, 100, 100);
    const intersection = intersectionAABB(a, b);

    expect(intersection).toEqual({
      x: 50,
      y: 50,
      width: 50,
      height: 50,
    });
  });

  it("should return null for non-overlapping AABBs", () => {
    const a = createAABB(0, 0, 50, 50);
    const b = createAABB(100, 100, 50, 50);
    const intersection = intersectionAABB(a, b);

    expect(intersection).toBeNull();
  });

  it("should return null for touching AABBs", () => {
    const a = createAABB(0, 0, 50, 50);
    const b = createAABB(50, 0, 50, 50); // Touching on right edge
    const intersection = intersectionAABB(a, b);

    expect(intersection).toBeNull();
  });

  it("should handle identical AABBs", () => {
    const a = createAABB(10, 20, 30, 40);
    const intersection = intersectionAABB(a, a);

    expect(intersection).toEqual(a);
  });

  it("should handle nested AABBs", () => {
    const outer = createAABB(0, 0, 100, 100);
    const inner = createAABB(25, 25, 50, 50);
    const intersection = intersectionAABB(outer, inner);

    expect(intersection).toEqual(inner);
  });
});
