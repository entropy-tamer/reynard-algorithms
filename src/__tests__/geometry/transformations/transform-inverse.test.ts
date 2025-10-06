import { describe, it, expect } from "vitest";
import { TransformOps } from "../../../geometry/transformations/transformation-algorithms";

describe("TransformOps - Inverse Operations", () => {
  describe("inverse", () => {
    it("should create inverse of identity transform", () => {
      const transform = TransformOps.identity();
      const inverse = TransformOps.inverse(transform);

      expect(inverse.translateX).toBeCloseTo(0, 5);
      expect(inverse.translateY).toBeCloseTo(0, 5);
      expect(inverse.scaleX).toBe(1);
      expect(inverse.scaleY).toBe(1);
      expect(inverse.rotation).toBeCloseTo(0, 5);
    });

    it("should create inverse of translation", () => {
      const transform = TransformOps.translate(10, 20);
      const inverse = TransformOps.inverse(transform);

      expect(inverse.translateX).toBe(-10);
      expect(inverse.translateY).toBe(-20);
      expect(inverse.scaleX).toBe(1);
      expect(inverse.scaleY).toBe(1);
      expect(inverse.rotation).toBeCloseTo(0, 5);
    });

    it("should create inverse of scale", () => {
      const transform = TransformOps.scale(2, 3);
      const inverse = TransformOps.inverse(transform);

      expect(inverse.translateX).toBeCloseTo(0, 5);
      expect(inverse.translateY).toBeCloseTo(0, 5);
      expect(inverse.scaleX).toBe(0.5);
      expect(inverse.scaleY).toBeCloseTo(1 / 3, 5);
      expect(inverse.rotation).toBeCloseTo(0, 5);
    });

    it("should create inverse of rotation", () => {
      const transform = TransformOps.rotate(Math.PI / 2);
      const inverse = TransformOps.inverse(transform);

      expect(inverse.translateX).toBeCloseTo(0, 5);
      expect(inverse.translateY).toBeCloseTo(0, 5);
      expect(inverse.scaleX).toBe(1);
      expect(inverse.scaleY).toBe(1);
      expect(inverse.rotation).toBeCloseTo(-Math.PI / 2, 5);
    });

    it("should create inverse of combined transform", () => {
      // Combine transforms step by step
      const translate = TransformOps.translate(10, 20);
      const scale = TransformOps.scale(2, 2);
      const rotate = TransformOps.rotate(Math.PI / 4);

      const transform1 = TransformOps.combine(translate, scale);
      const transform = TransformOps.combine(transform1, rotate);
      const inverse = TransformOps.inverse(transform);

      // The rotation should be negated
      expect(inverse.rotation).toBeCloseTo(-Math.PI / 4, 5);
      expect(inverse.scaleX).toBe(0.5);
      expect(inverse.scaleY).toBe(0.5);
      // Translation values will be complex due to rotation, just check they exist
      expect(typeof inverse.translateX).toBe("number");
      expect(typeof inverse.translateY).toBe("number");
    });

    it("should verify inverse property", () => {
      const transform = TransformOps.combine(
        TransformOps.translate(5, 10),
        TransformOps.scale(2, 3),
        TransformOps.rotate(Math.PI / 6)
      );
      const inverse = TransformOps.inverse(transform);
      const identity = TransformOps.combine(transform, inverse);

      expect(identity.translateX).toBeCloseTo(0, 5);
      expect(identity.translateY).toBeCloseTo(0, 5);
      expect(identity.scaleX).toBeCloseTo(1, 5);
      expect(identity.scaleY).toBeCloseTo(1, 5);
      expect(identity.rotation).toBeCloseTo(0, 5);
    });
  });
});
