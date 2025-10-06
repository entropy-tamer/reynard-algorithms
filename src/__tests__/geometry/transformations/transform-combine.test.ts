import { describe, it, expect } from "vitest";
import { TransformOps } from "../../../geometry/transformations/transformation-algorithms";

describe("TransformOps - Combine Operations", () => {
  describe("combine", () => {
    it("should combine two identity transforms", () => {
      const a = TransformOps.identity();
      const b = TransformOps.identity();
      const combined = TransformOps.combine(a, b);

      expect(combined.translateX).toBe(0);
      expect(combined.translateY).toBe(0);
      expect(combined.scaleX).toBe(1);
      expect(combined.scaleY).toBe(1);
      expect(combined.rotation).toBe(0);
    });

    it("should combine translation and scale", () => {
      const a = TransformOps.translate(10, 20);
      const b = TransformOps.scale(2, 3);
      const combined = TransformOps.combine(a, b);

      expect(combined.translateX).toBe(10);
      expect(combined.translateY).toBe(20);
      expect(combined.scaleX).toBe(2);
      expect(combined.scaleY).toBe(3);
      expect(combined.rotation).toBe(0);
    });

    it("should combine rotation and translation", () => {
      const a = TransformOps.rotate(Math.PI / 2);
      const b = TransformOps.translate(10, 0);
      const combined = TransformOps.combine(a, b);

      expect(combined.rotation).toBe(Math.PI / 2);
      // Translation should be rotated
      expect(combined.translateX).toBeCloseTo(0, 5);
      expect(combined.translateY).toBeCloseTo(10, 5);
    });

    it("should combine scale and rotation", () => {
      const a = TransformOps.scale(2, 2);
      const b = TransformOps.rotate(Math.PI / 2);
      const combined = TransformOps.combine(a, b);

      expect(combined.scaleX).toBe(2);
      expect(combined.scaleY).toBe(2);
      expect(combined.rotation).toBe(Math.PI / 2);
    });

    it("should handle complex combination", () => {
      const a = TransformOps.combine(TransformOps.translate(5, 10), TransformOps.scale(2, 3));
      const b = TransformOps.combine(TransformOps.rotate(Math.PI / 4), TransformOps.translate(1, 1));
      const combined = TransformOps.combine(a, b);

      expect(combined.rotation).toBeCloseTo(Math.PI / 4, 5);
      expect(combined.scaleX).toBe(2);
      expect(combined.scaleY).toBe(3);
    });
  });
});
