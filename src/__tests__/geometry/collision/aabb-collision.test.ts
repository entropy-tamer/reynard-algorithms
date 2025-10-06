import { describe, it, expect } from "vitest";
import { checkCollision } from "../../../geometry/collision/aabb-collision";
import type { AABB } from "../../../geometry/collision/aabb-types";

describe("AABB Collision Detection", () => {
  describe("checkCollision", () => {
    it("should detect collision between overlapping AABBs", () => {
      const aabb1: AABB = { x: 0, y: 0, width: 100, height: 100 };
      const aabb2: AABB = { x: 50, y: 50, width: 100, height: 100 };

      const result = checkCollision(aabb1, aabb2);
      expect(result.colliding).toBe(true);
      expect(result.overlapArea).toBe(2500);
      expect(result.overlap).toEqual({ x: 50, y: 50, width: 50, height: 50 });
    });

    it("should not detect collision between non-overlapping AABBs", () => {
      const aabb1: AABB = { x: 0, y: 0, width: 50, height: 50 };
      const aabb2: AABB = { x: 100, y: 100, width: 50, height: 50 };

      const result = checkCollision(aabb1, aabb2);
      expect(result.colliding).toBe(false);
      expect(result.overlapArea).toBe(0);
      expect(result.overlap).toBeNull();
    });

    it("should detect collision when AABBs are touching", () => {
      const aabb1: AABB = { x: 0, y: 0, width: 50, height: 50 };
      const aabb2: AABB = { x: 50, y: 0, width: 50, height: 50 };

      const result = checkCollision(aabb1, aabb2);
      expect(result.colliding).toBe(true);
    });

    it("should handle point AABBs (zero width/height)", () => {
      const pointAABB: AABB = { x: 25, y: 25, width: 0, height: 0 };
      const boxAABB: AABB = { x: 0, y: 0, width: 100, height: 100 };

      const result = checkCollision(pointAABB, boxAABB);
      expect(result.colliding).toBe(true);
    });

    it("should handle identical AABBs", () => {
      const aabb: AABB = { x: 10, y: 20, width: 30, height: 40 };

      const result = checkCollision(aabb, aabb);
      expect(result.colliding).toBe(true);
      expect(result.overlapArea).toBe(1200);
      expect(result.overlap).toEqual(aabb);
    });

    it("should calculate distance between centers correctly", () => {
      const aabb1: AABB = { x: 0, y: 0, width: 10, height: 10 };
      const aabb2: AABB = { x: 20, y: 20, width: 10, height: 10 };

      const result = checkCollision(aabb1, aabb2);
      expect(result.distance).toBeCloseTo(28.28, 1);
    });

    it("should handle edge case with negative coordinates", () => {
      const aabb1: AABB = { x: -10, y: -10, width: 20, height: 20 };
      const aabb2: AABB = { x: 0, y: 0, width: 10, height: 10 };

      const result = checkCollision(aabb1, aabb2);
      expect(result.colliding).toBe(true);
      expect(result.overlapArea).toBe(100);
    });

    it("should handle very small AABBs", () => {
      const aabb1: AABB = { x: 0, y: 0, width: 0.1, height: 0.1 };
      const aabb2: AABB = { x: 0.05, y: 0.05, width: 0.1, height: 0.1 };

      const result = checkCollision(aabb1, aabb2);
      expect(result.colliding).toBe(true);
      expect(result.overlapArea).toBeCloseTo(0.0025, 4);
    });
  });
});
