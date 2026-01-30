/**
 * Quadtree Types and Interfaces
 *
 * TypeScript interfaces and types for the Quadtree spatial data structure implementation.
 * Provides type safety for spatial partitioning and query operations.
 *
 * @module algorithms/spatialStructures/quadtreeTypes
 */

/**
 * Point Interface
 *
 * Represents a 2D point in space.
 */
export interface Point {
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
}

/**
 * Rectangle Interface (AABB)
 *
 * Represents an axis-aligned bounding box.
 */
export interface Rectangle {
  /** X coordinate of top-left corner */
  x: number;
  /** Y coordinate of top-left corner */
  y: number;
  /** Width of the rectangle */
  width: number;
  /** Height of the rectangle */
  height: number;
}

/**
 * Quadtree Node Data
 *
 * Data stored in quadtree nodes.
 *
 * @template T - The type of data associated with spatial objects
 */
export interface QuadtreeData<T> {
  /** The data object */
  data: T;
  /** Position of the object */
  position: Point;
  /** Optional bounding box for the object */
  bounds?: Rectangle;
  /** Unique identifier for the object */
  id?: string | number;
}

/**
 * Quadtree Node
 *
 * Represents a single node in the quadtree structure.
 *
 * @template T - The type of data stored in the quadtree
 */
export interface QuadtreeNode<T> {
  /** Bounding box of this node */
  bounds: Rectangle;
  /** Data objects in this node */
  objects: QuadtreeData<T>[];
  /** Child nodes (null if leaf) */
  children: QuadtreeNode<T>[] | null;
  /** Parent node (null if root) */
  parent: QuadtreeNode<T> | null;
  /** Depth level of this node */
  depth: number;
  /** Maximum number of objects before subdivision */
  maxObjects: number;
  /** Maximum depth before forced subdivision stops */
  maxDepth: number;
}

/**
 * Quadtree Configuration
 *
 * Configuration options for the quadtree.
 */
export interface QuadtreeConfig {
  /** Maximum number of objects per node before subdivision */
  maxObjects?: number;
  /** Maximum depth of the tree */
  maxDepth?: number;
  /** Minimum node size (stops subdivision when reached) */
  minNodeSize?: number;
  /** Whether to automatically subdivide on insertion */
  autoSubdivide?: boolean;
  /** Whether to merge empty nodes */
  autoMerge?: boolean;
}

/**
 * Quadtree Statistics
 *
 * Performance and usage statistics for the quadtree.
 */
export interface QuadtreeStats {
  /** Total number of objects in the tree */
  totalObjects: number;
  /** Total number of nodes in the tree */
  totalNodes: number;
  /** Number of leaf nodes */
  leafNodes: number;
  /** Maximum depth reached */
  maxDepth: number;
  /** Average objects per node */
  averageObjectsPerNode: number;
  /** Number of subdivisions performed */
  subdivisions: number;
  /** Number of merges performed */
  merges: number;
  /** Number of queries performed */
  queries: number;
  /** Average query time in milliseconds */
  averageQueryTime: number;
}

/**
 * Quadtree Query Result
 *
 * Result of a quadtree query operation.
 *
 * @template T - The type of data in the quadtree
 */
export interface QuadtreeQueryResult<T> {
  /** Objects found in the query */
  objects: QuadtreeData<T>[];
  /** Number of nodes searched */
  nodesSearched: number;
  /** Time taken for the query in milliseconds */
  queryTime: number;
  /** Bounding box of the query area */
  queryBounds: Rectangle;
}

/**
 * Quadtree Circle Query
 *
 * Parameters for circular area queries.
 */
export interface CircleQuery {
  /** Center point of the circle */
  center: Point;
  /** Radius of the circle */
  radius: number;
}

/**
 * Quadtree Rectangle Query
 *
 * Parameters for rectangular area queries.
 */
export interface RectangleQuery {
  /** Bounding box of the query area */
  bounds: Rectangle;
}

/**
 * Quadtree Point Query
 *
 * Parameters for point queries.
 */
export interface PointQuery {
  /** Point to search for */
  point: Point;
  /** Tolerance for point matching */
  tolerance?: number;
}

/**
 * Quadtree Event Types
 *
 * Events that can be emitted by the quadtree.
 */
export type QuadtreeEventType = "insert" | "remove" | "subdivide" | "merge" | "query" | "clear";

/**
 * Quadtree Event Data
 *
 * Data associated with quadtree events.
 *
 * @template T - The type of data in the quadtree
 */
export interface QuadtreeEvent<T> {
  /** The type of event */
  type: QuadtreeEventType;
  /** The timestamp of the event */
  timestamp: number;
  /** The data associated with the event */
  data?: QuadtreeData<T>;
  /** The node associated with the event */
  node?: QuadtreeNode<T>;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Quadtree Event Handler
 *
 * Function type for handling quadtree events.
 *
 * @template T - The type of data in the quadtree
 * @param event - The event data
 */
export type QuadtreeEventHandler<T> = (event: QuadtreeEvent<T>) => void;

/**
 * Quadtree Options
 *
 * Extended options for quadtree creation with event handling.
 *
 * @template T - The type of data in the quadtree
 */
export interface QuadtreeOptions<T> extends QuadtreeConfig {
  /** Event handler for quadtree events */
  onEvent?: QuadtreeEventHandler<T>;
  /** Whether to enable performance monitoring */
  enableStats?: boolean;
}

/**
 * Quadtree Traversal Result
 *
 * Result of traversing the quadtree structure.
 *
 * @template T - The type of data in the quadtree
 */
export interface QuadtreeTraversalResult<T> {
  /** All nodes visited during traversal */
  nodes: QuadtreeNode<T>[];
  /** All objects found during traversal */
  objects: QuadtreeData<T>[];
  /** Total depth of traversal */
  maxDepth: number;
  /** Number of nodes visited */
  nodesVisited: number;
}

/**
 * Quadtree Collision Result
 *
 * Result of collision detection operations.
 *
 * @template T - The type of data in the quadtree
 */
export interface QuadtreeCollisionResult<T> {
  /** Pairs of colliding objects */
  collisions: Array<{
    object1: QuadtreeData<T>;
    object2: QuadtreeData<T>;
    distance?: number;
  }>;
  /** Number of collision checks performed */
  checksPerformed: number;
  /** Time taken for collision detection in milliseconds */
  detectionTime: number;
}

/**
 * Quadtree Nearest Neighbor Result
 *
 * Result of nearest neighbor queries.
 *
 * @template T - The type of data in the quadtree
 */
export interface QuadtreeNearestNeighborResult<T> {
  /** The nearest object found */
  nearest: QuadtreeData<T> | null;
  /** Distance to the nearest object */
  distance: number;
  /** Number of objects checked */
  objectsChecked: number;
  /** Time taken for the query in milliseconds */
  queryTime: number;
}

/**
 * Quadtree Performance Metrics
 *
 * Detailed performance metrics for the quadtree.
 */
export interface QuadtreePerformanceMetrics {
  /** Average insertion time in milliseconds */
  averageInsertTime: number;
  /** Average removal time in milliseconds */
  averageRemoveTime: number;
  /** Average query time in milliseconds */
  averageQueryTime: number;
  /** Average subdivision time in milliseconds */
  averageSubdivisionTime: number;
  /** Memory usage estimate in bytes */
  estimatedMemoryUsage: number;
  /** Query efficiency (objects found per node searched) */
  queryEfficiency: number;
}
