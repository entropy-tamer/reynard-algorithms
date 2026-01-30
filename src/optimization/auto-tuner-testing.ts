/**
 * @file Auto-tuner testing functions
 *
 * Functions for testing algorithms at different thresholds and collecting results.
 */

import { BenchmarkReport } from "../__tests__/utils/benchmark-utils";
import type { CalibrationTestResult } from "./auto-tuner-types";
import type { TestDataset } from "./auto-tuner-helpers";

/**
 * Test algorithm performance at different thresholds
 *
 * @param algorithm - Algorithm name to test
 * @param testDatasets - Test datasets
 * @param thresholds - Threshold values to test
 * @param testFunction - Test function to execute
 * @param logFn - Optional logging function
 * @returns Test results for each threshold
 * @example
 */
export async function testAlgorithmThresholds(
  algorithm: string,
  testDatasets: TestDataset[],
  thresholds: number[],
  testFunction: (dataset: TestDataset, threshold: number) => Promise<BenchmarkReport>,
  logFn?: (message: string) => void
): Promise<CalibrationTestResult[]> {
  const results: CalibrationTestResult[] = [];

  for (const threshold of thresholds) {
    if (logFn) {
      logFn(`Testing ${algorithm} algorithm at threshold ${threshold}...`);
    }

    const testResults: BenchmarkReport[] = [];

    for (const dataset of testDatasets) {
      try {
        const report = await testFunction(dataset, threshold);
        testResults.push(report);
      } catch (error) {
        if (logFn) {
          logFn(`Error testing ${algorithm} at threshold ${threshold}: ${error}`);
        }
      }
    }

    if (testResults.length > 0) {
      const averageTime = testResults.reduce((sum, r) => sum + r.statistics.median, 0) / testResults.length;
      const standardDeviation = Math.sqrt(
        testResults.reduce((sum, r) => sum + Math.pow(r.statistics.median - averageTime, 2), 0) / testResults.length
      );
      const totalIterations = testResults.reduce((sum, r) => sum + r.statistics.sampleCount, 0);
      const memoryUsage = testResults.reduce(
        (sum, r) => sum + r.rawResults.reduce((s, res) => s + res.memoryUsage, 0),
        0
      );

      results.push({
        threshold,
        algorithm: algorithm as "naive" | "spatial" | "optimized",
        averageTime,
        standardDeviation,
        iterations: totalIterations,
        memoryUsage,
        isOptimal: false, // Will be set during analysis
      });
    }
  }

  return results;
}
