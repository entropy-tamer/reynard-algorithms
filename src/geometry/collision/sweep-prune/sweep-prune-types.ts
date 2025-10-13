/**
 * Sweep and Prune Collision Detection Types
 *
 * Comprehensive type definitions for the Sweep and Prune collision detection
 * algorithm. Sweep and Prune is a broad-phase collision detection algorithm
 * that sorts objects along coordinate axes and detects potential collisions
 * by finding overlapping intervals.
 *
 * @module algorithms/geometry/collision/sweep-prune
 */

/**
 * Represents a 2D axis-aligned bounding box
 */
export interface AABB {
  /** Minimum x coordinate */
  minX: number;
  /** Minimum y coordinate */
  minY: number;
  /** Maximum x coordinate */
  maxX: number;
  /** Maximum y coordinate */
  maxY: number;
  /** Unique identifier */
  id: string | number;
  /** Additional data */
  data?: any;
}

/**
 * Represents an endpoint of an AABB on a specific axis
 */
export interface Endpoint {
  /** The AABB this endpoint belongs to */
  aabb: AABB;
  /** Whether this is a start (min) or end (max) endpoint */
  isStart: boolean;
  /** The coordinate value on the axis */
  value: number;
  /** The axis this endpoint is on (0 = x, 1 = y) */
  axis: number;
}

/**
 * Represents a potential collision pair
 */
export interface CollisionPair {
  /** First AABB in the pair */
  aabb1: AABB;
  /** Second AABB in the pair */
  aabb2: AABB;
  /** Whether this pair is currently active (overlapping) */
  active: boolean;
  /** Last update timestamp */
  lastUpdate: number;
}

/**
 * Result of sweep and prune collision detection
 */
export interface SweepPruneResult {
  /** Array of collision pairs found */
  collisionPairs: CollisionPair[];
  /** Total number of AABBs processed */
  totalAABBs: number;
  /** Number of active collision pairs */
  activeCollisions: number;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Number of endpoints processed */
  endpointsProcessed: number;
  /** Number of axis sweeps performed */
  axisSweeps: number;
}

/**
 * Configuration options for Sweep and Prune algorithm
 */
export interface SweepPruneConfig {
  /** Tolerance for floating-point comparisons */
  epsilon: number;
  /** Whether to use insertion sort for small arrays */
  useInsertionSort: boolean;
  /** Threshold for switching to insertion sort */
  insertionSortThreshold: number;
  /** Whether to use temporal coherence optimization */
  useTemporalCoherence: boolean;
  /** Whether to use multi-axis optimization */
  useMultiAxisOptimization: boolean;
  /** Whether to enable incremental updates */
  enableIncrementalUpdates: boolean;
  /** Maximum number of AABBs to process */
  maxAABBs: number;
  /** Whether to use spatial partitioning for large datasets */
  useSpatialPartitioning: boolean;
  /** Spatial partitioning cell size */
  spatialCellSize: number;
}

/**
 * Statistics for Sweep and Prune algorithm performance
 */
export interface SweepPruneStats {
  /** Total number of collision detection operations */
  totalOperations: number;
  /** Total execution time */
  totalExecutionTime: number;
  /** Average execution time per operation */
  averageExecutionTime: number;
  /** Total number of AABBs processed */
  totalAABBsProcessed: number;
  /** Average number of AABBs per operation */
  averageAABBsPerOperation: number;
  /** Total number of collision pairs found */
  totalCollisionPairs: number;
  /** Average number of collision pairs per operation */
  averageCollisionPairsPerOperation: number;
  /** Cache hit rate (0-1) */
  cacheHitRate: number;
  /** Memory usage in bytes */
  memoryUsage: number;
}

/**
 * Event types for Sweep and Prune algorithm
 */
export enum SweepPruneEventType {
  COLLISION_DETECTION_STARTED = "collision_detection_started",
  COLLISION_DETECTION_COMPLETED = "collision_detection_completed",
  AABB_ADDED = "aabb_added",
  AABB_REMOVED = "aabb_removed",
  AABB_UPDATED = "aabb_updated",
  COLLISION_PAIR_FOUND = "collision_pair_found",
  COLLISION_PAIR_LOST = "collision_pair_lost",
  AXIS_SWEEP_STARTED = "axis_sweep_started",
  AXIS_SWEEP_COMPLETED = "axis_sweep_completed",
  SORTING_PERFORMED = "sorting_performed",
}

/**
 * Event data for Sweep and Prune algorithm events
 */
export interface SweepPruneEvent {
  /** Event type */
  type: SweepPruneEventType;
  /** Timestamp of the event */
  timestamp: number;
  /** Additional event data */
  data?: any;
}

/**
 * Event handler function type
 */
export type SweepPruneEventHandler = (event: SweepPruneEvent) => void;

/**
 * Options for Sweep and Prune algorithm initialization
 */
export interface SweepPruneOptions {
  /** Configuration settings */
  config: Partial<SweepPruneConfig>;
  /** Event handlers */
  eventHandlers?: SweepPruneEventHandler[];
  /** Whether to enable caching */
  enableCaching: boolean;
  /** Cache size limit */
  cacheSize: number;
  /** Whether to enable statistics collection */
  enableStats: boolean;
  /** Whether to enable debugging */
  enableDebug: boolean;
}

