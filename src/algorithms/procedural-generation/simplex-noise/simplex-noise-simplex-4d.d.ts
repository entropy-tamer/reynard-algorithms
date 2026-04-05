/**
 * @file algorithms/geometry/algorithms/simplex-noise/simplex-noise-simplex-4d
 * @module algorithms/geometry/algorithms/simplex-noise
 * @description Simplex Noise 4D Core Functions - Handles core 4D simplex noise calculation
 */
/**
 * Core 4D simplex noise function
 *
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate
 * @param w W coordinate
 * @param grad4 Gradient table
 * @param perm Permutation table
 * @param _permMod12 Permutation mod 12 table (unused in 4D implementation)
 * @returns Noise value
 * @example
 * const noise = simplex4D(0.5, 0.3, 0.7, 0.2, grad4, perm, permMod12);
 * console.log(noise); // Output: noise value in range [-1, 1]
 */
export declare function simplex4D(x: number, y: number, z: number, w: number, grad4: number[][], perm: number[], _permMod12: number[]): number;
//# sourceMappingURL=simplex-noise-simplex-4d.d.ts.map