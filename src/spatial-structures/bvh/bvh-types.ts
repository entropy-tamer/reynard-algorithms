/**
 * @module algorithms/spatial-structures/bvh/types
 * @description Defines the types and interfaces for the BVH (Bounding Volume Hierarchy) data structure.
 */

/**
 * 3D Axis-Aligned Bounding Box.
 */
export interface AABB {
  /**
   * Minimum coordinates.
   */
  min: {
    x: number;
    y: number;
    z: number;
  };
  /**
   * Maximum coordinates.
   */
  max: {
    x: number;
    y: number;
    z: number;
  };
  /**
   * Center point of the AABB.
   */
  center: {
    x: number;
    y: number;
    z: number;
  };
  /**
   * Size of the AABB.
   */
  size: {
    x: number;
    y: number;
    z: number;
  };
}

/**
 * 3D Ray for ray tracing.
 */
export interface Ray3D {
  /**
   * Origin point of the ray.
   */
  origin: {
    x: number;
    y: number;
    z: number;
  };
  /**
   * Direction vector of the ray (should be normalized).
   */
  direction: {
    x: number;
    y: number;
    z: number;
  };
  /**
   * Minimum distance for intersection.
   */
  tMin?: number;
  /**
   * Maximum distance for intersection.
   */
  tMax?: number;
}

/**
 * Primitive object that can be stored in the BVH.
 */
export interface Primitive {
  /**
   * Unique identifier for the primitive.
   */
  id: string | number;
  /**
   * Bounding box of the primitive.
   */
  bounds: AABB;
  /**
   * Optional data associated with the primitive.
   */
  data?: any;
  /**
   * Whether the primitive is dynamic (can move).
   */
  dynamic?: boolean;
}

/**
 * Triangle primitive for mesh data.
 */
export interface Triangle extends Primitive {
  /**
   * First vertex of the triangle.
   */
  v0: { x: number; y: number; z: number };
  /**
   * Second vertex of the triangle.
   */
  v1: { x: number; y: number; z: number };
  /**
   * Third vertex of the triangle.
   */
  v2: { x: number; y: number; z: number };
  /**
   * Normal vector of the triangle.
   */
  normal?: { x: number; y: number; z: number };
}

/**
 * BVH node structure.
 */
export interface BVHNode {
  /**
   * Bounding box of this node.
   */
  bounds: AABB;
  /**
   * Primitives stored in this node (leaf nodes only).
   */
  primitives: Primitive[];
  /**
   * Left child node.
   */
  left: BVHNode | null;
  /**
   * Right child node.
   */
  right: BVHNode | null;
  /**
   * Parent node reference.
   */
  parent: BVHNode | null;
  /**
   * Whether this node is a leaf.
   */
  isLeaf: boolean;
  /**
   * Depth of this node in the tree.
   */
  depth: number;
  /**
   * Number of primitives in this subtree.
   */
  primitiveCount: number;
}

/**
 * Configuration options for BVH construction.
 */
export interface BVHBuildConfig {
  /**
   * Maximum number of primitives per leaf node.
   * @default 4
   */
  maxPrimitivesPerLeaf?: number;
  /**
   * Maximum depth of the tree.
   * @default 20
   */
  maxDepth?: number;
  /**
   * Whether to use SAH (Surface Area Heuristic) for splitting.
   * @default true
   */
  useSAH?: boolean;
  /**
   * Number of bins for SAH calculation.
   * @default 12
   */
  sahBins?: number;
  /**
   * Cost of traversing a node.
   * @default 1.0
   */
  traversalCost?: number;
  /**
   * Cost of intersecting a primitive.
   * @default 1.0
   */
  intersectionCost?: number;
  /**
   * Whether to enable statistics tracking.
   * @default false
   */
  enableStats?: boolean;
  /**
   * Whether to enable debug logging.
   * @default false
   */
  enableDebug?: boolean;
}

/**
 * Statistics about the BVH.
 */
export interface BVHStats {
  /**
   * Total number of primitives in the tree.
   */
  totalPrimitives: number;
  /**
   * Number of nodes in the tree.
   */
  nodeCount: number;
  /**
   * Number of leaf nodes.
   */
  leafCount: number;
  /**
   * Height of the tree.
   */
  height: number;
  /**
   * Average depth of leaf nodes.
   */
  averageDepth: number;
  /**
   * Maximum depth of any node.
   */
  maxDepth: number;
  /**
   * Memory usage in bytes.
   */
  memoryUsage: number;
  /**
   * Number of ray intersection queries performed.
   */
  rayIntersections: number;
  /**
   * Number of AABB intersection queries performed.
   */
  aabbIntersections: number;
  /**
   * Average ray intersection time in milliseconds.
   */
  averageRayIntersectionTime: number;
  /**
   * Average AABB intersection time in milliseconds.
   */
  averageAABBIntersectionTime: number;
  /**
   * Average nodes visited per ray intersection.
   */
  averageNodesVisitedPerRay: number;
  /**
   * Average primitives tested per ray intersection.
   */
  averagePrimitivesTestedPerRay: number;
}

/**
 * Result of a BVH operation.
 */
export interface BVHResult {
  /**
   * Whether the operation was successful.
   */
  success: boolean;
  /**
   * Time taken for the operation in milliseconds.
   */
  executionTime: number;
  /**
   * Number of nodes visited during the operation.
   */
  nodesVisited: number;
  /**
   * Additional metadata about the operation.
   */
  metadata?: any;
}

/**
 * Result of a ray intersection query.
 */
