/**
 * Performance Tracking Module
 *
 * Tracks algorithm performance and selection statistics.
 *
 * @module algorithms/optimization/performanceTracker
 */

import type {
  PerformanceRecord,
  SelectionStats,
  AlgorithmSelection,
  WorkloadCharacteristics,
} from "./algorithm-selector-types";

/**
 * Tracks performance metrics and selection statistics
 */
export class PerformanceTracker {
  private performanceHistory: PerformanceRecord[] = [];
  private selectionStats: SelectionStats = {
    totalSelections: 0,
    correctSelections: 0,
    averageConfidence: 0,
    performanceImprovement: 0,
  };

  /**
   * Record algorithm selection for learning
   */
  recordSelection(selection: AlgorithmSelection, _workload: WorkloadCharacteristics): void {
    this.selectionStats.totalSelections++;
    this.selectionStats.averageConfidence =
      (this.selectionStats.averageConfidence * (this.selectionStats.totalSelections - 1) + selection.confidence) /
      this.selectionStats.totalSelections;
  }

  /**
   * Update performance model with new results
   */
  updatePerformanceModel(result: PerformanceRecord): void {
    this.performanceHistory.push(result);

    // Keep only recent history (last 1000 records)
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory = this.performanceHistory.slice(-1000);
    }

    // Update selection statistics
    this.updateSelectionStats(result);
  }

  /**
   * Update selection statistics
   */
  private updateSelectionStats(_result: PerformanceRecord): void {
    // This would be implemented to track whether the selection was correct
    // based on actual performance vs expected performance
  }

  /**
   * Get selection statistics
   */
  getSelectionStats(): SelectionStats {
    return { ...this.selectionStats };
  }

  /**
   * Get performance history
   */
  getPerformanceHistory(): PerformanceRecord[] {
    return [...this.performanceHistory];
  }

  /**
   * Clear performance history
   */
  clearPerformanceHistory(): void {
    this.performanceHistory = [];
    this.selectionStats = {
      totalSelections: 0,
      correctSelections: 0,
      averageConfidence: 0,
      performanceImprovement: 0,
    };
  }
}
