/**
 * @file Helper functions for immutable configuration management
 */
import type { AlgorithmConfig } from "./algorithm-config";
import type { ImmutableConfigSnapshot, OptimizedCollisionConfig } from "./immutable-config-types";
/**
 * Default optimization configuration
 */
export declare const DEFAULT_OPTIMIZATION_CONFIG: OptimizedCollisionConfig;
/**
 * Create a configuration snapshot
 *
 * @param algorithmConfig - Algorithm configuration
 * @param optimizationConfig - Optimization configuration
 * @returns A new immutable configuration snapshot
 * @example
 */
export declare function createSnapshot(algorithmConfig: AlgorithmConfig, optimizationConfig?: OptimizedCollisionConfig): ImmutableConfigSnapshot;
/**
 * Generate version string for configuration
 *
 * @returns A unique version string
 * @example
 */
export declare function generateVersion(): string;
/**
 * Track configuration changes by comparing old and new values
 *
 * @param updates - Partial updates to apply
 * @param currentRecord - Current configuration as a record
 * @param newRecord - New configuration as a record
 * @param prefix - Prefix for changed keys (e.g., "algorithm" or "optimization")
 * @returns Array of changed key paths
 * @example
 */
export declare function trackChanges<T extends Record<string, unknown>>(updates: Partial<T>, currentRecord: Record<string, unknown>, newRecord: Record<string, unknown>, prefix: string): string[];
/**
 * Compare two configuration values and detect changes
 *
 * @param oldConfig - Previous configuration object
 * @param newConfig - New configuration object
 * @returns Record of changed keys with old and new values
 * @example
 */
export declare function getConfigChanges<T extends Record<string, unknown>>(oldConfig: T, newConfig: T): Record<string, {
    old: unknown;
    new: unknown;
}>;
/**
 * Get configuration diff between two snapshots
 *
 * @param oldSnapshot - Previous configuration snapshot
 * @param newSnapshot - New configuration snapshot
 * @returns Object containing algorithm and optimization changes
 * @example
 */
export declare function getConfigDiff(oldSnapshot: ImmutableConfigSnapshot, newSnapshot: ImmutableConfigSnapshot): {
    algorithmChanges: Record<string, {
        old: unknown;
        new: unknown;
    }>;
    optimizationChanges: Record<string, {
        old: unknown;
        new: unknown;
    }>;
};
/**
 * Validate configuration consistency
 *
 * @param algorithmConfig - Algorithm configuration to validate
 * @param algorithmConfig.thresholds
 * @param algorithmConfig.thresholds.naiveToSpatial
 * @param algorithmConfig.thresholds.spatialToOptimized
 * @param algorithmConfig.performance
 * @param algorithmConfig.performance.statistics
 * @param algorithmConfig.performance.statistics.sampleCount
 * @returns Validation result with isValid flag and error messages
 * @example
 */
export declare function validateConfig(algorithmConfig: {
    thresholds: {
        naiveToSpatial: number;
        spatialToOptimized: number;
    };
    performance: {
        statistics: {
            sampleCount: number;
        };
    };
}): {
    isValid: boolean;
    errors: string[];
};
//# sourceMappingURL=immutable-config-helpers.d.ts.map