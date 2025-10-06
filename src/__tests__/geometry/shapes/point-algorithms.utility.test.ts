import { describe, it, expect } from "vitest";
import { PointOps, type Point } from "../../../geometry/shapes/point-algorithms";

describe("PointOps - Utility Operations", () => {
  describe("equals", () => {
    it("should return true for equal points", () => {
      const a = PointOps.create(1.5, 2.5);
      const b = PointOps.create(1.5, 2.5);
      expect(PointOps.equals(a, b)).toBe(true);
    });

    it("should return false for different points", () => {
      const a = PointOps.create(1, 2);
      const b = PointOps.create(1, 3);
      expect(PointOps.equals(a, b)).toBe(false);
    });

    it("should handle floating point precision", () => {
      const a = PointOps.create(0.1 + 0.2, 0.3);
      const b = PointOps.create(0.3, 0.3);
      expect(PointOps.equals(a, b)).toBe(true);
    });
  });

  describe("clone", () => {
    it("should create a copy of the point", () => {
      const original = PointOps.create(3, 7);
      const cloned = PointOps.clone(original);
      expect(cloned.x).toBe(3);
      expect(cloned.y).toBe(7);
      expect(cloned).not.toBe(original);
    });
  });
});
