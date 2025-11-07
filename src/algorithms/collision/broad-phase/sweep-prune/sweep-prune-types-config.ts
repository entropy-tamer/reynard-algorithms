/**
 * Sweep and Prune Configuration Types
 *
 * Configuration, options, statistics, and event types.
 *
 * @module algorithms/geometry/collision/sweep-prune
 */

import type { AABB, CollisionPair } from "./sweep-prune-types-core";

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

/** Event handler function type */
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
