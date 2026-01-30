#!/usr/bin/env node

/**
 * Algorithm Calibration CLI
 *
 * Command-line interface for running algorithm calibration and auto-tuning.
 *
 * Usage:
 *   pnpm tune-algorithms
 *   pnpm tune-algorithms --verbose
 *   pnpm tune-algorithms --no-save
 *   pnpm tune-algorithms --load-existing=false
 */

import { runCalibrationCLI } from "../auto-tuner";

// Run calibration if this file is executed directly
/**
 *
 * @example
 */
async function main() {
  try {
    await runCalibrationCLI();
    console.log("✅ Calibration completed successfully!");
  } catch (error) {
    console.error("❌ Calibration failed:", error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runCalibrationCLI };
