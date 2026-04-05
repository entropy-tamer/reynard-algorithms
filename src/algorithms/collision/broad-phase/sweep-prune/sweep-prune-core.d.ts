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
import type { AABB, CollisionPair, SweepPruneResult, SweepPruneConfig, SweepPruneStats, SweepPruneEventHandler, SweepPruneOptions, SweepPrunePerformanceMetrics } from "./sweep-prune-types";
/**
 * Sweep and Prune Collision Detection Implementation
 *
 * Provides efficient broad-phase collision detection using the sweep and prune
 * algorithm with optimizations including temporal coherence, multi-axis optimization,
 * and spatial partitioning for large datasets.
 */
export declare class SweepPrune {
    private config;
    private eventHandlers;
    private cache;
    private stats;
    private enableCaching;
    private enableStats;
    private enableDebug;
    private cacheSize;
    private aabbs;
    private activeCollisionPairs;
    private spatialCells;
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
    constructor(options?: Partial<SweepPruneOptions>);
    /**
     * Adds an AABB to the collision detection system.
     *
     * @param aabb The AABB to add
     * @example
     * ```typescript
     * detector.addAABB({ id: 1, minX: 0, minY: 0, maxX: 10, maxY: 10 });
     * ```
     */
    addAABB(aabb: AABB): void;
    /**
     * Removes an AABB from the collision detection system.
     *
     * @param aabbId The ID of the AABB to remove
     * @example
     * ```typescript
     * detector.removeAABB(1);
     * ```
     */
    removeAABB(aabbId: string | number): void;
    /**
     * Updates an existing AABB in the collision detection system.
     *
     * @param aabb The updated AABB
     * @example
     * ```typescript
     * detector.updateAABB({ id: 1, minX: 5, minY: 5, maxX: 15, maxY: 15 });
     * ```
     */
    updateAABB(aabb: AABB): void;
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
    detectCollisions(aabbs?: AABB[]): SweepPruneResult;
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
    private getAABBManager;
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
    private getDetectionManager;
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
    private emitEvent;
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
    private getAPI;
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
    addEventHandler(handler: SweepPruneEventHandler): void;
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
    removeEventHandler(handler: SweepPruneEventHandler): void;
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
    getStats(): SweepPruneStats;
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
    getPerformanceMetrics(): SweepPrunePerformanceMetrics;
    /**
     * Clears the collision detection cache.
     * @example
     * ```typescript
     * detector.clearCache();
     * // Cache is now empty, next detection will rebuild it
     * ```
     */
    clearCache(): void;
    /**
     * Resets all collision detection statistics.
     * @example
     * ```typescript
     * detector.resetStats();
     * // All statistics counters are now reset to zero
     * ```
     */
    resetStats(): void;
    /**
     * Updates the collision detection configuration.
     *
     * @param newConfig Partial configuration object with new settings
     * @example
     * ```typescript
     * detector.updateConfig({ enableCaching: true, cacheSize: 1000 });
     * ```
     */
    updateConfig(newConfig: Partial<SweepPruneConfig>): void;
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
    getAllAABBs(): AABB[];
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
    getActiveCollisionPairs(): CollisionPair[];
    /**
     * Clears all AABBs, collision pairs, and resets the system.
     * @example
     * ```typescript
     * detector.clear();
     * // System is now empty and ready for new AABBs
     * ```
     */
    clear(): void;
}
//# sourceMappingURL=sweep-prune-core.d.ts.map