import { describe, it, expect } from "vitest";
import { VectorOps, type Vector } from "../../../geometry/vectors/vector-algorithms";

describe("VectorOps - Mathematical Operations", () => {
  describe("dot", () => {
    it("should calculate dot product", () => {
      const a = VectorOps.create(1, 2);
      const b = VectorOps.create(3, 4);
      const result = VectorOps.dot(a, b);
      expect(result).toBe(11); // 1*3 + 2*4 = 3 + 8 = 11
    });

    it("should return 0 for perpendicular vectors", () => {
      const a = VectorOps.create(1, 0);
      const b = VectorOps.create(0, 1);
      const result = VectorOps.dot(a, b);
      expect(result).toBe(0);
    });
  });

  describe("cross", () => {
    it("should calculate cross product", () => {
      const a = VectorOps.create(1, 2);
      const b = VectorOps.create(3, 4);
      const result = VectorOps.cross(a, b);
      expect(result).toBe(-2); // 1*4 - 2*3 = 4 - 6 = -2
    });
  });

  describe("magnitude", () => {
    it("should calculate vector magnitude", () => {
      const vector = VectorOps.create(3, 4);
      const result = VectorOps.magnitude(vector);
      expect(result).toBe(5);
    });

    it("should return 0 for zero vector", () => {
      const vector = VectorOps.create(0, 0);
      const result = VectorOps.magnitude(vector);
      expect(result).toBe(0);
    });
  });

  describe("magnitudeSquared", () => {
    it("should calculate squared magnitude", () => {
      const vector = VectorOps.create(3, 4);
      const result = VectorOps.magnitudeSquared(vector);
      expect(result).toBe(25);
    });
  });
});
