/**
 * @file Types and interfaces for immutable configuration system
 */

import { AlgorithmConfig } from "./algorithm-config";

/**
 * Immutable configuration snapshot
 */
export interface ImmutableConfigSnapshot {
  readonly algorithmConfig: AlgorithmConfig;
  readonly optimizationConfig: OptimizedCollisionConfig;
  readonly timestamp: number;
  readonly version: string;
}

/**
 * Minimal optimization config type aligned with adapter defaults
 */
export interface OptimizedCollisionConfig {
  enableMemoryPooling: boolean;
  enableSpatialHashing: boolean;
  enableParallelProcessing: boolean;
  memoryPoolSize: number;
  spatialHashCellSize: number;
  maxWorkers: number;
  enableCaching: boolean;
  cacheSize: number;
  enableProfiling: boolean;
  profilingThreshold: number;
}

/**
 * Configuration change event
 */
export interface ConfigChangeEvent {
  readonly type: "config_changed";
  readonly oldSnapshot: ImmutableConfigSnapshot;
  readonly newSnapshot: ImmutableConfigSnapshot;
  readonly changedKeys: string[];
  readonly timestamp: number;
}

/**
 * Configuration change listener
 */
export type ConfigChangeListener = (event: ConfigChangeEvent) => void;
