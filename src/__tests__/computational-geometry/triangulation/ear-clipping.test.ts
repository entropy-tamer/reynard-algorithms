/**
 * @file ear-clipping.test.ts
 * @description Tests for Ear Clipping triangulation algorithm.
 */

import { describe, it, expect } from "vitest";
import { EarClipping } from "../../../algorithms/computational-geometry/triangulation/ear-clipping/ear-clipping-core";
import type { Point } from "../../../core/types";

describe("EarClipping", () => {
  describe("Basic triangulation", () => {
    it("should triangulate a square", () => {
      const vertices: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ];

      const earClipping = new EarClipping();
      const result = earClipping.triangulate(vertices);

      expect(result.triangles).toHaveLength(2);
      expect(result.stats.vertexCount).toBe(4);
      expect(result.stats.triangleCount).toBe(2);
    });

    it("should triangulate a triangle (degenerate case)", () => {
      const vertices: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 5, y: 10 },
      ];

      const earClipping = new EarClipping();
      const result = earClipping.triangulate(vertices);

      expect(result.triangles).toHaveLength(1);
      expect(result.stats.triangleCount).toBe(1);
      expect(result.stats.earsClipped).toBe(0);
    });

    it("should triangulate a pentagon", () => {
      const vertices: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 12, y: 5 },
        { x: 5, y: 10 },
        { x: -2, y: 5 },
      ];

      const earClipping = new EarClipping();
      const result = earClipping.triangulate(vertices);

      expect(result.triangles).toHaveLength(3);
      expect(result.stats.vertexCount).toBe(5);
    });
  });

  describe("Input validation", () => {
    it("should throw error for less than 3 vertices", () => {
      const earClipping = new EarClipping();
      expect(() => earClipping.triangulate([{ x: 0, y: 0 }])).toThrow();
      expect(() => earClipping.triangulate([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toThrow();
    });

    it("should throw error for duplicate consecutive vertices", () => {
      const earClipping = new EarClipping();
      const vertices: Point[] = [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ];
      expect(() => earClipping.triangulate(vertices)).toThrow();
    });
  });
});





