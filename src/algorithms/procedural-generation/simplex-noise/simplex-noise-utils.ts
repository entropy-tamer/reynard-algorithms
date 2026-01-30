/**
 * @file algorithms/geometry/algorithms/simplex-noise/simplex-noise-utils
 * @module algorithms/geometry/algorithms/simplex-noise/utils
 * @description Main utilities entry point for Simplex Noise.
 * Re-exports all utility functions from modular files for backward compatibility.
 */

// Statistics utilities
export { computeStats, computeDetailedStatistics } from "./utils/stats.js";

// Analysis utilities
export { analyzeNoise } from "./utils/analysis.js";
export { computeFrequencyDomainProperties } from "./utils/analysis-frequency.js";
export { computeSpatialProperties } from "./utils/analysis-spatial.js";

// Filter utilities
export { applyFilter, computeFilterResponse, computeFilterGain, computeNoiseReduction } from "./utils/filters.js";

// FFT utilities (internal, but exported for advanced use)
export { simpleFFT } from "./utils/fft.js";
