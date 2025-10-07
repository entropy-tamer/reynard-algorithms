import { describe, it, expect, beforeEach } from "vitest";
import {
  Quadtree,
  Point,
  Rectangle,
  QuadtreeData,
  CircleQuery,
  RectangleQuery,
  PointQuery,
  QuadtreeEvent,
} from "../../spatial-structures/quadtree";

describe("Quadtree", () => {
  let quadtree: Quadtree<string>;
  const bounds: Rectangle = { x: 0, y: 0, width: 1000, height: 1000 };

  beforeEach(() => {
    quadtree = new Quadtree<string>(bounds, { maxObjects: 4, maxDepth: 5 });
  });

  describe("Mathematical Theory", () => {
    it("should maintain spatial partitioning properties", () => {
      // Test that objects are properly distributed across quadrants
      quadtree.insert("obj1", { x: 100, y: 100 });
      quadtree.insert("obj2", { x: 800, y: 100 });
      quadtree.insert("obj3", { x: 100, y: 800 });
      quadtree.insert("obj4", { x: 800, y: 800 });

      // Force subdivision by adding more objects
      quadtree.insert("obj5", { x: 150, y: 150 });
      quadtree.insert("obj6", { x: 850, y: 150 });

      const stats = quadtree.getStats();
      expect(stats.totalNodes).toBeGreaterThan(1); // Should have subdivided
      expect(stats.subdivisions).toBeGreaterThan(0);
    });

    it("should maintain logarithmic query complexity", () => {
      // Insert many objects
      for (let i = 0; i < 100; i++) {
        quadtree.insert(`obj${i}`, {
          x: Math.random() * 1000,
          y: Math.random() * 1000,
        });
      }

      const startTime = performance.now();

      // Perform multiple queries
      for (let i = 0; i < 100; i++) {
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
      expect(queryTime).toBeLessThan(100); // Should be fast due to O(log n + k) complexity
    });

    it("should maintain tree height within logarithmic bounds", () => {
      // Insert objects in a way that forces deep subdivision
      for (let i = 0; i < 50; i++) {
        quadtree.insert(`obj${i}`, {
          x: 100 + (i % 10) * 5,
          y: 100 + Math.floor(i / 10) * 5,
        });
      }

      const stats = quadtree.getStats();
      const theoreticalMaxDepth = Math.log2(1000 / 10); // log2(maxSize / minNodeSize)
      expect(stats.maxDepth).toBeLessThanOrEqual(theoreticalMaxDepth + 2); // Allow some tolerance
    });
  });

  describe("Core Operations", () => {
    describe("insert", () => {
      it("should insert objects at correct positions", () => {
        const result = quadtree.insert("test", { x: 100, y: 200 });
        expect(result).toBe(true);

        const query = quadtree.queryPoint({ point: { x: 100, y: 200 } });
        expect(query.objects).toHaveLength(1);
        expect(query.objects[0].data).toBe("test");
      });

      it("should handle objects with bounding boxes", () => {
        const bounds: Rectangle = { x: 50, y: 50, width: 100, height: 100 };
        quadtree.insert("box", { x: 100, y: 100 }, bounds);

        const query = quadtree.queryRect({ bounds: { x: 75, y: 75, width: 50, height: 50 } });
        expect(query.objects).toHaveLength(1);
        expect(query.objects[0].data).toBe("box");
      });

      it("should return false for objects outside bounds", () => {
        const result = quadtree.insert("outside", { x: 1500, y: 1500 });
        expect(result).toBe(false);
      });

      it("should subdivide when max objects exceeded", () => {
        // Insert objects to trigger subdivision
        quadtree.insert("obj1", { x: 100, y: 100 });
        quadtree.insert("obj2", { x: 200, y: 100 });
        quadtree.insert("obj3", { x: 100, y: 200 });
        quadtree.insert("obj4", { x: 200, y: 200 });
        quadtree.insert("obj5", { x: 150, y: 150 }); // Should trigger subdivision

        const stats = quadtree.getStats();
        expect(stats.subdivisions).toBeGreaterThan(0);
        expect(stats.totalNodes).toBeGreaterThan(1);
      });
    });

    describe("remove", () => {
      it("should remove existing objects", () => {
        quadtree.insert("test", { x: 100, y: 200 });
        expect(quadtree.remove("test", { x: 100, y: 200 })).toBe(true);

        const query = quadtree.queryPoint({ point: { x: 100, y: 200 } });
        expect(query.objects).toHaveLength(0);
      });

      it("should return false for non-existent objects", () => {
        expect(quadtree.remove("nonexistent", { x: 100, y: 200 })).toBe(false);
      });

      it("should merge nodes when appropriate", () => {
        // Insert and remove objects to test merging
        quadtree.insert("obj1", { x: 100, y: 100 });
        quadtree.insert("obj2", { x: 200, y: 100 });
        quadtree.insert("obj3", { x: 100, y: 200 });
        quadtree.insert("obj4", { x: 200, y: 200 });
        quadtree.insert("obj5", { x: 150, y: 150 }); // Trigger subdivision

        const initialNodes = quadtree.getStats().totalNodes;

        // Remove most objects
        quadtree.remove("obj1", { x: 100, y: 100 });
        quadtree.remove("obj2", { x: 200, y: 100 });
        quadtree.remove("obj3", { x: 100, y: 200 });
        quadtree.remove("obj4", { x: 200, y: 200 });

        const finalStats = quadtree.getStats();
        expect(finalStats.merges).toBeGreaterThan(0);
      });
    });

    describe("queryRect", () => {
      it("should find objects within rectangular bounds", () => {
        quadtree.insert("obj1", { x: 100, y: 100 });
        quadtree.insert("obj2", { x: 300, y: 300 });
        quadtree.insert("obj3", { x: 500, y: 500 });

        const query = quadtree.queryRect({
          bounds: { x: 50, y: 50, width: 200, height: 200 },
        });

        expect(query.objects).toHaveLength(1);
        expect(query.objects[0].data).toBe("obj1");
      });

      it("should return empty result for empty query area", () => {
        const query = quadtree.queryRect({
          bounds: { x: 50, y: 50, width: 10, height: 10 },
        });

        expect(query.objects).toHaveLength(0);
      });

      it("should include query statistics", () => {
        quadtree.insert("obj1", { x: 100, y: 100 });

        const query = quadtree.queryRect({
          bounds: { x: 50, y: 50, width: 200, height: 200 },
        });

        expect(query.nodesSearched).toBeGreaterThan(0);
        expect(query.queryTime).toBeGreaterThan(0);
        expect(query.queryBounds).toEqual({ x: 50, y: 50, width: 200, height: 200 });
      });
    });

    describe("queryCircle", () => {
      it("should find objects within circular bounds", () => {
        quadtree.insert("obj1", { x: 100, y: 100 });
        quadtree.insert("obj2", { x: 300, y: 300 });
        quadtree.insert("obj3", { x: 500, y: 500 });

        const query = quadtree.queryCircle({
          center: { x: 100, y: 100 },
          radius: 50,
        });

        expect(query.objects).toHaveLength(1);
        expect(query.objects[0].data).toBe("obj1");
      });

      it("should handle large radius queries", () => {
        quadtree.insert("obj1", { x: 100, y: 100 });
        quadtree.insert("obj2", { x: 300, y: 300 });

        const query = quadtree.queryCircle({
          center: { x: 200, y: 200 },
          radius: 200,
        });

        expect(query.objects).toHaveLength(2);
      });
    });

    describe("queryPoint", () => {
      it("should find objects at specific points", () => {
        quadtree.insert("obj1", { x: 100, y: 200 });
        quadtree.insert("obj2", { x: 300, y: 400 });

        const query = quadtree.queryPoint({ point: { x: 100, y: 200 } });
        expect(query.objects).toHaveLength(1);
        expect(query.objects[0].data).toBe("obj1");
      });

      it("should handle tolerance in point queries", () => {
        quadtree.insert("obj1", { x: 100, y: 200 });

        const query = quadtree.queryPoint({
          point: { x: 105, y: 205 },
          tolerance: 10,
        });

        expect(query.objects).toHaveLength(1);
        expect(query.objects[0].data).toBe("obj1");
      });
    });

    describe("findNearestNeighbor", () => {
      it("should find the nearest object to a point", () => {
        quadtree.insert("obj1", { x: 100, y: 100 });
        quadtree.insert("obj2", { x: 300, y: 300 });
        quadtree.insert("obj3", { x: 500, y: 500 });

        const result = quadtree.findNearestNeighbor({ x: 120, y: 120 });

        expect(result.nearest).not.toBeNull();
        expect(result.nearest!.data).toBe("obj1");
        expect(result.distance).toBeCloseTo(28.28, 1); // sqrt(20^2 + 20^2)
      });

      it("should return null when no objects exist", () => {
        const result = quadtree.findNearestNeighbor({ x: 100, y: 100 });
        expect(result.nearest).toBeNull();
        expect(result.distance).toBe(-1);
      });

      it("should respect maximum distance", () => {
        quadtree.insert("obj1", { x: 100, y: 100 });
        quadtree.insert("obj2", { x: 300, y: 300 });

        const result = quadtree.findNearestNeighbor({ x: 200, y: 200 }, 50);

        expect(result.nearest).toBeNull();
        expect(result.distance).toBe(-1);
      });
    });

    describe("detectCollisions", () => {
      it("should detect collisions between nearby objects", () => {
        quadtree.insert("obj1", { x: 100, y: 100 });
        quadtree.insert("obj2", { x: 105, y: 105 });
        quadtree.insert("obj3", { x: 300, y: 300 });

        const result = quadtree.detectCollisions(20);

        expect(result.collisions).toHaveLength(1);
        expect(result.collisions[0].object1.data).toBe("obj1");
        expect(result.collisions[0].object2.data).toBe("obj2");
        expect(result.collisions[0].distance).toBeCloseTo(7.07, 1);
      });

      it("should return empty result when no collisions exist", () => {
        quadtree.insert("obj1", { x: 100, y: 100 });
        quadtree.insert("obj2", { x: 300, y: 300 });

        const result = quadtree.detectCollisions(50);

        expect(result.collisions).toHaveLength(0);
      });

      it("should include collision detection statistics", () => {
        quadtree.insert("obj1", { x: 100, y: 100 });
        quadtree.insert("obj2", { x: 105, y: 105 });

        const result = quadtree.detectCollisions(20);

        expect(result.checksPerformed).toBeGreaterThan(0);
        expect(result.detectionTime).toBeGreaterThan(0);
      });
    });

    describe("clear", () => {
      it("should remove all objects and reset structure", () => {
        quadtree.insert("obj1", { x: 100, y: 100 });
        quadtree.insert("obj2", { x: 200, y: 200 });

        quadtree.clear();

        const stats = quadtree.getStats();
        expect(stats.totalObjects).toBe(0);
        expect(stats.totalNodes).toBe(1);
        expect(stats.leafNodes).toBe(1);
        expect(stats.maxDepth).toBe(0);
      });
    });
  });

  describe("Statistics and Performance", () => {
    it("should track insertion and removal statistics", () => {
      quadtree.insert("obj1", { x: 100, y: 100 });
      quadtree.insert("obj2", { x: 200, y: 200 });
      quadtree.remove("obj1", { x: 100, y: 100 });

      const stats = quadtree.getStats();
      expect(stats.totalObjects).toBe(1);
    });

    it("should track subdivision and merge statistics", () => {
      // Force subdivision
      for (let i = 0; i < 10; i++) {
        quadtree.insert(`obj${i}`, { x: 100 + i * 10, y: 100 + i * 10 });
      }

      const stats = quadtree.getStats();
      expect(stats.subdivisions).toBeGreaterThan(0);
      expect(stats.totalNodes).toBeGreaterThan(1);
    });

    it("should track query statistics", () => {
      quadtree.insert("obj1", { x: 100, y: 100 });

      quadtree.queryRect({ bounds: { x: 50, y: 50, width: 200, height: 200 } });
      quadtree.queryCircle({ center: { x: 100, y: 100 }, radius: 50 });

      const stats = quadtree.getStats();
      expect(stats.queries).toBe(2);
      expect(stats.averageQueryTime).toBeGreaterThan(0);
    });

    it("should provide performance metrics", () => {
      quadtree.insert("obj1", { x: 100, y: 100 });
      quadtree.queryRect({ bounds: { x: 50, y: 50, width: 200, height: 200 } });

      const metrics = quadtree.getPerformanceMetrics();
      expect(metrics.averageInsertTime).toBeGreaterThan(0);
      expect(metrics.averageQueryTime).toBeGreaterThan(0);
      expect(metrics.estimatedMemoryUsage).toBeGreaterThan(0);
    });
  });

  describe("Event Handling", () => {
    it("should emit events when configured", () => {
      const events: QuadtreeEvent<string>[] = [];
      const eventHandler = (event: QuadtreeEvent<string>) => {
        events.push(event);
      };

      const eventQuadtree = new Quadtree<string>(bounds, {
        maxObjects: 2,
        onEvent: eventHandler,
      });

      eventQuadtree.insert("obj1", { x: 100, y: 100 });
      eventQuadtree.insert("obj2", { x: 200, y: 200 });
      eventQuadtree.insert("obj3", { x: 300, y: 300 }); // Should trigger subdivision

      expect(events.length).toBeGreaterThan(0);
      expect(events.some(e => e.type === "insert")).toBe(true);
      expect(events.some(e => e.type === "subdivide")).toBe(true);
    });

    it("should include event metadata", () => {
      const events: QuadtreeEvent<string>[] = [];
      const eventHandler = (event: QuadtreeEvent<string>) => {
        events.push(event);
      };

      const eventQuadtree = new Quadtree<string>(bounds, {
        onEvent: eventHandler,
      });

      eventQuadtree.insert("obj1", { x: 100, y: 100 });

      expect(events[0].type).toBe("insert");
      expect(events[0].data?.data).toBe("obj1");
      expect(events[0].timestamp).toBeGreaterThan(0);
    });
  });

  describe("Traversal and Analysis", () => {
    it("should traverse all nodes and objects", () => {
      quadtree.insert("obj1", { x: 100, y: 100 });
      quadtree.insert("obj2", { x: 200, y: 200 });
      quadtree.insert("obj3", { x: 300, y: 300 });

      const result = quadtree.traverse();

      expect(result.nodes.length).toBeGreaterThan(0);
      expect(result.objects).toHaveLength(3);
      expect(result.maxDepth).toBeGreaterThanOrEqual(0);
      expect(result.nodesVisited).toBeGreaterThan(0);
    });

    it("should get all objects", () => {
      quadtree.insert("obj1", { x: 100, y: 100 });
      quadtree.insert("obj2", { x: 200, y: 200 });

      const allObjects = quadtree.getAllObjects();

      expect(allObjects).toHaveLength(2);
      expect(allObjects.some(obj => obj.data === "obj1")).toBe(true);
      expect(allObjects.some(obj => obj.data === "obj2")).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle objects at boundaries", () => {
      quadtree.insert("boundary", { x: 0, y: 0 });
      quadtree.insert("corner", { x: 1000, y: 1000 });

      const query1 = quadtree.queryPoint({ point: { x: 0, y: 0 } });
      const query2 = quadtree.queryPoint({ point: { x: 1000, y: 1000 } });

      expect(query1.objects).toHaveLength(1);
      expect(query2.objects).toHaveLength(1);
    });

    it("should handle very small objects", () => {
      quadtree.insert("tiny", { x: 500, y: 500 });

      const query = quadtree.queryPoint({ point: { x: 500, y: 500 } });
      expect(query.objects).toHaveLength(1);
    });

    it("should handle objects with large bounding boxes", () => {
      const largeBounds: Rectangle = { x: 100, y: 100, width: 800, height: 800 };
      quadtree.insert("large", { x: 500, y: 500 }, largeBounds);

      const query = quadtree.queryRect({ bounds: { x: 200, y: 200, width: 100, height: 100 } });
      expect(query.objects).toHaveLength(1);
    });

    it("should handle rapid insertions and removals", () => {
      // Rapid operations
      for (let i = 0; i < 100; i++) {
        quadtree.insert(`obj${i}`, { x: Math.random() * 1000, y: Math.random() * 1000 });
      }

      for (let i = 0; i < 50; i++) {
        quadtree.remove(`obj${i}`, { x: Math.random() * 1000, y: Math.random() * 1000 });
      }

      const stats = quadtree.getStats();
      expect(stats.totalObjects).toBe(50);
    });
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


