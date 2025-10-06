import { describe, it, expect } from "vitest";
import { PolygonOps } from "../../../geometry/shapes/polygon-algorithms";

// Test data shared across all test suites
const triangle = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 5, y: 10 },
];

const square = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
];

describe("PolygonOps - Transformations", () => {
  describe("translate", () => {
    it("should move all points by offset", () => {
      const polygon = PolygonOps.create(triangle);
      const offset = { x: 10, y: 20 };
      const translated = PolygonOps.translate(polygon, offset);

      expect(translated.points[0]).toEqual({ x: 10, y: 20 });
      expect(translated.points[1]).toEqual({ x: 20, y: 20 });
      expect(translated.points[2]).toEqual({ x: 15, y: 30 });
    });

    it("should preserve original polygon", () => {
      const polygon = PolygonOps.create(triangle);
      const offset = { x: 10, y: 20 };
      PolygonOps.translate(polygon, offset);

      expect(polygon.points[0]).toEqual({ x: 0, y: 0 });
    });

    it("should work with negative offset", () => {
      const polygon = PolygonOps.create(square);
      const offset = { x: -5, y: -5 };
      const translated = PolygonOps.translate(polygon, offset);

      expect(translated.points[0]).toEqual({ x: -5, y: -5 });
      expect(translated.points[1]).toEqual({ x: 5, y: -5 });
    });
  });

  describe("scale", () => {
    it("should scale from origin when no center specified", () => {
      const polygon = PolygonOps.create(square);
      const scaled = PolygonOps.scale(polygon, 2);

      expect(scaled.points[0]).toEqual({ x: 0, y: 0 });
      expect(scaled.points[1]).toEqual({ x: 20, y: 0 });
      expect(scaled.points[2]).toEqual({ x: 20, y: 20 });
      expect(scaled.points[3]).toEqual({ x: 0, y: 20 });
    });

    it("should scale around specified center", () => {
      const polygon = PolygonOps.create(square);
      const center = { x: 5, y: 5 };
      const scaled = PolygonOps.scale(polygon, 2, center);

      expect(scaled.points[0]).toEqual({ x: -5, y: -5 });
      expect(scaled.points[1]).toEqual({ x: 15, y: -5 });
      expect(scaled.points[2]).toEqual({ x: 15, y: 15 });
      expect(scaled.points[3]).toEqual({ x: -5, y: 15 });
    });

    it("should preserve original polygon", () => {
      const polygon = PolygonOps.create(square);
      PolygonOps.scale(polygon, 2);

      expect(polygon.points[0]).toEqual({ x: 0, y: 0 });
    });

    it("should work with scale factor less than 1", () => {
      const polygon = PolygonOps.create(square);
      const scaled = PolygonOps.scale(polygon, 0.5);

      expect(scaled.points[0]).toEqual({ x: 0, y: 0 });
      expect(scaled.points[1]).toEqual({ x: 5, y: 0 });
      expect(scaled.points[2]).toEqual({ x: 5, y: 5 });
      expect(scaled.points[3]).toEqual({ x: 0, y: 5 });
    });

    it("should work with zero scale factor", () => {
      const polygon = PolygonOps.create(square);
      const center = { x: 5, y: 5 };
      const scaled = PolygonOps.scale(polygon, 0, center);

      expect(scaled.points[0]).toEqual({ x: 5, y: 5 });
      expect(scaled.points[1]).toEqual({ x: 5, y: 5 });
      expect(scaled.points[2]).toEqual({ x: 5, y: 5 });
      expect(scaled.points[3]).toEqual({ x: 5, y: 5 });
    });
  });
});
