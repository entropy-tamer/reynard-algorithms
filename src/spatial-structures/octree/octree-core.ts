/**
 * Octree Data Structure Core Implementation
 *
 * Implementation of the Octree data structure with comprehensive
 * features including 3D spatial partitioning, voxel operations,
 * ray casting, and frustum culling.
 *
 * Mathematical Theory:
 * An Octree is a tree data structure in which each internal node
 * has exactly eight children. It's used to partition a 3D space
 * by recursively subdividing it into eight octants.
 *
 * Key formulas:
 * - 8 octants per subdivision: (+x,+y,+z), (+x,+y,-z), etc.
 * - Query: O(log n + k) for k results
 * - Frustum culling optimization
 * - Morton codes for spatial ordering
 *
 * Where:
 * - n = number of points
 * - k = number of results in query
 *
 * @module algorithms/spatial-structures/octree
 */

import type {
  Point3D,
  Bounds3D,
  Sphere3D,
  Ray3D,
  Frustum3D,
  OctreeNode,
  Octant,
  OctreeConfig,
  OctreeStats,
  OctreeResult,
  SpatialQueryResult,
  RayIntersectionResult,
  FrustumCullingResult,
  SpatialQueryOptions,
  RayIntersectionOptions,
  FrustumCullingOptions,
  OctreeOptions,
  OctreeEvent,
  OctreeEventHandler,
  OctreePerformanceMetrics,
  BatchOperationResult,
  Voxel,
  VoxelGrid,
  OctreeSerialization,
} from "./octree-types";
import { OctreeEventType } from "./octree-types";
import { DEFAULT_OCTREE_CONFIG, DEFAULT_OCTREE_OPTIONS } from "./octree-types";

/**
 * Octree Data Structure Implementation
 *
 * Provides efficient 3D spatial partitioning and querying with
 * voxel operations, ray casting, and frustum culling.
 */
export class Octree {
  private root: OctreeNode | null;
  private config: Required<OctreeConfig>;
  private eventHandlers: OctreeEventHandler[];
  private enableDebug: boolean;
  private stats: OctreeStats;

  /**
   *
   * @param bounds
   * @param options
   * @example
   */
  constructor(bounds: Bounds3D, options: Partial<OctreeOptions> = {}) {
    const opts = { ...DEFAULT_OCTREE_OPTIONS, ...options };

    this.config = { ...DEFAULT_OCTREE_CONFIG, ...(opts.config || {}) } as Required<OctreeConfig>;
    this.eventHandlers = opts.eventHandlers || [];
    this.enableDebug = false;

    // Initialize root node
    this.root = this.createNode(bounds, 0, null);

    this.stats = {
      totalPoints: 0,
      nodeCount: 1,
      leafCount: 1,
      height: 0,
      averageDepth: 0,
      maxDepth: 0,
      memoryUsage: 0,
      insertions: 0,
      removals: 0,
      spatialQueries: 0,
      rayIntersections: 0,
      frustumCulling: 0,
      averageQueryTime: 0,
      averageInsertionTime: 0,
      averageRemovalTime: 0,
    };

    // Insert initial points if provided
    if (opts.initialPoints && opts.initialPoints.length > 0) {
      this.insertBatch(opts.initialPoints);
    }
  }

  /**
   * Insert a point into the Octree.
   * @param point
   * @example
   */
  insert(point: Point3D): OctreeResult {
    const startTime = performance.now();
    let nodesVisited = 0;

    try {
      // Validate point
      if (!this.isValidPoint(point)) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Invalid point" },
        };
      }

