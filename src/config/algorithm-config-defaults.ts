/**
 * @file Default configuration values for algorithm configuration system
 */

import type { AlgorithmConfig } from "./algorithm-config-types";

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: AlgorithmConfig = {
  thresholds: {
    naiveToSpatial: 100,
    spatialToOptimized: 500,
    pathfindingThreshold: 1000,
    spatialHashThreshold: 400,
  },
  performance: {
    enableDynamicCalibration: true,
    statistics: {
      sampleCount: 10,
      maxCoefficientOfVariation: 0.3,
      toleranceFactor: 1.2,
      removeOutliers: true,
      outlierThreshold: 2.0,
    },
    baselines: {
      smallDataset: 1.0,
      mediumDataset: 5.0,
      largeDataset: 20.0,
    },
  },
  validation: {
    enableInputValidation: true,
    enableDetailedResults: true,
    maxValidationDepth: 10,
    validationTimeout: 5000,
    customRules: {},
  },
  autoTuning: {
    enabled: true,
    calibrationCacheDir: "./.algorithm-cache",
    runOnStartup: false,
    calibration: {
      iterationsPerThreshold: 5,
      testThresholds: [50, 100, 150, 200, 300, 400, 500, 750, 1000],
      minImprovementThreshold: 0.1,
      maxCalibrationTime: 30000,
    },
  },
  memoization: {
    enabled: true,
    defaults: {
      maxSize: 1024,
      ttlMs: 0,
      minHitRate: 0.7,
      overheadBudgetMs: 0.02,
      windowSize: 500,
      minSamples: 200,
    },
  },
  version: "1.0.0",
};



