/**
 * K-d Tree Types and Interfaces
 *
 * TypeScript interfaces and types for the K-d Tree spatial data structure implementation.
 * Provides type safety for k-dimensional spatial partitioning and query operations.
 *
 * @module algorithms/spatialStructures/kdtreeTypes
 */

/**
 * Point Interface
 *
 * Represents a k-dimensional point in space.
 */
export interface Point {
  /** Array of coordinates for each dimension */
  coordinates: number[];
}

/**
 * 2D Point Interface
 */
export interface Point2D {
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
}

/**
 * 3D Point Interface
 */
export interface Point3D {
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
  /** Z coordinate */
  z: number;
}

/**
 * Bounding Box Interface
 *
 * Represents an axis-aligned bounding box in k-dimensional space.
 */
export interface BoundingBox {
  /** Minimum coordinates for each dimension */
  min: number[];
  /** Maximum coordinates for each dimension */
  max: number[];
}

/**
 * K-d Tree Node
 *
 * Represents a node in the K-d tree structure.
 *
 * @template T - The type of data associated with points
 */
export interface KdNode<T = any> {
  /** The point stored in this node */
  point: Point;
  /** Associated data */
  data?: T;
  /** Left child node */
  left: KdNode<T> | null;
  /** Right child node */
  right: KdNode<T> | null;
  /** Parent node */
  parent?: KdNode<T> | null;
  /** The dimension used for splitting at this node */
  dimension: number;
  /** Depth of this node in the tree */
  depth: number;
}

/**
 * K-d Tree Configuration
 */
export interface KdTreeConfig {
  /** Number of dimensions */
  dimensions: number;
  /** Maximum depth of the tree */
  maxDepth?: number;
  /** Minimum number of points per leaf node */
  minPointsPerLeaf?: number;
  /** Whether to use median finding for splitting */
  useMedianSplitting?: boolean;
  /** Whether to enable performance monitoring */
  enablePerformanceMonitoring?: boolean;
  /** Whether to enable event handling */
  enableEvents?: boolean;
  /** Whether to allow duplicate points */
  allowDuplicates?: boolean;
  /** Tolerance for point equality */
  tolerance?: number;
}

/**
 * K-d Tree Statistics
 */
export interface KdTreeStats {
  /** Total number of points in the tree */
  totalPoints: number;
  /** Number of dimensions */
  dimensions: number;
  /** Height of the tree */
  height: number;
  /** Number of nodes */
  nodeCount: number;
  /** Number of leaf nodes */
  leafCount: number;
  /** Average depth of nodes */
  averageDepth: number;
  /** Maximum depth of nodes */
  maxDepth: number;
  /** Memory usage in bytes */
  memoryUsage: number;
  /** Number of insertions */
  insertions: number;
  /** Number of searches */
  searches: number;
  /** Number of nearest neighbor queries */
  nearestNeighborQueries: number;
  /** Number of range queries */
  rangeQueries: number;
  /** Average search time in milliseconds */
  averageSearchTime: number;
  /** Average nearest neighbor search time in milliseconds */
  averageNearestNeighborTime: number;
  /** Average range query time in milliseconds */
  averageRangeQueryTime: number;
}

/**
 * K-d Tree Query Result
 */
export interface KdTreeResult<T = any> {
  /** Whether the operation was successful */
  success: boolean;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Number of nodes visited */
  nodesVisited: number;
  /** Additional metadata */
  metadata?: any;
}

/**
 * Nearest Neighbor Result
 */
export interface NearestNeighborResult<T = any> {
  /** The nearest point found */
  point: Point | null;
  /** Associated data */
  data?: T;
  /** Distance from query point */
  distance: number;
  /** Whether this is an exact match */
  exact?: boolean;
  /** Execution time in milliseconds */
  executionTime?: number;
  /** Number of nodes visited */
  nodesVisited?: number;
  /** Whether the operation was successful */
  success?: boolean;
}

/**
 * K-Nearest Neighbors Result
 */
export interface KNearestNeighborsResult<T = any> {
  /** Array of nearest neighbors */
  neighbors: NearestNeighborResult<T>[];
  /** Points found */
  points?: Point[];
  /** Number of neighbors found */
  count: number;
  /** Maximum distance among results */
  maxDistance: number;
}

/**
 * Range Query Result
 */
export interface RangeQueryResult<T = any> {
  /** Points within the query range */
  points: Point[];
  /** Number of points found */
  count: number;
  /** Query bounding box */
  queryBox: BoundingBox;
  /** Execution time in milliseconds */
  executionTime?: number;
  /** Number of nodes visited */
  nodesVisited?: number;
  /** Whether the operation was successful */
  success?: boolean;
}

/**
 * Nearest Neighbor Search Options
 */
export interface NearestNeighborOptions {
  /** Maximum distance to search */
  maxDistance?: number;
  /** Whether to include exact matches only */
  exactOnly?: boolean;
  /** Maximum number of results */
  maxResults?: number;
  /** Whether to include self in results */
  includeSelf?: boolean;
  /** Custom distance function */
  distanceFunction?: (a: Point, b: Point) => number;
}

