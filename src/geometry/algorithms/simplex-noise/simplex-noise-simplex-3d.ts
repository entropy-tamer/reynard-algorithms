/**
 * Simplex Noise 3D Core Functions
 *
 * Handles core 3D simplex noise calculation
 *
 * @module algorithms/geometry/algorithms/simplex-noise
 * @file
 */

/**
 * Calculate simplex coordinate offsets based on relative positions
 *
 * @param x0 First relative x coordinate
 * @param y0 First relative y coordinate
 * @param z0 First relative z coordinate
 * @returns Object with i1, j1, k1, i2, j2, k2 offsets
 * @example
 * const offsets = getSimplexOffsets(0.3, 0.5, 0.2);
 * console.log(offsets); // Output: { i1: 1, j1: 0, k1: 0, i2: 1, j2: 1, k2: 0 }
 */
function getSimplexOffsets(x0: number, y0: number, z0: number): { i1: number; j1: number; k1: number; i2: number; j2: number; k2: number } {
  if (x0 >= y0) {
    if (y0 >= z0) return { i1: 1, j1: 0, k1: 0, i2: 1, j2: 1, k2: 0 };
    if (x0 >= z0) return { i1: 1, j1: 0, k1: 0, i2: 1, j2: 0, k2: 1 };
    return { i1: 0, j1: 0, k1: 1, i2: 1, j2: 0, k2: 1 };
  }
  if (y0 < z0) return { i1: 0, j1: 0, k1: 1, i2: 0, j2: 1, k2: 1 };
  if (x0 < z0) return { i1: 0, j1: 1, k1: 0, i2: 0, j2: 1, k2: 1 };
  return { i1: 0, j1: 1, k1: 0, i2: 1, j2: 1, k2: 0 };
}

/**
 * Calculate gradient index for a given simplex coordinate
 *
 * @param i Grid i coordinate
 * @param j Grid j coordinate
 * @param k Grid k coordinate
 * @param di Offset in i direction
 * @param dj Offset in j direction
 * @param dk Offset in k direction
 * @param perm Permutation table
 * @param permMod12 Permutation mod 12 table
 * @returns Gradient index
 * @example
 * const gi = getGradientIndex(10, 20, 30, 1, 0, 0, perm, permMod12);
 * console.log(gi); // Output: gradient index for the specified coordinate
 */
function getGradientIndex(i: number, j: number, k: number, di: number, dj: number, dk: number, perm: number[], permMod12: number[]): number {
  return permMod12[((i & 255) + di) + perm[((j & 255) + dj) + perm[(k & 255) + dk]]];
}

/**
 * Calculate noise contribution for a single corner
 *
 * @param dist2 Squared distance from corner
 * @param grad Gradient vector
 * @param x Relative x coordinate
 * @param y Relative y coordinate
 * @param z Relative z coordinate
 * @returns Noise contribution
 * @example
 * const contribution = getNoiseContribution(0.3, [1, 1, 1], 0.2, 0.3, 0.1);
 * console.log(contribution); // Output: noise contribution value
 */
function getNoiseContribution(dist2: number, grad: number[], x: number, y: number, z: number): number {
  return dist2 < 0 ? 0 : (dist2 * dist2) * (dist2 * dist2) * dot(grad, x, y, z);
}

/**
 * Calculate all relative coordinates for 3D simplex
 *
 * @param x Input x coordinate
 * @param y Input y coordinate
 * @param z Input z coordinate
 * @returns Object with grid indices and relative coordinates
 * @example
 * const coords = calculateSimplexCoordinates(0.5, 0.3, 0.7);
 * console.log(coords.x0, coords.y0, coords.z0);
 */
function calculateSimplexCoordinates(x: number, y: number, z: number) {
  const F3 = 1.0 / 3.0, G3 = 1.0 / 6.0, s = (x + y + z) * F3;
  const i = Math.floor(x + s), j = Math.floor(y + s), k = Math.floor(z + s);
  const t = (i + j + k) * G3, x0 = x - (i - t), y0 = y - (j - t), z0 = z - (k - t);
  const { i1, j1, k1, i2, j2, k2 } = getSimplexOffsets(x0, y0, z0);
  return { i, j, k, x0, y0, z0, i1, j1, k1, i2, j2, k2, x1: x0 - i1 + G3, y1: y0 - j1 + G3, z1: z0 - k1 + G3, x2: x0 - i2 + 2.0 * G3, y2: y0 - j2 + 2.0 * G3, z2: z0 - k2 + 2.0 * G3, x3: x0 - 1.0 + 3.0 * G3, y3: y0 - 1.0 + 3.0 * G3, z3: z0 - 1.0 + 3.0 * G3 };
}

