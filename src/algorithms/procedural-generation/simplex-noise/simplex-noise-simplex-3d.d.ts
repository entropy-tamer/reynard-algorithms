/**
 * @file Simplex Noise 3D Core Functions
 *
 * Handles core 3D simplex noise calculation
 *
 * @module algorithms/geometry/algorithms/simplex-noise
 */
/**
 * Core 3D simplex noise function
 *
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate
 * @param grad3 Gradient table
 * @param perm Permutation table
 * @param permMod12 Permutation mod 12 table
 * @returns Noise value
 * @example
 * const noise = simplex3D(0.5, 0.3, 0.7, grad3, perm, permMod12);
 * console.log(noise); // Output: noise value in range [-1, 1]
 */
export declare function simplex3D(x: number, y: number, z: number, grad3: number[][], perm: number[], permMod12: number[]): number;
//# sourceMappingURL=simplex-noise-simplex-3d.d.ts.map