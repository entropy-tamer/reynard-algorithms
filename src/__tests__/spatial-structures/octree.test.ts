import { describe, it, expect, beforeEach, vi } from "vitest";
import { Octree } from "../../spatial-structures/octree/octree-core";
import { OctreeEventType } from "../../spatial-structures/octree/octree-types";

describe("Octree Data Structure", () => {
  let octree: Octree;
  const bounds = {
    min: { x: 0, y: 0, z: 0 },
    max: { x: 100, y: 100, z: 100 },
    center: { x: 50, y: 50, z: 50 },
    size: { x: 100, y: 100, z: 100 },
  };

  beforeEach(() => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    octree = new Octree(bounds);
  });

  describe("Initialization", () => {
    it("should initialize with default configuration", () => {
      expect(octree).toBeInstanceOf(Octree);
      expect(octree.isEmpty()).toBe(true);
      expect(octree.size()).toBe(0);
    });

    it("should initialize with custom configuration", () => {
      const customOctree = new Octree(bounds, {
        config: {
          maxPoints: 5,
          maxDepth: 6,
          enableLOD: true,
          enableStats: true,
        },
      });
      expect(customOctree).toBeInstanceOf(Octree);
      expect(customOctree.getStats().nodeCount).toBe(1);
    });

    it("should initialize with initial points", () => {
      const initialPoints = [
        { x: 10, y: 10, z: 10, data: "origin" },
        { x: 90, y: 90, z: 90, data: "corner" },
        { x: 50, y: 50, z: 50, data: "center" },
      ];
      const octreeWithPoints = new Octree(bounds, { initialPoints });
      expect(octreeWithPoints.size()).toBe(3);
    });
  });

  describe("Basic Operations", () => {
    it("should insert a point successfully", () => {
      const point = { x: 25, y: 25, z: 25 };
      const result = octree.insert(point);
      
      expect(result.success).toBe(true);
      expect(result.executionTime).toBeDefined();
      expect(octree.size()).toBe(1);
      expect(octree.isEmpty()).toBe(false);
    });

    it("should insert a point with data", () => {
      const point = { x: 30, y: 30, z: 30, data: "test", id: "p1" };
      const result = octree.insert(point);
      
      expect(result.success).toBe(true);
      expect(octree.size()).toBe(1);
    });

    it("should reject invalid points", () => {
      const invalidPoints = [
        { x: NaN, y: 0, z: 0 },
        { x: 0, y: Infinity, z: 0 },
        { x: 0, y: 0, z: -Infinity },
        null as any,
        undefined as any,
        { x: 0, y: 0 }, // Missing z
        { x: 0, y: 0, z: 0, w: 0 }, // Extra dimension
      ];

      for (const point of invalidPoints) {
        const result = octree.insert(point);
        expect(result.success).toBe(false);
      }
      expect(octree.size()).toBe(0);
    });

    it("should reject points outside bounds", () => {
      const outOfBoundsPoints = [
        { x: -1, y: 0, z: 0 },
        { x: 101, y: 0, z: 0 },
        { x: 0, y: -1, z: 0 },
        { x: 0, y: 101, z: 0 },
        { x: 0, y: 0, z: -1 },
        { x: 0, y: 0, z: 101 },
      ];

      for (const point of outOfBoundsPoints) {
        const result = octree.insert(point);
        expect(result.success).toBe(false);
      }
      expect(octree.size()).toBe(0);
    });

    it("should remove points", () => {
      const point = { x: 25, y: 25, z: 25 };
      octree.insert(point);
      expect(octree.size()).toBe(1);

      const result = octree.remove(point);
      expect(result.success).toBe(true);
      expect(octree.size()).toBe(0);
    });

    it("should handle removal of non-existent points", () => {
      const result = octree.remove({ x: 1, y: 1, z: 1 });
      expect(result.success).toBe(false);
    });

    it("should clear all points", () => {
      octree.insert({ x: 10, y: 10, z: 10 });
      octree.insert({ x: 20, y: 20, z: 20 });
      expect(octree.size()).toBe(2);

      octree.clear();
      expect(octree.size()).toBe(0);
      expect(octree.isEmpty()).toBe(true);
    });
  });

  describe("Batch Operations", () => {
    it("should insert multiple points in batch", () => {
      const points = [
        { x: 10, y: 10, z: 10 },
        { x: 20, y: 20, z: 20 },
        { x: 30, y: 30, z: 30 },
        { x: 40, y: 40, z: 40 },
      ];

      const result = octree.insertBatch(points);
      expect(result.successful).toBe(4);
      expect(result.failed).toBe(0);
      expect(octree.size()).toBe(4);
    });

    it("should handle mixed valid and invalid points in batch", () => {
      const points = [
        { x: 10, y: 10, z: 10 },
        { x: NaN, y: 20, z: 20 }, // Invalid
        { x: 30, y: 30, z: 30 },
        { x: 150, y: 40, z: 40 }, // Out of bounds
      ];

      const result = octree.insertBatch(points);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(2);
      expect(result.errors.length).toBe(2);
      expect(octree.size()).toBe(2);
    });
  });

  describe("Spatial Queries", () => {
    beforeEach(() => {
      // Insert test points in a 3D grid
      const points: Array<{ x: number; y: number; z: number }> = [];
      for (let x = 10; x <= 90; x += 20) {
        for (let y = 10; y <= 90; y += 20) {
          for (let z = 10; z <= 90; z += 20) {
            points.push({ x, y, z });
          }
        }
      }
      octree.insertBatch(points);
    });

    it("should query points within bounds", () => {
      const queryBounds = {
        min: { x: 20, y: 20, z: 20 },
        max: { x: 40, y: 40, z: 40 },
        center: { x: 30, y: 30, z: 30 },
        size: { x: 20, y: 20, z: 20 },
      };

      const result = octree.queryBounds(queryBounds);
      
      expect(result.success).toBe(true);
      expect(result.count).toBe(8); // 2x2x2 grid
      expect(result.points.length).toBe(8);
    });

    it("should query points within sphere", () => {
      const sphere = {
        center: { x: 30, y: 30, z: 30 },
        radius: 15,
      };

      const result = octree.querySphere(sphere);
      
      expect(result.success).toBe(true);
      expect(result.count).toBeGreaterThan(0);
      expect(result.points.length).toBe(result.count);
    });

    it("should handle empty query results", () => {
      const queryBounds = {
        min: { x: 200, y: 200, z: 200 },
        max: { x: 300, y: 300, z: 300 },
        center: { x: 250, y: 250, z: 250 },
        size: { x: 100, y: 100, z: 100 },
      };

      const result = octree.queryBounds(queryBounds);
      
      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
      expect(result.points.length).toBe(0);
    });

    it("should apply custom filter function", () => {
      const queryBounds = {
        min: { x: 0, y: 0, z: 0 },
        max: { x: 100, y: 100, z: 100 },
        center: { x: 50, y: 50, z: 50 },
        size: { x: 100, y: 100, z: 100 },
      };

      const result = octree.queryBounds(queryBounds, {
        filter: (point) => point.x === point.y && point.y === point.z, // Diagonal points
      });
      
      expect(result.success).toBe(true);
      expect(result.count).toBe(5); // Points [10,10,10], [30,30,30], [50,50,50], [70,70,70], [90,90,90]
    });

    it("should respect max results limit", () => {
      const queryBounds = {
        min: { x: 0, y: 0, z: 0 },
        max: { x: 100, y: 100, z: 100 },
        center: { x: 50, y: 50, z: 50 },
        size: { x: 100, y: 100, z: 100 },
      };

      const result = octree.queryBounds(queryBounds, {
        maxResults: 3,
      });
      
      expect(result.success).toBe(true);
      expect(result.count).toBeLessThanOrEqual(3);
    });
  });

  describe("Ray Intersection", () => {
    beforeEach(() => {
      // Insert test points
      const points = [
        { x: 10, y: 10, z: 10 },
        { x: 20, y: 20, z: 20 },
        { x: 30, y: 30, z: 30 },
        { x: 40, y: 40, z: 40 },
      ];
      octree.insertBatch(points);
    });

    it("should find ray intersections", () => {
      const ray = {
        origin: { x: 0, y: 0, z: 0 },
        direction: { x: 1, y: 1, z: 1 }, // Diagonal ray
        maxDistance: 100,
      };

      const result = octree.rayIntersection(ray);
      
      expect(result.success).toBe(true);
      expect(result.count).toBeGreaterThan(0);
      expect(result.points.length).toBe(result.count);
      expect(result.distances.length).toBe(result.count);
    });

    it("should find all intersections when requested", () => {
      const ray = {
        origin: { x: 0, y: 0, z: 0 },
        direction: { x: 1, y: 1, z: 1 },
        maxDistance: 100,
      };

      const result = octree.rayIntersection(ray, { findAll: true });
      
      expect(result.success).toBe(true);
      expect(result.count).toBeGreaterThan(0);
    });

    it("should respect max distance", () => {
      const ray = {
        origin: { x: 0, y: 0, z: 0 },
        direction: { x: 1, y: 1, z: 1 },
        maxDistance: 15, // Should only hit first point
      };

      const result = octree.rayIntersection(ray);
      
      expect(result.success).toBe(true);
      expect(result.count).toBeLessThanOrEqual(1);
    });

    it("should handle rays with no intersections", () => {
      const ray = {
        origin: { x: 0, y: 0, z: 0 },
        direction: { x: 0, y: 0, z: 1 }, // Vertical ray
        maxDistance: 100,
      };

      const result = octree.rayIntersection(ray);
      
      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
    });
  });

  describe("Frustum Culling", () => {
    beforeEach(() => {
      // Insert test points
      const points: Array<{ x: number; y: number; z: number }> = [];
      for (let x = 10; x <= 90; x += 10) {
        for (let y = 10; y <= 90; y += 10) {
          for (let z = 10; z <= 90; z += 10) {
            points.push({ x, y, z });
          }
        }
      }
      octree.insertBatch(points);
    });

    it("should perform frustum culling", () => {
      const frustum = {
        planes: [
          { normal: { x: 1, y: 0, z: 0 }, distance: -20 }, // x >= 20
          { normal: { x: -1, y: 0, z: 0 }, distance: -80 }, // x <= 80
          { normal: { x: 0, y: 1, z: 0 }, distance: -20 }, // y >= 20
          { normal: { x: 0, y: -1, z: 0 }, distance: -80 }, // y <= 80
          { normal: { x: 0, y: 0, z: 1 }, distance: -20 }, // z >= 20
          { normal: { x: 0, y: 0, z: -1 }, distance: -80 }, // z <= 80
        ],
      };

      const result = octree.frustumCulling(frustum);
      
      expect(result.success).toBe(true);
      expect(result.visibleCount).toBeGreaterThan(0);
      expect(result.culledCount).toBeGreaterThan(0);
      expect(result.visibleCount + result.culledCount).toBe(octree.size());
    });

    it("should handle frustum with no visible points", () => {
      const frustum = {
        planes: [
          { normal: { x: 1, y: 0, z: 0 }, distance: -200 }, // x >= 200
          { normal: { x: -1, y: 0, z: 0 }, distance: -300 }, // x <= 300
          { normal: { x: 0, y: 1, z: 0 }, distance: -200 }, // y >= 200
          { normal: { x: 0, y: -1, z: 0 }, distance: -300 }, // y <= 300
          { normal: { x: 0, y: 0, z: 1 }, distance: -200 }, // z >= 200
          { normal: { x: 0, y: 0, z: -1 }, distance: -300 }, // z <= 300
        ],
      };

      const result = octree.frustumCulling(frustum);
      
      expect(result.success).toBe(true);
      expect(result.visibleCount).toBe(0);
      expect(result.culledCount).toBe(octree.size());
    });
  });

  describe("Voxel Operations", () => {
    beforeEach(() => {
      // Insert test points
      const points = [
        { x: 10, y: 10, z: 10 },
        { x: 20, y: 20, z: 20 },
        { x: 30, y: 30, z: 30 },
        { x: 40, y: 40, z: 40 },
      ];
      octree.insertBatch(points);
    });

    it("should create voxel grid", () => {
      const voxelSize = 20;
      const voxelGrid = octree.createVoxelGrid(voxelSize);
      
      expect(voxelGrid.voxelSize).toBe(voxelSize);
      expect(voxelGrid.dimensions.x).toBeGreaterThan(0);
      expect(voxelGrid.dimensions.y).toBeGreaterThan(0);
      expect(voxelGrid.dimensions.z).toBeGreaterThan(0);
      expect(voxelGrid.voxels.length).toBe(voxelGrid.dimensions.x);
    });

    it("should have correct voxel data", () => {
      const voxelSize = 20;
      const voxelGrid = octree.createVoxelGrid(voxelSize);
      
      let occupiedVoxels = 0;
      for (let x = 0; x < voxelGrid.dimensions.x; x++) {
        for (let y = 0; y < voxelGrid.dimensions.y; y++) {
          for (let z = 0; z < voxelGrid.dimensions.z; z++) {
            if (voxelGrid.voxels[x][y][z].occupied) {
              occupiedVoxels++;
            }
          }
        }
      }
      
      expect(occupiedVoxels).toBeGreaterThan(0);
    });
  });

  describe("Statistics and Performance", () => {
    it("should track statistics when enabled", () => {
      const octreeWithStats = new Octree(bounds, {
        config: { enableStats: true },
      });
      
      octreeWithStats.insert({ x: 10, y: 10, z: 10 });
      octreeWithStats.insert({ x: 20, y: 20, z: 20 });
      octreeWithStats.queryBounds(bounds);
      octreeWithStats.rayIntersection({
        origin: { x: 0, y: 0, z: 0 },
        direction: { x: 1, y: 1, z: 1 },
      });
      
      const stats = octreeWithStats.getStats();
      expect(stats.totalPoints).toBe(2);
      expect(stats.insertions).toBe(2);
      expect(stats.spatialQueries).toBe(1);
      expect(stats.rayIntersections).toBe(1);
      expect(stats.nodeCount).toBeGreaterThan(0);
    });

    it("should provide performance metrics", () => {
      const octreeWithStats = new Octree(bounds, {
        config: { enableStats: true },
      });
      
      // Insert some points and perform operations
      for (let i = 0; i < 10; i++) {
        octreeWithStats.insert({ x: i * 10, y: i * 10, z: i * 10 });
      }
      
      const metrics = octreeWithStats.getPerformanceMetrics();
      expect(metrics.memoryUsage).toBeGreaterThan(0);
      expect(metrics.performanceScore).toBeGreaterThanOrEqual(0);
      expect(metrics.balanceRatio).toBeGreaterThanOrEqual(0);
      expect(metrics.queryEfficiency).toBeGreaterThanOrEqual(0);
      expect(metrics.lodEfficiency).toBeGreaterThanOrEqual(0);
    });

    it("should calculate tree height and depth statistics", () => {
      const points: Array<{ x: number; y: number; z: number }> = [];
      for (let i = 0; i < 20; i++) {
        points.push({ x: i * 5, y: i * 5, z: i * 5 });
      }
      octree.insertBatch(points);
      
      const stats = octree.getStats();
      expect(stats.height).toBeGreaterThan(0);
      expect(stats.nodeCount).toBeGreaterThan(0);
      expect(stats.leafCount).toBeGreaterThan(0);
      expect(stats.averageDepth).toBeGreaterThan(0);
    });
  });

  describe("Serialization", () => {
    it("should serialize and deserialize the tree", () => {
      const points = [
        { x: 10, y: 10, z: 10, data: "origin" },
        { x: 20, y: 20, z: 20, data: "corner" },
        { x: 30, y: 30, z: 30, data: "center" },
      ];
      octree.insertBatch(points);
      
      const serialized = octree.serialize();
      expect(serialized.version).toBe("1.0.0");
      expect(serialized.data.points.length).toBe(3);
      expect(serialized.metadata.totalPoints).toBe(3);
      
      const deserialized = Octree.deserialize(serialized, bounds);
      expect(deserialized.size()).toBe(3);
    });
  });

  describe("Event Handling", () => {
    it("should emit events when operations are performed", () => {
      const events: any[] = [];
      const octreeWithEvents = new Octree(bounds, {
        eventHandlers: [(event) => events.push(event)],
      });
      
      octreeWithEvents.insert({ x: 10, y: 10, z: 10 });
      octreeWithEvents.queryBounds(bounds);
      octreeWithEvents.rayIntersection({
        origin: { x: 0, y: 0, z: 0 },
        direction: { x: 1, y: 1, z: 1 },
      });
      
      expect(events.length).toBe(3);
      expect(events[0].type).toBe(OctreeEventType.POINT_INSERTED);
      expect(events[1].type).toBe(OctreeEventType.SPATIAL_QUERY);
      expect(events[2].type).toBe(OctreeEventType.RAY_INTERSECTION);
    });
  });

  describe("Node Subdivision", () => {
    it("should subdivide nodes when max points exceeded", () => {
      const octreeWithSmallMax = new Octree(bounds, {
        config: { maxPoints: 2 },
      });
      
      octreeWithSmallMax.insert({ x: 10, y: 10, z: 10 });
      octreeWithSmallMax.insert({ x: 20, y: 20, z: 20 });
      octreeWithSmallMax.insert({ x: 30, y: 30, z: 30 }); // Should trigger subdivision
      
      const stats = octreeWithSmallMax.getStats();
      expect(stats.nodeCount).toBeGreaterThan(1); // Should have subdivided
    });

    it("should respect max depth limit", () => {
      const octreeWithSmallDepth = new Octree(bounds, {
        config: { maxDepth: 2 },
      });
      
      // Insert many points to force subdivision
      const points: Array<{ x: number; y: number; z: number }> = [];
      for (let i = 0; i < 50; i++) {
        points.push({ x: Math.random() * 100, y: Math.random() * 100, z: Math.random() * 100 });
      }
      octreeWithSmallDepth.insertBatch(points);
      
      const stats = octreeWithSmallDepth.getStats();
      expect(stats.maxDepth).toBeLessThanOrEqual(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle single point", () => {
      octree.insert({ x: 50, y: 50, z: 50 });
      
      const result = octree.queryBounds(bounds);
      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
    });

    it("should handle empty tree operations", () => {
      expect(octree.queryBounds(bounds).count).toBe(0);
      expect(octree.querySphere({ center: { x: 50, y: 50, z: 50 }, radius: 10 }).count).toBe(0);
      expect(octree.rayIntersection({
        origin: { x: 0, y: 0, z: 0 },
        direction: { x: 1, y: 1, z: 1 },
      }).count).toBe(0);
    });

    it("should handle points at bounds boundaries", () => {
      const boundaryPoints = [
        { x: 0, y: 0, z: 0 }, // Min boundary
        { x: 100, y: 100, z: 100 }, // Max boundary
      ];
      
      const result = octree.insertBatch(boundaryPoints);
      expect(result.successful).toBe(2);
      expect(octree.size()).toBe(2);
    });
  });
});
