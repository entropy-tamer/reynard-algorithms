import { describe, it, expect } from "vitest";
import { PolygonOps } from "../../../geometry/shapes/polygon-algorithms";

describe("PolygonOps - Creation", () => {
  describe("create", () => {
    it("should create a polygon with copied points", () => {
      const points = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ];
      const polygon = PolygonOps.create(points);

      expect(polygon.points).toEqual(points);
      expect(polygon.points).not.toBe(points); // Should be a copy
    });

    it("should handle empty point array", () => {
      const polygon = PolygonOps.create([]);
      expect(polygon.points).toEqual([]);
    });
  });
});
