import { describe, it, expect } from "vitest";
import { expandAABB } from "../../../geometry/collision/aabb-operations";
import type { AABB } from "../../../geometry/collision/aabb-types";

// Helper function for creating AABB test objects
const createAABB = (x: number, y: number, width: number, height: number): AABB => ({
  x,
  y,
  width,
  height,
});

describe("expandAABB", () => {
  it("should expand AABB by given amount", () => {
    const aabb = createAABB(10, 20, 100, 80);
    const expanded = expandAABB(aabb, 5);

    expect(expanded).toEqual({
      x: 5,
      y: 15,
      width: 110,
      height: 90,
    });
  });

  it("should handle zero expansion", () => {
    const aabb = createAABB(10, 20, 100, 80);
    const expanded = expandAABB(aabb, 0);

    expect(expanded).toEqual(aabb);
  });

  it("should handle negative expansion (shrink)", () => {
    const aabb = createAABB(10, 20, 100, 80);
    const shrunk = expandAABB(aabb, -5);

    expect(shrunk).toEqual({
      x: 15,
      y: 25,
      width: 90,
      height: 70,
    });
  });

  it("should handle large expansion", () => {
    const aabb = createAABB(0, 0, 10, 10);
    const expanded = expandAABB(aabb, 100);

    expect(expanded).toEqual({
      x: -100,
      y: -100,
      width: 210,
      height: 210,
    });
  });
});
