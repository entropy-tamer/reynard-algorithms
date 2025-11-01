/**
 * @file algorithms/geometry/algorithms/simplex-noise/utils/stats
 * @module algorithms/geometry/algorithms/simplex-noise/utils/stats
 * @description Statistics computation utilities for Simplex Noise.
 */

import type { NoiseStats } from "../simplex-noise-types.js";

/**
 * Compute variance of values
 *
 * @param values Array of values
 * @returns Variance
 */
function computeVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => (val - mean) ** 2);
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
}

/**
 * Compute basic statistics for noise values
 *
 * @param values Array of noise values
 * @param executionTime Execution time in milliseconds
 * @returns Noise statistics
 * @example
 * const stats = computeStats([0.1, 0.5, 0.9, 0.3], 10);
 * console.log(stats.min, stats.max, stats.mean); // Output: 0.1, 0.9, 0.45
 */
export function computeStats(values: number[], executionTime: number): NoiseStats {
  if (values.length === 0) {
    return {
      min: 0,
      max: 0,
      mean: 0,
      variance: 0,
      standardDeviation: 0,
      executionTime,
      sampleCount: 0,
    };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = computeVariance(values);
  const standardDeviation = Math.sqrt(variance);

  return {
    min,
    max,
    mean,
    variance,
    standardDeviation,
    executionTime,
    sampleCount: values.length,
  };
}

/**
 * Compute detailed statistics for noise values
 *
 * @param values Array of noise values
 * @returns Detailed statistics
 * @example
 * const stats = computeDetailedStatistics([0.1, 0.5, 0.9, 0.3, 0.7]);
 * console.log(stats.median, stats.skewness); // Output: median and skewness values
 */
export function computeDetailedStatistics(values: number[]): any {
  if (values.length === 0) {
    return {
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      mode: 0,
      variance: 0,
      standardDeviation: 0,
      skewness: 0,
      kurtosis: 0,
      range: 0,
      quartiles: { q1: 0, q2: 0, q3: 0 },
      percentiles: { p10: 0, p90: 0, p95: 0, p99: 0 },
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = values.reduce((sum, val) => sum + val, 0) / n;
  const variance = computeVariance(values);
  const standardDeviation = Math.sqrt(variance);

  // Median
  const median = n % 2 === 0 
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 
    : sorted[Math.floor(n / 2)];

  // Quartiles
  const q1 = sorted[Math.floor(n * 0.25)];
  const q3 = sorted[Math.floor(n * 0.75)];

  // Percentiles
  const p10 = sorted[Math.floor(n * 0.1)];
  const p90 = sorted[Math.floor(n * 0.9)];
  const p95 = sorted[Math.floor(n * 0.95)];
  const p99 = sorted[Math.floor(n * 0.99)];

  // Mode (most frequent value)
  const frequency: { [key: number]: number } = {};
  values.forEach(val => {
    const rounded = Math.round(val * 1000) / 1000; // Round to 3 decimal places
    frequency[rounded] = (frequency[rounded] || 0) + 1;
  });
  const mode = Object.keys(frequency).reduce((a, b) => 
    frequency[parseFloat(a)] > frequency[parseFloat(b)] ? a : b
  );

  // Skewness
  const skewness = values.reduce((sum, val) => {
    const diff = val - mean;
    return sum + (diff * diff * diff);
  }, 0) / (n * Math.pow(standardDeviation, 3));

  // Kurtosis
  const kurtosis = values.reduce((sum, val) => {
    const diff = val - mean;
    return sum + (diff * diff * diff * diff);
  }, 0) / (n * Math.pow(standardDeviation, 4)) - 3;

  return {
    min: sorted[0],
    max: sorted[n - 1],
    mean,
    median,
    mode: parseFloat(mode),
    variance,
    standardDeviation,
    skewness,
    kurtosis,
    range: sorted[n - 1] - sorted[0],
    quartiles: { q1, q2: median, q3 },
    percentiles: { p10, p90, p95, p99 },
  };
}
