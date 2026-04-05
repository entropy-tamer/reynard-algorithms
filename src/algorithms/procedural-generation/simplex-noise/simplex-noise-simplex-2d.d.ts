/**
 * @file Simplex Noise 2D Core Functions
 *
 * Handles core 2D simplex noise calculation
 *
 * @module algorithms/geometry/algorithms/simplex-noise
 */
/**
 * Core 2D simplex noise function
 *
 * @param x X coordinate
 * @param y Y coordinate
 * @param grad3 Gradient table
 * @param perm Permutation table
 * @param permMod12 Permutation mod 12 table
 * @returns Noise value
 * @example
 * const noise = simplex2D(0.5, 0.3, grad3, perm, permMod12);
 * console.log(noise); // Output: noise value in range [-1, 1]
 */
export declare function simplex2D(x: number, y: number, grad3: number[][], perm: number[], permMod12: number[]): number;
//# sourceMappingURL=simplex-noise-simplex-2d.d.ts.map