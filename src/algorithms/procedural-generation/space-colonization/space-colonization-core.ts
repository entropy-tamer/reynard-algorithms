/**
 * Space Colonization -- Core
 *
 * Runions, Fuhrer, Lane and Prusinkiewicz's algorithm: a skeleton grows one
 * fixed-length segment at a time, each node pulled toward the attractors that
 * can see it, and attractors are consumed when a node arrives. Repeat until the
 * attractors run out.
 *
 * The three phases per iteration are association, growth, and pruning. The
 * prose account, with the equations, is
 * `docs/algorithms/procedural-generation/space-colonization.md`.
 *
 * @module algorithms/procedural-generation/space-colonization/core
 */

import { defaultBounds, distributeAttractors } from "./space-colonization-attractors";
import type {
  AttractorDistribution,
  GrowthMode,
  SpaceColonizationBounds,
  SpaceColonizationConfig,
  SpaceColonizationNode,
  SpaceColonizationResult,
  SpaceColonizationSegment,
  SpaceColonizationStep,
  SpaceColonizationStats,
  SpaceColonizationVector,
} from "./space-colonization-types";

/** The config with every default applied. */
export type ResolvedSpaceColonizationConfig = Required<
  Omit<SpaceColonizationConfig, "attractors" | "roots">
>;

/**
 * Resolved defaults. Every field of {@link SpaceColonizationConfig} has one, so
 * a caller may supply any subset -- including none.
 */
export const DEFAULT_SPACE_COLONIZATION_CONFIG: ResolvedSpaceColonizationConfig = {
  dimensions: 3,
  influenceRadius: 40,
  killRadius: 12,
  segmentLength: 6,
  mode: "open",
  maxIterations: 2000,
  stallLimit: 10,
  seed: 1,
  bounds: defaultBounds(3),
  attractorCount: 400,
  distribution: "sphere",
  useSpatialIndex: true,
  closedNeighborLimit: 8,
};

/** Merge a partial config over the defaults, deriving bounds from dimensions. */
export function resolveSpaceColonizationConfig(
  config: SpaceColonizationConfig = {},
): ResolvedSpaceColonizationConfig {
  const dimensions = config.dimensions ?? DEFAULT_SPACE_COLONIZATION_CONFIG.dimensions;
  return {
    ...DEFAULT_SPACE_COLONIZATION_CONFIG,
    ...(config.dimensions !== undefined ? { dimensions } : {}),
    ...(config.bounds !== undefined ? { bounds: config.bounds } : { bounds: defaultBounds(dimensions) }),
    ...(config.influenceRadius !== undefined ? { influenceRadius: config.influenceRadius } : {}),
    ...(config.killRadius !== undefined ? { killRadius: config.killRadius } : {}),
    ...(config.segmentLength !== undefined ? { segmentLength: config.segmentLength } : {}),
    ...(config.mode !== undefined ? { mode: config.mode } : {}),
    ...(config.maxIterations !== undefined ? { maxIterations: config.maxIterations } : {}),
    ...(config.stallLimit !== undefined ? { stallLimit: config.stallLimit } : {}),
    ...(config.seed !== undefined ? { seed: config.seed } : {}),
    ...(config.attractorCount !== undefined ? { attractorCount: config.attractorCount } : {}),
    ...(config.distribution !== undefined ? { distribution: config.distribution } : {}),
    ...(config.useSpatialIndex !== undefined ? { useSpatialIndex: config.useSpatialIndex } : {}),
    ...(config.closedNeighborLimit !== undefined
      ? { closedNeighborLimit: config.closedNeighborLimit }
      : {}),
  };
}

/** Below this, a summed direction is treated as no direction at all. */
const DIRECTION_EPSILON = 1e-9;

function distanceSquared(a: SpaceColonizationVector, b: SpaceColonizationVector): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

function cloneVector(v: SpaceColonizationVector): SpaceColonizationVector {
  return { x: v.x, y: v.y, z: v.z };
}

/**
 * A uniform grid over node positions, used to answer "which nodes are within
 * `r` of this point" without testing every node.
 *
 * Brute-force association is `O(attractors * nodes)` per iteration, which is
 * the cost that makes the naive implementation unusable past a few thousand
 * points. Node positions change every iteration (new nodes appear), so a
 * *uniform* grid is the right structure: insertion is `O(1)`, and unlike a
 * k-d tree it does not have to be rebuilt when the point set grows.
 *
 * Cell size is the influence radius, so a radius query touches at most three
 * cells per axis. Keys are strings, which costs allocation but cannot collide --
 * a hash that merged two cells would silently *miss* a node, and a missed node
 * is a wrong tree, not a slow one.
 */
