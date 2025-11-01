/**
 * @module algorithms/data-structures/segment-tree/types
 * @description Defines the types and interfaces for the Segment Tree data structure.
 */

/**
 * Aggregation function type for Segment Tree operations.
 */
export type AggregationFunction<T> = (a: T, b: T) => T;

/**
 * Update function type for Segment Tree range updates.
 */
export type UpdateFunction<T> = (current: T, update: T) => T;

/**
 * Configuration options for the Segment Tree.
 */
export interface SegmentTreeConfig<T> {
  /**
   * The aggregation function to use (e.g., sum, min, max).
   * @default (a, b) => a + b (sum)
   */
  aggregationFunction?: AggregationFunction<T>;
  /**
   * The identity element for the aggregation function.
   * @default 0
   */
  identityElement?: T;
  /**
   * Whether to enable lazy propagation for range updates.
   * @default true
   */
  enableLazyPropagation?: boolean;
  /**
   * The update function for lazy propagation.
   * @default (current, update) => current + update
   */
  updateFunction?: UpdateFunction<T>;
  /**
   * Whether to enable range updates.
   * @default true
   */
  enableRangeUpdates?: boolean;
  /**
   * Whether to enable point updates.
   * @default true
   */
  enablePointUpdates?: boolean;
  /**
   * Whether to enable range queries.
   * @default true
   */
  enableRangeQueries?: boolean;
  /**
   * Whether to enable point queries.
   * @default true
   */
  enablePointQueries?: boolean;
  /**
   * Maximum number of elements to store.
   * @default Infinity
   */
  maxElements?: number;
}

/**
 * Result of a Segment Tree query operation.
 */
export interface SegmentTreeQueryResult<T> {
  /**
   * The result of the query.
   */
  result: T;
  /**
   * Time taken for the query in milliseconds.
   */
  executionTime: number;
  /**
   * Number of nodes visited during the query.
   */
  nodesVisited: number;
  /**
   * The range that was queried.
   */
  range: { start: number; end: number };
}

/**
 * Result of a Segment Tree update operation.
 */
export interface SegmentTreeUpdateResult {
  /**
   * Whether the update was successful.
   */
  success: boolean;
  /**
   * Time taken for the update in milliseconds.
   */
  executionTime: number;
  /**
   * Number of nodes updated.
   */
  nodesUpdated: number;
  /**
   * The range that was updated.
   */
  range: { start: number; end: number };
  /**
   * Additional metadata about the update.
   */
  metadata?: any;
}

/**
 * Statistics about the Segment Tree.
 */
export interface SegmentTreeStats {
  /**
   * Total number of elements in the tree.
   */
  totalElements: number;
  /**
   * Total number of nodes in the tree.
   */
  totalNodes: number;
  /**
   * Height of the tree.
   */
  height: number;
  /**
   * Number of query operations performed.
   */
  totalQueries: number;
  /**
   * Number of update operations performed.
   */
  totalUpdates: number;
  /**
   * Number of point updates performed.
   */
  pointUpdates: number;
  /**
   * Number of range updates performed.
   */
  rangeUpdates: number;
  /**
   * Average query time in milliseconds.
   */
  averageQueryTime: number;
  /**
   * Average update time in milliseconds.
   */
  averageUpdateTime: number;
  /**
   * Memory usage in bytes.
   */
  memoryUsage: number;
}

/**
 * Performance metrics for the Segment Tree.
 */
export interface SegmentTreePerformanceMetrics {
  /**
   * Memory usage in bytes.
   */
  memoryUsage: number;
  /**
   * Average query time in milliseconds.
   */
  averageQueryTime: number;
  /**
   * Average update time in milliseconds.
   */
  averageUpdateTime: number;
  /**
   * Performance score (0-100).
   */
  performanceScore: number;
  /**
   * Query efficiency ratio.
   */
  queryEfficiency: number;
  /**
   * Update efficiency ratio.
   */
  updateEfficiency: number;
}

