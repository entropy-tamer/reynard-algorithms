/**
 * Performance Profiling Hooks
 * 
 * Zero-overhead performance monitoring hooks that only activate when
 * benchmarking mode is enabled. Production builds have no impact.
 * 
 * @module profiling/hooks
 */

import type { 
  PerformanceMetrics, 
  MemorySnapshot, 
  TimingProfile, 
  AllocationRecord 
} from './profiling-types';

/**
 * Global profiling configuration
 */
interface ProfilingConfig {
  enabled: boolean;
  detailedTiming: boolean;
  memoryTracking: boolean;
  allocationTracking: boolean;
  autoCleanup: boolean;
  maxRecords: number;
}

/**
 * Zero-overhead performance profiler
 */
export class PerformanceProfiler {
  private static instance: PerformanceProfiler;
  private config: ProfilingConfig;
  private metrics: Map<string, PerformanceMetrics>;
  private memorySnapshots: Map<string, MemorySnapshot[]>;
  private timingProfiles: Map<string, TimingProfile>;
  private allocationRecords: Map<string, AllocationRecord[]>;

  private constructor() {
    this.config = this.getEnvironmentConfig();
    this.metrics = new Map();
    this.memorySnapshots = new Map();
    this.timingProfiles = new Map();
    this.allocationRecords = new Map();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): PerformanceProfiler {
    if (!PerformanceProfiler.instance) {
      PerformanceProfiler.instance = new PerformanceProfiler();
    }
    return PerformanceProfiler.instance;
  }

  /**
   * Detect environment and configure accordingly
   */
  private getEnvironmentConfig(): ProfilingConfig {
    // Production: completely disabled
    if (typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'production') {
      return {
        enabled: false,
        detailedTiming: false,
        memoryTracking: false,
        allocationTracking: false,
        autoCleanup: false,
        maxRecords: 0
      };
    }

    // Development: enabled but conservative
    if (typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'development') {
      return {
        enabled: process.env?.['REYNARD_PROFILING'] === 'true',
        detailedTiming: false,
        memoryTracking: false,
        allocationTracking: false,
        autoCleanup: true,
        maxRecords: 1000
      };
    }

    // Benchmark/Test: fully enabled
    if (typeof process !== 'undefined' && (
      process.env?.['REYNARD_BENCHMARK'] === 'true' || 
      process.env?.['REYNARD_PROFILING'] === 'true' ||
      process.env?.['NODE_ENV'] === 'test'
    )) {
      return {
        enabled: true,
        detailedTiming: true,
        memoryTracking: true,
        allocationTracking: true,
        autoCleanup: false,
        maxRecords: 10000
      };
    }

    // Default: disabled
    return {
      enabled: false,
      detailedTiming: false,
      memoryTracking: false,
      allocationTracking: false,
      autoCleanup: false,
      maxRecords: 0
    };
  }

