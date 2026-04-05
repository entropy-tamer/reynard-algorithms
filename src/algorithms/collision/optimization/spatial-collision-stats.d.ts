/**
 * Spatial Collision Statistics and Configuration
 *
 * Statistics tracking and configuration management
 * for the spatial collision optimizer.
 *
 * @module algorithms/geometry/collision/optimization/spatialCollisionStats
 */
export interface SpatialCollisionConfig {
    cellSize: number;
    maxObjectsPerCell: number;
    enableCaching: boolean;
    cacheSize: number;
    hybridThreshold: number;
}
export interface SpatialCollisionStats {
    totalQueries: number;
    spatialQueries: number;
    naiveQueries: number;
    cacheHits: number;
    averageQueryTime: number;
    objectsProcessed: number;
}
/**
 * Create default configuration
 * @param overrides
 * @example
 */
export declare function createDefaultConfig(overrides?: Partial<SpatialCollisionConfig>): SpatialCollisionConfig;
/**
 * Create initial statistics
 * @example
 */
export declare function createInitialStats(): SpatialCollisionStats;
/**
 * Update average query time
 * @param stats
 * @param duration
 * @example
 */
export declare function updateAverageQueryTime(stats: SpatialCollisionStats, duration: number): void;
//# sourceMappingURL=spatial-collision-stats.d.ts.map