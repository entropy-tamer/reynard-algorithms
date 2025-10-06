import { describe, it, expect } from "vitest";
import { CircleOps } from "../../../geometry/shapes/circle-algorithms";

describe("CircleOps - Transformations", () => {
  describe("expand", () => {
    it("should increase radius by specified amount", () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const expanded = CircleOps.expand(circle, 2);

      expect(expanded.radius).toBe(7);
      expect(expanded.center).toEqual(circle.center);
    });

    it("should work with negative amount (shrink)", () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const expanded = CircleOps.expand(circle, -2);

      expect(expanded.radius).toBe(3);
    });
  });

  describe("shrink", () => {
    it("should decrease radius by specified amount", () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const shrunk = CircleOps.shrink(circle, 2);

      expect(shrunk.radius).toBe(3);
      expect(shrunk.center).toEqual(circle.center);
    });

    it("should not allow negative radius", () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const shrunk = CircleOps.shrink(circle, 10);

      expect(shrunk.radius).toBe(0);
    });

    it("should handle exact shrink to zero", () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const shrunk = CircleOps.shrink(circle, 5);

      expect(shrunk.radius).toBe(0);
    });
  });

  describe("translate", () => {
    it("should move circle by offset vector", () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const offset = { x: 10, y: 20 };
      const translated = CircleOps.translate(circle, offset);

      expect(translated.center).toEqual({ x: 10, y: 20 });
      expect(translated.radius).toBe(5);
    });

    it("should preserve original circle", () => {
      const circle = CircleOps.create({ x: 0, y: 0 }, 5);
      const offset = { x: 10, y: 20 };
      CircleOps.translate(circle, offset);

      expect(circle.center).toEqual({ x: 0, y: 0 });
      expect(circle.radius).toBe(5);
    });

    it("should work with negative offset", () => {
      const circle = CircleOps.create({ x: 10, y: 20 }, 5);
      const offset = { x: -5, y: -10 };
      const translated = CircleOps.translate(circle, offset);

      expect(translated.center).toEqual({ x: 5, y: 10 });
    });
  });
});
