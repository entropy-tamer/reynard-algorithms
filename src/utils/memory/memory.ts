/**
 * Memory Monitoring Utilities
 *
 * Memory usage monitoring and leak detection utilities.
 *
 * @module algorithms/performance/memory
 */

import type { ExtendedPerformance } from "../../core/types/performance-types";

/**
 * Memory usage monitor
 */
export class MemoryMonitor {
  private measurements: Array<{ timestamp: number; usage: number }> = [];

  /**
   * Records the current JS heap usage and returns it, or 0 when `performance.memory` is unavailable.
   *
   * @returns Used heap size in bytes, or 0 on platforms without the memory API.
   */
  measure(): number {
    const perf = performance as ExtendedPerformance;
    if (perf.memory) {
      const usage = perf.memory.usedJSHeapSize;
      this.measurements.push({ timestamp: Date.now(), usage });
      return usage;
    }
    return 0;
  }

  /**
   * Returns the heap-usage change between the last two measurements.
   *
   * @returns Signed byte difference, or 0 when fewer than two measurements exist.
   */
  getDelta(): number {
    if (this.measurements.length < 2) return 0;
    const latest = this.measurements[this.measurements.length - 1];
    const previous = this.measurements[this.measurements.length - 2];
    if (!latest || !previous) return 0;
    return latest.usage - previous.usage;
  }

  /**
   * Averages all recorded heap measurements.
   *
   * @returns Mean usage in bytes, or 0 when nothing has been measured.
   */
  getAverageUsage(): number {
    if (this.measurements.length === 0) return 0;
    const total = this.measurements.reduce((sum, m) => sum + m.usage, 0);
    return total / this.measurements.length;
  }

  /**
   * Discards all recorded measurements.
   */
  clear(): void {
    this.measurements = [];
  }
}

/**
 * Memory leak detector
 */
export class MemoryLeakDetector {
  private snapshots: Array<{
    timestamp: number;
    usage: number;
    count: number;
  }> = [];
  private objectCount = 0;
  // private lastSnapshot = 0;

  /**
   * Records a timestamped heap-usage and object-count snapshot, keeping only the last ten.
   */
  takeSnapshot(): void {
    const now = Date.now();
    const usage = this.getMemoryUsage();

    this.snapshots.push({
      timestamp: now,
      usage,
      count: this.objectCount,
    });

    // Keep only last 10 snapshots
    if (this.snapshots.length > 10) {
      this.snapshots.shift();
    }

    // this.lastSnapshot = now;
  }

  /**
   * Detects leakage from the three most recent snapshots using heap growth over time.
   *
   * Growth above 1 KB per second is treated as a leak; confidence reflects how consistent the
   * growth rates are. Fewer than three snapshots yields a neutral result.
   *
   * @returns Leak flag, average growth rate in bytes per second, and confidence in [0, 1].
   */
  detectLeak(): { isLeaking: boolean; growthRate: number; confidence: number } {
    if (this.snapshots.length < 3) {
      return { isLeaking: false, growthRate: 0, confidence: 0 };
    }

    const recent = this.snapshots.slice(-3);
    const growthRates: number[] = [];

    for (let i = 1; i < recent.length; i++) {
      const current = recent[i];
      const previous = recent[i - 1];
      if (!current || !previous) continue;
      const timeDiff = current.timestamp - previous.timestamp;
      const usageDiff = current.usage - previous.usage;
      const rate = usageDiff / timeDiff;
      growthRates.push(rate);
    }

    const averageGrowthRate = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
    const isLeaking = averageGrowthRate > 1000; // 1KB per second threshold

    // Calculate confidence based on consistency of growth
    const variance =
      growthRates.reduce((sum, rate) => sum + Math.pow(rate - averageGrowthRate, 2), 0) / growthRates.length;
    const confidence = Math.max(0, 1 - Math.sqrt(variance) / Math.abs(averageGrowthRate));

    return {
      isLeaking,
      growthRate: averageGrowthRate,
      confidence,
    };
  }

  /**
   * Reads the current used JS heap size from `performance.memory`, or 0 when unavailable.
   *
   * @returns Used heap size in bytes, or 0.
   */
  private getMemoryUsage(): number {
    const perf = performance as ExtendedPerformance;
    if (perf.memory) {
      return perf.memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Discards all recorded snapshots.
   */
  clear(): void {
    this.snapshots = [];
  }
}
