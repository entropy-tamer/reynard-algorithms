import { describe, it, expect } from "vitest";
import { TransformOps } from "../../../geometry/transformations/transformation-algorithms";

describe("TransformOps - Apply Operations", () => {
  describe("applyToPoint", () => {
    it("should apply identity transform to point", () => {
      const transform = TransformOps.identity();
      const point = { x: 10, y: 20 };
      const result = TransformOps.applyToPoint(transform, point);

      expect(result).toEqual({ x: 10, y: 20 });
    });

    it("should apply translation to point", () => {
      const transform = TransformOps.translate(5, 10);
      const point = { x: 10, y: 20 };
      const result = TransformOps.applyToPoint(transform, point);

      expect(result).toEqual({ x: 15, y: 30 });
    });

    it("should apply scale to point", () => {
      const transform = TransformOps.scale(2, 3);
      const point = { x: 10, y: 20 };
      const result = TransformOps.applyToPoint(transform, point);

      expect(result).toEqual({ x: 20, y: 60 });
    });

    it("should apply rotation to point", () => {
      const transform = TransformOps.rotate(Math.PI / 2);
      const point = { x: 10, y: 0 };
      const result = TransformOps.applyToPoint(transform, point);

      expect(result.x).toBeCloseTo(0, 5);
      expect(result.y).toBeCloseTo(10, 5);
    });

    it("should apply combined transform to point", () => {
      const transform = TransformOps.combine(TransformOps.translate(5, 10), TransformOps.scale(2, 2));
      const point = { x: 10, y: 20 };
      const result = TransformOps.applyToPoint(transform, point);

      expect(result).toEqual({ x: 25, y: 50 });
    });

    it("should handle point at origin", () => {
      const transform = TransformOps.combine(TransformOps.rotate(Math.PI / 4), TransformOps.scale(2, 2));
      const point = { x: 0, y: 0 };
      const result = TransformOps.applyToPoint(transform, point);

      expect(result.x).toBeCloseTo(0, 5);
      expect(result.y).toBeCloseTo(0, 5);
    });
  });

  describe("applyToRectangle", () => {
    it("should apply identity transform to rectangle", () => {
      const transform = TransformOps.identity();
      const rect = { x: 10, y: 20, width: 30, height: 40 };
      const result = TransformOps.applyToRectangle(transform, rect);

      expect(result).toEqual({ x: 10, y: 20, width: 30, height: 40 });
    });

    it("should apply translation to rectangle", () => {
      const transform = TransformOps.translate(5, 10);
      const rect = { x: 10, y: 20, width: 30, height: 40 };
      const result = TransformOps.applyToRectangle(transform, rect);

      expect(result).toEqual({ x: 15, y: 30, width: 30, height: 40 });
    });

    it("should apply scale to rectangle", () => {
      const transform = TransformOps.scale(2, 3);
      const rect = { x: 10, y: 20, width: 30, height: 40 };
      const result = TransformOps.applyToRectangle(transform, rect);

      expect(result).toEqual({ x: 20, y: 60, width: 60, height: 120 });
    });

    it("should apply rotation to rectangle", () => {
      const transform = TransformOps.rotate(Math.PI / 2);
      const rect = { x: 0, y: 0, width: 10, height: 20 };
      const result = TransformOps.applyToRectangle(transform, rect);

      expect(result.x).toBeCloseTo(-20, 5);
      expect(result.y).toBeCloseTo(0, 5);
      expect(result.width).toBeCloseTo(20, 5);
      expect(result.height).toBeCloseTo(10, 5);
    });

    it("should apply combined transform to rectangle", () => {
      const transform = TransformOps.combine(TransformOps.translate(5, 10), TransformOps.scale(2, 2));
      const rect = { x: 10, y: 20, width: 30, height: 40 };
      const result = TransformOps.applyToRectangle(transform, rect);

      expect(result).toEqual({ x: 25, y: 50, width: 60, height: 80 });
    });

    it("should handle zero-size rectangle", () => {
      const transform = TransformOps.scale(2, 2);
      const rect = { x: 10, y: 20, width: 0, height: 0 };
      const result = TransformOps.applyToRectangle(transform, rect);

      expect(result).toEqual({ x: 20, y: 40, width: 0, height: 0 });
    });
  });
});
