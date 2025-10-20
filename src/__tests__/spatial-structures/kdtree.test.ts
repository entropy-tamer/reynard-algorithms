import { describe, it, expect, beforeEach, vi } from "vitest";
import { KdTree } from "../../spatial-structures/kdtree/kdtree-core";
import { KdTreeEventType } from "../../spatial-structures/kdtree/kdtree-types";

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
        },
      });
      expect(customTree).toBeInstanceOf(KdTree);
      expect(customTree.getStats().dimensions).toBe(3);
    });

    it("should initialize with initial points", () => {
      const initialPoints = [
        { coordinates: [0, 0], data: "origin" },
        { coordinates: [1, 1], data: "corner" },
        { coordinates: [2, 2], data: "diagonal" },
      ];
      const treeWithPoints = new KdTree({ initialPoints });
      expect(treeWithPoints.size()).toBe(3);
      expect(treeWithPoints.contains({ coordinates: [0, 0] })).toBe(true);
    });
  });

  describe("Basic Operations", () => {
    it("should insert a point successfully", () => {
      const result = kdTree.insert({ coordinates: [1, 2] });
      expect(result.success).toBe(true);
      expect(result.executionTime).toBeDefined();
      expect(kdTree.size()).toBe(1);
      expect(kdTree.isEmpty()).toBe(false);
    });

    it("should insert a point with data", () => {
      const point = { coordinates: [3, 4], data: "test", id: "p1" };
      const result = kdTree.insert(point);
      expect(result.success).toBe(true);
      expect(kdTree.contains(point)).toBe(true);
    });

    it("should reject invalid points", () => {
      const invalidPoints = [
        { coordinates: [] }, // Empty coordinates
        { coordinates: [1] }, // Wrong dimension
        { coordinates: [1, NaN] }, // Invalid coordinate
        { coordinates: [1, Infinity] }, // Invalid coordinate
        null as any,
        undefined as any,
      ];

      for (const point of invalidPoints) {
        const result = kdTree.insert(point);
        expect(result.success).toBe(false);
      }
      expect(kdTree.size()).toBe(0);
    });

    it("should handle duplicate points based on configuration", () => {
      const point = { coordinates: [1, 1] };

      // Default: duplicates not allowed
      kdTree.insert(point);
      const result1 = kdTree.insert(point);
      expect(result1.success).toBe(false);
      expect(kdTree.size()).toBe(1);

      // Allow duplicates
      const treeWithDuplicates = new KdTree({
        config: { allowDuplicates: true },
      });
      treeWithDuplicates.insert(point);
      const result2 = treeWithDuplicates.insert(point);
      expect(result2.success).toBe(true);
      expect(treeWithDuplicates.size()).toBe(2);
    });

    it("should search for points", () => {
      const point = { coordinates: [2, 3] };
      kdTree.insert(point);

      expect(kdTree.search(point)).toBe(true);
      expect(kdTree.contains(point)).toBe(true);
      expect(kdTree.search({ coordinates: [1, 1] })).toBe(false);
    });

    it("should remove points", () => {
      const point = { coordinates: [1, 2] };
      kdTree.insert(point);
      expect(kdTree.size()).toBe(1);

      const result = kdTree.remove(point);
      expect(result.success).toBe(true);
      expect(kdTree.size()).toBe(0);
      expect(kdTree.contains(point)).toBe(false);
    });

    it("should handle removal of non-existent points", () => {
      const result = kdTree.remove({ coordinates: [1, 1] });
      expect(result.success).toBe(false);
    });

    it("should clear all points", () => {
      kdTree.insert({ coordinates: [1, 1] });
      kdTree.insert({ coordinates: [2, 2] });
      expect(kdTree.size()).toBe(2);

      kdTree.clear();
      expect(kdTree.size()).toBe(0);
      expect(kdTree.isEmpty()).toBe(true);
    });
  });

  describe("Batch Operations", () => {
    it("should insert multiple points in batch", () => {
      const points = [
        { coordinates: [0, 0] },
        { coordinates: [1, 1] },
        { coordinates: [2, 2] },
        { coordinates: [3, 3] },
      ];

      const result = kdTree.insertBatch(points);
      expect(result.successful).toBe(4);
      expect(result.failed).toBe(0);
      expect(kdTree.size()).toBe(4);
    });

    it("should handle mixed valid and invalid points in batch", () => {
      const points = [
        { coordinates: [0, 0] },
        { coordinates: [] }, // Invalid
        { coordinates: [1, 1] },
        { coordinates: [1] }, // Invalid
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
      // Insert test points
      const points = [
        { coordinates: [0, 0] },
        { coordinates: [1, 1] },
        { coordinates: [2, 2] },
        { coordinates: [3, 3] },
        { coordinates: [4, 4] },
      ];
      kdTree.insertBatch(points);
    });

    it("should find the nearest neighbor", () => {
      const query = { coordinates: [1.1, 1.1] };
      const result = kdTree.nearestNeighbor(query);

      expect(result.success).toBe(true);
      expect(result.point).toBeDefined();
      expect(result.distance).toBeCloseTo(Math.sqrt(0.02), 2); // Distance to [1,1]
      expect(result.executionTime).toBeDefined();
    });

    it("should find k nearest neighbors", () => {
      const query = { coordinates: [1.1, 1.1] };
      const result = kdTree.kNearestNeighbors(query, { k: 3 });

      expect(result.success).toBe(true);
      expect(result.points.length).toBe(3);
      expect(result.points[0].distance).toBeLessThanOrEqual(result.points[1].distance);
      expect(result.points[1].distance).toBeLessThanOrEqual(result.points[2].distance);
    });

    it("should respect max distance constraint", () => {
      const query = { coordinates: [1.1, 1.1] };
      const result = kdTree.nearestNeighbor(query, { maxDistance: 0.1 });

      expect(result.success).toBe(false);
      expect(result.point).toBeNull();
    });

    it("should handle custom distance function", () => {
      const query = { coordinates: [1.1, 1.1] };
      const manhattanDistance = (p1: any, p2: any) =>
        Math.abs(p1.coordinates[0] - p2.coordinates[0]) + Math.abs(p1.coordinates[1] - p2.coordinates[1]);

      const result = kdTree.nearestNeighbor(query, { distanceFunction: manhattanDistance });

      expect(result.success).toBe(true);
      expect(result.point).toBeDefined();
    });

    it("should exclude query point when includeSelf is false", () => {
      const query = { coordinates: [1, 1] };
      const result = kdTree.nearestNeighbor(query, { includeSelf: false });

      expect(result.success).toBe(true);
      expect(result.point).not.toEqual(query);
    });
  });

  describe("Range Queries", () => {
    beforeEach(() => {
      // Insert test points in a grid
      const points: Array<{ coordinates: [number, number] }> = [];
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
          points.push({ coordinates: [x, y] });
        }
      }
      kdTree.insertBatch(points);
    });

    it("should find points within a bounding box", () => {
      const bounds = {
        min: [1, 1],
        max: [3, 3],
      };

      const result = kdTree.rangeQuery(bounds);

      expect(result.success).toBe(true);
      expect(result.count).toBe(9); // 3x3 grid
      expect(result.points.length).toBe(9);
    });

    it("should handle exclusive bounds", () => {
      const bounds = {
        min: [1, 1],
        max: [3, 3],
      };

      const result = kdTree.rangeQuery(bounds, { inclusive: false });

      expect(result.success).toBe(true);
      expect(result.count).toBe(4); // 2x2 grid (excluding boundaries)
    });

    it("should apply custom filter function", () => {
      const bounds = {
        min: [0, 0],
        max: [4, 4],
      };

      const result = kdTree.rangeQuery(bounds, {
        filter: point => point.coordinates[0] === point.coordinates[1], // Diagonal points
      });

      expect(result.success).toBe(true);
      expect(result.count).toBe(5); // Points [0,0], [1,1], [2,2], [3,3], [4,4]
    });

    it("should handle empty range queries", () => {
      const bounds = {
        min: [10, 10],
        max: [20, 20],
      };

      const result = kdTree.rangeQuery(bounds);

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
      expect(result.points.length).toBe(0);
    });
  });

  describe("Statistics and Performance", () => {
    it("should track statistics when enabled", () => {
      const treeWithStats = new KdTree({
        config: { enableStats: true },
      });

      treeWithStats.insert({ coordinates: [1, 1] });
      treeWithStats.insert({ coordinates: [2, 2] });
      treeWithStats.search({ coordinates: [1, 1] });
      treeWithStats.nearestNeighbor({ coordinates: [1.5, 1.5] });

      const stats = treeWithStats.getStats();
      expect(stats.totalPoints).toBe(2);
      expect(stats.insertions).toBe(2);
      expect(stats.searches).toBe(1);
      expect(stats.nearestNeighborQueries).toBe(1);
      expect(stats.nodeCount).toBe(2);
    });

    it("should provide performance metrics", () => {
      const treeWithStats = new KdTree({
        config: { enableStats: true },
      });

      // Insert some points and perform operations
      for (let i = 0; i < 10; i++) {
        treeWithStats.insert({ coordinates: [i, i] });
      }

      const metrics = treeWithStats.getPerformanceMetrics();
      expect(metrics.memoryUsage).toBeGreaterThan(0);
      expect(metrics.performanceScore).toBeGreaterThanOrEqual(0);
      expect(metrics.balanceRatio).toBeGreaterThanOrEqual(0);
      expect(metrics.queryEfficiency).toBeGreaterThanOrEqual(0);
    });

    it("should calculate tree height and depth statistics", () => {
      const points = [
        { coordinates: [0, 0] },
        { coordinates: [1, 1] },
        { coordinates: [2, 2] },
        { coordinates: [3, 3] },
      ];
      kdTree.insertBatch(points);

      const stats = kdTree.getStats();
      expect(stats.height).toBeGreaterThan(0);
      expect(stats.nodeCount).toBe(4);
      expect(stats.leafCount).toBeGreaterThan(0);
      expect(stats.averageDepth).toBeGreaterThan(0);
    });
  });

  describe("Tree Rebuilding", () => {
    it("should rebuild tree for better balance", () => {
      // Insert points in a way that creates an unbalanced tree
      const points: Array<{ coordinates: [number, number] }> = [];
      for (let i = 0; i < 10; i++) {
        points.push({ coordinates: [i, 0] }); // All on x-axis
      }
      kdTree.insertBatch(points);

      const result = kdTree.rebuild();
      expect(result.success).toBe(true);
      expect(kdTree.size()).toBe(10);

      // Verify all points are still accessible
      for (const point of points) {
        expect(kdTree.contains(point)).toBe(true);
      }
    });
  });

  describe("Serialization", () => {
    it("should serialize and deserialize the tree", () => {
      const points = [
        { coordinates: [0, 0], data: "origin" },
        { coordinates: [1, 1], data: "corner" },
        { coordinates: [2, 2], data: "diagonal" },
      ];
      kdTree.insertBatch(points);

      const serialized = kdTree.serialize();
      expect(serialized.version).toBe("1.0.0");
      expect(serialized.data.points.length).toBe(3);
      expect(serialized.metadata.totalPoints).toBe(3);

      const deserialized = KdTree.deserialize(serialized);
      expect(deserialized.size()).toBe(3);
      expect(deserialized.contains({ coordinates: [0, 0] })).toBe(true);
    });
  });

  describe("Event Handling", () => {
    it("should emit events when operations are performed", () => {
      const events: any[] = [];
      const treeWithEvents = new KdTree({
        eventHandlers: [event => events.push(event)],
      });

      treeWithEvents.insert({ coordinates: [1, 1] });
      treeWithEvents.search({ coordinates: [1, 1] });
      treeWithEvents.nearestNeighbor({ coordinates: [1.5, 1.5] });

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

      const points = [{ coordinates: [0, 0, 0] }, { coordinates: [1, 1, 1] }, { coordinates: [2, 2, 2] }];

      tree3D.insertBatch(points);
      expect(tree3D.size()).toBe(3);

      const result = tree3D.nearestNeighbor({ coordinates: [0.5, 0.5, 0.5] });
      expect(result.success).toBe(true);
      expect(result.point?.coordinates).toEqual([0, 0, 0]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle single point", () => {
      kdTree.insert({ coordinates: [1, 1] });

      const result = kdTree.nearestNeighbor({ coordinates: [2, 2] });
      expect(result.success).toBe(true);
      expect(result.point?.coordinates).toEqual([1, 1]);
    });

    it("should handle empty tree operations", () => {
      expect(kdTree.nearestNeighbor({ coordinates: [1, 1] }).success).toBe(false);
      expect(kdTree.rangeQuery({ min: [0, 0], max: [1, 1] }).count).toBe(0);
    });

    it("should handle points with tolerance", () => {
      kdTree.insert({ coordinates: [1.0, 1.0] });

      // Point very close to existing point
      const closePoint = { coordinates: [1.0000000001, 1.0000000001] };
      expect(kdTree.contains(closePoint)).toBe(true);
    });
  });
});
