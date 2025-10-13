import { describe, it, expect } from "vitest";
import { unionAABB } from "../../../geometry/collision/aabb";
import type { AABB } from "../../../geometry/collision/aabb/aabb-types";

// Helper function for creating AABB test objects
const createAABB = (x: number, y: number, width: number, height: number): AABB => ({
  x,
  y,
  width,
  height,
});

describe("unionAABB", () => {
  it("should create union of overlapping AABBs", () => {
    const a = createAABB(0, 0, 100, 100);
    const b = createAABB(50, 50, 100, 100);
    const union = unionAABB(a, b);

    expect(union).toEqual({
      x: 0,
      y: 0,
      width: 150,
      height: 150,
    });
  });

  it("should create union of non-overlapping AABBs", () => {
    const a = createAABB(0, 0, 50, 50);
    const b = createAABB(100, 100, 50, 50);
    const union = unionAABB(a, b);

    expect(union).toEqual({
      x: 0,
      y: 0,
      width: 150,
      height: 150,
    });
  });

  it("should handle identical AABBs", () => {
    const a = createAABB(10, 20, 30, 40);
    const union = unionAABB(a, a);

    expect(union).toEqual(a);
  });

  it("should handle nested AABBs", () => {
    const outer = createAABB(0, 0, 100, 100);
    const inner = createAABB(25, 25, 50, 50);
    const union = unionAABB(outer, inner);

    expect(union).toEqual(outer);
  });
});
