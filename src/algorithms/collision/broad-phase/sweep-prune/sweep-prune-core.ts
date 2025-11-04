/**
 * @file Sweep and Prune Collision Detection Core Implementation
 *
 * Implementation of the Sweep and Prune algorithm for broad-phase collision
 * detection. This algorithm sorts objects along coordinate axes and detects
 * potential collisions by finding overlapping intervals.
 *
 * Mathematical Theory:
 * Sweep and Prune works by:
 * 1. Creating endpoints for each AABB on each axis (min and max coordinates)
 * 2. Sorting endpoints along each axis
 * 3. Sweeping through sorted endpoints, maintaining active set
 * 4. Detecting collisions when AABBs are both active on all axes
 *
 * Time Complexity:
 * - Sorting: O(n log n) per axis
 * - Sweeping: O(n + k) where k is number of collisions
 * - Overall: O(n log n + k) for 2D
 *
 * Space Complexity: O(n) for storing endpoints and active sets
 *
 * @module algorithms/geometry/collision/sweep-prune
 */

import type {
  AABB,
  CollisionPair,
  SweepPruneResult,
  SweepPruneConfig,
  SweepPruneStats,
  SweepPruneEventHandler,
  SweepPruneOptions,
  SweepPrunePerformanceMetrics,
  SpatialCell,
  SweepPruneCacheEntry,
} from "./sweep-prune-types";
import { SweepPruneEventType, DEFAULT_SWEEP_PRUNE_CONFIG, DEFAULT_SWEEP_PRUNE_OPTIONS } from "./sweep-prune-types";
import { performSingleAxisSweepPrune } from "./sweep-prune-algorithms";
import { emitEvent } from "./sweep-prune-events";
import { resetStats } from "./sweep-prune-stats";
import { detectCollisions as detectCollisionsUtil, type DetectionManager } from "./sweep-prune-detection";
import { addAABB as addAABBUtil, removeAABB as removeAABBUtil, updateAABB as updateAABBUtil, type AABBManager } from "./sweep-prune-aabb";
import {
  getStats as getStatsAPI,
  getPerformanceMetricsFromAPI,
  clearCache as clearCacheAPI,
  resetStatsAPI,
  updateConfigAPI,
  getAllAABBs as getAllAABBsAPI,
  getActiveCollisionPairs as getActiveCollisionPairsAPI,
  clearAll,
  addEventHandler as addEventHandlerAPI,
  removeEventHandler as removeEventHandlerAPI,
  type SweepPruneAPI,
} from "./sweep-prune-api";

/**
 * Sweep and Prune Collision Detection Implementation
 *
 * Provides efficient broad-phase collision detection using the sweep and prune
 * algorithm with optimizations including temporal coherence, multi-axis optimization,
 * and spatial partitioning for large datasets.
 */
export class SweepPrune {
  private config: SweepPruneConfig;
  private eventHandlers: SweepPruneEventHandler[];
  private cache: Map<string, SweepPruneCacheEntry>;
  private stats: SweepPruneStats;
  private enableCaching: boolean;
  private enableStats: boolean;
  private enableDebug: boolean;
  private cacheSize: number;
  private aabbs: Map<string | number, AABB>;
  private activeCollisionPairs: Map<string, CollisionPair>;
  private spatialCells: Map<string, SpatialCell>;

  /**
   * Creates a new SweepPrune instance for collision detection.
   *
   * @param options Configuration options for the sweep and prune algorithm
   * @example
   * ```typescript
   * const detector = new SweepPrune({
   *   enableCaching: true,
   *   enableStats: true,
   * });
   * ```
   */
  constructor(options: Partial<SweepPruneOptions> = {}) {
    const opts = { ...DEFAULT_SWEEP_PRUNE_OPTIONS, ...options };
    this.config = { ...DEFAULT_SWEEP_PRUNE_CONFIG, ...opts.config };
    this.eventHandlers = opts.eventHandlers || [];
    this.enableCaching = opts.enableCaching ?? true;
    this.enableStats = opts.enableStats ?? true;
    this.enableDebug = opts.enableDebug ?? false;
    this.cacheSize = opts.cacheSize ?? 1000;
    this.cache = new Map();
    this.aabbs = new Map();
    this.activeCollisionPairs = new Map();
    this.spatialCells = new Map();
    this.stats = resetStats();
  }

