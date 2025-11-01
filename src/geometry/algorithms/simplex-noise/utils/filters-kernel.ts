/**
 * @file algorithms/geometry/algorithms/simplex-noise/utils/filters-kernel
 * @module algorithms/geometry/algorithms/simplex-noise/utils/filters-kernel
 * @description Kernel-based filter implementations for Simplex Noise.
 */

/**
 * Apply Gaussian filter
 *
 * @param values Input values
 * @param sigma Standard deviation
 * @returns Filtered values
 * @example
 * const filtered = applyGaussianFilter([0.1, 0.5, 0.9, 0.3], 1.0);
 * console.log(filtered); // Output: Gaussian filtered values
 */
export function applyGaussianFilter(values: number[], sigma: number): number[] {
  const kernelSize = Math.ceil(3 * sigma) * 2 + 1;
  const kernel: number[] = [];
  const center = Math.floor(kernelSize / 2);
  
  // Create Gaussian kernel
  for (let i = 0; i < kernelSize; i++) {
    const x = i - center;
    kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
  }
  
  // Normalize kernel
  const sum = kernel.reduce((s, k) => s + k, 0);
  for (let i = 0; i < kernelSize; i++) {
    kernel[i] /= sum;
  }
  
  // Apply convolution
  const filtered: number[] = [];
  for (let i = 0; i < values.length; i++) {
    let sum = 0;
    for (let j = 0; j < kernelSize; j++) {
      const index = i - center + j;
      if (index >= 0 && index < values.length) {
        sum += values[index] * kernel[j];
      }
    }
    filtered[i] = sum;
  }
  
  return filtered;
}

/**
 * Apply median filter
 *
 * @param values Input values
 * @param windowSize Window size
 * @returns Filtered values
 * @example
 * const filtered = applyMedianFilter([0.1, 0.5, 0.9, 0.3], 3);
 * console.log(filtered); // Output: median filtered values
 */
export function applyMedianFilter(values: number[], windowSize: number): number[] {
  const filtered: number[] = [];
  const halfWindow = Math.floor(windowSize / 2);
  
  for (let i = 0; i < values.length; i++) {
    const window: number[] = [];
    for (let j = -halfWindow; j <= halfWindow; j++) {
      const index = i + j;
      if (index >= 0 && index < values.length) {
        window.push(values[index]);
      }
    }
    window.sort((a, b) => a - b);
    filtered[i] = window[Math.floor(window.length / 2)];
  }
  
  return filtered;
}

