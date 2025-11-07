/**
 * @file Auto-tuner type definitions
 *
 * Provides type definitions for the auto-tuning system including calibration
 * results, configurations, and algorithm test results.
 */

import { AlgorithmConfig, MachineFingerprint } from "../config/algorithm-config";

/**
 * Calibration test result for a specific threshold
 */
export interface CalibrationTestResult {
  /** Threshold value tested */
  threshold: number;
  /** Algorithm type tested */
  algorithm: "naive" | "spatial" | "optimized";
  /** Average execution time */
  averageTime: number;
  /** Standard deviation */
  standardDeviation: number;
  /** Number of iterations run */
  iterations: number;
  /** Memory usage */
  memoryUsage: number;
  /** Whether this threshold performed well */
  isOptimal: boolean;
}

/**
 * Calibration result for a specific algorithm type
 */
export interface AlgorithmCalibrationResult {
  /** Algorithm type */
  algorithm: "naive" | "spatial" | "optimized";
  /** Optimal threshold range */
  optimalThreshold: {
    min: number;
    max: number;
    recommended: number;
  };
  /** Performance characteristics */
  performance: {
    /** Best average execution time */
    bestTime: number;
    /** Worst average execution time */
    worstTime: number;
    /** Performance stability (coefficient of variation) */
    stability: number;
  };
  /** Test results for all thresholds */
  testResults: CalibrationTestResult[];
  /** Confidence level in the calibration */
  confidence: number;
}

/**
 * Complete calibration result
 */
export interface CalibrationResult {
  /** Machine fingerprint */
  machineFingerprint: MachineFingerprint;
  /** Calibration timestamp */
  timestamp: number;
  /** Total calibration time */
  calibrationTime: number;
  /** Algorithm calibration results */
  algorithms: AlgorithmCalibrationResult[];
  /** Recommended configuration */
  recommendedConfig: Partial<AlgorithmConfig>;
  /** Calibration metadata */
  metadata: {
    /** Number of test datasets used */
    testDatasets: number;
    /** Total iterations run */
    totalIterations: number;
    /** Calibration version */
    version: string;
  };
}

/**
 * Auto-tuner configuration
 */
export interface AutoTunerConfig {
  /** Whether to enable verbose logging */
  verbose: boolean;
  /** Maximum calibration time in milliseconds */
  maxCalibrationTime: number;
  /** Number of test datasets to generate */
  testDatasetCount: number;
  /** Size range for test datasets */
  datasetSizeRange: {
    min: number;
    max: number;
    step: number;
  };
  /** Whether to save calibration results */
  saveResults: boolean;
  /** Whether to load existing calibration if available */
  loadExisting: boolean;
}
