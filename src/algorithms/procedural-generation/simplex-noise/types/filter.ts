/**
 * @file algorithms/geometry/algorithms/simplex-noise/types/filter
 * @module algorithms/geometry/algorithms/simplex-noise/types/filter
 * @description Filter type definitions for Simplex Noise.
 */

/**
 * Options for noise filtering.
 */
export interface NoiseFilterOptions {
  /**
   * The type of filter to apply.
   */
  filterType: "lowpass" | "highpass" | "bandpass" | "bandstop" | "gaussian" | "median";
  /**
   * The cutoff frequency for the filter.
   */
  cutoffFrequency: number;
  /**
   * The filter order (for higher-order filters).
   * @default 1
   */
  order?: number;
  /**
   * The bandwidth for bandpass/bandstop filters.
   * @default 0.1
   */
  bandwidth?: number;
  /** Optional extra parameters for advanced filters */
  filterParams?: Record<string, unknown>;
}

/**
 * Result of noise filtering.
 */
export interface NoiseFilterResult {
  /**
   * The filtered noise values.
   */
  filteredValues: number[];
  /**
   * The original noise values.
   */
  originalValues: number[];
  /**
   * The filter response.
   */
  filterResponse: number[];
  /**
   * Statistics about the filtering operation.
   */
  stats: {
    executionTime: number;
    filterGain: number;
    noiseReduction: number;
  };
}
