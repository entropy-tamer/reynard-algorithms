import { describe, it, expect } from "vitest";
import { LineOps } from "../../../geometry/shapes/line-algorithms";

describe("LineOps - Basic Operations", () => {
  describe("create", () => {
    it("should create a line with start and end points", () => {
      const start = { x: 0, y: 0 };
      const end = { x: 10, y: 20 };
      const line = LineOps.create(start, end);

      expect(line.start).toEqual(start);
      expect(line.end).toEqual(end);
    });
  });

  describe("getLength", () => {
    it("should calculate length correctly", () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 3, y: 4 });
      expect(LineOps.getLength(line)).toBe(5);
    });

    it("should calculate length for horizontal line", () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 0 });
      expect(LineOps.getLength(line)).toBe(10);
    });

    it("should calculate length for vertical line", () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 0, y: 10 });
      expect(LineOps.getLength(line)).toBe(10);
    });

    it("should return zero for point line", () => {
      const line = LineOps.create({ x: 5, y: 5 }, { x: 5, y: 5 });
      expect(LineOps.getLength(line)).toBe(0);
    });
  });

  describe("getLengthSquared", () => {
    it("should calculate squared length correctly", () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 3, y: 4 });
      expect(LineOps.getLengthSquared(line)).toBe(25);
    });

    it("should be faster than getLength for comparisons", () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 3, y: 4 });
      const lengthSquared = LineOps.getLengthSquared(line);
      const length = LineOps.getLength(line);

      expect(lengthSquared).toBe(length * length);
    });
  });

  describe("midpoint", () => {
    it("should calculate midpoint correctly", () => {
      const line = LineOps.create({ x: 0, y: 0 }, { x: 10, y: 20 });
      const midpoint = LineOps.midpoint(line);

      expect(midpoint).toEqual({ x: 5, y: 10 });
    });

    it("should work with negative coordinates", () => {
      const line = LineOps.create({ x: -10, y: -20 }, { x: 10, y: 20 });
      const midpoint = LineOps.midpoint(line);

      expect(midpoint).toEqual({ x: 0, y: 0 });
    });

    it("should work for point line", () => {
      const line = LineOps.create({ x: 5, y: 5 }, { x: 5, y: 5 });
      const midpoint = LineOps.midpoint(line);

      expect(midpoint).toEqual({ x: 5, y: 5 });
    });
  });
});
