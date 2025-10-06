import { describe, expect, it } from "vitest";
import { CircleOps, Circle } from "../../geometry/circle";
import { Point } from "../../geometry/point";

describe("CircleOps", () => {
  describe("create", () => {
    it("should create a circle with center and radius", () => {
      const center: Point = { x: 5, y: 10 };
      const radius = 3;
      const circle = CircleOps.create(center, radius);

      expect(circle.center).toEqual(center);
      expect(circle.radius).toBe(radius);
    });

    it("should create a circle with zero radius", () => {
      const center: Point = { x: 0, y: 0 };
      const radius = 0;
      const circle = CircleOps.create(center, radius);

      expect(circle.center).toEqual(center);
      expect(circle.radius).toBe(0);
    });

    it("should create a circle with negative coordinates", () => {
      const center: Point = { x: -5, y: -3 };
      const radius = 2.5;
      const circle = CircleOps.create(center, radius);

      expect(circle.center).toEqual(center);
      expect(circle.radius).toBe(radius);
    });
  });

  describe("area", () => {
    it("should calculate area correctly", () => {
      const circle: Circle = { center: { x: 0, y: 0 }, radius: 5 };
      const area = CircleOps.area(circle);
      expect(area).toBeCloseTo(Math.PI * 25, 10);
    });

    it("should return zero area for zero radius", () => {
      const circle: Circle = { center: { x: 1, y: 1 }, radius: 0 };
      const area = CircleOps.area(circle);
      expect(area).toBe(0);
    });

    it("should calculate area for fractional radius", () => {
      const circle: Circle = { center: { x: 0, y: 0 }, radius: 2.5 };
      const area = CircleOps.area(circle);
      expect(area).toBeCloseTo(Math.PI * 6.25, 10);
    });

    it("should calculate area for unit circle", () => {
      const circle: Circle = { center: { x: 0, y: 0 }, radius: 1 };
      const area = CircleOps.area(circle);
      expect(area).toBeCloseTo(Math.PI, 10);
    });
  });

  describe("circumference", () => {
    it("should calculate circumference correctly", () => {
      const circle: Circle = { center: { x: 0, y: 0 }, radius: 5 };
      const circumference = CircleOps.circumference(circle);
      expect(circumference).toBeCloseTo(2 * Math.PI * 5, 10);
    });

    it("should return zero circumference for zero radius", () => {
      const circle: Circle = { center: { x: 1, y: 1 }, radius: 0 };
      const circumference = CircleOps.circumference(circle);
      expect(circumference).toBe(0);
    });

    it("should calculate circumference for fractional radius", () => {
      const circle: Circle = { center: { x: 0, y: 0 }, radius: 3.5 };
      const circumference = CircleOps.circumference(circle);
      expect(circumference).toBeCloseTo(2 * Math.PI * 3.5, 10);
    });

    it("should calculate circumference for unit circle", () => {
      const circle: Circle = { center: { x: 0, y: 0 }, radius: 1 };
      const circumference = CircleOps.circumference(circle);
      expect(circumference).toBeCloseTo(2 * Math.PI, 10);
    });
  });

  describe("containsPoint", () => {
    const circle: Circle = { center: { x: 5, y: 5 }, radius: 3 };

    it("should return true for point at center", () => {
      const point: Point = { x: 5, y: 5 };
      expect(CircleOps.containsPoint(circle, point)).toBe(true);
    });

    it("should return true for point inside circle", () => {
      const point: Point = { x: 6, y: 6 };
      expect(CircleOps.containsPoint(circle, point)).toBe(true);
    });

    it("should return true for point on circle edge", () => {
      const point: Point = { x: 8, y: 5 }; // Distance = 3 (on edge)
      expect(CircleOps.containsPoint(circle, point)).toBe(true);
    });

    it("should return false for point outside circle", () => {
      const point: Point = { x: 10, y: 5 }; // Distance = 5 > 3
      expect(CircleOps.containsPoint(circle, point)).toBe(false);
    });

    it("should work with circle at origin", () => {
      const originCircle: Circle = { center: { x: 0, y: 0 }, radius: 1 };
      const insidePoint: Point = { x: 0.5, y: 0.5 };
      const outsidePoint: Point = { x: 1.5, y: 1.5 };

      expect(CircleOps.containsPoint(originCircle, insidePoint)).toBe(true);
      expect(CircleOps.containsPoint(originCircle, outsidePoint)).toBe(false);
    });

    it("should handle zero radius circle", () => {
      const zeroCircle: Circle = { center: { x: 2, y: 3 }, radius: 0 };
      const centerPoint: Point = { x: 2, y: 3 };
      const nearbyPoint: Point = { x: 2.1, y: 3 };

      expect(CircleOps.containsPoint(zeroCircle, centerPoint)).toBe(true);
      expect(CircleOps.containsPoint(zeroCircle, nearbyPoint)).toBe(false);
    });

    it("should work with negative coordinates", () => {
      const negCircle: Circle = { center: { x: -2, y: -3 }, radius: 2 };
      const insidePoint: Point = { x: -1, y: -2 };
      const outsidePoint: Point = { x: 1, y: 1 };

      expect(CircleOps.containsPoint(negCircle, insidePoint)).toBe(true);
      expect(CircleOps.containsPoint(negCircle, outsidePoint)).toBe(false);
    });
  });
});
