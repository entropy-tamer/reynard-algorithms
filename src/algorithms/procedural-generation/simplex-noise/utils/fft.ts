/**
 * @file algorithms/geometry/algorithms/simplex-noise/utils/fft
 * @module algorithms/geometry/algorithms/simplex-noise/utils/fft
 * @description FFT implementation utilities for Simplex Noise frequency analysis.
 */

/**
 * Simple FFT implementation
 *
 * @param values Input values
 * @returns FFT result
 * @example
 * const fft = simpleFFT([0.1, 0.5, 0.9, 0.3]);
 * console.log(fft[0].real, fft[0].imag); // Output: real and imaginary parts
 */
export function simpleFFT(values: number[]): Array<{ real: number; imag: number }> {
  const n = values.length;
  const result: Array<{ real: number; imag: number }> = [];

  for (let k = 0; k < n; k++) {
    let real = 0;
    let imag = 0;

    for (let t = 0; t < n; t++) {
      const angle = (-2 * Math.PI * k * t) / n;
      real += values[t] * Math.cos(angle);
      imag += values[t] * Math.sin(angle);
    }

    result.push({ real, imag });
  }

  return result;
}