      // Check if point is within bounds
      if (!this.pointInBounds(point, this.root!.bounds)) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Point outside tree bounds" },
        };
      }

      nodesVisited = this.insertRecursive(this.root!, point, 0);
      this.stats.insertions++;
      this.stats.totalPoints++;
      this.updateStats();

      const executionTime = performance.now() - startTime;
      this.stats.averageInsertionTime =
        (this.stats.averageInsertionTime * (this.stats.insertions - 1) + executionTime) / this.stats.insertions;

      this.emitEvent(OctreeEventType.POINT_INSERTED, { point, executionTime });

      return {
        success: true,
        executionTime,
        nodesVisited,
        metadata: { point },
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesVisited,
        metadata: { error: error instanceof Error ? error.message : "Unknown error" },
      };
    }
  }

  /**
   * Insert multiple points in batch.
   * @param points
   * @example
   */
  insertBatch(points: Point3D[]): BatchOperationResult {
    const startTime = performance.now();
    const results: OctreeResult[] = [];
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const point of points) {
      const result = this.insert(point);
      results.push(result);

      if (result.success) {
        successful++;
      } else {
        failed++;
        errors.push(result.metadata?.error || "Unknown error");
      }
    }

    return {
      successful,
      failed,
      errors,
      executionTime: performance.now() - startTime,
      results,
    };
  }

  /**
   * Remove a point from the Octree.
   * @param point
   * @example
   */
  remove(point: Point3D): OctreeResult {
    const startTime = performance.now();
    let nodesVisited = 0;

    try {
      if (!this.isValidPoint(point)) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Invalid point" },
        };
      }

      const removed = this.removeRecursive(this.root!, point, 0);
      if (removed) {
        this.stats.removals++;
        this.stats.totalPoints--;
        this.updateStats();
        nodesVisited = this.stats.nodeCount;

        this.emitEvent(OctreeEventType.POINT_REMOVED, { point });

        return {
          success: true,
          executionTime: performance.now() - startTime,
          nodesVisited,
          metadata: { point },
        };
      } else {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Point not found" },
        };
      }
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesVisited,
        metadata: { error: error instanceof Error ? error.message : "Unknown error" },
      };
    }
  }

  /**
   * Query points within a bounding box.
   * @param bounds
   * @param options
   * @example
   */
  queryBounds(bounds: Bounds3D, options: SpatialQueryOptions = {}): SpatialQueryResult {
    const startTime = performance.now();
    this.stats.spatialQueries++;

    const points: Point3D[] = [];
    let nodesVisited = 0;

    if (this.root) {
      nodesVisited = this.queryBoundsRecursive(this.root, bounds, points, options, 0);
    }

    const executionTime = performance.now() - startTime;
    this.stats.averageQueryTime =
      (this.stats.averageQueryTime * (this.stats.spatialQueries - 1) + executionTime) / this.stats.spatialQueries;

    this.emitEvent(OctreeEventType.SPATIAL_QUERY, {
      bounds,
      results: points,
      executionTime,
    });

    return {
      points,
      count: points.length,
      executionTime,
      nodesVisited,
      success: true,
    };
  }

  /**
   * Query points within a sphere.
   * @param sphere
   * @param options
   * @example
   */
  querySphere(sphere: Sphere3D, options: SpatialQueryOptions = {}): SpatialQueryResult {
    const startTime = performance.now();
    this.stats.spatialQueries++;

    const points: Point3D[] = [];
    let nodesVisited = 0;

    if (this.root) {
      nodesVisited = this.querySphereRecursive(this.root, sphere, points, options, 0);
    }

    const executionTime = performance.now() - startTime;
    this.stats.averageQueryTime =
      (this.stats.averageQueryTime * (this.stats.spatialQueries - 1) + executionTime) / this.stats.spatialQueries;

    this.emitEvent(OctreeEventType.SPATIAL_QUERY, {
      sphere,
      results: points,
      executionTime,
    });

    return {
      points,
      count: points.length,
      executionTime,
      nodesVisited,
      success: true,
    };
  }

  /**
   * Perform ray intersection query.
   * @param ray
   * @param options
   * @example
   */
  rayIntersection(ray: Ray3D, options: RayIntersectionOptions = {}): RayIntersectionResult {
    const startTime = performance.now();
    this.stats.rayIntersections++;

    const points: Point3D[] = [];
    const distances: number[] = [];
    let nodesVisited = 0;

    if (this.root) {
      nodesVisited = this.rayIntersectionRecursive(this.root, ray, points, distances, options, 0);
    }

    const executionTime = performance.now() - startTime;

    this.emitEvent(OctreeEventType.RAY_INTERSECTION, {
      ray,
      results: points,
      executionTime,
    });

    return {
      points,
      distances,
      count: points.length,
      executionTime,
      nodesVisited,
      success: true,
    };
  }

  /**
   * Perform frustum culling.
   * @param frustum
   * @param options
   * @example
   */
  frustumCulling(frustum: Frustum3D, options: FrustumCullingOptions = {}): FrustumCullingResult {
    const startTime = performance.now();
    this.stats.frustumCulling++;

    const visiblePoints: Point3D[] = [];
    let culledCount = 0;
    let nodesVisited = 0;

    if (this.root) {
      const result = this.frustumCullingRecursive(this.root, frustum, visiblePoints, options, 0);
      nodesVisited = result.nodesVisited;
      culledCount = result.culledCount;
    }

    const executionTime = performance.now() - startTime;

    this.emitEvent(OctreeEventType.FRUSTUM_CULLING, {
      frustum,
      visibleCount: visiblePoints.length,
      culledCount,
      executionTime,
    });

    return {
      visiblePoints,
      visibleCount: visiblePoints.length,
      culledCount,
      executionTime,
      nodesVisited,
      success: true,
    };
  }

  /**
   * Get the size of the tree.
   * @example
   */
  size(): number {
    return this.stats.totalPoints;
  }

  /**
   * Check if the tree is empty.
   * @example
   */
  isEmpty(): boolean {
    return this.root === null || this.stats.totalPoints === 0;
  }

  /**
   * Clear all points from the tree.
   * @example
   */
  clear(): void {
    if (this.root) {
      this.clearRecursive(this.root);
      this.root.points = [];
      this.root.children.fill(null);
    }
    this.stats.totalPoints = 0;
    this.updateStats();
  }

  /**
   * Get statistics about the tree.
   * @example
   */
  getStats(): OctreeStats {
    return { ...this.stats };
  }

  /**
   * Get performance metrics.
   * @example
   */
  getPerformanceMetrics(): OctreePerformanceMetrics {
    return {
      memoryUsage: this.stats.memoryUsage,
      averageQueryTime: this.stats.averageQueryTime,
      averageInsertionTime: this.stats.averageInsertionTime,
      averageRemovalTime: this.stats.averageRemovalTime,
      performanceScore: this.calculatePerformanceScore(),
      balanceRatio: this.calculateBalanceRatio(),
      queryEfficiency: this.calculateQueryEfficiency(),
      lodEfficiency: this.calculateLODEfficiency(),
    };
  }

  /**
   * Create a voxel grid from the tree.
   * @param voxelSize
   * @example
   */
  createVoxelGrid(voxelSize: number): VoxelGrid {
    if (!this.root) {
      throw new Error("Cannot create voxel grid from empty tree");
    }

    const bounds = this.root.bounds;
    const dimensions = {
      x: Math.ceil((bounds.max.x - bounds.min.x) / voxelSize),
      y: Math.ceil((bounds.max.y - bounds.min.y) / voxelSize),
      z: Math.ceil((bounds.max.z - bounds.min.z) / voxelSize),
    };

    const voxels: Voxel[][][] = [];
    for (let x = 0; x < dimensions.x; x++) {
      voxels[x] = [];
      for (let y = 0; y < dimensions.y; y++) {
        voxels[x][y] = [];
        for (let z = 0; z < dimensions.z; z++) {
          const position = {
            x: bounds.min.x + x * voxelSize + voxelSize / 2,
            y: bounds.min.y + y * voxelSize + voxelSize / 2,
            z: bounds.min.z + z * voxelSize + voxelSize / 2,
          };

          const voxelBounds: Bounds3D = {
            min: {
              x: bounds.min.x + x * voxelSize,
              y: bounds.min.y + y * voxelSize,
              z: bounds.min.z + z * voxelSize,
            },
            max: {
              x: bounds.min.x + (x + 1) * voxelSize,
              y: bounds.min.y + (y + 1) * voxelSize,
              z: bounds.min.z + (z + 1) * voxelSize,
            },
            center: position,
            size: { x: voxelSize, y: voxelSize, z: voxelSize },
          };

          const pointsInVoxel = this.queryBounds(voxelBounds).points;

          voxels[x][y][z] = {
            position,
            size: voxelSize,
            data: pointsInVoxel,
            occupied: pointsInVoxel.length > 0,
          };
        }
      }
    }

    return {
      bounds,
      voxelSize,
      dimensions,
      voxels,
    };
  }

  /**
   * Serialize the tree to JSON.
   * @example
   */
  serialize(): OctreeSerialization {
    return {
      version: "1.0.0",
      config: this.config,
      data: {
        points: this.getAllPoints(),
        structure: this.serializeTreeStructure(),
      },
      metadata: {
        totalPoints: this.stats.totalPoints,
        height: this.stats.height,
        nodeCount: this.stats.nodeCount,
        createdAt: Date.now(),
      },
    };
  }

  /**
   * Deserialize a tree from JSON.
   * @param data
   * @param bounds
   * @example
   */
  static deserialize(data: OctreeSerialization, bounds: Bounds3D): Octree {
    const tree = new Octree(bounds, { config: data.config });
    if (data.data.points.length > 0) {
      tree.insertBatch(data.data.points);
    }
    return tree;
  }

  // Private helper methods

  /**
   *
   * @param bounds
   * @param depth
   * @param parent
   * @example
   */
  private createNode(bounds: Bounds3D, depth: number, parent: OctreeNode | null): OctreeNode {
    return {
      bounds,
      points: [],
      children: new Array(8).fill(null),
      parent,
      depth,
      isLeaf: true,
      lod: 0,
    };
  }

  /**
   *
   * @param node
   * @param point
   * @param depth
   * @example
   */
  private insertRecursive(node: OctreeNode, point: Point3D, depth: number): number {
    let nodesVisited = 1;

    // If this is a leaf node and we can add the point
    if (node.isLeaf && node.points.length < this.config.maxPoints) {
      node.points.push(point);
      return nodesVisited;
    }

    // If we've reached max depth, just add to this node
    if (depth >= this.config.maxDepth) {
      node.points.push(point);
      return nodesVisited;
    }

    // If this is a leaf node and we need to subdivide
    if (node.isLeaf && this.config.autoSubdivide) {
      this.subdivideNode(node);
      this.emitEvent(OctreeEventType.NODE_SUBDIVIDED, { node, depth });
    }

    // If we have children, insert into appropriate child
    if (!node.isLeaf) {
      const octant = this.getOctant(point, node.bounds);
      if (node.children[octant]) {
        nodesVisited += this.insertRecursive(node.children[octant]!, point, depth + 1);
      }
    } else {
      // If we can't subdivide, just add to this node
      node.points.push(point);
    }

    return nodesVisited;
  }

  /**
   *
   * @param node
   * @param point
   * @param depth
   * @example
   */
  private removeRecursive(node: OctreeNode, point: Point3D, depth: number): boolean {
    // Check if point is in this node
    const pointIndex = node.points.findIndex(p => this.pointsEqual(p, point));
    if (pointIndex !== -1) {
      node.points.splice(pointIndex, 1);

      // If this is a leaf with no points and we can merge, do so
      if (node.isLeaf && node.points.length === 0 && this.config.autoMerge) {
        this.mergeNode(node);
        this.emitEvent(OctreeEventType.NODE_MERGED, { node, depth });
      }

      return true;
    }

    // If not a leaf, search children
    if (!node.isLeaf) {
      const octant = this.getOctant(point, node.bounds);
      if (node.children[octant]) {
        return this.removeRecursive(node.children[octant]!, point, depth + 1);
      }
    }

    return false;
  }

  /**
   *
   * @param node
   * @example
   */
  private subdivideNode(node: OctreeNode): void {
    if (!node.isLeaf) {
      return;
    }

    const bounds = node.bounds;
    const center = bounds.center;
    const halfSize = {
      x: bounds.size.x / 2,
      y: bounds.size.y / 2,
      z: bounds.size.z / 2,
    };

    // Create child bounds for each octant
    const childBounds: Bounds3D[] = [
      // Top Left Front
      {
        min: { x: center.x, y: center.y, z: center.z },
        max: { x: bounds.max.x, y: bounds.max.y, z: bounds.max.z },
        center: { x: center.x + halfSize.x / 2, y: center.y + halfSize.y / 2, z: center.z + halfSize.z / 2 },
        size: halfSize,
      },
      // Top Right Front
      {
        min: { x: bounds.min.x, y: center.y, z: center.z },
        max: { x: center.x, y: bounds.max.y, z: bounds.max.z },
        center: { x: center.x - halfSize.x / 2, y: center.y + halfSize.y / 2, z: center.z + halfSize.z / 2 },
        size: halfSize,
      },
      // Top Left Back
      {
        min: { x: center.x, y: center.y, z: bounds.min.z },
        max: { x: bounds.max.x, y: bounds.max.y, z: center.z },
        center: { x: center.x + halfSize.x / 2, y: center.y + halfSize.y / 2, z: center.z - halfSize.z / 2 },
        size: halfSize,
      },
      // Top Right Back
      {
        min: { x: bounds.min.x, y: center.y, z: bounds.min.z },
        max: { x: center.x, y: bounds.max.y, z: center.z },
        center: { x: center.x - halfSize.x / 2, y: center.y + halfSize.y / 2, z: center.z - halfSize.z / 2 },
        size: halfSize,
      },
      // Bottom Left Front
      {
        min: { x: center.x, y: bounds.min.y, z: center.z },
        max: { x: bounds.max.x, y: center.y, z: bounds.max.z },
        center: { x: center.x + halfSize.x / 2, y: center.y - halfSize.y / 2, z: center.z + halfSize.z / 2 },
        size: halfSize,
      },
      // Bottom Right Front
      {
        min: { x: bounds.min.x, y: bounds.min.y, z: center.z },
        max: { x: center.x, y: center.y, z: bounds.max.z },
        center: { x: center.x - halfSize.x / 2, y: center.y - halfSize.y / 2, z: center.z + halfSize.z / 2 },
        size: halfSize,
      },
      // Bottom Left Back
      {
        min: { x: center.x, y: bounds.min.y, z: bounds.min.z },
        max: { x: bounds.max.x, y: center.y, z: center.z },
        center: { x: center.x + halfSize.x / 2, y: center.y - halfSize.y / 2, z: center.z - halfSize.z / 2 },
        size: halfSize,
      },
      // Bottom Right Back
      {
        min: { x: bounds.min.x, y: bounds.min.y, z: bounds.min.z },
        max: { x: center.x, y: center.y, z: center.z },
        center: { x: center.x - halfSize.x / 2, y: center.y - halfSize.y / 2, z: center.z - halfSize.z / 2 },
        size: halfSize,
      },
    ];

    // Create child nodes
    for (let i = 0; i < 8; i++) {
      node.children[i] = this.createNode(childBounds[i], node.depth + 1, node);
    }

    node.isLeaf = false;

    // Redistribute existing points to children
    const pointsToRedistribute = [...node.points];
    node.points = [];

    for (const point of pointsToRedistribute) {
      const octant = this.getOctant(point, node.bounds);
      if (node.children[octant]) {
        this.insertRecursive(node.children[octant]!, point, node.depth + 1);
      }
    }
  }

  /**
   *
   * @param node
   * @example
   */
  private mergeNode(node: OctreeNode): void {
    if (node.isLeaf || !node.parent) {
      return;
    }

    // Check if all children are empty
    let allChildrenEmpty = true;
    for (const child of node.children) {
      if (child && (child.points.length > 0 || !child.isLeaf)) {
        allChildrenEmpty = false;
        break;
      }
    }

    if (allChildrenEmpty) {
      node.children.fill(null);
      node.isLeaf = true;
    }
  }

  /**
   *
   * @param point
   * @param bounds
   * @example
   */
  private getOctant(point: Point3D, bounds: Bounds3D): Octant {
    const center = bounds.center;
    let octant = 0;

    if (point.x >= center.x) octant |= 0;
    if (point.y >= center.y) octant |= 1;
    if (point.z >= center.z) octant |= 2;

    return octant as Octant;
  }

  /**
   *
   * @param node
   * @param bounds
   * @param points
   * @param options
   * @param nodesVisited
   * @example
   */
  private queryBoundsRecursive(
    node: OctreeNode,
    bounds: Bounds3D,
    points: Point3D[],
    options: SpatialQueryOptions,
    nodesVisited: number
  ): number {
    nodesVisited++;

    // Check if node bounds intersect with query bounds
    if (!this.boundsIntersect(node.bounds, bounds)) {
      return nodesVisited;
    }

    // Add points from this node that are within bounds
    for (const point of node.points) {
      if (this.pointInBounds(point, bounds, options.inclusive)) {
        if (!options.filter || options.filter(point)) {
          points.push(point);
          if (options.maxResults && points.length >= options.maxResults) {
            return nodesVisited;
          }
        }
      }
    }

    // Query children
    if (!node.isLeaf) {
      for (const child of node.children) {
        if (child) {
          nodesVisited = this.queryBoundsRecursive(child, bounds, points, options, nodesVisited);
          if (options.maxResults && points.length >= options.maxResults) {
            break;
          }
        }
      }
    }

    return nodesVisited;
  }

  /**
   *
   * @param node
   * @param sphere
   * @param points
   * @param options
   * @param nodesVisited
   * @example
   */
  private querySphereRecursive(
    node: OctreeNode,
    sphere: Sphere3D,
    points: Point3D[],
    options: SpatialQueryOptions,
    nodesVisited: number
  ): number {
    nodesVisited++;

    // Check if node bounds intersect with sphere
    if (!this.boundsIntersectSphere(node.bounds, sphere)) {
      return nodesVisited;
    }

    // Add points from this node that are within sphere
    for (const point of node.points) {
      if (this.pointInSphere(point, sphere)) {
        if (!options.filter || options.filter(point)) {
          points.push(point);
          if (options.maxResults && points.length >= options.maxResults) {
            return nodesVisited;
          }
        }
      }
    }

    // Query children
    if (!node.isLeaf) {
      for (const child of node.children) {
        if (child) {
          nodesVisited = this.querySphereRecursive(child, sphere, points, options, nodesVisited);
          if (options.maxResults && points.length >= options.maxResults) {
            break;
          }
        }
      }
    }

    return nodesVisited;
  }

  /**
   *
   * @param node
   * @param ray
   * @param points
   * @param distances
   * @param options
   * @param nodesVisited
   * @example
   */
  private rayIntersectionRecursive(
    node: OctreeNode,
    ray: Ray3D,
    points: Point3D[],
    distances: number[],
    options: RayIntersectionOptions,
    nodesVisited: number
  ): number {
    nodesVisited++;

    // Check if ray intersects node bounds
    if (!this.rayIntersectsBounds(ray, node.bounds)) {
      return nodesVisited;
    }

    // Check points in this node
    for (const point of node.points) {
      const distance = this.rayPointDistance(ray, point);
      if (distance !== null && (ray.maxDistance === undefined || distance <= ray.maxDistance)) {
        if (!options.filter || options.filter(point)) {
          points.push(point);
          distances.push(distance);

          if (!options.findAll) {
            return nodesVisited;
          }

          if (options.maxIntersections && points.length >= options.maxIntersections) {
            return nodesVisited;
          }
        }
      }
    }

    // Check children
    if (!node.isLeaf) {
      for (const child of node.children) {
        if (child) {
          nodesVisited = this.rayIntersectionRecursive(child, ray, points, distances, options, nodesVisited);
          if (!options.findAll && points.length > 0) {
            return nodesVisited;
          }
        }
      }
    }

    return nodesVisited;
  }

  /**
   *
   * @param node
   * @param frustum
   * @param visiblePoints
   * @param options
   * @param nodesVisited
   * @example
   */
  private frustumCullingRecursive(
    node: OctreeNode,
    frustum: Frustum3D,
    visiblePoints: Point3D[],
    options: FrustumCullingOptions,
    nodesVisited: number
  ): { nodesVisited: number; culledCount: number } {
    nodesVisited++;
    let culledCount = 0;

    // Check if node is inside, outside, or intersecting frustum
    const frustumTest = this.boundsFrustumTest(node.bounds, frustum);

    if (frustumTest === "outside") {
      culledCount += node.points.length;
      return { nodesVisited, culledCount };
    }

    // Add visible points from this node
    for (const point of node.points) {
      if (frustumTest === "inside" || this.pointInFrustum(point, frustum)) {
        if (!options.filter || options.filter(point)) {
          visiblePoints.push(point);
        }
      } else {
        culledCount++;
      }
    }

    // Check children
    if (!node.isLeaf) {
      for (const child of node.children) {
        if (child) {
          const result = this.frustumCullingRecursive(child, frustum, visiblePoints, options, nodesVisited);
          nodesVisited = result.nodesVisited;
          culledCount += result.culledCount;
        }
      }
    }

    return { nodesVisited, culledCount };
  }

  /**
   *
   * @param node
   * @example
   */
  private clearRecursive(node: OctreeNode): void {
    node.points = [];
    if (!node.isLeaf) {
      for (const child of node.children) {
        if (child) {
          this.clearRecursive(child);
        }
      }
      node.children.fill(null);
      node.isLeaf = true;
    }
  }

  /**
   *
   * @param point
   * @example
   */
  private isValidPoint(point: Point3D): boolean {
    if (!point || typeof point.x !== "number" || typeof point.y !== "number" || typeof point.z !== "number") {
      return false;
    }
    return isFinite(point.x) && isFinite(point.y) && isFinite(point.z);
  }

  /**
   *
   * @param p1
   * @param p2
   * @example
   */
  private pointsEqual(p1: Point3D, p2: Point3D): boolean {
    return p1.x === p2.x && p1.y === p2.y && p1.z === p2.z;
  }

  /**
   *
   * @param point
   * @param bounds
   * @param inclusive
   * @example
   */
  private pointInBounds(point: Point3D, bounds: Bounds3D, inclusive: boolean = true): boolean {
    if (inclusive) {
      return (
        point.x >= bounds.min.x &&
        point.x <= bounds.max.x &&
        point.y >= bounds.min.y &&
        point.y <= bounds.max.y &&
        point.z >= bounds.min.z &&
        point.z <= bounds.max.z
      );
    } else {
      return (
        point.x > bounds.min.x &&
        point.x < bounds.max.x &&
        point.y > bounds.min.y &&
        point.y < bounds.max.y &&
        point.z > bounds.min.z &&
        point.z < bounds.max.z
      );
    }
  }

  /**
   *
   * @param bounds1
   * @param bounds2
   * @example
   */
  private boundsIntersect(bounds1: Bounds3D, bounds2: Bounds3D): boolean {
    return (
      bounds1.min.x <= bounds2.max.x &&
      bounds1.max.x >= bounds2.min.x &&
      bounds1.min.y <= bounds2.max.y &&
      bounds1.max.y >= bounds2.min.y &&
      bounds1.min.z <= bounds2.max.z &&
      bounds1.max.z >= bounds2.min.z
    );
  }

  /**
   *
   * @param bounds
   * @param sphere
   * @example
   */
  private boundsIntersectSphere(bounds: Bounds3D, sphere: Sphere3D): boolean {
    const closestPoint = {
      x: Math.max(bounds.min.x, Math.min(sphere.center.x, bounds.max.x)),
      y: Math.max(bounds.min.y, Math.min(sphere.center.y, bounds.max.y)),
      z: Math.max(bounds.min.z, Math.min(sphere.center.z, bounds.max.z)),
    };

    const distance = Math.sqrt(
      Math.pow(closestPoint.x - sphere.center.x, 2) +
        Math.pow(closestPoint.y - sphere.center.y, 2) +
        Math.pow(closestPoint.z - sphere.center.z, 2)
    );

    return distance <= sphere.radius;
  }

  /**
   *
   * @param point
   * @param sphere
   * @example
   */
  private pointInSphere(point: Point3D, sphere: Sphere3D): boolean {
    const distance = Math.sqrt(
      Math.pow(point.x - sphere.center.x, 2) +
        Math.pow(point.y - sphere.center.y, 2) +
        Math.pow(point.z - sphere.center.z, 2)
    );
    return distance <= sphere.radius;
  }

  /**
   *
   * @param ray
   * @param bounds
   * @example
   */
  private rayIntersectsBounds(ray: Ray3D, bounds: Bounds3D): boolean {
    // Simplified ray-AABB intersection test
    const tMin = (bounds.min.x - ray.origin.x) / ray.direction.x;
    const tMax = (bounds.max.x - ray.origin.x) / ray.direction.x;
    const t1 = Math.min(tMin, tMax);
    const t2 = Math.max(tMin, tMax);

    const tMinY = (bounds.min.y - ray.origin.y) / ray.direction.y;
    const tMaxY = (bounds.max.y - ray.origin.y) / ray.direction.y;
    const t3 = Math.min(tMinY, tMaxY);
    const t4 = Math.max(tMinY, tMaxY);

    const tMinZ = (bounds.min.z - ray.origin.z) / ray.direction.z;
    const tMaxZ = (bounds.max.z - ray.origin.z) / ray.direction.z;
    const t5 = Math.min(tMinZ, tMaxZ);
    const t6 = Math.max(tMinZ, tMaxZ);

    const tNear = Math.max(t1, t3, t5);
    const tFar = Math.min(t2, t4, t6);

    return tNear <= tFar && tFar >= 0;
  }

  /**
   *
   * @param ray
   * @param point
   * @example
   */
  private rayPointDistance(ray: Ray3D, point: Point3D): number | null {
    // Calculate distance from point to ray
    const toPoint = {
      x: point.x - ray.origin.x,
      y: point.y - ray.origin.y,
      z: point.z - ray.origin.z,
    };

    const projection = toPoint.x * ray.direction.x + toPoint.y * ray.direction.y + toPoint.z * ray.direction.z;

    if (projection < 0) {
      return null; // Point is behind ray origin
    }

    const projectedPoint = {
      x: ray.origin.x + projection * ray.direction.x,
      y: ray.origin.y + projection * ray.direction.y,
      z: ray.origin.z + projection * ray.direction.z,
    };

    const distance = Math.sqrt(
      Math.pow(point.x - projectedPoint.x, 2) +
        Math.pow(point.y - projectedPoint.y, 2) +
        Math.pow(point.z - projectedPoint.z, 2)
    );

    return distance;
  }

  /**
   *
   * @param bounds
   * @param frustum
   * @example
   */
  private boundsFrustumTest(bounds: Bounds3D, frustum: Frustum3D): "inside" | "outside" | "intersect" {
    let inside = true;

    for (const plane of frustum.planes) {
      const normal = plane.normal;
      const distance = plane.distance;

      // Test all 8 corners of the bounding box
      const corners = [
        { x: bounds.min.x, y: bounds.min.y, z: bounds.min.z },
        { x: bounds.max.x, y: bounds.min.y, z: bounds.min.z },
        { x: bounds.min.x, y: bounds.max.y, z: bounds.min.z },
        { x: bounds.max.x, y: bounds.max.y, z: bounds.min.z },
        { x: bounds.min.x, y: bounds.min.y, z: bounds.max.z },
        { x: bounds.max.x, y: bounds.min.y, z: bounds.max.z },
        { x: bounds.min.x, y: bounds.max.y, z: bounds.max.z },
        { x: bounds.max.x, y: bounds.max.y, z: bounds.max.z },
      ];

      let pointsInside = 0;
      let pointsOutside = 0;

      for (const corner of corners) {
        const dot = corner.x * normal.x + corner.y * normal.y + corner.z * normal.z;
        if (dot + distance > 0) {
          pointsInside++;
        } else {
          pointsOutside++;
        }
      }

      if (pointsOutside === 8) {
        return "outside";
      }
      if (pointsInside < 8) {
        inside = false;
      }
    }

    return inside ? "inside" : "intersect";
  }

  /**
   *
   * @param point
   * @param frustum
   * @example
   */
  private pointInFrustum(point: Point3D, frustum: Frustum3D): boolean {
    for (const plane of frustum.planes) {
      const normal = plane.normal;
      const distance = plane.distance;
      const dot = point.x * normal.x + point.y * normal.y + point.z * normal.z;
      if (dot + distance <= 0) {
        return false;
      }
    }
    return true;
  }

  /**
   *
   * @example
   */
  private getAllPoints(): Point3D[] {
    const points: Point3D[] = [];
    if (this.root) {
      this.collectPoints(this.root, points);
    }
    return points;
  }

  /**
   *
   * @param node
   * @param points
   * @example
   */
  private collectPoints(node: OctreeNode, points: Point3D[]): void {
    points.push(...node.points);
    if (!node.isLeaf) {
      for (const child of node.children) {
        if (child) {
          this.collectPoints(child, points);
        }
      }
    }
  }

  /**
   *
   * @example
   */
  private updateStats(): void {
    if (this.root) {
      this.stats.nodeCount = this.countNodes(this.root);
      this.stats.leafCount = this.countLeaves(this.root);
      this.stats.height = this.calculateHeight(this.root);
      this.stats.averageDepth = this.calculateAverageDepth(this.root);
      this.stats.maxDepth = this.calculateMaxDepth(this.root);
      this.stats.memoryUsage = this.estimateMemoryUsage();
    }
  }

  /**
   *
   * @param node
   * @example
   */
  private countNodes(node: OctreeNode): number {
    let count = 1;
    if (!node.isLeaf) {
      for (const child of node.children) {
        if (child) {
          count += this.countNodes(child);
        }
      }
    }
    return count;
  }

  /**
   *
   * @param node
   * @example
   */
  private countLeaves(node: OctreeNode): number {
    if (node.isLeaf) {
      return 1;
    }
    let count = 0;
    for (const child of node.children) {
      if (child) {
        count += this.countLeaves(child);
      }
    }
    return count;
  }

  /**
   *
   * @param node
   * @example
   */
  private calculateHeight(node: OctreeNode): number {
    if (node.isLeaf) {
      return 1;
    }
    let maxChildHeight = 0;
    for (const child of node.children) {
      if (child) {
        maxChildHeight = Math.max(maxChildHeight, this.calculateHeight(child));
      }
    }
    return 1 + maxChildHeight;
  }

  /**
   *
   * @param node
   * @example
   */
  private calculateAverageDepth(node: OctreeNode): number {
    const depths: number[] = [];
    this.collectDepths(node, 0, depths);
    return depths.reduce((sum, depth) => sum + depth, 0) / depths.length;
  }

  /**
   *
   * @param node
   * @param depth
   * @param depths
   * @example
   */
  private collectDepths(node: OctreeNode, depth: number, depths: number[]): void {
    if (node.isLeaf) {
      depths.push(depth);
    } else {
      for (const child of node.children) {
        if (child) {
          this.collectDepths(child, depth + 1, depths);
        }
      }
    }
  }

  /**
   *
   * @param node
   * @example
   */
  private calculateMaxDepth(node: OctreeNode): number {
    if (node.isLeaf) {
      return node.depth;
    }
    let maxDepth = node.depth;
    for (const child of node.children) {
      if (child) {
        maxDepth = Math.max(maxDepth, this.calculateMaxDepth(child));
      }
    }
    return maxDepth;
  }

  /**
   *
   * @example
   */
  private estimateMemoryUsage(): number {
    // Rough estimate: each node + point data
    const nodeSize = 128; // Approximate size of an OctreeNode
    const pointSize = 24; // 8 bytes per coordinate * 3
    return this.stats.nodeCount * nodeSize + this.stats.totalPoints * pointSize;
  }

  /**
   *
   * @example
   */
  private calculatePerformanceScore(): number {
    const maxTime = 100; // 100ms as maximum
    const queryScore = Math.max(0, 100 - (this.stats.averageQueryTime / maxTime) * 100);
    const insertScore = Math.max(0, 100 - (this.stats.averageInsertionTime / maxTime) * 100);
    const removeScore = Math.max(0, 100 - (this.stats.averageRemovalTime / maxTime) * 100);

    return (queryScore + insertScore + removeScore) / 3;
  }

  /**
   *
   * @example
   */
  private calculateBalanceRatio(): number {
    if (this.stats.nodeCount === 0) {
      return 1;
    }
    const idealHeight = Math.ceil(Math.log2(this.stats.nodeCount + 1));
    return Math.max(0, 1 - (this.stats.height - idealHeight) / idealHeight);
  }

  /**
   *
   * @example
   */
  private calculateQueryEfficiency(): number {
    if (this.stats.spatialQueries === 0) {
      return 1;
    }
    const idealVisits = Math.log2(this.stats.nodeCount + 1);
    const actualVisits = this.stats.averageQueryTime; // Rough proxy
    return Math.max(0, 1 - (actualVisits - idealVisits) / idealVisits);
  }

  /**
   *
   * @example
   */
  private calculateLODEfficiency(): number {
    if (!this.config.enableLOD) {
      return 1;
    }
    // Simple LOD efficiency calculation
    return Math.min(1, this.stats.totalPoints / (this.stats.nodeCount * this.config.maxPoints));
  }

  /**
   *
   * @example
   */
  private serializeTreeStructure(): any {
    return this.serializeNode(this.root);
  }

  /**
   *
   * @param node
   * @example
   */
  private serializeNode(node: OctreeNode | null): any {
    if (node === null) {
      return null;
    }
    return {
      bounds: node.bounds,
      points: node.points,
      depth: node.depth,
      isLeaf: node.isLeaf,
      lod: node.lod,
      children: node.children.map(child => this.serializeNode(child)),
    };
  }

  /**
   *
   * @param type
   * @param data
   * @example
   */
  private emitEvent(type: OctreeEventType, data?: any): void {
    if (this.eventHandlers.length === 0) {
      return;
    }

    const event: OctreeEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        if (this.enableDebug) {
          console.error("Error in Octree event handler:", error);
        }
      }
    }
  }
}
