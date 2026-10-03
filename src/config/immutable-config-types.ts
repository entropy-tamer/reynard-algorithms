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
  /**
   * Maximum objects allowed to occupy a single spatial hash cell before it is
   * subdivided. Mirrors the optimizer's `maxObjectsPerCell`.
   */
  maxObjectsPerCell: number;
  /**
   * Object count below which the optimizer uses the naive O(n^2) sweep instead
   * of the spatial hash. Mirrors the optimizer's `hybridThreshold`.
   *
   * This must be a real number. When it is `undefined`, `aabbs.length <
   * hybridThreshold` evaluates to `false` for every input, so every call takes
   * the spatial path -- including 2-object inputs -- and the batch entry point
   * silently returns no collisions.
   */
  hybridThreshold: number;
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
