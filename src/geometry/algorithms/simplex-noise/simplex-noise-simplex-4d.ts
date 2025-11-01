/**
 * @file algorithms/geometry/algorithms/simplex-noise/simplex-noise-simplex-4d
 * @module algorithms/geometry/algorithms/simplex-noise
 * @description Simplex Noise 4D Core Functions - Handles core 4D simplex noise calculation
 */

/**
 * Get 4D simplex lookup table
 *
 * @returns Simplex 4D lookup table
 * @example
 * const lookup = getSimplex4DLookup();
 * console.log(lookup[0]); // Output: [0, 1, 2, 3]
 */
function getSimplex4DLookup(): number[][] {
  return [
    [0, 1, 2, 3], [0, 1, 3, 2], [0, 0, 0, 0], [0, 2, 3, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 2, 3, 0],
    [0, 2, 1, 3], [0, 0, 0, 0], [0, 3, 1, 2], [0, 3, 2, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 3, 2, 0],
    [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0],
    [1, 2, 0, 3], [0, 0, 0, 0], [1, 3, 0, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 3, 0, 1], [2, 3, 1, 0],
    [1, 0, 2, 3], [1, 0, 3, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 0, 3, 1], [0, 0, 0, 0], [2, 1, 3, 0],
    [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0],
    [2, 0, 1, 3], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 1, 2], [3, 0, 2, 1], [0, 0, 0, 0], [3, 1, 2, 0],
    [2, 1, 0, 3], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 1, 0, 2], [0, 0, 0, 0], [3, 2, 0, 1], [3, 2, 1, 0]
  ];
}

/**
 * Calculate 4D simplex offsets from lookup table
 *
 * @param x0 First relative x coordinate
 * @param y0 First relative y coordinate
 * @param z0 First relative z coordinate
 * @param w0 First relative w coordinate
 * @returns Object with offsets for all 4 corners
 * @example
 * const offsets = getSimplex4DOffsets(0.3, 0.5, 0.2, 0.4);
 * console.log(offsets.i1, offsets.j1); // Output: offset values
 */
function getSimplex4DOffsets(x0: number, y0: number, z0: number, w0: number): { i1: number; j1: number; k1: number; l1: number; i2: number; j2: number; k2: number; l2: number; i3: number; j3: number; k3: number; l3: number } {
  const simplex4DLookup = getSimplex4DLookup();
  const c = (x0 > y0) ? 32 : 0;
  const c1 = (x0 > z0) ? 16 : 0;
  const c2 = (y0 > z0) ? 8 : 0;
  const c3 = (x0 > w0) ? 4 : 0;
  const c4 = (y0 > w0) ? 2 : 0;
  const c5 = (z0 > w0) ? 1 : 0;
  const c6 = c + c1 + c2 + c3 + c4 + c5;

  return {
    i1: simplex4DLookup[c6][0] >= 3 ? 1 : 0,
    j1: simplex4DLookup[c6][1] >= 3 ? 1 : 0,
    k1: simplex4DLookup[c6][2] >= 3 ? 1 : 0,
    l1: simplex4DLookup[c6][3] >= 3 ? 1 : 0,
    i2: simplex4DLookup[c6][0] >= 2 ? 1 : 0,
    j2: simplex4DLookup[c6][1] >= 2 ? 1 : 0,
    k2: simplex4DLookup[c6][2] >= 2 ? 1 : 0,
    l2: simplex4DLookup[c6][3] >= 2 ? 1 : 0,
    i3: simplex4DLookup[c6][0] >= 1 ? 1 : 0,
    j3: simplex4DLookup[c6][1] >= 1 ? 1 : 0,
    k3: simplex4DLookup[c6][2] >= 1 ? 1 : 0,
    l3: simplex4DLookup[c6][3] >= 1 ? 1 : 0,
  };
}

/**
 * Calculate all relative coordinates for 4D simplex
 *
 * @param x Input x coordinate
 * @param y Input y coordinate
 * @param z Input z coordinate
 * @param w Input w coordinate
 * @returns Object with grid indices and relative coordinates
 * @example
 * const coords = calculateSimplex4DCoordinates(0.5, 0.3, 0.7, 0.2);
 * console.log(coords.x0, coords.y0); // Output: relative coordinates
 */
