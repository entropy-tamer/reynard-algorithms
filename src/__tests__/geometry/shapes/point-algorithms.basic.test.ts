import { describe, it, expect } from "vitest";
import { PointOps } from "../../../geometry/shapes/point-algorithms";

describe("PointOps - Basic Operations", () => {
  describe("create", () => {
    it("should create a point with given coordinates", () => {
      const point = PointOps.create(5, 10);
      expect(point.x).toBe(5);
      expect(point.y).toBe(10);
    });
  });

  describe("add", () => {
    it("should add two points correctly", () => {
      const a = PointOps.create(1, 2);
      const b = PointOps.create(3, 4);
      const result = PointOps.add(a, b);
      expect(result.x).toBe(4);
      expect(result.y).toBe(6);
    });
  });

  describe("subtract", () => {
    it("should subtract two points correctly", () => {
      const a = PointOps.create(5, 8);
      const b = PointOps.create(2, 3);
      const result = PointOps.subtract(a, b);
      expect(result.x).toBe(3);
      expect(result.y).toBe(5);
    });
  });

  describe("multiply", () => {
    it("should multiply point by scalar correctly", () => {
      const point = PointOps.create(2, 3);
      const result = PointOps.multiply(point, 4);
      expect(result.x).toBe(8);
      expect(result.y).toBe(12);
    });
  });

  describe("divide", () => {
    it("should divide point by scalar correctly", () => {
      const point = PointOps.create(8, 12);
      const result = PointOps.divide(point, 4);
      expect(result.x).toBe(2);
      expect(result.y).toBe(3);
    });

    it("should throw error when dividing by zero", () => {
      const point = PointOps.create(1, 2);
      expect(() => PointOps.divide(point, 0)).toThrow("Division by zero");
    });
  });
});