/**
 * Options for Segment Tree operations.
 */
export interface SegmentTreeOptions<T> {
  /**
   * Configuration for the Segment Tree.
   */
  config?: Partial<SegmentTreeConfig<T>>;
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
  /**
   * Initial array to build the tree from.
   */
  initialArray?: T[];
  /**
   * Event handlers for monitoring operations.
   */
  eventHandlers?: SegmentTreeEventHandler[];
}

/**
 * Event types for Segment Tree operations.
 */
export enum SegmentTreeEventType {
  ELEMENT_UPDATED = "element_updated",
  RANGE_UPDATED = "range_updated",
  QUERY_PERFORMED = "query_performed",
  TREE_BUILT = "tree_built",
  TREE_CLEARED = "tree_cleared",
}

/**
 * Event data for Segment Tree operations.
 */
export interface SegmentTreeEvent {
  type: SegmentTreeEventType;
  timestamp: number;
  data?: any;
}

/**
 * Event handler function type.
 */
export type SegmentTreeEventHandler = (event: SegmentTreeEvent) => void;

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
  results: boolean[];
}

/**
 * Serialization format for the Segment Tree.
 */
export interface SegmentTreeSerialization<T> {
  /**
   * Version of the serialization format.
   */
  version: string;
  /**
   * Configuration of the tree.
   */
  config: SegmentTreeConfig<T>;
  /**
   * Serialized tree data.
   */
  data: T[];
  /**
   * Metadata about the tree.
   */
  metadata: {
    totalElements: number;
    totalNodes: number;
    height: number;
    createdAt: number;
  };
}

/**
 * Node in the Segment Tree.
 */
export interface SegmentTreeNode<T> {
  /**
   * The value stored in this node.
   */
  value: T;
  /**
   * The range this node represents.
   */
  range: { start: number; end: number };
  /**
   * Left child node.
   */
  left?: SegmentTreeNode<T>;
  /**
   * Right child node.
   */
  right?: SegmentTreeNode<T>;
  /**
   * Lazy propagation value for range updates.
   */
  lazyValue?: T;
  /**
   * Whether this node has pending lazy updates.
   */
  hasLazyUpdate?: boolean;
}

/**
 * Traversal order options.
 */
export enum TraversalOrder {
  IN_ORDER = "in_order",
  PRE_ORDER = "pre_order",
  POST_ORDER = "post_order",
  LEVEL_ORDER = "level_order",
}

/**
 * Options for tree traversal.
 */
export interface TraversalOptions {
  /**
   * Order of traversal.
   * @default TraversalOrder.IN_ORDER
   */
  order?: TraversalOrder;
  /**
   * Maximum depth to traverse.
   * @default Infinity
   */
  maxDepth?: number;
  /**
   * Whether to include node metadata.
   * @default false
   */
  includeMetadata?: boolean;
}

/**
 * Result of a tree traversal.
 */
export interface TraversalResult<T> {
  /**
   * Array of values in traversal order.
   */
  values: T[];
  /**
   * Number of nodes visited.
   */
  nodesVisited: number;
  /**
   * Time taken for the traversal in milliseconds.
   */
  executionTime: number;
}

/**
 * Default configuration for the Segment Tree.
 */
export const DEFAULT_SEGMENT_TREE_CONFIG: SegmentTreeConfig<number> = {
  aggregationFunction: (a: number, b: number) => a + b,
  identityElement: 0,
  enableLazyPropagation: true,
  updateFunction: (current: number, update: number) => current + update,
  enableRangeUpdates: true,
  enablePointUpdates: true,
  enableRangeQueries: true,
  enablePointQueries: true,
  maxElements: Infinity,
};

/**
 * Default options for the Segment Tree.
 */
export const DEFAULT_SEGMENT_TREE_OPTIONS: SegmentTreeOptions<number> = {
  config: DEFAULT_SEGMENT_TREE_CONFIG,
  enableStats: false,
  enableDebug: false,
  initialArray: [],
};
