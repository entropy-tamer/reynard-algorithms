/**
 * @module algorithms/data-structures/fenwick-tree/types
 * @description Defines the types and interfaces for the Fenwick Tree (Binary Indexed Tree) data structure.
 */

/**
 * Configuration options for the Fenwick Tree.
 */
export interface FenwickTreeConfig {
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
  /**
   * Whether to use 1-based indexing.
   * @default true
   */
  useOneBasedIndexing?: boolean;
}

/**
 * Result of a Fenwick Tree query operation.
 */
export interface FenwickTreeQueryResult {
  /**
   * The result of the query.
   */
  result: number;
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
 * Result of a Fenwick Tree update operation.
 */
export interface FenwickTreeUpdateResult {
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
   * The index that was updated.
   */
  index: number;
  /**
   * Additional metadata about the update.
   */
  metadata?: any;
}

/**
 * Result of a Fenwick Tree range update operation.
 */
export interface FenwickTreeRangeUpdateResult {
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
 * Statistics about the Fenwick Tree.
 */
export interface FenwickTreeStats {
  /**
   * Total number of elements in the tree.
   */
  totalElements: number;
  /**
   * Total number of nodes in the tree.
   */
  totalNodes: number;
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
 * Performance metrics for the Fenwick Tree.
 */
export interface FenwickTreePerformanceMetrics {
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
 * Options for Fenwick Tree operations.
 */
export interface FenwickTreeOptions {
  /**
   * Configuration for the Fenwick Tree.
   */
  config?: Partial<FenwickTreeConfig>;
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
  initialArray?: number[];
  /**
   * Event handlers for monitoring operations.
   */
  eventHandlers?: FenwickTreeEventHandler[];
}

/**
 * Event types for Fenwick Tree operations.
 */
export enum FenwickTreeEventType {
  ELEMENT_UPDATED = 'element_updated',
  RANGE_UPDATED = 'range_updated',
  QUERY_PERFORMED = 'query_performed',
  TREE_BUILT = 'tree_built',
  TREE_CLEARED = 'tree_cleared',
}

/**
 * Event data for Fenwick Tree operations.
 */
export interface FenwickTreeEvent {
  type: FenwickTreeEventType;
  timestamp: number;
  data?: any;
}

/**
 * Event handler function type.
 */
export type FenwickTreeEventHandler = (event: FenwickTreeEvent) => void;

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
 * Serialization format for the Fenwick Tree.
 */
export interface FenwickTreeSerialization {
  /**
   * Version of the serialization format.
   */
  version: string;
  /**
   * Configuration of the tree.
   */
  config: FenwickTreeConfig;
  /**
   * Serialized tree data.
   */
  data: number[];
  /**
   * Metadata about the tree.
   */
  metadata: {
    totalElements: number;
    totalNodes: number;
    createdAt: number;
  };
}

/**
 * Default configuration for the Fenwick Tree.
 */
export const DEFAULT_FENWICK_TREE_CONFIG: FenwickTreeConfig = {
  enableRangeUpdates: true,
  enablePointUpdates: true,
  enableRangeQueries: true,
  enablePointQueries: true,
  maxElements: Infinity,
  useOneBasedIndexing: true,
};

/**
 * Default options for the Fenwick Tree.
 */
export const DEFAULT_FENWICK_TREE_OPTIONS: FenwickTreeOptions = {
  config: DEFAULT_FENWICK_TREE_CONFIG,
  enableStats: false,
  enableDebug: false,
  initialArray: [],
};

