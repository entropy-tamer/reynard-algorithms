/**
 * @file Tests for geometry module exports
 */
import { describe, expect, it } from "vitest";
import * as Geometry from "../geometry";

describe("Geometry Module", () => {
  describe("exports", () => {
    it("should export Point operations", () => {
      expect(Geometry.PointOps).toBeDefined();
      expect(typeof Geometry.PointOps.create).toBe("function");
      expect(typeof Geometry.PointOps.add).toBe("function");
      expect(typeof Geometry.PointOps.subtract).toBe("function");
      expect(typeof Geometry.PointOps.distance).toBe("function");
      expect(typeof Geometry.PointOps.midpoint).toBe("function");
    });

    it("should export Vector operations", () => {
      expect(Geometry.VectorOps).toBeDefined();
      expect(typeof Geometry.VectorOps.create).toBe("function");
      expect(typeof Geometry.VectorOps.add).toBe("function");
      expect(typeof Geometry.VectorOps.subtract).toBe("function");
    });

    it("should export Line operations", () => {
      expect(Geometry.LineOps).toBeDefined();
      expect(typeof Geometry.LineOps.create).toBe("function");
    });

    it("should export Rectangle operations", () => {
      expect(Geometry.RectangleOps).toBeDefined();
      expect(typeof Geometry.RectangleOps.create).toBe("function");
    });

    it("should export Circle operations", () => {
      expect(Geometry.CircleOps).toBeDefined();
      expect(typeof Geometry.CircleOps.create).toBe("function");
      expect(typeof Geometry.CircleOps.area).toBe("function");
      expect(typeof Geometry.CircleOps.circumference).toBe("function");
    });

    it("should export Polygon operations", () => {
      expect(Geometry.PolygonOps).toBeDefined();
      expect(typeof Geometry.PolygonOps.create).toBe("function");
    });

    it("should export Transform operations", () => {
      expect(Geometry.TransformOps).toBeDefined();
      expect(typeof Geometry.TransformOps.identity).toBe("function");
    });

    it("should export collision detection functions", () => {
      expect(typeof Geometry.checkCollision).toBe("function");
      expect(typeof Geometry.batchCollisionDetection).toBe("function");
      expect(typeof Geometry.pointInAABB).toBe("function");
      expect(typeof Geometry.areAABBsTouching).toBe("function");
      expect(typeof Geometry.expandAABB).toBe("function");
      expect(typeof Geometry.unionAABB).toBe("function");
      expect(typeof Geometry.intersectionAABB).toBe("function");
      expect(typeof Geometry.containsAABB).toBe("function");
      expect(Geometry.SpatialCollisionOptimizer).toBeDefined();
    });
  });

  describe("integration", () => {
    it("should allow using exported functions together", () => {
      const point1 = Geometry.PointOps.create(1, 2);
      const point2 = Geometry.PointOps.create(4, 6);
      const distance = Geometry.PointOps.distance(point1, point2);

      expect(distance).toBe(5); // 3-4-5 triangle
    });

    it("should allow creating and using geometric shapes", () => {
      const circle = Geometry.CircleOps.create({ x: 0, y: 0 }, 5);
      const area = Geometry.CircleOps.area(circle);

      expect(area).toBeCloseTo(Math.PI * 25, 10);
    });

    it("should allow collision detection with exported functions", () => {
      const aabb1 = { x: 0, y: 0, width: 10, height: 10 };
      const aabb2 = { x: 5, y: 5, width: 10, height: 10 };

      const collision = Geometry.checkCollision(aabb1, aabb2);
      // checkCollision returns CollisionResult object
      expect(collision.colliding).toBe(true);
      expect(collision.overlapArea).toBeGreaterThan(0);
    });
  });
});
