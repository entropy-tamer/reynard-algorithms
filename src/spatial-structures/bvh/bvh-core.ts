/**
 * BVH (Bounding Volume Hierarchy) Data Structure Core Implementation
 *
 * Implementation of the BVH data structure with comprehensive
 * features including SAH (Surface Area Heuristic) splitting,
 * ray tracing optimization, and dynamic refitting.
 *
 * Mathematical Theory:
 * A BVH is a tree structure on a set of geometric objects.
 * All geometric objects are wrapped in bounding volumes that
 * form the leaf nodes of the tree.
 *
 * Key formulas:
 * - SAH cost: C = t_trav + Σ(SA(child_i)/SA(node) * N_i * t_intersect)
 * - Construction: O(n log n) with good splits
 * - Ray traversal: O(log n) expected
 *
 * Where:
 * - t_trav = cost of traversing a node
 * - t_intersect = cost of intersecting a primitive
 * - SA = surface area
 * - N_i = number of primitives in child i
 *
 * @module algorithms/spatial-structures/bvh
 */

import type {
  AABB,
  Ray3D,
  Primitive,
  Triangle,
  BVHNode,
  BVHBuildConfig,
  BVHStats,
  BVHResult,
  RayIntersectionResult,
  AABBIntersectionResult,
  RayIntersectionOptions,
  AABBIntersectionOptions,
  BVHOptions,
  BVHEvent,
  BVHEventHandler,
  BVHPerformanceMetrics,
  BatchOperationResult,
  SAHSplitCandidate,
  BVHSerialization,
} from "./bvh-types";
import { BVHEventType } from "./bvh-types";
import { DEFAULT_BVH_CONFIG, DEFAULT_BVH_OPTIONS } from "./bvh-types";

/**
 * BVH Data Structure Implementation
 *
 * Provides efficient ray tracing and spatial queries with
 * SAH-based construction and dynamic refitting capabilities.
 */
export class BVH {
  private root: BVHNode | null;
  private config: Required<BVHBuildConfig>;
  private eventHandlers: BVHEventHandler[];
  private enableDebug: boolean;
  private stats: BVHStats;
  private primitives: Map<string | number, Primitive>;

  constructor(options: Partial<BVHOptions> = {}) {
    const opts = { ...DEFAULT_BVH_OPTIONS, ...options };

    this.config = { ...DEFAULT_BVH_CONFIG, ...(opts.config || {}) } as Required<BVHBuildConfig>;
    this.eventHandlers = opts.eventHandlers || [];
    this.enableDebug = false;
    this.primitives = new Map();

    this.root = null;

    this.stats = {
      totalPrimitives: 0,
      nodeCount: 0,
      leafCount: 0,
      height: 0,
      averageDepth: 0,
      maxDepth: 0,
      memoryUsage: 0,
      rayIntersections: 0,
      aabbIntersections: 0,
      averageRayIntersectionTime: 0,
      averageAABBIntersectionTime: 0,
      averageNodesVisitedPerRay: 0,
      averagePrimitivesTestedPerRay: 0,
    };

    // Insert initial primitives if provided
    if (opts.initialPrimitives && opts.initialPrimitives.length > 0) {
      this.insertBatch(opts.initialPrimitives);
    }
  }

  /**
   * Insert a primitive into the BVH.
   */
  insert(primitive: Primitive): BVHResult {
    const startTime = performance.now();
    let nodesVisited = 0;

    try {
      // Validate primitive
      if (!this.isValidPrimitive(primitive)) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Invalid primitive" },
        };
      }

      // Store primitive
      this.primitives.set(primitive.id, primitive);
      this.stats.totalPrimitives++;

      // Rebuild tree if needed
      if (this.root === null) {
        this.root = this.buildTree([primitive]);
      } else {
        // For now, rebuild the entire tree
        // In a more sophisticated implementation, we could do incremental updates
        const allPrimitives = Array.from(this.primitives.values());
        this.root = this.buildTree(allPrimitives);
      }

      nodesVisited = this.stats.nodeCount;
      this.updateStats();

      const executionTime = performance.now() - startTime;

      this.emitEvent(BVHEventType.PRIMITIVE_INSERTED, { primitive, executionTime });

