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

describe("PolygonOps - Spatial Operations", () => {
  describe("containsPoint", () => {
    it("should return true for point inside triangle", () => {
      const polygon = PolygonOps.create(triangle);
      const point = { x: 5, y: 3 };

      expect(PolygonOps.containsPoint(polygon, point)).toBe(true);
    });

    it("should return false for point outside triangle", () => {
      const polygon = PolygonOps.create(triangle);
      const point = { x: 15, y: 15 };

      expect(PolygonOps.containsPoint(polygon, point)).toBe(false);
    });

    it("should return true for point inside square", () => {
      const polygon = PolygonOps.create(square);
      const point = { x: 5, y: 5 };

      expect(PolygonOps.containsPoint(polygon, point)).toBe(true);
    });

    it("should return false for point outside square", () => {
      const polygon = PolygonOps.create(square);
      const point = { x: 15, y: 15 };

      expect(PolygonOps.containsPoint(polygon, point)).toBe(false);
    });

    it("should return false for polygon with less than 3 points", () => {
      const polygon = PolygonOps.create([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ]);
      const point = { x: 5, y: 0 };

      expect(PolygonOps.containsPoint(polygon, point)).toBe(false);
    });

    it("should handle point on polygon edge", () => {
      const polygon = PolygonOps.create(square);
      const point = { x: 5, y: 0 };

      expect(PolygonOps.containsPoint(polygon, point)).toBe(true);
    });

    it("should handle point at polygon vertex", () => {
      const polygon = PolygonOps.create(square);
      const point = { x: 0, y: 0 };

      expect(PolygonOps.containsPoint(polygon, point)).toBe(true);
    });
  });

  describe("boundingBox", () => {
    it("should calculate triangle bounding box correctly", () => {
      const polygon = PolygonOps.create(triangle);
      const bbox = PolygonOps.boundingBox(polygon);

      expect(bbox).toEqual({ x: 0, y: 0, width: 10, height: 10 });
    });

    it("should calculate square bounding box correctly", () => {
      const polygon = PolygonOps.create(square);
      const bbox = PolygonOps.boundingBox(polygon);

      expect(bbox).toEqual({ x: 0, y: 0, width: 10, height: 10 });
    });

    it("should return zero box for empty polygon", () => {
      const polygon = PolygonOps.create([]);
      const bbox = PolygonOps.boundingBox(polygon);

      expect(bbox).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    });

    it("should handle polygon with negative coordinates", () => {
      const points = [
        { x: -5, y: -5 },
        { x: 5, y: -5 },
        { x: 5, y: 5 },
        { x: -5, y: 5 },
      ];
      const polygon = PolygonOps.create(points);
      const bbox = PolygonOps.boundingBox(polygon);

      expect(bbox).toEqual({ x: -5, y: -5, width: 10, height: 10 });
    });
  });
});
