/**
 * @module algorithms/spatial-structures/octree/types
 * @description Defines the types and interfaces for the Octree data structure.
 */

/**
 * 3D Point with coordinates and optional data.
 */
export interface Point3D {
  /**
   * X coordinate.
   */
  x: number;
  /**
   * Y coordinate.
   */
  y: number;
  /**
   * Z coordinate.
   */
  z: number;
  /**
   * Optional data associated with the point.
   */
  data?: any;
  /**
   * Unique identifier for the point.
   */
  id?: string | number;
}

/**
 * 3D Bounding box.
 */
export interface Bounds3D {
  /**
   * Minimum coordinates.
   */
  min: Point3D;
  /**
   * Maximum coordinates.
   */
  max: Point3D;
  /**
   * Center point of the bounds.
   */
  center: Point3D;
  /**
   * Size of the bounds.
   */
  size: Point3D;
}

/**
 * 3D Sphere for spatial queries.
 */
export interface Sphere3D {
  /**
   * Center of the sphere.
   */
  center: Point3D;
  /**
   * Radius of the sphere.
   */
  radius: number;
}

/**
 * 3D Ray for ray casting.
 */
export interface Ray3D {
  /**
   * Origin point of the ray.
   */
  origin: Point3D;
  /**
   * Direction vector of the ray (should be normalized).
   */
  direction: Point3D;
  /**
   * Maximum distance for the ray.
   */
  maxDistance?: number;
}

/**
 * Frustum for culling operations.
 */
export interface Frustum3D {
  /**
   * Six planes defining the frustum.
   */
  planes: Array<{
    normal: Point3D;
    distance: number;
  }>;
}

/**
 * Octree node structure.
 */
export interface OctreeNode {
  /**
   * Bounding box of this node.
   */
  bounds: Bounds3D;
  /**
   * Points stored in this node.
   */
  points: Point3D[];
  /**
   * Child nodes (8 octants).
   */
  children: (OctreeNode | null)[];
  /**
   * Parent node reference.
   */
  parent: OctreeNode | null;
  /**
   * Depth of this node in the tree.
   */
  depth: number;
  /**
   * Whether this node is a leaf.
   */
  isLeaf: boolean;
  /**
   * Level of detail for this node.
   */
  lod: number;
}

/**
 * Octant enumeration for child nodes.
 */
export enum Octant {
  TOP_LEFT_FRONT = 0, // +x, +y, +z
  TOP_RIGHT_FRONT = 1, // -x, +y, +z
  TOP_LEFT_BACK = 2, // +x, +y, -z
  TOP_RIGHT_BACK = 3, // -x, +y, -z
  BOTTOM_LEFT_FRONT = 4, // +x, -y, +z
  BOTTOM_RIGHT_FRONT = 5, // -x, -y, +z
  BOTTOM_LEFT_BACK = 6, // +x, -y, -z
  BOTTOM_RIGHT_BACK = 7, // -x, -y, -z
}

/**
 * Configuration options for the Octree.
 */
