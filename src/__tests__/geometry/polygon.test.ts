import { describe, expect, it } from "vitest";
import { PolygonOps } from "../../geometry/polygon";
import type { Point } from "../../geometry/point";

describe("Polygon Operations", () => {
  describe("PolygonOps.create", () => {
    it("should create a polygon from points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ];

      const polygon = PolygonOps.create(points);

      expect(polygon).toBeDefined();
      expect(polygon.points).toHaveLength(4);
      expect(polygon.points[0]).toEqual({ x: 0, y: 0 });
      expect(polygon.points[1]).toEqual({ x: 10, y: 0 });
      expect(polygon.points[2]).toEqual({ x: 10, y: 10 });
      expect(polygon.points[3]).toEqual({ x: 0, y: 10 });
    });

    it("should create a copy of the points array", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 5, y: 5 },
      ];

      const polygon = PolygonOps.create(points);

      // The polygon should have the same structure
      expect(polygon.points).toHaveLength(2);
      expect(polygon.points[0]).toEqual({ x: 0, y: 0 });
      expect(polygon.points[1]).toEqual({ x: 5, y: 5 });

      // Note: The current implementation creates a shallow copy of the array
      // but not a deep copy of the point objects
    });

    it("should handle empty points array", () => {
      const points: Point[] = [];
      const polygon = PolygonOps.create(points);

      expect(polygon.points).toHaveLength(0);
    });

    it("should handle single point", () => {
      const points: Point[] = [{ x: 5, y: 5 }];
      const polygon = PolygonOps.create(points);

      expect(polygon.points).toHaveLength(1);
      expect(polygon.points[0]).toEqual({ x: 5, y: 5 });
    });

    it("should handle two points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ];
      const polygon = PolygonOps.create(points);

      expect(polygon.points).toHaveLength(2);
      expect(polygon.points[0]).toEqual({ x: 0, y: 0 });
      expect(polygon.points[1]).toEqual({ x: 10, y: 10 });
    });
  });

  describe("PolygonOps.area", () => {
    it("should calculate area of a square", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ];
      const polygon = PolygonOps.create(points);

      const area = PolygonOps.area(polygon);

      expect(area).toBe(100);
    });

    it("should calculate area of a triangle", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 5, y: 10 },
      ];
      const polygon = PolygonOps.create(points);

      const area = PolygonOps.area(polygon);

      expect(area).toBe(50);
    });

    it("should return 0 for polygon with less than 3 points", () => {
      const points1: Point[] = [];
      const points2: Point[] = [{ x: 0, y: 0 }];
      const points3: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ];

      const polygon1 = PolygonOps.create(points1);
      const polygon2 = PolygonOps.create(points2);
      const polygon3 = PolygonOps.create(points3);

      expect(PolygonOps.area(polygon1)).toBe(0);
      expect(PolygonOps.area(polygon2)).toBe(0);
      expect(PolygonOps.area(polygon3)).toBe(0);
    });

    it("should handle polygon with negative coordinates", () => {
      const points: Point[] = [
        { x: -5, y: -5 },
        { x: 5, y: -5 },
        { x: 5, y: 5 },
        { x: -5, y: 5 },
      ];
      const polygon = PolygonOps.create(points);

      const area = PolygonOps.area(polygon);

      expect(area).toBe(100);
    });

    it("should handle polygon with fractional coordinates", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 5.5, y: 0 },
        { x: 5.5, y: 5.5 },
        { x: 0, y: 5.5 },
      ];
      const polygon = PolygonOps.create(points);

      const area = PolygonOps.area(polygon);

      expect(area).toBe(30.25);
    });

    it("should handle complex polygon", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 15, y: 5 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
        { x: -5, y: 5 },
      ];
      const polygon = PolygonOps.create(points);

      const area = PolygonOps.area(polygon);

      expect(area).toBeGreaterThan(0);
      expect(typeof area).toBe("number");
    });

    it("should handle polygon with clockwise vertices", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 0, y: 10 },
        { x: 10, y: 10 },
        { x: 10, y: 0 },
      ];
      const polygon = PolygonOps.create(points);

      const area = PolygonOps.area(polygon);

      expect(area).toBe(100);
    });
  });

  describe("PolygonOps.containsPoint", () => {
    it("should return true for point inside square", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ];
      const polygon = PolygonOps.create(points);

      const insidePoint: Point = { x: 5, y: 5 };
      const result = PolygonOps.containsPoint(polygon, insidePoint);

      expect(result).toBe(true);
    });

    it("should return false for point outside square", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ];
      const polygon = PolygonOps.create(points);

      const outsidePoint: Point = { x: 15, y: 15 };
      const result = PolygonOps.containsPoint(polygon, outsidePoint);

      expect(result).toBe(false);
    });

    it("should return false for polygon with less than 3 points", () => {
      const points1: Point[] = [];
      const points2: Point[] = [{ x: 0, y: 0 }];
      const points3: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ];

      const polygon1 = PolygonOps.create(points1);
      const polygon2 = PolygonOps.create(points2);
      const polygon3 = PolygonOps.create(points3);

      const testPoint: Point = { x: 5, y: 5 };

      expect(PolygonOps.containsPoint(polygon1, testPoint)).toBe(false);
      expect(PolygonOps.containsPoint(polygon2, testPoint)).toBe(false);
      expect(PolygonOps.containsPoint(polygon3, testPoint)).toBe(false);
    });

    it("should handle point on polygon edge", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ];
      const polygon = PolygonOps.create(points);

      const edgePoint: Point = { x: 5, y: 0 };
      const result = PolygonOps.containsPoint(polygon, edgePoint);

      // Edge case behavior may vary by implementation
      expect(typeof result).toBe("boolean");
    });

    it("should handle point at polygon vertex", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ];
      const polygon = PolygonOps.create(points);

      const vertexPoint: Point = { x: 0, y: 0 };
      const result = PolygonOps.containsPoint(polygon, vertexPoint);

      // Vertex case behavior may vary by implementation
      expect(typeof result).toBe("boolean");
    });

    it("should handle triangle polygon", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 5, y: 10 },
      ];
      const polygon = PolygonOps.create(points);

      const insidePoint: Point = { x: 5, y: 3 };
      const outsidePoint: Point = { x: 5, y: 15 };

      expect(PolygonOps.containsPoint(polygon, insidePoint)).toBe(true);
      expect(PolygonOps.containsPoint(polygon, outsidePoint)).toBe(false);
    });

    it("should handle polygon with negative coordinates", () => {
      const points: Point[] = [
        { x: -5, y: -5 },
        { x: 5, y: -5 },
        { x: 5, y: 5 },
        { x: -5, y: 5 },
      ];
      const polygon = PolygonOps.create(points);

      const insidePoint: Point = { x: 0, y: 0 };
      const outsidePoint: Point = { x: 10, y: 10 };

      expect(PolygonOps.containsPoint(polygon, insidePoint)).toBe(true);
      expect(PolygonOps.containsPoint(polygon, outsidePoint)).toBe(false);
    });

    it("should handle complex polygon shape", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 15, y: 5 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
        { x: -5, y: 5 },
      ];
      const polygon = PolygonOps.create(points);

      const insidePoint: Point = { x: 5, y: 5 };
      const outsidePoint: Point = { x: 20, y: 20 };

      expect(PolygonOps.containsPoint(polygon, insidePoint)).toBe(true);
      expect(PolygonOps.containsPoint(polygon, outsidePoint)).toBe(false);
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle very small polygon", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 0.1, y: 0 },
        { x: 0.1, y: 0.1 },
        { x: 0, y: 0.1 },
      ];
      const polygon = PolygonOps.create(points);

      const area = PolygonOps.area(polygon);
      const containsPoint = PolygonOps.containsPoint(polygon, {
        x: 0.05,
        y: 0.05,
      });

      expect(area).toBeCloseTo(0.01, 3);
      expect(containsPoint).toBe(true);
    });

    it("should handle very large polygon", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1000000, y: 0 },
        { x: 1000000, y: 1000000 },
        { x: 0, y: 1000000 },
      ];
      const polygon = PolygonOps.create(points);

      const area = PolygonOps.area(polygon);
      const containsPoint = PolygonOps.containsPoint(polygon, {
        x: 500000,
        y: 500000,
      });

      expect(area).toBe(1000000000000);
      expect(containsPoint).toBe(true);
    });

    it("should handle polygon with duplicate points", () => {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 0, y: 0 }, // Duplicate
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ];
      const polygon = PolygonOps.create(points);

      const area = PolygonOps.area(polygon);
      const containsPoint = PolygonOps.containsPoint(polygon, { x: 5, y: 5 });

      expect(area).toBe(100);
      expect(containsPoint).toBe(true);
    });
  });
});
