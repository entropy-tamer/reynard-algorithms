/**
 * @file Public Performance Monitor API
 * @description Performance monitoring and optimization for the algorithms package
 */

import { OptimizedCollisionAdapter } from "../adapters/optimized-collision-adapter";
import { getImmutableOptimizationConfig } from "../../config/immutable-config";

let globalCollisionAdapter: OptimizedCollisionAdapter | null = null;

function getGlobalCollisionAdapter(): OptimizedCollisionAdapter {
  if (!globalCollisionAdapter) {
    globalCollisionAdapter = new OptimizedCollisionAdapter(getImmutableOptimizationConfig());
  }
  return globalCollisionAdapter;
}

/**
 * Performance monitoring and optimization
 */
export class PerformanceMonitor {
  private adapter: OptimizedCollisionAdapter;

  /**
   * Creates a new performance monitor instance
   * @example
   * ```typescript
   * const monitor = new PerformanceMonitor();
   * ```
   */
  constructor() {
    this.adapter = getGlobalCollisionAdapter();
  }

  /**
   * Get current performance statistics
   * @returns Current performance statistics
   * @example
   * ```typescript
   * const stats = monitor.getPerformanceStats();
   * ```
   */
  getPerformanceStats() {
    return this.adapter.getPerformanceStats();
  }

  /**
   * Get memory pool statistics
   * @returns Memory pool statistics
   * @example
   * ```typescript
   * const poolStats = monitor.getMemoryPoolStats();
   * ```
   */
  getMemoryPoolStats() {
    return this.adapter.getMemoryPoolStats();
  }

  /**
   * Get optimization recommendations
   * @returns Optimization recommendations
   * @example
   * ```typescript
   * const recommendations = monitor.getOptimizationRecommendations();
   * ```
   */
  getOptimizationRecommendations() {
    return this.adapter.getOptimizationRecommendations();
  }

  /**
   * Check if performance is degraded
   * @returns True if performance is degraded
   * @example
   * ```typescript
   * if (monitor.isPerformanceDegraded()) { /* handle *\/ }
   * ```
   */
  isPerformanceDegraded(): boolean {
    return this.adapter.isPerformanceDegraded();
  }

  /**
   * Get comprehensive performance report
   * @returns Comprehensive performance report
   * @example
   * ```typescript
   * const report = monitor.getPerformanceReport();
   * ```
   */
  getPerformanceReport() {
    return this.adapter.getPerformanceReport();
  }

  /**
   * Reset performance statistics
   * @example
   * ```typescript
   * monitor.resetStatistics();
   * ```
   */
  resetStatistics(): void {
    this.adapter.resetStatistics();
  }
}






