import { describe, it, expect } from "vitest";
import { VectorOps, type Vector } from "../../../geometry/vectors/vector-algorithms";

describe("VectorOps - Scalar Operations", () => {
  describe("multiply", () => {
    it("should multiply vector by scalar", () => {
      const vector = VectorOps.create(2, 3);
      const result = VectorOps.multiply(vector, 4);
      expect(result.x).toBe(8);
      expect(result.y).toBe(12);
    });
  });

  describe("divide", () => {
    it("should divide vector by scalar", () => {
      const vector = VectorOps.create(8, 12);
      const result = VectorOps.divide(vector, 4);
      expect(result.x).toBe(2);
      expect(result.y).toBe(3);
    });

    it("should throw error when dividing by zero", () => {
      const vector = VectorOps.create(1, 2);
      expect(() => VectorOps.divide(vector, 0)).toThrow("Division by zero");
    });
  });
});
