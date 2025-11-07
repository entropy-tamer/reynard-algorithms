/**
 * @file Auto-tuner analysis functions
 *
 * Functions for analyzing calibration results and generating recommendations.
 */

import type { AlgorithmConfig } from "../config/algorithm-config";
import type {
  CalibrationTestResult,
  AlgorithmCalibrationResult,
} from "./auto-tuner-types";

/**
 * Analyze algorithm test results to find optimal thresholds
 *
 * @param algorithm - Algorithm name
 * @param results - Test results to analyze
 * @returns Calibration result with optimal thresholds
 * @example
 */
export function analyzeAlgorithmResults(
  algorithm: string,
  results: CalibrationTestResult[]
): AlgorithmCalibrationResult {
  if (results.length === 0) {
    throw new Error(`No test results for ${algorithm} algorithm`);
  }

  // Sort by performance (lower is better)
  const sortedResults = [...results].sort((a, b) => a.averageTime - b.averageTime);

  // Find optimal threshold range
  const bestResult = sortedResults[0];
  const worstResult = sortedResults[sortedResults.length - 1];

  // Consider results within 10% of the best as optimal
  const optimalThreshold = bestResult.averageTime * 1.1;
  const optimalResults = sortedResults.filter(r => r.averageTime <= optimalThreshold);

  // Mark optimal results
  optimalResults.forEach(r => (r.isOptimal = true));

  // Calculate performance characteristics
  const bestTime = bestResult.averageTime;
  const worstTime = worstResult.averageTime;
  const stability = bestResult.standardDeviation / bestResult.averageTime;

  // Calculate confidence based on consistency
  const confidence = Math.min(1.0, optimalResults.length / results.length);

  return {
    algorithm: algorithm as "naive" | "spatial" | "optimized",
    optimalThreshold: {
      min: Math.min(...optimalResults.map(r => r.threshold)),
      max: Math.max(...optimalResults.map(r => r.threshold)),
      recommended: bestResult.threshold,
    },
    performance: {
      bestTime,
      worstTime,
      stability,
    },
    testResults: results,
    confidence,
  };
}

/**
 * Find crossover point between two algorithm results
 *
 * @param algorithm1 - First algorithm calibration result
 * @param algorithm2 - Second algorithm calibration result
 * @returns Crossover threshold value
 * @example
 */
export function findCrossoverPoint(
  algorithm1: AlgorithmCalibrationResult,
  algorithm2: AlgorithmCalibrationResult
): number {
  // Find the threshold where algorithm2 becomes better than algorithm1
  const commonThresholds = algorithm1.testResults
    .filter(r1 => algorithm2.testResults.some(r2 => r2.threshold === r1.threshold))
    .map(r1 => r1.threshold)
    .sort((a, b) => a - b);

  for (const threshold of commonThresholds) {
    const result1 = algorithm1.testResults.find(r => r.threshold === threshold);
    const result2 = algorithm2.testResults.find(r => r.threshold === threshold);

    if (result1 && result2 && result2.averageTime < result1.averageTime) {
      return threshold;
    }
  }

  // If no crossover found, use the recommended threshold from algorithm2
  return algorithm2.optimalThreshold.recommended;
}

/**
 * Generate recommended configuration based on calibration results
 *
 * @param algorithms - Calibration results for all algorithms
 * @param currentConfig - Current algorithm configuration
 * @returns Recommended configuration
 * @example
 */
export function generateRecommendedConfig(
  algorithms: AlgorithmCalibrationResult[],
  currentConfig: AlgorithmConfig
): Partial<AlgorithmConfig> {
  const config: Partial<AlgorithmConfig> = {};

  // Find collision detection thresholds
  const naiveResult = algorithms.find(a => a.algorithm === "naive");
  const spatialResult = algorithms.find(a => a.algorithm === "spatial");
  const optimizedResult = algorithms.find(a => a.algorithm === "optimized");

  if (naiveResult && spatialResult) {
    // Find crossover point between naive and spatial
    const crossoverPoint = findCrossoverPoint(naiveResult, spatialResult);
    config.thresholds = {
      ...currentConfig.thresholds,
      naiveToSpatial: crossoverPoint,
    };
  }

  if (spatialResult && optimizedResult) {
    // Find crossover point between spatial and optimized
    const crossoverPoint = findCrossoverPoint(spatialResult, optimizedResult);
    config.thresholds = {
      ...config.thresholds,
      ...currentConfig.thresholds,
      spatialToOptimized: crossoverPoint,
    };
  }

  return config;
}













