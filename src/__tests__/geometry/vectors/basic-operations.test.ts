import { describe, expect, it } from "vitest";
import { PointOps } from "../../../geometry/shapes/point-algorithms";
import { VectorOps } from "../../../geometry/vectors/vector-algorithms";

describe("VectorOps - Basic Operations", () => {
  describe("create", () => {
    it("should create a vector with given components", () => {
      const vector = VectorOps.create(3, 4);
      expect(vector.x).toBe(3);
      expect(vector.y).toBe(4);
    });
  });

  describe("fromPoints", () => {
    it("should create vector from two points", () => {
      const start = PointOps.create(1, 2);
      const end = PointOps.create(4, 6);
      const vector = VectorOps.fromPoints(start, end);
      expect(vector.x).toBe(3);
      expect(vector.y).toBe(4);
    });
  });

  describe("add", () => {
    it("should add two vectors", () => {
      const a = VectorOps.create(1, 2);
      const b = VectorOps.create(3, 4);
      const result = VectorOps.add(a, b);
      expect(result.x).toBe(4);
      expect(result.y).toBe(6);
    });
  });

  describe("subtract", () => {
    it("should subtract two vectors", () => {
      const a = VectorOps.create(5, 8);
      const b = VectorOps.create(2, 3);
      const result = VectorOps.subtract(a, b);
      expect(result.x).toBe(3);
      expect(result.y).toBe(5);
    });
  });
});