export interface OctreeConfig {
  /**
   * Maximum number of points per node before subdivision.
   * @default 10
   */
  maxPoints?: number;
  /**
   * Maximum depth of the tree.
   * @default 8
   */
  maxDepth?: number;
  /**
   * Minimum size of a node (prevents infinite subdivision).
   * @default 1.0
   */
  minNodeSize?: number;
  /**
   * Whether to automatically subdivide nodes.
   * @default true
   */
  autoSubdivide?: boolean;
  /**
   * Whether to automatically merge empty nodes.
   * @default true
   */
  autoMerge?: boolean;
  /**
   * Whether to enable level-of-detail (LOD) support.
   * @default false
   */
  enableLOD?: boolean;
  /**
   * LOD distance thresholds.
   */
  lodDistances?: number[];
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
 * Statistics about the Octree.
 */
export interface OctreeStats {
  /**
   * Total number of points in the tree.
   */
  totalPoints: number;
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
   * Number of insertions performed.
   */
  insertions: number;
  /**
   * Number of removals performed.
   */
  removals: number;
  /**
   * Number of spatial queries performed.
   */
  spatialQueries: number;
  /**
   * Number of ray intersection queries performed.
   */
  rayIntersections: number;
  /**
   * Number of frustum culling operations performed.
   */
  frustumCulling: number;
  /**
   * Average query time in milliseconds.
   */
  averageQueryTime: number;
  /**
   * Average insertion time in milliseconds.
   */
  averageInsertionTime: number;
  /**
   * Average removal time in milliseconds.
   */
  averageRemovalTime: number;
}

/**
 * Result of an Octree operation.
 */
export interface OctreeResult {
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
 * Result of a spatial query.
 */
export interface SpatialQueryResult {
  /**
   * Points found in the query.
   */
  points: Point3D[];
  /**
   * Number of points found.
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
 * Result of a ray intersection query.
 */
export interface RayIntersectionResult {
  /**
   * Points intersected by the ray.
   */
  points: Point3D[];
  /**
   * Distances to intersected points.
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
   * Whether the query was successful.
   */
  success: boolean;
}

/**
 * Result of frustum culling.
 */
export interface FrustumCullingResult {
  /**
   * Points visible within the frustum.
   */
  visiblePoints: Point3D[];
  /**
   * Number of visible points.
   */
  visibleCount: number;
  /**
   * Number of culled points.
   */
  culledCount: number;
  /**
   * Time taken for the culling in milliseconds.
   */
  executionTime: number;
  /**
   * Number of nodes visited during the culling.
   */
  nodesVisited: number;
  /**
   * Whether the culling was successful.
   */
  success: boolean;
}

/**
 * Options for spatial queries.
 */
export interface SpatialQueryOptions {
  /**
   * Whether to use inclusive bounds.
   * @default true
   */
  inclusive?: boolean;
  /**
   * Custom filter function for additional filtering.
   */
  filter?: (point: Point3D) => boolean;
  /**
   * Maximum number of results to return.
   */
  maxResults?: number;
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
  filter?: (point: Point3D) => boolean;
  /**
   * Maximum number of intersections to return.
   */
  maxIntersections?: number;
}

/**
 * Options for frustum culling.
 */
export interface FrustumCullingOptions {
  /**
   * Whether to use LOD for culling.
   * @default false
   */
  useLOD?: boolean;
  /**
   * Custom filter function for additional filtering.
   */
  filter?: (point: Point3D) => boolean;
}

/**
 * Options for Octree operations.
 */
export interface OctreeOptions {
  /**
   * Configuration for the Octree.
   */
  config?: Partial<OctreeConfig>;
  /**
   * Initial points to insert.
   */
  initialPoints?: Point3D[];
  /**
   * Event handlers for monitoring operations.
   */
  eventHandlers?: OctreeEventHandler[];
  /** Enable debug event emission */
  enableDebug?: boolean;
}

/**
 * Event types for Octree operations.
 */
export enum OctreeEventType {
  POINT_INSERTED = "point_inserted",
  POINT_REMOVED = "point_removed",
  NODE_SUBDIVIDED = "node_subdivided",
  NODE_MERGED = "node_merged",
  SPATIAL_QUERY = "spatial_query",
  RAY_INTERSECTION = "ray_intersection",
  FRUSTUM_CULLING = "frustum_culling",
  STATS_UPDATED = "stats_updated",
  OCTREE_CLEARED = "octree_cleared",
}

/**
 * Event data for Octree operations.
 */
export interface OctreeEvent {
  type: OctreeEventType;
  timestamp: number;
  data?: any;
}

/**
 * Event handler function type.
 */
export type OctreeEventHandler = (event: OctreeEvent) => void;

/**
 * Performance metrics for the Octree.
 */
export interface OctreePerformanceMetrics {
  /**
   * Memory usage in bytes.
   */
  memoryUsage: number;
  /**
   * Average query time in milliseconds.
   */
  averageQueryTime: number;
  /**
   * Average insertion time in milliseconds.
   */
  averageInsertionTime: number;
  /**
   * Average removal time in milliseconds.
   */
  averageRemovalTime: number;
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
   * LOD efficiency (if enabled).
   */
  lodEfficiency: number;
}

/**
 * Result of a batch operation.
 */
export interface BatchOperationResult {
  /**
   * Whether the batch operation was successful overall.
   */
  success: boolean;
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
  results: OctreeResult[];
}

/**
 * Voxel data for voxel-based operations.
 */
export interface Voxel {
  /**
   * Position of the voxel.
   */
  position: Point3D;
  /**
   * Size of the voxel.
   */
  size: number;
  /**
   * Data stored in the voxel.
   */
  data?: any;
  /**
   * Whether the voxel is occupied.
   */
  occupied: boolean;
}

/**
 * Voxel grid for voxel operations.
 */
export interface VoxelGrid {
  /**
   * Bounds of the voxel grid.
   */
  bounds: Bounds3D;
  /**
   * Size of each voxel.
   */
  voxelSize: number;
  /**
   * Number of voxels in each dimension.
   */
  dimensions: Point3D;
  /**
   * Voxel data.
   */
  voxels: Voxel[][][];
}

/**
 * Serialization format for the Octree.
 */
export interface OctreeSerialization {
  /**
   * Version of the serialization format.
   */
  version: string;
  /**
   * Configuration of the tree.
   */
  config: OctreeConfig;
  /**
   * Serialized tree data.
   */
  data: {
    points: Point3D[];
    structure: any; // Tree structure representation
  };
  /**
   * Metadata about the tree.
   */
  metadata: {
    totalPoints: number;
    height: number;
    nodeCount: number;
    createdAt: number;
  };
}

/**
 * Default configuration for the Octree.
 */
export const DEFAULT_OCTREE_CONFIG: OctreeConfig = {
  maxPoints: 10,
  maxDepth: 8,
  minNodeSize: 1.0,
  autoSubdivide: true,
  autoMerge: true,
  enableLOD: false,
  lodDistances: [10, 50, 100, 200],
  enableStats: false,
  enableDebug: false,
};

/**
 * Default options for the Octree.
 */
export const DEFAULT_OCTREE_OPTIONS: OctreeOptions = {
  config: DEFAULT_OCTREE_CONFIG,
  initialPoints: [],
};
