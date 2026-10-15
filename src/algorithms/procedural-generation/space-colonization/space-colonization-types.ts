/**
 * Space Colonization -- Types
 *
 * Runions' space colonization grows a branching network by repeatedly
 * extending a skeleton toward a cloud of attractors. This file names the parts;
 * the algorithm itself is in `space-colonization-core.ts` and the prose version
 * is `docs/algorithms/procedural-generation/space-colonization.md`.
 *
 * @module algorithms/procedural-generation/space-colonization/types
 */

/**
 * A point in the growth volume.
 *
 * The algorithm runs on three components in every mode. A 2D configuration
 * pins `z` to 0 rather than switching to a two-component type, so one code path
 * serves both -- and a consumer that reads `z` from 2D output gets `0`, not
 * `undefined`.
 */
export interface SpaceColonizationVector {
  x: number;
  y: number;
  z: number;
}

/** Axis-aligned bounds of the growth volume. */
export interface SpaceColonizationBounds {
  min: SpaceColonizationVector;
  max: SpaceColonizationVector;
}

/**
 * How attractors compete for nodes.
 *
 * - `open`: every attractor pulls only its single closest node. Competition
 *   makes limbs diverge to fill empty space -- trees, shrubs, vessels.
 * - `closed`: every attractor pulls *every* node within its influence radius,
 *   so paths curve back and join -- leaf venation, insect wing veins.
 *
 * The open mode is Runions' formulation exactly. The closed mode approximates
 * the relative-neighbourhood graph by radius membership; see
 * `SpaceColonizationConfig.closedNeighborLimit` for the bound and the docs for
 * what the approximation costs.
 */
export type GrowthMode = "open" | "closed";

/**
 * Built-in attractor distributions, used when `attractors` is not supplied.
 *
 * - `box`: uniform inside the bounds.
 * - `sphere`: uniform inside the ellipsoid inscribed in the bounds.
 * - `crown`: a tree-crown envelope -- an ellipsoid above the root, thinned near
 *   the trunk so the base of the crown is not a flat cut.
 */
export type AttractorDistribution = "box" | "sphere" | "crown";

/**
 * Configuration for a growth run. Every field has a default; the resolved
 * defaults live in `DEFAULT_SPACE_COLONIZATION_CONFIG`.
 */
export interface SpaceColonizationConfig {
  /**
   * Dimensionality of the growth volume. A 2D run still carries `z`, held at 0.
   * @default 3
   */
  dimensions?: 2 | 3;
  /**
   * Radius of influence `d_i`: the furthest an attractor can see a node, and
   * therefore the only distance at which it can pull one.
   * @default 40
   */
  influenceRadius?: number;
  /**
   * Kill distance `d_k`: once a node is this close, the attractor counts as
   * consumed and is removed.
   * @default 12
   */
  killRadius?: number;
  /**
   * Fixed length `D` of every new segment. The single most visible knob: it
   * sets the grain of the skeleton.
   * @default 6
   */
  segmentLength?: number;
  /**
   * Growth mode. See {@link GrowthMode}.
   * @default "open"
   */
  mode?: GrowthMode;
  /**
   * Hard cap on iterations, so a pathological configuration cannot spin. Growth
   * normally ends when the attractor list empties.
   * @default 2000
   */
  maxIterations?: number;
  /**
   * Consecutive iterations that may grow new nodes without consuming a single
   * attractor before growth is declared stalled.
   *
   * This is the terminus the algorithm needs and the literature omits. Two
   * attractors whose pulls cancel leave a node orbiting them at a fixed radius:
   * it spawns a child every iteration, never closes within `killRadius`, and so
   * never consumes them. Left alone that runs to `maxIterations`, inflating the
   * skeleton to thousands of junk nodes. Growth that consumes nothing for this
   * many iterations has stopped making progress, whatever the geometry says.
   *
   * @default 10
   */
  stallLimit?: number;
  /**
   * Seed for the built-in attractor distribution. Ignored when `attractors` is
   * supplied -- those are used verbatim.
   * @default 1
   */
  seed?: number;
  /**
   * The growth volume. The built-in distributions fill it, and it is copied
   * into the result for framing convenience.
   * @default { min: {x:0,y:0,z:0}, max: {x:100,y:100,z:100} }
   */
  bounds?: SpaceColonizationBounds;
  /**
   * Number of attractors the built-in distribution places.
   * @default 400
   */
  attractorCount?: number;
  /**
   * Which built-in distribution to use when `attractors` is absent.
   * @default "sphere"
   */
  distribution?: AttractorDistribution;
  /**
   * Explicit attractors. When present, `attractorCount`, `distribution` and
   * `seed` are ignored and these points are used as given -- which is what the
   * interactive harness does with points the user clicked.
   */
  attractors?: SpaceColonizationVector[];
  /**
   * Explicit roots. When absent, a single root sits at the bottom centre of the
   * bounds.
   */
  roots?: SpaceColonizationVector[];
  /**
   * Whether to accelerate association and pruning with a uniform grid over
   * nodes. Off is brute force, and exists so the acceleration can be measured
   * against the thing it accelerates rather than asserted.
   * @default true
   */
  useSpatialIndex?: boolean;
  /**
   * In `closed` mode, cap on how many nodes one attractor may pull, keeping the
   * nearest by distance. Bounds the worst case; `0` means no cap.
   * @default 8
   */
  closedNeighborLimit?: number;
}