/**
 * K-Nearest Neighbors Search Options
 */
export interface KNearestNeighborsOptions {
  /** Number of nearest neighbors to find */
  k: number;
  /** Maximum distance to search */
  maxDistance?: number;
  /** Whether to include exact matches only */
  exactOnly?: boolean;
  /** Whether to include self in results */
  includeSelf?: boolean;
  /** Custom distance function */
  distanceFunction?: (a: Point, b: Point) => number;
}

/**
 * Range Query Options
 */
export interface RangeQueryOptions {
  /** Bounding box for the query */
  bounds: BoundingBox;
  /** Maximum number of results */
  maxResults?: number;
  /** Whether to include points on the boundary */
  includeBoundary?: boolean;
  /** Whether to include boundary points */
  inclusive?: boolean;
  /** Filter function for results */
  filter?: (point: Point) => boolean;
}

/**
 * K-d Tree Options
 */
export interface KdTreeOptions {
  /** Tree configuration */
  config?: KdTreeConfig;
  /** Whether to enable performance monitoring */
  enablePerformanceMonitoring?: boolean;
  /** Whether to enable event handling */
  enableEvents?: boolean;
  /** Custom distance function */
  distanceFunction?: (a: Point, b: Point) => number;
  /** Event handlers */
  eventHandlers?: KdTreeEventHandler[];
  /** Initial points to insert */
  initialPoints?: Point[];
}

/**
 * K-d Tree Event Types
 */
export enum KdTreeEventType {
  /** Point inserted */
  POINT_INSERTED = "point_inserted",
  /** Point removed */
  POINT_REMOVED = "point_removed",
  /** Tree rebuilt */
  TREE_REBUILT = "tree_rebuilt",
  /** Query performed */
  QUERY_PERFORMED = "query_performed",
  /** Search performed */
  SEARCH_PERFORMED = "search_performed",
  /** Nearest neighbor query performed */
  NEAREST_NEIGHBOR_QUERY = "nearest_neighbor_query",
  /** Range query performed */
  RANGE_QUERY = "range_query",
  /** Performance threshold exceeded */
  PERFORMANCE_THRESHOLD_EXCEEDED = "performance_threshold_exceeded",
}

/**
 * K-d Tree Event
 */
export interface KdTreeEvent {
  /** Event type */
  type: KdTreeEventType;
  /** Event timestamp */
  timestamp: number;
  /** Event data */
  data?: any;
}

/**
 * K-d Tree Event Handler
 */
export type KdTreeEventHandler = (event: KdTreeEvent) => void;

/**
 * K-d Tree Performance Metrics
 */
export interface KdTreePerformanceMetrics {
  /** Average insertion time in milliseconds */
  averageInsertionTime: number;
  /** Average insert time in milliseconds */
  averageInsertTime: number;
  /** Average query time in milliseconds */
  averageQueryTime: number;
  /** Average search time in milliseconds */
  averageSearchTime: number;
  /** Average nearest neighbor search time in milliseconds */
  averageNearestNeighborTime: number;
  /** Average range query time in milliseconds */
  averageRangeQueryTime: number;
  /** Total number of operations performed */
  totalOperations: number;
  /** Memory usage in bytes */
  memoryUsage: number;
  /** Cache hit rate (0-1) */
  cacheHitRate: number;
  /** Performance score */
  performanceScore?: number;
  /** Balance ratio */
  balanceRatio?: number;
  /** Query efficiency */
  queryEfficiency?: number;
}

/**
 * Batch Operation Result
 */
export interface BatchOperationResult {
  /** Number of successful operations */
  successful: number;
  /** Number of failed operations */
  failed: number;
  /** Total time taken in milliseconds */
  totalTime: number;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Average time per operation in milliseconds */
  averageTime: number;
  /** Errors encountered */
  errors: string[];
  /** Results of the operations */
  results?: any[];
}

/**
 * K-d Tree Serialization
 */
export interface KdTreeSerialization {
  /** Tree configuration */
  config: KdTreeConfig;
  /** Serialized tree data */
  data: any;
  /** Metadata */
  metadata: {
    version: string;
    timestamp: number;
    stats: KdTreeStats;
    totalPoints: number;
    nodeCount: number;
    height: number;
    createdAt?: number;
  };
}

/**
 * Default K-d Tree Configuration
 */
export const DEFAULT_KD_TREE_CONFIG: KdTreeConfig = {
  dimensions: 2,
  maxDepth: 20,
  minPointsPerLeaf: 1,
  useMedianSplitting: true,
  enablePerformanceMonitoring: false,
  enableEvents: false,
  allowDuplicates: false,
  tolerance: 1e-10,
};

/**
 * Default K-d Tree Options
 */
export const DEFAULT_KD_TREE_OPTIONS: KdTreeOptions = {
  config: DEFAULT_KD_TREE_CONFIG,
  enablePerformanceMonitoring: false,
  enableEvents: false,
};
