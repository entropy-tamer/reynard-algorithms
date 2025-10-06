import { describe, expect, it } from "vitest";
import { PointOps, Point } from "../../geometry/point";

describe("PointOps", () => {
  describe("create", () => {
    it("should create a point with given coordinates", () => {
      const point = PointOps.create(3, 4);
      expect(point.x).toBe(3);
      expect(point.y).toBe(4);
    });

    it("should create a point with zero coordinates", () => {
      const point = PointOps.create(0, 0);
      expect(point.x).toBe(0);
      expect(point.y).toBe(0);
    });

    it("should create a point with negative coordinates", () => {
      const point = PointOps.create(-5, -3);
      expect(point.x).toBe(-5);
      expect(point.y).toBe(-3);
    });

    it("should create a point with fractional coordinates", () => {
      const point = PointOps.create(2.5, 7.8);
      expect(point.x).toBe(2.5);
      expect(point.y).toBe(7.8);
    });
  });

  describe("add", () => {
    it("should add two points correctly", () => {
      const a: Point = { x: 2, y: 3 };
      const b: Point = { x: 4, y: 5 };
      const result = PointOps.add(a, b);

      expect(result.x).toBe(6);
      expect(result.y).toBe(8);
    });

    it("should add points with negative coordinates", () => {
      const a: Point = { x: 2, y: -3 };
      const b: Point = { x: -4, y: 5 };
      const result = PointOps.add(a, b);

      expect(result.x).toBe(-2);
      expect(result.y).toBe(2);
    });

    it("should add points with zero coordinates", () => {
      const a: Point = { x: 5, y: 7 };
      const b: Point = { x: 0, y: 0 };
      const result = PointOps.add(a, b);

      expect(result.x).toBe(5);
      expect(result.y).toBe(7);
    });

    it("should add points with fractional coordinates", () => {
      const a: Point = { x: 1.5, y: 2.3 };
      const b: Point = { x: 0.7, y: 1.2 };
      const result = PointOps.add(a, b);

      expect(result.x).toBeCloseTo(2.2, 10);
      expect(result.y).toBeCloseTo(3.5, 10);
    });
  });

  describe("subtract", () => {
    it("should subtract two points correctly", () => {
      const a: Point = { x: 7, y: 5 };
      const b: Point = { x: 3, y: 2 };
      const result = PointOps.subtract(a, b);

      expect(result.x).toBe(4);
      expect(result.y).toBe(3);
    });

    it("should subtract points with negative coordinates", () => {
      const a: Point = { x: 2, y: -3 };
      const b: Point = { x: -4, y: 5 };
      const result = PointOps.subtract(a, b);

      expect(result.x).toBe(6);
      expect(result.y).toBe(-8);
    });

    it("should subtract points resulting in zero", () => {
      const a: Point = { x: 5, y: 7 };
      const b: Point = { x: 5, y: 7 };
      const result = PointOps.subtract(a, b);

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it("should subtract points with fractional coordinates", () => {
      const a: Point = { x: 3.7, y: 8.2 };
      const b: Point = { x: 1.2, y: 3.5 };
      const result = PointOps.subtract(a, b);

      expect(result.x).toBeCloseTo(2.5, 10);
      expect(result.y).toBeCloseTo(4.7, 10);
    });
  });

  describe("distance", () => {
    it("should calculate distance between two points", () => {
      const a: Point = { x: 0, y: 0 };
      const b: Point = { x: 3, y: 4 };
      const distance = PointOps.distance(a, b);

      expect(distance).toBe(5); // 3-4-5 triangle
    });

    it("should return zero for same points", () => {
      const a: Point = { x: 5, y: 7 };
      const b: Point = { x: 5, y: 7 };
      const distance = PointOps.distance(a, b);

      expect(distance).toBe(0);
    });

    it("should calculate distance with negative coordinates", () => {
      const a: Point = { x: -1, y: -1 };
      const b: Point = { x: 2, y: 3 };
      const distance = PointOps.distance(a, b);

      expect(distance).toBe(5); // sqrt((3)^2 + (4)^2) = 5
    });

    it("should calculate distance for horizontal line", () => {
      const a: Point = { x: 1, y: 5 };
      const b: Point = { x: 8, y: 5 };
      const distance = PointOps.distance(a, b);

      expect(distance).toBe(7);
    });

    it("should calculate distance for vertical line", () => {
      const a: Point = { x: 3, y: 2 };
      const b: Point = { x: 3, y: 9 };
      const distance = PointOps.distance(a, b);

      expect(distance).toBe(7);
    });

    it("should calculate distance with fractional coordinates", () => {
      const a: Point = { x: 1.5, y: 2.0 };
      const b: Point = { x: 4.5, y: 6.0 };
      const distance = PointOps.distance(a, b);

      expect(distance).toBe(5); // sqrt(3^2 + 4^2) = 5
    });

    it("should be symmetric", () => {
      const a: Point = { x: 2, y: 3 };
      const b: Point = { x: 8, y: 7 };

      expect(PointOps.distance(a, b)).toBe(PointOps.distance(b, a));
    });
  });

  describe("midpoint", () => {
    it("should calculate midpoint between two points", () => {
      const a: Point = { x: 2, y: 4 };
      const b: Point = { x: 8, y: 10 };
      const midpoint = PointOps.midpoint(a, b);

      expect(midpoint.x).toBe(5);
      expect(midpoint.y).toBe(7);
    });

    it("should handle same points", () => {
      const a: Point = { x: 3, y: 5 };
      const b: Point = { x: 3, y: 5 };
      const midpoint = PointOps.midpoint(a, b);

      expect(midpoint.x).toBe(3);
      expect(midpoint.y).toBe(5);
    });

    it("should handle negative coordinates", () => {
      const a: Point = { x: -2, y: -6 };
      const b: Point = { x: 4, y: 2 };
      const midpoint = PointOps.midpoint(a, b);

      expect(midpoint.x).toBe(1);
      expect(midpoint.y).toBe(-2);
    });

    it("should handle fractional coordinates", () => {
      const a: Point = { x: 1.5, y: 3.7 };
      const b: Point = { x: 4.3, y: 7.1 };
      const midpoint = PointOps.midpoint(a, b);

      expect(midpoint.x).toBeCloseTo(2.9, 10);
      expect(midpoint.y).toBeCloseTo(5.4, 10);
    });

    it("should be symmetric", () => {
      const a: Point = { x: 1, y: 2 };
      const b: Point = { x: 7, y: 8 };

      const midpoint1 = PointOps.midpoint(a, b);
      const midpoint2 = PointOps.midpoint(b, a);

      expect(midpoint1.x).toBe(midpoint2.x);
      expect(midpoint1.y).toBe(midpoint2.y);
    });

    it("should work with zero coordinates", () => {
      const a: Point = { x: 0, y: 0 };
      const b: Point = { x: 6, y: 8 };
      const midpoint = PointOps.midpoint(a, b);

      expect(midpoint.x).toBe(3);
      expect(midpoint.y).toBe(4);
    });
  });
});
