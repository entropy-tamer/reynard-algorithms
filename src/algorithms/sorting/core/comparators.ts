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
export const numericComparator: Comparator<number> = (a, b) => a - b;

/**
 * Standard numeric comparator (descending)
 * @param a
 * @param b
 * @example
 */
export const numericComparatorDesc: Comparator<number> = (a, b) => b - a;

/**
 * Standard string comparator (ascending, case-sensitive)
 * @param a
 * @param b
 * @example
 */
export const stringComparator: Comparator<string> = (a, b) => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

/**
 * Case-insensitive string comparator (ascending)
 * @param a
 * @param b
 * @example
 */
export const stringComparatorCaseInsensitive: Comparator<string> = (a, b) => {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  if (aLower < bLower) return -1;
  if (aLower > bLower) return 1;
  return 0;
};

/**
 * Generic comparator that uses natural ordering
 * @param a
 * @param b
 * @example
 */
export const defaultComparator = <T>(a: T, b: T): number => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

/**
 * Reverse any comparator
 * @param comparator
 * @example
 */
export const reverseComparator = <T>(comparator: Comparator<T>): Comparator<T> => {
  return (a, b) => -comparator(a, b);
};

/**
 * Create a comparator for objects based on a key
 * @param key
 * @param ascending
 * @example
 */
export const keyComparator = <T, K extends keyof T>(
  key: K,
  ascending = true
): Comparator<T> => {
  return (a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return ascending ? result : -result;
  };
};

/**
 * Compose multiple comparators (tries first, then second if equal, etc.)
 * @param {...any} comparators
 * @example
 */
export const composeComparators = <T>(...comparators: Comparator<T>[]): Comparator<T> => {
  return (a, b) => {
    for (const comparator of comparators) {
      const result = comparator(a, b);
      if (result !== 0) return result;
    }
    return 0;
  };
};
