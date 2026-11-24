/**
 * @file Deterministic correctness tests for the SAT/OBB narrow-phase and AABB
 * utility modules that previously had no direct test.
 */
import { describe, it, expect } from "vitest";
import { SAT } from "../../algorithms/collision/narrow-phase/sat/sat-core";
import {
  arePolygonsColliding,
  getMinimumTranslationVector,
} from "../../algorithms/collision/narrow-phase/sat/sat-collision";
import {
  crossProduct,
  dotProduct,
  distance,
  distanceSquared,
  magnitude,
  normalize,
  isPointInsidePolygon,
} from "../../algorithms/collision/narrow-phase/sat/sat-geometry";
import { OBB } from "../../algorithms/collision/narrow-phase/obb/obb-core";
import { getAABBArea, getAABBPerimeter } from "../../algorithms/collision/narrow-phase/aabb/aabb-utils";
import {
  pointInAABB,
  unionAABB,
  intersectionAABB,
  expandAABB,
  containsAABB,
  areAABBsTouching,
} from "../../algorithms/collision/narrow-phase/aabb/aabb-operations";
import { DEFAULT_SAT_CONFIG } from "../../algorithms/collision/narrow-phase/sat/sat-types";
import type { ConvexPolygon } from "../../algorithms/collision/narrow-phase/sat/sat-types";
import type { OBBData } from "../../algorithms/collision/narrow-phase/obb/obb-types";

const square = (minX: number, minY: number, maxX: number, maxY: number, id: string): ConvexPolygon => ({
  id,
  vertices: [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ],
  center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
  radius: Math.hypot((maxX - minX) / 2, (maxY - minY) / 2),
});

describe("SAT", () => {
  const sat = new SAT();

  it("detects two overlapping squares", () => {
    const result = sat.testCollision(square(0, 0, 2, 2, "a"), square(1, 1, 3, 3, "b"));
    expect(result.colliding).toBe(true);
    expect(result.success).toBe(true);
    expect(result.overlap).toBeGreaterThan(0);
  });

  it("rejects two disjoint squares", () => {
    const result = sat.testCollision(square(0, 0, 1, 1, "a"), square(5, 5, 6, 6, "b"));
    expect(result.colliding).toBe(false);
  });

  it("does not reuse a cached result for a same-id square of a different size", () => {
    // Same id, same center (1,1), same vertex count - the old cache key
    // treated these as identical even though their geometry differs.
    const small = square(0, 0, 2, 2, "shared-id");
    const large = square(-2, -2, 4, 4, "shared-id");
    const other = square(3, 3, 4, 4, "other-id");

    // A fresh detector proves the two geometries genuinely differ.
    expect(new SAT().testCollision(small, other).colliding).toBe(false);
    expect(new SAT().testCollision(large, other).colliding).toBe(true);

    // A shared detector must not serve the first result from its cache.
    expect(sat.testCollision(small, other).colliding).toBe(false);
    expect(sat.testCollision(large, other).colliding).toBe(true);
  });

  it("agrees with the functional collision test", () => {
    const a = square(0, 0, 2, 2, "a");
    const b = square(1, 1, 3, 3, "b");
    expect(arePolygonsColliding(a, b, DEFAULT_SAT_CONFIG)).toBe(true);
  });

  it("reports a translation vector that separates overlapping squares", () => {
    const mtv = getMinimumTranslationVector(square(0, 0, 2, 2, "a"), square(1, 1, 3, 3, "b"), DEFAULT_SAT_CONFIG);
    expect(mtv).not.toBeNull();
    expect(magnitude(mtv!)).toBeGreaterThan(0);
  });
});

describe("SAT geometry helpers", () => {
  it("computes dot and cross products", () => {
    expect(dotProduct({ x: 1, y: 2 }, { x: 3, y: 4 })).toBe(11);
    expect(crossProduct({ x: 1, y: 0 }, { x: 0, y: 1 })).toBe(1);
  });

  it("computes distance and squared distance", () => {
    const a = { x: 0, y: 0 };
    const b = { x: 3, y: 4 };
    expect(distanceSquared(a, b)).toBe(25);
    expect(distance(a, b)).toBe(5);
  });

  it("normalizes a vector to unit length", () => {
    const n = normalize({ x: 3, y: 4 });
    expect(n.x).toBeCloseTo(0.6, 10);
    expect(n.y).toBeCloseTo(0.8, 10);
    expect(magnitude(n)).toBeCloseTo(1, 10);
  });

  it("tests point containment in a convex polygon", () => {
    const s = square(0, 0, 2, 2, "s");
    expect(isPointInsidePolygon({ x: 1, y: 1 }, s)).toBe(true);
    expect(isPointInsidePolygon({ x: 3, y: 3 }, s)).toBe(false);
  });
});

describe("OBB", () => {
  const obb = new OBB();

  it("constructs an axis-aligned bounding box from points", () => {
    const result = obb.constructFromPoints([
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 0, y: 1 },
    ]);
    expect(result.obb.center).toEqual({ x: 1, y: 0.5 });
  });

  it("validates a well-formed OBB", () => {
    const data: OBBData = {
      center: { x: 1, y: 1 },
      halfWidths: { x: 1, y: 0.5 },
      axes: [{ x: 1, y: 0 }, { x: 0, y: 1 }],
      rotation: 0,
    };
    const result = obb.validateOBB(data);
    expect(result.isValid).toBe(true);
  });

  it("tests a point inside and outside an OBB", () => {
    const data: OBBData = {
      center: { x: 0, y: 0 },
      halfWidths: { x: 2, y: 1 },
      axes: [{ x: 1, y: 0 }, { x: 0, y: 1 }],
      rotation: 0,
    };
    expect(obb.testPoint({ x: 1, y: 0 }, data).isInside).toBe(true);
    expect(obb.testPoint({ x: 3, y: 0 }, data).isInside).toBe(false);
  });
});

describe("AABB utilities", () => {
  const a = { x: 0, y: 0, width: 4, height: 2 };
  const b = { x: 2, y: 1, width: 4, height: 4 };

  it("computes area and perimeter", () => {
    expect(getAABBArea(a)).toBe(8);
    expect(getAABBPerimeter(a)).toBe(12);
  });

  it("tests point containment", () => {
    expect(pointInAABB({ x: 1, y: 1 }, a)).toBe(true);
    expect(pointInAABB({ x: 5, y: 5 }, a)).toBe(false);
  });

  it("unions two boxes to the smallest enclosing box", () => {
    expect(unionAABB(a, b)).toEqual({ x: 0, y: 0, width: 6, height: 5 });
  });

  it("intersects two overlapping boxes", () => {
    expect(intersectionAABB(a, b)).toEqual({ x: 2, y: 1, width: 2, height: 1 });
    expect(intersectionAABB(a, { x: 10, y: 10, width: 1, height: 1 })).toBeNull();
  });

  it("expands a box on all sides", () => {
    expect(expandAABB(a, 1)).toEqual({ x: -1, y: -1, width: 6, height: 4 });
  });

  it("tests containment and touching", () => {
    expect(containsAABB(a, { x: 1, y: 0, width: 2, height: 2 })).toBe(true);
    expect(containsAABB(a, b)).toBe(false);
    expect(areAABBsTouching({ x: 0, y: 0, width: 2, height: 2 }, { x: 2, y: 0, width: 2, height: 2 })).toBe(true);
  });
});
