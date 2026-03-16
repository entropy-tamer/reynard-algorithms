/**
 * @file Tests for geometry module exports
 */
import { describe, expect, it } from "vitest";
import { PointOps } from "../core/geometry/point";
import { VectorOps } from "../core/geometry/vector";
import { TransformOps } from "../core/geometry/transforms";

describe("Geometry Module", () => {
  describe("exports", () => {
    it("should export Point operations", () => {
      expect(PointOps).toBeDefined();
      expect(typeof PointOps.create).toBe("function");
      expect(typeof PointOps.add).toBe("function");
      expect(typeof PointOps.subtract).toBe("function");
      expect(typeof PointOps.distance).toBe("function");
      expect(typeof PointOps.midpoint).toBe("function");
    });

    it("should export Vector operations", () => {
      expect(VectorOps).toBeDefined();
      expect(typeof VectorOps.create).toBe("function");
      expect(typeof VectorOps.add).toBe("function");
      expect(typeof VectorOps.subtract).toBe("function");
    });

    it("should export Transform operations", () => {
      expect(TransformOps).toBeDefined();
      expect(typeof TransformOps.identity).toBe("function");
      expect(typeof TransformOps.translate).toBe("function");
    });

  });

  describe("integration", () => {
    it("should allow using PointOps and distance together", () => {
      const point1 = PointOps.create(1, 2);
      const point2 = PointOps.create(4, 6);
      const distance = PointOps.distance(point1, point2);

      expect(distance).toBe(5); // 3-4-5 triangle
    });

    it("should allow creating transform", () => {
      const t = TransformOps.identity();
      expect(t.scaleX).toBe(1);
      expect(t.scaleY).toBe(1);
    });
  });
});
