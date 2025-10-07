/**
 * @module algorithms/spatial-structures/rtree/types
 * @description Defines the types and interfaces for the R-Tree spatial data structure.
 */

/**
 * Represents a 2D point.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Represents a 2D rectangle (bounding box).
 */
export interface Rectangle {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Represents an entry in the R-Tree (either a leaf entry with data or an internal entry with children).
 */
export interface RTreeEntry<T = any> {
  id: string | number;
  bounds: Rectangle;
  data?: T; // Only present in leaf entries
}

/**
 * Represents a node in the R-Tree.
 */
export interface RTreeNode<T = any> {
  bounds: Rectangle;
  entries: RTreeEntry<T>[];
  isLeaf: boolean;
  parent?: RTreeNode<T>;
}

/**
 * Configuration options for the R-Tree.
 */
export interface RTreeConfig {
  /**
   * Minimum number of entries per node (except root).
   * @default 2
   */
  minEntries?: number;
  /**
   * Maximum number of entries per node.
   * @default 8
   */
  maxEntries?: number;
  /**
   * Whether to reinsert entries during overflow (R*-tree behavior).
   * @default true
   */
  reinsertOnOverflow?: boolean;
  /**
   * Whether to use quadratic split algorithm (true) or linear split (false).
   * @default true
   */
  useQuadraticSplit?: boolean;
}

/**
 * Statistics about the R-Tree structure and operations.
 */
export interface RTreeStats {
  /**
   * Total number of entries in the tree.
   */
  entryCount: number;
  /**
   * Total number of nodes in the tree.
   */
  nodeCount: number;
  /**
   * Height of the tree (number of levels).
   */
  height: number;
  /**
   * Average number of entries per node.
   */
  averageEntriesPerNode: number;
  /**
   * Storage utilization (percentage of max capacity used).
   */
  storageUtilization: number;
}

/**
 * The result of a spatial query operation.
 */
export interface RTreeQueryResult<T = any> {
  /**
   * Array of entries that match the query criteria.
   */
  entries: RTreeEntry<T>[];
  /**
   * Number of nodes visited during the query.
   */
  nodesVisited: number;
  /**
   * Time taken for the query in milliseconds.
   */
  executionTime: number;
}

/**
 * Options for spatial queries.
 */
export interface RTreeQueryOptions {
  /**
   * Maximum number of results to return (0 = no limit).
   * @default 0
   */
  limit?: number;
  /**
   * Whether to include entries that only touch the query bounds.
   * @default false
   */
  includeTouching?: boolean;
}

/**
 * The result of an insertion operation.
 */
export interface RTreeInsertResult {
  /**
   * Whether the insertion was successful.
   */
  success: boolean;
  /**
   * Number of nodes created during insertion.
   */
  nodesCreated: number;
  /**
   * Number of nodes split during insertion.
   */
  nodesSplit: number;
  /**
   * Time taken for the insertion in milliseconds.
   */
  executionTime: number;
  /**
   * Error message if insertion failed.
   */
  error?: string;
}

/**
 * The result of a deletion operation.
 */
export interface RTreeDeleteResult {
  /**
   * Whether the deletion was successful.
   */
  success: boolean;
  /**
   * Number of entries deleted.
   */
  entriesDeleted: number;
  /**
   * Number of nodes removed during deletion.
   */
  nodesRemoved: number;
  /**
   * Time taken for the deletion in milliseconds.
   */
  executionTime: number;
  /**
   * Error message if deletion failed.
   */
  error?: string;
}