  /**
   * Check if profiling is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Start timing an operation
   */
  startTiming(operation: string, subOperation?: string): () => number {
    if (!this.config.enabled) {
      return () => 0; // No-op for production
    }

    const key = subOperation ? `${operation}.${subOperation}` : operation;
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (this.config.detailedTiming) {
        this.recordTiming(key, duration);
      }

      return duration;
    };
  }

  /**
   * Record timing data
   */
  private recordTiming(key: string, duration: number): void {
    const existing = this.timingProfiles.get(key);
    
    if (existing) {
      existing.count++;
      existing.total += duration;
      existing.min = Math.min(existing.min, duration);
      existing.max = Math.max(existing.max, duration);
      existing.samples.push(duration);
      
      // Keep only last 100 samples to prevent memory bloat
      if (existing.samples.length > 100) {
        existing.samples = existing.samples.slice(-100);
      }
    } else {
      this.timingProfiles.set(key, {
        operation: key,
        count: 1,
        total: duration,
        min: duration,
        max: duration,
        average: duration,
        samples: [duration],
        p95: duration,
        p99: duration
      });
    }
  }

  /**
   * Take memory snapshot
   */
  takeMemorySnapshot(label: string): MemorySnapshot | null {
    if (!this.config.enabled || !this.config.memoryTracking) {
      return {
        label,
        timestamp: 0,
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        rss: 0,
        arrayBuffers: 0,
      };
    }

    let snapshot: MemorySnapshot;

    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      snapshot = {
        timestamp: performance.now(),
        label,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss,
        arrayBuffers: (memUsage as any).arrayBuffers || 0
      };
    } else {
      // Browser environment - limited data
      snapshot = {
        timestamp: performance.now(),
        label,
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        rss: 0,
        arrayBuffers: 0
      };
    }

    // Store snapshot for analysis
    const snapshots = this.memorySnapshots.get(label) || [];
    snapshots.push(snapshot);
    
    // Limit stored snapshots
    if (snapshots.length > this.config.maxRecords) {
      snapshots.splice(0, snapshots.length - this.config.maxRecords);
    }
    
    this.memorySnapshots.set(label, snapshots);
    
    return snapshot;
  }

  /**
   * Track memory allocation
   */
  trackAllocation(type: string, size: number): void {
    if (!this.config.enabled || !this.config.allocationTracking) {
      return;
    }

    const record: AllocationRecord = {
      timestamp: performance.now(),
      type,
      size,
      stack: new Error().stack || 'unknown'
    };

    const allocations = this.allocationRecords.get(type) || [];
    allocations.push(record);

    // Limit stored records
    if (allocations.length > this.config.maxRecords) {
      allocations.splice(0, allocations.length - this.config.maxRecords);
    }

    this.allocationRecords.set(type, allocations);
  }

  /**
   * Get timing profile for operation
   */
  getTimingProfile(operation: string): TimingProfile | null {
    return this.timingProfiles.get(operation) || null;
  }

  /**
   * Get memory snapshots for label
   */
  getMemorySnapshots(label: string): MemorySnapshot[] {
    return this.memorySnapshots.get(label) || [];
  }

  /**
   * Get allocation records for type
   */
  getAllocationRecords(type: string): AllocationRecord[] {
    return this.allocationRecords.get(type) || [];
  }

  /**
   * Get comprehensive performance report
   */
  getPerformanceReport(): PerformanceMetrics {
    if (!this.config.enabled) {
      return {
        enabled: false,
        timestamp: performance.now(),
        operations: [],
        memorySnapshots: [],
        allocationRecords: [],
        summary: {
          totalOperations: 0,
          averageExecutionTime: 0,
          totalMemoryAllocated: 0,
          peakMemoryUsage: 0
        }
      };
    }

    const operations = Array.from(this.timingProfiles.entries()).map(([key, profile]) => ({
      name: key,
      ...profile,
      average: profile.total / profile.count,
      p95: this.calculatePercentile(profile.samples, 0.95),
      p99: this.calculatePercentile(profile.samples, 0.99)
    }));

    const memorySnapshots = Array.from(this.memorySnapshots.entries())
      .flatMap(([label, snapshots]) => 
        snapshots.map(snapshot => ({ ...snapshot, label }))
      );

    const allocationRecords = Array.from(this.allocationRecords.entries())
      .flatMap(([type, records]) => 
        records.map(record => ({ ...record, type }))
      );

    const totalOperations = operations.reduce((sum, op) => sum + op.count, 0);
    const averageExecutionTime = operations.length > 0 
      ? operations.reduce((sum, op) => sum + op.average, 0) / operations.length 
      : 0;
    const totalMemoryAllocated = allocationRecords.reduce((sum, alloc) => sum + alloc.size, 0);
    const peakMemoryUsage = memorySnapshots.length > 0
      ? Math.max(...memorySnapshots.map(snap => snap.heapUsed))
      : 0;

    return {
      enabled: true,
      timestamp: performance.now(),
      operations,
      memorySnapshots,
      allocationRecords,
      summary: {
        totalOperations,
        averageExecutionTime,
        totalMemoryAllocated,
        peakMemoryUsage
      }
    };
  }

  /**
   * Calculate percentile from samples
   */
  private calculatePercentile(samples: number[], percentile: number): number {
    if (samples.length === 0) return 0;
    
    const sorted = [...samples].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * percentile) - 1;
    return sorted[Math.max(0, index)] || 0;
  }

  /**
   * Clear all profiling data
   */
  clear(): void {
    this.metrics.clear();
    this.memorySnapshots.clear();
    this.timingProfiles.clear();
    this.allocationRecords.clear();
  }

  /**
   * Export profiling data for analysis
   */
  exportData(): string {
    const report = this.getPerformanceReport();
    return JSON.stringify(report, null, 2);
  }

  /**
   * Auto-cleanup old data if enabled
   */
  autoCleanup(): void {
    if (!this.config.autoCleanup) return;

    // Clean up old timing profiles
    for (const [, profile] of this.timingProfiles.entries()) {
      if (profile.samples.length > 1000) {
        profile.samples = profile.samples.slice(-1000);
      }
    }

    // Clean up old memory snapshots
    for (const [, snapshots] of this.memorySnapshots.entries()) {
      if (snapshots.length > 1000) {
        snapshots.splice(0, snapshots.length - 1000);
      }
    }

    // Clean up old allocation records
    for (const [, records] of this.allocationRecords.entries()) {
      if (records.length > 1000) {
        records.splice(0, records.length - 1000);
      }
    }
  }
}

