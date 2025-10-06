import { describe, it, expect } from "vitest";
import { RectangleOps } from "../../../geometry/shapes/rectangle-algorithms";
import { PointOps } from "../../../geometry/shapes/point-algorithms";

describe("RectangleOps Integration", () => {
  describe("basic operations integration", () => {
    it("should create and manipulate rectangles using basic operations", () => {
      const rect = RectangleOps.create(10, 20, 100, 50);
      expect(RectangleOps.area(rect)).toBe(5000);
      expect(RectangleOps.perimeter(rect)).toBe(300);

      const center = RectangleOps.center(rect);
      expect(center.x).toBe(60);
      expect(center.y).toBe(45);
    });
  });

  describe("advanced operations integration", () => {
    it("should perform complex geometric operations", () => {
      const rect1 = RectangleOps.create(0, 0, 100, 100);
      const rect2 = RectangleOps.create(50, 50, 100, 100);

      expect(RectangleOps.intersects(rect1, rect2)).toBe(true);

      const intersection = RectangleOps.intersection(rect1, rect2);
      expect(intersection?.x).toBe(50);
      expect(intersection?.y).toBe(50);
      expect(intersection?.width).toBe(50);
      expect(intersection?.height).toBe(50);

      const union = RectangleOps.union(rect1, rect2);
      expect(union.x).toBe(0);
      expect(union.y).toBe(0);
      expect(union.width).toBe(150);
      expect(union.height).toBe(150);
    });
  });

  describe("transformation chain", () => {
    it("should chain multiple transformations", () => {
      const rect = RectangleOps.create(0, 0, 100, 50);

      // Expand, then translate, then scale
      const expanded = RectangleOps.expand(rect, 10);
      const translated = RectangleOps.translate(expanded, { x: 5, y: 5 });
      const scaled = RectangleOps.scale(translated, 2);

      expect(scaled.x).toBe(-10);
      expect(scaled.y).toBe(-10);
      expect(scaled.width).toBe(240);
      expect(scaled.height).toBe(140);
    });
  });

  describe("point containment with transformations", () => {
    it("should maintain point containment after transformations", () => {
      const rect = RectangleOps.create(0, 0, 100, 50);
      const point = PointOps.create(50, 25);

      expect(RectangleOps.containsPoint(rect, point)).toBe(true);

      const translated = RectangleOps.translate(rect, { x: 10, y: 10 });
      const translatedPoint = PointOps.create(60, 35);
      expect(RectangleOps.containsPoint(translated, translatedPoint)).toBe(true);
    });
  });
});
