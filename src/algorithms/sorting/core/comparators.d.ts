/**
 * @file Standard comparator functions for sorting
 * Provides commonly used comparison functions
 */
import type { Comparator } from "./types";
/**
 * Standard numeric comparator (ascending)
 * @param a
 * @param b
 * @example
 */
export declare const numericComparator: Comparator<number>;
/**
 * Standard numeric comparator (descending)
 * @param a
 * @param b
 * @example
 */
export declare const numericComparatorDesc: Comparator<number>;
/**
 * Standard string comparator (ascending, case-sensitive)
 * @param a
 * @param b
 * @example
 */
export declare const stringComparator: Comparator<string>;
/**
 * Case-insensitive string comparator (ascending)
 * @param a
 * @param b
 * @example
 */
export declare const stringComparatorCaseInsensitive: Comparator<string>;
/**
 * Generic comparator that uses natural ordering
 * @param a
 * @param b
 * @example
 */
export declare const defaultComparator: <T>(a: T, b: T) => number;
/**
 * Reverse any comparator
 * @param comparator
 * @example
 */
export declare const reverseComparator: <T>(comparator: Comparator<T>) => Comparator<T>;
/**
 * Create a comparator for objects based on a key
 * @param key
 * @param ascending
 * @example
 */
export declare const keyComparator: <T, K extends keyof T>(key: K, ascending?: boolean) => Comparator<T>;
/**
 * Compose multiple comparators (tries first, then second if equal, etc.)
 * @param {...any} comparators
 * @example
 */
export declare const composeComparators: <T>(...comparators: Comparator<T>[]) => Comparator<T>;
//# sourceMappingURL=comparators.d.ts.map