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

describe("PolygonOps - Geometric Calculations", () => {
  describe("area", () => {
    it("should calculate triangle area correctly", () => {
      const polygon = PolygonOps.create(triangle);
      const area = PolygonOps.area(polygon);

      expect(area).toBe(50); // (10 * 10) / 2
    });

    it("should calculate square area correctly", () => {
      const polygon = PolygonOps.create(square);
      const area = PolygonOps.area(polygon);

      expect(area).toBe(100); // 10 * 10
    });

    it("should return zero for polygon with less than 3 points", () => {
      const polygon = PolygonOps.create([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ]);
      expect(PolygonOps.area(polygon)).toBe(0);
    });

    it("should return zero for empty polygon", () => {
      const polygon = PolygonOps.create([]);
      expect(PolygonOps.area(polygon)).toBe(0);
    });

    it("should handle polygon with negative coordinates", () => {
      const points = [
        { x: -5, y: -5 },
        { x: 5, y: -5 },
        { x: 5, y: 5 },
        { x: -5, y: 5 },
      ];
      const polygon = PolygonOps.create(points);
      const area = PolygonOps.area(polygon);

      expect(area).toBe(100);
    });

    it("should handle complex polygon", () => {
      const points = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 2 },
        { x: 2, y: 2 },
        { x: 2, y: 4 },
        { x: 0, y: 4 },
      ];
      const polygon = PolygonOps.create(points);
      const area = PolygonOps.area(polygon);

      expect(area).toBe(12);
    });
  });

  describe("perimeter", () => {
    it("should calculate triangle perimeter correctly", () => {
      const polygon = PolygonOps.create(triangle);
      const perimeter = PolygonOps.perimeter(polygon);

      // Triangle with sides: 10, sqrt(125), sqrt(125)
      const expected = 10 + 2 * Math.sqrt(125);
      expect(perimeter).toBeCloseTo(expected, 5);
    });

    it("should calculate square perimeter correctly", () => {
      const polygon = PolygonOps.create(square);
      const perimeter = PolygonOps.perimeter(polygon);

      expect(perimeter).toBe(40); // 4 * 10
    });

    it("should return zero for polygon with less than 2 points", () => {
      const polygon = PolygonOps.create([{ x: 0, y: 0 }]);
      expect(PolygonOps.perimeter(polygon)).toBe(0);
    });

    it("should return zero for empty polygon", () => {
      const polygon = PolygonOps.create([]);
      expect(PolygonOps.perimeter(polygon)).toBe(0);
    });
  });

  describe("centroid", () => {
    it("should calculate triangle centroid correctly", () => {
      const polygon = PolygonOps.create(triangle);
      const centroid = PolygonOps.centroid(polygon);

      expect(centroid.x).toBeCloseTo(5, 5);
      expect(centroid.y).toBeCloseTo(3.333, 2);
    });

    it("should calculate square centroid correctly", () => {
      const polygon = PolygonOps.create(square);
      const centroid = PolygonOps.centroid(polygon);

      expect(centroid).toEqual({ x: 5, y: 5 });
    });

    it("should return zero point for empty polygon", () => {
      const polygon = PolygonOps.create([]);
      const centroid = PolygonOps.centroid(polygon);

      expect(centroid).toEqual({ x: 0, y: 0 });
    });

    it("should return the point for single-point polygon", () => {
      const polygon = PolygonOps.create([{ x: 5, y: 10 }]);
      const centroid = PolygonOps.centroid(polygon);

      expect(centroid).toEqual({ x: 5, y: 10 });
    });
  });
});
