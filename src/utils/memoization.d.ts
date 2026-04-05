/**
 * Memoization Utilities
 *
 * High-performance memoization utilities for mathematical operations and expensive computations.
 * Provides multiple memoization strategies optimized for different use cases.
 *
 * @module algorithms/utils/memoization
 */
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
 * @example
 */
export declare function memoize<T extends (...args: any[]) => any>(fn: T, config?: MemoizationConfig): T & {
    stats: MemoizationStats;
    clear: () => void;
};
/**
 * Specialized memoization for mathematical operations
 * Optimized for functions with numeric parameters and results
 * @param fn
 * @param config
 * @example
 */
export declare function memoizeMath<T extends (...args: number[]) => number>(fn: T, config?: Omit<MemoizationConfig, "keyGenerator">): T & {
    stats: MemoizationStats;
    clear: () => void;
};
/**
 * Memoization for expensive geometric calculations
 * Uses specialized key generation for geometric data
 * @param fn
 * @param config
 * @example
 */
export declare function memoizeGeometry<T extends (...args: any[]) => any>(fn: T, config?: Omit<MemoizationConfig, "keyGenerator">): T & {
    stats: MemoizationStats;
    clear: () => void;
};
/**
 * Weak memoization using WeakMap for object-based caching
 * Useful when cache keys are objects that can be garbage collected
 * @param fn
 * @example
 */
export declare function weakMemoize<T extends (...args: any[]) => any>(fn: T): T & {
    clear: () => void;
};
/**
 * Batch memoization for processing multiple inputs at once
 * More efficient than individual memoization for bulk operations
 * @param fn
 * @param config
 * @example
 */
export declare function batchMemoize<T, R>(fn: (inputs: T[]) => R[], config?: MemoizationConfig): (inputs: T[]) => R[] & {
    stats: MemoizationStats;
    clear: () => void;
};
/**
 * Predefined memoized mathematical functions
 */
export declare const MathMemo: {
    /**
     * Memoized square function
     */
    square: ((x: number) => number) & {
        stats: MemoizationStats;
        clear: () => void;
    };
    /**
     * Memoized power function
     */
    pow: ((x: number, y: number) => number) & {
        stats: MemoizationStats;
        clear: () => void;
    };
    /**
     * Memoized square root function
     */
    sqrt: ((x: number) => number) & {
        stats: MemoizationStats;
        clear: () => void;
    };
    /**
     * Memoized logarithm function
     */
    log: ((x: number) => number) & {
        stats: MemoizationStats;
        clear: () => void;
    };
    /**
     * Memoized natural logarithm function
     */
    ln: ((x: number) => number) & {
        stats: MemoizationStats;
        clear: () => void;
    };
    /**
     * Memoized exponential function
     */
    exp: ((x: number) => number) & {
        stats: MemoizationStats;
        clear: () => void;
    };
    /**
     * Memoized sine function
     */
    sin: ((x: number) => number) & {
        stats: MemoizationStats;
        clear: () => void;
    };
    /**
     * Memoized cosine function
     */
    cos: ((x: number) => number) & {
        stats: MemoizationStats;
        clear: () => void;
    };
    /**
     * Memoized tangent function
     */
    tan: ((x: number) => number) & {
        stats: MemoizationStats;
        clear: () => void;
    };
    /**
     * Memoized atan2 function
     */
    atan2: ((y: number, x: number) => number) & {
        stats: MemoizationStats;
        clear: () => void;
    };
    /**
     * Memoized multiply for numeric pairs
     */
    multiply: ((x: number, y: number) => number) & {
        stats: MemoizationStats;
        clear: () => void;
    };
    /**
     * Memoized add for numeric pairs
     */
    add: ((x: number, y: number) => number) & {
        stats: MemoizationStats;
        clear: () => void;
    };
    /**
     * Memoized distance calculation
     */
    distance: ((x1: number, y1: number, x2: number, y2: number) => number) & {
        stats: MemoizationStats;
        clear: () => void;
    };
    /**
     * Memoized magnitude calculation for 2D vectors
     */
    magnitude2D: ((x: number, y: number) => number) & {
        stats: MemoizationStats;
        clear: () => void;
    };
    /**
     * Memoized magnitude calculation for 3D vectors
     */
    magnitude3D: ((x: number, y: number, z: number) => number) & {
        stats: MemoizationStats;
        clear: () => void;
    };
    /**
     * Memoized dot product for 2D vectors
     */
    dot2D: ((x1: number, y1: number, x2: number, y2: number) => number) & {
        stats: MemoizationStats;
        clear: () => void;
    };
    /**
     * Memoized dot product for 3D vectors
     */
    dot3D: ((x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => number) & {
        stats: MemoizationStats;
        clear: () => void;
    };
    /**
     * Memoized cross product for 3D vectors
     */
    cross3D: ((x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => number[]) & {
        stats: MemoizationStats;
        clear: () => void;
    };
};
/**
 * Clear all predefined mathematical memoization caches
 * @example
 */
export declare function clearMathMemo(): void;
/**
 * Get statistics for all predefined mathematical memoization functions
 * @example
 */
export declare function getMathMemoStats(): Record<string, MemoizationStats>;
//# sourceMappingURL=memoization.d.ts.map