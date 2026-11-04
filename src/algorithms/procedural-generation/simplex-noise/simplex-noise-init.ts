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
export function initializeGradients(_config: SimplexNoiseConfig): {
  grad3: number[][];
  grad4: number[][];
} {
  const grad3: number[][] = [
    [1, 1, 0],
    [-1, 1, 0],
    [1, -1, 0],
    [-1, -1, 0],
    [1, 0, 1],
    [-1, 0, 1],
    [1, 0, -1],
    [-1, 0, -1],
    [0, 1, 1],
    [0, -1, 1],
    [0, 1, -1],
    [0, -1, -1],
  ];

  const grad4: number[][] = [
    [0, 1, 1, 1],
    [0, 1, 1, -1],
    [0, 1, -1, 1],
    [0, 1, -1, -1],
    [0, -1, 1, 1],
    [0, -1, 1, -1],
    [0, -1, -1, 1],
    [0, -1, -1, -1],
    [1, 0, 1, 1],
    [1, 0, 1, -1],
    [1, 0, -1, 1],
    [1, 0, -1, -1],
    [-1, 0, 1, 1],
    [-1, 0, 1, -1],
    [-1, 0, -1, 1],
    [-1, 0, -1, -1],
    [1, 1, 0, 1],
    [1, 1, 0, -1],
    [1, -1, 0, 1],
    [1, -1, 0, -1],
    [-1, 1, 0, 1],
    [-1, 1, 0, -1],
    [-1, -1, 0, 1],
    [-1, -1, 0, -1],
    [1, 1, 1, 0],
    [1, 1, -1, 0],
    [1, -1, 1, 0],
    [1, -1, -1, 0],
    [-1, 1, 1, 0],
    [-1, 1, -1, 0],
    [-1, -1, 1, 0],
    [-1, -1, -1, 0],
  ];

  return { grad3, grad4 };
}

/**
 * The canonical Perlin permutation table.
 *
 * Seed 0 must keep producing exactly the noise it produced before seeding
 * worked: callers that never passed a seed depend on the published table, and
 * renumbering it would silently change every existing terrain, texture and test
 * fixture. So the canonical table is the *base*, and a seed shuffles it.
 */
const BASE: readonly number[] = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240,
    21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88,
    237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83,
    111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80,
    73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64,
    52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182,
    189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22,
    39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210,
    144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84,
    204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78,
    66, 215, 61, 156, 180,
];

/**
 * The permutation `BASE`, shuffled deterministically by `seed`.
 *
 * A local mulberry32 rather than the package's `createSeededRandom`: that one
 * lives in the space-colonization barrel, and importing it here would drag a
 * tree of unrelated algorithms into every consumer that only wants a noise
 * field.
 */
function permutationFor(seed: number): number[] {
  const table = BASE.slice();
  if (seed === 0) return table;

  let state = seed >>> 0;
  const random = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  for (let i = table.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const a = table[i] ?? 0;
    const b = table[j] ?? 0;
    table[i] = b;
    table[j] = a;
  }
  return table;
}

/**
 * Initialize the permutation tables for simplex noise
 *
 * `config.seed` decides the table: 0 is the canonical Perlin permutation (what
 * every unseeded caller always got), anything else shuffles it. Before this,
 * the argument was ignored and two instances with different seeds produced
 * identical noise -- a defect only a test that compares two seeds could see.
 *
 * @param config Simplex noise configuration
 * @returns Permutation tables
 * @example
 */
export function initializePermutation(config: SimplexNoiseConfig): {
  p: number[];
  perm: number[];
  permMod12: number[];
} {
  const p = permutationFor(config.seed ?? 0);

  // Create permutation table
  const perm: number[] = new Array(512);
  for (let i = 0; i < 512; i++) {
    const pVal = p[i & 255];
    perm[i] = pVal ?? 0;
  }

  // Create permutation mod 12 table
  const permMod12: number[] = new Array(512);
  for (let i = 0; i < 512; i++) {
    const permVal = perm[i];
    permMod12[i] = (permVal ?? 0) % 12;
  }

  return { p, perm, permMod12 };
}