class NodeGrid {
  private readonly cellSize: number;
  private readonly cells = new Map<string, number[]>();

  constructor(cellSize: number) {
    this.cellSize = Math.max(cellSize, DIRECTION_EPSILON);
  }

  private keyOf(component: number): number {
    return Math.floor(component / this.cellSize);
  }

  private key(x: number, y: number, z: number): string {
    return `${this.keyOf(x)},${this.keyOf(y)},${this.keyOf(z)}`;
  }

  /** Occupied cell count, for the stats block. */
  get cellCount(): number {
    return this.cells.size;
  }

  insert(id: number, position: SpaceColonizationVector): void {
    const key = this.key(position.x, position.y, position.z);
    const bucket = this.cells.get(key);
    if (bucket === undefined) {
      this.cells.set(key, [id]);
    } else {
      bucket.push(id);
    }
  }

  /**
   * Candidate node ids from every cell the query sphere overlaps. A superset:
   * callers still test true distance. Ids may repeat across buckets only if a
   * point were inserted twice, which this class never does.
   */
  querySphere(centre: SpaceColonizationVector, radius: number): number[] {
    const found: number[] = [];
    const minX = this.keyOf(centre.x - radius);
    const maxX = this.keyOf(centre.x + radius);
    const minY = this.keyOf(centre.y - radius);
    const maxY = this.keyOf(centre.y + radius);
    const minZ = this.keyOf(centre.z - radius);
    const maxZ = this.keyOf(centre.z + radius);
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        for (let cz = minZ; cz <= maxZ; cz++) {
          const bucket = this.cells.get(`${cx},${cy},${cz}`);
          if (bucket !== undefined) {
            for (let i = 0; i < bucket.length; i++) found.push(bucket[i]!);
          }
        }
      }
    }
    return found;
  }
}

/**
 * Space colonization growth.
 *
 * Construct once and call {@link step} per iteration (for an animation), or
 * {@link run} for the whole thing. Every run is reproducible from its config,
 * because attractor placement is seeded.
 *
 * @example
 * ```ts
 * const grower = new SpaceColonization({
 *   dimensions: 2,
 *   distribution: "crown",
 *   attractorCount: 600,
 *   seed: 7,
 * });
 * const result = grower.run();
 * computeBranchRadii(result.nodes, { exponent: 2, leafRadius: 0.6 });
 * ```
 */
export class SpaceColonization {
  private config: ResolvedSpaceColonizationConfig;
  private explicitAttractors: SpaceColonizationVector[] | undefined;
  private explicitRoots: SpaceColonizationVector[] | undefined;

  private positions: SpaceColonizationVector[] = [];
  private parents: number[] = [];
  private depths: number[] = [];
  private pullSum: SpaceColonizationVector[] = [];
  private pullCount: number[] = [];
  /**
   * The attractors pulling each node, with the squared distance they pull from.
   * Doubles as the progress test in `grow`, and is rebuilt from scratch by every
   * `associate` -- so it never grows beyond one iteration's associations.
   */
  private pullAttractors: { index: number; squaredDistance: number }[][] = [];
  private attractorList: SpaceColonizationVector[] = [];
  private grid: NodeGrid | null = null;

  private iterationCount = 0;
  private stallIterations = 0;
  private initialAttractorCount = 0;
  private associationCount = 0;
  private growthMilliseconds = 0;
  private stalled = false;

  constructor(config: SpaceColonizationConfig = {}) {
    this.config = resolveSpaceColonizationConfig(config);
    this.explicitAttractors = config.attractors?.map(cloneVector);
    this.explicitRoots = config.roots?.map(cloneVector);
    this.validate();
    this.reset();
  }

  private validate(): void {
    const { influenceRadius, killRadius, segmentLength } = this.config;
    if (!(influenceRadius > 0)) {
      throw new Error("space-colonization: influenceRadius must be > 0");
    }
    if (killRadius < 0) {
      throw new Error("space-colonization: killRadius must be >= 0");
    }
    if (!(segmentLength > 0)) {
      throw new Error("space-colonization: segmentLength must be > 0");
    }
  }