function calculateSimplex4DCoordinates(x: number, y: number, z: number, w: number) {
  const F4 = (Math.sqrt(5.0) - 1.0) / 4.0;
  const G4 = (5.0 - Math.sqrt(5.0)) / 20.0;
  const s = (x + y + z + w) * F4;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);
  const k = Math.floor(z + s);
  const l = Math.floor(w + s);
  const t = (i + j + k + l) * G4;
  const x0 = x - (i - t);
  const y0 = y - (j - t);
  const z0 = z - (k - t);
  const w0 = w - (l - t);
  const { i1, j1, k1, l1, i2, j2, k2, l2, i3, j3, k3, l3 } = getSimplex4DOffsets(x0, y0, z0, w0);

  return {
    i, j, k, l, x0, y0, z0, w0, i1, j1, k1, l1, i2, j2, k2, l2, i3, j3, k3, l3,
    x1: x0 - i1 + G4, y1: y0 - j1 + G4, z1: z0 - k1 + G4, w1: w0 - l1 + G4,
    x2: x0 - i2 + 2.0 * G4, y2: y0 - j2 + 2.0 * G4, z2: z0 - k2 + 2.0 * G4, w2: w0 - l2 + 2.0 * G4,
    x3: x0 - i3 + 3.0 * G4, y3: y0 - j3 + 3.0 * G4, z3: z0 - k3 + 3.0 * G4, w3: w0 - l3 + 3.0 * G4,
    x4: x0 - 1.0 + 4.0 * G4, y4: y0 - 1.0 + 4.0 * G4, z4: z0 - 1.0 + 4.0 * G4, w4: w0 - 1.0 + 4.0 * G4,
  };
}

/**
 * Calculate gradient index for 4D simplex
 *
 * @param i Grid i coordinate
 * @param j Grid j coordinate
 * @param k Grid k coordinate
 * @param l Grid l coordinate
 * @param di Offset in i direction
 * @param dj Offset in j direction
 * @param dk Offset in k direction
 * @param dl Offset in l direction
 * @param perm Permutation table
 * @returns Gradient index
 * @example
 * const gi = getGradientIndex4D(10, 20, 30, 40, 1, 0, 0, 0, perm);
 * console.log(gi); // Output: gradient index for the specified coordinate
 */
function getGradientIndex4D(i: number, j: number, k: number, l: number, di: number, dj: number, dk: number, dl: number, perm: number[]): number {
  const ii = i & 255;
  const jj = j & 255;
  const kk = k & 255;
  const ll = l & 255;
  return perm[ii + di + perm[jj + dj + perm[kk + dk + perm[ll + dl]]]] % 32;
}

/**
 * Calculate all gradient indices for 4D simplex corners
 *
 * @param coords - Simplex coordinates object
 * @param coords.i - Grid i coordinate
 * @param coords.j - Grid j coordinate
 * @param coords.k - Grid k coordinate
 * @param coords.l - Grid l coordinate
 * @param coords.i1 - First offset in i direction
 * @param coords.j1 - First offset in j direction
 * @param coords.k1 - First offset in k direction
 * @param coords.l1 - First offset in l direction
 * @param coords.i2 - Second offset in i direction
 * @param coords.j2 - Second offset in j direction
 * @param coords.k2 - Second offset in k direction
 * @param coords.l2 - Second offset in l direction
 * @param coords.i3 - Third offset in i direction
 * @param coords.j3 - Third offset in j direction
 * @param coords.k3 - Third offset in k direction
 * @param coords.l3 - Third offset in l direction
 * @param perm - Permutation table
 * @returns Array of gradient indices
 * @example
 * const gis = calculateGradientIndices4D(coords, perm);
 * console.log(gis); // Output: [gi0, gi1, gi2, gi3, gi4]
 */
function calculateGradientIndices4D(coords: { i: number; j: number; k: number; l: number; i1: number; j1: number; k1: number; l1: number; i2: number; j2: number; k2: number; l2: number; i3: number; j3: number; k3: number; l3: number }, perm: number[]): number[] {
  return [
    getGradientIndex4D(coords.i, coords.j, coords.k, coords.l, 0, 0, 0, 0, perm),
    getGradientIndex4D(coords.i, coords.j, coords.k, coords.l, coords.i1, coords.j1, coords.k1, coords.l1, perm),
    getGradientIndex4D(coords.i, coords.j, coords.k, coords.l, coords.i2, coords.j2, coords.k2, coords.l2, perm),
    getGradientIndex4D(coords.i, coords.j, coords.k, coords.l, coords.i3, coords.j3, coords.k3, coords.l3, perm),
    getGradientIndex4D(coords.i, coords.j, coords.k, coords.l, 1, 1, 1, 1, perm),
  ];
}

