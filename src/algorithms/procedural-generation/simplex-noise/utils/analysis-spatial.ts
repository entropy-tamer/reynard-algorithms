/**
 * @file algorithms/geometry/algorithms/simplex-noise/utils/analysis-spatial
 * @module algorithms/geometry/algorithms/simplex-noise/utils/analysis-spatial
 * @description Spatial analysis utilities for Simplex Noise.
 */

/**
 * Compute spatial properties
 *
 * @param values Array of noise values
 * @returns Spatial properties
 * @example
 * const spatial = computeSpatialProperties([0.1, 0.5, 0.9, 0.3]);
 * console.log(spatial.localVariance); // Output: local variance value
 */
export function computeSpatialProperties(values: number[]): any {
  if (values.length === 0) {
    return {
      spatialCoherence: 0,
      localVariance: 0,
      gradientMagnitude: 0,
      edgeDensity: 0,
    };
  }

  // Local variance (using sliding window)
  const windowSize = Math.min(5, Math.floor(values.length / 10));
  let localVarianceSum = 0;
  let localVarianceCount = 0;

  for (let i = 0; i <= values.length - windowSize; i++) {
    const window = values.slice(i, i + windowSize);
    const windowMean = window.reduce((sum, val) => sum + val, 0) / window.length;
    const windowVariance = window.reduce((sum, val) => sum + (val - windowMean) ** 2, 0) / window.length;
    localVarianceSum += windowVariance;
    localVarianceCount++;
  }

  const localVariance = localVarianceCount > 0 ? localVarianceSum / localVarianceCount : 0;

  // Gradient magnitude (approximate)
  let gradientSum = 0;
  for (let i = 1; i < values.length; i++) {
    gradientSum += Math.abs(values[i] - values[i - 1]);
  }
  const gradientMagnitude = gradientSum / (values.length - 1);

  // Edge density (threshold-based)
  const threshold = 0.1; // Adjust based on noise characteristics
  let edges = 0;
  for (let i = 1; i < values.length; i++) {
    if (Math.abs(values[i] - values[i - 1]) > threshold) {
      edges++;
    }
  }
  const edgeDensity = edges / (values.length - 1);

  return {
    spatialCoherence: 1 - localVariance, // Higher coherence = lower local variance
    localVariance,
    gradientMagnitude,
    edgeDensity,
  };
}