/**
 * Calculate all gradient indices for 3D simplex corners
 *
 * @param coords - Simplex coordinates object with grid indices and offsets
 * @param coords.i - Grid i coordinate
 * @param coords.j - Grid j coordinate
 * @param coords.k - Grid k coordinate
 * @param coords.i1 - First offset in i direction
 * @param coords.j1 - First offset in j direction
 * @param coords.k1 - First offset in k direction
 * @param coords.i2 - Second offset in i direction
 * @param coords.j2 - Second offset in j direction
 * @param coords.k2 - Second offset in k direction
 * @param perm - Permutation table
 * @param permMod12 - Permutation mod 12 table
 * @returns Array of gradient indices
 * @example
 * const gis = calculateGradientIndices(coords, perm, permMod12);
 * console.log(gis); // Output: [gi0, gi1, gi2, gi3]
 */
function calculateGradientIndices(coords: { i: number; j: number; k: number; i1: number; j1: number; k1: number; i2: number; j2: number; k2: number }, perm: number[], permMod12: number[]): number[] {
  return [getGradientIndex(coords.i, coords.j, coords.k, 0, 0, 0, perm, permMod12), getGradientIndex(coords.i, coords.j, coords.k, coords.i1, coords.j1, coords.k1, perm, permMod12), getGradientIndex(coords.i, coords.j, coords.k, coords.i2, coords.j2, coords.k2, perm, permMod12), getGradientIndex(coords.i, coords.j, coords.k, 1, 1, 1, perm, permMod12)];
}

/**
 * Calculate noise contributions for all 4 corners
 *
 * @param coords - Simplex coordinates object with relative positions
 * @param coords.x0 - Relative x coordinate for corner 0
 * @param coords.y0 - Relative y coordinate for corner 0
 * @param coords.z0 - Relative z coordinate for corner 0
 * @param coords.x1 - Relative x coordinate for corner 1
 * @param coords.y1 - Relative y coordinate for corner 1
 * @param coords.z1 - Relative z coordinate for corner 1
 * @param coords.x2 - Relative x coordinate for corner 2
 * @param coords.y2 - Relative y coordinate for corner 2
 * @param coords.z2 - Relative z coordinate for corner 2
 * @param coords.x3 - Relative x coordinate for corner 3
 * @param coords.y3 - Relative y coordinate for corner 3
 * @param coords.z3 - Relative z coordinate for corner 3
 * @param gis - Gradient indices
 * @param grad3 - Gradient table
 * @returns Sum of noise contributions
 * @example
 * const sum = calculateNoiseContributions(coords, gis, grad3);
 * console.log(sum); // Output: sum of all corner contributions
 */
function calculateNoiseContributions(coords: { x0: number; y0: number; z0: number; x1: number; y1: number; z1: number; x2: number; y2: number; z2: number; x3: number; y3: number; z3: number }, gis: number[], grad3: number[][]): number {
  const corners = [[coords.x0, coords.y0, coords.z0, 0], [coords.x1, coords.y1, coords.z1, 1], [coords.x2, coords.y2, coords.z2, 2], [coords.x3, coords.y3, coords.z3, 3]];
  return corners.reduce((sum, [x, y, z, idx]) => sum + getNoiseContribution(0.6 - x * x - y * y - z * z, grad3[gis[idx]], x, y, z), 0);
}

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
export function simplex3D(x: number, y: number, z: number, grad3: number[][], perm: number[], permMod12: number[]): number {
  const coords = calculateSimplexCoordinates(x, y, z);
  return 32.0 * calculateNoiseContributions(coords, calculateGradientIndices(coords, perm, permMod12), grad3);
}

/**
 * Calculate dot product
 *
 * @param grad Gradient vector
 * @param coords Coordinates
 * @returns Dot product
 * @example
 * const result = dot([1, 2, 3], 4, 5, 6);
 * console.log(result); // Output: 32 (1*4 + 2*5 + 3*6)
 */
function dot(grad: number[], ...coords: number[]): number {
  return coords.reduce((sum, c, i) => sum + grad[i] * c, 0);
}
