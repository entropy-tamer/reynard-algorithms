import { describe, it, expect } from "vitest";
import { VectorOps, type Vector } from "../../../geometry/vectors/vector-algorithms";

describe("VectorOps - Geometric Operations", () => {
  describe("normalize", () => {
    it("should normalize a vector", () => {
      const vector = VectorOps.create(3, 4);
      const result = VectorOps.normalize(vector);
      expect(result.x).toBeCloseTo(0.6, 1);
      expect(result.y).toBeCloseTo(0.8, 1);
      expect(VectorOps.magnitude(result)).toBeCloseTo(1, 5);
    });

    it("should return zero vector when normalizing zero vector", () => {
      const vector = VectorOps.create(0, 0);
      const result = VectorOps.normalize(vector);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });
  });

  describe("angle", () => {
    it("should calculate angle of a vector", () => {
      const vector = VectorOps.create(1, 0);
      const result = VectorOps.angle(vector);
      expect(result).toBeCloseTo(0, 5);
    });

    it("should calculate angle of a vector pointing up", () => {
      const vector = VectorOps.create(0, 1);
      const result = VectorOps.angle(vector);
      expect(result).toBeCloseTo(Math.PI / 2, 5);
    });
  });

  describe("angleBetween", () => {
    it("should calculate angle between vectors", () => {
      const a = VectorOps.create(1, 0);
      const b = VectorOps.create(0, 1);
      const result = VectorOps.angleBetween(a, b);
      expect(result).toBeCloseTo(Math.PI / 2, 5);
    });

    it("should return 0 for parallel vectors", () => {
      const a = VectorOps.create(1, 0);
      const b = VectorOps.create(2, 0);
      const result = VectorOps.angleBetween(a, b);
      expect(result).toBeCloseTo(0, 5);
    });
  });

  describe("rotate", () => {
    it("should rotate vector by angle", () => {
      const vector = VectorOps.create(1, 0);
      const result = VectorOps.rotate(vector, Math.PI / 2);
      expect(result.x).toBeCloseTo(0, 5);
      expect(result.y).toBeCloseTo(1, 5);
    });

    it("should rotate vector by negative angle", () => {
      const vector = VectorOps.create(1, 0);
      const result = VectorOps.rotate(vector, -Math.PI / 2);
      expect(result.x).toBeCloseTo(0, 5);
      expect(result.y).toBeCloseTo(-1, 5);
    });
  });
});
