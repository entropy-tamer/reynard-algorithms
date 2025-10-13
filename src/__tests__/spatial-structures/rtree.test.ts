import { describe, it, expect, beforeEach, vi } from "vitest";
import { RTree } from "../../spatial-structures/rtree/rtree-core";
import { RTreeEntry, Rectangle, Point } from "../../spatial-structures/rtree/rtree-types";

describe("RTree Spatial Data Structure", () => {
  let rtree: RTree<string>;

  beforeEach(() => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    rtree = new RTree<string>();
  });

  describe("Initialization", () => {
    it("should initialize with default configuration", () => {
      expect(rtree).toBeInstanceOf(RTree);
      expect(rtree.isEmpty()).toBe(true);
      expect(rtree.size()).toBe(0);
    });

    it("should initialize with custom configuration", () => {
      const customRtree = new RTree<string>({
        minEntries: 3,
        maxEntries: 12,
        reinsertOnOverflow: false,
        useQuadraticSplit: false,
      });
      expect(customRtree).toBeInstanceOf(RTree);
    });
  });

  describe("Insertion", () => {
    it("should insert a single entry", () => {
      const entry: RTreeEntry<string> = {
        id: "obj1",
        bounds: { minX: 0, minY: 0, maxX: 10, maxY: 10 },
        data: "object1",
      };

      const result = rtree.insert(entry);
      expect(result.success).toBe(true);
      expect(rtree.size()).toBe(1);
      expect(rtree.isEmpty()).toBe(false);
    });

    it("should insert multiple entries", () => {
      const entries: RTreeEntry<string>[] = [
        { id: "obj1", bounds: { minX: 0, minY: 0, maxX: 10, maxY: 10 }, data: "object1" },
        { id: "obj2", bounds: { minX: 5, minY: 5, maxX: 15, maxY: 15 }, data: "object2" },
        { id: "obj3", bounds: { minX: 20, minY: 20, maxX: 30, maxY: 30 }, data: "object3" },
      ];

      for (const entry of entries) {
        const result = rtree.insert(entry);
        expect(result.success).toBe(true);
      }

      expect(rtree.size()).toBe(3);
    });

    it("should handle overlapping entries", () => {
      const entries: RTreeEntry<string>[] = [
        { id: "obj1", bounds: { minX: 0, minY: 0, maxX: 10, maxY: 10 }, data: "object1" },
        { id: "obj2", bounds: { minX: 5, minY: 5, maxX: 15, maxY: 15 }, data: "object2" },
        { id: "obj3", bounds: { minX: 8, minY: 8, maxX: 18, maxY: 18 }, data: "object3" },
      ];

      for (const entry of entries) {
        const result = rtree.insert(entry);
        expect(result.success).toBe(true);
      }

      expect(rtree.size()).toBe(3);
    });

    it("should handle entries with zero area", () => {
      const entry: RTreeEntry<string> = {
        id: "point",
        bounds: { minX: 5, minY: 5, maxX: 5, maxY: 5 },
        data: "point",
      };

      const result = rtree.insert(entry);
      expect(result.success).toBe(true);
      expect(rtree.size()).toBe(1);
    });
  });

  describe("Deletion", () => {
    beforeEach(() => {
      // Insert some test data
      rtree.insert({ id: "obj1", bounds: { minX: 0, minY: 0, maxX: 10, maxY: 10 }, data: "object1" });
      rtree.insert({ id: "obj2", bounds: { minX: 5, minY: 5, maxX: 15, maxY: 15 }, data: "object2" });
      rtree.insert({ id: "obj3", bounds: { minX: 20, minY: 20, maxX: 30, maxY: 30 }, data: "object3" });
    });

    it("should delete an existing entry", () => {
      const result = rtree.delete("obj2");
      expect(result.success).toBe(true);
      expect(result.entriesDeleted).toBe(1);
      expect(rtree.size()).toBe(2);
    });

    it("should fail to delete a non-existent entry", () => {
      const result = rtree.delete("nonexistent");
      expect(result.success).toBe(false);
      expect(result.entriesDeleted).toBe(0);
      expect(rtree.size()).toBe(3);
    });

    it("should delete all entries", () => {
      rtree.delete("obj1");
      rtree.delete("obj2");
      rtree.delete("obj3");
      expect(rtree.isEmpty()).toBe(true);
      expect(rtree.size()).toBe(0);
    });
  });

  describe("Querying", () => {
    beforeEach(() => {
      // Insert test data
      rtree.insert({ id: "obj1", bounds: { minX: 0, minY: 0, maxX: 10, maxY: 10 }, data: "object1" });
      rtree.insert({ id: "obj2", bounds: { minX: 5, minY: 5, maxX: 15, maxY: 15 }, data: "object2" });
      rtree.insert({ id: "obj3", bounds: { minX: 20, minY: 20, maxX: 30, maxY: 30 }, data: "object3" });
      rtree.insert({ id: "obj4", bounds: { minX: 12, minY: 12, maxX: 18, maxY: 18 }, data: "object4" });
    });

    it("should find entries that intersect with query bounds", () => {
      const queryBounds: Rectangle = { minX: 2, minY: 2, maxX: 8, maxY: 8 };
      const result = rtree.query(queryBounds);

      expect(result.entries.length).toBe(2); // obj1 and obj2
      expect(result.entries.some(e => e.id === "obj1")).toBe(true);
      expect(result.entries.some(e => e.id === "obj2")).toBe(true);
    });

    it("should find entries that are completely inside query bounds", () => {
      const queryBounds: Rectangle = { minX: -5, minY: -5, maxX: 50, maxY: 50 };
      const result = rtree.query(queryBounds);

      expect(result.entries.length).toBe(4); // All objects
    });

    it("should find no entries for non-intersecting query", () => {
      const queryBounds: Rectangle = { minX: 100, minY: 100, maxX: 200, maxY: 200 };
      const result = rtree.query(queryBounds);

      expect(result.entries.length).toBe(0);
    });

    it("should respect query limit", () => {
      const queryBounds: Rectangle = { minX: -5, minY: -5, maxX: 50, maxY: 50 };
      const result = rtree.query(queryBounds, { limit: 2 });

      expect(result.entries.length).toBe(2);
    });

    it("should include touching entries when specified", () => {
      const queryBounds: Rectangle = { minX: 10, minY: 10, maxX: 20, maxY: 20 };
      const result = rtree.query(queryBounds, { includeTouching: true });

      expect(result.entries.length).toBe(3); // obj2, obj3, obj4
    });

    it("should not include touching entries by default", () => {
      const queryBounds: Rectangle = { minX: 10, minY: 10, maxX: 20, maxY: 20 };
      const result = rtree.query(queryBounds, { includeTouching: false });

      expect(result.entries.length).toBe(1); // Only obj4 (completely inside)
    });
  });

  describe("Nearest Neighbor", () => {
    beforeEach(() => {
      rtree.insert({ id: "obj1", bounds: { minX: 0, minY: 0, maxX: 10, maxY: 10 }, data: "object1" });
      rtree.insert({ id: "obj2", bounds: { minX: 20, minY: 20, maxX: 30, maxY: 30 }, data: "object2" });
      rtree.insert({ id: "obj3", bounds: { minX: 50, minY: 50, maxX: 60, maxY: 60 }, data: "object3" });
    });

    it("should find the nearest entry to a point", () => {
      const point: Point = { x: 5, y: 5 };
      const nearest = rtree.nearest(point);

      expect(nearest).not.toBeNull();
      expect(nearest!.id).toBe("obj1");
    });

    it("should find the nearest entry within max distance", () => {
      const point: Point = { x: 15, y: 15 };
      const nearest = rtree.nearest(point, 20);

      expect(nearest).not.toBeNull();
      expect(nearest!.id).toBe("obj1");
    });

    it("should return null when no entry is within max distance", () => {
      const point: Point = { x: 100, y: 100 };
      const nearest = rtree.nearest(point, 10);

      expect(nearest).toBeNull();
    });

    it("should return null for empty tree", () => {
      const emptyRtree = new RTree<string>();
      const point: Point = { x: 5, y: 5 };
      const nearest = emptyRtree.nearest(point);

      expect(nearest).toBeNull();
    });
  });

  describe("Statistics", () => {
    it("should return correct stats for empty tree", () => {
      const stats = rtree.getStats();
      expect(stats.entryCount).toBe(0);
      expect(stats.nodeCount).toBe(0);
      expect(stats.height).toBe(0);
      expect(stats.averageEntriesPerNode).toBe(0);
      expect(stats.storageUtilization).toBe(0);
    });

    it("should return correct stats for tree with entries", () => {
      rtree.insert({ id: "obj1", bounds: { minX: 0, minY: 0, maxX: 10, maxY: 10 }, data: "object1" });
      rtree.insert({ id: "obj2", bounds: { minX: 5, minY: 5, maxX: 15, maxY: 15 }, data: "object2" });

      const stats = rtree.getStats();
      expect(stats.entryCount).toBe(2);
      expect(stats.nodeCount).toBeGreaterThan(0);
      expect(stats.height).toBeGreaterThan(0);
      expect(stats.averageEntriesPerNode).toBeGreaterThan(0);
      expect(stats.storageUtilization).toBeGreaterThan(0);
    });
  });

  describe("Tree Operations", () => {
    it("should clear all entries", () => {
      rtree.insert({ id: "obj1", bounds: { minX: 0, minY: 0, maxX: 10, maxY: 10 }, data: "object1" });
      rtree.insert({ id: "obj2", bounds: { minX: 5, minY: 5, maxX: 15, maxY: 15 }, data: "object2" });

      expect(rtree.size()).toBe(2);
      rtree.clear();
      expect(rtree.isEmpty()).toBe(true);
      expect(rtree.size()).toBe(0);
    });

    it("should maintain tree structure after multiple operations", () => {
      // Insert entries
      for (let i = 0; i < 20; i++) {
        rtree.insert({
          id: `obj${i}`,
          bounds: { minX: i * 5, minY: i * 5, maxX: (i + 1) * 5, maxY: (i + 1) * 5 },
          data: `object${i}`,
        });
      }

      expect(rtree.size()).toBe(20);

      // Delete some entries
      for (let i = 0; i < 5; i++) {
        rtree.delete(`obj${i}`);
      }

      expect(rtree.size()).toBe(15);

      // Query should still work
      const result = rtree.query({ minX: 0, minY: 0, maxX: 50, maxY: 50 });
      expect(result.entries.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle entries with negative coordinates", () => {
      const entry: RTreeEntry<string> = {
        id: "negative",
        bounds: { minX: -10, minY: -10, maxX: -5, maxY: -5 },
        data: "negative",
      };

      const result = rtree.insert(entry);
      expect(result.success).toBe(true);
      expect(rtree.size()).toBe(1);
    });

    it("should handle very large coordinates", () => {
      const entry: RTreeEntry<string> = {
        id: "large",
        bounds: { minX: 1000000, minY: 1000000, maxX: 1000010, maxY: 1000010 },
        data: "large",
      };

      const result = rtree.insert(entry);
      expect(result.success).toBe(true);
      expect(rtree.size()).toBe(1);
    });

    it("should handle duplicate IDs", () => {
      const entry1: RTreeEntry<string> = {
        id: "duplicate",
        bounds: { minX: 0, minY: 0, maxX: 10, maxY: 10 },
        data: "first",
      };
      const entry2: RTreeEntry<string> = {
        id: "duplicate",
        bounds: { minX: 5, minY: 5, maxX: 15, maxY: 15 },
        data: "second",
      };

      rtree.insert(entry1);
      rtree.insert(entry2);

      // Should have 2 entries (implementation allows duplicates)
      expect(rtree.size()).toBe(2);
    });
  });

  describe("Performance Benchmarks", () => {
    beforeEach(() => {
      // Clear any existing data for clean benchmarks
      rtree.clear();
    });

    const runBenchmark = (description: string, entryCount: number, queryCount: number) => {
      it(`should perform ${description} with ${entryCount} entries and ${queryCount} queries`, () => {
        // Insert entries
        for (let i = 0; i < entryCount; i++) {
          const minX = Math.random() * 1000;
          const minY = Math.random() * 1000;
          const maxX = minX + Math.random() * 100 + 10; // Ensure maxX > minX
          const maxY = minY + Math.random() * 100 + 10; // Ensure maxY > minY
          
          rtree.insert({
            id: `obj${i}`,
            bounds: { minX, minY, maxX, maxY },
            data: `object${i}`,
          });
        }

        expect(rtree.size()).toBe(entryCount);

        // Perform queries
        for (let i = 0; i < queryCount; i++) {
          const minX = Math.random() * 500;
          const minY = Math.random() * 500;
          const maxX = minX + Math.random() * 100 + 10; // Ensure maxX > minX
          const maxY = minY + Math.random() * 100 + 10; // Ensure maxY > minY
          
          const queryBounds: Rectangle = { minX, minY, maxX, maxY };
          const result = rtree.query(queryBounds);
          expect(result.entries.length).toBeGreaterThanOrEqual(0);
        }

        // Test nearest neighbor
        for (let i = 0; i < queryCount; i++) {
          const point: Point = {
            x: Math.random() * 1000,
            y: Math.random() * 1000,
          };
          rtree.nearest(point);
          // nearest might be null, which is valid
        }
      });
    };

    runBenchmark("small scale", 50, 25);
    runBenchmark("medium scale", 200, 50);
    runBenchmark("large scale", 500, 100);
  });

  describe("Configuration Options", () => {
    beforeEach(() => {
      // Clear any existing data for clean configuration tests
      rtree.clear();
    });

    it("should work with different min/max entries configuration", () => {
      const customRtree = new RTree<string>({
        minEntries: 1,
        maxEntries: 4,
      });

      // Insert more entries than max to trigger splits
      for (let i = 0; i < 10; i++) {
        customRtree.insert({
          id: `obj${i}`,
          bounds: { minX: i, minY: i, maxX: i + 1, maxY: i + 1 },
          data: `object${i}`,
        });
      }

      expect(customRtree.size()).toBe(10);
      const stats = customRtree.getStats();
      expect(stats.nodeCount).toBeGreaterThan(1); // Should have multiple nodes due to splits
    });

    it("should work with linear split algorithm", () => {
      const linearRtree = new RTree<string>({
        useQuadraticSplit: false,
      });

      for (let i = 0; i < 20; i++) {
        linearRtree.insert({
          id: `obj${i}`,
          bounds: { minX: i, minY: i, maxX: i + 1, maxY: i + 1 },
          data: `object${i}`,
        });
      }

      expect(linearRtree.size()).toBe(20);
    });
  });
});
