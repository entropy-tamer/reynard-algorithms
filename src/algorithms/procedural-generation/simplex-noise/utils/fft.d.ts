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
export declare function simpleFFT(values: number[]): Array<{
    real: number;
    imag: number;
}>;
//# sourceMappingURL=fft.d.ts.map