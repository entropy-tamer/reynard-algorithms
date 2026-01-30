/**
 * @file Auto-tuner helper functions
 *
 * Helper functions for dataset generation, test execution, and random number generation.
 */

import { benchmarkUtils, BenchmarkReport } from "../__tests__/utils/benchmark-utils";

export type TestDataset = Array<{ x: number; y: number; width: number; height: number }>;

/**
 * Generate test datasets for calibration
 *
 * @param datasetSizeRange - Size range configuration
 * @param datasetSizeRange.min
 * @param testDatasetCount - Number of datasets per size
 * @param datasetSizeRange.max
 * @param datasetSizeRange.step
 * @returns Array of test datasets
 * @example
 */
export function generateTestDatasets(
  datasetSizeRange: { min: number; max: number; step: number },
  testDatasetCount: number
): TestDataset[] {
  const datasets: TestDataset[] = [];

  for (let size = datasetSizeRange.min; size <= datasetSizeRange.max; size += datasetSizeRange.step) {
    for (let i = 0; i < testDatasetCount; i++) {
      datasets.push(generateRandomAABBs(size));
    }
  }

  return datasets;
}

/**
 * Generate random AABBs for testing
 *
 * @param count - Number of AABBs to generate
 * @returns Array of AABB objects
 * @example
 */
export function generateRandomAABBs(count: number): TestDataset {
  const aabbs: TestDataset = [];
  const rng = createSeededRng(42 + count);

  for (let i = 0; i < count; i++) {
    aabbs.push({
      x: rng() * 1000,
      y: rng() * 1000,
      width: 10 + rng() * 20,
      height: 10 + rng() * 20,
    });
  }

  return aabbs;
}

/**
 * Create seeded random number generator
 *
 * @param seed - Random seed
 * @returns Random number generator function
 * @example
 */
export function createSeededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

/**
 * Test naive collision algorithm
 *
 * @param _dataset - Test dataset (currently unused)
 * @param _threshold - Threshold value (currently unused)
 * @returns Benchmark report
 * @example
 */
export async function runNaiveCollisionTest(_dataset: TestDataset, _threshold: number): Promise<BenchmarkReport> {
  // Mock implementation - would use actual naive collision detection
  return benchmarkUtils.createReport("naive-test", [
    {
      executionTime: Math.random() * 10 + 1,
      memoryUsage: 1024,
      timestamp: Date.now(),
    },
  ]);
}

/**
 * Test spatial collision algorithm
 *
 * @param _dataset - Test dataset (currently unused)
 * @param _threshold - Threshold value (currently unused)
 * @returns Benchmark report
 * @example
 */
export async function runSpatialCollisionTest(_dataset: TestDataset, _threshold: number): Promise<BenchmarkReport> {
  // Mock implementation - would use actual spatial collision detection
  return benchmarkUtils.createReport("spatial-test", [
    {
      executionTime: Math.random() * 5 + 0.5,
      memoryUsage: 2048,
      timestamp: Date.now(),
    },
  ]);
}

/**
 * Test optimized collision algorithm
 *
 * @param _dataset - Test dataset (currently unused)
 * @param _threshold - Threshold value (currently unused)
 * @returns Benchmark report
 * @example
 */
export async function runOptimizedCollisionTest(_dataset: TestDataset, _threshold: number): Promise<BenchmarkReport> {
  // Mock implementation - would use actual optimized collision detection
  return benchmarkUtils.createReport("optimized-test", [
    {
      executionTime: Math.random() * 3 + 0.2,
      memoryUsage: 1536,
      timestamp: Date.now(),
    },
  ]);
}
