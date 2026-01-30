/**
 * Performance Monitoring and Statistics
 *
 * Tracks collision detection performance metrics, maintains statistics,
 * and provides performance analysis and recommendations.
 *
 * @module algorithms/optimization/performanceMonitor
 */

import type { MemoryPoolStats, OptimizationRecommendation } from "../core/memory-pool";
// import type { AlgorithmSelector } from "../core/algorithm-selector";

export interface PerformanceRecord {
  timestamp: number;
  algorithm: string;
  objectCount: number;
  executionTime: number;
  memoryUsage: number;
  hitRate: number;
}

export interface CollisionPerformanceStats {
  totalQueries: number;
  averageExecutionTime: number;
  averageMemoryUsage: number;
  algorithmUsage: {
    naive: number;
    spatial: number;
    optimized: number;
  };
  memoryPoolStats: MemoryPoolStats;
  performanceHistory: PerformanceRecord[];
}

export interface PerformanceThresholds {
  maxExecutionTime: number;
  maxMemoryUsage: number;
  minHitRate: number;
}

export interface PerformanceReport {
  summary: {
    totalQueries: number;
    averageExecutionTime: number;
    averageMemoryUsage: number;
    hitRate: number;
    isDegraded: boolean;
  };
  algorithmUsage: {
    naive: number;
    spatial: number;
    optimized: number;
  };
  memoryPool: MemoryPoolStats;
  recommendations: OptimizationRecommendation[];
}

/**
 * Performance monitoring and statistics manager
 */
export class PerformanceMonitor {
  private stats: CollisionPerformanceStats;
  private performanceHistory: PerformanceRecord[] = [];
  private thresholds: PerformanceThresholds;

  /**
   *
   * @param thresholds
   * @example
   */
  constructor(thresholds: PerformanceThresholds) {
    this.thresholds = thresholds;
    this.stats = {
      totalQueries: 0,
      averageExecutionTime: 0,
      averageMemoryUsage: 0,
      algorithmUsage: {
        naive: 0,
        spatial: 0,
        optimized: 0,
      },
      memoryPoolStats: {
        totalAllocations: 0,
        totalDeallocations: 0,
        poolHits: 0,
        poolMisses: 0,
        memorySaved: 0,
        averageAllocationTime: 0,
        peakPoolUsage: 0,
        currentPoolUsage: 0,
        hitRate: 0,
        allocationReduction: 0,
      },
      performanceHistory: [],
    };
  }

  /**
   * Record a performance measurement
   * @param algorithm
   * @param objectCount
   * @param executionTime
   * @param memoryUsage
   * @param hitRate
   * @example
   */
  recordPerformance(
    algorithm: string,
    objectCount: number,
    executionTime: number,
    memoryUsage: number,
    hitRate: number
  ): void {
    const record: PerformanceRecord = {
      timestamp: Date.now(),
      algorithm,
      objectCount,
      executionTime,
      memoryUsage,
      hitRate,
    };

    this.performanceHistory.push(record);
    this.stats.totalQueries++;

    // Keep only recent history
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory = this.performanceHistory.slice(-1000);
    }

    // Update running averages
    this.updateRunningAverages(executionTime, memoryUsage);
    this.updateAlgorithmUsage(algorithm);
  }

  /**
   * Update memory pool statistics
   * @param stats
   * @example
   */
  updateMemoryPoolStats(stats: MemoryPoolStats): void {
    this.stats.memoryPoolStats = stats;
  }

  /**
   * Get current memory usage
   * @example
   */
  getCurrentMemoryUsage(): number {
    return (performance as any).memory?.usedJSHeapSize || 0;
  }

  /**
   * Get performance statistics
   * @example
   */
  getPerformanceStats(): CollisionPerformanceStats {
    return { ...this.stats };
  }

  /**
   * Check if performance is degraded
   * @example
   */
  isPerformanceDegraded(): boolean {
    return (
      this.stats.averageExecutionTime > this.thresholds.maxExecutionTime ||
      this.stats.averageMemoryUsage > this.thresholds.maxMemoryUsage ||
      this.stats.memoryPoolStats.hitRate < this.thresholds.minHitRate
    );
  }

  /**
   * Get performance report
   * @param recommendations
   * @example
   */
  getPerformanceReport(recommendations: OptimizationRecommendation[]): PerformanceReport {
    return {
      summary: {
        totalQueries: this.stats.totalQueries,
        averageExecutionTime: this.stats.averageExecutionTime,
        averageMemoryUsage: this.stats.averageMemoryUsage,
        hitRate: this.stats.memoryPoolStats.hitRate,
        isDegraded: this.isPerformanceDegraded(),
      },
      algorithmUsage: this.stats.algorithmUsage,
      memoryPool: this.stats.memoryPoolStats,
      recommendations,
    };
  }

  /**
   * Estimate update frequency based on recent queries
   * @example
   */
  estimateUpdateFrequency(): number {
    const now = Date.now();
    const recentQueries = this.performanceHistory.filter(
      record => now - record.timestamp < 1000 // Last second
    );
    return recentQueries.length;
  }

  /**
   * Reset all statistics
   * @example
   */
  resetStatistics(): void {
    this.stats = {
      totalQueries: 0,
      averageExecutionTime: 0,
      averageMemoryUsage: 0,
      algorithmUsage: {
        naive: 0,
        spatial: 0,
        optimized: 0,
      },
      memoryPoolStats: {
        totalAllocations: 0,
        totalDeallocations: 0,
        poolHits: 0,
        poolMisses: 0,
        memorySaved: 0,
        averageAllocationTime: 0,
        peakPoolUsage: 0,
        currentPoolUsage: 0,
        hitRate: 0,
        allocationReduction: 0,
      },
      performanceHistory: [],
    };
    this.performanceHistory = [];
  }

  /**
   * Update running averages
   * @param executionTime
   * @param memoryUsage
   * @example
   */
  private updateRunningAverages(executionTime: number, memoryUsage: number): void {
    // Update average execution time
    this.stats.averageExecutionTime =
      (this.stats.averageExecutionTime * (this.stats.totalQueries - 1) + executionTime) / this.stats.totalQueries;

    // Update average memory usage
    this.stats.averageMemoryUsage =
      (this.stats.averageMemoryUsage * (this.stats.totalQueries - 1) + memoryUsage) / this.stats.totalQueries;
  }

  /**
   * Update algorithm usage statistics
   * @param algorithm
   * @example
   */
  private updateAlgorithmUsage(algorithm: string): void {
    if (algorithm in this.stats.algorithmUsage) {
      this.stats.algorithmUsage[algorithm as keyof typeof this.stats.algorithmUsage]++;
    }
  }
}
