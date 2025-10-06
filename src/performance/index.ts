/**
 * Performance Utilities Algorithm
 *
 * A comprehensive performance monitoring and optimization toolkit for
 * measuring, analyzing, and improving application performance.
 *
 * Features:
 * - High-precision timing measurements
 * - Memory usage monitoring
 * - Performance benchmarking
 * - Throttling and debouncing utilities
 * - Frame rate monitoring
 * - Performance budgets
 * - Memory leak detection
 *
 * @module algorithms/performance
 */

// Export all types
export * from "./types";

// Export timer utilities
export { PerformanceTimer } from "./timer";

// Export memory utilities
export { MemoryMonitor, MemoryLeakDetector } from "./memory";

// Export benchmarking utilities
export { PerformanceBenchmark, measureAsync, measureSync } from "./benchmark";

// Export frame rate utilities
export { FrameRateMonitor } from "./framerate";

// Export throttling utilities
export { throttle, debounce } from "./throttle";

// Export budget utilities
export { PerformanceBudgetChecker } from "./budget";

// Export memory pool optimizations
export * from "./memory-pool-core";
export * from "./memory-pool-utils";
