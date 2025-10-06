import { describe, it, expect } from "vitest";
import { RectangleBasic } from "../../../geometry/shapes/rectangle-basic";
import { PointOps } from "../../../geometry/shapes/point-algorithms";

describe("RectangleBasic", () => {
  describe("create", () => {
    it("should create a rectangle with given parameters", () => {
      const rect = RectangleBasic.create(10, 20, 100, 50);
      expect(rect.x).toBe(10);
      expect(rect.y).toBe(20);
      expect(rect.width).toBe(100);
      expect(rect.height).toBe(50);
    });
  });

  describe("fromPoints", () => {
    it("should create rectangle from two points", () => {
      const p1 = PointOps.create(0, 0);
      const p2 = PointOps.create(100, 50);
      const rect = RectangleBasic.fromPoints(p1, p2);
      expect(rect.x).toBe(0);
      expect(rect.y).toBe(0);
      expect(rect.width).toBe(100);
      expect(rect.height).toBe(50);
    });

    it("should handle points in reverse order", () => {
      const p1 = PointOps.create(100, 50);
      const p2 = PointOps.create(0, 0);
      const rect = RectangleBasic.fromPoints(p1, p2);
      expect(rect.x).toBe(100);
      expect(rect.y).toBe(50);
      expect(rect.width).toBe(-100);
      expect(rect.height).toBe(-50);
    });
  });

  describe("area", () => {
    it("should calculate rectangle area", () => {
      const rect = RectangleBasic.create(0, 0, 10, 20);
      expect(RectangleBasic.area(rect)).toBe(200);
    });

    it("should return 0 for zero-sized rectangle", () => {
      const rect = RectangleBasic.create(0, 0, 0, 0);
      expect(RectangleBasic.area(rect)).toBe(0);
    });
  });

  describe("perimeter", () => {
    it("should calculate rectangle perimeter", () => {
      const rect = RectangleBasic.create(0, 0, 10, 20);
      expect(RectangleBasic.perimeter(rect)).toBe(60);
    });
  });

  describe("center", () => {
    it("should calculate rectangle center", () => {
      const rect = RectangleBasic.create(0, 0, 100, 50);
      const center = RectangleBasic.center(rect);
      expect(center.x).toBe(50);
      expect(center.y).toBe(25);
    });
  });

  describe("corners", () => {
    it("should return correct corner points", () => {
      const rect = RectangleBasic.create(10, 20, 100, 50);

      const topLeft = RectangleBasic.topLeft(rect);
      expect(topLeft.x).toBe(10);
      expect(topLeft.y).toBe(20);

      const topRight = RectangleBasic.topRight(rect);
      expect(topRight.x).toBe(110);
      expect(topRight.y).toBe(20);

      const bottomLeft = RectangleBasic.bottomLeft(rect);
      expect(bottomLeft.x).toBe(10);
      expect(bottomLeft.y).toBe(70);

      const bottomRight = RectangleBasic.bottomRight(rect);
      expect(bottomRight.x).toBe(110);
      expect(bottomRight.y).toBe(70);
    });
  });

  describe("containsPoint", () => {
    it("should return true for point inside rectangle", () => {
      const rect = RectangleBasic.create(0, 0, 100, 50);
      const point = PointOps.create(50, 25);
      expect(RectangleBasic.containsPoint(rect, point)).toBe(true);
    });

    it("should return false for point outside rectangle", () => {
      const rect = RectangleBasic.create(0, 0, 100, 50);
      const point = PointOps.create(150, 75);
      expect(RectangleBasic.containsPoint(rect, point)).toBe(false);
    });

    it("should return true for point on rectangle edge", () => {
      const rect = RectangleBasic.create(0, 0, 100, 50);
      const point = PointOps.create(50, 0);
      expect(RectangleBasic.containsPoint(rect, point)).toBe(true);
    });
  });

  describe("containsRectangle", () => {
    it("should return true when rectangle contains another", () => {
      const outer = RectangleBasic.create(0, 0, 100, 100);
      const inner = RectangleBasic.create(25, 25, 50, 50);
      expect(RectangleBasic.containsRectangle(outer, inner)).toBe(true);
    });

    it("should return false when rectangle does not contain another", () => {
      const rect1 = RectangleBasic.create(0, 0, 50, 50);
      const rect2 = RectangleBasic.create(25, 25, 50, 50);
      expect(RectangleBasic.containsRectangle(rect1, rect2)).toBe(false);
    });
  });
});
