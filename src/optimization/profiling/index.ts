/**
 * PAW Performance Integration
 * 
 * Integrates profiling hooks and micro-benchmarks into PAW components
 * with zero production overhead.
 * 
 * @module profiling/integration
 */

import { profiler, useTiming, useMemoryTracking, profile } from './hooks';
import { benchmarkRunner, runAllMicroBenchmarks } from './micro-benchmarks';

// Re-export for easy access
export {
  profiler,
  useTiming,
  useMemoryTracking,
  profile,
  benchmarkRunner,
  runAllMicroBenchmarks
};

/**
 * Environment-aware performance monitoring
 */
export const pawPerformance = {
  /**
   * Check if performance monitoring is enabled
   */
  isEnabled: () => profiler.isEnabled(),

  /**
   * Start timing an operation
   */
  startTiming: (operation: string, subOperation?: string) => {
    return useTiming(operation, subOperation).start();
  },

  /**
   * Track memory usage
   */
  trackMemory: (label: string) => {
    const memory = useMemoryTracking(label);
    return {
      snapshot: memory.snapshot,
      trackAllocation: memory.trackAllocation
    };
  },

  /**
   * Get performance report
   */
  getReport: () => profiler.getPerformanceReport(),

  /**
   * Export performance data
   */
  exportData: () => profiler.exportData(),

  /**
   * Clear all performance data
   */
  clear: () => profiler.clear()
};

/**
 * Benchmark utilities for PAW testing
 */
export const pawBenchmarks = {
  /**
   * Run all PAW micro-benchmarks
   */
  runAll: runAllMicroBenchmarks,

  /**
   * Get benchmark results
   */
  getResults: (name?: string) => benchmarkRunner.getResults(name),

  /**
   * Clear benchmark results
   */
  clearResults: () => benchmarkRunner.clearResults()
};

/**
 * Performance decorator for PAW methods
 */
export const PAWProfile = profile;
