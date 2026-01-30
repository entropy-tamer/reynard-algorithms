/**
 * @file Auto-tuner core implementation
 *
 * Core AutoTuner class implementation for algorithm calibration and optimization.
 */

import { performance } from "perf_hooks";
import { getConfigManager } from "../config/algorithm-config";
import type { AutoTunerConfig, CalibrationResult, AlgorithmCalibrationResult } from "./auto-tuner-types";
import { generateTestDatasets } from "./auto-tuner-helpers";
import { generateRecommendedConfig } from "./auto-tuner-analysis";
import { loadExistingCalibration, saveCalibrationResult } from "./auto-tuner-storage";
import { calibrateCollisionAlgorithms, calibratePathfindingAlgorithms } from "./auto-tuner-calibration";

/**
 * Auto-tuner class for machine-specific algorithm optimization
 */
export class AutoTuner {
  private configManager = getConfigManager();
  private autoTunerConfig: AutoTunerConfig;

  /**
   * @param autoTunerConfig - Optional configuration overrides
   * @example
   */
  constructor(autoTunerConfig: Partial<AutoTunerConfig> = {}) {
    const config = this.configManager.getConfig();
    this.autoTunerConfig = {
      verbose: false,
      maxCalibrationTime: config.autoTuning.calibration.maxCalibrationTime,
      testDatasetCount: 5,
      datasetSizeRange: {
        min: 10,
        max: 1000,
        step: 50,
      },
      saveResults: true,
      loadExisting: true,
      ...autoTunerConfig,
    };
  }

  /**
   * Run complete calibration for all algorithms
   *
   * @returns Calibration result with optimal thresholds
   * @example
   * ```ts
   * const tuner = new AutoTuner({ verbose: true });
   * const result = await tuner.calibrate();
   * ```
   */
  public async calibrate(): Promise<CalibrationResult> {
    const startTime = performance.now();
    this.log("Starting algorithm calibration...");

    // Check for existing calibration
    if (this.autoTunerConfig.loadExisting) {
      const existing = loadExistingCalibration(this.autoTunerConfig.verbose);
      if (existing) {
        this.log("Using existing calibration results");
        return existing;
      }
    }

    const machineFingerprint = this.configManager.getMachineFingerprint();
    if (!machineFingerprint) {
      throw new Error("Unable to generate machine fingerprint");
    }

    // Generate test datasets
    const testDatasets = generateTestDatasets(
      this.autoTunerConfig.datasetSizeRange,
      this.autoTunerConfig.testDatasetCount
    );
    this.log(`Generated ${testDatasets.length} test datasets`);

    // Calibrate each algorithm type
    const algorithms: AlgorithmCalibrationResult[] = [];

    // Calibrate collision detection algorithms
    const collisionCalibration = await calibrateCollisionAlgorithms(testDatasets, this.log.bind(this));
    algorithms.push(...collisionCalibration);

    // Calibrate pathfinding algorithms
    const pathfindingCalibration = await calibratePathfindingAlgorithms(testDatasets, this.log.bind(this));
    algorithms.push(...pathfindingCalibration);

    // Generate recommended configuration
    const config = this.configManager.getConfig();
    const recommendedConfig = generateRecommendedConfig(algorithms, config);

    const calibrationTime = performance.now() - startTime;
    const result: CalibrationResult = {
      machineFingerprint,
      timestamp: Date.now(),
      calibrationTime,
      algorithms,
      recommendedConfig,
      metadata: {
        testDatasets: testDatasets.length,
        totalIterations: algorithms.reduce(
          (sum, alg) => sum + alg.testResults.reduce((s, test) => s + test.iterations, 0),
          0
        ),
        version: "1.0.0",
      },
    };

    // Save results if enabled
    if (this.autoTunerConfig.saveResults) {
      saveCalibrationResult(result, this.autoTunerConfig.verbose);
    }

    this.log(`Calibration completed in ${calibrationTime.toFixed(2)}ms`);
    return result;
  }

  /**
   * Log message if verbose mode is enabled
   *
   * @param message - Message to log
   * @example
   */
  private log(message: string): void {
    if (this.autoTunerConfig.verbose) {
      console.log(`[AutoTuner] ${message}`);
    }
  }
}
