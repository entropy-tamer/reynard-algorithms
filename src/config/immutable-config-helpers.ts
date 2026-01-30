/**
 * @file Helper functions for immutable configuration management
 */

import type { AlgorithmConfig } from "./algorithm-config";
import type { ImmutableConfigSnapshot, OptimizedCollisionConfig } from "./immutable-config-types";

/**
 * Default optimization configuration
 */
export const DEFAULT_OPTIMIZATION_CONFIG: OptimizedCollisionConfig = {
  enableMemoryPooling: true,
  enableSpatialHashing: true,
  enableParallelProcessing: true,
  memoryPoolSize: 10000,
  spatialHashCellSize: 100,
  maxWorkers: 4,
  enableCaching: true,
  cacheSize: 1000,
  enableProfiling: false,
  profilingThreshold: 1000,
};

/**
 * Create a configuration snapshot
 *
 * @param algorithmConfig - Algorithm configuration
 * @param optimizationConfig - Optimization configuration
 * @returns A new immutable configuration snapshot
 * @example
 */
export function createSnapshot(
  algorithmConfig: AlgorithmConfig,
  optimizationConfig: OptimizedCollisionConfig = DEFAULT_OPTIMIZATION_CONFIG
): ImmutableConfigSnapshot {
  return {
    algorithmConfig: Object.freeze({ ...algorithmConfig }),
    optimizationConfig: Object.freeze({ ...optimizationConfig }),
    timestamp: Date.now(),
    version: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
}

/**
 * Generate version string for configuration
 *
 * @returns A unique version string
 * @example
 */
export function generateVersion(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

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
export function trackChanges<T extends Record<string, unknown>>(
  updates: Partial<T>,
  currentRecord: Record<string, unknown>,
  newRecord: Record<string, unknown>,
  prefix: string
): string[] {
  const changedKeys: string[] = [];
  for (const key of Object.keys(updates)) {
    if (JSON.stringify(currentRecord[key]) !== JSON.stringify(newRecord[key])) {
      changedKeys.push(`${prefix}.${key}`);
    }
  }
  return changedKeys;
}

/**
 * Compare two configuration values and detect changes
 *
 * @param oldConfig - Previous configuration object
 * @param newConfig - New configuration object
 * @returns Record of changed keys with old and new values
 * @example
 */
export function getConfigChanges<T extends Record<string, unknown>>(
  oldConfig: T,
  newConfig: T
): Record<string, { old: unknown; new: unknown }> {
  const changes: Record<string, { old: unknown; new: unknown }> = {};

  const oldRecord = oldConfig as unknown as Record<string, unknown>;
  const newRecord = newConfig as unknown as Record<string, unknown>;

  for (const key of Object.keys(newRecord)) {
    if (JSON.stringify(oldRecord[key]) !== JSON.stringify(newRecord[key])) {
      changes[key] = { old: oldRecord[key], new: newRecord[key] };
    }
  }

  return changes;
}

/**
 * Get configuration diff between two snapshots
 *
 * @param oldSnapshot - Previous configuration snapshot
 * @param newSnapshot - New configuration snapshot
 * @returns Object containing algorithm and optimization changes
 * @example
 */
export function getConfigDiff(
  oldSnapshot: ImmutableConfigSnapshot,
  newSnapshot: ImmutableConfigSnapshot
): {
  algorithmChanges: Record<string, { old: unknown; new: unknown }>;
  optimizationChanges: Record<string, { old: unknown; new: unknown }>;
} {
  return {
    algorithmChanges: getConfigChanges(
      oldSnapshot.algorithmConfig as unknown as Record<string, unknown>,
      newSnapshot.algorithmConfig as unknown as Record<string, unknown>
    ),
    optimizationChanges: getConfigChanges(
      oldSnapshot.optimizationConfig as unknown as Record<string, unknown>,
      newSnapshot.optimizationConfig as unknown as Record<string, unknown>
    ),
  };
}

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
export function validateConfig(algorithmConfig: {
  thresholds: {
    naiveToSpatial: number;
    spatialToOptimized: number;
  };
  performance: {
    statistics: {
      sampleCount: number;
    };
  };
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (algorithmConfig.thresholds.naiveToSpatial <= 0) {
    errors.push("naiveToSpatial threshold must be positive");
  }

  if (algorithmConfig.thresholds.spatialToOptimized <= algorithmConfig.thresholds.naiveToSpatial) {
    errors.push("spatialToOptimized threshold must be greater than naiveToSpatial");
  }

  if (algorithmConfig.performance.statistics.sampleCount < 1) {
    errors.push("performance.statistics.sampleCount must be >= 1");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
