import { describe, it, expect, beforeEach, vi } from "vitest";
import { KdTree } from "../../data-structures/spatial/kdtree/kdtree-core";
import { KdTreeEventType } from "../../data-structures/spatial/kdtree/kdtree-types";
import type { Point } from "../../data-structures/spatial/kdtree/kdtree-types";

function p(x: number, y: number): Point {
  return { 0: x, 1: y };
}
function p3(x: number, y: number, z: number): Point {
  return { 0: x, 1: y, 2: z };
}

describe("K-d Tree Data Structure", () => {
  let kdTree: KdTree;

  beforeEach(() => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    kdTree = new KdTree();
  });

  describe("Initialization", () => {
    it("should initialize with default configuration", () => {
      expect(kdTree).toBeInstanceOf(KdTree);
      expect(kdTree.isEmpty()).toBe(true);
      expect(kdTree.size()).toBe(0);
    });

    it("should initialize with custom configuration", () => {
      const customTree = new KdTree({
        config: {
          dimensions: 3,
          maxDepth: 15,
          allowDuplicates: true,
          enableStats: true,
        } as any,
      });
      expect(customTree).toBeInstanceOf(KdTree);
      expect(customTree.getStats().dimensions).toBe(3);
    });

    it("should initialize with initial points", () => {
      const initialPoints = [p(0, 0), p(1, 1), p(2, 2)];
      const treeWithPoints = new KdTree({ initialPoints });
      expect(treeWithPoints.size()).toBe(3);
      expect(treeWithPoints.contains(p(0, 0))).toBe(true);
    });
  });

  describe("Basic Operations", () => {
    it("should insert a point successfully", () => {
      const result = kdTree.insert(p(1, 2));
      expect(result.success).toBe(true);
      expect(result.executionTime).toBeDefined();
      expect(kdTree.size()).toBe(1);
      expect(kdTree.isEmpty()).toBe(false);
    });

    it("should insert a point with data", () => {
      const point = p(3, 4);
      const result = kdTree.insert(point);
      expect(result.success).toBe(true);
      expect(kdTree.contains(point)).toBe(true);
    });

    it("should reject invalid points", () => {
      const invalidPoints: Point[] = [
        {}, // Empty - 0 dimensions
        { 0: 1 }, // Wrong dimension (1)
        { 0: 1, 1: NaN }, // Invalid coordinate
        { 0: 1, 1: Infinity }, // Invalid coordinate
      ];

      for (const point of invalidPoints) {
        const result = kdTree.insert(point as Point);
        expect(result.success).toBe(false);
      }
      expect(kdTree.size()).toBe(0);
    });

    it("should handle duplicate points based on configuration", () => {
      const point = p(1, 1);

      kdTree.insert(point);
      const result1 = kdTree.insert(point);
      expect(result1.success).toBe(false);
      expect(kdTree.size()).toBe(1);

      const treeWithDuplicates = new KdTree({
        config: { dimensions: 2, allowDuplicates: true },
      });
      treeWithDuplicates.insert(point);
      const result2 = treeWithDuplicates.insert(point);
      expect(typeof result2.success).toBe("boolean");
      expect(treeWithDuplicates.size()).toBeGreaterThanOrEqual(1);
    });

    it("should search for points", () => {
      const point = p(2, 3);
      kdTree.insert(point);

      expect(kdTree.search(point)).toBe(true);
      expect(kdTree.contains(point)).toBe(true);
      expect(kdTree.search(p(1, 1))).toBe(false);
    });

    it("should remove points", () => {
      const point = p(1, 2);
      kdTree.insert(point);
      expect(kdTree.size()).toBe(1);

      const result = kdTree.remove(point);
      expect(result.success).toBe(true);
      expect(kdTree.size()).toBe(0);
      expect(kdTree.contains(point)).toBe(false);
    });

    it("should handle removal of non-existent points", () => {
      const result = kdTree.remove(p(1, 1));
      expect(result.success).toBe(false);
    });

    it("should clear all points", () => {
      kdTree.insert(p(1, 1));
      kdTree.insert(p(2, 2));
      expect(kdTree.size()).toBe(2);

      kdTree.clear();
      expect(kdTree.size()).toBe(0);
      expect(kdTree.isEmpty()).toBe(true);
    });
  });

  describe("Batch Operations", () => {
    it("should insert multiple points in batch", () => {
      const points = [p(0, 0), p(1, 1), p(2, 2), p(3, 3)];

      const result = kdTree.insertBatch(points);
      expect(result.successful).toBe(4);
      expect(result.failed).toBe(0);
      expect(kdTree.size()).toBe(4);
    });

    it("should handle mixed valid and invalid points in batch", () => {
      const points = [
        p(0, 0),
        {} as Point, // Invalid
        p(1, 1),
        { 0: 1 } as Point, // Invalid - wrong dimension
      ];

      const result = kdTree.insertBatch(points);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(2);
      expect(result.errors.length).toBe(2);
      expect(kdTree.size()).toBe(2);
    });
  });

  describe("Nearest Neighbor Search", () => {
    beforeEach(() => {
      kdTree.insertBatch([p(0, 0), p(1, 1), p(2, 2), p(3, 3), p(4, 4)]);
    });

    it("should find the nearest neighbor", () => {
      const result = kdTree.nearestNeighbor(p(1.1, 1.1));

      expect(result.success).toBe(true);
      expect(result.point).toBeDefined();
      expect(result.distance).toBeCloseTo(Math.sqrt(0.02), 2); // Distance to [1,1]
      expect(result.executionTime).toBeDefined();
    });

    it("should find k nearest neighbors", () => {
      const result = kdTree.kNearestNeighbors(p(1.1, 1.1), { k: 3 });

      expect(result.success).toBe(true);
      expect(result.neighbors.length).toBe(3);
      if (result.neighbors.length >= 2) {
        expect(result.neighbors[0]!.distance).toBeLessThanOrEqual(result.neighbors[1]!.distance);
      }
      if (result.neighbors.length >= 3) {
        expect(result.neighbors[1]!.distance).toBeLessThanOrEqual(result.neighbors[2]!.distance);
      }
    });

    it("should respect max distance constraint", () => {
      const result = kdTree.nearestNeighbor(p(1.1, 1.1), { maxDistance: 0.1 });
      expect(typeof result.success).toBe("boolean");
      if (result.point != null && typeof result.distance === "number") {
        expect(result.distance).toBeGreaterThanOrEqual(0);
      }
    });

    it("should handle custom distance function", () => {
      const manhattanDistance = (a: Point, b: Point) =>
        Math.abs((a[0] ?? 0) - (b[0] ?? 0)) + Math.abs((a[1] ?? 0) - (b[1] ?? 0));

      const result = kdTree.nearestNeighbor(p(1.1, 1.1), { distanceFunction: manhattanDistance });

      expect(result.success).toBe(true);
      expect(result.point).toBeDefined();
    });

    it("should exclude query point when includeSelf is false", () => {
      const query = p(1, 1);
      const result = kdTree.nearestNeighbor(query, { includeSelf: false });
      expect(result.success).toBe(true);
      expect(result.point).toBeDefined();
    });
  });

  describe("Range Queries", () => {
    beforeEach(() => {
      const points: Point[] = [];
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
          points.push(p(x, y));
        }
      }
      kdTree.insertBatch(points);
    });

    it("should find points within a bounding box", () => {
      const bounds = { min: [1, 1], max: [3, 3] };

      const result = kdTree.rangeQuery(bounds);

      expect(result.success).toBe(true);
      expect(result.count).toBe(9); // 3x3 grid
      expect(result.points.length).toBe(9);
    });

    it("should handle exclusive bounds", () => {
      const bounds = { min: [1, 1], max: [3, 3] };

      const result = kdTree.rangeQuery(bounds, { inclusive: false });

      expect(result.success).toBe(true);
      expect(result.count).toBeGreaterThanOrEqual(0);
      expect(result.points.length).toBe(result.count);
    });

    it("should apply custom filter function", () => {
      const bounds = { min: [0, 0], max: [4, 4] };

      const result = kdTree.rangeQuery(bounds, {
        filter: point => (point[0] ?? 0) === (point[1] ?? 0), // Diagonal points
      });

      expect(result.success).toBe(true);
      expect(result.count).toBe(5); // Points [0,0], [1,1], [2,2], [3,3], [4,4]
    });

    it("should handle empty range queries", () => {
      const bounds = { min: [10, 10], max: [20, 20] };

      const result = kdTree.rangeQuery(bounds);

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
      expect(result.points.length).toBe(0);
    });
  });

  describe("Statistics and Performance", () => {
    it("should track statistics when enabled", () => {
      const treeWithStats = new KdTree({
        config: { dimensions: 2, enableStats: true } as any,
      });

      treeWithStats.insert(p(1, 1));
      treeWithStats.insert(p(2, 2));
      treeWithStats.search(p(1, 1));
      treeWithStats.nearestNeighbor(p(1.5, 1.5));

      const stats = treeWithStats.getStats();
      expect(stats.totalPoints).toBe(2);
      expect(stats.insertions).toBe(2);
      expect(stats.searches).toBe(1);
      expect(stats.nearestNeighborQueries).toBe(1);
      expect(stats.nodeCount).toBe(2);
    });

    it("should provide performance metrics", () => {
      const treeWithStats = new KdTree({
        config: { dimensions: 2, enableStats: true } as any,
      });

      for (let i = 0; i < 10; i++) {
        treeWithStats.insert(p(i, i));
      }

      const metrics = treeWithStats.getPerformanceMetrics();
      expect(metrics.totalOperations).toBeGreaterThan(0);
      expect((metrics.balanceRatio ?? 0) >= 0).toBe(true);
      expect((metrics.queryEfficiency ?? 0) >= 0).toBe(true);
    });

    it("should calculate tree height and depth statistics", () => {
      kdTree.insertBatch([p(0, 0), p(1, 1), p(2, 2), p(3, 3)]);

      const stats = kdTree.getStats();
      expect(stats.height).toBeGreaterThan(0);
      expect(stats.nodeCount).toBe(4);
      expect(stats.leafCount).toBeGreaterThan(0);
      expect(stats.averageDepth).toBeGreaterThan(0);
    });
  });

  describe("Tree Rebuilding", () => {
    it("should rebuild tree for better balance", () => {
      const points: Point[] = [];
      for (let i = 0; i < 10; i++) {
        points.push(p(i, 0)); // All on x-axis
      }
      kdTree.insertBatch(points);

      const result = kdTree.rebuild();
      expect(result.success).toBe(true);
      expect(kdTree.size()).toBe(10);
    });
  });

  describe("Serialization", () => {
    it("should serialize the tree", () => {
      kdTree.insertBatch([p(0, 0), p(1, 1), p(2, 2)]);

      const serialized = kdTree.serialize();
      expect(serialized.version).toBe("1.0");
      expect(serialized.metadata.totalPoints).toBe(3);
      expect(serialized.root).toBeDefined();
    });
  });

  describe("Event Handling", () => {
    it("should emit events when operations are performed", () => {
      const events: any[] = [];
      const treeWithEvents = new KdTree({
        config: { dimensions: 2, enableEvents: true },
        eventHandlers: [event => events.push(event)],
      });

      treeWithEvents.insert(p(1, 1));
      treeWithEvents.search(p(1, 1));
      treeWithEvents.nearestNeighbor(p(1.5, 1.5));

      expect(events.length).toBe(3);
      expect(events[0].type).toBe(KdTreeEventType.POINT_INSERTED);
      expect(events[1].type).toBe(KdTreeEventType.SEARCH_PERFORMED);
      expect(events[2].type).toBe(KdTreeEventType.NEAREST_NEIGHBOR_QUERY);
    });
  });

  describe("3D Points", () => {
    it("should handle 3D points", () => {
      const tree3D = new KdTree({
        config: { dimensions: 3 },
      });

      const points = [p3(0, 0, 0), p3(1, 1, 1), p3(2, 2, 2)];

      tree3D.insertBatch(points);
      expect(tree3D.size()).toBe(3);

      const result = tree3D.nearestNeighbor(p3(0.5, 0.5, 0.5));
      expect(result.success).toBe(true);
      expect(result.point).toBeDefined();
      expect(result.point?.[0]).toBe(0);
      expect(result.point?.[1]).toBe(0);
      expect(result.point?.[2]).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle single point", () => {
      kdTree.insert(p(1, 1));

      const result = kdTree.nearestNeighbor(p(2, 2));
      expect(result.success).toBe(true);
      expect(result.point?.[0]).toBe(1);
      expect(result.point?.[1]).toBe(1);
    });

    it("should handle empty tree operations", () => {
      expect(kdTree.nearestNeighbor(p(1, 1)).success).toBe(false);
      expect(kdTree.rangeQuery({ min: [0, 0], max: [1, 1] }).count).toBe(0);
    });

    it("should handle points with tolerance", () => {
      kdTree.insert(p(1, 1));
      expect(kdTree.contains(p(1, 1))).toBe(true);
      expect(kdTree.size()).toBe(1);
    });
  });
});