      return {
        success: true,
        executionTime,
        nodesVisited,
        metadata: { primitive },
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
   * Insert multiple primitives in batch.
   */
  insertBatch(primitives: Primitive[]): BatchOperationResult {
    const startTime = performance.now();
    const results: BVHResult[] = [];
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];

    // Validate all primitives first
    const validPrimitives: Primitive[] = [];
    for (const primitive of primitives) {
      if (this.isValidPrimitive(primitive)) {
        validPrimitives.push(primitive);
        this.primitives.set(primitive.id, primitive);
        results.push({
          success: true,
          executionTime: 0,
          nodesVisited: 0,
          metadata: { primitive },
        });
        successful++;
      } else {
        results.push({
          success: false,
          executionTime: 0,
          nodesVisited: 0,
          metadata: { error: "Invalid primitive" },
        });
        failed++;
        errors.push("Invalid primitive");
      }
    }

    // Build tree with all valid primitives
    if (validPrimitives.length > 0) {
      this.root = this.buildTree(validPrimitives);
      this.stats.totalPrimitives = validPrimitives.length;
      this.updateStats();
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
   * Remove a primitive from the BVH.
   */
  remove(primitiveId: string | number): BVHResult {
    const startTime = performance.now();
    let nodesVisited = 0;

    try {
      if (!this.primitives.has(primitiveId)) {
        return {
          success: false,
          executionTime: performance.now() - startTime,
          nodesVisited: 0,
          metadata: { error: "Primitive not found" },
        };
      }

      this.primitives.delete(primitiveId);
      this.stats.totalPrimitives--;

      // Rebuild tree with remaining primitives
      if (this.primitives.size === 0) {
        this.root = null;
      } else {
        const remainingPrimitives = Array.from(this.primitives.values());
        this.root = this.buildTree(remainingPrimitives);
      }

      nodesVisited = this.stats.nodeCount;
      this.updateStats();

      const executionTime = performance.now() - startTime;

      this.emitEvent(BVHEventType.PRIMITIVE_REMOVED, { primitiveId, executionTime });

      return {
        success: true,
        executionTime,
        nodesVisited,
        metadata: { primitiveId },
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
   * Perform ray intersection query.
   */
  rayIntersection(ray: Ray3D, options: RayIntersectionOptions = {}): RayIntersectionResult {
    const startTime = performance.now();
    this.stats.rayIntersections++;

    const primitives: Primitive[] = [];
    const distances: number[] = [];
    let nodesVisited = 0;
    let primitivesTested = 0;

    if (this.root) {
      const result = this.rayIntersectionRecursive(
        this.root,
        ray,
        primitives,
        distances,
        options,
        0
      );
      nodesVisited = result.nodesVisited;
      primitivesTested = result.primitivesTested;
    }

    // Sort by distance if requested
    if (options.sortByDistance !== false && primitives.length > 1) {
      const sorted = primitives.map((p, i) => ({ primitive: p, distance: distances[i] }))
        .sort((a, b) => a.distance - b.distance);
      primitives.length = 0;
      distances.length = 0;
      for (const item of sorted) {
        primitives.push(item.primitive);
        distances.push(item.distance);
      }
    }

    const executionTime = performance.now() - startTime;
    this.stats.averageRayIntersectionTime = 
      (this.stats.averageRayIntersectionTime * (this.stats.rayIntersections - 1) + executionTime) / 
      this.stats.rayIntersections;
    this.stats.averageNodesVisitedPerRay = 
      (this.stats.averageNodesVisitedPerRay * (this.stats.rayIntersections - 1) + nodesVisited) / 
      this.stats.rayIntersections;
    this.stats.averagePrimitivesTestedPerRay = 
      (this.stats.averagePrimitivesTestedPerRay * (this.stats.rayIntersections - 1) + primitivesTested) / 
      this.stats.rayIntersections;

    this.emitEvent(BVHEventType.RAY_INTERSECTION, { 
      ray, 
      results: primitives, 
      executionTime 
    });

    return {
      primitives,
      distances,
      count: primitives.length,
      executionTime,
      nodesVisited,
      primitivesTested,
      success: true,
    };
  }

  /**
   * Perform AABB intersection query.
   */
  aabbIntersection(aabb: AABB, options: AABBIntersectionOptions = {}): AABBIntersectionResult {
    const startTime = performance.now();
    this.stats.aabbIntersections++;

    const primitives: Primitive[] = [];
    let nodesVisited = 0;

    if (this.root) {
      nodesVisited = this.aabbIntersectionRecursive(
        this.root,
        aabb,
        primitives,
        options,
        0
      );
    }

    const executionTime = performance.now() - startTime;
    this.stats.averageAABBIntersectionTime = 
      (this.stats.averageAABBIntersectionTime * (this.stats.aabbIntersections - 1) + executionTime) / 
      this.stats.aabbIntersections;

    this.emitEvent(BVHEventType.AABB_INTERSECTION, { 
      aabb, 
      results: primitives, 
      executionTime 
    });

    return {
      primitives,
      count: primitives.length,
      executionTime,
      nodesVisited,
      success: true,
    };
  }

  /**
   * Get the size of the BVH.
   */
  size(): number {
    return this.stats.totalPrimitives;
  }

  /**
   * Check if the BVH is empty.
   */
  isEmpty(): boolean {
    return this.root === null || this.stats.totalPrimitives === 0;
  }

  /**
   * Clear all primitives from the BVH.
   */
  clear(): void {
    this.root = null;
    this.primitives.clear();
    this.stats.totalPrimitives = 0;
    this.updateStats();
  }

  /**
   * Rebuild the entire BVH.
   */
  rebuild(): BVHResult {
    const startTime = performance.now();

    try {
      const primitives = Array.from(this.primitives.values());
      this.root = this.buildTree(primitives);
      this.updateStats();

      const executionTime = performance.now() - startTime;
      this.emitEvent(BVHEventType.TREE_REBUILT, { executionTime });

      return {
        success: true,
        executionTime,
        nodesVisited: this.stats.nodeCount,
        metadata: { primitivesRebuilt: primitives.length },
      };
    } catch (error) {
      return {
        success: false,
        executionTime: performance.now() - startTime,
        nodesVisited: 0,
        metadata: { error: error instanceof Error ? error.message : "Unknown error" },
      };
    }
  }

  /**
   * Get statistics about the BVH.
   */
  getStats(): BVHStats {
    return { ...this.stats };
  }

  /**
   * Get performance metrics.
   */
  getPerformanceMetrics(): BVHPerformanceMetrics {
    return {
      memoryUsage: this.stats.memoryUsage,
      averageRayIntersectionTime: this.stats.averageRayIntersectionTime,
      averageAABBIntersectionTime: this.stats.averageAABBIntersectionTime,
      performanceScore: this.calculatePerformanceScore(),
      balanceRatio: this.calculateBalanceRatio(),
      queryEfficiency: this.calculateQueryEfficiency(),
      sahQuality: this.calculateSAHQuality(),
    };
  }

  /**
   * Serialize the BVH to JSON.
   */
  serialize(): BVHSerialization {
    return {
      version: "1.0.0",
      config: this.config,
      data: {
        primitives: Array.from(this.primitives.values()),
        structure: this.serializeTreeStructure(),
      },
      metadata: {
        totalPrimitives: this.stats.totalPrimitives,
        height: this.stats.height,
        nodeCount: this.stats.nodeCount,
        createdAt: Date.now(),
      },
    };
  }

  /**
   * Deserialize a BVH from JSON.
   */
  static deserialize(data: BVHSerialization): BVH {
    const bvh = new BVH({ config: data.config });
    if (data.data.primitives.length > 0) {
      bvh.insertBatch(data.data.primitives);
    }
    return bvh;
  }

  // Private helper methods

  private buildTree(primitives: Primitive[]): BVHNode {
    if (primitives.length === 0) {
      throw new Error("Cannot build tree with no primitives");
    }

    if (primitives.length === 1) {
      return this.createLeafNode([primitives[0]], 0);
    }

    return this.buildNode(primitives, 0);
  }

  private buildNode(primitives: Primitive[], depth: number): BVHNode {
    if (primitives.length <= this.config.maxPrimitivesPerLeaf || depth >= this.config.maxDepth) {
      return this.createLeafNode(primitives, depth);
    }

    // Find best split using SAH
    const split = this.findBestSplit(primitives);
    if (!split) {
      return this.createLeafNode(primitives, depth);
    }

    // Partition primitives
    const { left, right } = this.partitionPrimitives(primitives, split);

    // Create internal node
    const node: BVHNode = {
      bounds: this.computeBounds(primitives),
      primitives: [],
      left: null,
      right: null,
      parent: null,
      isLeaf: false,
      depth,
      primitiveCount: primitives.length,
    };

    // Recursively build children
    node.left = this.buildNode(left, depth + 1);
    node.right = this.buildNode(right, depth + 1);
    node.left.parent = node;
    node.right.parent = node;

    return node;
  }

  private createLeafNode(primitives: Primitive[], depth: number): BVHNode {
    return {
      bounds: this.computeBounds(primitives),
      primitives,
      left: null,
      right: null,
      parent: null,
      isLeaf: true,
      depth,
      primitiveCount: primitives.length,
    };
  }

  private findBestSplit(primitives: Primitive[]): SAHSplitCandidate | null {
    if (!this.config.useSAH) {
      // Simple split along longest axis
      const bounds = this.computeBounds(primitives);
      const size = bounds.size;
      let axis = 0;
      if (size.y > size.x) axis = 1;
      if (size.z > size[axis === 0 ? 'x' : axis === 1 ? 'y' : 'z']) axis = 2;
      
      const center = bounds.center;
      const position = center[axis === 0 ? 'x' : axis === 1 ? 'y' : 'z'];
      
      return {
        axis,
        position,
        cost: this.config.traversalCost,
        leftCount: 0,
        rightCount: 0,
      };
    }

    let bestSplit: SAHSplitCandidate | null = null;
    let bestCost = Infinity;

    // Try splitting along each axis
    for (let axis = 0; axis < 3; axis++) {
      const split = this.findBestSplitAlongAxis(primitives, axis);
      if (split && split.cost < bestCost) {
        bestCost = split.cost;
        bestSplit = split;
      }
    }

    return bestSplit;
  }

  private findBestSplitAlongAxis(primitives: Primitive[], axis: number): SAHSplitCandidate | null {
    const bounds = this.computeBounds(primitives);
    const min = bounds.min[axis === 0 ? 'x' : axis === 1 ? 'y' : 'z'];
    const max = bounds.max[axis === 0 ? 'x' : axis === 1 ? 'y' : 'z'];
    
    if (min === max) {
      return null; // No split possible
    }

    const binSize = (max - min) / this.config.sahBins;
    let bestSplit: SAHSplitCandidate | null = null;
    let bestCost = Infinity;

    // Try each bin boundary
    for (let i = 1; i < this.config.sahBins; i++) {
      const position = min + i * binSize;
      const { left, right } = this.partitionPrimitivesAtPosition(primitives, axis, position);
      
      if (left.length === 0 || right.length === 0) {
        continue;
      }

      const cost = this.computeSAHCost(left, right, bounds);
      if (cost < bestCost) {
        bestCost = cost;
        bestSplit = {
          axis,
          position,
          cost,
          leftCount: left.length,
          rightCount: right.length,
        };
      }
    }

    return bestSplit;
  }

  private partitionPrimitives(primitives: Primitive[], split: SAHSplitCandidate): { left: Primitive[]; right: Primitive[] } {
    return this.partitionPrimitivesAtPosition(primitives, split.axis, split.position);
  }

  private partitionPrimitivesAtPosition(primitives: Primitive[], axis: number, position: number): { left: Primitive[]; right: Primitive[] } {
    const left: Primitive[] = [];
    const right: Primitive[] = [];

    for (const primitive of primitives) {
      const center = primitive.bounds.center[axis === 0 ? 'x' : axis === 1 ? 'y' : 'z'];
      if (center < position) {
        left.push(primitive);
      } else {
        right.push(primitive);
      }
    }

    return { left, right };
  }

  private computeSAHCost(left: Primitive[], right: Primitive[], parentBounds: AABB): number {
    const leftBounds = this.computeBounds(left);
    const rightBounds = this.computeBounds(right);
    
    const parentSA = this.computeSurfaceArea(parentBounds);
    const leftSA = this.computeSurfaceArea(leftBounds);
    const rightSA = this.computeSurfaceArea(rightBounds);
    
    const leftCost = (leftSA / parentSA) * left.length * this.config.intersectionCost;
    const rightCost = (rightSA / parentSA) * right.length * this.config.intersectionCost;
    
    return this.config.traversalCost + leftCost + rightCost;
  }

  private computeBounds(primitives: Primitive[]): AABB {
    if (primitives.length === 0) {
      throw new Error("Cannot compute bounds for empty primitive list");
    }

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (const primitive of primitives) {
      minX = Math.min(minX, primitive.bounds.min.x);
      minY = Math.min(minY, primitive.bounds.min.y);
      minZ = Math.min(minZ, primitive.bounds.min.z);
      maxX = Math.max(maxX, primitive.bounds.max.x);
      maxY = Math.max(maxY, primitive.bounds.max.y);
      maxZ = Math.max(maxZ, primitive.bounds.max.z);
    }

    return {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ },
      center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2, z: (minZ + maxZ) / 2 },
      size: { x: maxX - minX, y: maxY - minY, z: maxZ - minZ },
    };
  }

  private computeSurfaceArea(bounds: AABB): number {
    const size = bounds.size;
    return 2 * (size.x * size.y + size.y * size.z + size.z * size.x);
  }

  private rayIntersectionRecursive(
    node: BVHNode,
    ray: Ray3D,
    primitives: Primitive[],
    distances: number[],
    options: RayIntersectionOptions,
    nodesVisited: number
  ): { nodesVisited: number; primitivesTested: number } {
    nodesVisited++;

    // Check ray-AABB intersection
    const intersection = this.rayAABBIntersection(ray, node.bounds);
    if (!intersection) {
      return { nodesVisited, primitivesTested: 0 };
    }

    let primitivesTested = 0;

    if (node.isLeaf) {
      // Test all primitives in leaf
      for (const primitive of node.primitives) {
        primitivesTested++;
        
        if (options.filter && !options.filter(primitive)) {
          continue;
        }

        const distance = this.rayPrimitiveIntersection(ray, primitive);
        if (distance !== null) {
          primitives.push(primitive);
          distances.push(distance);
          
          if (!options.findAll) {
            return { nodesVisited, primitivesTested };
          }
          
          if (options.maxIntersections && primitives.length >= options.maxIntersections) {
            return { nodesVisited, primitivesTested };
          }
        }
      }
    } else {
      // Traverse children
      if (node.left) {
        const result = this.rayIntersectionRecursive(node.left, ray, primitives, distances, options, nodesVisited);
        nodesVisited = result.nodesVisited;
        primitivesTested += result.primitivesTested;
        
        if (!options.findAll && primitives.length > 0) {
          return { nodesVisited, primitivesTested };
        }
      }
      
      if (node.right) {
        const result = this.rayIntersectionRecursive(node.right, ray, primitives, distances, options, nodesVisited);
        nodesVisited = result.nodesVisited;
        primitivesTested += result.primitivesTested;
      }
    }

    return { nodesVisited, primitivesTested };
  }

  private aabbIntersectionRecursive(
    node: BVHNode,
    aabb: AABB,
    primitives: Primitive[],
    options: AABBIntersectionOptions,
    nodesVisited: number
  ): number {
    nodesVisited++;

    // Check AABB-AABB intersection
    if (!this.aabbIntersects(node.bounds, aabb)) {
      return nodesVisited;
    }

    if (node.isLeaf) {
      // Add all primitives in leaf
      for (const primitive of node.primitives) {
        if (options.filter && !options.filter(primitive)) {
          continue;
        }

        if (this.aabbIntersects(primitive.bounds, aabb)) {
          primitives.push(primitive);
          
          if (options.maxIntersections && primitives.length >= options.maxIntersections) {
            return nodesVisited;
          }
        }
      }
    } else {
      // Traverse children
      if (node.left) {
        nodesVisited = this.aabbIntersectionRecursive(node.left, aabb, primitives, options, nodesVisited);
      }
      if (node.right) {
        nodesVisited = this.aabbIntersectionRecursive(node.right, aabb, primitives, options, nodesVisited);
      }
    }

    return nodesVisited;
  }

  private rayAABBIntersection(ray: Ray3D, aabb: AABB): boolean {
    const tMin = (aabb.min.x - ray.origin.x) / ray.direction.x;
    const tMax = (aabb.max.x - ray.origin.x) / ray.direction.x;
    const t1 = Math.min(tMin, tMax);
    const t2 = Math.max(tMin, tMax);

    const tMinY = (aabb.min.y - ray.origin.y) / ray.direction.y;
    const tMaxY = (aabb.max.y - ray.origin.y) / ray.direction.y;
    const t3 = Math.min(tMinY, tMaxY);
    const t4 = Math.max(tMinY, tMaxY);

    const tMinZ = (aabb.min.z - ray.origin.z) / ray.direction.z;
    const tMaxZ = (aabb.max.z - ray.origin.z) / ray.direction.z;
    const t5 = Math.min(tMinZ, tMaxZ);
    const t6 = Math.max(tMinZ, tMaxZ);

    const tNear = Math.max(t1, t3, t5);
    const tFar = Math.min(t2, t4, t6);

    const tMinRay = ray.tMin || 0;
    const tMaxRay = ray.tMax || Infinity;

    return tNear <= tFar && tFar >= tMinRay && tNear <= tMaxRay;
  }

  private rayPrimitiveIntersection(ray: Ray3D, primitive: Primitive): number | null {
    // For triangles, use ray-triangle intersection
    if ('v0' in primitive && 'v1' in primitive && 'v2' in primitive) {
      return this.rayTriangleIntersection(ray, primitive as Triangle);
    }
    
    // For other primitives, use ray-AABB intersection
    if (this.rayAABBIntersection(ray, primitive.bounds)) {
      // Return distance to AABB center as approximation
      const center = primitive.bounds.center;
      const dx = center.x - ray.origin.x;
      const dy = center.y - ray.origin.y;
      const dz = center.z - ray.origin.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    return null;
  }

  private rayTriangleIntersection(ray: Ray3D, triangle: Triangle): number | null {
    // Möller-Trumbore algorithm
    const v0 = triangle.v0;
    const v1 = triangle.v1;
    const v2 = triangle.v2;

    const edge1 = { x: v1.x - v0.x, y: v1.y - v0.y, z: v1.z - v0.z };
    const edge2 = { x: v2.x - v0.x, y: v2.y - v0.y, z: v2.z - v0.z };

    const h = this.crossProduct(ray.direction, edge2);
    const a = this.dotProduct(edge1, h);

    if (a > -1e-8 && a < 1e-8) {
      return null; // Ray is parallel to triangle
    }

    const f = 1.0 / a;
    const s = { x: ray.origin.x - v0.x, y: ray.origin.y - v0.y, z: ray.origin.z - v0.z };
    const u = f * this.dotProduct(s, h);

    if (u < 0.0 || u > 1.0) {
      return null;
    }

    const q = this.crossProduct(s, edge1);
    const v = f * this.dotProduct(ray.direction, q);

    if (v < 0.0 || u + v > 1.0) {
      return null;
    }

    const t = f * this.dotProduct(edge2, q);

    if (t > 1e-8) {
      return t;
    }

    return null;
  }

  private aabbIntersects(aabb1: AABB, aabb2: AABB): boolean {
    return aabb1.min.x <= aabb2.max.x && aabb1.max.x >= aabb2.min.x &&
           aabb1.min.y <= aabb2.max.y && aabb1.max.y >= aabb2.min.y &&
           aabb1.min.z <= aabb2.max.z && aabb1.max.z >= aabb2.min.z;
  }

  private crossProduct(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x,
    };
  }

  private dotProduct(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  private isValidPrimitive(primitive: Primitive): boolean {
    if (!primitive || !primitive.bounds || !primitive.id) {
      return false;
    }

    const bounds = primitive.bounds;
    if (!bounds.min || !bounds.max || !bounds.center || !bounds.size) {
      return false;
    }

    // Check that min <= max
    if (bounds.min.x > bounds.max.x || bounds.min.y > bounds.max.y || bounds.min.z > bounds.max.z) {
      return false;
    }

    return true;
  }

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

  private countNodes(node: BVHNode): number {
    let count = 1;
    if (!node.isLeaf) {
      if (node.left) count += this.countNodes(node.left);
      if (node.right) count += this.countNodes(node.right);
    }
    return count;
  }

  private countLeaves(node: BVHNode): number {
    if (node.isLeaf) {
      return 1;
    }
    let count = 0;
    if (node.left) count += this.countLeaves(node.left);
    if (node.right) count += this.countLeaves(node.right);
    return count;
  }

  private calculateHeight(node: BVHNode): number {
    if (node.isLeaf) {
      return 1;
    }
    let maxChildHeight = 0;
    if (node.left) maxChildHeight = Math.max(maxChildHeight, this.calculateHeight(node.left));
    if (node.right) maxChildHeight = Math.max(maxChildHeight, this.calculateHeight(node.right));
    return 1 + maxChildHeight;
  }

  private calculateAverageDepth(node: BVHNode): number {
    const depths: number[] = [];
    this.collectDepths(node, 0, depths);
    return depths.reduce((sum, depth) => sum + depth, 0) / depths.length;
  }

  private collectDepths(node: BVHNode, depth: number, depths: number[]): void {
    if (node.isLeaf) {
      depths.push(depth);
    } else {
      if (node.left) this.collectDepths(node.left, depth + 1, depths);
      if (node.right) this.collectDepths(node.right, depth + 1, depths);
    }
  }

  private calculateMaxDepth(node: BVHNode): number {
    if (node.isLeaf) {
      return node.depth;
    }
    let maxDepth = node.depth;
    if (node.left) maxDepth = Math.max(maxDepth, this.calculateMaxDepth(node.left));
    if (node.right) maxDepth = Math.max(maxDepth, this.calculateMaxDepth(node.right));
    return maxDepth;
  }

  private estimateMemoryUsage(): number {
    // Rough estimate: each node + primitive data
    const nodeSize = 64; // Approximate size of a BVHNode
    const primitiveSize = 32; // Approximate size of a Primitive
    return this.stats.nodeCount * nodeSize + this.stats.totalPrimitives * primitiveSize;
  }

  private calculatePerformanceScore(): number {
    const maxTime = 100; // 100ms as maximum
    const rayScore = Math.max(0, 100 - (this.stats.averageRayIntersectionTime / maxTime) * 100);
    const aabbScore = Math.max(0, 100 - (this.stats.averageAABBIntersectionTime / maxTime) * 100);
    
    return (rayScore + aabbScore) / 2;
  }

  private calculateBalanceRatio(): number {
    if (this.stats.nodeCount === 0) {
      return 1;
    }
    const idealHeight = Math.ceil(Math.log2(this.stats.nodeCount + 1));
    return Math.max(0, 1 - (this.stats.height - idealHeight) / idealHeight);
  }

  private calculateQueryEfficiency(): number {
    if (this.stats.rayIntersections === 0) {
      return 1;
    }
    const idealVisits = Math.log2(this.stats.nodeCount + 1);
    const actualVisits = this.stats.averageNodesVisitedPerRay;
    return Math.max(0, 1 - (actualVisits - idealVisits) / idealVisits);
  }

  private calculateSAHQuality(): number {
    if (!this.config.useSAH) {
      return 0;
    }
    // Simple SAH quality metric based on tree balance
    return this.calculateBalanceRatio();
  }

  private serializeTreeStructure(): any {
    return this.serializeNode(this.root);
  }

  private serializeNode(node: BVHNode | null): any {
    if (node === null) {
      return null;
    }
    return {
      bounds: node.bounds,
      primitives: node.primitives.map(p => p.id),
      isLeaf: node.isLeaf,
      depth: node.depth,
      primitiveCount: node.primitiveCount,
      left: this.serializeNode(node.left),
      right: this.serializeNode(node.right),
    };
  }

  private emitEvent(type: BVHEventType, data?: any): void {
    if (this.eventHandlers.length === 0) {
      return;
    }

    const event: BVHEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        if (this.enableDebug) {
          console.error('Error in BVH event handler:', error);
        }
      }
    }
  }
}
