/**
 * @file Auto-Tuning System
 *
 * Provides machine-specific algorithm optimization through dynamic calibration
 * of thresholds and parameters. Uses machine fingerprinting to cache optimal
 * configurations and automatically tune algorithms for specific hardware.
 *
 * @module algorithms/autoTuner
 */

export * from "./auto-tuner-types";
export * from "./auto-tuner-core";
export * from "./memo-tuning";
import { AutoTuner } from "./auto-tuner-core";
import type { AutoTunerConfig, CalibrationResult } from "./auto-tuner-types";

/**
 * Global auto-tuner instance
 */
export const autoTuner = new AutoTuner();

/**
 * Convenience function to run calibration
 *
 * @param options - Optional configuration overrides
 * @returns Calibration result
 * @example
 * ```ts
 * const result = await calibrateAlgorithms({ verbose: true });
 * ```
 */
export async function calibrateAlgorithms(options: Partial<AutoTunerConfig> = {}): Promise<CalibrationResult> {
  const tuner = new AutoTuner(options);
  return await tuner.calibrate();
}

/**
 * CLI command for calibration
 *
 * @example
 * ```ts
 * await runCalibrationCLI();
 * ```
 */
export async function runCalibrationCLI(): Promise<void> {
  console.log("Starting algorithm calibration...");

  try {
    const result = await calibrateAlgorithms({ verbose: true });

    console.log("\nCalibration Results:");
    console.log(`Machine: ${result.machineFingerprint.cpuModel} (${result.machineFingerprint.cores} cores)`);
    console.log(`Calibration Time: ${result.calibrationTime.toFixed(2)}ms`);
    console.log(`Algorithms Tested: ${result.algorithms.length}`);

    for (const algorithm of result.algorithms) {
      console.log(`\n${algorithm.algorithm.toUpperCase()}:`);
      console.log(`  Optimal Threshold: ${algorithm.optimalThreshold.recommended}`);
      console.log(`  Range: ${algorithm.optimalThreshold.min} - ${algorithm.optimalThreshold.max}`);
      console.log(`  Best Time: ${algorithm.performance.bestTime.toFixed(3)}ms`);
      console.log(`  Stability: ${(algorithm.performance.stability * 100).toFixed(1)}%`);
      console.log(`  Confidence: ${(algorithm.confidence * 100).toFixed(1)}%`);
    }

    if (result.recommendedConfig.thresholds) {
      console.log("\nRecommended Configuration:");
      console.log(JSON.stringify(result.recommendedConfig, null, 2));
    }

    console.log("\nCalibration completed successfully!");
  } catch (error) {
    console.error("Calibration failed:", error);
    process.exit(1);
  }
}
