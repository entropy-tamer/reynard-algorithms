/**
 * Throttling and Debouncing Utilities
 *
 * Function throttling and debouncing utilities for performance optimization.
 *
 * @module algorithms/performance/throttle
 */
import type { ThrottleOptions, DebounceOptions, FunctionSignature, ThrottledFunction, DebouncedFunction } from "../../core/types/performance-types";
/**
 * Throttle function execution
 * @param func
 * @param wait
 * @param options
 * @example
 */
export declare function throttle<TArgs extends readonly unknown[], TReturn>(func: FunctionSignature<TArgs, TReturn>, wait: number, options?: ThrottleOptions): ThrottledFunction<TArgs, TReturn>;
/**
 * Debounce function execution
 * @param func
 * @param wait
 * @param options
 * @example
 */
export declare function debounce<TArgs extends readonly unknown[], TReturn>(func: FunctionSignature<TArgs, TReturn>, wait: number, options?: DebounceOptions): DebouncedFunction<TArgs, TReturn>;
//# sourceMappingURL=throttle.d.ts.map