/**
 * @file algorithms/geometry/algorithms/simplex-noise/utils/analysis-frequency
 * @module algorithms/geometry/algorithms/simplex-noise/utils/analysis-frequency
 * @description Frequency domain analysis utilities for Simplex Noise.
 */

import { simpleFFT } from "./fft.js";

/**
 * Compute frequency domain properties
 *
 * @param values Array of noise values
 * @returns Frequency domain properties
 * @example
 * const freqProps = computeFrequencyDomainProperties([0.1, 0.5, 0.9, 0.3]);
 * console.log(freqProps.dominantFrequencies); // Output: array of dominant frequency indices
 */
export function computeFrequencyDomainProperties(values: number[]): any {
  if (values.length === 0) {
    return {
      dominantFrequencies: [],
      spectralCentroid: 0,
      spectralRolloff: 0,
      spectralFlux: 0,
      zeroCrossingRate: 0,
    };
  }

  // Simple frequency analysis using FFT approximation
  const n = values.length;
  const fft = simpleFFT(values);
  const magnitudes = fft.map(complex => Math.sqrt(complex.real * complex.real + complex.imag * complex.imag));
  
  // Find dominant frequencies
  const sortedIndices = magnitudes
    .map((mag, index) => ({ mag, index }))
    .sort((a, b) => b.mag - a.mag)
    .slice(0, 5)
    .map(item => item.index);

  // Spectral centroid
  const spectralCentroid = magnitudes.reduce((sum, mag, index) => sum + mag * index, 0) / 
    magnitudes.reduce((sum, mag) => sum + mag, 0);

  // Spectral rolloff (95% of energy)
  const totalEnergy = magnitudes.reduce((sum, mag) => sum + mag * mag, 0);
  let cumulativeEnergy = 0;
  let spectralRolloff = 0;
  for (let i = 0; i < magnitudes.length; i++) {
    cumulativeEnergy += magnitudes[i] * magnitudes[i];
    if (cumulativeEnergy >= 0.95 * totalEnergy) {
      spectralRolloff = i;
      break;
    }
  }

  // Zero crossing rate
  let zeroCrossings = 0;
  for (let i = 1; i < values.length; i++) {
    if ((values[i] >= 0) !== (values[i - 1] >= 0)) {
      zeroCrossings++;
    }
  }
  const zeroCrossingRate = zeroCrossings / (values.length - 1);

  return {
    dominantFrequencies: sortedIndices,
    spectralCentroid,
    spectralRolloff,
    spectralFlux: 0, // Would need previous frame for this
    zeroCrossingRate,
  };
}

