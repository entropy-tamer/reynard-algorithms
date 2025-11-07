/**
 * @file Auto-tuner storage functions
 *
 * Functions for loading and saving calibration results to disk.
 */

import { getConfigManager } from "../config/algorithm-config";
import { getFs, getPath } from "../config/algorithm-config-node-utils";
import type { CalibrationResult } from "./auto-tuner-types";

/**
 * Load existing calibration results from disk
 *
 * @param verbose - Whether to log messages
 * @returns Existing calibration result or null
 * @example
 */
export function loadExistingCalibration(verbose: boolean): CalibrationResult | null {
  try {
    const configManager = getConfigManager();
    const machineFingerprint = configManager.getMachineFingerprint();
    if (!machineFingerprint) return null;

    const config = configManager.getConfig();
    const cacheDir = config.autoTuning.calibrationCacheDir;
    const fs = getFs();
    const path = getPath();

    if (!fs || !path) return null;

    const calibrationFile = path.join(cacheDir, `calibration-${machineFingerprint.hash}.json`);

    if (fs.existsSync(calibrationFile)) {
      const data = fs.readFileSync(calibrationFile, "utf-8");
      return JSON.parse(data) as CalibrationResult;
    }
  } catch (error) {
    if (verbose) {
      console.log(`[AutoTuner] Failed to load existing calibration: ${error}`);
    }
  }

  return null;
}

/**
 * Save calibration results to disk
 *
 * @param result - Calibration result to save
 * @param verbose - Whether to log messages
 * @example
 */
export function saveCalibrationResult(result: CalibrationResult, verbose: boolean): void {
  try {
    const configManager = getConfigManager();
    const config = configManager.getConfig();
    const cacheDir = config.autoTuning.calibrationCacheDir;
    const fs = getFs();
    const path = getPath();

    if (!fs || !path) return;

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const calibrationFile = path.join(cacheDir, `calibration-${result.machineFingerprint.hash}.json`);
    fs.writeFileSync(calibrationFile, JSON.stringify(result, null, 2));

    if (verbose) {
      console.log(`[AutoTuner] Calibration results saved to ${calibrationFile}`);
    }
  } catch (error) {
    if (verbose) {
      console.log(`[AutoTuner] Failed to save calibration results: ${error}`);
    }
  }
}













