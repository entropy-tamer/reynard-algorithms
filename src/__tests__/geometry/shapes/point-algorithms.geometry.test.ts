import { describe, it, expect } from "vitest";
import { PointOps } from "../../../geometry/shapes/point-algorithms";

describe("PointOps - Geometry Operations", () => {
  describe("distance", () => {
    it("should calculate distance between two points", () => {
      const a = PointOps.create(0, 0);
      const b = PointOps.create(3, 4);
      const result = PointOps.distance(a, b);
      expect(result).toBe(5);
    });

    it("should return 0 for same points", () => {
      const a = PointOps.create(5, 5);
      const b = PointOps.create(5, 5);
      const result = PointOps.distance(a, b);
      expect(result).toBe(0);
    });
  });

  describe("distanceSquared", () => {
    it("should calculate squared distance between two points", () => {
      const a = PointOps.create(0, 0);
      const b = PointOps.create(3, 4);
      const result = PointOps.distanceSquared(a, b);
      expect(result).toBe(25);
    });
  });

  describe("midpoint", () => {
    it("should calculate midpoint between two points", () => {
      const a = PointOps.create(0, 0);
      const b = PointOps.create(4, 6);
      const result = PointOps.midpoint(a, b);
      expect(result.x).toBe(2);
      expect(result.y).toBe(3);
    });
  });

  describe("lerp", () => {
    it("should interpolate between two points", () => {
      const a = PointOps.create(0, 0);
      const b = PointOps.create(10, 20);
      const result = PointOps.lerp(a, b, 0.5);
      expect(result.x).toBe(5);
      expect(result.y).toBe(10);
    });

    it("should return first point at t=0", () => {
      const a = PointOps.create(1, 2);
      const b = PointOps.create(5, 6);
      const result = PointOps.lerp(a, b, 0);
      expect(result.x).toBe(1);
      expect(result.y).toBe(2);
    });

    it("should return second point at t=1", () => {
      const a = PointOps.create(1, 2);
      const b = PointOps.create(5, 6);
      const result = PointOps.lerp(a, b, 1);
      expect(result.x).toBe(5);
      expect(result.y).toBe(6);
    });
  });
});
