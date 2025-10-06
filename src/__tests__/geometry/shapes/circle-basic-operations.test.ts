import { describe, it, expect } from "vitest";
import { CircleOps } from "../../../geometry/shapes/circle-algorithms";

describe("CircleOps - Basic Operations", () => {
  describe("create", () => {
    it("should create a circle with center and radius", () => {
      const center = { x: 10, y: 20 };
      const radius = 5;
      const circle = CircleOps.create(center, radius);

      expect(circle.center).toEqual(center);
      expect(circle.radius).toBe(radius);
    });
  });

  describe("area", () => {
    it("should calculate area correctly", () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const expectedArea = Math.PI * 25;

      expect(CircleOps.area(circle)).toBeCloseTo(expectedArea, 5);
    });

    it("should calculate area for zero radius", () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 0);
      expect(CircleOps.area(circle)).toBe(0);
    });
  });

  describe("circumference", () => {
    it("should calculate circumference correctly", () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const expectedCircumference = 2 * Math.PI * 5;

      expect(CircleOps.circumference(circle)).toBeCloseTo(expectedCircumference, 5);
    });

    it("should calculate circumference for zero radius", () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 0);
      expect(CircleOps.circumference(circle)).toBe(0);
    });
  });
});