/** A node in the grown skeleton. */
export interface SpaceColonizationNode {
  /** Index into `SpaceColonizationResult.nodes`. */
  id: number;
  /** Parent node id, or `-1` for a root. */
  parent: number;
  /** Child node ids, in the order they were spawned. */
  children: number[];
  /** Number of segments from the nearest root. A root is depth 0. */
  depth: number;
  /** Position in the growth volume. */
  position: SpaceColonizationVector;
  /**
   * Branch radius at this node, filled in by `computeBranchRadii` via Murray's
   * law. `undefined` until that post-process runs.
   */
  radius?: number;
}

/** One skeletal segment: an edge between a node and its parent. */
export interface SpaceColonizationSegment {
  /** Parent node id. */
  from: number;
  /** Child node id. */
  to: number;
}

/** One iteration's report, which is what an animated harness consumes. */
export interface SpaceColonizationStep {
  /** 1-based iteration number. */
  iteration: number;
  /** Node ids created this iteration. */
  spawned: number[];
  /** Attractors consumed this iteration. */
  consumed: number;
  /** Attractors still active after this iteration. */
  remaining: number;
  /**
   * `false` when growth has stopped for good: no new nodes spawned, or no
   * attractors remain. A `true` here does not promise the next step grows.
   */
  active: boolean;
}

/** Aggregate counters for a run. */
export interface SpaceColonizationStats {
  /** Iterations actually run. */
  iterations: number;
  /** Attractors at the start. */
  initialAttractors: number;
  /** Attractors left when growth stopped. */
  remainingAttractors: number;
  /** Attractors consumed. `initialAttractors - remainingAttractors`. */
  consumedAttractors: number;
  /** Nodes in the skeleton, roots included. */
  nodeCount: number;
  /** Segments in the skeleton. `nodeCount - rootCount`. */
  segmentCount: number;
  /** Deepest `depth` reached. */
  maxDepth: number;
  /** `(attractor, node)` pairs formed across all runs -- the association count. */
  associations: number;
  /** Occupied cells in the node grid at the end. `0` when the index is off. */
  spatialGridCells: number;
  /** Wall-clock milliseconds spent in growth, excluding post-processing. */
  growthTimeMs: number;
}

/** The full output of a run. */
export interface SpaceColonizationResult {
  /** Every node, roots first, in spawn order. */
  nodes: SpaceColonizationNode[];
  /** One segment per non-root node. */
  segments: SpaceColonizationSegment[];
  /** Attractors that were never consumed. */
  remainingAttractors: SpaceColonizationVector[];
  /** The growth volume copied from the config. */
  bounds: SpaceColonizationBounds;
  /** Counters. See {@link SpaceColonizationStats}. */
  stats: SpaceColonizationStats;
}

/**
 * Murray's-law parameters for {@link computeBranchRadii}.
 *
 * Murray's law is `r_parent ^ exponent = sum(r_child ^ exponent)`. The exponent
 * is a physical constant in the derivation (3 for a volume-cost optimum) and a
 * style knob in graphics; 2 is the common art default and is the area-preserving
 * case.
 */
export interface BranchRadiusOptions {
  /**
   * Exponent of the radius rule. 2 is area-preserving; 3 is Murray's optimum.
   * @default 2
   */
  exponent?: number;
  /**
   * Radius assigned to every leaf (a node with no children).
   * @default 0.5
   */
  leafRadius?: number;
}
