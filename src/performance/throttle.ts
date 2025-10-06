/**
 * Throttling and Debouncing Utilities
 *
 * Function throttling and debouncing utilities for performance optimization.
 *
 * @module algorithms/performance/throttle
 */

import type {
  ThrottleOptions,
  DebounceOptions,
  FunctionSignature,
  ThrottledFunction,
  DebouncedFunction,
} from "../types/performance-types";

/**
 * Throttle function execution
 */
export function throttle<TArgs extends readonly unknown[], TReturn>(
  func: FunctionSignature<TArgs, TReturn>,
  wait: number,
  options: ThrottleOptions = {}
): ThrottledFunction<TArgs, TReturn> {
  let timeoutId: number | null = null;
  let lastExecTime = 0;
  let lastArgs: TArgs | null = null;
  let lastResult: TReturn | undefined;

  const { leading = true, trailing = true, maxWait } = options;

  const throttled = ((...args: TArgs): TReturn | undefined => {
    const now = performance.now();
    const timeSinceLastExec = now - lastExecTime;

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (leading && timeSinceLastExec >= wait) {
      lastExecTime = now;
      lastResult = func(...args);
      return lastResult;
    }

    if (trailing) {
      lastArgs = args;
      const delay = maxWait ? Math.min(wait, maxWait - timeSinceLastExec) : wait;

      timeoutId = window.setTimeout(() => {
        if (lastArgs) {
          lastExecTime = performance.now();
          lastResult = func(...lastArgs);
          lastArgs = null;
        }
      }, delay);
    }

    return lastResult;
  }) as ThrottledFunction<TArgs, TReturn>;

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };

  throttled.flush = () => {
    if (lastArgs) {
      lastExecTime = performance.now();
      lastResult = func(...lastArgs);
      lastArgs = null;
      return lastResult;
    }
    return lastResult;
  };

  return throttled;
}

/**
 * Debounce function execution
 */
export function debounce<TArgs extends readonly unknown[], TReturn>(
  func: FunctionSignature<TArgs, TReturn>,
  wait: number,
  options: DebounceOptions = {}
): DebouncedFunction<TArgs, TReturn> {
  let timeoutId: number | null = null;
  let lastExecTime = 0;
  let lastArgs: TArgs | null = null;
  let lastResult: TReturn | undefined;

  const { leading = false, trailing = true, maxWait } = options;

  const debounced = ((...args: TArgs): TReturn | undefined => {
    const now = performance.now();
    const timeSinceLastExec = now - lastExecTime;

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (leading && timeSinceLastExec >= wait) {
      lastExecTime = now;
      lastResult = func(...args);
      return lastResult;
    }

    if (trailing) {
      lastArgs = args;
      const delay = maxWait ? Math.min(wait, maxWait - timeSinceLastExec) : wait;

      timeoutId = window.setTimeout(() => {
        if (lastArgs) {
          lastExecTime = performance.now();
          lastResult = func(...lastArgs);
          lastArgs = null;
        }
      }, delay);
    }

    return lastResult;
  }) as DebouncedFunction<TArgs, TReturn>;

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };

  debounced.flush = () => {
    if (lastArgs) {
      lastExecTime = performance.now();
      lastResult = func(...lastArgs);
      lastArgs = null;
      return lastResult;
    }
    return lastResult;
  };

  return debounced;
}