  /**
   * Rebuild the initial state. With no argument the current config is reused --
   * the same seed therefore grows the same network again. Pass a partial config
   * to change parameters; it is resolved against the defaults, not merged with
   * the previous config.
   */
  reset(config?: SpaceColonizationConfig): void {
    if (config !== undefined) {
      this.config = resolveSpaceColonizationConfig(config);
      this.explicitAttractors = config.attractors?.map(cloneVector);
      this.explicitRoots = config.roots?.map(cloneVector);
      this.validate();
    }

    this.positions = [];
    this.parents = [];
    this.depths = [];
    this.pullSum = [];
    this.pullCount = [];
    this.pullAttractors = [];
    this.iterationCount = 0;
    this.stallIterations = 0;
    this.associationCount = 0;
    this.growthMilliseconds = 0;
    this.stalled = false;

    this.attractorList = this.explicitAttractors
      ? this.explicitAttractors.map(cloneVector)
      : distributeAttractors({
          distribution: this.config.distribution,
          bounds: this.config.bounds,
          count: this.config.attractorCount,
          seed: this.config.seed,
        });
    this.initialAttractorCount = this.attractorList.length;

    const roots = this.explicitRoots ?? [this.defaultRoot()];
    this.grid = this.config.useSpatialIndex ? new NodeGrid(this.config.influenceRadius) : null;
    for (const root of roots) this.spawnNode(root, -1, 0);
  }

  private defaultRoot(): SpaceColonizationVector {
    const { min, max } = this.config.bounds;
    return {
      x: (min.x + max.x) / 2,
      y: min.y,
      z: (min.z + max.z) / 2,
    };
  }

  private spawnNode(
    position: SpaceColonizationVector,
    parent: number,
    depth: number,
  ): number {
    const id = this.positions.length;
    this.positions.push(cloneVector(position));
    this.parents.push(parent);
    this.depths.push(depth);
    this.pullSum.push({ x: 0, y: 0, z: 0 });
    this.pullCount.push(0);
    this.pullAttractors.push([]);
    this.grid?.insert(id, position);
    return id;
  }

  /** Number of iterations run so far. */
  get iterations(): number {
    return this.iterationCount;
  }

  /** Attractors still active (not yet consumed). */
  get activeAttractors(): readonly SpaceColonizationVector[] {
    return this.attractorList;
  }

  /** Node count, roots included. */
  get nodeCount(): number {
    return this.positions.length;
  }

  /** Segment count, which is every node but the roots. */
  get segmentCount(): number {
    let roots = 0;
    for (let i = 0; i < this.parents.length; i++) if (this.parents[i] === -1) roots++;
    return this.positions.length - roots;
  }

  /**
   * The association phase: pair each attractor with the node(s) it pulls.
   *
   * `open` mode gives each attractor exactly one node -- the nearest, provided
   * it is within `d_i` -- which is the competition that makes branches diverge.
   * `closed` mode gives it every node within `d_i`, capped at
   * `closedNeighborLimit` nearest, which is what lets paths rejoin.
   *
   * @returns the number of `(attractor, node)` pairs formed.
   */
  private associate(): number {
    let pairs = 0;
    const { influenceRadius, mode, closedNeighborLimit } = this.config;
    const radiusSquared = influenceRadius * influenceRadius;

    // Pulls are recomputed from scratch every iteration. They must be: a node
    // grows if and only if an attractor can still see it *now*. Carrying the
    // previous iteration's sums forward makes every node that was ever pulled
    // spawn a child on every subsequent iteration -- growth never stalls and
    // the node count runs away to the iteration cap.
    for (let i = 0; i < this.pullSum.length; i++) {
      const sum = this.pullSum[i]!;
      sum.x = 0;
      sum.y = 0;
      sum.z = 0;
      this.pullCount[i] = 0;
      this.pullAttractors[i]!.length = 0;
    }

    for (let a = 0; a < this.attractorList.length; a++) {
      const attractor = this.attractorList[a]!;
      const candidates = this.grid
        ? this.grid.querySphere(attractor, influenceRadius)
        : this.allNodeIds();

      if (mode === "open") {
        let bestId = -1;
        let bestDistance = Number.POSITIVE_INFINITY;
        for (let c = 0; c < candidates.length; c++) {
          const id = candidates[c]!;
          const d2 = distanceSquared(attractor, this.positions[id]!);
          // Ties break on id, not on iteration order: the grid and the brute-
          // force scan enumerate candidates differently, and the two must agree
          // on the result or the acceleration is untestable.
          if (d2 < bestDistance || (d2 === bestDistance && id < bestId)) {
            bestDistance = d2;
            bestId = id;
          }
        }
        if (bestId === -1 || bestDistance > radiusSquared) continue;
        this.accumulatePull(bestId, attractor, a);
        pairs++;
        continue;
      }

      // Closed: rank every node in range, then pull the nearest few.
      const inRange: { id: number; distance: number }[] = [];
      for (let c = 0; c < candidates.length; c++) {
        const id = candidates[c]!;
        const d2 = distanceSquared(attractor, this.positions[id]!);
        if (d2 <= radiusSquared) inRange.push({ id, distance: d2 });
      }
      if (inRange.length === 0) continue;
      inRange.sort((p, q) => p.distance - q.distance || p.id - q.id);
      const limit = closedNeighborLimit > 0 ? closedNeighborLimit : inRange.length;
      const take = Math.min(limit, inRange.length);
      for (let c = 0; c < take; c++) {
        this.accumulatePull(inRange[c]!.id, attractor, a);
        pairs++;
      }
    }
    return pairs;
  }