export interface RayIntersectionResult {
  /**
   * Primitives intersected by the ray.
   */
  primitives: Primitive[];
  /**
   * Distances to intersected primitives.
   */
  distances: number[];
  /**
   * Number of intersections found.
   */
  count: number;
  /**
   * Time taken for the query in milliseconds.
   */
  executionTime: number;
  /**
   * Number of nodes visited during the query.
   */
  nodesVisited: number;
  /**
   * Number of primitives tested during the query.
   */
  primitivesTested: number;
  /**
   * Whether the query was successful.
   */
  success: boolean;
}

/**
 * Result of an AABB intersection query.
 */
export interface AABBIntersectionResult {
  /**
   * Primitives that intersect with the query AABB.
   */
  primitives: Primitive[];
  /**
   * Number of intersections found.
   */
  count: number;
  /**
   * Time taken for the query in milliseconds.
   */
  executionTime: number;
  /**
   * Number of nodes visited during the query.
   */
  nodesVisited: number;
  /**
   * Whether the query was successful.
   */
  success: boolean;
}

/**
 * Options for ray intersection queries.
 */
export interface RayIntersectionOptions {
  /**
   * Whether to return all intersections or just the first.
   * @default false
   */
  findAll?: boolean;
  /**
   * Custom filter function for additional filtering.
   */
  filter?: (primitive: Primitive) => boolean;
  /**
   * Maximum number of intersections to return.
   */
  maxIntersections?: number;
  /**
   * Whether to sort results by distance.
   * @default true
   */
  sortByDistance?: boolean;
}

/**
 * Options for AABB intersection queries.
 */
export interface AABBIntersectionOptions {
  /**
   * Custom filter function for additional filtering.
   */
  filter?: (primitive: Primitive) => boolean;
  /**
   * Maximum number of intersections to return.
   */
  maxIntersections?: number;
}

/**
 * Options for BVH operations.
 */
export interface BVHOptions {
  /**
   * Configuration for BVH construction.
   */
  config?: Partial<BVHBuildConfig>;
  /**
   * Initial primitives to insert.
   */
  initialPrimitives?: Primitive[];
  /**
   * Event handlers for monitoring operations.
   */
  eventHandlers?: BVHEventHandler[];
}

/**
 * Event types for BVH operations.
 */
export enum BVHEventType {
  PRIMITIVE_INSERTED = "primitive_inserted",
  PRIMITIVE_REMOVED = "primitive_removed",
  TREE_REBUILT = "tree_rebuilt",
  RAY_INTERSECTION = "ray_intersection",
  AABB_INTERSECTION = "aabb_intersection",
  STATS_UPDATED = "stats_updated",
}

/**
 * Event data for BVH operations.
 */
export interface BVHEvent {
  type: BVHEventType;
  timestamp: number;
  data?: any;
}

/**
 * Event handler function type.
 */
export type BVHEventHandler = (event: BVHEvent) => void;

/**
 * Performance metrics for the BVH.
 */
export interface BVHPerformanceMetrics {
  /**
   * Memory usage in bytes.
   */
  memoryUsage: number;
  /**
   * Average ray intersection time in milliseconds.
   */
  averageRayIntersectionTime: number;
  /**
   * Average AABB intersection time in milliseconds.
   */
  averageAABBIntersectionTime: number;
  /**
   * Performance score (0-100).
   */
  performanceScore: number;
  /**
   * Tree balance ratio (0-1, 1 being perfectly balanced).
   */
  balanceRatio: number;
  /**
   * Query efficiency ratio.
   */
  queryEfficiency: number;
  /**
   * SAH quality score (if SAH is enabled).
   */
  sahQuality: number;
}

/**
 * Result of a batch operation.
 */
export interface BatchOperationResult {
  /**
   * Number of successful operations.
   */
  successful: number;
  /**
   * Number of failed operations.
   */
  failed: number;
  /**
   * Array of error messages.
   */
  errors: string[];
  /**
   * Time taken for the batch operation in milliseconds.
   */
  executionTime: number;
  /**
   * Array of operation results.
   */
  results: BVHResult[];
}

/**
 * Traversal stack for iterative BVH traversal.
 */
export interface TraversalStack {
  /**
   * Stack of nodes to visit.
   */
  stack: BVHNode[];
  /**
   * Current stack size.
   */
  size: number;
  /**
   * Maximum stack size reached.
   */
  maxSize: number;
}

/**
 * SAH (Surface Area Heuristic) split candidate.
 */
export interface SAHSplitCandidate {
  /**
   * Axis of the split (0=x, 1=y, 2=z).
   */
  axis: number;
  /**
   * Position of the split.
   */
  position: number;
  /**
   * Cost of this split.
   */
  cost: number;
  /**
   * Number of primitives on the left side.
   */
  leftCount: number;
  /**
   * Number of primitives on the right side.
   */
  rightCount: number;
}

/**
 * Serialization format for the BVH.
 */
export interface BVHSerialization {
  /**
   * Version of the serialization format.
   */
  version: string;
  /**
   * Configuration of the BVH.
   */
  config: BVHBuildConfig;
  /**
   * Serialized BVH data.
   */
  data: {
    primitives: Primitive[];
    structure: any; // Tree structure representation
  };
  /**
   * Metadata about the BVH.
   */
  metadata: {
    totalPrimitives: number;
    height: number;
    nodeCount: number;
    createdAt: number;
  };
}

/**
 * Default configuration for the BVH.
 */
export const DEFAULT_BVH_CONFIG: BVHBuildConfig = {
  maxPrimitivesPerLeaf: 4,
  maxDepth: 20,
  useSAH: true,
  sahBins: 12,
  traversalCost: 1.0,
  intersectionCost: 1.0,
  enableStats: false,
  enableDebug: false,
};

/**
 * Default options for the BVH.
 */
export const DEFAULT_BVH_OPTIONS: BVHOptions = {
  config: DEFAULT_BVH_CONFIG,
  initialPrimitives: [],
};