/**
 * Calculate noise contribution for a single 4D corner
 *
 * @param dist2 Squared distance from corner
 * @param grad Gradient vector
 * @param x Relative x coordinate
 * @param y Relative y coordinate
 * @param z Relative z coordinate
 * @param w Relative w coordinate
 * @returns Noise contribution
 * @example
 * const contribution = getNoiseContribution4D(0.3, [1, 1, 1, 1], 0.2, 0.3, 0.1, 0.4);
 * console.log(contribution); // Output: noise contribution value
 */
function getNoiseContribution4D(dist2: number, grad: number[], x: number, y: number, z: number, w: number): number {
  return dist2 < 0 ? 0 : (dist2 * dist2) * (dist2 * dist2) * dot(grad, x, y, z, w);
}

/**
 * Calculate noise contributions for all 5 corners in 4D
 *
 * @param coords - Simplex coordinates object with relative positions
 * @param coords.x0 - Relative x coordinate for corner 0
 * @param coords.y0 - Relative y coordinate for corner 0
 * @param coords.z0 - Relative z coordinate for corner 0
 * @param coords.w0 - Relative w coordinate for corner 0
 * @param coords.x1 - Relative x coordinate for corner 1
 * @param coords.y1 - Relative y coordinate for corner 1
 * @param coords.z1 - Relative z coordinate for corner 1
 * @param coords.w1 - Relative w coordinate for corner 1
 * @param coords.x2 - Relative x coordinate for corner 2
 * @param coords.y2 - Relative y coordinate for corner 2
 * @param coords.z2 - Relative z coordinate for corner 2
 * @param coords.w2 - Relative w coordinate for corner 2
 * @param coords.x3 - Relative x coordinate for corner 3
 * @param coords.y3 - Relative y coordinate for corner 3
 * @param coords.z3 - Relative z coordinate for corner 3
 * @param coords.w3 - Relative w coordinate for corner 3
 * @param coords.x4 - Relative x coordinate for corner 4
 * @param coords.y4 - Relative y coordinate for corner 4
 * @param coords.z4 - Relative z coordinate for corner 4
 * @param coords.w4 - Relative w coordinate for corner 4
 * @param gis - Gradient indices
 * @param grad4 - Gradient table
 * @returns Sum of noise contributions
 * @example
 * const sum = calculateNoiseContributions4D(coords, gis, grad4);
 * console.log(sum); // Output: sum of all corner contributions
 */
function calculateNoiseContributions4D(coords: { x0: number; y0: number; z0: number; w0: number; x1: number; y1: number; z1: number; w1: number; x2: number; y2: number; z2: number; w2: number; x3: number; y3: number; z3: number; w3: number; x4: number; y4: number; z4: number; w4: number }, gis: number[], grad4: number[][]): number {
  const corners = [
    [coords.x0, coords.y0, coords.z0, coords.w0, 0],
    [coords.x1, coords.y1, coords.z1, coords.w1, 1],
    [coords.x2, coords.y2, coords.z2, coords.w2, 2],
    [coords.x3, coords.y3, coords.z3, coords.w3, 3],
    [coords.x4, coords.y4, coords.z4, coords.w4, 4],
  ];
  return corners.reduce((sum, [x, y, z, w, idx]) => sum + getNoiseContribution4D(0.6 - x * x - y * y - z * z - w * w, grad4[gis[idx]], x, y, z, w), 0);
}

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
export function simplex4D(
  x: number,
  y: number,
  z: number,
  w: number,
  grad4: number[][],
  perm: number[],
  _permMod12: number[]
): number {
  const coords = calculateSimplex4DCoordinates(x, y, z, w);
  const gis = calculateGradientIndices4D(coords, perm);
  return 27.0 * calculateNoiseContributions4D(coords, gis, grad4);
}

/**
 * Calculate dot product
 *
 * @param grad Gradient vector
 * @param coords Coordinates
 * @returns Dot product
 * @example
 * const result = dot([1, 2, 3, 4], 5, 6, 7, 8);
 * console.log(result); // Output: 70 (1*5 + 2*6 + 3*7 + 4*8)
 */
function dot(grad: number[], ...coords: number[]): number {
  let sum = 0;
  for (let i = 0; i < coords.length; i++) {
    sum += grad[i] * coords[i];
  }
  return sum;
}
