/**
 * Performance Profiling Types
 * 
 * Type definitions for performance monitoring and profiling
 * 
 * @module profiling/types
 */

export interface MemorySnapshot {
  timestamp: number;
  label: string;
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers: number;
}

export interface TimingProfile {
  operation: string;
  count: number;
  total: number;
  min: number;
  max: number;
  average: number;
  samples: number[];
  p95: number;
  p99: number;
}

export interface AllocationRecord {
  timestamp: number;
  type: string;
  size: number;
  stack: string;
}

export interface PerformanceMetrics {
  enabled: boolean;
  timestamp: number;
  operations: Array<TimingProfile & { name: string }>;
  memorySnapshots: Array<MemorySnapshot & { label: string }>;
  allocationRecords: Array<AllocationRecord & { type: string }>;
  summary: {
    totalOperations: number;
    averageExecutionTime: number;
    totalMemoryAllocated: number;
    peakMemoryUsage: number;
  };
}

export interface ProfilingConfig {
  enabled: boolean;
  detailedTiming: boolean;
  memoryTracking: boolean;
  allocationTracking: boolean;
  autoCleanup: boolean;
  maxRecords: number;
}

export interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  memoryUsage: {
    before: MemorySnapshot;
    after: MemorySnapshot;
    delta: number;
  };
  success: boolean;
  error?: string;
}

export interface MicroBenchmarkConfig {
  name: string;
  iterations: number;
  warmupIterations: number;
  setup?: () => void | Promise<void>;
  teardown?: () => void | Promise<void>;
  trackMemory: boolean;
  trackAllocations: boolean;
}

export interface ComponentBenchmark {
  component: string;
  scenarios: Array<{
    name: string;
    description: string;
    config: MicroBenchmarkConfig;
    setup: () => any;
    test: (context: any) => void | Promise<void>;
  }>;
}
