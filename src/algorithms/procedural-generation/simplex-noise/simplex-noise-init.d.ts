/**
 * Simplex Noise Initialization
 *
 * Handles gradient and permutation table initialization
 * for the Simplex Noise algorithm.
 *
 * @module algorithms/geometry/algorithms/simplex-noise
 */
import type { SimplexNoiseConfig } from "./simplex-noise-types";
/**
 * Initialize gradient tables for simplex noise
 *
 * @param _config Simplex noise configuration
 * @returns Gradient tables
 * @example
 */
export declare function initializeGradients(_config: SimplexNoiseConfig): {
    grad3: number[][];
    grad4: number[][];
};
/**
 * Initialize permutation table
 *
 * @param _config Simplex noise configuration
 * @returns Permutation tables
 * @example
 */
export declare function initializePermutation(_config: SimplexNoiseConfig): {
    p: number[];
    perm: number[];
    permMod12: number[];
};
//# sourceMappingURL=simplex-noise-init.d.ts.map