/**
 * Memoization Utilities
 *
 * High-performance memoization utilities for mathematical operations and expensive computations.
 * Provides multiple memoization strategies optimized for different use cases.
 *
 * @module algorithms/utils/memoization
 */

import { LRUCache } from "../data-structures/lru-cache";

/**
 * Configuration options for memoization
 */
export interface MemoizationConfig {
  /** Maximum number of cached results */
  maxSize?: number;
  /** Time-to-live for cached results in milliseconds */
  ttl?: number;
  /** Enable performance statistics */
  enableStats?: boolean;
  /** Custom cache key generator */
  keyGenerator?: (...args: any[]) => string;
}

/**
 * Default memoization configuration
 */
const DEFAULT_CONFIG: Required<MemoizationConfig> = {
  maxSize: 1000,
  ttl: 0, // No expiration by default
  enableStats: true,
  keyGenerator: (...args: any[]) => JSON.stringify(args),
};

/**
 * Memoized function result with metadata
 */
export interface MemoizedResult<T> {
  value: T;
  hitCount: number;
  lastAccessed: number;
  createdAt: number;
}

/**
 * Performance statistics for memoized functions
 */
export interface MemoizationStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalCalls: number;
  averageExecutionTime: number;
  cacheSize: number;
  maxCacheSize: number;
}

/**
 * High-performance memoization decorator using LRU cache
 *
 * @param fn - Function to memoize
 * @param config - Memoization configuration
 * @returns Memoized function with performance tracking
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  config: MemoizationConfig = {}
): T & { stats: MemoizationStats; clear: () => void } {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const cache = new LRUCache<string, MemoizedResult<ReturnType<T>>>({
    maxSize: finalConfig.maxSize,
    ttl: finalConfig.ttl,
    enableStats: finalConfig.enableStats,
  });

  let totalExecutionTime = 0;
  let totalCalls = 0;

  const memoizedFn = ((...args: Parameters<T>): ReturnType<T> => {
    const startTime = performance.now();
    const key = finalConfig.keyGenerator(...args);
    
    // Check cache first
    const cached = cache.get(key);
    if (cached) {
      cached.hitCount++;
      cached.lastAccessed = Date.now();
      return cached.value;
    }

    // Execute function and cache result
    const result = fn(...args);
    const executionTime = performance.now() - startTime;
    
    totalExecutionTime += executionTime;
    totalCalls++;

    const memoizedResult: MemoizedResult<ReturnType<T>> = {
      value: result,
      hitCount: 0,
      lastAccessed: Date.now(),
      createdAt: Date.now(),
    };

    cache.set(key, memoizedResult);

    return result;
  }) as T & { stats: MemoizationStats; clear: () => void };

  // Add stats getter
  Object.defineProperty(memoizedFn, 'stats', {
    get: (): MemoizationStats => {
      const cacheStats = cache.getStats();
      return {
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        hitRate: cacheStats.hitRate,
        totalCalls,
        averageExecutionTime: totalCalls > 0 ? totalExecutionTime / totalCalls : 0,
        cacheSize: cacheStats.size,
        maxCacheSize: cacheStats.maxSize,
      };
    },
    enumerable: true,
  });

  // Add clear method
  Object.defineProperty(memoizedFn, 'clear', {
    value: () => {
      cache.clear();
      totalExecutionTime = 0;
      totalCalls = 0;
    },
    enumerable: true,
  });

  return memoizedFn;
}

/**
 * Specialized memoization for mathematical operations
 * Optimized for functions with numeric parameters and results
 */
export function memoizeMath<T extends (...args: number[]) => number>(
  fn: T,
  config: Omit<MemoizationConfig, 'keyGenerator'> = {}
): T & { stats: MemoizationStats; clear: () => void } {
  return memoize(fn, {
    ...config,
    keyGenerator: (...args: number[]) => args.map(n => n.toString()).join(','),
  });
}

/**
 * Memoization for expensive geometric calculations
 * Uses specialized key generation for geometric data
 */
export function memoizeGeometry<T extends (...args: any[]) => any>(
  fn: T,
  config: Omit<MemoizationConfig, 'keyGenerator'> = {}
): T & { stats: MemoizationStats; clear: () => void } {
  return memoize(fn, {
    ...config,
    keyGenerator: (...args: any[]) => {
      return args.map(arg => {
        if (Array.isArray(arg)) {
          return `[${arg.map(n => typeof n === 'number' ? n.toFixed(6) : n).join(',')}]`;
        }
        if (typeof arg === 'number') {
          return arg.toFixed(6);
        }
        if (typeof arg === 'object' && arg !== null) {
          return JSON.stringify(arg, (key, value) => 
            typeof value === 'number' ? Number(value.toFixed(6)) : value
          );
        }
        return String(arg);
      }).join('|');
    },
  });
}

/**
 * Weak memoization using WeakMap for object-based caching
 * Useful when cache keys are objects that can be garbage collected
 */
export function weakMemoize<T extends (...args: any[]) => any>(
  fn: T
): T & { clear: () => void } {
  const cache = new WeakMap<object, any>();
  const argCache = new WeakMap<object, any[]>();

  const memoizedFn = ((...args: Parameters<T>): ReturnType<T> => {
    // Use first object argument as cache key, or create synthetic key
    let cacheKey: object;
    if (args.length > 0 && typeof args[0] === 'object' && args[0] !== null) {
      cacheKey = args[0];
    } else {
      // Create synthetic key for non-object arguments
      cacheKey = { args };
    }

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const result = fn(...args);
    cache.set(cacheKey, result);
    argCache.set(cacheKey, args);

    return result;
  }) as T & { clear: () => void };

  Object.defineProperty(memoizedFn, 'clear', {
    value: () => {
      // WeakMap doesn't have clear method, but we can create new instances
      // This is a limitation of WeakMap-based memoization
    },
    enumerable: true,
  });

  return memoizedFn;
}

