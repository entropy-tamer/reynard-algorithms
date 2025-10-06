import { describe, it, expect } from "vitest";
import { LineOps } from "../../../geometry/shapes/line-algorithms";

describe("LineOps - Intersection and Distance", () => {
  describe("distanceToPoint", () => {
    it("should return zero for point on line", () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 0 });
      const point = { x: 5, y: 0 };

      expect(LineOps.distanceToPoint(line, point)).toBe(0);
    });

    it("should return distance to closest point on line", () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 0 });
      const point = { x: 5, y: 3 };

      expect(LineOps.distanceToPoint(line, point)).toBe(3);
    });

    it("should return distance to start point when closest to start", () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 0 });
      const point = { x: -5, y: 0 };

      expect(LineOps.distanceToPoint(line, point)).toBe(5);
    });

    it("should return distance to end point when closest to end", () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 0 });
      const point = { x: 15, y: 0 };

      expect(LineOps.distanceToPoint(line, point)).toBe(5);
    });

    it("should handle point line", () => {
      const line = LineOps.create({ x: 5, y: 5 }, { x: 5, y: 5 });
      const point = { x: 0, y: 0 };

      expect(LineOps.distanceToPoint(line, point)).toBeCloseTo(7.071, 2);
    });
  });

  describe("intersects", () => {
    it("should return intersection point for crossing lines", () => {
      const line1 = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 10 });
      const line2 = LineOps.create({ x: 0, y: 10 }, { x: 10, y: 0 });

      const intersection = LineOps.intersects(line1, line2);
      expect(intersection).toEqual({ x: 5, y: 5 });
    });

    it("should return null for parallel lines", () => {
      const line1 = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 0 });
      const line2 = LineOps.create({ x: 0, y: 5 }, { x: 10, y: 5 });

      const intersection = LineOps.intersects(line1, line2);
      expect(intersection).toBeNull();
    });

    it("should return null for non-intersecting lines", () => {
      const line1 = LineOps.create({ x: 0, y: 0 }, { x: 5, y: 0 });
      const line2 = LineOps.create({ x: 0, y: 10 }, { x: 5, y: 10 });

      const intersection = LineOps.intersects(line1, line2);
      expect(intersection).toBeNull();
    });

    it("should return null when intersection is outside line segments", () => {
      const line1 = LineOps.create({ x: 0, y: 0 }, { x: 5, y: 0 });
      const line2 = LineOps.create({ x: 0, y: 5 }, { x: 5, y: 5 });

      const intersection = LineOps.intersects(line1, line2);
      expect(intersection).toBeNull();
    });

    it("should return intersection at line endpoints", () => {
      const line1 = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 0 });
      const line2 = LineOps.create({ x: 0, y: 0 }, { x: 0, y: 10 });

      const intersection = LineOps.intersects(line1, line2);
      expect(intersection).toEqual({ x: 0, y: 0 });
    });

    it("should return null for identical lines (parallel)", () => {
      const line1 = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 0 });
      const line2 = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 0 });

      const intersection = LineOps.intersects(line1, line2);
      expect(intersection).toBeNull();
    });

    it("should return null for point lines (parallel)", () => {
      const line1 = LineOps.create({ x: 5, y: 5 }, { x: 5, y: 5 });
      const line2 = LineOps.create({ x: 5, y: 5 }, { x: 5, y: 5 });

      const intersection = LineOps.intersects(line1, line2);
      expect(intersection).toBeNull();
    });
  });
});
