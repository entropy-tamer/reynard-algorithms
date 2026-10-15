/**
 * Space Colonization -- Attractor Distribution
 *
 * Where the attractors come from. The algorithm proper does not care: it is
 * handed a list of points and grows toward them. This module produces that list
 * for the common shapes, from a seed, so a run is reproducible.
 *
 * @module algorithms/procedural-generation/space-colonization/attractors
 */

import type {
  AttractorDistribution,
  SpaceColonizationBounds,
  SpaceColonizationVector,
} from "./space-colonization-types";

/**
 * A seeded pseudo-random number generator (mulberry32).
 *
 * Thirty-two bits of state, one multiply-xor-shift round per call, and a
 * sequence that passes the usual smoke tests for a generator whose job is
 * "reproducible demo", not "cryptography". Deterministic across engines, which
 * `Math.random` is not -- and a demo that cannot be replayed cannot be debugged.
 *
 * @param seed - Any integer. The same seed yields the same attractors forever.
 * @returns A function returning numbers in `[0, 1)`.
 */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return function random(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A vector at the origin's counterpart: the centre of a set of bounds. */
function boundsCentre(bounds: SpaceColonizationBounds): SpaceColonizationVector {
  return {
    x: (bounds.min.x + bounds.max.x) / 2,
    y: (bounds.min.y + bounds.max.y) / 2,
    z: (bounds.min.z + bounds.max.z) / 2,
  };
}

/** Half-extents of the bounds -- the radii of the inscribed ellipsoid. */
function boundsHalfExtent(bounds: SpaceColonizationBounds): SpaceColonizationVector {
  return {
    x: (bounds.max.x - bounds.min.x) / 2,
    y: (bounds.max.y - bounds.min.y) / 2,
    z: (bounds.max.z - bounds.min.z) / 2,
  };
}

/**
 * A uniformly distributed direction on the unit sphere (Marsaglia's method).
 * Rejection-sampled from the unit square, so no trigonometry and no clustering
 * at the poles.
 */
function sampleUnitDirection(random: () => number): SpaceColonizationVector {
  let x1 = 0;
  let x2 = 0;
  let s = 0;
  do {
    x1 = 2 * random() - 1;
    x2 = 2 * random() - 1;
    s = x1 * x1 + x2 * x2;
  } while (s >= 1 || s === 0);
  const m = 2 * Math.sqrt(1 - s);
  return { x: x1 * m, y: x2 * m, z: 1 - 2 * s };
}

/**
 * Uniform in the axis-aligned box. Degenerate axes (as a 2D run has in `z`)
 * simply fall out as that axis' minimum.
 */
function distributeBox(
  bounds: SpaceColonizationBounds,
  count: number,
  random: () => number,
): SpaceColonizationVector[] {
  const points: SpaceColonizationVector[] = [];
  for (let i = 0; i < count; i++) {
    points.push({
      x: bounds.min.x + random() * (bounds.max.x - bounds.min.x),
      y: bounds.min.y + random() * (bounds.max.y - bounds.min.y),
      z: bounds.min.z + random() * (bounds.max.z - bounds.min.z),
    });
  }
  return points;
}

/**
 * Uniform in the ellipsoid inscribed in the bounds.
 *
 * Uniform *volume* placement, not uniform direction: the radius is drawn as
 * `u^(1/3)`, because a shell at radius `r` has volume growing as `r^2` and a
 * uniform radius would overcrowd the rim.
 */
function distributeSphere(
  bounds: SpaceColonizationBounds,
  count: number,
  random: () => number,
): SpaceColonizationVector[] {
  const centre = boundsCentre(bounds);
  const extent = boundsHalfExtent(bounds);
  const points: SpaceColonizationVector[] = [];
  for (let i = 0; i < count; i++) {
    const direction = sampleUnitDirection(random);
    const radius = Math.cbrt(random());
    points.push({
      x: centre.x + direction.x * radius * extent.x,
      y: centre.y + direction.y * radius * extent.y,
      z: centre.z + direction.z * radius * extent.z,
    });
  }
  return points;
}

/**
 * A tree-crown envelope: an ellipsoid occupying the upper `crownFraction` of
 * the bounds, thinned toward its base.
 *
 * The thinning matters. An untrimmed ellipsoid puts a dense plateau of
 * attractors at the height where the crown is cut off, and the tree responds by
 * fanning sideways at that exact plane -- the artefact every first attempt at
 * this algorithm shows. Accepting a point with probability rising from
 * `baseKeepChance` at the crown floor to 1 at the crown ceiling removes it.
 *
 * This is a heuristic envelope, not a botanical model. It produces something
 * that reads as a crown; it does not claim to reproduce one.
 */
function distributeCrown(
  bounds: SpaceColonizationBounds,
  count: number,
  random: () => number,
  baseKeepChance: number,
): SpaceColonizationVector[] {
  const centre = boundsCentre(bounds);
  const extent = boundsHalfExtent(bounds);
  const crownHeight = Math.max(extent.y, 1e-6);
  const crownFloor = bounds.max.y - 2 * crownHeight;

  const points: SpaceColonizationVector[] = [];
  let guard = 0;
  const guardLimit = count * 200 + 1000;
  while (points.length < count && guard < guardLimit) {
    guard++;
    const direction = sampleUnitDirection(random);
    const radius = Math.cbrt(random());
    const point: SpaceColonizationVector = {
      x: centre.x + direction.x * radius * extent.x,
      y: centre.y + direction.y * radius * extent.y,
      z: centre.z + direction.z * radius * extent.z,
    };
    const heightFraction = (point.y - crownFloor) / (bounds.max.y - crownFloor);
    const keep = baseKeepChance + (1 - baseKeepChance) * Math.min(1, Math.max(0, heightFraction));
    if (random() < keep) points.push(point);
  }
  return points;
}

/** Options for {@link distributeAttractors}. */
export interface DistributeAttractorsOptions {
  /** Which envelope to fill. */
  distribution: AttractorDistribution;
  /** The volume to fill. */
  bounds: SpaceColonizationBounds;
  /** How many attractors to place. */
  count: number;
  /** Seed for the generator. */
  seed: number;
  /**
   * For `crown`, the probability an attractor at the very base of the crown is
   * kept. 1 disables the thinning.
   * @default 0.15
   */
  crownBaseKeepChance?: number;
}

/**
 * Place `count` attractors inside `bounds` according to `distribution`, seeded
 * by `seed`.
 *
 * @example
 * ```ts
 * const points = distributeAttractors({
 *   distribution: "crown",
 *   bounds: DEFAULT_SPACE_COLONIZATION_CONFIG.bounds!,
 *   count: 600,
 *   seed: 7,
 * });
 * ```
 */
export function distributeAttractors(
  options: DistributeAttractorsOptions,
): SpaceColonizationVector[] {
  const random = createSeededRandom(options.seed);
  switch (options.distribution) {
    case "box":
      return distributeBox(options.bounds, options.count, random);
    case "crown":
      return distributeCrown(
        options.bounds,
        options.count,
        random,
        options.crownBaseKeepChance ?? 0.15,
      );
    case "sphere":
    default:
      return distributeSphere(options.bounds, options.count, random);
  }
}

/**
 * The default bounds for a given dimensionality: a centred `100` cube for 3D,
 * and the same square flattened onto `z = 0` for 2D.
 */
export function defaultBounds(dimensions: 2 | 3): SpaceColonizationBounds {
  const half = 50;
  return {
    min: { x: -half, y: -half, z: dimensions === 2 ? 0 : -half },
    max: { x: half, y: half, z: dimensions === 2 ? 0 : half },
  };
}
