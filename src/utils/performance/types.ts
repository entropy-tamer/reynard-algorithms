/**
 * Performance Utilities Types
 *
 * Shared type definitions for the performance monitoring system.
 *
 * @module algorithms/performance/types
 */

export interface PerformanceMetrics {
  duration: number;
  memoryBefore: number;
  memoryAfter: number;
  memoryDelta: number;
  timestamp: number;
  iterations: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  standardDeviation: number;
}

export interface PerformanceBudget {
  maxDuration: number;
  maxMemoryUsage: number;
  maxIterations: number;
  warningThreshold: number;
}

export interface PerformanceWarning {
  type: "memory" | "css" | "dom" | "rendering" | "freeze";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
}

export interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export interface FrameRateMetrics {
  fps: number;
  frameTime: number;
  droppedFrames: number;
  averageFrameTime: number;
  timestamp: number;
}
