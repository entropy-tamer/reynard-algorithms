import { describe, it, expect } from "vitest";
import { LineOps } from "../../../geometry/shapes/line-algorithms";

describe("LineOps - Geometric Operations", () => {
  describe("direction", () => {
    it("should calculate direction vector correctly", () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 3, y: 4 });
      const direction = LineOps.direction(line);

      expect(direction).toEqual({ x: 3, y: 4 });
    });

    it("should work with negative direction", () => {
      const line = LineOps.create({ x: 3, y: 4 }, { x: 0, y: 0 });
      const direction = LineOps.direction(line);

      expect(direction).toEqual({ x: -3, y: -4 });
    });

    it("should return zero vector for point line", () => {
      const line = LineOps.create({ x: 5, y: 5 }, { x: 5, y: 5 });
      const direction = LineOps.direction(line);

      expect(direction).toEqual({ x: 0, y: 0 });
    });
  });

  describe("normal", () => {
    it("should calculate normalized perpendicular vector", () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 3, y: 0 });
      const normal = LineOps.normal(line);

      expect(normal.x).toBeCloseTo(0, 5);
      expect(normal.y).toBeCloseTo(1, 5);
    });

    it("should calculate normal for diagonal line", () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 1, y: 1 });
      const normal = LineOps.normal(line);
      const magnitude = Math.sqrt(normal.x * normal.x + normal.y * normal.y);

      expect(magnitude).toBeCloseTo(1, 5);
    });

    it("should return zero vector for point line", () => {
      const line = LineOps.create({ x: 5, y: 5 }, { x: 5, y: 5 });
      const normal = LineOps.normal(line);

      expect(normal).toEqual({ x: 0, y: 0 });
    });
  });

  describe("pointAt", () => {
    it("should return start point at t=0", () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 20 });
      const point = LineOps.pointAt(line, 0);

      expect(point).toEqual({ x: 0, y: 0 });
    });

    it("should return end point at t=1", () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 20 });
      const point = LineOps.pointAt(line, 1);

      expect(point).toEqual({ x: 10, y: 20 });
    });

    it("should return midpoint at t=0.5", () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 20 });
      const point = LineOps.pointAt(line, 0.5);

      expect(point).toEqual({ x: 5, y: 10 });
    });

    it("should work with t outside [0,1] range", () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 20 });
      const point = LineOps.pointAt(line, 2);

      expect(point).toEqual({ x: 20, y: 40 });
    });
  });
});
