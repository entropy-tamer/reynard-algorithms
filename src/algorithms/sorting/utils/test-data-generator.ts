/**
 * @file Test data generation for sorting algorithms
 * Generates various data patterns for testing and visualization
 */

import type { TestDataOptions } from "../core/types";

/**
 * Simple seeded random number generator
 */
class SeededRandom {
  private seed: number;

  /**
   *
   * @param seed
   * @example
   */
  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   *
   * @example
   */
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

/**
 * Generate test data based on pattern
 * @param options
 * @example
 */
export function generateTestData(options: TestDataOptions): number[] {
  const { size, pattern, min = 1, max = 100, seed, shufflePercentage = 0.1 } = options;
  const rng = seed !== undefined ? new SeededRandom(seed) : null;

  const random = (): number => {
    if (rng) return rng.next();
    return Math.random();
  };

  switch (pattern) {
    case "random":
      return generateRandom(size, min, max, random);

    case "sorted":
      return generateSorted(size, min, max);

    case "reverse":
      return generateReverse(size, min, max);

    case "nearlySorted":
      return generateNearlySorted(size, min, max, shufflePercentage, random);

    case "fewUnique":
      return generateFewUnique(size, min, max, random);

    case "manyDuplicates":
      return generateManyDuplicates(size, min, max, random);

    case "mountain":
      return generateMountain(size, min, max);

    case "valley":
      return generateValley(size, min, max);

    default:
      return generateRandom(size, min, max, random);
  }
}

/**
 * Generate random array
 * @param size
 * @param min
 * @param max
 * @param random
 * @example
 */
function generateRandom(size: number, min: number, max: number, random: () => number): number[] {
  const range = max - min;
  return Array.from({ length: size }, () => Math.floor(min + random() * range));
}

/**
 * Generate sorted array
 * @param size
 * @param min
 * @param max
 * @example
 */
function generateSorted(size: number, min: number, max: number): number[] {
  const range = max - min;
  const step = range / (size - 1);
  return Array.from({ length: size }, (_, i) => Math.floor(min + i * step));
}

/**
 * Generate reverse sorted array
 * @param size
 * @param min
 * @param max
 * @example
 */
function generateReverse(size: number, min: number, max: number): number[] {
  return generateSorted(size, min, max).reverse();
}

/**
 * Generate nearly sorted array
 * @param size
 * @param min
 * @param max
 * @param shufflePercentage
 * @param random
 * @example
 */
function generateNearlySorted(
  size: number,
  min: number,
  max: number,
  shufflePercentage: number,
  random: () => number
): number[] {
  const array = generateSorted(size, min, max);
  const numShuffles = Math.floor(size * shufflePercentage);

  for (let i = 0; i < numShuffles; i++) {
    const idx1 = Math.floor(random() * size);
    const idx2 = Math.floor(random() * size);
    [array[idx1]!, array[idx2]!] = [array[idx2]!, array[idx1]!];
  }

  return array;
}

/**
 * Generate array with few unique values
 * @param size
 * @param min
 * @param max
 * @param random
 * @example
 */
function generateFewUnique(size: number, min: number, max: number, random: () => number): number[] {
  const uniqueCount = Math.max(3, Math.floor(Math.sqrt(size)));
  const uniqueValues: number[] = [];
  const range = max - min;

  for (let i = 0; i < uniqueCount; i++) {
    uniqueValues.push(Math.floor(min + random() * range));
  }

  return Array.from({ length: size }, () => {
    return uniqueValues[Math.floor(random() * uniqueValues.length)]!;
  });
}

/**
 * Generate array with many duplicates
 * @param size
 * @param min
 * @param max
 * @param random
 * @example
 */
function generateManyDuplicates(size: number, min: number, max: number, random: () => number): number[] {
  const range = max - min;
  const commonValue = Math.floor(min + range / 2);
  const array: number[] = [];

  for (let i = 0; i < size; i++) {
    if (random() < 0.7) {
      array.push(commonValue);
    } else {
      array.push(Math.floor(min + random() * range));
    }
  }

  return array;
}

/**
 * Generate mountain pattern (increasing then decreasing)
 * @param size
 * @param min
 * @param max
 * @example
 */
function generateMountain(size: number, min: number, max: number): number[] {
  const range = max - min;
  const peak = Math.floor(size / 2);
  const array: number[] = [];

  for (let i = 0; i < size; i++) {
    const distance = Math.abs(i - peak);
    const value = Math.floor(max - (distance / peak) * range);
    array.push(Math.max(min, value));
  }

  return array;
}

/**
 * Generate valley pattern (decreasing then increasing)
 * @param size
 * @param min
 * @param max
 * @example
 */
function generateValley(size: number, min: number, max: number): number[] {
  const range = max - min;
  const valley = Math.floor(size / 2);
  const array: number[] = [];

  for (let i = 0; i < size; i++) {
    const distance = Math.abs(i - valley);
    const value = Math.floor(min + (distance / valley) * range);
    array.push(Math.min(max, value));
  }

  return array;
}