  private allNodeIds(): number[] {
    const ids: number[] = new Array(this.positions.length);
    for (let i = 0; i < ids.length; i++) ids[i] = i;
    return ids;
  }

  /** Add the normalized node -> attractor direction to a node's pull sum. */
  private accumulatePull(
    nodeId: number,
    attractor: SpaceColonizationVector,
    attractorIndex: number,
  ): void {
    const node = this.positions[nodeId]!;
    const dx = attractor.x - node.x;
    const dy = attractor.y - node.y;
    const dz = attractor.z - node.z;
    const distanceSquaredToAttractor = dx * dx + dy * dy + dz * dz;
    if (distanceSquaredToAttractor < DIRECTION_EPSILON * DIRECTION_EPSILON) return;
    const length = Math.sqrt(distanceSquaredToAttractor);
    const sum = this.pullSum[nodeId]!;
    sum.x += dx / length;
    sum.y += dy / length;
    sum.z += dz / length;
    this.pullCount[nodeId] = this.pullCount[nodeId]! + 1;
    this.pullAttractors[nodeId]!.push({
      index: attractorIndex,
      squaredDistance: distanceSquaredToAttractor,
    });
  }

  /**
   * Would `position` draw nearer to any attractor than the node sitting where
   * these pulls were measured?
   *
   * This is the progress test, and it is what makes growth terminate honestly.
   * Two attractors whose pulls cancel park a node at a fixed radius from both:
   * it spawns one child per iteration that draws no nearer to either --
   * thousands of junk segments approaching nothing. Growth that improves on no
   * pull is not growth, and that node stops. Real branching is untouched: a
   * node's pulls mostly point the same way, so its child improves on them
   * immediately.
   */
  private drawsNearer(
    position: SpaceColonizationVector,
    pulls: { index: number; squaredDistance: number }[],
  ): boolean {
    for (let p = 0; p < pulls.length; p++) {
      const pull = pulls[p]!;
      if (distanceSquared(position, this.attractorList[pull.index]!) < pull.squaredDistance) {
        return true;
      }
    }
    return false;
  }

  /**
   * The growth phase: for each node that was pulled, extend one segment of
   * length `D` along the normalized sum of its pulls. A node whose pulls cancel
   * out moves nowhere, and a node that cannot draw nearer to anything pulling
   * it (see {@link drawsNearer}) grows no further.
   *
   * @returns the ids of the nodes created.
   */
  private grow(): number[] {
    const spawned: number[] = [];
    const { segmentLength } = this.config;
    // Snapshot the length: spawned nodes are appended and must not be grown
    // again in the same iteration.
    const nodeCount = this.positions.length;
    for (let id = 0; id < nodeCount; id++) {
      if (this.pullCount[id] === 0) continue;
      const sum = this.pullSum[id]!;
      const length = Math.sqrt(sum.x * sum.x + sum.y * sum.y + sum.z * sum.z);
      if (length < DIRECTION_EPSILON) continue;
      const position = this.positions[id]!;
      const next = {
        x: position.x + (sum.x / length) * segmentLength,
        y: position.y + (sum.y / length) * segmentLength,
        z: position.z + (sum.z / length) * segmentLength,
      };
      if (!this.drawsNearer(next, this.pullAttractors[id]!)) continue;
      spawned.push(this.spawnNode(next, id, this.depths[id]! + 1));
    }
    return spawned;
  }

