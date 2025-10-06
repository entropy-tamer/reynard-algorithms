import { describe, it, expect } from "vitest";
import { CircleOps } from "../../../geometry/shapes/circle-algorithms";

describe("CircleOps - Geometric Operations", () => {
  describe("containsPoint", () => {
    it("should return true for point at center", () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const point = { x: 0, y: 0 };

      expect(CircleOps.containsPoint(circle, point)).toBe(true);
    });

    it("should return true for point inside circle", () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const point = { x: 3, y: 4 };

      expect(CircleOps.containsPoint(circle, point)).toBe(true);
    });

    it("should return true for point on circle edge", () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const point = { x: 5, y: 0 };

      expect(CircleOps.containsPoint(circle, point)).toBe(true);
    });

    it("should return false for point outside circle", () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const point = { x: 6, y: 0 };

      expect(CircleOps.containsPoint(circle, point)).toBe(false);
    });

    it("should work with offset center", () => {
      const circle = CircleOps.create({ x: 10, y: 20 }, 5);
      const point = { x: 10, y: 20 };

      expect(CircleOps.containsPoint(circle, point)).toBe(true);
    });
  });

  describe("intersects", () => {
    it("should return true for overlapping circles", () => {
      const circle1 = CircleOps.create({ x: 0, y: 0 }, 5);
      const circle2 = CircleOps.create({ x: 3, y: 0 }, 5);

      expect(CircleOps.intersects(circle1, circle2)).toBe(true);
    });

    it("should return true for touching circles", () => {
      const circle1 = CircleOps.create({ x: 0, y: 0 }, 5);
      const circle2 = CircleOps.create({ x: 10, y: 0 }, 5);

      expect(CircleOps.intersects(circle1, circle2)).toBe(true);
    });

    it("should return false for non-overlapping circles", () => {
      const circle1 = CircleOps.create({ x: 0, y: 0 }, 5);
      const circle2 = CircleOps.create({ x: 15, y: 0 }, 5);

      expect(CircleOps.intersects(circle1, circle2)).toBe(false);
    });

    it("should return true for identical circles", () => {
      const circle1 = CircleOps.create({ x: 0, y: 0 }, 5);
      const circle2 = CircleOps.create({ x: 0, y: 0 }, 5);

      expect(CircleOps.intersects(circle1, circle2)).toBe(true);
    });

    it("should work with different sized circles", () => {
      const circle1 = CircleOps.create({ x: 0, y: 0 }, 3);
      const circle2 = CircleOps.create({ x: 0, y: 0 }, 7);

      expect(CircleOps.intersects(circle1, circle2)).toBe(true);
    });
  });
});