/**
 * Batch memoization for processing multiple inputs at once
 * More efficient than individual memoization for bulk operations
 */
export function batchMemoize<T, R>(
  fn: (inputs: T[]) => R[],
  config: MemoizationConfig = {}
): (inputs: T[]) => R[] & { stats: MemoizationStats; clear: () => void } {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const cache = new LRUCache<string, R[]>({
    maxSize: finalConfig.maxSize,
    ttl: finalConfig.ttl,
    enableStats: finalConfig.enableStats,
  });

  let totalExecutionTime = 0;
  let totalCalls = 0;

  const memoizedFn = ((inputs: T[]): R[] => {
    const startTime = performance.now();
    const key = finalConfig.keyGenerator(inputs);
    
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }

    const result = fn(inputs);
    const executionTime = performance.now() - startTime;
    
    totalExecutionTime += executionTime;
    totalCalls++;

    cache.set(key, result);
    return result;
  }) as (inputs: T[]) => R[] & { stats: MemoizationStats; clear: () => void };

  Object.defineProperty(memoizedFn, 'stats', {
    get: (): MemoizationStats => {
      const cacheStats = cache.getStats();
      return {
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        hitRate: cacheStats.hitRate,
        totalCalls,
        averageExecutionTime: totalCalls > 0 ? totalExecutionTime / totalCalls : 0,
        cacheSize: cacheStats.size,
        maxCacheSize: cacheStats.maxSize,
      };
    },
    enumerable: true,
  });

  Object.defineProperty(memoizedFn, 'clear', {
    value: () => {
      cache.clear();
      totalExecutionTime = 0;
      totalCalls = 0;
    },
    enumerable: true,
  });

  return memoizedFn;
}

/**
 * Predefined memoized mathematical functions
 */
export const MathMemo = {
  /**
   * Memoized square function
   */
  square: memoizeMath((x: number) => x * x),
  
  /**
   * Memoized power function
   */
  pow: memoizeMath((x: number, y: number) => Math.pow(x, y)),
  
  /**
   * Memoized square root function
   */
  sqrt: memoizeMath((x: number) => Math.sqrt(x)),
  
  /**
   * Memoized logarithm function
   */
  log: memoizeMath((x: number) => Math.log(x)),
  
  /**
   * Memoized natural logarithm function
   */
  ln: memoizeMath((x: number) => Math.log(x)),
  
  /**
   * Memoized exponential function
   */
  exp: memoizeMath((x: number) => Math.exp(x)),
  
  /**
   * Memoized sine function
   */
  sin: memoizeMath((x: number) => Math.sin(x)),
  
  /**
   * Memoized cosine function
   */
  cos: memoizeMath((x: number) => Math.cos(x)),
  
  /**
   * Memoized tangent function
   */
  tan: memoizeMath((x: number) => Math.tan(x)),
  
  /**
   * Memoized atan2 function
   */
  atan2: memoizeGeometry((y: number, x: number) => Math.atan2(y, x)),

  /**
   * Memoized multiply for numeric pairs
   */
  multiply: memoizeGeometry((x: number, y: number) => x * y),

  /**
   * Memoized add for numeric pairs
   */
  add: memoizeGeometry((x: number, y: number) => x + y),
  
  /**
   * Memoized distance calculation
   */
  distance: memoizeGeometry((x1: number, y1: number, x2: number, y2: number) => 
    Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  ),
  
  /**
   * Memoized magnitude calculation for 2D vectors
   */
  magnitude2D: memoizeGeometry((x: number, y: number) => Math.sqrt(x * x + y * y)),
  
  /**
   * Memoized magnitude calculation for 3D vectors
   */
  magnitude3D: memoizeGeometry((x: number, y: number, z: number) => 
    Math.sqrt(x * x + y * y + z * z)
  ),
  
  /**
   * Memoized dot product for 2D vectors
   */
  dot2D: memoizeGeometry((x1: number, y1: number, x2: number, y2: number) => 
    x1 * x2 + y1 * y2
  ),
  
  /**
   * Memoized dot product for 3D vectors
   */
  dot3D: memoizeGeometry((x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => 
    x1 * x2 + y1 * y2 + z1 * z2
  ),
  
  /**
   * Memoized cross product for 3D vectors
   */
  cross3D: memoizeGeometry((x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => [
    y1 * z2 - z1 * y2,
    z1 * x2 - x1 * z2,
    x1 * y2 - y1 * x2
  ]),
  
  
};

/**
 * Clear all predefined mathematical memoization caches
 */
export function clearMathMemo(): void {
  Object.values(MathMemo).forEach(memoizedFn => {
    if ('clear' in memoizedFn) {
      memoizedFn.clear();
    }
  });
}

/**
 * Get statistics for all predefined mathematical memoization functions
 */
export function getMathMemoStats(): Record<string, MemoizationStats> {
  const stats: Record<string, MemoizationStats> = {};
  
  Object.entries(MathMemo).forEach(([name, memoizedFn]) => {
    if ('stats' in memoizedFn) {
      stats[name] = memoizedFn.stats;
    }
  });
  
  return stats;
}
