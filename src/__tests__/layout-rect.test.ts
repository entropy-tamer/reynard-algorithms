import { describe, expect, it } from "vitest";
import {
  aabbMinMaxToRect,
  insetRect,
  intersectionArea,
  intersectionRect,
  normalizeLayoutRect,
  rectContains,
  rectGap,
  rectIntersectionArea,
  rectRelation,
  rectToAabbMinMax,
  rectsIntersect,
  rectsTouch,
} from "../index";

describe("layout rect primitives", () => {
  it("normalizes negative dimensions", () => {
    expect(normalizeLayoutRect({ x: 10, y: 10, width: -4, height: -2 })).toEqual({
      x: 6,
      y: 8,
      width: 4,
      height: 2,
    });
  });

  it("treats edge touch as non-overlap by default", () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    const b = { x: 10, y: 0, width: 10, height: 10 };
    expect(rectsIntersect(a, b)).toBe(false);
    expect(rectsTouch(a, b)).toBe(true);
    expect(intersectionRect(a, b)).toBeNull();
    expect(intersectionArea(a, b)).toBe(0);
  });

  it("can include touch when requested", () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    const b = { x: 10, y: 0, width: 10, height: 10 };
    expect(rectsIntersect(a, b, { includeTouch: true })).toBe(true);
    expect(intersectionRect(a, b, { includeTouch: true })).toEqual({
      x: 10,
      y: 0,
      width: 0,
      height: 10,
    });
  });

  it("computes overlap area and relation", () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    const b = { x: 5, y: 4, width: 10, height: 10 };
    const rel = rectRelation(a, b);
    expect(rel.intersects).toBe(true);
    expect(rel.intersection).toEqual({ x: 5, y: 4, width: 5, height: 6 });
    expect(rel.intersectionArea).toBe(30);
    expect(rectIntersectionArea(a, b)).toBe(30);
  });

  it("computes containment and gaps", () => {
    const outer = { x: 0, y: 0, width: 20, height: 20 };
    const inner = { x: 5, y: 5, width: 4, height: 4 };
    expect(rectContains(outer, inner)).toBe(true);
    expect(rectContains(inner, outer)).toBe(false);
    expect(rectGap(inner, { x: 12, y: 5, width: 2, height: 2 })).toEqual({
      left: 3,
      right: 0,
      top: 0,
      bottom: 0,
      horizontal: 3,
      vertical: 0,
    });
  });

  it("supports inset and min/max conversion", () => {
    expect(insetRect({ x: 0, y: 0, width: 100, height: 50 }, 10)).toEqual({
      x: 10,
      y: 10,
      width: 80,
      height: 30,
    });
    const rect = aabbMinMaxToRect({ min: { x: 2, y: 3 }, max: { x: 12, y: 9 } });
    expect(rect).toEqual({ x: 2, y: 3, width: 10, height: 6 });
    expect(rectToAabbMinMax(rect)).toEqual({ min: { x: 2, y: 3 }, max: { x: 12, y: 9 } });
  });
});
