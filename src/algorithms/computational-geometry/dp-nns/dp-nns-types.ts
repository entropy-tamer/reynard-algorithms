/**
 * Types for DP-NNS (Delaunay-based nearest-neighbor search via successor DAG).
 *
 * Implements core ideas from:
 * - Wang et al., "Efficient nearest neighbor search using dynamic programming" (DP-NNS)
 * - Wang, Xin, Tu, "Delaunay-Based Nearest Neighbor Search with Grid-Accelerated
 *   Queries and Parallel Construction", arXiv:2611.15320v1 (2026)
 *
 * This module provides a pedagogical, exact 2D implementation focused on:
 * - successor DAG construction from incremental Delaunay insertion history
 * - level-consistent (BRIO-style grouped) insertion ordering
 * - grid-accelerated query initialization (Lemma 1 style shared start)
 *
 * 3D exact incremental Delaunay-with-history and lock-based parallel construction
 * from the paper are out of scope for this initial implementation.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface Bounds2D {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export type InsertionOrderMode = "input" | "random" | "brio-levels" | "level-interleaved-bad";

export interface DpNnsBuildOptions {
  /** Insertion/order strategy used to build successor DAG. */
  order?: InsertionOrderMode;
  /** RNG seed for randomized/BRIO orderings. */
  seed?: number;
  /** BRIO growth ratio gamma (approx). Default 4. */
  brioRatio?: number;
  /** Grid resolution per axis for query initialization (0 disables). Default 16. */
  gridResolution?: number;
  /** Query domain for grid; defaults to bounds of data points. */
  queryBounds?: Bounds2D;
  /** Degeneracy jitter magnitude relative to data extent (0 disables). */
  jitter?: number;
}

export interface DpNnsBuildStats {
  pointCount: number;
  edgeCountInFinalDelaunay: number;
  successorEdgeCount: number;
  levels: number;
  levelSizes: number[];
  gridResolution: number;
  gridCells: number;
  gridPrecomputeMs: number;
  buildMs: number;
  order: InsertionOrderMode;
}

export interface DpNnsIndex {
  points: Point2D[];
  /** insertionRanks[i] = rank (1-based in insertion sequence position) of original point i */
  insertionRanks: number[];
  /** pointsByRank[r] = original point index, r in [1..n] (0 unused) */
  pointsByRank: number[];
  /** successors of point index (original index), each list sorted by insertion rank ascending */
  successors: number[][];
  /** final Delaunay neighbor sets by original point index (undirected) */
  delaunayNeighbors: number[][];
  bounds: Bounds2D;
  queryBounds: Bounds2D;
  gridResolution: number;
  /** grid start point as original point index per cell (row-major y-major), length gridResolution^2 */
  gridStarts: Int32Array | null;
  stats: DpNnsBuildStats;
}

export interface DpNnsQueryOptions {
  /** Start at grid-initialized cell representative when available. Default true if grid exists. */
  useGridInit?: boolean;
  /** Optional explicit start original point index. Overrides grid init when provided. */
  startPointIndex?: number;
}

export interface DpNnsQueryTraceStep {
  /** original point index visited as current best/transition site */
  pointIndex: number;
  rank: number;
  distance: number;
  /** number of successor distance evaluations performed at this node before moving/stopping */
  evaluationsAtNode: number;
}

export interface DpNnsQueryResult {
  nearestIndex: number;
  nearestDistance: number;
  /** path of transition sites visited in insertion-rank order */
  path: number[];
  /** detailed per-node trace */
  trace: DpNnsQueryTraceStep[];
  distanceEvaluations: number;
  hops: number;
  startIndex: number;
  usedGridInit: boolean;
  gridCell?: { gx: number; gy: number };
}

export interface DpNnsBatchQueryStats {
  queries: number;
  avgDistanceEvaluations: number;
  maxDistanceEvaluations: number;
  avgHops: number;
  maxHops: number;
  avgDistance: number;
  timeMs: number;
}
