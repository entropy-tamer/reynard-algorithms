/**
 * @file Auto-tuner calibration functions
 *
 * Functions for calibrating different algorithm types.
 */

import { getConfigManager } from "../config/algorithm-config";
import type { AlgorithmCalibrationResult } from "./auto-tuner-types";
import type { TestDataset } from "./auto-tuner-helpers";
import { runNaiveCollisionTest, runSpatialCollisionTest, runOptimizedCollisionTest } from "./auto-tuner-helpers";
import { analyzeAlgorithmResults } from "./auto-tuner-analysis";
import { testAlgorithmThresholds } from "./auto-tuner-testing";

/**
 * Calibrate collision detection algorithms
 *
 * @param testDatasets - Test datasets for calibration
 * @param logFn - Optional logging function
 * @returns Calibration results for collision algorithms
 * @example
 */
export async function calibrateCollisionAlgorithms(
  testDatasets: TestDataset[],
  logFn?: (message: string) => void
): Promise<AlgorithmCalibrationResult[]> {
  if (logFn) {
    logFn("Calibrating collision detection algorithms...");
  }

  const configManager = getConfigManager();
  const config = configManager.getConfig();
  const thresholds = config.autoTuning.calibration.testThresholds;

  const algorithms: AlgorithmCalibrationResult[] = [];

  // Test naive algorithm
  const naiveResults = await testAlgorithmThresholds("naive", testDatasets, thresholds, runNaiveCollisionTest, logFn);
  algorithms.push(analyzeAlgorithmResults("naive", naiveResults));

  // Test spatial algorithm
  const spatialResults = await testAlgorithmThresholds(
    "spatial",
    testDatasets,
    thresholds,
    runSpatialCollisionTest,
    logFn
  );
  algorithms.push(analyzeAlgorithmResults("spatial", spatialResults));

  // Test optimized algorithm
  const optimizedResults = await testAlgorithmThresholds(
    "optimized",
    testDatasets,
    thresholds,
    runOptimizedCollisionTest,
    logFn
  );
  algorithms.push(analyzeAlgorithmResults("optimized", optimizedResults));

  return algorithms;
}

/**
 * Calibrate pathfinding algorithms
 *
 * @param _testDatasets - Test datasets (currently unused)
 * @param logFn - Optional logging function
 * @returns Calibration results for pathfinding algorithms
 * @example
 */
export async function calibratePathfindingAlgorithms(
  _testDatasets: TestDataset[],
  logFn?: (message: string) => void
): Promise<AlgorithmCalibrationResult[]> {
  if (logFn) {
    logFn("Calibrating pathfinding algorithms...");
  }

  // For now, we'll focus on collision detection
  // Pathfinding calibration can be added later
  return [];
}




