/**
 * Performance Analysis Module
 *
 * Analyzes performance profiles from historical data.
 *
 * @module algorithms/optimization/performanceAnalyzer
 */

import type {
  WorkloadCharacteristics,
  PerformanceProfile,
  PerformanceRecord,
  PerformanceMetrics,
} from "./algorithm-selector-types";

/**
 * Analyzes performance profiles from historical data
 */
export class PerformanceAnalyzer {
  private performanceHistory: PerformanceRecord[] = [];

  /**
   * Get performance profile from historical data
   * @param workload
   * @example
   */
  getPerformanceProfile(workload: WorkloadCharacteristics): PerformanceProfile {
    const similarWorkloads = this.findSimilarWorkloads(workload);

    if (similarWorkloads.length === 0) {
      return {
        confidence: 0.5,
        expectedPerformance: this.getDefaultPerformance(workload),
        historicalData: [],
      };
    }

    const avgPerformance = this.calculateAveragePerformance(similarWorkloads);
    const confidence = Math.min(0.95, similarWorkloads.length / 10);

    return {
      confidence,
      expectedPerformance: avgPerformance,
      historicalData: similarWorkloads,
    };
  }

  /**
   * Find similar workloads in performance history
   * @param workload
   * @example
   */
  private findSimilarWorkloads(workload: WorkloadCharacteristics): PerformanceRecord[] {
    return this.performanceHistory.filter(record => {
      const similarity = this.calculateWorkloadSimilarity(workload, record.workload);
      return similarity > 0.8;
    });
  }

  /**
   * Calculate similarity between workloads
   * @param workload1
   * @param workload2
   * @example
   */
  private calculateWorkloadSimilarity(workload1: WorkloadCharacteristics, workload2: WorkloadCharacteristics): number {
    const objectCountSimilarity =
      1 -
      Math.abs(workload1.objectCount - workload2.objectCount) / Math.max(workload1.objectCount, workload2.objectCount);
    const densitySimilarity = 1 - Math.abs(workload1.spatialDensity - workload2.spatialDensity);
    const overlapSimilarity = 1 - Math.abs(workload1.overlapRatio - workload2.overlapRatio);

    return (objectCountSimilarity + densitySimilarity + overlapSimilarity) / 3;
  }

  /**
   * Calculate average performance from historical data
   * @param records
   * @example
   */
  private calculateAveragePerformance(records: PerformanceRecord[]): PerformanceMetrics {
    const avgExecutionTime =
      records.reduce((sum, record) => sum + record.performance.executionTime, 0) / records.length;
    const avgMemoryUsage = records.reduce((sum, record) => sum + record.performance.memoryUsage, 0) / records.length;
    const avgAllocationCount =
      records.reduce((sum, record) => sum + record.performance.allocationCount, 0) / records.length;
    const avgCacheHitRate = records.reduce((sum, record) => sum + record.performance.cacheHitRate, 0) / records.length;

    return {
      executionTime: avgExecutionTime,
      memoryUsage: avgMemoryUsage,
      allocationCount: avgAllocationCount,
      cacheHitRate: avgCacheHitRate,
    };
  }

  /**
   * Get default performance estimates
   * @param workload
   * @example
   */
  private getDefaultPerformance(workload: WorkloadCharacteristics): PerformanceMetrics {
    return {
      executionTime: workload.objectCount * 0.001,
      memoryUsage: workload.objectCount * 16,
      allocationCount: workload.objectCount * 2,
      cacheHitRate: 0.5,
    };
  }

  /**
   * Set performance history for analysis
   * @param history
   * @example
   */
  setPerformanceHistory(history: PerformanceRecord[]): void {
    this.performanceHistory = [...history];
  }
}
