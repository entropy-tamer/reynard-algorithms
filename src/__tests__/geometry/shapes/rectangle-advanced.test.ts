import { describe, it, expect } from "vitest";
import { RectangleAdvanced } from "../../../geometry/shapes/rectangle-advanced";

describe("RectangleAdvanced", () => {
  describe("intersects", () => {
    it("should return true for intersecting rectangles", () => {
      const rect1 = { x: 0, y: 0, width: 100, height: 100 };
      const rect2 = { x: 50, y: 50, width: 100, height: 100 };
      expect(RectangleAdvanced.intersects(rect1, rect2)).toBe(true);
    });

    it("should return false for non-intersecting rectangles", () => {
      const rect1 = { x: 0, y: 0, width: 50, height: 50 };
      const rect2 = { x: 100, y: 100, width: 50, height: 50 };
      expect(RectangleAdvanced.intersects(rect1, rect2)).toBe(false);
    });
  });

  describe("intersection", () => {
    it("should return intersection of two rectangles", () => {
      const rect1 = { x: 0, y: 0, width: 100, height: 100 };
      const rect2 = { x: 50, y: 50, width: 100, height: 100 };
      const intersection = RectangleAdvanced.intersection(rect1, rect2);
      expect(intersection?.x).toBe(50);
      expect(intersection?.y).toBe(50);
      expect(intersection?.width).toBe(50);
      expect(intersection?.height).toBe(50);
    });

    it("should return null for non-intersecting rectangles", () => {
      const rect1 = { x: 0, y: 0, width: 50, height: 50 };
      const rect2 = { x: 100, y: 100, width: 50, height: 50 };
      const intersection = RectangleAdvanced.intersection(rect1, rect2);
      expect(intersection).toBeNull();
    });
  });

  describe("union", () => {
    it("should return union of two rectangles", () => {
      const rect1 = { x: 0, y: 0, width: 50, height: 50 };
      const rect2 = { x: 25, y: 25, width: 50, height: 50 };
      const union = RectangleAdvanced.union(rect1, rect2);
      expect(union.x).toBe(0);
      expect(union.y).toBe(0);
      expect(union.width).toBe(75);
      expect(union.height).toBe(75);
    });
  });

  describe("expand", () => {
    it("should expand rectangle by given amount", () => {
      const rect = { x: 10, y: 20, width: 100, height: 50 };
      const expanded = RectangleAdvanced.expand(rect, 5);
      expect(expanded.x).toBe(5);
      expect(expanded.y).toBe(15);
      expect(expanded.width).toBe(110);
      expect(expanded.height).toBe(60);
    });
  });

  describe("shrink", () => {
    it("should shrink rectangle by given amount", () => {
      const rect = { x: 10, y: 20, width: 100, height: 50 };
      const shrunk = RectangleAdvanced.shrink(rect, 5);
      expect(shrunk.x).toBe(15);
      expect(shrunk.y).toBe(25);
      expect(shrunk.width).toBe(90);
      expect(shrunk.height).toBe(40);
    });
  });

  describe("translate", () => {
    it("should translate rectangle by given offset", () => {
      const rect = { x: 10, y: 20, width: 100, height: 50 };
      const offset = { x: 5, y: 10 };
      const translated = RectangleAdvanced.translate(rect, offset);
      expect(translated.x).toBe(15);
      expect(translated.y).toBe(30);
      expect(translated.width).toBe(100);
      expect(translated.height).toBe(50);
    });
  });

  describe("scale", () => {
    it("should scale rectangle from origin", () => {
      const rect = { x: 0, y: 0, width: 100, height: 50 };
      const scaled = RectangleAdvanced.scale(rect, 2);
      expect(scaled.x).toBe(0);
      expect(scaled.y).toBe(0);
      expect(scaled.width).toBe(200);
      expect(scaled.height).toBe(100);
    });

    it("should scale rectangle from center", () => {
      const rect = { x: 0, y: 0, width: 100, height: 50 };
      const center = { x: 50, y: 25 };
      const scaled = RectangleAdvanced.scale(rect, 2, center);
      expect(scaled.x).toBe(-50); // 50 - 200/2 = -50
      expect(scaled.y).toBe(-25); // 25 - 100/2 = -25
      expect(scaled.width).toBe(200);
      expect(scaled.height).toBe(100);
    });
  });
});
