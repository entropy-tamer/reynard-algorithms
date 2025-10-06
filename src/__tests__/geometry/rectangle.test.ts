import { describe, expect, it } from "vitest";
import { RectangleOps, Rectangle } from "../../geometry/rectangle";
import { Point } from "../../geometry/point";

describe("RectangleOps", () => {
  describe("create", () => {
    it("should create a rectangle with given dimensions", () => {
      const rect = RectangleOps.create(2, 3, 5, 7);

      expect(rect.x).toBe(2);
      expect(rect.y).toBe(3);
      expect(rect.width).toBe(5);
      expect(rect.height).toBe(7);
    });

    it("should create a rectangle at origin", () => {
      const rect = RectangleOps.create(0, 0, 10, 15);

      expect(rect.x).toBe(0);
      expect(rect.y).toBe(0);
      expect(rect.width).toBe(10);
      expect(rect.height).toBe(15);
    });

    it("should create a rectangle with negative coordinates", () => {
      const rect = RectangleOps.create(-5, -3, 8, 6);

      expect(rect.x).toBe(-5);
      expect(rect.y).toBe(-3);
      expect(rect.width).toBe(8);
      expect(rect.height).toBe(6);
    });

    it("should create a rectangle with zero dimensions", () => {
      const rect = RectangleOps.create(1, 2, 0, 0);

      expect(rect.x).toBe(1);
      expect(rect.y).toBe(2);
      expect(rect.width).toBe(0);
      expect(rect.height).toBe(0);
    });

    it("should create a rectangle with fractional values", () => {
      const rect = RectangleOps.create(1.5, 2.7, 3.2, 4.8);

      expect(rect.x).toBe(1.5);
      expect(rect.y).toBe(2.7);
      expect(rect.width).toBe(3.2);
      expect(rect.height).toBe(4.8);
    });
  });

  describe("area", () => {
    it("should calculate area correctly", () => {
      const rect: Rectangle = { x: 0, y: 0, width: 5, height: 3 };
      const area = RectangleOps.area(rect);
      expect(area).toBe(15);
    });

    it("should return zero for zero width", () => {
      const rect: Rectangle = { x: 1, y: 2, width: 0, height: 5 };
      const area = RectangleOps.area(rect);
      expect(area).toBe(0);
    });

    it("should return zero for zero height", () => {
      const rect: Rectangle = { x: 1, y: 2, width: 5, height: 0 };
      const area = RectangleOps.area(rect);
      expect(area).toBe(0);
    });

    it("should return zero for zero dimensions", () => {
      const rect: Rectangle = { x: 1, y: 2, width: 0, height: 0 };
      const area = RectangleOps.area(rect);
      expect(area).toBe(0);
    });

    it("should calculate area for square", () => {
      const rect: Rectangle = { x: 0, y: 0, width: 4, height: 4 };
      const area = RectangleOps.area(rect);
      expect(area).toBe(16);
    });

    it("should calculate area with fractional dimensions", () => {
      const rect: Rectangle = { x: 0, y: 0, width: 2.5, height: 3.2 };
      const area = RectangleOps.area(rect);
      expect(area).toBeCloseTo(8.0, 10);
    });
  });

  describe("center", () => {
    it("should calculate center correctly", () => {
      const rect: Rectangle = { x: 2, y: 3, width: 6, height: 8 };
      const center = RectangleOps.center(rect);

      expect(center.x).toBe(5); // 2 + 6/2
      expect(center.y).toBe(7); // 3 + 8/2
    });

    it("should calculate center for rectangle at origin", () => {
      const rect: Rectangle = { x: 0, y: 0, width: 10, height: 6 };
      const center = RectangleOps.center(rect);

      expect(center.x).toBe(5);
      expect(center.y).toBe(3);
    });

    it("should calculate center with negative coordinates", () => {
      const rect: Rectangle = { x: -4, y: -6, width: 8, height: 12 };
      const center = RectangleOps.center(rect);

      expect(center.x).toBe(0); // -4 + 8/2
      expect(center.y).toBe(0); // -6 + 12/2
    });

    it("should calculate center for square", () => {
      const rect: Rectangle = { x: 1, y: 1, width: 4, height: 4 };
      const center = RectangleOps.center(rect);

      expect(center.x).toBe(3);
      expect(center.y).toBe(3);
    });

    it("should calculate center with fractional values", () => {
      const rect: Rectangle = { x: 1.5, y: 2.5, width: 3.0, height: 5.0 };
      const center = RectangleOps.center(rect);

      expect(center.x).toBe(3.0); // 1.5 + 3.0/2
      expect(center.y).toBe(5.0); // 2.5 + 5.0/2
    });

    it("should handle zero dimensions", () => {
      const rect: Rectangle = { x: 5, y: 7, width: 0, height: 0 };
      const center = RectangleOps.center(rect);

      expect(center.x).toBe(5);
      expect(center.y).toBe(7);
    });
  });

  describe("containsPoint", () => {
    const rect: Rectangle = { x: 2, y: 3, width: 6, height: 4 };

    it("should return true for point inside rectangle", () => {
      const point: Point = { x: 5, y: 5 };
      expect(RectangleOps.containsPoint(rect, point)).toBe(true);
    });

    it("should return true for point on left edge", () => {
      const point: Point = { x: 2, y: 5 };
      expect(RectangleOps.containsPoint(rect, point)).toBe(true);
    });

    it("should return true for point on right edge", () => {
      const point: Point = { x: 8, y: 5 };
      expect(RectangleOps.containsPoint(rect, point)).toBe(true);
    });

    it("should return true for point on top edge", () => {
      const point: Point = { x: 5, y: 3 };
      expect(RectangleOps.containsPoint(rect, point)).toBe(true);
    });

    it("should return true for point on bottom edge", () => {
      const point: Point = { x: 5, y: 7 };
      expect(RectangleOps.containsPoint(rect, point)).toBe(true);
    });

    it("should return true for point at corners", () => {
      expect(RectangleOps.containsPoint(rect, { x: 2, y: 3 })).toBe(true); // top-left
      expect(RectangleOps.containsPoint(rect, { x: 8, y: 3 })).toBe(true); // top-right
      expect(RectangleOps.containsPoint(rect, { x: 2, y: 7 })).toBe(true); // bottom-left
      expect(RectangleOps.containsPoint(rect, { x: 8, y: 7 })).toBe(true); // bottom-right
    });

    it("should return false for point outside rectangle", () => {
      const point: Point = { x: 10, y: 5 };
      expect(RectangleOps.containsPoint(rect, point)).toBe(false);
    });

    it("should return false for point left of rectangle", () => {
      const point: Point = { x: 1, y: 5 };
      expect(RectangleOps.containsPoint(rect, point)).toBe(false);
    });

    it("should return false for point above rectangle", () => {
      const point: Point = { x: 5, y: 2 };
      expect(RectangleOps.containsPoint(rect, point)).toBe(false);
    });

    it("should return false for point below rectangle", () => {
      const point: Point = { x: 5, y: 8 };
      expect(RectangleOps.containsPoint(rect, point)).toBe(false);
    });

    it("should handle rectangle at origin", () => {
      const originRect: Rectangle = { x: 0, y: 0, width: 5, height: 3 };

      expect(RectangleOps.containsPoint(originRect, { x: 2, y: 1 })).toBe(true);
      expect(RectangleOps.containsPoint(originRect, { x: -1, y: 1 })).toBe(false);
    });

    it("should handle zero-size rectangle", () => {
      const zeroRect: Rectangle = { x: 3, y: 4, width: 0, height: 0 };

      expect(RectangleOps.containsPoint(zeroRect, { x: 3, y: 4 })).toBe(true);
      expect(RectangleOps.containsPoint(zeroRect, { x: 3.1, y: 4 })).toBe(false);
    });
  });

  describe("intersection", () => {
    it("should return intersection of overlapping rectangles", () => {
      const rect1: Rectangle = { x: 2, y: 3, width: 6, height: 4 };
      const rect2: Rectangle = { x: 5, y: 4, width: 4, height: 5 };
      const intersection = RectangleOps.intersection(rect1, rect2);

      expect(intersection).not.toBeNull();
      expect(intersection!.x).toBe(5);
      expect(intersection!.y).toBe(4);
      expect(intersection!.width).toBe(3); // min(8, 9) - 5
      expect(intersection!.height).toBe(3); // min(7, 9) - 4
    });

    it("should return null for non-overlapping rectangles", () => {
      const rect1: Rectangle = { x: 0, y: 0, width: 3, height: 3 };
      const rect2: Rectangle = { x: 5, y: 5, width: 2, height: 2 };
      const intersection = RectangleOps.intersection(rect1, rect2);

      expect(intersection).toBeNull();
    });

    it("should return null for touching rectangles", () => {
      const rect1: Rectangle = { x: 0, y: 0, width: 3, height: 3 };
      const rect2: Rectangle = { x: 3, y: 0, width: 2, height: 2 };
      const intersection = RectangleOps.intersection(rect1, rect2);

      expect(intersection).toBeNull();
    });

    it("should return intersection for identical rectangles", () => {
      const rect1: Rectangle = { x: 2, y: 3, width: 5, height: 4 };
      const rect2: Rectangle = { x: 2, y: 3, width: 5, height: 4 };
      const intersection = RectangleOps.intersection(rect1, rect2);

      expect(intersection).toEqual(rect1);
    });

    it("should return intersection when one rectangle contains another", () => {
      const rect1: Rectangle = { x: 1, y: 1, width: 8, height: 6 };
      const rect2: Rectangle = { x: 3, y: 2, width: 2, height: 3 };
      const intersection = RectangleOps.intersection(rect1, rect2);

      expect(intersection).toEqual(rect2);
    });

    it("should handle partial overlap", () => {
      const rect1: Rectangle = { x: 0, y: 0, width: 4, height: 4 };
      const rect2: Rectangle = { x: 2, y: 2, width: 4, height: 4 };
      const intersection = RectangleOps.intersection(rect1, rect2);

      expect(intersection).not.toBeNull();
      expect(intersection!.x).toBe(2);
      expect(intersection!.y).toBe(2);
      expect(intersection!.width).toBe(2);
      expect(intersection!.height).toBe(2);
    });

    it("should handle rectangles with negative coordinates", () => {
      const rect1: Rectangle = { x: -2, y: -3, width: 5, height: 4 };
      const rect2: Rectangle = { x: 1, y: -1, width: 3, height: 3 };
      const intersection = RectangleOps.intersection(rect1, rect2);

      expect(intersection).not.toBeNull();
      expect(intersection!.x).toBe(1);
      expect(intersection!.y).toBe(-1);
      expect(intersection!.width).toBe(2); // min(3, 4) - 1
      expect(intersection!.height).toBe(2); // min(1, 2) - (-1)
    });

    it("should return null for rectangles separated horizontally", () => {
      const rect1: Rectangle = { x: 0, y: 0, width: 2, height: 4 };
      const rect2: Rectangle = { x: 5, y: 0, width: 2, height: 4 };
      const intersection = RectangleOps.intersection(rect1, rect2);

      expect(intersection).toBeNull();
    });

    it("should return null for rectangles separated vertically", () => {
      const rect1: Rectangle = { x: 0, y: 0, width: 4, height: 2 };
      const rect2: Rectangle = { x: 0, y: 5, width: 4, height: 2 };
      const intersection = RectangleOps.intersection(rect1, rect2);

      expect(intersection).toBeNull();
    });

    it("should handle zero-width rectangles", () => {
      const rect1: Rectangle = { x: 2, y: 2, width: 0, height: 4 };
      const rect2: Rectangle = { x: 1, y: 3, width: 3, height: 2 };
      const intersection = RectangleOps.intersection(rect1, rect2);

      expect(intersection).toBeNull();
    });

    it("should handle zero-height rectangles", () => {
      const rect1: Rectangle = { x: 2, y: 2, width: 4, height: 0 };
      const rect2: Rectangle = { x: 3, y: 1, width: 2, height: 3 };
      const intersection = RectangleOps.intersection(rect1, rect2);

      expect(intersection).toBeNull();
    });
  });
});
