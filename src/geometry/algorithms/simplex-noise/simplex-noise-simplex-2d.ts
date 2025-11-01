/**
 * Simplex Noise 2D Core Functions
 *
 * Handles core 2D simplex noise calculation
 *
 * @module algorithms/geometry/algorithms/simplex-noise
 * @file
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
export function simplex2D(
  x: number,
  y: number,
  grad3: number[][],
  perm: number[],
  permMod12: number[]
): number {
  const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
  const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);

  const t = (i + j) * G2;
  const x0 = x - (i - t);
  const y0 = y - (j - t);

  let i1, j1;
  if (x0 > y0) {
    i1 = 1; j1 = 0;
  } else {
    i1 = 0; j1 = 1;
  }

  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1.0 + 2.0 * G2;
  const y2 = y0 - 1.0 + 2.0 * G2;

  const ii = i & 255;
  const jj = j & 255;
  const gi0 = permMod12[ii + perm[jj]];
  const gi1 = permMod12[ii + i1 + perm[jj + j1]];
  const gi2 = permMod12[ii + 1 + perm[jj + 1]];

  let t0 = 0.5 - x0 * x0 - y0 * y0;
  let n0 = 0;
  if (t0 >= 0) {
    t0 *= t0;
    n0 = t0 * t0 * dot(grad3[gi0], x0, y0);
  }

  let t1 = 0.5 - x1 * x1 - y1 * y1;
  let n1 = 0;
  if (t1 >= 0) {
    t1 *= t1;
    n1 = t1 * t1 * dot(grad3[gi1], x1, y1);
  }

  let t2 = 0.5 - x2 * x2 - y2 * y2;
  let n2 = 0;
  if (t2 >= 0) {
    t2 *= t2;
    n2 = t2 * t2 * dot(grad3[gi2], x2, y2);
  }

  return 70.0 * (n0 + n1 + n2);
}

/**
 * Calculate dot product
 *
 * @param grad Gradient vector
 * @param coords Coordinates
 * @returns Dot product
 * @example
 * const result = dot([1, 2], 3, 4);
 * console.log(result); // Output: 11 (1*3 + 2*4)
 */
function dot(grad: number[], ...coords: number[]): number {
  let sum = 0;
  for (let i = 0; i < coords.length; i++) {
    sum += grad[i] * coords[i];
  }
  return sum;
}