  /**
   * The pruning phase: an attractor within `d_k` of any node is consumed.
   * Runs after growth, so a node spawned this very iteration can consume.
   *
   * @returns how many attractors were removed.
   */
  private prune(): number {
    const { killRadius } = this.config;
    const before = this.attractorList.length;
    if (before === 0) return 0;
    const radiusSquared = killRadius * killRadius;
    const survivors: SpaceColonizationVector[] = [];
    for (let a = 0; a < this.attractorList.length; a++) {
      const attractor = this.attractorList[a]!;
      const candidates = this.grid
        ? this.grid.querySphere(attractor, killRadius)
        : this.allNodeIds();
      let consumed = false;
      for (let c = 0; c < candidates.length; c++) {
        if (distanceSquared(attractor, this.positions[candidates[c]!]!) < radiusSquared) {
          consumed = true;
          break;
        }
      }
      if (!consumed) survivors.push(attractor);
    }
    this.attractorList = survivors;
    return before - survivors.length;
  }

  /**
   * Run one iteration: associate, grow, prune.
   *
   * @returns this iteration's report. `active` is `false` once growth cannot
   * continue -- no new nodes, or no attractors -- and stays `false`.
   */
  step(): SpaceColonizationStep {
    if (this.stalled || this.attractorList.length === 0) {
      this.stalled = true;
      return {
        iteration: this.iterationCount,
        spawned: [],
        consumed: 0,
        remaining: this.attractorList.length,
        active: false,
      };
    }

    const started = now();
    this.associationCount += this.associate();
    const spawned = this.grow();
    const consumed = this.prune();
    this.growthMilliseconds += now() - started;
    this.iterationCount++;

    if (spawned.length === 0) {
      this.stalled = true;
    } else if (consumed === 0) {
      // Gnawing without eating: this is the orbiting node that never reaches
      // the attractors pulling it. See `stallLimit`.
      this.stallIterations++;
      if (this.stallIterations >= this.config.stallLimit) this.stalled = true;
    } else {
      this.stallIterations = 0;
    }

    return {
      iteration: this.iterationCount,
      spawned,
      consumed,
      remaining: this.attractorList.length,
      active: !this.stalled && this.attractorList.length > 0,
    };
  }

  /**
   * Run to completion: until the attractors are gone, growth stalls, or
   * `maxIterations` is reached (whichever comes first). "Stalls" covers both
   * kinds of dead end: no node can grow, and growth that is growing but
   * consuming no attractors (`stallLimit`).
   */
  run(): SpaceColonizationResult {
    while (this.iterationCount < this.config.maxIterations) {
      const report = this.step();
      if (!report.active) break;
    }
    return this.result();
  }

  /** The current state as a result object. Safe to call mid-run. */
  result(): SpaceColonizationResult {
    const nodes: SpaceColonizationNode[] = new Array(this.positions.length);
    for (let i = 0; i < this.positions.length; i++) {
      nodes[i] = {
        id: i,
        parent: this.parents[i]!,
        children: [],
        depth: this.depths[i]!,
        position: cloneVector(this.positions[i]!),
      };
    }
    const segments: SpaceColonizationSegment[] = [];
    for (let i = 0; i < this.positions.length; i++) {
      const parent = this.parents[i]!;
      if (parent === -1) continue;
      nodes[parent]!.children.push(i);
      segments.push({ from: parent, to: i });
    }

    let maxDepth = 0;
    for (let i = 0; i < this.depths.length; i++) {
      if (this.depths[i]! > maxDepth) maxDepth = this.depths[i]!;
    }

    const stats: SpaceColonizationStats = {
      iterations: this.iterationCount,
      initialAttractors: this.initialAttractorCount,
      remainingAttractors: this.attractorList.length,
      consumedAttractors: this.initialAttractorCount - this.attractorList.length,
      nodeCount: this.positions.length,
      segmentCount: segments.length,
      maxDepth,
      associations: this.associationCount,
      spatialGridCells: this.grid ? this.grid.cellCount : 0,
      growthTimeMs: this.growthMilliseconds,
    };

    return {
      nodes,
      segments,
      remainingAttractors: this.attractorList.map(cloneVector),
      bounds: {
        min: cloneVector(this.config.bounds.min),
        max: cloneVector(this.config.bounds.max),
      },
      stats,
    };
  }

  /** The config in force, with defaults applied. */
  get resolvedConfig(): ResolvedSpaceColonizationConfig {
    return this.config;
  }
}

/** `performance.now()` where it exists, `Date.now()` where it does not. */
function now(): number {
  return typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : Date.now();
}

/** Re-exported for consumers that want a distribution without the class. */
export type { AttractorDistribution, GrowthMode, SpaceColonizationBounds };
