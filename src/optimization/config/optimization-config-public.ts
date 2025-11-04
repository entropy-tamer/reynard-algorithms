/**
 * @file Public Optimization Configuration API
 * @description Configuration management for algorithm optimization
 */

import type { OptimizedCollisionConfig } from "../adapters/optimized-collision-adapter";
import { updateImmutableConfig } from "../../config/immutable-config";

async function configureOptimizationInternal(config: Partial<OptimizedCollisionConfig>): Promise<void> {
  await updateImmutableConfig(undefined, config);
}

const DEFAULT_OPTIMIZATION_CONFIG: OptimizedCollisionConfig = {
  enableMemoryPooling: true,
  enableAlgorithmSelection: true,
  enablePerformanceMonitoring: true,
  memoryPoolConfig: undefined,
  algorithmSelectionStrategy: "adaptive",
  performanceThresholds: {
    maxExecutionTime: 16,
    maxMemoryUsage: 50 * 1024 * 1024,
    minHitRate: 90,
  },
};

/**
 * Optimization configuration management
 */
export class OptimizationConfig {
  private config: OptimizedCollisionConfig;

  /**
   * Creates a new optimization configuration instance
   * @param config - Partial configuration to override defaults
   * @example
   * ```typescript
   * const config = new OptimizationConfig({ enableMemoryPooling: false });
   * ```
   */
  constructor(config: Partial<OptimizedCollisionConfig> = {}) {
    this.config = { ...DEFAULT_OPTIMIZATION_CONFIG, ...config };
  }

  /**
   * Update configuration
   * @param config - Partial configuration to merge
   * @example
   * ```typescript
   * config.update({ enableMemoryPooling: true });
   * ```
   */
  update(config: Partial<OptimizedCollisionConfig>): void {
    this.config = { ...this.config, ...config };
    void configureOptimizationInternal(this.config);
  }

  /**
   * Get current configuration
   * @returns Current configuration object
   * @example
   * ```typescript
   * const currentConfig = config.getConfig();
   * ```
   */
  getConfig(): OptimizedCollisionConfig {
    return { ...this.config };
  }

  /**
   * Enable memory pooling
   * @example
   * ```typescript
   * config.enableMemoryPooling();
   * ```
   */
  enableMemoryPooling(): void {
    this.update({ enableMemoryPooling: true });
  }

  /**
   * Disable memory pooling
   * @example
   * ```typescript
   * config.disableMemoryPooling();
   * ```
   */
  disableMemoryPooling(): void {
    this.update({ enableMemoryPooling: false });
  }

  /**
   * Enable algorithm selection
   * @example
   * ```typescript
   * config.enableAlgorithmSelection();
   * ```
   */
  enableAlgorithmSelection(): void {
    this.update({ enableAlgorithmSelection: true });
  }

  /**
   * Disable algorithm selection
   * @example
   * ```typescript
   * config.disableAlgorithmSelection();
   * ```
   */
  disableAlgorithmSelection(): void {
    this.update({ enableAlgorithmSelection: false });
  }

  /**
   * Set algorithm selection strategy
   * @param strategy - Strategy to use (naive, spatial, optimized, or adaptive)
   * @example
   * ```typescript
   * config.setAlgorithmStrategy('adaptive');
   * ```
   */
  setAlgorithmStrategy(strategy: "naive" | "spatial" | "optimized" | "adaptive"): void {
    this.update({ algorithmSelectionStrategy: strategy });
  }

  /**
   * Set performance thresholds
   * @param thresholds - Performance threshold configuration
   * @param thresholds.maxExecutionTime - Maximum execution time in milliseconds
   * @param thresholds.maxMemoryUsage - Maximum memory usage in bytes
   * @param thresholds.minHitRate - Minimum hit rate percentage
   * @example
   * ```typescript
   * config.setPerformanceThresholds({
   *   maxExecutionTime: 16,
   *   maxMemoryUsage: 50 * 1024 * 1024,
   *   minHitRate: 90
   * });
   * ```
   */
  setPerformanceThresholds(thresholds: {
    maxExecutionTime?: number;
    maxMemoryUsage?: number;
    minHitRate?: number;
  }): void {
    this.update({
      performanceThresholds: {
        ...this.config.performanceThresholds,
        ...thresholds,
      },
    });
  }
}

