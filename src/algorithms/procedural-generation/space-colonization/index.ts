/**
 * Space Colonization
 *
 * A skeleton grows toward a cloud of attractors, one fixed-length segment at a
 * time, and consumes each attractor it reaches. The result is a branching
 * network: trees and shrubs (open venation), leaf and wing veins (closed
 * venation), root systems, vessels.
 *
 * ```
 * associate  -> each attractor pulls its nearest node within d_i
 * grow       -> each pulled node extends one segment of length D
 * prune      -> attractors within d_k of any node are consumed
 * repeat     -> until no attractors remain, or growth stalls
 * ```
 *
 * @example
 * ```ts
 * import { SpaceColonization, computeBranchRadii, createTreeConfig } from "@entropy-tamer/reynard-algorithms";
 *
 * const grower = new SpaceColonization(createTreeConfig({ seed: 42 }));
 * const tree = grower.run();
 * computeBranchRadii(tree.nodes, { exponent: 2, leafRadius: 0.6 });
 * console.log(tree.stats.nodeCount, "nodes,", tree.stats.maxDepth, "deep");
 * ```
 *
 * @module algorithms/procedural-generation/space-colonization
 */

export {
  SpaceColonization,
  DEFAULT_SPACE_COLONIZATION_CONFIG,
  resolveSpaceColonizationConfig,
} from "./space-colonization-core";
export type { ResolvedSpaceColonizationConfig } from "./space-colonization-core";
export {
  createSeededRandom,
  defaultBounds,
  distributeAttractors,
} from "./space-colonization-attractors";
export type { DistributeAttractorsOptions } from "./space-colonization-attractors";
export {
  chaikinSubdivide,
  computeBranchRadii,
  extractPaths,
  smoothPaths,
} from "./space-colonization-postprocess";
export type {
  AttractorDistribution,
  BranchRadiusOptions,
  GrowthMode,
  SpaceColonizationBounds,
  SpaceColonizationConfig,
  SpaceColonizationNode,
  SpaceColonizationResult,
  SpaceColonizationSegment,
  SpaceColonizationStats,
  SpaceColonizationStep,
  SpaceColonizationVector,
} from "./space-colonization-types";

import { defaultBounds } from "./space-colonization-attractors";
import type { SpaceColonizationConfig } from "./space-colonization-types";

/**
 * A 3D tree: open venation into a crown envelope, one root at the base.
 *
 * The three distances are not independent. Attractor spacing `s` sets them: the
 * influence radius must span a few neighbours (`1.5-2 s`), the kill radius must
 * retire an attractor as a branch arrives (`~0.5 s`), and the segment length is
 * the grain of the skeleton (`~0.5 d_k`). Get the ratio wrong -- a kill radius
 * far below the spacing, as this preset had -- and branches orbit attractors
 * they should have consumed, because the whole network becomes a chase.
 *
 * @param overrides - Any config field, merged over the preset.
 */
export function createTreeConfig(
  overrides: SpaceColonizationConfig = {},
): SpaceColonizationConfig {
  return {
    dimensions: 3,
    distribution: "crown",
    bounds: defaultBounds(3),
    attractorCount: 600,
    influenceRadius: 16,
    killRadius: 6,
    segmentLength: 2.5,
    mode: "open",
    seed: 7,
    ...overrides,
  };
}

/**
 * A 2D shrub: open venation onto the `z = 0` plane, cheap enough to animate.
 *
 * @param overrides - Any config field, merged over the preset.
 */
export function createShrubConfig(
  overrides: SpaceColonizationConfig = {},
): SpaceColonizationConfig {
  return {
    dimensions: 2,
    distribution: "crown",
    bounds: defaultBounds(2),
    attractorCount: 320,
    influenceRadius: 14,
    killRadius: 4,
    segmentLength: 1.6,
    mode: "open",
    seed: 3,
    ...overrides,
  };
}

/**
 * A leaf: closed venation in 2D, so paths loop back and rejoin into a net
 * rather than a tree.
 *
 * `closedNeighborLimit` is finite here deliberately. Zero means unlimited
 * fan-in -- every node in range of an attractor is pulled by it -- and the
 * association cost is then `attractors x nodes` per iteration while the node
 * count grows without bound. That is an out-of-memory waiting to happen, not a
 * leaf.
 *
 * @param overrides - Any config field, merged over the preset.
 */
export function createLeafVenationConfig(
  overrides: SpaceColonizationConfig = {},
): SpaceColonizationConfig {
  return {
    dimensions: 2,
    distribution: "box",
    bounds: defaultBounds(2),
    attractorCount: 900,
    influenceRadius: 9,
    killRadius: 3,
    segmentLength: 1.5,
    mode: "closed",
    closedNeighborLimit: 3,
    seed: 11,
    ...overrides,
  };
}

/**
 * A root system: the root starts at the top of the box and the network grows
 * down through it, filling the soil volume rather than a crown.
 *
 * The root is derived from the bounds *as overridden*: pass a smaller box and
 * the root moves with it, staying on the ceiling. Deriving it from the default
 * box instead would strand it outside a caller's geometry, where it can see no
 * attractor at all and grows nothing.
 *
 * @param overrides - Any config field, merged over the preset.
 */
export function createRootSystemConfig(
  overrides: SpaceColonizationConfig = {},
): SpaceColonizationConfig {
  const bounds = overrides.bounds ?? defaultBounds(3);
  return {
    dimensions: 3,
    distribution: "sphere",
    bounds,
    attractorCount: 700,
    influenceRadius: 14,
    killRadius: 5,
    segmentLength: 2.2,
    mode: "open",
    seed: 5,
    roots: [
      {
        x: (bounds.min.x + bounds.max.x) / 2,
        y: bounds.max.y,
        z: (bounds.min.z + bounds.max.z) / 2,
      },
    ],
    ...overrides,
  };
}