/**
 * Zero-overhead timing hook
 */
export function useTiming(operation: string, subOperation?: string) {
  const profiler = PerformanceProfiler.getInstance();
  
  if (!profiler.isEnabled()) {
    return {
      start: () => () => 0, // No-op
      isEnabled: false
    };
  }

  return {
    start: () => profiler.startTiming(operation, subOperation),
    isEnabled: true
  };
}

/**
 * Zero-overhead memory tracking hook
 */
export function useMemoryTracking(label: string) {
  const profiler = PerformanceProfiler.getInstance();
  
  if (!profiler.isEnabled()) {
    return {
      snapshot: () => null,
      trackAllocation: () => {}, // No-op
      isEnabled: false
    };
  }

  return {
    snapshot: () => profiler.takeMemorySnapshot(label),
    trackAllocation: (type: string, size: number) => profiler.trackAllocation(type, size),
    isEnabled: true
  };
}

/**
 * Performance monitoring decorator for functions
 */
export function profile(
  operation: string,
  options: { trackMemory?: boolean } = {}
): any {
  return function(
    _target: any,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor | void {
    const originalMethod = descriptor.value;
    
    if (!originalMethod) {
      return descriptor;
    }
    
    const profiler = PerformanceProfiler.getInstance();

    descriptor.value = function(this: any, ...args: any[]): any {
      if (!profiler.isEnabled()) {
        return originalMethod.apply(this, args);
      }

      const endTiming = profiler.startTiming(operation);
      if (options.trackMemory) {
        profiler.takeMemorySnapshot(`${operation}-start`);
      }

      try {
        const result = originalMethod.apply(this, args);
        
        // Handle async functions
        if (result && typeof result.then === 'function') {
          return result.finally(() => {
            endTiming();
            if (options.trackMemory) {
              profiler.takeMemorySnapshot(`${operation}-end`);
            }
          });
        } else {
          endTiming();
          if (options.trackMemory) {
            profiler.takeMemorySnapshot(`${operation}-end`);
          }
          return result;
        }
      } catch (error) {
        endTiming();
        if (options.trackMemory) {
          profiler.takeMemorySnapshot(`${operation}-error`);
        }
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Global profiler instance for easy access
 */
export const profiler = PerformanceProfiler.getInstance();
