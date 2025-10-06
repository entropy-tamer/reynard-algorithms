import { describe, it, expect } from "vitest";
import { getAABBArea, getAABBPerimeter } from "../../../geometry/collision/aabb-utils";
import type { AABB } from "../../../geometry/collision/aabb-types";

describe("AABB Utils", () => {
  const createAABB = (x: number, y: number, width: number, height: number): AABB => ({
    x,
    y,
    width,
    height,
  });

  describe("getAABBArea", () => {
    it("should calculate area correctly", () => {
      const aabb = createAABB(10, 20, 100, 80);
      expect(getAABBArea(aabb)).toBe(8000);
    });

    it("should handle zero dimensions", () => {
      const aabb = createAABB(0, 0, 0, 0);
      expect(getAABBArea(aabb)).toBe(0);
    });

    it("should handle zero width", () => {
      const aabb = createAABB(0, 0, 0, 100);
      expect(getAABBArea(aabb)).toBe(0);
    });

    it("should handle zero height", () => {
      const aabb = createAABB(0, 0, 100, 0);
      expect(getAABBArea(aabb)).toBe(0);
    });

    it("should handle negative dimensions", () => {
      const aabb = createAABB(0, 0, -10, -20);
      expect(getAABBArea(aabb)).toBe(200);
    });

    it("should handle floating point dimensions", () => {
      const aabb = createAABB(0, 0, 10.5, 20.25);
      expect(getAABBArea(aabb)).toBeCloseTo(212.625, 5);
    });

    it("should handle very large dimensions", () => {
      const aabb = createAABB(0, 0, 1000000, 1000000);
      expect(getAABBArea(aabb)).toBe(1000000000000);
    });

    it("should handle very small dimensions", () => {
      const aabb = createAABB(0, 0, 0.001, 0.001);
      expect(getAABBArea(aabb)).toBeCloseTo(0.000001, 10);
    });
  });

  describe("getAABBPerimeter", () => {
    it("should calculate perimeter correctly", () => {
      const aabb = createAABB(10, 20, 100, 80);
      expect(getAABBPerimeter(aabb)).toBe(360); // 2 * (100 + 80)
    });

    it("should handle zero dimensions", () => {
      const aabb = createAABB(0, 0, 0, 0);
      expect(getAABBPerimeter(aabb)).toBe(0);
    });

    it("should handle zero width", () => {
      const aabb = createAABB(0, 0, 0, 100);
      expect(getAABBPerimeter(aabb)).toBe(200); // 2 * (0 + 100)
    });

    it("should handle zero height", () => {
      const aabb = createAABB(0, 0, 100, 0);
      expect(getAABBPerimeter(aabb)).toBe(200); // 2 * (100 + 0)
    });

    it("should handle negative dimensions", () => {
      const aabb = createAABB(0, 0, -10, -20);
      expect(getAABBPerimeter(aabb)).toBe(-60); // 2 * (-10 + -20)
    });

    it("should handle floating point dimensions", () => {
      const aabb = createAABB(0, 0, 10.5, 20.25);
      expect(getAABBPerimeter(aabb)).toBeCloseTo(61.5, 5); // 2 * (10.5 + 20.25)
    });

    it("should handle square AABB", () => {
      const aabb = createAABB(0, 0, 50, 50);
      expect(getAABBPerimeter(aabb)).toBe(200); // 2 * (50 + 50)
    });

    it("should handle very large dimensions", () => {
      const aabb = createAABB(0, 0, 1000000, 1000000);
      expect(getAABBPerimeter(aabb)).toBe(4000000); // 2 * (1000000 + 1000000)
    });

    it("should handle very small dimensions", () => {
      const aabb = createAABB(0, 0, 0.001, 0.001);
      expect(getAABBPerimeter(aabb)).toBeCloseTo(0.004, 10); // 2 * (0.001 + 0.001)
    });

    it("should handle rectangular AABB with different aspect ratios", () => {
      const wideAabb = createAABB(0, 0, 200, 10);
      expect(getAABBPerimeter(wideAabb)).toBe(420); // 2 * (200 + 10)

      const tallAabb = createAABB(0, 0, 10, 200);
      expect(getAABBPerimeter(tallAabb)).toBe(420); // 2 * (10 + 200)
    });
  });
});
