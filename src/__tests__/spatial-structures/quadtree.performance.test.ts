import { describe, it, expect, beforeEach } from "vitest";
import { Quadtree } from "../../spatial-structures/quadtree";
import type { Rectangle } from "../../geometry/shapes/shapes";

// Setup shared bounds and quadtree instance per test
const bounds: Rectangle = { x: 0, y: 0, width: 1000, height: 1000 };

let quadtree: Quadtree<string>;

describe("Quadtree Performance Tests", () => {
  beforeEach(() => {
    quadtree = new Quadtree<string>(bounds);
  });

  describe("Performance Benchmarks", () => {
    it("should handle large number of objects efficiently", () => {
      const startTime = performance.now();

      // Insert many objects
      for (let i = 0; i < 1000; i++) {
        quadtree.insert(`obj${i}`, {
          x: Math.random() * 1000,
          y: Math.random() * 1000,
        });
      }

      const insertTime = performance.now() - startTime;
      expect(insertTime).toBeLessThan(200); // Should complete in under 200ms

      const stats = quadtree.getStats();
      expect(stats.totalObjects).toBe(1000);
    });

    it("should handle many queries efficiently", () => {
      // Insert objects first
      for (let i = 0; i < 100; i++) {
        quadtree.insert(`obj${i}`, {
          x: Math.random() * 1000,
          y: Math.random() * 1000,
        });
      }

      const startTime = performance.now();

      // Perform many queries
      for (let i = 0; i < 1000; i++) {
        quadtree.queryRect({
          bounds: {
            x: Math.random() * 800,
            y: Math.random() * 800,
            width: 200,
            height: 200,
          },
        });
      }

      const queryTime = performance.now() - startTime;
      expect(queryTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it("should maintain performance with mixed operations", () => {
      const startTime = performance.now();

      // Mix of operations
      for (let i = 0; i < 500; i++) {
        quadtree.insert(`obj${i}`, {
          x: Math.random() * 1000,
          y: Math.random() * 1000,
        });

        if (i % 10 === 0) {
          quadtree.queryRect({
            bounds: {
              x: Math.random() * 800,
              y: Math.random() * 800,
              width: 200,
              height: 200,
            },
          });
        }
      }

      const mixedTime = performance.now() - startTime;
      expect(mixedTime).toBeLessThan(150); // Should complete in under 150ms
    });
  });

  describe("Integration", () => {
    it("should work with different data types", () => {
      const numberQuadtree = new Quadtree<number>(bounds);
      const objectQuadtree = new Quadtree<{ id: number; name: string }>(bounds);

      numberQuadtree.insert(42, { x: 100, y: 100 });
      objectQuadtree.insert({ id: 1, name: "test" }, { x: 200, y: 200 });

      const numberQuery = numberQuadtree.queryPoint({ point: { x: 100, y: 100 } });
      const objectQuery = objectQuadtree.queryPoint({ point: { x: 200, y: 200 } });

      expect(numberQuery.objects[0].data).toBe(42);
      expect(objectQuery.objects[0].data.id).toBe(1);
      expect(objectQuery.objects[0].data.name).toBe("test");
    });

    it("should maintain consistency across complex operations", () => {
      // Complex sequence of operations
      quadtree.insert("obj1", { x: 100, y: 100 });
      quadtree.insert("obj2", { x: 200, y: 200 });
      quadtree.insert("obj3", { x: 300, y: 300 });

      // Force subdivision
      quadtree.insert("obj4", { x: 150, y: 150 });
      quadtree.insert("obj5", { x: 250, y: 250 });

      // Remove some objects
      quadtree.remove("obj1", { x: 100, y: 100 });
      quadtree.remove("obj3", { x: 300, y: 300 });

      // Query remaining objects
      const query = quadtree.queryRect({
        bounds: { x: 0, y: 0, width: 1000, height: 1000 },
      });

      expect(query.objects).toHaveLength(3);
      expect(query.objects.some(obj => obj.data === "obj2")).toBe(true);
      expect(query.objects.some(obj => obj.data === "obj4")).toBe(true);
      expect(query.objects.some(obj => obj.data === "obj5")).toBe(true);
    });
  });
});