/**
 * Cache entry for Sweep and Prune results
 */
export interface SweepPruneCacheEntry {
  /** Hash of the AABB set */
  aabbHash: string;
  /** Cached collision pairs */
  collisionPairs: CollisionPair[];
  /** Timestamp when cached */
  timestamp: number;
  /** Number of times accessed */
  accessCount: number;
}

/**
 * Performance metrics for Sweep and Prune algorithm
 */
export interface SweepPrunePerformanceMetrics {
  /** Current memory usage */
  memoryUsage: number;
  /** Cache size */
  cacheSize: number;
  /** Cache hit rate */
  cacheHitRate: number;
  /** Average collision detection time */
  averageDetectionTime: number;
  /** Performance score (0-100) */
  performanceScore: number;
  /** Efficiency ratio (collisions found per AABB processed) */
  efficiencyRatio: number;
}

/**
 * Spatial partitioning cell for large datasets
 */
export interface SpatialCell {
  /** Cell boundaries */
  bounds: AABB;
  /** AABBs in this cell */
  aabbs: AABB[];
  /** Whether this cell is active */
  active: boolean;
}

/**
 * Incremental update information
 */
export interface IncrementalUpdate {
  /** AABB that was updated */
  aabb: AABB;
  /** Previous AABB bounds */
  previousBounds: AABB;
  /** Type of update */
  updateType: "add" | "remove" | "update";
  /** Timestamp of update */
  timestamp: number;
}

/**
 * Batch update result
 */
export interface BatchUpdateResult {
  /** Number of AABBs added */
  added: number;
  /** Number of AABBs removed */
  removed: number;
  /** Number of AABBs updated */
  updated: number;
  /** New collision pairs found */
  newCollisionPairs: CollisionPair[];
  /** Lost collision pairs */
  lostCollisionPairs: CollisionPair[];
  /** Execution time */
  executionTime: number;
}

/**
 * Sorting algorithm options
 */
export interface SortingOptions {
  /** Algorithm to use for sorting */
  algorithm: "insertion" | "quick" | "merge" | "tim" | "auto";
  /** Whether to use stable sorting */
  stable: boolean;
  /** Custom comparison function */
  compareFunction?: (a: Endpoint, b: Endpoint) => number;
}

/**
 * Axis sweep result
 */
export interface AxisSweepResult {
  /** Axis that was swept (0 = x, 1 = y) */
  axis: number;
  /** Number of endpoints processed */
  endpointsProcessed: number;
  /** Number of collision pairs found on this axis */
  collisionPairsFound: number;
  /** Execution time for this axis */
  executionTime: number;
  /** Whether this axis was the limiting factor */
  isLimiting: boolean;
}

/**
 * Multi-axis sweep result
 */
export interface MultiAxisSweepResult {
  /** Results for each axis */
  axisResults: AxisSweepResult[];
  /** Combined collision pairs from all axes */
  combinedCollisionPairs: CollisionPair[];
  /** Total execution time */
  totalExecutionTime: number;
  /** Most efficient axis */
  mostEfficientAxis: number;
}

/**
 * Default configuration for Sweep and Prune algorithm
 */
export const DEFAULT_SWEEP_PRUNE_CONFIG: SweepPruneConfig = {
  epsilon: 1e-10,
  useInsertionSort: true,
  insertionSortThreshold: 20,
  useTemporalCoherence: true,
  useMultiAxisOptimization: true,
  enableIncrementalUpdates: true,
  maxAABBs: 10000,
  useSpatialPartitioning: false,
  spatialCellSize: 100,
};

/**
 * Default options for Sweep and Prune algorithm
 */
export const DEFAULT_SWEEP_PRUNE_OPTIONS: SweepPruneOptions = {
  config: DEFAULT_SWEEP_PRUNE_CONFIG,
  enableCaching: true,
  cacheSize: 1000,
  enableStats: true,
  enableDebug: false,
};

/**
 * Common AABB shapes for testing
 */
export const COMMON_AABBS = {
  /** Unit square at origin */
  UNIT_SQUARE: {
    minX: 0,
    minY: 0,
    maxX: 1,
    maxY: 1,
    id: "unit-square",
  } as AABB,

  /** Unit square offset by (1, 1) */
  OFFSET_SQUARE: {
    minX: 1,
    minY: 1,
    maxX: 2,
    maxY: 2,
    id: "offset-square",
  } as AABB,

  /** Large square covering multiple units */
  LARGE_SQUARE: {
    minX: 0,
    minY: 0,
    maxX: 5,
    maxY: 5,
    id: "large-square",
  } as AABB,

  /** Thin rectangle */
  THIN_RECTANGLE: {
    minX: 0,
    minY: 0,
    maxX: 10,
    maxY: 1,
    id: "thin-rectangle",
  } as AABB,

  /** Tall rectangle */
  TALL_RECTANGLE: {
    minX: 0,
    minY: 0,
    maxX: 1,
    maxY: 10,
    id: "tall-rectangle",
  } as AABB,
};
