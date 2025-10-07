/**
 * @module algorithms/data-structures/interval-tree/types
 * @description Defines the types and interfaces for the Interval Tree data structure.
 */

/**
 * Represents an interval with start and end points.
 */
export interface Interval {
  start: number;
  end: number;
  data?: any; // Optional data associated with the interval
}

/**
 * Represents a node in the interval tree.
 */
export interface IntervalTreeNode {
  interval: Interval;
  max: number; // Maximum end point in the subtree rooted at this node
  left: IntervalTreeNode | null;
  right: IntervalTreeNode | null;
  height: number; // For AVL balancing
  size: number; // Number of intervals in subtree
}

/**
 * Configuration options for the interval tree.
 */
export interface IntervalTreeConfig {
  /**
   * Whether to allow overlapping intervals.
   * @default true
   */
  allowOverlaps?: boolean;
  /**
   * Whether to maintain the tree in sorted order.
   * @default true
   */
  maintainSorted?: boolean;
  /**
   * Whether to enable duplicate intervals.
   * @default true
   */
  allowDuplicates?: boolean;
  /**
   * Whether to use AVL balancing for optimal performance.
   * @default true
   */
  useAVLBalancing?: boolean;
  /**
   * Maximum number of intervals to store.
   * @default Infinity
   */
  maxIntervals?: number;
}

/**
 * Result of an interval search operation.
 */
export interface IntervalSearchResult {
  /**
   * Array of intervals that match the search criteria.
   */
  intervals: Interval[];
  /**
   * Number of intervals found.
   */
  count: number;
  /**
   * Time taken for the search operation in milliseconds.
   */
  executionTime: number;
  /**
   * Number of nodes visited during the search.
   */
  nodesVisited: number;
}

/**
 * Result of an interval overlap check.
 */
export interface IntervalOverlapResult {
  /**
   * Whether the intervals overlap.
   */
  overlaps: boolean;
  /**
   * The overlapping interval if found.
   */
  overlappingInterval?: Interval;
  /**
   * Time taken for the overlap check in milliseconds.
   */
  executionTime: number;
}

/**
 * Result of an interval tree traversal.
 */
export interface IntervalTreeTraversalResult {
  /**
   * Array of intervals in traversal order.
   */
  intervals: Interval[];
  /**
   * Number of intervals visited.
   */
  count: number;
  /**
   * Time taken for the traversal in milliseconds.
   */
  executionTime: number;
  /**
   * Number of nodes visited.
   */
  nodesVisited: number;
}

/**
 * Statistics about the interval tree.
 */
export interface IntervalTreeStats {
  /**
   * Total number of intervals in the tree.
   */
  totalIntervals: number;
  /**
   * Total number of nodes in the tree.
   */
  totalNodes: number;
  /**
   * Height of the tree.
   */
  height: number;
  /**
   * Average interval length.
   */
  averageIntervalLength: number;
  /**
   * Number of search operations performed.
   */
  totalSearches: number;
  /**
   * Number of insert operations performed.
   */
  totalInserts: number;
  /**
   * Number of delete operations performed.
   */
  totalDeletes: number;
  /**
   * Average search time in milliseconds.
   */
  averageSearchTime: number;
  /**
   * Memory usage in bytes.
   */
  memoryUsage: number;
}

/**
 * Performance metrics for the interval tree.
 */
export interface IntervalTreePerformanceMetrics {
  /**
   * Memory usage in bytes.
   */
  memoryUsage: number;
  /**
   * Average search time in milliseconds.
   */
  averageSearchTime: number;
  /**
   * Average insert time in milliseconds.
   */
  averageInsertTime: number;
  /**
   * Average delete time in milliseconds.
   */
  averageDeleteTime: number;
  /**
   * Performance score (0-100).
   */
  performanceScore: number;
  /**
   * Tree balance factor.
   */
  balanceFactor: number;
}

/**
 * Options for interval tree operations.
 */
export interface IntervalTreeOptions {
  /**
   * Configuration for the interval tree.
   */
  config?: Partial<IntervalTreeConfig>;
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
   * Initial intervals to insert.
   */
  initialIntervals?: Interval[];
  /**
   * Event handlers for monitoring operations.
   */
  eventHandlers?: IntervalTreeEventHandler[];
}

/**
 * Event types for interval tree operations.
 */
export enum IntervalTreeEventType {
  INTERVAL_INSERTED = 'interval_inserted',
  INTERVAL_DELETED = 'interval_deleted',
  INTERVAL_SEARCHED = 'interval_searched',
  TREE_REBALANCED = 'tree_rebalanced',
  TREE_CLEARED = 'tree_cleared',
}

/**
 * Event data for interval tree operations.
 */
export interface IntervalTreeEvent {
  type: IntervalTreeEventType;
  timestamp: number;
  data?: any;
}

/**
 * Event handler function type.
 */
export type IntervalTreeEventHandler = (event: IntervalTreeEvent) => void;

/**
 * Traversal order options.
 */
export enum TraversalOrder {
  IN_ORDER = 'in_order',
  PRE_ORDER = 'pre_order',
  POST_ORDER = 'post_order',
  LEVEL_ORDER = 'level_order',
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
  results: boolean[];
}

/**
 * Serialization format for the interval tree.
 */
export interface IntervalTreeSerialization {
  /**
   * Version of the serialization format.
   */
  version: string;
  /**
   * Configuration of the tree.
   */
  config: IntervalTreeConfig;
  /**
   * Serialized tree data.
   */
  data: any;
  /**
   * Metadata about the tree.
   */
  metadata: {
    totalIntervals: number;
    totalNodes: number;
    height: number;
    createdAt: number;
  };
}

/**
 * Default configuration for the interval tree.
 */
export const DEFAULT_INTERVAL_TREE_CONFIG: IntervalTreeConfig = {
  allowOverlaps: true,
  maintainSorted: true,
  allowDuplicates: true,
  useAVLBalancing: true,
  maxIntervals: Infinity,
};

/**
 * Default options for the interval tree.
 */
export const DEFAULT_INTERVAL_TREE_OPTIONS: IntervalTreeOptions = {
  config: DEFAULT_INTERVAL_TREE_CONFIG,
  enableStats: false,
  enableDebug: false,
  initialIntervals: [],
};