  /**
   * Adds an AABB to the collision detection system.
   *
   * @param aabb The AABB to add
   * @example
   * ```typescript
   * detector.addAABB({ id: 1, minX: 0, minY: 0, maxX: 10, maxY: 10 });
   * ```
   */
  addAABB(aabb: AABB): void {
    addAABBUtil(aabb, this.getAABBManager());
  }

  /**
   * Removes an AABB from the collision detection system.
   *
   * @param aabbId The ID of the AABB to remove
   * @example
   * ```typescript
   * detector.removeAABB(1);
   * ```
   */
  removeAABB(aabbId: string | number): void {
    removeAABBUtil(aabbId, this.getAABBManager());
  }

  /**
   * Updates an existing AABB in the collision detection system.
   *
   * @param aabb The updated AABB
   * @example
   * ```typescript
   * detector.updateAABB({ id: 1, minX: 5, minY: 5, maxX: 15, maxY: 15 });
   * ```
   */
  updateAABB(aabb: AABB): void {
    updateAABBUtil(aabb, this.getAABBManager());
  }

  /**
   * Detects collisions between AABBs in the system.
   *
   * @param aabbs Optional array of AABBs to test. If not provided, uses all AABBs in the system.
   * @returns Collision detection result containing collision pairs and statistics
   * @example
   * ```typescript
   * const result = detector.detectCollisions();
   * console.log(result.collisionPairs);
   * ```
   */
  detectCollisions(aabbs?: AABB[]): SweepPruneResult {
    return detectCollisionsUtil(aabbs, this.getDetectionManager());
  }

  /**
   * Gets the AABB manager instance for internal use.
   *
   * @returns AABB manager with AABB management utilities
   * @example
   * ```typescript
   * const manager = this.getAABBManager();
   * // Used internally for AABB operations
   * ```
   */
  private getAABBManager(): AABBManager {
    return {
      aabbs: this.aabbs,
      config: this.config,
      emitEvent: (type, data) => this.emitEvent(type, data),
      performIncrementalUpdate: () => {},
    };
  }

  /**
   * Gets the detection manager instance for internal use.
   *
   * @returns Detection manager with collision detection utilities
   * @example
   * ```typescript
   * const manager = this.getDetectionManager();
   * // Used internally for collision detection operations
   * ```
   */
  private getDetectionManager(): DetectionManager {
    return {
      enableCaching: this.enableCaching,
      enableStats: this.enableStats,
      cacheSize: this.cacheSize,
      cache: this.cache,
      stats: this.stats,
      aabbs: this.aabbs,
      activeCollisionPairs: this.activeCollisionPairs,
      createContext: () => ({
        config: this.config,
        activeCollisionPairs: this.activeCollisionPairs,
        emitEvent: (type, data) => this.emitEvent(type, data),
        performSingleAxisSweepPrune: (aabbs: AABB[]) =>
          performSingleAxisSweepPrune(aabbs, this.getDetectionManager().createContext()),
      }),
      emitEvent: (type, data) => this.emitEvent(type, data),
    };
  }

  /**
   * Emits an event to all registered event handlers.
   *
   * @param type The type of event to emit
   * @param data Optional event data
   * @example
   * ```typescript
   * this.emitEvent('collision-detected', { pair: [1, 2] });
   * ```
   */
  private emitEvent(type: SweepPruneEventType, data?: unknown): void {
    emitEvent(type, data, this.eventHandlers, this.enableDebug);
  }

