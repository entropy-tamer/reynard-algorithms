/**
 * Performance and Memory Management Types
 *
 * Type definitions for performance monitoring, memory management, and optimization
 */

export interface PerformanceMemoryInfo {
  readonly usedJSHeapSize: number;
  readonly totalJSHeapSize: number;
  readonly jsHeapSizeLimit: number;
}

export interface PerformanceMemoryAPI {
  readonly memory?: PerformanceMemoryInfo;
}

export interface ExtendedPerformance extends Performance {
  readonly memory?: PerformanceMemoryInfo;
}

export interface ExtendedGlobal extends Window {
  readonly performance: ExtendedPerformance;
}

export interface ThrottleOptions {
  readonly leading?: boolean;
  readonly trailing?: boolean;
  readonly maxWait?: number;
}

export interface DebounceOptions {
  readonly leading?: boolean;
  readonly trailing?: boolean;
  readonly maxWait?: number;
}

export interface FunctionSignature<TArgs extends readonly unknown[] = readonly unknown[], TReturn = unknown> {
  (...args: TArgs): TReturn;
}

export interface ThrottledFunction<TArgs extends readonly unknown[] = readonly unknown[], TReturn = unknown> {
  (...args: TArgs): TReturn | undefined;
  cancel: () => void;
  flush: () => TReturn | undefined;
}

export interface DebouncedFunction<TArgs extends readonly unknown[] = readonly unknown[], TReturn = unknown> {
  (...args: TArgs): TReturn | undefined;
  cancel: () => void;
  flush: () => TReturn | undefined;
}

export interface MemoryPoolConfig {
  readonly initialSize?: number;
  readonly maxSize?: number;
  readonly growthFactor?: number;
  readonly enableStats?: boolean;
  readonly enableOptimization?: boolean;
}

export interface PooledObject {
  readonly reset: () => void;
}

export interface MemoryPoolStats {
  readonly totalObjects: number;
  readonly activeObjects: number;
  readonly availableObjects: number;
  readonly peakUsage: number;
  readonly allocationCount: number;
  readonly deallocationCount: number;
  readonly averageLifetime: number;
}

export interface SpatialHashConfig {
  readonly cellSize: number;
  readonly maxObjectsPerCell: number;
  readonly enableOptimization: boolean;
}

export interface SpatialHashStats {
  readonly totalCells: number;
  readonly occupiedCells: number;
  readonly totalObjects: number;
  readonly averageObjectsPerCell: number;
  readonly maxObjectsPerCell: number;
  readonly queryCount: number;
  readonly averageQueryTime: number;
}
