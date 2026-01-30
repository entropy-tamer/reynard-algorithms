/**
 * @file FFT validation utilities
 *
 * Provides heuristics for detecting integer-cycle alignment issues and
 * low-frequency transients in FFT results.
 */

import type {
  FFTResult,
  FFTValidationWarning,
  FFTValidationIntegerCyclesOptions,
  FFTValidationTransientOptions,
} from "./fft-types";

const DEFAULT_TOLERANCE = 0.05; // 5% of a cycle
const DEFAULT_LOW_FREQ_THRESHOLD = 1; // 1 Hz
const DEFAULT_TRANSIENT_RATIO = 0.1; // 10% of total energy

/**
 * Validate whether the analyzed window contains an integer number of cycles
 * for the dominant frequency.
 * @param args
 * @param args.result
 * @param args.sampleRate
 * @param args.size
 * @param args.options
 * @example
 */
export function validateIntegerCycles(args: {
  result: FFTResult;
  sampleRate: number;
  size: number;
  options?: FFTValidationIntegerCyclesOptions;
}): FFTValidationWarning | undefined {
  const { result, sampleRate, size, options } = args;
  if (!options?.enabled) {
    return undefined;
  }

  const tolerance = options.tolerance ?? DEFAULT_TOLERANCE;
  const durationSeconds = size / sampleRate;

  const frequency =
    options.fundamentalFrequency ??
    findDominantFrequency(result);

  if (!frequency || frequency <= 0) {
    return undefined;
  }

  const cycles = frequency * durationSeconds;
  const deviation = Math.abs(cycles - Math.round(cycles ?? 0));
  const minCycles = options.minimumCycles ?? 1;

  if (cycles < minCycles || deviation <= tolerance) {
    return undefined;
  }

  return {
    type: "integer-cycles",
    severity: "warning",
    message: `Window contains ${cycles.toFixed(2)} cycles at ${frequency.toFixed(
      2
    )} Hz (deviation ${deviation.toFixed(3)}). Consider synchronizing the window with the fundamental frequency.`,
    details: {
      cycles,
      frequency,
      durationSeconds,
      deviation,
    },
  };
}

/**
 * Validate the amount of low-frequency energy that may indicate transient drift.
 * @param args
 * @param args.result
 * @param args.options
 * @example
 */
export function validateTransients(args: {
  result: FFTResult;
  options?: FFTValidationTransientOptions;
}): FFTValidationWarning | undefined {
  const { result, options } = args;
  if (!options?.enabled) {
    return undefined;
  }

  const threshold = options.lowFrequencyThreshold ?? DEFAULT_LOW_FREQ_THRESHOLD;
  const ratioThreshold = options.energyRatioThreshold ?? DEFAULT_TRANSIENT_RATIO;

  let lowFrequencyEnergy = 0;
  let totalEnergy = 0;

  for (let i = 0; i < result.power.length; i++) {
    const freq = result.frequencies[i] || 0;
    const power = result.power[i] || 0;
    totalEnergy += power;
    if (freq <= threshold) {
      lowFrequencyEnergy += power;
    }
  }

  if (totalEnergy <= 0) {
    return undefined;
  }

  const ratio = lowFrequencyEnergy / totalEnergy;

  if (ratio <= ratioThreshold) {
    return undefined;
  }

  return {
    type: "transients",
    severity: "warning",
    message: `Low-frequency energy accounts for ${(ratio * 100).toFixed(
      1
    )}% of total power (threshold ${ratioThreshold * 100}%). This often indicates transient drift or a window that is too long.`,
    details: {
      lowFrequencyEnergy,
      totalEnergy,
      ratio,
      threshold,
    },
  };
}

/**
 *
 * @param result
 * @example
 */
function findDominantFrequency(result: FFTResult): number | undefined {
  let maxMagnitude = 0;
  let dominantFrequency: number | undefined;

  for (let i = 1; i < result.magnitude.length; i++) {
    const magnitude = result.magnitude[i] || 0;
    if (magnitude > maxMagnitude) {
      maxMagnitude = magnitude;
      dominantFrequency = result.frequencies[i] || 0;
    }
  }

  return dominantFrequency;
}