  /**
   * Gets the internal API object for utility functions.
   *
   * @returns SweepPrune API object with internal state
   * @example
   * ```typescript
   * const api = this.getAPI();
   * // Used internally for API-based operations
   * ```
   */
  private getAPI(): SweepPruneAPI {
    return {
      stats: this.stats,
      cache: this.cache,
      aabbs: this.aabbs,
      activeCollisionPairs: this.activeCollisionPairs,
      eventHandlers: this.eventHandlers,
      config: this.config,
    };
  }

  /**
   * Adds an event handler to receive collision detection events.
   *
   * @param handler The event handler function to add
   * @example
   * ```typescript
   * detector.addEventHandler((type, data) => {
   *   console.log('Collision event:', type, data);
   * });
   * ```
   */
  addEventHandler(handler: SweepPruneEventHandler): void {
    addEventHandlerAPI(handler, this.getAPI());
  }

  /**
   * Removes an event handler from the collision detection system.
   *
   * @param handler The event handler function to remove
   * @example
   * ```typescript
   * const handler = (type, data) => console.log(type, data);
   * detector.addEventHandler(handler);
   * detector.removeEventHandler(handler);
   * ```
   */
  removeEventHandler(handler: SweepPruneEventHandler): void {
    removeEventHandlerAPI(handler, this.getAPI());
  }

  /**
   * Gets current collision detection statistics.
   *
   * @returns Current statistics including collision counts and performance metrics
   * @example
   * ```typescript
   * const stats = detector.getStats();
   * console.log(stats.totalCollisions, stats.collisionPairs);
   * ```
   */
  getStats(): SweepPruneStats {
    return getStatsAPI(this.getAPI());
  }

  /**
   * Gets detailed performance metrics for collision detection.
   *
   * @returns Performance metrics including execution times and optimization statistics
   * @example
   * ```typescript
   * const metrics = detector.getPerformanceMetrics();
   * console.log(metrics.averageDetectionTime, metrics.cacheHitRate);
   * ```
   */
  getPerformanceMetrics(): SweepPrunePerformanceMetrics {
    return getPerformanceMetricsFromAPI(this.getAPI());
  }

  /**
   * Clears the collision detection cache.
   * @example
   * ```typescript
   * detector.clearCache();
   * // Cache is now empty, next detection will rebuild it
   * ```
   */
  clearCache(): void {
    clearCacheAPI(this.getAPI());
  }

  /**
   * Resets all collision detection statistics.
   * @example
   * ```typescript
   * detector.resetStats();
   * // All statistics counters are now reset to zero
   * ```
   */
  resetStats(): void {
    resetStatsAPI(this.getAPI());
  }

  /**
   * Updates the collision detection configuration.
   *
   * @param newConfig Partial configuration object with new settings
   * @example
   * ```typescript
   * detector.updateConfig({ enableCaching: true, cacheSize: 1000 });
   * ```
   */
  updateConfig(newConfig: Partial<SweepPruneConfig>): void {
    updateConfigAPI(newConfig, this.getAPI());
  }

  /**
   * Gets all AABBs currently in the collision detection system.
   *
   * @returns Array of all AABBs
   * @example
   * ```typescript
   * const aabbs = detector.getAllAABBs();
   * console.log(`Tracking ${aabbs.length} AABBs`);
   * ```
   */
  getAllAABBs(): AABB[] {
    return getAllAABBsAPI(this.getAPI());
  }

  /**
   * Gets all currently active collision pairs.
   *
   * @returns Array of active collision pairs
   * @example
   * ```typescript
   * const pairs = detector.getActiveCollisionPairs();
   * console.log(`${pairs.length} objects are currently colliding`);
   * ```
   */
  getActiveCollisionPairs(): CollisionPair[] {
    return getActiveCollisionPairsAPI(this.getAPI());
  }

  /**
   * Clears all AABBs, collision pairs, and resets the system.
   * @example
   * ```typescript
   * detector.clear();
   * // System is now empty and ready for new AABBs
   * ```
   */
  clear(): void {
    clearAll({ ...this.getAPI(), spatialCells: this.spatialCells });
  }
}
